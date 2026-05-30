import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useInternetConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [wasDisconnected, setWasDisconnected] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const currentlyConnected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(currentlyConnected);
      
      if (!currentlyConnected) {
        setWasDisconnected(true);
      }
    });

    NetInfo.fetch().then(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, wasDisconnected };
}