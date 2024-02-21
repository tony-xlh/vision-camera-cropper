import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';
import { crop } from 'vision-camera-cropper';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive,setIsActive] = useState(true);
  const taken = useSharedValue(false);

  const device = useCameraDevice("back");

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    console.log("detect frame");
    console.log(frame.toString());
    if (taken.value == false) {
      const result = crop(frame,{includeImageBase64:true});
      console.log(result);
      taken.value = true;
    }
  }, [])

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      setIsActive(true);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {device != null &&
      hasPermission && (
      <>
          <Camera
            style={StyleSheet.absoluteFill}
            isActive={isActive}
            device={device}
            frameProcessor={frameProcessor}
            pixelFormat='yuv'
          />
      </>)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
