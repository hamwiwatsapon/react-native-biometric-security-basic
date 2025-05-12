import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV({
  id: 'UserInactivity',
})

const LOCK_TIME = 3000;

export const UserInactivityProvider = ({ children }: any) => {
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [])

  const handleAppStateChange = (nextAppState: any) => {
    console.log('AppState', appState.current, nextAppState);
    // if (nextAppState === 'inactive') {
    //   router.push('/(modals)/white');
    // } else if (router.canGoBack()) {
    //   router.back();
    // }

    if (nextAppState === 'background') {
      recordStartTime();
    } else if (nextAppState === 'active' && appState.current.match(/background/)) {
      const elapsedTime = Date.now() - (storage.getNumber('startTime') ?? 0);
      if (elapsedTime >= LOCK_TIME) {
        router.push('/(modals)/lock');
      } else if (router.canGoBack()) {
        router.back();
      }
    }

    appState.current = nextAppState;
  };

  const recordStartTime = () => {
    const currentTime = Date.now();
    storage.set('startTime', currentTime);
  }

  return children
}