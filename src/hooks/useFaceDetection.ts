import { useEffect, useState } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import {
  detectFaces,
  type FaceDetectionResult,
} from 'react-native-vision-camera-face-detector';

export interface FaceDetectionData {
  faceDetected: boolean;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  smilingProbability: number;
}

export const useFaceDetection = (isActive: boolean) => {
  const [faceData, setFaceData] = useState<FaceDetectionData>({
    faceDetected: false,
    leftEyeOpenProbability: 0,
    rightEyeOpenProbability: 0,
    smilingProbability: 0,
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!isActive) return;

      const faces = detectFaces(frame);

      runOnJS(() => {
        if (faces.length > 0) {
          const face = faces[0]; // Take the first face
          setFaceData({
            faceDetected: true,
            leftEyeOpenProbability: face.leftEyeOpenProbability ?? 0,
            rightEyeOpenProbability: face.rightEyeOpenProbability ?? 0,
            smilingProbability: face.smilingProbability ?? 0,
          });
        } else {
          setFaceData({
            faceDetected: false,
            leftEyeOpenProbability: 0,
            rightEyeOpenProbability: 0,
            smilingProbability: 0,
          });
        }
      })();
    },
    [isActive]
  );

  return { faceData, frameProcessor };
};