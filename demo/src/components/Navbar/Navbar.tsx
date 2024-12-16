'use client';
import React from 'react';
import { useWallet } from '../../hooks/useWallets';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaUserCircle } from 'react-icons/fa';
import { useDarkMode } from '@/hooks/useDarkMode';
import { FiMoon, FiSun } from 'react-icons/fi';
import Image from 'next/image';

const Navbar: React.FC = () => {
  const wallet = useWallet();
  const isConnected = wallet?.isConnected;
  const connect = wallet?.connect;
  const disconnect = wallet?.disconnect;
  const accountInfo = wallet?.accountInfo;
  const { darkMode, setDarkMode } = useDarkMode();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <nav className='bg-gradient-to-r from-primary to-primary/80 dark:from-gray-800 dark:to-gray-900 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center'>
            <div className='flex-shrink-0 flex items-center space-x-2'>
              <Image
                src='/logo.png'
                alt='HPM Logo'
                width={32}
                height={32}
                className='object-contain'
              />
              <h1 className='text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 dark:from-blue-400 dark:to-blue-200 transition-all duration-300 hover:scale-105'>
                HCS-7 ToolKit
              </h1>
            </div>
            <div className='hidden md:block'>
              <div className='ml-10 flex items-baseline space-x-4'>
                <a
                  href='/'
                  className='text-white hover:bg-primary/80 dark:hover:bg-gray-700 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium'
                >
                  Home
                </a>
                <a
                  href='https://kiloscribe.com/inscribe'
                  className='text-white hover:bg-primary/80 dark:hover:bg-gray-700 hover:bg-opacity-75 px-3 py-2 rounded-md text-sm font-medium'
                >
                  Inscribe NFTs
                </a>
              </div>
            </div>
          </div>
          <div className='hidden md:flex items-center'>
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='bg-white dark:bg-gray-700 text-primary dark:text-white hover:bg-blue-50 dark:hover:bg-gray-600'
                  >
                    <FaUserCircle className='mr-2 h-5 w-5' />
                    <span>{accountInfo?.accountId}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={disconnect}>
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={connect}
                className='bg-white dark:bg-gray-700 text-primary dark:text-white hover:bg-blue-50 dark:hover:bg-gray-600'
              >
                Connect Wallet
              </Button>
            )}
            <button
              onClick={toggleDarkMode}
              className='ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            >
              {darkMode ? <FiSun className='text-yellow-400' /> : <FiMoon />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
