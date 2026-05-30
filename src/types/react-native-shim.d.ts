import 'react-native';

declare module 'react-native' {
  interface StyleSheet {
    static absoluteFill: {
      position: 'absolute';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    };
    static absoluteFillObject: {
      position: 'absolute';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    };
  }
}