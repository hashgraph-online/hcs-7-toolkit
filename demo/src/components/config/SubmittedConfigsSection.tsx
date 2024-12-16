import { ConfigDisplay } from './ConfigDisplay';

interface SubmittedConfigsSectionProps {
  type: 'evm' | 'wasm' | 'hcs1';
  title: string;
  configs: any[];
}

export function SubmittedConfigsSection({
  type,
  title,
  configs,
}: SubmittedConfigsSectionProps) {
  if (configs.length === 0) return null;

  return (
    <div className='mt-4 overflow-hidden'>
      <h5 className='text-sm font-medium text-gray-700 mb-2'>
        Submitted {title}
      </h5>
      <div className='space-y-2 overflow-y-auto max-h-[300px] pr-1'>
        {configs.map((config, index) => (
          <ConfigDisplay key={index} config={config} type={type} />
        ))}
      </div>
    </div>
  );
}
