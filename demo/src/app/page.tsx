"use client";

import { useState, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RenderFile } from "@/components/preview/RenderFile";
import Navbar from "@/components/Navbar/Navbar";
import { BuildSection } from "@/components/Builder/BuildSection";
import { MobileHowItWorks } from "@/components/HowItWorks/MobileHowItWorks";
import { DesktopHowItWorks } from "@/components/HowItWorks/DesktopHowItWorks";
import Tweet from "@/components/Tweet";
import { Footer } from "@/components/Footer";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { ArrowRight } from "lucide-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("learn");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showOddMetadata, setShowOddMetadata] = useState(false);
  const [showEvenMetadata, setShowEvenMetadata] = useState(false);

  const scrollToTabs = useCallback((tab: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Global Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute w-[800px] h-[800px] -top-96 -right-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] -bottom-48 -left-48 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-300"></div>
        <div className="absolute w-[900px] h-[900px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="relative min-h-[80vh] flex items-center justify-center py-12 lg:py-20">
            <div className="relative z-10 max-w-5xl mx-auto text-center">
              <div className="inline-block mb-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                  Now in Testnet
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                Smart Hashinals with HCS-7
              </h1>

              <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 max-w-3xl mx-auto">
                Dynamic, Programmable, and 100% on-graph assets. Finally,
                enabling a new generation of NFTs.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16 px-4">
                <button
                  onClick={() => scrollToTabs("build")}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-lg px-6 md:px-8 py-3 md:py-4 text-lg font-medium transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg"
                >
                  <span>Start Building</span>
                  <svg
                    className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => scrollToTabs("learn")}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-lg px-6 md:px-8 py-3 md:py-4 text-lg font-medium transition-all duration-200"
                >
                  <span>Learn More</span>
                  <svg
                    className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-4 text-left px-4">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                    DeFi-Reactive NFTs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create NFTs that transform based on{" "}
                    <span className="font-medium text-black dark:text-white">
                      token prices
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-black dark:text-white">
                      liquidity ranges
                    </span>{" "}
                    - visualize{" "}
                    <span className="font-medium text-black dark:text-white">
                      HBAR price changes
                    </span>
                    , display{" "}
                    <span className="font-medium text-black dark:text-white">
                      fees and returns
                    </span>{" "}
                    in real-time. Your NFT becomes a living dashboard.
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                    Holder-Reactive Identity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create NFTs that adapt to their current holder's{" "}
                    <span className="font-medium text-black dark:text-white">
                      on-chain identity
                    </span>{" "}
                    - transform based on their{" "}
                    <span className="font-medium text-black dark:text-white">
                      KNS profile
                    </span>
                    ,{" "}
                    <span className="font-medium text-black dark:text-white">
                      token holdings
                    </span>
                    ,
                    <span className="font-medium text-black dark:text-white">
                      transaction history
                    </span>
                    , and{" "}
                    <span className="font-medium text-black dark:text-white">
                      social graph
                    </span>
                    . Your NFT becomes a living reflection of its owner.
                  </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                    Composable Game Assets
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Design items that{" "}
                    <span className="font-medium text-black dark:text-white">
                      level up
                    </span>{" "}
                    based on complex game achievements - combining{" "}
                    <span className="font-medium text-black dark:text-white">
                      multiple contract states
                    </span>
                    ,
                    <span className="font-medium text-black dark:text-white">
                      time-weighted scores
                    </span>
                    , and{" "}
                    <span className="font-medium text-black dark:text-white">
                      cross-game interactions
                    </span>{" "}
                    to unlock new forms and abilities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content Tabs */}
          <div className="pb-8 md:pb-16" ref={tabsRef}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="learn">
                  <span className="block sm:hidden">Learn</span>
                  <span className="hidden sm:block">Learn How It Works</span>
                </TabsTrigger>
                <TabsTrigger value="try">
                  <span className="block sm:hidden">Try</span>
                  <span className="hidden sm:block">Try It Out</span>
                </TabsTrigger>
                <TabsTrigger value="build">
                  <span className="block sm:hidden">Build</span>
                  <span className="hidden sm:block">Start Building</span>
                </TabsTrigger>
              </TabsList>

              {/* Learn Tab */}
              <TabsContent value="learn" className="mt-4">
                <div className="mx-auto space-y-24">
                  {/* Introduction */}

                  {/* Features Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-left px-4">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                        Smart Contract Powered
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Connect to any EVM smart contract to read state and
                        transform your content based on on-chain data.
                      </p>
                    </div>

                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                        WASM Processing
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Use WebAssembly to process contract state with custom
                        logic, enabling complex transformations and routing.
                      </p>
                    </div>

                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all group">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-secondary">
                        Dynamic Content
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Route to different Topic IDs based on contract state,
                        enabling dynamic updates of metadata, images, and more.
                      </p>
                    </div>
                  </div>

                  {/* How It Works */}
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      How It Works
                    </h3>

                    <MobileHowItWorks />
                    <DesktopHowItWorks />

                    {/* Steps */}
                    <div className="hidden sm:grid grid-cols-4 gap-8 px-8">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-primary font-semibold text-lg">
                            1
                          </span>
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          Request File
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-primary font-semibold text-lg">
                            2
                          </span>
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          Read State
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-secondary font-semibold text-lg">
                            3
                          </span>
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          Process Data
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-primary font-semibold text-lg">
                            4
                          </span>
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          Return Content
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-3xl -z-10"></div>

                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold mb-6">
                        Example: Dynamic NFT Content
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        KiloScribe's Hackathon submission includes LaunchPage
                        smart contracts and the LaunchPage builder. In this
                        example, we will use the LaunchPage smart contract to
                        create dynamic NFTs that change their content based on
                        the state of how many NFTs have been minted.
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-16 md:gap-96 justify-center relative">
                      {/* Transition Indicator */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        {/* Desktop version */}
                        <div className="hidden md:flex flex-row items-center gap-4">
                          <div className="w-24 h-[2px] bg-purple-600/50 dark:bg-purple-400/50"></div>
                          <div className="text-sm font-medium text-purple-600/80 dark:text-purple-400/80 whitespace-nowrap">
                            Mint Count Changes
                          </div>
                          <div className="w-24 h-[2px] bg-purple-600/50 dark:bg-purple-400/50"></div>
                        </div>
                        {/* Mobile version */}
                        <div className="md:hidden flex flex-col items-center gap-2">
                          <svg
                            className="w-5 h-5 text-purple-600/80 dark:text-purple-400/80"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                          <div className="text-sm font-medium text-purple-600/80 dark:text-purple-400/80 whitespace-nowrap">
                            Mint Count Changes
                          </div>
                        </div>
                      </div>

                      {/* Even NFT */}
                      <div className="max-w-[500px] group bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold">
                                Even State NFT
                              </h4>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Topic ID: 0.0.5270226
                              </div>
                            </div>
                            <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                              minted = 42
                            </div>
                          </div>
                          <RenderFile
                            url={`https://kiloscribe.com/api/inscription-cdn/0.0.5270226?network=testnet`}
                            className="block w-full aspect-square object-contain"
                          />
                          <div className="mt-4">
                            <button
                              onClick={() =>
                                setShowEvenMetadata((prev) => !prev)
                              }
                              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between rounded-lg"
                            >
                              <span className="font-medium">View Metadata</span>
                              <svg
                                className={`w-5 h-5 transform transition-transform`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            {showEvenMetadata && (
                              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <pre className="text-sm text-gray-600 dark:text-gray-300 w-full max-w-[452px] overflow-x-auto">
                                  <RenderFile
                                    url={`https://kiloscribe.com/api/inscription-cdn/0.0.5270244?network=testnet`}
                                    className="font-mono text-sm"
                                  />
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Odd NFT */}
                      <div className="max-w-[500px] group bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold">
                                Odd State NFT
                              </h4>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Topic ID: 0.0.5270238
                              </div>
                            </div>
                            <div className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                              minted = 43
                            </div>
                          </div>
                          <RenderFile
                            url={`https://kiloscribe.com/api/inscription-cdn/0.0.5270238?network=testnet`}
                            className="block w-full aspect-square object-contain"
                          />
                          <div className="mt-4">
                            <button
                              onClick={() =>
                                setShowOddMetadata((prev) => !prev)
                              }
                              className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between rounded-lg"
                            >
                              <span className="font-medium">View Metadata</span>
                              <svg
                                className={`w-5 h-5 transform transition-transform`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                            {showOddMetadata && (
                              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <pre className="text-sm text-gray-600 dark:text-gray-300 w-full max-w-[452px] overflow-x-auto">
                                  <RenderFile
                                    url={`https://kiloscribe.com/api/inscription-cdn/0.0.5270231?network=testnet`}
                                    className="font-mono text-sm"
                                  />
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 blur-3xl -z-10"></div>

                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold mb-6">
                        Example: Dynamic Banner Content
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        The same principle can be applied to banner content.
                        Here's how the banner image and metadata changes based
                        on the minted count:
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Even Banner */}
                      <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold">
                                Even State Banner
                              </h4>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Topic ID: 0.0.5269930
                              </div>
                            </div>
                            <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                              minted = 42
                            </div>
                          </div>
                          <img
                            src={`https://kiloscribe.com/api/inscription-cdn/0.0.5269930?network=testnet`}
                            className="w-full h-auto max-h-[200px]"
                            alt="Banner"
                          />
                        </div>
                      </div>

                      {/* Odd Banner */}
                      <div className="group bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold">
                                Odd State Banner
                              </h4>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Topic ID: 0.0.5269959
                              </div>
                            </div>
                            <div className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                              minted = 43
                            </div>
                          </div>
                          <img
                            src={`https://kiloscribe.com/api/inscription-cdn/0.0.5269959?network=testnet`}
                            className="w-full h-auto max-h-[200px]"
                            alt="Banner"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learn More */}
                  <div className="mt-16 relative isolate overflow-hidden bg-gradient-to-b from-[#6100ff]/5 to-[#6100ff]/10 rounded-3xl">
                    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
                      <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-gradient-to-r from-[#6100ff] to-purple-600 bg-clip-text text-transparent">
                          Dive Deeper
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                          This is just the tip of the iceberg. Explore the
                          complete HCS-7 standard documentation to understand
                          how Smart Hashinals work on Hedera.
                        </p>
                        <div className="mt-10 flex items-center justify-center">
                          <a
                            href="https://feat-hcs-7.hcs-improvement-proposals.pages.dev/docs/standards/hcs-7/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-x-2 rounded-full bg-[#6100ff] px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-[#6100ff]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6100ff] transition-all duration-200 hover:scale-105"
                          >
                            Read the HCS-7 Standard
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                                clipRule="evenodd"
                              />
                              <path
                                fillRule="evenodd"
                                d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div
                      className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
                      aria-hidden="true"
                    >
                      <div
                        className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-[#6100ff] to-purple-600 opacity-25"
                        style={{
                          clipPath:
                            "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Try Tab */}
              <TabsContent value="try" className="mt-6">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
                      Mint Your First Smart Hashinal
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                      KiloScribe has open-sourced its LaunchPage smart contract,
                      empowering anyone to create dynamic Hashinals that adapt
                      to on-chain conditions. The demo below showcases how the
                      number of minted NFTs on the LaunchPage smart contract
                      influences the banner image and metadata. This was
                      developed using the KiloScribe LaunchPage Builder in
                      conjunction with HCS-7, both created during the Hedera
                      HelloFuture Hackathon.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <Tweet id="1866176384097538490" />
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold mb-4">
                          Mint Your First Smart Hashinal
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Experience the power of Smart Hashinals by minting
                          your first one on testnet. This demo utilizes the
                          amount of minted NFTs on the LaunchPage smart contract
                          to determine the banner image and metadata.
                        </p>
                        <button
                          onClick={() =>
                            window.open(
                              "https://testnet.kiloscribe.com/launch/first-smart-hashinal",
                              "_blank"
                            )
                          }
                          className="w-full group relative inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-3 text-lg font-medium transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg"
                        >
                          <span>Mint on Testnet</span>
                          <svg
                            className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 p-4 rounded-lg">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <svg
                              className="w-4 h-4 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            This demo uses testnet HBAR. Need some? Visit the{" "}
                            <a
                              href="https://portal.hedera.com/login"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 font-medium"
                            >
                              Hedera Portal
                            </a>{" "}
                            to get started.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Create LaunchPage Section */}
                  <div className="relative mb-16">
                    <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                      {/* Image Section - Full bleed */}
                      <div className="relative">
                        <img
                          src="/launch-demo.png"
                          alt="LaunchPage Builder Interface"
                          className="w-full h-auto"
                        />
                      </div>

                      {/* Content Section */}
                      <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <h3 className="text-2xl font-bold mb-4">
                              Create Your Own LaunchPage
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                              Use KiloScribe's LaunchPage builder to inscribe,
                              tokenize, and launch your own Hashinals without
                              writing a single line of code. Customize your
                              page's to your hearts content, publish 100%
                              on-graph through the Hedera Consensus Service, and
                              serve to millions of people around the world
                              without paying for a server through KiloScribe
                              domains.
                            </p>
                          </div>
                          <div>
                            <div className="space-y-4 mb-8">
                              <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    No coding required
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    100% On-Graph
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Powered by HCS-3 Recursion & HCS-1
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    Utilizing Hedera Wallet Connect
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center mt-12">
                              <p className="text-sm text-gray-500 mb-4">
                                Ready to inscribe the future?
                              </p>
                              <button
                                onClick={() =>
                                  window.open(
                                    "https://kiloscribe.com/inscribe",
                                    "_blank"
                                  )
                                }
                                className="group relative inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-lg px-8 py-4 text-xl font-semibold transition-all duration-200 ease-in-out transform hover:translate-y-[-2px] hover:shadow-lg"
                              >
                                <span>Launch Your Hashinal</span>
                                <ArrowRight className="w-6 h-6 ml-2 -mr-1 transition-transform group-hover:translate-x-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Section */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl"></div>
                    <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-4">
                          Explore the Smart Contracts
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                          Dive into the open-source code behind KiloScribe's
                          LaunchPage contracts.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <a
                          href="https://github.com/KiloScribe/launchpage-smart-contracts"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4M6 16l4-4 4 4"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                                LaunchPage Contracts
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Smart Contracts for minting NFTs, compatible
                                with Hashinals.
                              </p>
                            </div>
                          </div>
                        </a>

                        <a
                          href="https://launchpad-test.kiloscribe.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-secondary dark:hover:border-secondary transition-all"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <svg
                                className="w-6 h-6 text-secondary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold mb-2 group-hover:text-secondary transition-colors">
                                Example LaunchPage
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                The first-ever LaunchPage live on mainnet.
                              </p>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Build Tab - Original HCS-7 Builder Content */}
              <TabsContent value="build">
                <BuildSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
