import type { HybridObject } from 'react-native-nitro-modules';
import type { Frame } from 'react-native-vision-camera';

export interface CropResult {
  base64?: string;
  path?: string;
}

export interface CropRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CropConfig {
  cropRegion?: CropRegion;
  includeImageBase64?: boolean;
  saveAsFile?: boolean;
}

export interface VisionCameraCropper
  extends HybridObject<{
    ios: 'swift';
    android: 'kotlin';
  }> {
  rotateImage(base64: string, degree: number): string;
  cropFrame(frame: Frame, options: CropConfig): CropResult;
}

// export default TurboModuleRegistry.getEnforcing<VisionCameraCropper>(
//   'VisionCameraCropper'
// );
