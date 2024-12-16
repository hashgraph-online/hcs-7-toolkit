import { EVMConfig, WASMConfig } from './types/form';

export const mintedConfig: EVMConfig = {
  p: 'hcs-7',
  op: 'register-config',
  t: 'evm',
  c: {
    contractAddress: '0x9b2c05c0d15586a9a954bf1ef66c8640b854f986',
    abi: {
      inputs: [],
      name: 'minted',
      outputs: [
        {
          name: '',
          type: 'uint64',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  },
  m: 'LaunchPage Test Mint',
};

export const balanceConfig: EVMConfig = {
  p: 'hcs-7',
  op: 'register-config',
  t: 'evm',
  c: {
    contractAddress: '0x9b2c05c0d15586a9a954bf1ef66c8640b854f986',
    abi: {
      inputs: [],
      name: 'tokensRemaining',
      outputs: [
        {
          name: 'tokensRemaining',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  },
  m: 'LaunchPage Tokens Remaining',
};

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
