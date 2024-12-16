import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { EVMConfigMessage } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { WasmBridge } from '@hashgraphonline/hcs-7-toolkit';
import { useWallet } from '@/hooks/useWallets';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const formStyles = {
  input: `mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
          focus:ring-2 focus:ring-[#6100ff]/20 focus:border-[#6100ff] transition-colors duration-200`,
  label: `block text-sm font-medium text-gray-700`,
  formGroup: `mb-4`,
};

const TOPIC_OPTIONS = [
  {
    id: '0.0.5269810',
    label: '0.0.5269810',
  },
  {
    id: 'custom',
    label: 'Custom Topic ID',
  },
];

interface WASMConfigFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isConnected: boolean;
  isSubmitting: boolean;
  getWasmConfigCount: () => number;
  getSubmitButtonText: (type: 'evm' | 'wasm' | 'hcs1') => string;
  evmMessages: EVMConfigMessage[];
}

export function WASMConfigForm({
  onSubmit,
  defaultValues,
  isConnected,
  isSubmitting,
  getWasmConfigCount,
  getSubmitButtonText,
  evmMessages,
}: WASMConfigFormProps) {
  const walletContext = useWallet();
  const network = walletContext?.accountInfo?.network;
  const [wasmParams, setWasmParams] = useState<Record<string, string> | null>(null);
  const [wasmError, setWasmError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: defaultValues || {
      wasmTopicId: '0.0.5269810',
      topicSelect: '0.0.5269810',
      stateData: {},
      memo: '',
    },
  });

  const wasmTopicId = watch('wasmTopicId');
  const topicSelect = watch('topicSelect');

  useEffect(() => {
    async function fetchWasmParams() {
      if (!wasmTopicId || !network) {
        console.log('no wasmTopicId or network', wasmTopicId, network);
        setWasmParams(null);
        setWasmError(null);
        return;
      }

      try {
        const response = await fetch(
          `https://kiloscribe.com/api/inscription-cdn/${wasmTopicId}?network=${network}`,
          {
            headers: {
              'Accept': 'application/wasm'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/wasm') && !contentType?.includes('application/octet-stream')) {
          console.warn('Warning: Unexpected content type:', contentType);
        }

        const wasmBytes = await response.arrayBuffer();
        const bridge = new WasmBridge();
        await bridge.initWasm(wasmBytes);
        const params = bridge.getParams();
        const parsedParams = JSON.parse(params);

        console.log('got params', params, parsedParams);
        setWasmParams(parsedParams);
        setWasmError(null);
      } catch (error) {
        console.error('Error fetching WASM:', error);
        setWasmError('Failed to load WASM module. Make sure the topic ID is correct.');
        setWasmParams(null);
      }
    }

    fetchWasmParams();
  }, [wasmTopicId, network]);

  const canSubmit = (count: number) => {
    return count === 0;
  };

  // Helper function to check type compatibility
  const isTypeCompatible = (wasmType: string, evmType: string) => {
    // Treat all uint/int types as compatible with number
    if (wasmType === 'number' && (evmType.startsWith('uint') || evmType.startsWith('int'))) {
      return true;
    }
    return wasmType === evmType;
  };

  // Extract state data from EVM configs
  const stateData = evmMessages.reduce((acc, msg) => {
    const functionName = msg.c.abi.name;
    const outputType = msg.c.abi.outputs[0].type;
    acc[functionName] = outputType;
    return acc;
  }, {} as Record<string, string>);

  // Check for mismatches between WASM params and EVM state data
  const mismatches = wasmParams ? Object.entries(wasmParams).filter(([key, type]) => {
    return !stateData[key] || !isTypeCompatible(type as string, stateData[key]);
  }) : [];

  const handleFormSubmit = (data: any) => {
    // Include the state data in the submission
    onSubmit({
      ...data,
      stateData,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">WASM Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enter your WASM Topic ID below. The WASM module's required parameters will be automatically validated against your EVM configuration.
          </p>
          <div className={formStyles.formGroup}>
            <Label className="text-sm font-medium text-gray-700">WASM Topic ID</Label>
            <div className="flex flex-col space-y-2">
              <Select
                onValueChange={(value) => {
                  setValue('topicSelect', value);
                  if (value === 'custom') {
                    setValue('wasmTopicId', '');
                  } else {
                    setValue('wasmTopicId', value);
                  }
                }}
                defaultValue="0.0.5269810"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Topic ID" />
                </SelectTrigger>
                <SelectContent>
                  {TOPIC_OPTIONS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {topicSelect === 'custom' && (
                <Input
                  {...register('wasmTopicId', {
                    required: 'Topic ID is required',
                    pattern: {
                      value: /^[0-9]+\.[0-9]+\.[0-9]+$/,
                      message: 'Must be a valid Topic ID format (e.g., 0.0.1234567)'
                    }
                  })}
                  className={errors.wasmTopicId ? 'border-red-500 focus:ring-red-200' : ''}
                  placeholder="0.0.1234567"
                />
              )}
            </div>
            {errors.wasmTopicId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.wasmTopicId.message}
              </p>
            )}
          </div>
        </div>

        {wasmError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{wasmError}</p>
          </div>
        )}

        {wasmParams && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Parameter Validation</h4>
              <p className="text-sm text-gray-600 mb-4">
                Your WASM module requires the following parameters. These should match the outputs from your EVM configuration.
              </p>
              <div className="space-y-2">
                {Object.entries(wasmParams).map(([key, type]) => {
                  const hasMatch = stateData[key];
                  const isCompatible = hasMatch && isTypeCompatible(type as string, stateData[key]);
                  return (
                    <div 
                      key={key}
                      className={`p-3 rounded-md ${
                        !hasMatch ? 'bg-red-50 border border-red-200' :
                        isCompatible ? 'bg-green-50 border border-green-200' :
                        'bg-yellow-50 border border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{key}</p>
                          <p className="text-xs text-gray-600">Required type: {type as string}</p>
                        </div>
                        {hasMatch && (
                          <div className="text-right">
                            <p className="text-xs text-gray-600">EVM output type:</p>
                            <p className="text-xs font-medium">{stateData[key]}</p>
                          </div>
                        )}
                      </div>
                      {!hasMatch && (
                        <p className="text-xs text-red-600 mt-1">
                          Missing matching EVM output
                        </p>
                      )}
                      {hasMatch && !isCompatible && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Type mismatch - check compatibility
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-700">Memo (Optional)</Label>
              <Input
                {...register('memo')}
                className={errors.memo ? 'border-red-500 focus:ring-red-200' : ''}
                placeholder="Add a note about this configuration"
              />
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={
          !isConnected ||
          isSubmitting ||
          !!wasmError ||
          mismatches.length > 0 ||
          !canSubmit(getWasmConfigCount())
        }
        className="w-full text-white"
      >
        {getSubmitButtonText('wasm')}
      </Button>
    </form>
  );
}
