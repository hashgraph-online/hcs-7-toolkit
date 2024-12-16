import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback, useMemo, use } from 'react';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import {
  PrivateKey,
  PublicKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
} from '@hashgraph/sdk';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EVMConfigForm } from '@/components/forms/EVMConfigForm';
import { WASMConfigForm } from '@/components/forms/WASMConfigForm';
import { HCS1RegistrationForm } from '@/components/forms/HCS1RegistrationForm';
import { SubmittedConfigsSection } from '@/components/config/SubmittedConfigsSection';
import { EVMConfig, FormData } from '@/types/form';
import {
  BaseMessage,
  createRegistrationMessage,
  createEvmConfig,
  createWasmConfig,
  EVMConfigMessage,
} from '@/utils/messages';
import { RenderFile } from '@/components/preview/RenderFile';
import { MessageAccordion } from '@/components/messages/MessageAccordion';
import { TopicState, useTopicStorage } from '@/hooks/useTopicStorage';
import { useWallet } from '@/hooks/useWallets';
import { useMessagePolling } from '@/hooks/useMessagePolling';
import {
  filterEVMMessages,
  filterHCS1Messages,
  filterWASMMessages,
} from '@/utils/messageFilters';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navbar from '@/components/Navbar/Navbar';

export function BuildSection() {
  const {
    currentTopic: topicState,
    existingTopics,
    loading: topicLoading,
    updateTopic: updateTopicState,
    selectTopic,
    removeTopic,
  } = useTopicStorage();

  const wallet = useWallet();
  if (!wallet) {
    throw new Error('WalletContext not found');
  }
  const {
    sdk,
    isConnected,
    accountInfo,
    connect: walletConnect,
    disconnect: walletDisconnect,
    isLoading,
  } = wallet;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<
    'connect' | 'create' | 'configure'
  >('connect');

  const messages = useMessagePolling(sdk, isConnected, topicState?.topicId);

  const curentTopicReadyMode = useMemo(() => {
    if (!messages || messages.length === 0) {
      return {
        isReady: false,
        evmLength: 0,
        wasmLength: 0,
        hcs1Length: 0,
      };
    }

    const evmConfigs = filterEVMMessages(messages);
    const wasmConfigs = filterWASMMessages(messages);
    const hcs1Registrations = filterHCS1Messages(messages);

    const isReady =
      evmConfigs.length >= 1 &&
      wasmConfigs.length >= 1 &&
      hcs1Registrations.length >= 2;

    return {
      isReady,
      evmLength: evmConfigs.length,
      wasmLength: wasmConfigs.length,
      hcs1Length: hcs1Registrations.length,
    };
  }, [messages]);

  const isTopicReady = curentTopicReadyMode.isReady;

  // Auto-select the appropriate step
  useEffect(() => {
    if (!isConnected) {
      setActiveStep('connect');
    } else if (!topicState?.topicId) {
      setActiveStep('create');
    } else {
      setActiveStep('configure');
    }
  }, [isConnected, topicState?.topicId]);

  const { register, watch, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      ttl: 60,
      evmConfigs: [
        {
          contractAddress: '0x9b2c05c0d15586a9a954bf1ef66c8640b854f986',
          functionName: 'minted',
          outputType: 'uint64',
          outputName: 'minted',
          memo: 'LaunchPage Minted Function',
        },
      ],
      wasmConfigs: [
        {
          wasmTopicId: '0.0.5269810',
          stateData: {
            minted: 'number',
            tokensRemaining: 'number',
          },
          memo: 'minted-and-remaining-router',
        },
      ],
      hcs1Registrations: [
        {
          topicId: '0.0.5270244',
          memo: 'Odd Smart Hashinal',
          weight: 1,
          tags: 'odd',
        },
      ],
      topicMemo: '',
    },
    mode: 'onChange',
  });

  const connect = useCallback(
    () => async () => {
      try {
        await walletConnect();
      } catch (error) {
        console.error('Failed to connect:', error);
        setError(`Error connecting: ${(error as Error).message}`);
      }
    },
    []
  );

  const disconnect = useCallback(
    () => async () => {
      try {
        await walletDisconnect();
        await updateTopicState({
          topicId: '',
          submitKey: '',
          adminKey: '',
          createdAt: '',
          submittedConfigs: {
            evm: 0,
            wasm: 0,
            hcs1: 0,
          },
          submittedEvmConfigs: [],
        });
      } catch (error) {
        console.error('Failed to disconnect:', error);
        setError(`Error disconnecting: ${(error as Error).message}`);
      }
    },
    []
  );

  const submitTopicMessage = useCallback(
    async (topicId: TopicId, message: BaseMessage): Promise<void> => {
      if (!sdk) return;

      const signer = sdk.dAppConnector.signers.find(
        (signer_) =>
          signer_.getAccountId().toString() === accountInfo?.accountId
      );
      if (!signer) {
        setError('No active connection or signer');
        return;
      }

      const messageSubmit = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(Buffer.from(JSON.stringify(message)))
        .freezeWithSigner(signer);

      const { error } = await sdk.executeTransactionWithErrorHandling(
        messageSubmit,
        true
      );

      if (error) {
        setError(`Failed to submit message: ${error}`);
        return;
      }
      console.log(`Message submitted successfully: ${message.m}`);
    },
    [sdk]
  );

  const createTopic = useCallback(
    async (data: FormData) => {
      if (!sdk || !isConnected || !accountInfo) {
        setError('Please connect your wallet first');
        return;
      }

      try {
        setIsCreatingTopic(true);
        setError(null);

        const userInfo = await sdk.requestAccount(accountInfo?.accountId);
        const publicKey = userInfo.key?.key;
        if (!publicKey) {
          setError('Failed to get public key');
          return;
        }

        const submitPublicKey = PublicKey.fromString(publicKey);

        console.log('about to create topic');
        const topicCreateTx = new TopicCreateTransaction()
          .setTopicMemo(`hcs-7:indexed:${data.ttl}`)
          .setSubmitKey(submitPublicKey);

        const { result, error: txError } =
          await sdk.executeTransactionWithErrorHandling(topicCreateTx, false);

        if (txError || !result?.topicId) {
          console.error('txError', txError);
          throw new Error(txError || 'Failed to create topic');
        }

        const topicData: TopicState = {
          topicId: result.topicId.toString(),
          submitKey: publicKey.toString(),
          adminKey: '',
          createdAt: new Date().toISOString(),
          submittedConfigs: {
            evm: 0,
            wasm: 0,
            hcs1: 0,
          },
          submittedEvmConfigs: [],
        };

        await updateTopicState(topicData, true);
        console.log(`Created topic: ${result.topicId.toString()}`);
        console.log(`Submit Key: ${publicKey.toString()}`);
      } catch (err) {
        console.error('Error in createTopic:', err);
        setError(err instanceof Error ? err.message : 'Failed to create topic');
      } finally {
        setIsCreatingTopic(false);
      }
    },
    [sdk, isConnected, accountInfo]
  );

  const submitConfig = useCallback(
    async (configType: 'evm' | 'wasm' | 'hcs1', data: any): Promise<void> => {
      if (!sdk || !isConnected) {
        setError('Please connect your wallet first');
        return;
      }

      if (!topicState?.topicId) {
        setError('No topic created');
        return;
      }

      try {
        setIsSubmitting(true);
        setError('');

        // Check limits based on config type
        if (configType === 'evm' && getEvmConfigCount() >= 3) {
          setError('Maximum number of EVM configs (3) already submitted');
          return;
        }
        if (configType === 'wasm' && getWasmConfigCount() >= 1) {
          setError('Maximum number of WASM configs (1) already submitted');
          return;
        }

        // Check for duplicates
        if (configType === 'evm') {
          const isDuplicate = isEvmConfigDuplicate(
            data.contractAddress,
            data.functionName
          );

          if (isDuplicate) {
            setError(
              'This contract address and function combination has already been submitted'
            );
            return;
          }
        }

        let message: BaseMessage;
        switch (configType) {
          case 'evm':
            message = createEvmConfig(data);
            break;
          case 'wasm':
            message = createWasmConfig(data);
            break;
          case 'hcs1':
            message = createRegistrationMessage(
              data.topicId,
              data.memo,
              data.weight,
              data.tags.split(',').map((tag: string) => tag.trim())
            );
            break;
          default:
            throw new Error('Invalid config type');
        }

        await submitTopicMessage(
          TopicId.fromString(topicState.topicId),
          message
        );
      } catch (error) {
        console.error('Error submitting config:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to submit config'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [sdk, isConnected, topicState?.topicId]
  );

  const getEvmConfigCount = useCallback(() => {
    return messages.filter((msg) => {
      try {
        const parsed = JSON.parse(msg.m);
        return (
          parsed.p === 'hcs-7' &&
          parsed.op === 'register-config' &&
          parsed.t === 'evm'
        );
      } catch {
        return false;
      }
    }).length;
  }, [messages]);

  const getWasmConfigCount = useCallback(() => {
    return messages.filter((msg) => {
      try {
        const parsed = JSON.parse(msg.m);
        return (
          parsed.p === 'hcs-7' &&
          parsed.op === 'register-config' &&
          parsed.t === 'wasm'
        );
      } catch {
        return false;
      }
    }).length;
  }, [messages]);

  const isEvmConfigDuplicate = useCallback(
    (contractAddress: string, functionName: string) => {
      const evmConfigs = messages.filter(
        (msg) => msg.t === 'evm'
      ) as EVMConfigMessage[];
      return evmConfigs.some(
        (config) =>
          config.c.contractAddress.toLowerCase() ===
            contractAddress.toLowerCase() && config.c.abi.name === functionName
      );
    },
    [messages]
  );

  const getSubmittedConfigs = (type: 'evm' | 'wasm' | 'hcs1') => {
    return messages.filter((msg) => {
      if (type === 'hcs1') {
        return msg.op === 'register' && msg.p === 'hcs-7';
      }
      return msg.t === type;
    });
  };

  const getSubmitButtonText = (type: 'evm' | 'wasm' | 'hcs1') => {
    const count = getSubmittedConfigs(type).length;
    switch (type) {
      case 'evm':
        return `Submit EVM Configuration (${count}/3)`;
      case 'wasm':
        return `Submit WASM Configuration (${count}/1)`;
      case 'hcs1':
        return `Submit HCS-1 Registration (${count})`;
    }
  };

  if (topicLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex items-center space-x-2 text-primary'>
          <ArrowPathIcon className='w-5 h-5 animate-spin' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-white dark:bg-gray-800 rounded-lg overflow-hidden'>
      {/* Sidebar */}
      <div className='w-64 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-y-auto'>
        <nav className='p-4 space-y-1'>
          <button
            onClick={() => setActiveStep('connect')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeStep === 'connect'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {isConnected ? (
              <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M20 6L9 17L4 12'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='flex items-center justify-center w-5 h-5 rounded-full border-2 border-current'>
                1
              </span>
            )}
            Connect Wallet
          </button>

          <button
            onClick={() => setActiveStep('create')}
            disabled={!isConnected}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
              !isConnected
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : activeStep === 'create'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {topicState?.topicId ? (
              <svg className='w-5 h-5' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M20 6L9 17L4 12'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='flex items-center justify-center w-5 h-5 rounded-full border-2 border-current'>
                2
              </span>
            )}
            Create Topic
          </button>

          <button
            onClick={() => setActiveStep('configure')}
            disabled={!topicState?.topicId}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
              !topicState?.topicId
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : activeStep === 'configure'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <span className='flex items-center justify-center w-5 h-5 rounded-full border-2 border-current'>
              3
            </span>
            Configure Topic
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='p-6 space-y-6'>
          {error && (
            <div className='bg-red-50 text-red-600 p-4 rounded-lg mb-4'>
              {error}
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Configuration Area */}
            <div className='space-y-6'>
              <Card>
                {activeStep === 'connect' && (
                  <>
                    <CardHeader>
                      <CardTitle>Connect Your Wallet</CardTitle>
                      <CardDescription>
                        Connect your wallet to get started with topic creation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!isConnected ? (
                        <Button
                          onClick={connect}
                          className='bg-primary hover:bg-[#5000d9] text-white'
                        >
                          Connect Wallet
                        </Button>
                      ) : (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600'>
                            Connected as:{' '}
                            <span className='font-mono text-primary'>
                              {accountInfo?.accountId}
                            </span>
                          </span>
                          <Button
                            variant='outline'
                            onClick={disconnect}
                            className='border-primary text-primary hover:bg-primary/5'
                          >
                            Disconnect
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}

                {activeStep === 'create' && (
                  <>
                    <CardHeader>
                      <CardTitle>Create Topic</CardTitle>
                      <CardDescription>
                        Set up your HCS-7 topic parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <div className='space-y-6'>
                          {existingTopics.length > 0 && (
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Select Existing Topic
                              </label>
                              <Select
                                value={topicState?.topicId || ''}
                                onValueChange={(value) => selectTopic(value)}
                              >
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder='Select a topic' />
                                </SelectTrigger>
                                <SelectContent>
                                  {existingTopics.map((topic) => (
                                    <SelectItem
                                      key={topic.topicId}
                                      value={topic.topicId}
                                    >
                                      {topic.topicId}{' '}
                                      {topic.createdAt && (
                                        <span className='text-gray-500 text-sm ml-2'>
                                          {new Date(topic.createdAt).toString()}
                                        </span>
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div>
                            <div className='flex items-center justify-between mb-2'>
                              <label className='block text-sm font-medium text-gray-700'>
                                Create New Topic
                              </label>
                            </div>
                            <form
                              onSubmit={handleSubmit(createTopic)}
                              className='space-y-4'
                            >
                              <div>
                                <label className='block text-sm font-medium mb-2'>
                                  TTL (seconds)
                                </label>
                                <input
                                  type='number'
                                  {...register('ttl')}
                                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                />
                              </div>
                              <Button
                                type='submit'
                                disabled={!isConnected || isCreatingTopic}
                                className='w-full text-white bg-primary hover:bg-[#5000d9]'
                              >
                                {isCreatingTopic
                                  ? 'Creating Topic...'
                                  : 'Create Topic'}
                              </Button>
                            </form>
                          </div>

                          {topicState?.topicId && (
                            <div className='bg-gray-50 rounded-lg p-4'>
                              <div className='space-y-2'>
                                <p className='text-sm text-gray-600'>
                                  Active Topic:{' '}
                                  <span className='font-mono text-gray-900'>
                                    {topicState.topicId}
                                  </span>
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </>
                )}

                {activeStep === 'configure' && (
                  <>
                    <CardHeader>
                      <CardTitle>Configure Topic</CardTitle>
                      <CardDescription>
                        Configure your topic with EVM, WASM, and HCS-1 settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue='evm'>
                        <TabsList className='grid w-full grid-cols-3'>
                          <TabsTrigger value='evm'>EVM</TabsTrigger>
                          <TabsTrigger value='wasm'>WASM</TabsTrigger>
                          <TabsTrigger value='hcs1'>HCS-1</TabsTrigger>
                        </TabsList>
                        <TabsContent value='evm'>
                          <Card>
                            <CardHeader>
                              <CardTitle>Smart Contract Configuration</CardTitle>
                              <CardDescription>
                                Choose a smart contract and function that your
                                HCS-7 Topic should listen to. We've prepopulated
                                this with the LaunchPage contract to make this
                                super easy.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <EVMConfigForm
                                onSubmit={(data) => submitConfig('evm', data)}
                                isConnected={isConnected}
                                isSubmitting={isSubmitting}
                                getSubmitButtonText={getSubmitButtonText}
                                defaultValues={watch('evmConfigs')?.[0]}
                                getEvmConfigCount={getEvmConfigCount}
                                isEvmConfigDuplicate={isEvmConfigDuplicate}
                                watch={watch}
                              />
                              <MessageAccordion
                                messages={messages}
                                type='evm'
                                title='Submitted EVM Configs'
                              />
                            </CardContent>
                          </Card>
                        </TabsContent>
                        <TabsContent value='wasm'>
                          <Card>
                            <CardHeader>
                              <CardTitle>WASM Configuration</CardTitle>
                              <CardDescription>
                                Configure WASM module settings
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <WASMConfigForm
                                onSubmit={(data) => submitConfig('wasm', data)}
                                isConnected={isConnected}
                                isSubmitting={isSubmitting}
                                getWasmConfigCount={getWasmConfigCount}
                                getSubmitButtonText={getSubmitButtonText}
                                defaultValues={watch('wasmConfigs')?.[0]}
                                evmMessages={messages.filter(
                                  (msg): msg is EVMConfigMessage =>
                                    msg.t === 'evm'
                                )}
                              />
                              <MessageAccordion
                                messages={messages}
                                type='wasm'
                                title='Submitted WASM Configs'
                              />
                            </CardContent>
                          </Card>
                        </TabsContent>
                        <TabsContent value='hcs1'>
                          <Card>
                            <CardHeader>
                              <CardTitle>HCS-1 Registrations</CardTitle>
                              <CardDescription>
                                Register other HCS topics with this HCS-7 topic
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <HCS1RegistrationForm
                                onSubmit={(data) => submitConfig('hcs1', data)}
                                isConnected={isConnected}
                                isSubmitting={isSubmitting}
                                getSubmitButtonText={getSubmitButtonText}
                                defaultValues={watch('hcs1Registrations')?.[0]}
                                registrations={messages.filter(
                                  (msg) =>
                                    msg.p === 'hcs-7' && msg.op === 'register'
                                )}
                              />
                              <MessageAccordion
                                messages={messages}
                                type='hcs1'
                                title='Submitted HCS-1 Registrations'
                              />
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>

            {/* Preview Area */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Preview your inscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <strong>HRL:</strong> hcs://7/{topicState?.topicId}
                  </div>
                  {isTopicReady && (
                    <RenderFile
                      url={`https://kiloscribe.com/api/inscription-cdn/${topicState?.topicId}?network=testnet`}
                      height={400}
                    />
                  )}
                  {!isTopicReady && (
                    <div className='space-y-4 text-gray-600 py-8 px-4'>
                      <h3 className='text-lg font-medium text-center mb-6'>
                        Topic Setup Progress
                      </h3>
                      <div className='max-w-md mx-auto space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              curentTopicReadyMode.evmLength >= 1
                                ? 'bg-green-50 border-green-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {curentTopicReadyMode.evmLength >= 1 && (
                              <CheckCircleIcon className='h-4 w-4 text-green-600' />
                            )}
                          </div>
                          <span
                            className={
                              curentTopicReadyMode.evmLength >= 1
                                ? 'text-green-600'
                                : ''
                            }
                          >
                            EVM Config ({curentTopicReadyMode.evmLength}/1
                            required)
                          </span>
                        </div>

                        <div className='flex items-center space-x-3'>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              curentTopicReadyMode.wasmLength >= 1
                                ? 'bg-green-50 border-green-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {curentTopicReadyMode.wasmLength >= 1 && (
                              <CheckCircleIcon className='h-4 w-4 text-green-600' />
                            )}
                          </div>
                          <span
                            className={
                              curentTopicReadyMode.wasmLength >= 1
                                ? 'text-green-600'
                                : ''
                            }
                          >
                            WASM Config ({curentTopicReadyMode.wasmLength}/1
                            required)
                          </span>
                        </div>

                        <div className='flex items-center space-x-3'>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              curentTopicReadyMode.hcs1Length >= 2
                                ? 'bg-green-50 border-green-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {curentTopicReadyMode.hcs1Length >= 2 && (
                              <CheckCircleIcon className='h-4 w-4 text-green-600' />
                            )}
                          </div>
                          <span
                            className={
                              curentTopicReadyMode.hcs1Length >= 2
                                ? 'text-green-600'
                                : ''
                            }
                          >
                            HCS-1 Registrations ({curentTopicReadyMode.hcs1Length}
                            /2 required)
                          </span>
                        </div>
                      </div>
                      <p className='text-sm text-center mt-6 text-gray-500'>
                        Complete all requirements above to enable the preview
                      </p>
                    </div>
                  )}
                  {!topicState?.topicId && (
                    <div className='text-center text-gray-500 py-8'>
                      Create a topic to preview inscriptions
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
