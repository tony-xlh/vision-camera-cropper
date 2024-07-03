#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VisionCameraCropper, NSObject)

RCT_EXTERN_METHOD(rotateImage:(NSString)base64 degree:(float)degree
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
