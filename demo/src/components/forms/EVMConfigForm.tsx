import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { isLaunchPageContract } from '@/utils/launchpage';
import { launchpageABI } from '@/utils/launchpage-abi';
import { chainlinkABI } from '@/utils/chainlink-abi';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";

const CONTRACT_OPTIONS = [
  {
    address: '0x9b2c05c0d15586a9a954bf1ef66c8640b854f986',
    label: 'LaunchPage Smart Contract',
    type: 'launchpage'
  },
  {
    address: '0x058fE79CB5775d4b167920Ca6036B824805A9ABd',
    label: 'ChainLink BTC / USD',
    type: 'chainlink'
  },
  {
    address: '0xdA2aBF7C90aDC73CDF5cA8d720B87bD5F5863389',
    label: 'ChainLink DAI / USD',
    type: 'chainlink'
  },
  {
    address: '0xb9d461e0b962A219866aDfA7DD19C52bB9871b9',
    label: 'ChainLink ETH / USD',
    type: 'chainlink'
  },
  {
    address: '0x59bC155EB6c6C415fE43255aF66EcF0523c92B4a',
    label: 'ChainLink HBAR / USD',
    type: 'chainlink'
  },
  {
    address: '0xF111b70231E89D69eBC9f6C9208e9890383Ef432',
    label: 'ChainLink LINK / USD',
    type: 'chainlink'
  },
  {
    address: '0xb632a7e7e02d76c0Ce99d9C62c7a2d1B5F92B6B5',
    label: 'ChainLink USDC / USD',
    type: 'chainlink'
  },
  {
    address: '0x06823de8E77d708C4cB72Cbf04495D67afF4Bd37',
    label: 'ChainLink USDT / USD',
    type: 'chainlink'
  }
];

const formStyles = {
  formGroup: `mb-4`,
};

interface EVMConfigFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isConnected: boolean;
  isSubmitting: boolean;
  getEvmConfigCount: () => number;
  isEvmConfigDuplicate: (contractAddress: string, functionName: string) => boolean;
  getSubmitButtonText: (type: 'evm' | 'wasm' | 'hcs1') => string;
  watch: any;
}

