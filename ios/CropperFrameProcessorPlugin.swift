//
//  CropperFrameProcessorPlugin.swift
//  VisionCameraCropper
//
//  Created by xulihang on 2024/2/21.
//

import Foundation

@objc(CropperFrameProcessorPlugin)
public class CropperFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable : Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any {
    let buffer = frame.buffer
    let cropResult: [String:Any] = [:]
    return cropResult
  }
}
