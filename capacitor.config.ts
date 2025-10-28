import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'DOCU',
  webDir: 'www',
  plugins: {
    LocalNotifications: {
      iconColor: '#488AFF',
      sound: 'beep.wav',
      smallIcon: 'ic_stat_icon_config_sample',
    }
  }
};

export default config;
