export default ({ config }) => ({
  ...config,
  expo: {
    name: 'Smirkle',
    slug: 'Smirkle',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash_icon.png',
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
      package: 'com.gingervaile.Smirkle',
      permissions: ['CAMERA'],
      minSdkVersion: 28,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 26, // Even though you want 28, set this to 26 to satisfy the library requirement
          },
        },
      ],
      [
        'react-native-vision-camera',
        {
          cameraPermissionText: 'Allow Smirkle to access your camera...',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Allow Smirkle to access your camera...',
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