export interface FormData {
  ttl: number;
  evmConfigs: {
    contractAddress: string;
    functionName: string;
    outputType: string;
    outputName: string;
    memo: string;
  }[];
  wasmConfigs: {
    wasmTopicId: string;
    stateData: Record<string, string>;
    memo: string;
  }[];
  hcs1Registrations: {
    topicId: string;
    memo: string;
    weight: number;
    tags: string;
  }[];
  topicName: string;
  topicMemo: string;
}

export interface EVMConfig {
  contractAddress: string;
  functionName: string;
  outputType: string;
  outputName: string;
  memo: string;
}

export interface WASMConfig {
  wasmTopicId: string;
  stateData: Record<string, string>;
  memo: string;
}

export interface HCS1Registration {
  memo: string;
  weight: number;
  tags: string;
}
