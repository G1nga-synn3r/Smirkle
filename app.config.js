export default ({ config }) => ({
  ...config,
  name: 'Smirkle',
  slug: 'smirkle',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.gingasynner.smirkle'
  },
  android: {
    package: 'com.gingasynner.smirkle',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png'
    },
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE'
    ]
  },
  plugins: [
    'expo-camera',
    'expo-face-detector'
  ],
  extra: {
    eas: {
      projectId: 'aac33832-383b-4727-bdcf-b94171e82679'
    }
  }
});