import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { BaseMessage, WasmBridge } from './wasm-bridge';

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const wasmPath = join(__dirname, '/pkg/rust_wasm_price_checker_bg.wasm');
  const wasmBytes = fs.readFileSync(wasmPath);

  const bridge = new WasmBridge();

  const wasmExports = await bridge.initWasm(wasmBytes);

  const stateResult = bridge.createWasmFunction(wasmExports.process_state);

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

  const result = stateResult(
    JSON.stringify({
      minted: '434544',
      timestamp: Date.now(),
    }),
    JSON.stringify(messages)
  );

  console.log('Result:', result);
}

main().catch(console.error);
