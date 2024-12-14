import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { BaseMessage, WasmBridge } from '../ts/wasm-bridge';
import { EVMBridge } from '../ts/evm-bridge';
import { mintedConfig, balanceConfig, wasmConfig } from './constants';

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const response = await fetch(
    `https://kiloscribe.com/api/inscription-cdn/${wasmConfig.c.wasmTopicId}?network=testnet`,
    {
      headers: {
        'Accept': 'application/wasm'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/wasm') && !contentType?.includes('application/octet-stream')) {
    console.warn('Warning: Unexpected content type:', contentType);
  }

  const wasmBytes = await response.arrayBuffer();

  const bridge = new WasmBridge();
  const evmBridge = new EVMBridge('mainnet-public');

  await bridge.initWasm(wasmBytes);

  // Execute all EVM commands in one shot
  const { results, stateData } = await evmBridge.executeCommands([
    mintedConfig,
    balanceConfig,
  ]);

  // Log individual results
  console.log('Minted Result:', results.minted);
  console.log('Tokens Result:', results.tokensRemaining);
  console.log('Combined State Data:', stateData);

  const messages: BaseMessage[] = [
    {
      p: 'hcs-7',
      op: 'register',
      t_id: '0.0.3717738',
      m: 'blue',
      d: { weight: 1, tags: ['odd'] },
    },
    {
      p: 'hcs-7',
      op: 'register',
      t_id: '0.0.3717746',
      m: 'purple',
      d: { weight: 1, tags: ['even'] },
    },
  ];

  // Create state data for WASM with combined EVM results
  const wasmState = bridge.createStateData(wasmConfig, stateData);
  const result = bridge.executeWasm(wasmState, messages);

  console.log('WASM Result:', result);
}

main().catch(console.error);
