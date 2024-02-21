import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

export default function App() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive,setIsActive] = useState(true);
  const device = useCameraDevice("back");

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
