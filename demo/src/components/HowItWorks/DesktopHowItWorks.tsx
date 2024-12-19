import React from "react";

export const DesktopHowItWorks = () => {
  return (
    <div className="hidden sm:flex flex-col space-y-6">
      <div className="relative w-full h-[250px] bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-lg">
        <svg
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 1000 200"
        >
          <g>
            <rect
              x="60"
              y="40"
              width="180"
              height="80"
              rx="8"
              fill="#6100ff10"
              stroke="#6100ff"
              strokeWidth="2"
            />
            <g transform="translate(132, 52)">
              <svg width="36" height="36" viewBox="0 0 32 32">
                <path
                  d="M28 28l-8-8m2.667-6.667a9.333 9.333 0 11-18.667 0 9.333 9.333 0 0118.667 0z"
                  stroke="#6100ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </g>
            <text
              x="150"
              y="105"
              textAnchor="middle"
              fill="#6100ff"
              fontSize="16"
              fontWeight="500"
            >
              Request
            </text>
          </g>

          <g>
            <rect
              x="300"
              y="40"
              width="180"
              height="80"
              rx="8"
              fill="#6100ff10"
              stroke="#6100ff"
              strokeWidth="2"
            />
            <g transform="translate(372, 52)">
              <svg width="36" height="36" viewBox="0 0 32 32">
                <path
                  d="M12 16h8m-8 5.333h8M26.667 25.333H9.333A2.667 2.667 0 016.667 22.667V6.667A2.667 2.667 0 019.333 4h7.448a1.333 1.333 0 01.943.39l7.219 7.219a1.333 1.333 0 01.39.943v10.115a2.667 2.667 0 01-2.666 2.666z"
                  stroke="#6100ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </g>
            <text
              x="390"
              y="105"
              textAnchor="middle"
              fill="#6100ff"
              fontSize="16"
              fontWeight="500"
            >
              Smart Contract
            </text>
          </g>

          <g>
            <rect
              x="540"
              y="40"
              width="180"
              height="80"
              rx="8"
              fill="#ff914d10"
              stroke="#ff914d"
              strokeWidth="2"
            />
            <g transform="translate(612, 52)">
              <svg width="36" height="36" viewBox="0 0 32 32">
                <path
                  d="M13.333 26.667l5.334-21.334m5.333 5.334l5.333 5.333-5.333 5.333M8 21.333l-5.333-5.333L8 10.667"
                  stroke="#ff914d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </g>
            <text
              x="630"
              y="105"
              textAnchor="middle"
              fill="#ff914d"
              fontSize="16"
              fontWeight="500"
            >
              WASM
            </text>
          </g>

          <g>
            <rect
              x="780"
              y="40"
              width="180"
              height="80"
              rx="8"
              fill="#6100ff10"
              stroke="#6100ff"
              strokeWidth="2"
            />
            <g transform="translate(852, 52)">
              <svg width="36" height="36" viewBox="0 0 32 32">
                <path
                  d="M12 16l2.667 2.667 5.333-5.334m8 2.667a12 12 0 11-24 0 12 12 0 0124 0z"
                  stroke="#6100ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </g>
            <text
              x="870"
              y="105"
              textAnchor="middle"
              fill="#6100ff"
              fontSize="16"
              fontWeight="500"
            >
              Verified Content
            </text>
          </g>

          <g stroke="#6100ff" strokeWidth="2" fill="none">
            <path
              d="M240 80h60M480 80h60M720 80h60"
              markerEnd="url(#arrowhead)"
            />
          </g>

          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6100ff" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
};
