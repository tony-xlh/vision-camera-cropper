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

export function rotateImage(base64:string,degree:number): Promise<string> {
  return VisionCameraCropper.rotateImage(base64,degree);
}

/**
 * Crop
 */
export function crop(frame: Frame,config?:CropConfig): CropResult {
  'worklet'
  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin "crop"!')
  if (config) {
    let record:Record<string,any> = {};
    if (config.includeImageBase64 != undefined && config.includeImageBase64 != null) {
      record["includeImageBase64"] = config.includeImageBase64;
    }
    if (config.saveAsFile != undefined && config.saveAsFile != null) {
      record["saveAsFile"] = config.saveAsFile;
    }
    if (config.cropRegion) {
      let cropRegionRecord:Record<string,any> = {};
      cropRegionRecord["left"] = config.cropRegion.left;
      cropRegionRecord["top"] = config.cropRegion.top;
      cropRegionRecord["width"] = config.cropRegion.width;
      cropRegionRecord["height"] = config.cropRegion.height;
      record["cropRegion"] = cropRegionRecord;
    }
    return plugin.call(frame,record) as any;
  }else{
    return plugin.call(frame) as any;
  }
}

//the value is in percentage
export interface CropRegion{
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CropConfig{
  cropRegion?: CropRegion;
  includeImageBase64?: boolean;
  saveBitmap?: boolean;
  saveAsFile?: boolean;
}

export interface CropResult{
  base64?:string;
  path?:string;
}