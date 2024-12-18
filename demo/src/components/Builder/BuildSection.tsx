import { useForm } from "react-hook-form";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FiCopy } from "react-icons/fi";
import {
  PrivateKey,
  PublicKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
} from "@hashgraph/sdk";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EVMConfigForm } from "@/components/forms/EVMConfigForm";
import { WASMConfigForm } from "@/components/forms/WASMConfigForm";
import { HCS1RegistrationForm } from "@/components/forms/HCS1RegistrationForm";
import { FormData } from "@/types/form";
import {
  BaseMessage,
  createRegistrationMessage,
  createEvmConfig,
  createWasmConfig,
  EVMConfigMessage,
} from "@/utils/messages";
import { RenderFile } from "@/components/preview/RenderFile";
import { MessageAccordion } from "@/components/messages/MessageAccordion";
import { TopicState, useTopicStorage } from "@/hooks/useTopicStorage";
import { useWallet } from "@/hooks/useWallets";
import { useMessagePolling } from "@/hooks/useMessagePolling";
import {
  filterEVMMessages,
  filterHCS1Messages,
  filterWASMMessages,
} from "@/utils/messageFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobs } from "@/hooks/useJobs";

export function BuildSection() {
  const {
    currentTopic: topicState,
    existingTopics,
    loading: topicLoading,
    updateTopic: updateTopicState,
    selectTopic,
  } = useTopicStorage();

  const wallet = useWallet();
  if (!wallet) {
    throw new Error("WalletContext not found");
  }
  const { sdk, isConnected, accountInfo, connect } = wallet;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState<string>("create");

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

    console.log("topic ready mode", {
      isReady,
      evmLength: evmConfigs.length,
      wasmLength: wasmConfigs.length,
      hcs1Length: hcs1Registrations.length,
    });

    return {
      isReady,
      evmLength: evmConfigs.length,
      wasmLength: wasmConfigs.length,
      hcs1Length: hcs1Registrations.length,
    };
  }, [messages]);

  const isTopicReady = curentTopicReadyMode.isReady;

  const { register, watch, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      ttl: 60,
      evmConfigs: [
        {
          contractAddress: "0x9b2c05c0d15586a9a954bf1ef66c8640b854f986",
          functionName: "minted",
          outputType: "uint64",
          outputName: "minted",
          memo: "LaunchPage Minted Function",
        },
      ],
      wasmConfigs: [
        {
          wasmTopicId: "0.0.5269810",
          stateData: {
            minted: "number",
            tokensRemaining: "number",
          },
          memo: "minted-and-remaining-router",
        },
      ],
      hcs1Registrations: [
        {
          topicId: "0.0.5270244",
          memo: "Odd Smart Hashinal",
          weight: 1,
          tags: "odd",
        },
      ],
      topicMemo: "",
    },
    mode: "onChange",
  });

  const submitTopicMessage = useCallback(
    async (topicId: TopicId, message: BaseMessage): Promise<void> => {
      if (!sdk) return;

      const signer = sdk.dAppConnector.signers.find(
        (signer_) =>
          signer_.getAccountId().toString() === accountInfo?.accountId
      );
      if (!signer) {
        setError("No active connection or signer");
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
        setError("Please connect your wallet first");
        return;
      }

      try {
        setIsCreatingTopic(true);
        setError(null);

        const userInfo = await sdk.requestAccount(accountInfo?.accountId);
        const publicKey = userInfo?.key?.key;
        if (!publicKey) {
          setError("Failed to get public key");
          return;
        }

        const submitPublicKey = PublicKey.fromString(publicKey);

        console.log("about to create topic", submitPublicKey);
        const topicCreateTx = new TopicCreateTransaction()
          .setTopicMemo(`hcs-7:indexed:${data.ttl}`)
          .setSubmitKey(submitPublicKey);

        const transactionResult = await sdk.executeTransactionWithErrorHandling(
          topicCreateTx,
          false
        );
        const txError = transactionResult?.error;
        const result = transactionResult?.result;

        if (txError || !result?.topicId) {
          console.error("txError", txError);
          throw new Error(txError || "Failed to create topic");
        }

        const topicData: TopicState = {
          topicId: result.topicId.toString(),
          submitKey: publicKey.toString(),
          adminKey: "",
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
        setCurrentTab("evm"); // Set tab to EVM after topic creation
      } catch (err) {
        console.error("Error in createTopic:", err);
        setError(err instanceof Error ? err.message : "Failed to create topic");
      } finally {
        setIsCreatingTopic(false);
      }
    },
    [sdk, isConnected, accountInfo]
  );

  const submitConfig = useCallback(
    async (configType: "evm" | "wasm" | "hcs1", data: any): Promise<void> => {
      if (!sdk || !isConnected) {
        setError("Please connect your wallet first");
        return;
      }

      if (!topicState?.topicId) {
        setError("No topic created");
        return;
      }

      try {
        setIsSubmitting(true);
        setError("");

        // Check limits based on config type
        if (configType === "evm" && getEvmConfigCount() >= 3) {
          setError("Maximum number of EVM configs (3) already submitted");
          return;
        }
        if (configType === "wasm" && getWasmConfigCount() >= 1) {
          setError("Maximum number of WASM configs (1) already submitted");
          return;
        }

        // Check for duplicates
        if (configType === "evm") {
          const isDuplicate = isEvmConfigDuplicate(
            data.contractAddress,
            data.functionName
          );

          if (isDuplicate) {
            setError(
              "This contract address and function combination has already been submitted"
            );
            return;
          }
        }

        let message: BaseMessage;
        switch (configType) {
          case "evm":
            message = createEvmConfig(data);
            break;
          case "wasm":
            message = createWasmConfig(data);
            break;
          case "hcs1":
            message = createRegistrationMessage(
              data.topicId,
              data.memo,
              data.weight,
              data.tags.split(",").map((tag: string) => tag.trim())
            );
            break;
          default:
            throw new Error("Invalid config type");
        }

        await submitTopicMessage(
          TopicId.fromString(topicState.topicId),
          message
        );
      } catch (error) {
        console.error("Error submitting config:", error);
        setError(
          error instanceof Error ? error.message : "Failed to submit config"
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
          parsed.p === "hcs-7" &&
          parsed.op === "register-config" &&
          parsed.t === "evm"
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
          parsed.p === "hcs-7" &&
          parsed.op === "register-config" &&
          parsed.t === "wasm"
        );
      } catch {
        return false;
      }
    }).length;
  }, [messages]);

  const isEvmConfigDuplicate = useCallback(
    (contractAddress: string, functionName: string) => {
      const evmConfigs = messages.filter(
        (msg) => msg.t === "evm"
      ) as EVMConfigMessage[];
      return evmConfigs.some(
        (config) =>
          config.c.contractAddress.toLowerCase() ===
            contractAddress.toLowerCase() && config.c.abi.name === functionName
      );
    },
    [messages]
  );

  const getSubmittedConfigs = (type: "evm" | "wasm" | "hcs1") => {
    return messages.filter((msg) => {
      if (type === "hcs1") {
        return msg.op === "register" && msg.p === "hcs-7";
      }
      return msg.t === type;
    });
  };

  const getSubmitButtonText = (type: "evm" | "wasm" | "hcs1") => {
    const count = getSubmittedConfigs(type).length;
    switch (type) {
      case "evm":
        return `Submit EVM Configuration (${count}/3)`;
      case "wasm":
        return `Submit WASM Configuration (${count}/1)`;
      case "hcs1":
        return `Submit HCS-1 Registration (${count})`;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        {!isConnected && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-3xl -z-10"></div>
            <Card className="border-2 border-primary/20 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                  Start Building Smart Hashinals
                </CardTitle>
                <CardDescription className="text-lg mt-4">
                  Connect your wallet to create dynamic, programmable, and 100%
                  on-graph assets
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                  <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center group hover:scale-105 transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                      Create
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generate your topic ID and keys
                    </p>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center group hover:scale-105 transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                      Configure
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Set up your dynamic content rules
                    </p>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center group hover:scale-105 transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                      Launch
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Go live on testnet
                    </p>
                  </div>
                </div>
                <Button
                  onClick={connect}
                  size="lg"
                  className="mt-8 px-8 py-6 text-lg font-semibold group relative overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-secondary hover:scale-105 transition-all duration-200"
                >
                  <span className="relative z-10 flex items-center">
                    Connect Wallet
                    <svg
                      className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Area */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configure Topic</CardTitle>
                  <CardDescription>
                    Configure your topic with EVM, WASM, and HCS-1 settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentTab} onValueChange={setCurrentTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="create">Create Topic</TabsTrigger>
                      <TabsTrigger value="evm" disabled={!topicState?.topicId}>
                        EVM
                      </TabsTrigger>
                      <TabsTrigger value="wasm" disabled={!topicState?.topicId}>
                        WASM
                      </TabsTrigger>
                      <TabsTrigger value="hcs1" disabled={!topicState?.topicId}>
                        HCS-1
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="create">
                      <div className="space-y-6">
                        {existingTopics.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Existing Topic
                            </label>
                            <Select
                              value={topicState?.topicId || ""}
                              onValueChange={(value) => selectTopic(value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a topic" />
                              </SelectTrigger>
                              <SelectContent>
                                {existingTopics.map((topic) => (
                                  <SelectItem
                                    key={topic.topicId}
                                    value={topic.topicId}
                                  >
                                    {topic.topicId}{" "}
                                    {topic.createdAt && (
                                      <span className="text-gray-500 text-sm ml-2">
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
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Create New Topic
                            </label>
                          </div>
                          <form
                            onSubmit={handleSubmit(createTopic)}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                TTL (seconds)
                              </label>
                              <input
                                type="number"
                                {...register("ttl")}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={!isConnected || isCreatingTopic}
                              className="w-full text-white bg-primary hover:bg-[#5000d9]"
                            >
                              {isCreatingTopic
                                ? "Creating Topic..."
                                : "Create Topic"}
                            </Button>
                          </form>
                        </div>

                        {topicState?.topicId && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                Active Topic:{" "}
                                <span className="font-mono text-gray-900">
                                  {topicState.topicId}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="evm">
                      <EVMConfigForm
                        onSubmit={(data) => submitConfig("evm", data)}
                        isConnected={isConnected}
                        isSubmitting={isSubmitting}
                        getSubmitButtonText={getSubmitButtonText}
                        defaultValues={watch("evmConfigs")?.[0]}
                        getEvmConfigCount={getEvmConfigCount}
                        isEvmConfigDuplicate={isEvmConfigDuplicate}
                        watch={watch}
                      />
                      <MessageAccordion
                        messages={messages}
                        type="evm"
                        title="Submitted EVM Configs"
                      />
                    </TabsContent>

                    <TabsContent value="wasm">
                      <WASMConfigForm
                        onSubmit={(data) => submitConfig("wasm", data)}
                        isConnected={isConnected}
                        isSubmitting={isSubmitting}
                        getWasmConfigCount={getWasmConfigCount}
                        getSubmitButtonText={getSubmitButtonText}
                        defaultValues={watch("wasmConfigs")?.[0]}
                        evmMessages={messages.filter(
                          (msg): msg is EVMConfigMessage => msg.t === "evm"
                        )}
                      />
                      <MessageAccordion
                        messages={messages}
                        type="wasm"
                        title="Submitted WASM Configs"
                      />
                    </TabsContent>

                    <TabsContent value="hcs1">
                      <HCS1RegistrationForm
                        onSubmit={(data) => submitConfig("hcs1", data)}
                        isConnected={isConnected}
                        isSubmitting={isSubmitting}
                        getSubmitButtonText={getSubmitButtonText}
                        defaultValues={watch("hcs1Registrations")?.[0]}
                        registrations={messages.filter(
                          (msg) => msg.p === "hcs-7" && msg.op === "register"
                        )}
                      />
                      <MessageAccordion
                        messages={messages}
                        type="hcs1"
                        title="Submitted HCS-1 Registrations"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Preview Area */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Preview your inscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        NFT Metadata Location (HCS-6)
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded-md font-mono text-sm">
                          hcs://6/{topicState?.topicId}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `hcs://6/${topicState?.topicId}`
                            );
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isTopicReady && (
                    <RenderFile
                      url={`https://kiloscribe.com/api/inscription-cdn/${topicState?.topicId}?network=testnet`}
                      className="w-full h-full object-contain"
                    />
                  )}
                  {!isTopicReady && (
                    <div className="space-y-4 text-gray-600 py-8 px-4">
                      <h3 className="text-lg font-medium text-center mb-6">
                        Topic Setup Progress
                      </h3>
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              curentTopicReadyMode.evmLength >= 1
                                ? "bg-green-50 border-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {curentTopicReadyMode.evmLength >= 1 && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={
                              curentTopicReadyMode.evmLength >= 1
                                ? "text-green-600"
                                : ""
                            }
                          >
                            EVM Config ({curentTopicReadyMode.evmLength}/1
                            required)
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              curentTopicReadyMode.wasmLength >= 1
                                ? "bg-green-50 border-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {curentTopicReadyMode.wasmLength >= 1 && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={
                              curentTopicReadyMode.wasmLength >= 1
                                ? "text-green-600"
                                : ""
                            }
                          >
                            WASM Config ({curentTopicReadyMode.wasmLength}/1
                            required)
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              curentTopicReadyMode.hcs1Length >= 2
                                ? "bg-green-50 border-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {curentTopicReadyMode.hcs1Length >= 2 && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={
                              curentTopicReadyMode.hcs1Length >= 2
                                ? "text-green-600"
                                : ""
                            }
                          >
                            HCS-1 Registrations (
                            {curentTopicReadyMode.hcs1Length}
                            /2 required)
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-center mt-6 text-gray-500">
                        Complete all requirements above to enable the preview
                      </p>
                    </div>
                  )}
                  {!topicState?.topicId && (
                    <div className="text-center text-gray-500 py-8">
                      Create a topic to preview inscriptions
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
