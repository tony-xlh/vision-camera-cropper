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
    var cropResult: [String:Any] = [:]
    guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      print("Failed to get CVPixelBuffer!")
      return cropResult
    }
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)

    guard let cgImage = CIContext().createCGImage(ciImage, from: ciImage.extent) else {
        print("Failed to create CGImage!")
        return cropResult
    }

    let image:UIImage;
    let cropRegion = arguments?["cropRegion"] as? [String: Int]
    if cropRegion != nil {
      let imgWidth = Double(cgImage.width)
      let imgHeight = Double(cgImage.height)
      let left:Double = Double(cropRegion?["left"] ?? 0) / 100.0 * imgWidth
      let top:Double = Double(cropRegion?["top"] ?? 0) / 100.0 * imgHeight
      let width:Double = Double(cropRegion?["width"] ?? 100) / 100.0 * imgWidth
      let height:Double = Double(cropRegion?["height"] ?? 100) / 100.0 * imgHeight

      // The cropRect is the rect of the image to keep,
      // in this case centered
      let cropRect = CGRect(
          x: left,
          y: top,
          width: width,
          height: height
      ).integral

      let cropped = cgImage.cropping(
          to: cropRect
      )!
      image = UIImage(cgImage: cropped)
      print("use cropped image")
    }else{
      image = UIImage(cgImage: cgImage)
    }
    let includeImageBase64 = arguments!["includeImageBase64"] as? Bool ?? false
    if includeImageBase64 == true {
        cropResult["base64"] = getBase64FromImage(image)
    }
    let saveAsFile = arguments!["saveAsFile"] as? Bool ?? false
    if saveAsFile == true {
      cropResult["path"] = saveImage(image)
    }
    return cropResult
  }
    
  func saveImage(_ image:UIImage) -> String {
    let url = FileManager.default.temporaryDirectory
                            .appendingPathComponent(UUID().uuidString)
                            .appendingPathExtension("jpeg")
    try? image.jpegData(compressionQuality: 1.0)?.write(to: url)
    return url.path
  }
    
  func getBase64FromImage(_ image:UIImage) -> String {
    let dataTmp = image.jpegData(compressionQuality: 100)
    if let data = dataTmp {
        return data.base64EncodedString()
    }
    return ""
  }
}
