import type { VisionCameraCropper } from './specs/VisionCameraCropper.nitro';
import { NitroModules } from 'react-native-nitro-modules';

export * from './specs/VisionCameraCropper.nitro';

let plugin: VisionCameraCropper =
  NitroModules.createHybridObject<VisionCameraCropper>('VisionCameraCropper');

export const crop: VisionCameraCropper['cropFrame'] = (frame, options) => {
  'worklet';

  return plugin.cropFrame(frame, options);
};

export const rotateImage: VisionCameraCropper['rotateImage'] = (
  image,
  options
) => {
  'worklet';

  return plugin.rotateImage(image, options);
};
