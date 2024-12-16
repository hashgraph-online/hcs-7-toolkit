import { useEffect, useState } from 'react';

export interface HederaTXResponse {
  transactions: Transaction[];
}

export interface NftTransfer {
  is_approval: boolean;
  receiver_account_id: string;
  sender_account_id: null;
  serial_number: number;
  token_id: string;
}

export interface Transfer {
  account: string;
  amount: number;
  is_approval: boolean;
}

export interface TokenTransfer {
  account: string;
  amount: number;
  is_approval: boolean;
  token_id: string;
}

export interface Transaction {
  bytes: null;
  charged_tx_fee: number;
  consensus_timestamp: string;
  entity_id: string;
  max_fee: string;
  memo_base64: string;
  name: string;
  node: null | string;
  nonce: number;
  parent_consensus_timestamp: null | string;
  result: string;
  scheduled: boolean;
  transaction_hash: string;
  transaction_id: string;
  transfers: Transfer[];
  token_transfers: TokenTransfer[];
  valid_duration_seconds: null | string;
  valid_start_timestamp: string;
  nft_transfers?: NftTransfer[];
}

export const viewTX = async (
  txId: string,
  network: string = 'mainnet-public'
): Promise<HederaTXResponse | null> => {
  try {
    const actualNetwork =
      // @ts-ignore
      network === 'mainnet' || network === 'mainnet-public'
        ? 'mainnet-public'
        : 'testnet';
    const URL = `https://${actualNetwork}.mirrornode.hedera.com/api/v1/transactions/${txId}`;

    const request = await fetch(URL);

    const response = (await request.json()) as HederaTXResponse;

    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const useTransaction = (
  txId?: string | null,
  network: string = 'mainnet-public'
) => {
  const [transaction, setTransaction] = useState<
    Transaction | null | undefined
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchTransaction = async () => {
      if (!Boolean(txId?.length) || Boolean(transaction?.result)) {
        return;
      }
      setLoading(true);
      try {
        if (!txId) {
          return;
        }
        const response = await viewTX(txId, network);
        const tx = response?.transactions?.[0];
        if (Boolean(tx)) {
          setTransaction(tx);
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error('Error fetching transaction:', err);
        setError('Failed to fetch transaction');
      } finally {
        setLoading(false);
      }
    };

    intervalId = setInterval(fetchTransaction, 1000); // Poll every 5 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [txId, network, transaction?.result]);

  return { transaction, loading, error };
};
