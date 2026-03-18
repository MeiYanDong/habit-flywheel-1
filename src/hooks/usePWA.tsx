import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export interface PWAStatus {
  isOffline: boolean;
  needRefresh: boolean;
  offlineReady: boolean;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
}

export const usePWA = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  // 使用 vite-plugin-pwa 的 registerSW
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
    onOfflineReady() {
      console.log('App ready to work offline');
      setOfflineReady(true);
    },
    onNeedRefresh() {
      console.log('New content available, click on reload button to update');
      setNeedRefresh(true);
    },
  });

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 检查是否在PWA模式下运行
  useEffect(() => {
    const checkInstalled = () => {
      // 检查是否在standalone模式下运行
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // 检查iOS Safari的standalone模式
      if ((window.navigator as NavigatorWithStandalone).standalone === true) {
        setIsInstalled(true);
        return;
      }
      
      // 检查是否从主屏幕启动（Android/Chrome）
      if (window.matchMedia('(display-mode: fullscreen)').matches) {
        setIsInstalled(true);
        return;
      }
    };

    checkInstalled();
  }, []);

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const status: PWAStatus = {
    isOffline,
    needRefresh,
    offlineReady,
    isInstalled,
    isUpdateAvailable: needRefresh,
  };

  return {
    status,
    updateServiceWorker,
    closePrompt,
  };
}; 
