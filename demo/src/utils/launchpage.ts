export const bytecodes = ["0x6080604052600a805460ff19908116909155601880549091169055348015610025575f5ffd5b506040516151fa3803806151fa83398101604081905261004491610585565b5f8054600"]

interface ContractInfo {
  bytecode: string;
  // Add other fields as needed
}

// Check if a contract is a LaunchPage contract by its bytecode
export const isLaunchPageContract = async (contractId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/contracts/${contractId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contract info: ${response.statusText}`);
    }

    const contractInfo: ContractInfo = await response.json();
    return bytecodes.some(bytecode => 
      contractInfo.bytecode && contractInfo.bytecode.startsWith(bytecode)
    );
  } catch (error) {
    console.error('Error checking LaunchPage contract:', error);
    return false;
  }
};