export function EVMConfigForm({
  onSubmit,
  defaultValues,
  isConnected,
  isSubmitting,
  getEvmConfigCount,
  isEvmConfigDuplicate,
  getSubmitButtonText,
  watch: parentWatch,
}: EVMConfigFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      ...defaultValues,
      contractAddressSelect: defaultValues?.contractAddress || CONTRACT_OPTIONS[0].address,
      contractAddress: defaultValues?.contractAddress || CONTRACT_OPTIONS[0].address
    },
    mode: 'onChange',
  });

  const [isLaunchPage, setIsLaunchPage] = useState(false);
  const [functionNames, setFunctionNames] = useState<string[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<any>(null);

  const contractAddress = watch('contractAddress');
  const functionName = watch('functionName');
  const contractAddressSelect = watch('contractAddressSelect');

  const isPredeterminedContract = contractAddressSelect !== 'custom';

  useEffect(() => {
    // If defaultValues has a contract address that's not in our options, set to custom
    if (defaultValues?.contractAddress && !CONTRACT_OPTIONS.find(opt => opt.address === defaultValues.contractAddress)) {
      setValue('contractAddressSelect', 'custom');
    }
  }, [defaultValues, setValue]);

  useEffect(() => {
    const checkContract = async () => {
      setIsLaunchPage(false);
      setFunctionNames([]);
      setValue('functionName', ''); // Clear function name when address changes

      if (contractAddress) {
        // First check if it's a LaunchPage contract
        const isLP = await isLaunchPageContract(contractAddress);
        setIsLaunchPage(isLP);
        
        if (isLP) {
          const viewFunctions = launchpageABI
            .filter(item => 
              item.type === 'function' && 
              item.stateMutability === 'view' &&
              item.outputs?.length === 1 && // Must have exactly one output
              (!item.inputs || item.inputs.length === 0) // Must have no inputs
            )
            .map(item => item.name);
          setFunctionNames(viewFunctions);
        } else {
          // If not a LaunchPage contract, check if it's a known Chainlink contract
          const selectedOption = CONTRACT_OPTIONS.find(opt => opt.address === contractAddress);
          if (selectedOption?.type === 'chainlink') {
            const viewFunctions = chainlinkABI
              .filter(item => 
                item.type === 'function' && 
                item.stateMutability === 'view' &&
                (!item.inputs || item.inputs.length === 0) // Must have no inputs
              )
              .map(item => item.name);
            setFunctionNames(viewFunctions);
          }
        }
      }
    };
    checkContract();
  }, [contractAddress, setValue]);

  useEffect(() => {
    if (functionName) {
      if (isLaunchPage) {
        const funcDef = launchpageABI.find(item => 
          item.type === 'function' && item.name === functionName
        );
        setSelectedFunction(funcDef);
        if (funcDef && funcDef.outputs?.[0]) {
          setValue('outputType', funcDef.outputs[0].type);
          setValue('outputName', funcDef.outputs[0].name || funcDef.name);
        }
      } else {
        const selectedOption = CONTRACT_OPTIONS.find(opt => opt.address === contractAddress);
        if (selectedOption?.type === 'chainlink') {
          const funcDef = chainlinkABI.find(item => 
            item.type === 'function' && item.name === functionName
          );
          setSelectedFunction(funcDef);
          if (funcDef && funcDef.outputs?.[0]) {
            setValue('outputType', funcDef.outputs[0].type);
            setValue('outputName', funcDef.outputs[0].name || funcDef.name);
          }
        }
      }
    }
  }, [functionName, isLaunchPage, contractAddress, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-purple-800">
            EVM configurations allow you to read state from any EVM-compatible smart contract.
            The contract method must be view-only and return a single value. This is useful for
            creating dynamic Hashinals that change based on on-chain state like token balances,
            NFT mints, or price thresholds.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div className={formStyles.formGroup}>
            <Label className="text-sm font-medium text-gray-700">Contract Address</Label>
            <div className="flex flex-col space-y-2">
              <Select
                onValueChange={(value) => {
                  setValue('contractAddressSelect', value);
                  if (value === 'custom') {
                    setValue('contractAddress', '');
                  } else {
                    setValue('contractAddress', value);
                  }
                }}
                defaultValue={CONTRACT_OPTIONS[0].address}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contract" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_OPTIONS.map(option => (
                    <SelectItem key={option.address} value={option.address}>
                      {option.label} ({option.address})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Address</SelectItem>
                </SelectContent>
              </Select>
              
              {contractAddressSelect === 'custom' && (
                <Input
                  {...register('contractAddress', {
                    validate: (value) => {
                      if (!value) return 'Contract address is required';
                      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
                        return 'Must be a valid EVM address starting with 0x followed by 40 hexadecimal characters';
                      }
                      return true;
                    },
                    pattern: {
                      value: /^0x[a-fA-F0-9]*$/,
                      message: 'Address must start with 0x and contain only hexadecimal characters'
                    }
                  })}
                  className={errors.contractAddress ? 'border-red-500 focus:ring-red-200' : ''}
                  placeholder="0x..."
                />
              )}
            </div>
            {errors.contractAddress && (
              <p className="mt-1 text-sm text-red-500">
                {errors.contractAddress.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Select a predefined contract or enter a custom EVM contract address
            </p>
          </div>

          <div className={formStyles.formGroup}>
            <Label className="text-sm font-medium text-gray-700">Function Name</Label>
            {functionNames.length > 0 ? (
              <Select
                onValueChange={(value) => setValue('functionName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a function" />
                </SelectTrigger>
                <SelectContent>
                  {functionNames.map(name => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                {...register('functionName', { required: 'Function name is required' })}
                placeholder={isLaunchPage ? 'Loading functions...' : 'Enter function name'}
                className={errors.functionName ? 'border-red-500 focus:ring-red-200' : ''}
              />
            )}
            {errors.functionName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.functionName.message}
              </p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <Label className="text-sm font-medium text-gray-700">Output Type</Label>
            <Input
              {...register('outputType', { required: 'Output type is required' })}
              placeholder="uint256"
              disabled={isPredeterminedContract}
              className={errors.outputType ? 'border-red-500 focus:ring-red-200' : ''}
            />
            {errors.outputType && (
              <p className="mt-1 text-sm text-red-500">
                {errors.outputType.message}
              </p>
            )}
            {isPredeterminedContract && (
              <p className="mt-1 text-xs text-gray-500">
                Output type is automatically set for predetermined contracts
              </p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <Label className="text-sm font-medium text-gray-700">Output Name</Label>
            <Input
              {...register('outputName', { 
                required: 'Output name is required',
                pattern: {
                  value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                  message: 'Must be a valid variable name (letters, numbers, underscores)'
                }
              })}
              placeholder="supply"
              disabled={isPredeterminedContract}
              className={errors.outputName ? 'border-red-500 focus:ring-red-200' : ''}
            />
            {errors.outputName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.outputName.message}
              </p>
            )}
            {isPredeterminedContract && (
              <p className="mt-1 text-xs text-gray-500">
                Output name is automatically set for predetermined contracts
              </p>
            )}
          </div>

          <div className={formStyles.formGroup}>
            <Label className="text-sm font-medium text-gray-700">Memo</Label>
            <Input
              {...register('memo', { required: 'Memo is required' })}
              placeholder="Supply tracking configuration"
              className={errors.memo ? 'border-red-500 focus:ring-red-200' : ''}
            />
            {errors.memo && (
              <p className="mt-1 text-sm text-red-500">
                {errors.memo.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              A description of what this configuration does
            </p>
          </div>
        </div>
        <div className='flex justify-end'>
          <Button
            type='submit'
            disabled={
              !isConnected ||
              isSubmitting ||
              getEvmConfigCount() >= 3 ||
              isEvmConfigDuplicate(
                watch('contractAddress') || '',
                watch('functionName') || ''
              )
            }
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isConnected &&
              !isSubmitting &&
              getEvmConfigCount() < 3 &&
              !isEvmConfigDuplicate(
                watch('contractAddress') || '',
                watch('functionName') || ''
              )
                ? 'bg-[#6100ff] hover:bg-[#5000d9]'
                : 'bg-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6100ff]`}
          >
            {isSubmitting ? 'Submitting...' : getSubmitButtonText('evm')}
          </Button>
        </div>
      </div>
    </form>
  );
}
