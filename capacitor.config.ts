import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextwatch.app',
  appName: 'NextWatch',
  webDir: 'build', // ✅ This is the React build folder
  bundledWebRuntime: false
};

export default config;
