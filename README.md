# @hashgraphonline/hcs-7-toolkit

A toolkit for implementing HCS-7 state processing on Hedera. This package provides the ability to process HCS-7 state by combining EVM contract state with WASM-based topic selection.

The HCS-7 Toolkit was developed during the Hedera Hackathon in December 2025. HCS-7 is a standard that allows you to create NFTs whose metadata updates based on smart contract state. It combines on-chain data with WASM processing for trustless, programmatic updates. The standard is currently in draft mode, and all tooling is in alpha and not ready for production use.

# Links

- [Testnet Demo for HCS-7](https://hcs-7.hashgraphonline.com)
- [100% on-graph Smart Hashinal LaunchPage](https://smart.hashinals.com?network=testnet)
- [Draft HCS-7 Standard Documentation](https://feat-hcs-7.hcs-improvement-proposals.pages.dev/docs/standards/hcs-7)

# Operating the demo locally

```bash
git clone https://github.com/HashgraphOnline/hcs-7-toolkit.git
cd hcs-7-toolkit/demo
yarn
yarn run dev
```

# Trying the Examples

## Running the TypeScript Examples

```bash
git clone https://github.com/HashgraphOnline/hcs-7-toolkit.git
cd hcs-7-toolkit
yarn
yarn run try-wasm 
yarn run try-chainlink
```

This will run the example code that demonstrates:
1. Fetching a WASM module from KiloScribe
2. Reading EVM contract state (minted count and tokens remaining)
3. Processing state with WASM to determine topic selection
4. Routing messages based on the selected topic

## Building and Testing Rust WASM Modules

```bash
# Install Rust and wasm-pack if you haven't already
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build the example WASM module
cd hcs-7-toolkit/rust
wasm-pack build

# Test the WASM module
wasm-pack test --headless --firefox
```

## Installing the hcs-7-toolkit package

```bash
npm install @hashgraphonline/hcs-7-toolkit
```

## Features

- Process HCS-7 state using WASM modules
- Read contract state from Hedera EVM
- Deterministic topic selection based on contract values
- Chainlink oracle integration for price-reactive NFTs
- Automated and manual mode support for topic selection
- Interactive demo UI with real-time price updates
- Comprehensive error handling and user feedback

## Demo

Visit our [live demo](https://hcs-7.hashgraphonline.com) to explore:

- HCS-7 UI Builder tool
- Price-reactive NFT backgrounds using Chainlink oracles
- WASM configuration with HCS-7 standard validation
- Real-time topic switching based on HBAR price
- Interactive mode selection (Auto/Manual)

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
    wasmTopicId: '0.0.5269810',
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

This repository includes several example implementations:

1. **Price-Reactive NFTs**: Demonstrates how to create dynamic NFTs that respond to HBAR price changes using Chainlink oracles
2. **Basic WASM Router**: Shows how to implement WASM-based topic selection
3. **Chainlink Integration**: Examples of integrating Chainlink price feeds with HCS-7
4. **TypeScript Examples**: Complete examples of EVM state reading and WASM processing in `src/examples/`
5. **Rust WASM Examples**: Sample WASM modules written in Rust for topic selection in `rust/src/`

See the `demo/src/components/examples` directory for complete implementations.

## Development

### Prerequisites

- Node.js >= 18
- Rust and wasm-pack (if building custom WASM modules)
- Access to Chainlink price feeds on Hedera (for price-reactive features)

### Building the Package

```bash
npm run build
```

### Running the Example

```bash
npm run try-wasm
```

## Resources

- [HCS-7 Standard Documentation](https://feat-hcs-7.hcs-improvement-proposals.pages.dev/docs/standards/hcs-7)
- [Chainlink Documentation](https://docs.chain.link)
- [Live Demo](https://hcs-7.hashgraphonline.com)

## Community

- [Hashinals Telegram](https://t.me/Hashinals)
- [HashgraphOnline X](https://x.com/HashgraphOnline)
- [KiloScribe X](https://x.com/KiloScribeApp)

## Contributing

This is part of the HCS-7 toolkit. For more information about HCS-7, visit [HashgraphOnline](https://hashgraphonline.com).

For detailed information about HCS-7 and its capabilities, see [HCS-7.md](./HCS-7.md).

## License

Apache-2.0
