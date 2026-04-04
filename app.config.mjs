export default ({ config }) => ({
  ...config,
  expo: {
    name: 'Smirkle',
    slug: 'Smirkle',
    version: '1.0.0',
    orientation: 'portrait',
    icon: import('./assets/icon.png'),
    userInterfaceStyle: 'dark',
    splash: {
      image: import('./assets/splash-icon.png'),
      resizeMode: 'contain',
      backgroundColor: '#0a0a0a',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gingervaile.Smirkle',
      infoPlist: {
        NSCameraUsageDescription: 'Allow Smirkle to access your camera for gameplay and video processing.',
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0a0a0a',
        foregroundImage: import('./assets/android-icon-foreground.png'),
        backgroundImage: import('./assets/android-icon-background.png'),
        monochromeImage: import('./assets/android-icon-monochrome.png'),
      },
      package: 'com.gingervaile.Smirkle',
      permissions: ['CAMERA'],
    },
    web: {
      favicon: import('./assets/favicon.png'),
    },
    plugins: [
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: 'Allow Smirkle to access your camera for real-time face detection during gameplay.',
          microphonePermissionText: 'Allow Smirkle to access microphone for potential gameplay features.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Allow Smirkle to access your camera to detect smiles and smirks during gameplay.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: 'aac33832-383b-4727-bdcf-b94171e82679',
      },
    },
  },
});