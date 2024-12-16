import { useState } from 'react';

interface ConfigDisplayProps {
  config: any;
  type: 'evm' | 'wasm' | 'hcs1';
}

export function ConfigDisplay({ config, type }: ConfigDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfigSummary = () => {
    switch (type) {
      case 'evm':
        return (
          <div className='flex flex-col space-y-1'>
            <div className='font-medium text-gray-700'>
              Contract:{' '}
              <span className='font-mono text-sm text-purple-600'>
                {config.c.contractAddress}
              </span>
            </div>
            <div className='text-sm text-gray-600'>
              Function:{' '}
              <span className='font-mono text-purple-600'>
                {config.c.abi.name}
              </span>
            </div>
            <div className='text-sm text-gray-600'>
              Output:{' '}
              <span className='font-mono text-purple-600'>
                {config.c.abi.outputs[0].type}
              </span>
            </div>
          </div>
        );
      case 'wasm':
        return (
          <div className='flex flex-col space-y-1'>
            <div className='font-medium text-gray-700'>
              Topic ID:{' '}
              <span className='font-mono text-sm text-purple-600'>
                {config.c.wasmTopicId}
              </span>
            </div>
            <div className='text-sm text-gray-600'>
              Input Type:{' '}
              <span className='font-mono text-purple-600'>stateData</span>
            </div>
            <div className='text-sm text-gray-600'>
              Output Type:{' '}
              <span className='font-mono text-purple-600'>
                {config.c.outputType.type}
              </span>
            </div>
          </div>
        );
      case 'hcs1':
        return (
          <div className='flex flex-col space-y-1'>
            <div className='font-medium text-gray-700'>
              Topic ID:{' '}
              <span className='font-mono text-sm text-purple-600'>
                {config.t_id}
              </span>
            </div>
            <div className='text-sm text-gray-600'>
              Weight:{' '}
              <span className='font-mono text-purple-600'>
                {config.d.weight}
              </span>
            </div>
            <div className='text-sm text-gray-600'>
              Tags:{' '}
              <span className='font-mono text-purple-600'>
                {config.d.tags.join(', ')}
              </span>
            </div>
            <div className='text-sm text-gray-600'>
              Memo:{' '}
              <span className='font-mono text-purple-600'>{config.m}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-100 hover:border-purple-200 transition-all duration-200'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-4 py-3 flex items-center justify-between text-left'
      >
        <div className='flex-1 min-w-0 mr-4'>{getConfigSummary()}</div>
        <div className='flex-shrink-0'>
          <svg
            className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className='px-4 pb-4 pt-2'>
          <pre className='bg-gray-50 rounded p-3 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all'>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
