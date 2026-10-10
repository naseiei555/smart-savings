import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartsavings.companion',
  appName: 'Smart Savings',
  webDir: 'dist/frontend/browser',
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
