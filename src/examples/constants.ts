import { EVMConfig, WASMConfig } from '../ts/wasm-bridge';

export const mintedConfig: EVMConfig = {
  p: 'hcs-7',
  op: 'register-config',
  t: 'evm',
  c: {
    contractAddress: '0x1d67aaf7f7e8d806bbeba24c4dea24808e1158b8',
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
    contractAddress: '0x1d67aaf7f7e8d806bbeba24c4dea24808e1158b8',
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
