//
//  CropperFrameProcessorPlugin.m
//  VisionCameraCropper
//
//  Created by xulihang on 2024/2/21.
//


#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>
#import <VisionCamera/Frame.h>
#import "VisionCameraCropper-Swift.h"
#import "VisionCameraCropper-Bridging-Header.h"

@interface CropperFrameProcessorPlugin (FrameProcessorPluginLoader)
@end

@implementation CropperFrameProcessorPlugin (FrameProcessorPluginLoader)

+ (void)load
{
    [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"crop"
                                        withInitializer:^FrameProcessorPlugin* (VisionCameraProxyHolder* proxy, NSDictionary* options) {
        return [[CropperFrameProcessorPlugin alloc] initWithProxy:proxy withOptions:options];
    }];
}

@end
