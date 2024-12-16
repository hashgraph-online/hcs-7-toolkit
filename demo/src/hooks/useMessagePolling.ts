import { useState, useEffect, useRef } from 'react';
import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';

export function useMessagePolling(
  sdk: HashinalsWalletConnectSDK | null,
  isConnected: boolean,
  topicId: string | undefined
) {
  const [messages, setMessages] = useState<any[]>([]);
  const isPollingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!sdk?.getMessages || !topicId || !isConnected || isPollingRef.current) {
        return;
      }

      try {
        isPollingRef.current = true;
        const result = await sdk.getMessages(topicId);
        if (result?.messages) {
          setMessages(result.messages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        isPollingRef.current = false;
      }
    };

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set up polling if we have all required dependencies
    if (isConnected && sdk?.getMessages && topicId) {
      fetchMessages(); // Initial fetch
      intervalRef.current = setInterval(fetchMessages, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sdk, isConnected, topicId]); // Simplified dependencies

  return messages;
}
