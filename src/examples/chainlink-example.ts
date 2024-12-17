import { process_state } from '../../chainlink-wasm/pkg/chainlink_wasm';
import { EVMConfig, WasmBridge } from '../ts/wasm-bridge';
import { EVMBridge } from '../ts/evm-bridge';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { CHAINLINK_ABI } from './chainlink-abi';

async function main() {
  console.log('Starting Chainlink example...');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Example messages that would be retrieved from HCS
  const messages = [
    {
      p: 'hcs-7',
      op: 'register',
      t_id: '0.0.123',
      d: {
        tags: ['even'],
      },
    },
    {
      p: 'hcs-7',
      op: 'register',
      t_id: '0.0.456',
      d: {
        tags: ['odd'],
      },
    },
  ];

  try {
    // Initialize WASM
    const bridge = new WasmBridge();
    const wasmPath = join(
      __dirname,
      '../..',
      'chainlink-wasm/pkg',
      'chainlink_wasm_bg.wasm'
    );
    const wasmBytes = fs.readFileSync(wasmPath);
    await bridge.initWasm(wasmBytes);
    console.log('WASM initialized');
    const params = bridge.getParams();
    console.log('Required Parameters:', params);

    const evmBridge = new EVMBridge('testnet');
    console.log('EVM Bridge initialized');

    const abi = CHAINLINK_ABI.find((item) => item.name === 'latestRoundData');

    const evmConfig: EVMConfig = {
      p: 'hcs-7',
      op: 'register-config',
      t: 'evm',
      c: {
        contractAddress: '0x59bC155EB6c6C415fE43255aF66EcF0523c92B4a',
        // @ts-ignore
        abi: abi,
      },
      m: 'LaunchPage Test Mint',
    };

    // WASM config for state data processing
    const wasmConfig = {
      p: 'hcs-7',
      op: 'register-config',
      t: 'wasm',
      c: {
        wasmTopicId: '0.0.5277917',
        inputType: {
          stateData: {
            roundId: 'uint80',
            answer: 'int256',
            startedAt: 'uint256',
            updatedAt: 'uint256',
            answeredInRound: 'uint80',
          },
        },
        outputType: {
          type: 'string',
          format: 'topic-id',
        },
      },
      m: 'chain-link-router',
    };

    console.log('Executing EVM commands...');
    const { results, stateData } = await evmBridge.executeCommands([evmConfig]);

    console.log('EVM state data:', JSON.stringify(stateData, null, 2));
    // Create state data using the WASM config
    const wasmState = bridge.createStateData(wasmConfig, stateData);

    console.log('WASM state data:', JSON.stringify(wasmState, null, 2));
    // Process the state to get the appropriate topic ID
    // @ts-ignore
    const topicId = bridge.executeWasm(wasmState, messages);

    console.log('Selected Topic ID:', topicId);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
