import React, { useEffect } from 'react';
import { ClientApp } from './apps/client/ClientApp';
import { ManagerApp } from './apps/manager/ManagerApp';
import { useNexiaStore } from './store/useNexiaStore';
import { useLanguageStore } from './store/useLanguageStore';
import { useThemeStore } from './store/useThemeStore';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

export function App() {
  const { initializeData } = useNexiaStore();
  const { t } = useLanguageStore();
  const { initTheme } = useThemeStore();
  
  // Initialize store and check URL parameters on load
  useEffect(() => {
    initializeData();
    initTheme();

    // Auto-sync data when app comes back to foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        initializeData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Native App Initialization (Capacitor)
    if (Capacitor.isNativePlatform()) {
      const initNativeApp = async () => {
        try {
          const isDark = document.documentElement.classList.contains('dark');
          await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: isDark ? '#020617' : '#f8fafc' });
          }
          await SplashScreen.hide();
        } catch (e) {
          console.warn('Native plugin error:', e);
        }
      };
      initNativeApp();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeData, initTheme]);

  // If building a specific target via Vite build (for Capacitor APKs)
  const appTarget = import.meta.env.VITE_APP_TARGET;
  
  // Allow local preview testing via URL query (e.g. ?app=manager)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const queryTarget = urlParams.get('app');

  // Client / Resident Portal
  if (appTarget === 'resident' || queryTarget === 'resident' || queryTarget === 'client') {
    return <ClientApp standalone={true} />;
  }
  
  // Manager / SaaS Dashboard
  if (appTarget === 'manager' || queryTarget === 'manager') {
    return <ManagerApp standalone={true} />;
  }

  // Default Web Experience: Show the Nexia Manager SaaS Dashboard
  // We remove the dual-device preview in favor of a native responsive web app feeling.
  return <ManagerApp standalone={false} />;
}

export default App;
