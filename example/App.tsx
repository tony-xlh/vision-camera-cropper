import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Dimensions,
  Pressable,
  View,
  Modal,
  Text,
  Image,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameOutput,
} from 'react-native-vision-camera';
import { type CropRegion, crop, rotateImage } from 'vision-camera-cropper';
import { Svg, Rect, Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useSharedValue } from 'react-native-reanimated';

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();

  const [imageData, setImageData] = useState<undefined | string>(undefined);
  const [frameWidth, setFrameWidth] = useState(1280);
  const [frameHeight, setFrameHeight] = useState(720);
  const [cropRegion, setCropRegion] = useState({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
  });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  const cropRegionShared = useSharedValue<undefined | CropRegion>(undefined);
  const frameWidthShared = useSharedValue(1280);
  const frameHeightShared = useSharedValue(720);
  const taken = useSharedValue(false);
  const shouldTake = useSharedValue(false);
  const [pressed, setPressed] = useState(false);
  const [switchPressed, setSwitchPressed] = useState(false);
  const [isFront, setIsFront] = useState(false);
  const back = useCameraDevice('back');
  const front = useCameraDevice('front');

  const updateFrameSize = (
    width: number,
    height: number,
    frameOrientation: 'portrait' | 'landscape'
  ) => {
    if (
      width !== frameWidthShared.value &&
      height !== frameHeightShared.value
    ) {
      frameWidthShared.value = width;
      frameHeightShared.value = height;
      setFrameWidth(width);
      setFrameHeight(height);
      setOrientation(frameOrientation);

      if (frameOrientation === 'portrait') {
        updateCropRegion({ width: height, height: width });
      } else {
        updateCropRegion({ width: width, height: height });
      }
    }
  };

  const updateCropRegion = (size?: { width: number; height: number }) => {
    if (!size) {
      size = getFrameSize();
    }

    let region;

    if (size.width > size.height) {
      let regionWidth = 0.7 * size.width;
      let desiredRegionHeight = regionWidth / (85.6 / 54);
      let height = Math.ceil((desiredRegionHeight / size.height) * 100);
      region = { left: 15, width: 70, top: 10, height: height };
    } else {
      let regionWidth = 0.8 * size.width;
      let desiredRegionHeight = regionWidth / (85.6 / 54);
      let height = Math.ceil((desiredRegionHeight / size.height) * 100);
      region = { left: 10, width: 80, top: 20, height: height };
    }

    setCropRegion(region);
    cropRegionShared.value = region;
  };

  const frameOutput = useFrameOutput({
    pixelFormat: 'yuv',
    onFrame: (frame) => {
      'worklet';

      scheduleOnRN(
        updateFrameSize,
        frame.width,
        frame.height,
        frame.orientation === 'left' || frame.orientation === 'right'
          ? 'portrait'
          : 'landscape'
      );

      if (
        taken.value === false &&
        shouldTake.value === true &&
        cropRegionShared.value !== undefined
      ) {
        const result = crop(frame, {
          cropRegion: cropRegionShared.value,
          includeImageBase64: true,
          saveAsFile: true,
        });
        console.log({ path: result.path });
        if (result.base64) {
          scheduleOnRN(setImageData, 'data:image/jpeg;base64,' + result.base64);
          taken.value = true;
        }
        shouldTake.value = false;
      }

      frame.dispose();
    },
  });

  useEffect(() => {
    if (hasPermission) return;
    requestPermission();
    updateCropRegion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateCropRegion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameWidth, frameHeight]);

  const getViewBox = () => {
    const frameSize = getFrameSize();
    const viewBox = '0 0 ' + frameSize.width + ' ' + frameSize.height;
    return viewBox;
  };

  const getFrameSize = (): { width: number; height: number } => {
    let width: number, height: number;

    if (orientation === 'portrait') {
      width = frameHeight;
      height = frameWidth;
    } else {
      width = frameWidth;
      height = frameHeight;
    }
    return { width: width, height: height };
  };

  const renderImage = () => {
    if (imageData !== undefined) {
      return (
        <Image
          style={styles.srcImage}
          resizeMode="contain"
          source={{ uri: imageData }}
        />
      );
    }
    return null;
  };

  const rotateTakenImage = async () => {
    if (imageData) {
      let rotated = await rotateImage(removeDataURLHead(imageData), 90);
      setImageData('data:image/jpeg;base64,' + rotated);
    }
  };

  const removeDataURLHead = (dataURL: string) => {
    return dataURL.substring(dataURL.indexOf(',') + 1, dataURL.length);
  };

  return (
    <SafeAreaView style={styles.container}>
      {back != null && front != null && hasPermission && (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            isActive={hasPermission}
            device={isFront ? front : back}
            outputs={[frameOutput]}
            orientationSource="interface"
          />
          <Svg
            preserveAspectRatio={
              Platform.OS === 'android' ? 'xMidYMid slice' : ''
            }
            style={StyleSheet.absoluteFill}
            viewBox={getViewBox()}
          >
            <Rect
              x={(cropRegion.left / 100) * getFrameSize().width}
              y={(cropRegion.top / 100) * getFrameSize().height}
              width={(cropRegion.width / 100) * getFrameSize().width}
              height={(cropRegion.height / 100) * getFrameSize().height}
              strokeWidth={4}
              stroke="red"
              fillOpacity={0.0}
            />
          </Svg>
          <View style={styles.control}>
            <Svg viewBox={'0 0 24 24'} style={styles.shutter}>
              <Circle x={12} y={12} r={12} fill="gray" />
              <Circle
                x={12}
                y={12}
                r={10}
                fill={pressed ? 'gray' : 'white'}
                onPressIn={() => setPressed(true)}
                onPressOut={() => {
                  setPressed(false);
                  shouldTake.value = true;
                }}
              />
            </Svg>
          </View>
          <Svg
            style={styles.camera}
            viewBox="0 0 24 24"
            onPressIn={() => setSwitchPressed(true)}
            onPressOut={() => {
              setSwitchPressed(false);
              setIsFront(!isFront);
            }}
          >
            <Path
              fill={switchPressed ? 'gray' : 'white'}
              d="M21 6h-1.5a.5.5 0 0 1-.5-.5A1.502 1.502 0 0 0 17.5 4h-6A1.502 1.502 0 0 0 10 5.5a.5.5 0 0 1-.5.5H8V5H4v1H3a2.002 2.002 0 0 0-2 2v10a2.002 2.002 0 0 0 2 2h18a2.002 2.002 0 0 0 2-2V8a2.002 2.002 0 0 0-2-2zm1 12a1.001 1.001 0 0 1-1 1H3a1.001 1.001 0 0 1-1-1V8a1.001 1.001 0 0 1 1-1h2V6h2v1h2.5A1.502 1.502 0 0 0 11 5.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5A1.502 1.502 0 0 0 19.5 7H21a1.001 1.001 0 0 1 1 1zM8.2 13h-1a4.796 4.796 0 0 1 8.8-2.644V9h1v3h-3v-1h1.217A3.79 3.79 0 0 0 8.2 13zm7.6 0h1A4.796 4.796 0 0 1 8 15.644V17H7v-3h3v1H8.783a3.79 3.79 0 0 0 7.017-2z"
            />
            <Path fill="none" d="M0 0h24v24H0z" />
          </Svg>
          <Modal
            animationType="slide"
            transparent={true}
            visible={imageData !== undefined}
            supportedOrientations={['portrait', 'landscape']}
            onRequestClose={() => {
              setImageData(undefined);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {renderImage()}
                <View style={styles.buttonView}>
                  <Pressable
                    style={[styles.button, styles.buttonInModal]}
                    onPress={() => {
                      setImageData(undefined);
                      taken.value = false;
                    }}
                  >
                    <Text style={styles.textStyle}>Rescan</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonInModal]}
                    onPress={() => {
                      rotateTakenImage();
                    }}
                  >
                    <Text style={styles.textStyle}>Rotate</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const getWindowWidth = () => {
  return Dimensions.get('window').width;
};

const getWindowHeight = () => {
  return Dimensions.get('window').height;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: getWindowHeight() * 0.1,
    height: getWindowHeight() * 0.1,
  },
  camera: {
    position: 'absolute',
    left: 10,
    bottom: getWindowHeight() * 0.01,
    height: getWindowHeight() * 0.08,
    width: getWindowHeight() * 0.08,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  control: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    height: getWindowHeight() * 0.1,
    width: '100%',
    alignSelf: 'flex-start',
    borderColor: 'white',
    borderWidth: 0.1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonView: {
    flexDirection: 'row',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    margin: 5,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonInModal: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  srcImage: {
    width: getWindowWidth() * 0.7,
    height: getWindowHeight() * 0.7,
    resizeMode: 'contain',
  },
});
