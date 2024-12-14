# @hashgraphonline/wasm-bridge

A TypeScript bridge for integrating WebAssembly modules with HCS-7 topics on the Hedera network. This package provides the core functionality for loading and executing WASM code that processes HCS-7 state.

## Installation

```bash
npm install @hashgraphonline/wasm-bridge
```

## Usage

The WASM bridge provides a simple interface for loading and executing WASM modules:

```typescript
import { WasmBridge } from '@hashgraphonline/wasm-bridge';
import fs from 'fs';
import { join } from 'path';

async function main() {
  const bridge = new WasmBridge();
  
  // Load your WASM module
  const wasmBytes = fs.readFileSync('path/to/your/module.wasm');
  const wasmExports = await bridge.initWasm(wasmBytes);
  
  // Create a function wrapper for your WASM export
  const processState = bridge.createWasmFunction(wasmExports.your_wasm_function);
  
  // Execute the WASM function
  const result = await processState(yourState, yourMessages);
}
```

## Example Implementation

This repository also includes an example implementation showing how to:
1. Create an HCS-7 topic with WASM-based routing
2. Configure the topic with EVM and WASM settings
3. Register HCS-1 topics for message routing

See `create-hcs-7-topic.ts` for the complete example code. Note that this example code is not published as part of the npm package - it's provided as a reference implementation only.

## Development

### Prerequisites
- Node.js >= 18
- Rust and wasm-pack (if building the example WASM module)

### Building the Package
```bash
npm run build
```

### Running the Example
```bash
npm run try-wasm
```

## Contributing

This is part of the HCS-7 toolkit. For more information about HCS-7, visit [HashgraphOnline](https://hashgraphonline.com).
