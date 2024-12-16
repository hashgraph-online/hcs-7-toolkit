'use client';
import { useContext } from 'react';
import { WalletContext, WalletContextType } from '@/context/WalletContext';

export const useWallet = (): WalletContextType | undefined => {
  const context = useContext(WalletContext);

  return context;
};
