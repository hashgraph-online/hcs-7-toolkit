# @hashgraphonline/hcs-7-toolkit

A toolkit for implementing HCS-7 state processing on Hedera. This package provides the ability to process HCS-7 state by combining EVM contract state with WASM-based topic selection.

## Installation

```bash
npm install @hashgraphonline/hcs-7-toolkit
```

## Features

- Process HCS-7 state using WASM modules
- Read contract state from Hedera EVM
- Deterministic topic selection based on contract values

## Usage

```typescript
import {
  EVMBridge,
  WasmBridge,
  WASMConfig,
  EVMConfig,
} from '@hashgraphonline/hcs-7-toolkit';

export const wasmConfig: WASMConfig = {
  p: 'hcs-7',
  op: 'register-config',
  t: 'wasm',
  c: {
    wasmTopicId: '0.0.5265732',
    inputType: {
      stateData: {
        minted: 'number',
        tokensRemaining: 'number',
      },
    },
    outputType: {
      type: 'string',
      format: 'topic-id',
    },
  },
  m: 'minted-and-remaining-router',
};

// Configure EVM state reading
const evmConfig: EVMConfig = {
  p: 'hcs-7',
  op: 'register-config',
  t: 'evm',
  c: {
    contractAddress: '0x...',
    abi: {
      inputs: [],
      name: 'minted',
      outputs: [{ name: '', type: 'uint64' }],
      stateMutability: 'view',
      type: 'function',
    },
  },
  m: 'State Reader',
};

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

// Initialize bridges
const evmBridge = new EVMBridge('testnet');
const wasmBridge = new WasmBridge();

const response = await fetch(
  `https://kiloscribe.com/api/inscription-cdn/${wasmConfig.c.wasmTopicId}?network=testnet`,
  {
    headers: {
      Accept: 'application/wasm',
    },
  }
);
const wasmBytes = await response.arrayBuffer();

// Load WASM module (from HCS topic or local file)
const wasmExports = await wasmBridge.initWasm(wasmBytes);

// Read contract state
const { stateData, results } = await evmBridge.executeCommands([evmConfig]);

console.log('State Data:', stateData);
console.log('Results:', results);

// Process state with WASM to get topic ID
const topicId = await wasmBridge.executeWasm(stateData, messages);
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

For detailed information about HCS-7 and its capabilities, see [HCS-7.md](./HCS-7.md).

## License

Apache-2.0
