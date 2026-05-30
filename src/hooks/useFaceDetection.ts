import { useEffect, useState, useRef } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { runAsync, Worklets } from 'react-native-worklets';

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

  const { detectFaces, stopListeners } = useFaceDetector();

  useEffect(() => {
    return () => {
      stopListeners();
    };
  }, [stopListeners]);

  const handleDetectedFaces = Worklets.createRunOnJS((faces: any[]) => {
    if (faces && faces.length > 0) {
      const face = faces[0];
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
  });

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!isActive) return;

      runAsync(frame, () => {
        'worklet';
        const faces = detectFaces(frame);
        handleDetectedFaces(faces);
      });
    },
    [isActive, detectFaces, handleDetectedFaces]
  );

  return { faceData, frameProcessor };
};