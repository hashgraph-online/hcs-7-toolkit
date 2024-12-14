import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  PrivateKey,
  TopicId,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
dotenv.config();

interface BaseMessage {
  p: string;
  op: string;
  m: string;
  t?: string;
}

interface EVMConfig extends BaseMessage {
  c: {
    contractAddress: string;
    abi: {
      inputs: Array<{
        name: string;
        type: string;
      }>;
      outputs: Array<{
        name: string;
        type: string;
      }>;
      type: string;
      stateMutability: string;
      name: string;
    };
  };
}

interface WASMConfig extends BaseMessage {
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

interface HCS1Registration extends BaseMessage {
  t_id: string;
  d: {
    weight: number;
    tags: string[];
  };
}

async function submitTopicMessage(
  client: Client,
  topicId: TopicId,
  message: BaseMessage,
  submitKey: PrivateKey
): Promise<void> {
  const messageSubmit = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(Buffer.from(JSON.stringify(message)))
    .freezeWith(client)
    .sign(submitKey);

  const submitExec = await messageSubmit.execute(client);
  await submitExec.getReceipt(client);
  console.log(`Message submitted successfully: ${message.m}`);
}

function createRegistrationMessage(
  topicId: string,
  memo: string,
  weight: number,
  tags: string[]
): HCS1Registration {
  return {
    p: 'hcs-7',
    op: 'register',
    t_id: topicId,
    m: memo,
    d: {
      weight,
      tags,
    },
  };
}

async function createHcs7Topic(): Promise<string> {
  if (!process.env.HEDERAS_OPERATOR_ID || !process.env.HEDERAS_OPERATOR_KEY) {
    throw new Error(
      'Please set HEDERAS_OPERATOR_ID and HEDERAS_OPERATOR_KEY environment variables'
    );
  }

  // Create client for testnet
  const client = Client.forTestnet();
  client.setOperator(
    process.env.HEDERAS_OPERATOR_ID,
    process.env.HEDERAS_OPERATOR_KEY
  );

  const submitKey = PrivateKey.generateED25519();
  const submitPublicKey = submitKey.publicKey;

  const topicCreateTx = new TopicCreateTransaction()
    .setTopicMemo('hcs-7:indexed:86400')
    .setSubmitKey(submitPublicKey);

  const topicCreateSubmit = await topicCreateTx.execute(client);
  const topicCreateRx = await topicCreateSubmit.getReceipt(client);
  const topicId = topicCreateRx.topicId;

  if (!topicId) {
    throw new Error('Failed to create topic');
  }

  console.log(`Created topic: ${topicId.toString()}`);
  console.log(`Submit Key: ${submitKey.toStringRaw()}`);

  // Submit EVM configuration for Uniswap V3 pool price
  const evmConfig: EVMConfig = {
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

  await submitTopicMessage(client, topicId, evmConfig, submitKey);

  // Submit WASM configuration
  const wasmConfig: WASMConfig = {
    p: 'hcs-7',
    op: 'register-config',
    t: 'wasm',
    c: {
      wasmTopicId: '0.0.5263817',
      inputType: {
        stateData: {
          minted: 'number',
        },
      },
      outputType: {
        type: 'string',
        format: 'topic-id',
      },
    },
    m: 'minted-even-odd-router',
  };

  await submitTopicMessage(client, topicId, wasmConfig, submitKey);

  // Submit example HCS-1 registration
  const hcs1Registration: HCS1Registration = createRegistrationMessage(
    '0.0.3717738',
    'blue',
    1.0,
    ['odd']
  );

  const hcs1Registration2: HCS1Registration = createRegistrationMessage(
    '0.0.3717746',
    'purple',
    1.0,
    ['even']
  );

  await submitTopicMessage(client, topicId, hcs1Registration, submitKey);
  await submitTopicMessage(client, topicId, hcs1Registration2, submitKey);

  return topicId.toString();
}

// Run the script if called directly
if (require.main === module) {
  createHcs7Topic()
    .then((topicId) => {
      console.log(`Successfully created HCS-7 topic: ${topicId}`);
    })
    .catch((error) => {
      console.error('Error creating topic:', error);
      process.exit(1);
    });
}
