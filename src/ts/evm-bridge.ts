import { AccountId, ContractId } from '@hashgraph/sdk';
import { EVMConfig } from './wasm-bridge';
import { ethers } from 'ethers';

export interface EVMCache {
  get(key: string): Promise<string | undefined> | string | undefined;
  set(key: string, value: string): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

class MapCache implements EVMCache {
  private cache: Map<string, string>;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export class EVMBridge {
  public network: string;
  public mirrorNodeUrl: string;
  private cache: EVMCache;

  constructor(
    network: string = 'mainnet-public',
    mirrorNodeUrl: string = `mirrornode.hedera.com/api/v1/contracts/call`,
    cache?: EVMCache
  ) {
    this.network = network;
    this.mirrorNodeUrl = mirrorNodeUrl;
    this.cache = cache || new MapCache();
  }

  async executeCommands(
    evmConfigs: EVMConfig[],
    initialState: Record<string, string> = {}
  ): Promise<{
    results: Record<string, any>;
    stateData: Record<string, string>;
  }> {
    let stateData = { ...initialState };
    const results: Record<string, any> = {};

    for (const config of evmConfigs) {
      const cacheKey = `${config.c.contractAddress}-${config.c.abi.name}`;

      // Check cache first
      const cachedResult = await this.cache.get(cacheKey);
      if (cachedResult) {
        results[config.c.abi.name] = cachedResult;
        const stateKey = config.c.abi.outputs?.[0]?.name || config.c.abi.name;
        stateData[stateKey] = String(cachedResult);
        continue;
      }

      try {
        const iface = new ethers.Interface([
          {
            ...config.c.abi,
          },
        ]);
        const command = iface.encodeFunctionData(config.c.abi.name);
        const contractId = ContractId.fromSolidityAddress(
          config.c.contractAddress
        );

        const result = await this.readFromMirrorNode(
          command,
          AccountId.fromString('0.0.800'),
          contractId
        );

        if (!result?.result) {
          console.warn(
            `Failed to get result from mirror node for ${config.c.contractAddress}`
          );
          results[config.c.abi.name] = '0';
          const stateKey = config.c.abi.outputs?.[0]?.name || config.c.abi.name;
          stateData[stateKey] = '0';
          continue;
        }

        const decodedResult = String(
          iface
            ?.decodeFunctionResult(config.c.abi.name, result.result)
            ?.at(0) || '0'
        );

        // Cache the result
        await this.cache.set(cacheKey, decodedResult);
        results[config.c.abi.name] = decodedResult;

        const stateKey = config.c.abi.outputs?.[0]?.name || config.c.abi.name;
        stateData[stateKey] = decodedResult;
      } catch (error) {
        console.error(
          `Error executing command for ${config.c.contractAddress}:`,
          error
        );
        results[config.c.abi.name] = '0';
        const stateKey = config.c.abi.outputs?.[0]?.name || config.c.abi.name;
        stateData[stateKey] = '0';
      }
    }

    return { results, stateData };
  }

  async executeCommand(
    evmConfig: EVMConfig,
    stateData: Record<string, string> = {}
  ): Promise<any> {
    const { results, stateData: newStateData } = await this.executeCommands(
      [evmConfig],
      stateData
    );
    return {
      result: results[evmConfig.c.abi.name],
      stateData: newStateData,
    };
  }

  async readFromMirrorNode(
    command: string,
    from: AccountId,
    to: ContractId
  ): Promise<any> {
    try {
      const toAddress = to.toSolidityAddress();
      const fromAddress = from.toSolidityAddress();
      const response = await fetch(
        `https://${this.network}.${this.mirrorNodeUrl}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            block: 'latest',
            data: command,
            estimate: false,
            gas: 300_000,
            gasPrice: 100000000,
            from: fromAddress.startsWith('0x')
              ? fromAddress
              : `0x${fromAddress}`,
            to: toAddress?.startsWith('0x') ? toAddress : `0x${toAddress}`,
            value: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reading from mirror node:', error);
      return null;
    }
  }

  // Add method to clear cache if needed
  public async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  // Add method to remove specific cache entry
  public async clearCacheForContract(
    contractAddress: string,
    functionName: string
  ): Promise<void> {
    await this.cache.delete(`${contractAddress}-${functionName}`);
  }
}
