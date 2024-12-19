import { useState, useEffect } from "react";
import { RenderFile } from "../preview/RenderFile";
import { EVMBridge } from "@hashgraphonline/hcs-7-toolkit";
import ChainlinkLogo from "./Chainlink";

function MobilePriceReactiveNFT({
  toggle,
  setToggle,
  autoMode,
  setAutoMode,
  price,
  topicId,
}: {
  toggle: boolean;
  setToggle: (value: boolean) => void;
  autoMode: boolean;
  setAutoMode: (value: boolean) => void;
  price: string;
  topicId: string;
}) {
  return (
    <div className="relative h-[600px] flex flex-col">
      <div className="absolute inset-0 w-full h-full">
        <RenderFile
          url={`https://kiloscribe.com/api/inscription-cdn/${topicId}?network=testnet`}
          mimeType="image/png"
          className="w-[1980px] h-[1080px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
        />
      </div>

      <div className="relative h-full flex flex-col">
        <div className="h-16 backdrop-blur-xl bg-black/40 border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-base font-medium text-white truncate">
              Price-Driven NFT
            </span>
          </div>
          <button
            onClick={() => setToggle(!toggle)}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/80"
          >
            {toggle ? "ODD" : "EVEN"}
          </button>
        </div>

        <div className="flex-1 overflow-auto pb-4">
          <div className="flex flex-col gap-3 p-4">
            <div className="w-full backdrop-blur-xl bg-black/40 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold text-white">HCS-7 File</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-white/60 mb-1">Topic ID</div>
                  <span className="font-mono text-sm text-white break-all">
                    {topicId}
                  </span>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-white/80">
                    Switch between different background images based on HBAR's
                    price
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full backdrop-blur-xl bg-black/40 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ChainlinkLogo className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Price Feed</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-white/60 mb-1">HBAR/USD</div>
                  <div className="text-lg font-mono text-white">
                    ${price || "..."}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Mode</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAutoMode(true)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        autoMode
                          ? "bg-purple-500/30 text-purple-400 border border-purple-500/50"
                          : "bg-black/20 text-white/60 border border-white/5"
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => setAutoMode(false)}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        !autoMode
                          ? "bg-green-500/30 text-green-400 border border-green-500/50"
                          : "bg-black/20 text-white/60 border border-white/5"
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">NFT State</div>
                  <button
                    onClick={() => !autoMode && setToggle(!toggle)}
                    className={`font-mono text-sm transition-colors duration-500 ${
                      toggle ? "text-purple-500" : "text-blue-500"
                    } ${autoMode ? "cursor-default" : ""}`}
                  >
                    {toggle ? "ODD" : "EVEN"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PriceReactiveNFT = () => {
  const [toggle, setToggle] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [topicId, setTopicId] = useState("0.0.5283577");

  const oddTopicId = "0.0.5283746";
  const evenTopicId = "0.0.5283750";

  const realTopicId = "0.0.5283752";

  useEffect(() => {
    if (autoMode && price !== null) {
      setTopicId(realTopicId);
    } else {
      setTopicId(toggle ? oddTopicId : evenTopicId);
    }
  }, [toggle, price, autoMode]);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const evmBridge = new EVMBridge("testnet");

        const evmConfig = {
          p: "hcs-7",
          op: "register-config",
          t: "evm",
          c: {
            contractAddress: "0x59bC155EB6c6C415fE43255aF66EcF0523c92B4a",
            abi: {
              type: "function",
              name: "latestRoundData",
              constant: true,
              stateMutability: "view",
              payable: false,
              inputs: [],
              outputs: [
                { type: "uint80", name: "roundId" },
                { type: "int256", name: "answer" },
                { type: "uint256", name: "startedAt" },
                { type: "uint256", name: "updatedAt" },
                { type: "uint80", name: "answeredInRound" },
              ],
            },
          },
          m: "LaunchPage Test Mint",
        };

        const { stateData } = await evmBridge.executeCommands([evmConfig]);
        const priceValue = Number(stateData.latestRoundData.answer) / 10 ** 8;
        const isEven = priceValue % 2 === 0;
        setToggle(!isEven);
        console.log("Fetched price data:", priceValue, isEven);
        setPrice(priceValue);
      } catch (error) {
        console.error("Error fetching price data:", error);
      }
    };

    const interval = setInterval(fetchPriceData, 5000);
    fetchPriceData();

    return () => clearInterval(interval);
  }, [autoMode]);

  return (
    <div className="relative w-full h-[600px] bg-black/90 rounded-[40px] overflow-hidden border border-white/10">
      <div className="hidden md:block pb-8">
        <div className="absolute inset-0 w-full h-full">
          <RenderFile
            url={`https://kiloscribe.com/api/inscription-cdn/${topicId}?network=testnet`}
            mimeType="image/png"
            className="w-[1980px] h-[1080px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
          />
        </div>

        <div className="relative h-full flex flex-col ">
          <div className="h-20 backdrop-blur-xl bg-black/40 border-b border-white/10 flex items-center justify-between px-8">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xl font-medium text-white">
                Example: Price-Driven Background Switcher
              </span>
            </div>

            <div
              onClick={() => setToggle(!toggle)}
              className="group cursor-pointer"
            >
              <div className="relative w-[200px] h-12">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/20 to-purple-500/20 group-hover:from-green-500/30 group-hover:to-purple-500/30 transition-all duration-300" />
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-green-500/20 transition-opacity duration-500 ${
                    toggle ? "opacity-100" : "opacity-0"
                  }`}
                />
                <div
                  className={`absolute top-1.5 left-1.5 w-[40px] h-[36px] rounded-md bg-gradient-to-br transition-all duration-500 flex items-center justify-center transform ${
                    toggle
                      ? "translate-x-[140px] from-purple-500 to-purple-400"
                      : "translate-x-0 from-green-500 to-green-400"
                  }`}
                >
                  <span className="text-sm font-mono text-white">
                    {toggle ? "ODD" : "EVEN"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center pt-8 pb-8">
            <div className="flex gap-6 px-4">
              <div className="w-[320px] backdrop-blur-xl bg-black/40 border border-blue-500/20 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-5">
                  <h3 className="text-2xl font-bold text-white whitespace-nowrap">
                    HCS-7 File Serving
                  </h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm text-white/60 mb-2">Topic ID</div>
                    <span className="font-mono text-base text-white">
                      {topicId}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/80">
                      A simple demo showing how to serve different background
                      images through HCS-7. Each Topic ID represents a unique
                      image, and we switch between them based on HBAR's price.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-white/80">
                      <li>• Each Topic ID = Different background image</li>
                      <li>• Auto Mode: Changes with HBAR price</li>
                      <li>• Manual Mode: Toggle between images</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="w-[320px] backdrop-blur-xl bg-black/40 border border-purple-500/20 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-5">
                  <ChainlinkLogo className="w-7 h-7 flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-white whitespace-nowrap">
                    Chainlink Price Feed
                  </h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm text-white/60 mb-2">HBAR/USD</div>
                    <div className="text-2xl font-mono text-white">
                      ${price || "Loading..."}
                    </div>
                    <p className="text-sm text-white/60 mt-2">
                      Price data from Chainlink's decentralized oracle smart
                      contracts on Hedera
                    </p>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-2">
                      Mode Selection
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAutoMode(true)}
                        className={`px-4 py-2 rounded-lg text-base transition-all duration-300 ${
                          autoMode
                            ? "bg-purple-500/30 text-purple-400 border border-purple-500/50"
                            : "bg-black/20 text-white/60 border border-white/5 hover:bg-black/30"
                        }`}
                      >
                        Auto Mode
                      </button>
                      <button
                        onClick={() => setAutoMode(false)}
                        className={`px-4 py-2 rounded-lg text-base transition-all duration-300 ${
                          !autoMode
                            ? "bg-green-500/30 text-green-400 border border-green-500/50"
                            : "bg-black/20 text-white/60 border border-white/5 hover:bg-black/30"
                        }`}
                      >
                        Manual Mode
                      </button>
                    </div>
                    <p className="text-sm text-white/40 mt-2">
                      {autoMode
                        ? "Auto Mode: Background switches when HBAR price changes between even/odd"
                        : "Manual Mode: Click the toggle to switch between backgrounds"}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm text-white/60 mb-2">NFT State</div>
                    <button
                      onClick={() => !autoMode && setToggle(!toggle)}
                      className={`font-mono transition-colors duration-500 ${
                        toggle ? "text-purple-500" : "text-blue-500"
                      } ${autoMode ? "cursor-default" : ""}`}
                    >
                      {toggle ? "ODD" : "EVEN"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <MobilePriceReactiveNFT
          toggle={toggle}
          setToggle={setToggle}
          autoMode={autoMode}
          setAutoMode={setAutoMode}
          price={price?.toString() || ''}
          topicId={topicId}
        />
      </div>
    </div>
  );
};
