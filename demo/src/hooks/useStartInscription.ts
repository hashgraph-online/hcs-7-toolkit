import { useEffect, useState, useCallback } from 'react';
import { useSendTransaction } from './useSendTransaction';
import { useWallet } from './useWallets';
import { Job } from '@/components/Upload/Job';

export interface PostData {
  network: string;
  fileName: string;
  holderId: string;
  ttl: number;
  mode: string;
  creator: string;
  description: string;
  fileStandard: string;
  onlyJSONCollection: number;
  fileURL: string;
  jsonFileURL: string;
}

const useStartInscription = (
  network: string = 'mainnet',
  onSuccess: (inscribeJob: Job) => void
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [inscriptionReady, setInscriptionReady] = useState<boolean>(false);
  const [inscriptionStatus, setInscriptionStatus] = useState<string | null>(
    null
  );
  const [inscription, setInscription] = useState<Job | null>(null);

  const { sendTx, error, setError, transaction } = useSendTransaction();

  const [transactionId, setTransactionId] = useState<string | null>(null);

  const clear = useCallback(() => {
    setTransactionId(null);
    setError(null);
    setInscription(null);
    setInscriptionStatus(null);
    setInscriptionReady(false);
  }, [])

  useEffect(() => {
    const storedTransactionId = localStorage.getItem('lastTransactionId');
    if (storedTransactionId) {
      setTransactionId(storedTransactionId);
    }
  }, []);

  useEffect(() => {
    if (transaction?.transaction_id) {
      setTransactionId(transaction.transaction_id);
      localStorage.setItem('lastTransactionId', transaction.transaction_id);
    }
  }, [transaction]);

  const walletContext = useWallet();
  const accountId = walletContext?.accountInfo?.accountId;

  const retrieveInscriptionStatus = useCallback(async () => {
    if (!transactionId || !accountId) return;

    try {
      const response = await fetch(
        `/api/inscribe/retrieve?id=${transactionId}&accountId=${accountId}`
      );
      if (!response.ok) {
        throw new Error('Failed to retrieve inscription status');
      }
      const data = await response.json();

      setInscriptionStatus(data.status);
      setInscription(data);
      if (data.status === 'completed') {
        setInscriptionReady(true);
        onSuccess(data);
      }
    } catch (error) {
      console.error('Error retrieving inscription status:', error);
    }
  }, [transactionId, accountId, onSuccess]);

  useEffect(() => {
    if (!transactionId) return;

    const pollInterval = setInterval(() => {
      retrieveInscriptionStatus();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [transactionId, retrieveInscriptionStatus]);

  const postTransaction = async (data: PostData) => {
    setLoading(true);
    setError(null);

    try {
      const inscriptionResponse = await fetch('/api/inscribe/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          accountId,
          network,
        }),
      });

      const result = await inscriptionResponse.json();
      if (inscriptionResponse.ok) {
        const bytes = result.transactionBytes;
        const currentTxId = result.tx_id;
        const signedTransactionId = await sendTx(bytes, true);

        if (!signedTransactionId) {
          setLoading(false);
          setError(`Payment not processed for ${currentTxId}`);
          return;
        }

        localStorage.setItem('lastTransactionId', currentTxId);
        setTransactionId(currentTxId);

        retrieveInscriptionStatus();
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (e) {
      const error = e as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    transaction,
    loading,
    error,
    postTransaction,
    transactionId,
    inscriptionReady,
    inscriptionStatus,
    inscription,
    setInscription,
    clear
  };
};

export default useStartInscription;
