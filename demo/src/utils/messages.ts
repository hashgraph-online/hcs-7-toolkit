import { FormData } from "@/types/form";

export interface BaseMessage {
  p: string;
  op: string;
  m: string;
}

export interface HCS1RegistrationMessage extends BaseMessage {
  t_id: string;
  d: {
    weight: number;
    tags: string[];
  };
}

export interface EVMConfigMessage extends BaseMessage {
  t: "evm";
  c: {
    contractAddress: string;
    abi: {
      inputs: [];
      name: string;
      outputs: [
        {
          name: string;
          type: string;
        }
      ];
      stateMutability: "view";
      type: "function";
    };
  };
}

export interface WASMConfigMessage extends BaseMessage {
  t: "wasm";
  c: {
    wasmTopicId: string;
    inputType: {
      stateData: Record<string, string>;
    };
    outputType: {
      type: string;
      format: string;
    };
  };
}

export const createRegistrationMessage = (
  topicId: string,
  memo: string,
  weight: number,
  tags: string[]
): HCS1RegistrationMessage => {
  return {
    p: "hcs-7",
    op: "register",
    t_id: topicId.replace("hcs://1/", ""),
    m: memo,
    d: {
      weight,
      tags,
    },
  };
};

export const createEvmConfig = (data: {
  contractAddress: string;
  functionName: string;
  outputName: string;
  outputType: string;
  memo: string;
}): EVMConfigMessage => {
  // For Chainlink's latestRoundData, include all outputs
  const outputs =
    data.functionName === "latestRoundData"
      ? [
          { name: "roundId", type: "uint80" },
          { name: "answer", type: "int256" },
          { name: "startedAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
          { name: "answeredInRound", type: "uint80" },
        ]
      : [
          {
            name: data.outputName,
            type: data.outputType,
          },
        ];

  return {
    p: "hcs-7",
    op: "register-config",
    t: "evm",
    c: {
      contractAddress: data.contractAddress,
      abi: {
        inputs: [],
        name: data.functionName,
        outputs,
        stateMutability: "view",
        type: "function",
      },
    },
    m: data.memo,
  };
};

export const createWasmConfig = (config: {
  wasmTopicId: string;
  stateData: Record<string, string>;
  memo: string;
}): WASMConfigMessage => {
  return {
    p: "hcs-7",
    op: "register-config",
    t: "wasm",
    c: {
      wasmTopicId: config.wasmTopicId,
      inputType: {
        stateData: config.stateData,
      },
      outputType: {
        type: "string",
        format: "topic-id",
      },
    },
    m: config.memo,
  };
};
