import React from "react";

export const MobileHowItWorks = () => {
  return (
    <div className="sm:hidden space-y-4 px-4">
      <div className="flex items-center space-x-4 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Request File
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Client requests content from HCS CDN
          </p>
        </div>
      </div>

      <div className="flex justify-center">
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
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      <div className="flex items-center space-x-4 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Read Smart Contract
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CDN reads current state from connected smart contracts
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <svg
          className="w-6 h-6 text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      <div className="flex items-center space-x-4 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Process with WASM
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            WebAssembly processes contract state with custom logic
          </p>
        </div>
      </div>

      <div className="flex justify-center">
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
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      <div className="flex items-center space-x-4 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            Return Content
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Verified topic id is returned to the client
          </p>
        </div>
      </div>
    </div>
  );
};
