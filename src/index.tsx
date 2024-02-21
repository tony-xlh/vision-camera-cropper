import { NativeModules, Platform } from 'react-native';
import { VisionCameraProxy, type Frame } from 'react-native-vision-camera';

const LINKING_ERROR =
  `The package 'vision-camera-cropper' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const VisionCameraCropper = NativeModules.VisionCameraCropper
  ? NativeModules.VisionCameraCropper
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const plugin = VisionCameraProxy.initFrameProcessorPlugin('crop');

export function multiply(a: number, b: number): Promise<number> {
  return VisionCameraCropper.multiply(a, b);
}

/**
 * Crop
 */
export function crop(frame: Frame): any {
  'worklet'
  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin "crop"!')
  return plugin.call(frame) as any;
}