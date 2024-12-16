'use client';
import { useCallback, useState } from 'react';
import { useTransaction } from './useTransaction';
import { Transaction } from '@hashgraph/sdk';
import { useWallet } from './useWallets';
import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';

export const useSendTransaction = () => {
  const walletContext = useWallet();
  const currentNetwork = walletContext?.accountInfo?.network;
  const sdk = walletContext?.sdk as HashinalsWalletConnectSDK;

  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const { transaction } = useTransaction(txId, currentNetwork);

  const sendTx = useCallback(
    async (bytes: Uint8Array, useSigner: boolean = false) => {
      try {
        const buffer = Buffer.from(bytes, 'base64');
        var tx = Transaction.fromBytes(buffer);

        let transactionId = tx?.transactionId?.toString();
 

        if (transactionId) {
          const txParts = transactionId?.toString()?.split('@');
          const actualMessageTxHash = `${txParts[0]}-${txParts[1].replace(
            '.',
            '-'
          )}`;
          setTxId(actualMessageTxHash);
        }

        const txRequest = await sdk?.executeTransactionWithErrorHandling(
          tx,
          useSigner
        );



        if (txRequest?.error) {
          console.error('transaction error', txRequest?.error);
          setError(txRequest?.error);
          return null;
        }

        transactionId = tx?.transactionId?.toString();

        const txParts = transactionId?.toString()?.split('@');
        const actualMessageTxHash = `${txParts[0]}-${txParts[1].replace(
          '.',
          '-'
        )}`;
        setTxId(actualMessageTxHash);

        return txRequest;
      } catch (e) {
        const error = e as Error;
        console.error('failed to process transaction', error);
        setError(error.message);
        return null;
      }
    },
    [sdk]
  );

  return {
    error,
    sendTx,
    setError,
    txId,
    setTxId,
    transaction,
    currentNetwork,
  };
};
