'use client';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';
import { SessionTypes } from '@walletconnect/types';
import { LedgerId } from '@hashgraph/sdk';
import { network } from '@/constants/config';

export interface WalletContextType {
  sdk: HashinalsWalletConnectSDK | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isLoading: boolean;
  isConnected: boolean;
  accountInfo: {
    accountId: string;
    network: string;
    session: SessionTypes.Struct | null;
  } | null;
}

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

const PROJECT_ID = '55632c02cb971468424ae93c89366117';
const PROJECT_METADATA = {
  name: 'Hasgraph Online HCS-7 ToolKit',
  description: 'A Hashinals application using WalletConnect',
  url: 'https://hcs7.hashgraph.online',
  icons: ['https://hashgraphonline.com/assets/logo.png'],
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sdk, setSdk] = useState<HashinalsWalletConnectSDK | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<{
    accountId: string;
    network: string;
    session: SessionTypes.Struct | null;
  } | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      // Don't reinitialize if we already have an SDK
      if (sdk) return;

      setIsLoading(true);
      const ledger =
        network === 'testnet' ? LedgerId.TESTNET : LedgerId.MAINNET;
      const instance = HashinalsWalletConnectSDK.getInstance(
        undefined,
        network === 'testnet' ? LedgerId.TESTNET : LedgerId.MAINNET
      );

      instance.setNetwork(ledger);
      try {
        const accountResponse = await instance.initAccount(
          PROJECT_ID,
          PROJECT_METADATA
        );

        if (accountResponse && accountResponse.accountId) {
          setAccountInfo({
            accountId: accountResponse.accountId,
            network: network!,
            session: null,
          });
          setIsConnected(true);
        }
        setSdk(instance);
      } catch (error) {
        console.error('Error initializing SDK:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSDK();
  }, []); // Only run once on mount

  const connect = async () => {
    if (sdk) {
      try {
        const ledger =
          network === 'testnet' ? LedgerId.TESTNET : LedgerId.MAINNET;
        const { accountId, session } = await sdk.connectWallet(
          PROJECT_ID,
          PROJECT_METADATA,
          ledger
        );
        setIsConnected(true);
        setAccountInfo({
          accountId: accountId,
          network: network,
          session: session,
        });
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    }
  };

  const disconnect = async () => {
    if (sdk) {
      try {
        await sdk.disconnectWallet(true);
        setIsConnected(false);
        setAccountInfo(null);
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{ sdk, connect, disconnect, isConnected, accountInfo, isLoading }}
    >
      {children}
    </WalletContext.Provider>
  );
};
