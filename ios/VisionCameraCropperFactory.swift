import AVFoundation
import CoreImage
import Foundation
import NitroModules
import UIKit
import VisionCamera

class VisionCameraCropperFactory: HybridVisionCameraCropperSpec {

  func rotateImage(base64: String, degree: Double) throws -> String {
    guard let image = Self.decodeBase64(base64) else {
      throw RuntimeError.error(withMessage: "Invalid base64")
    }
    let rotated = degree != 0 ? Self.rotate(image: image, degree: CGFloat(degree)) : image
    guard let result = Self.encodeBase64(rotated) else {
      throw RuntimeError.error(withMessage: "Failed to encode image")
    }
    return result
  }

  func cropFrame(frame: any HybridFrameSpec, options: CropConfig) throws -> CropResult {
    guard let nativeFrame = frame as? any NativeFrame else {
      throw RuntimeError.error(withMessage: "Frame is not a NativeFrame!")
    }
    guard let sampleBuffer = nativeFrame.sampleBuffer else {
      throw RuntimeError.error(withMessage: "Frame has already been disposed!")
    }

    let uiOrientation = Self.uiImageOrientation(
      from: frame.orientation,
      isMirrored: frame.isMirrored
    )
    var image = try Self.uiImage(from: sampleBuffer, orientation: uiOrientation)

    // FOR SOME REASON NEED TO ROTATE WHEN ORIENTATION IS LEFT
    if frame.orientation == .left {
      image = Self.rotate(image: image, degree: 180)
    }

    if let cropRegion = options.cropRegion {
      image = try Self.crop(image: image, region: cropRegion)
    }

    var base64: String?
    if options.includeImageBase64 == true {
      base64 = Self.encodeBase64(image)
    }

    var path: String?
    if options.saveAsFile == true {
      path = try Self.saveToTempFile(image)
    }

    return CropResult(base64: base64, path: path)
  }

  // MARK: - Helpers

  private static let ciContext = CIContext(options: [.useSoftwareRenderer: false])

  private static func uiImageOrientation(
    from orientation: CameraOrientation,
    isMirrored: Bool
  ) -> UIImage.Orientation {
    switch orientation {
    case .up:
      return isMirrored ? .upMirrored : .up
    case .down:
      return isMirrored ? .downMirrored : .down
    case .left:
      return isMirrored ? .leftMirrored : .left
    case .right:
      return isMirrored ? .rightMirrored : .right
    }
  }

  private static func uiImage(
    from sampleBuffer: CMSampleBuffer,
    orientation: UIImage.Orientation
  ) throws -> UIImage {
    guard let imageBuffer = sampleBuffer.imageBuffer else {
      throw RuntimeError.error(withMessage: "This Frame does not have a PixelBuffer!")
    }
    let attachments = CMCopyDictionaryOfAttachments(
      allocator: kCFAllocatorDefault,
      target: sampleBuffer,
      attachmentMode: kCMAttachmentMode_ShouldPropagate
    )
    let ciAttachments = attachments as? [CIImageOption: Any]
    let ciImage = CIImage(cvPixelBuffer: imageBuffer, options: ciAttachments)
    guard let cgImage = ciContext.createCGImage(ciImage, from: ciImage.extent) else {
      throw RuntimeError.error(withMessage: "Failed to copy CIImage into CGImage!")
    }
    return UIImage(cgImage: cgImage, scale: 1, orientation: orientation)
  }

  private static func decodeBase64(_ base64: String) -> UIImage? {
    guard let data = Data(base64Encoded: base64, options: .ignoreUnknownCharacters) else {
      return nil
    }
    return UIImage(data: data)
  }

  private static func encodeBase64(_ image: UIImage) -> String? {
    image.jpegData(compressionQuality: 1.0)?.base64EncodedString()
  }

  private static func rotate(image: UIImage, degree: CGFloat) -> UIImage {
    let radians = degree * (.pi / 180.0)
    let rotatedSize = CGRect(origin: .zero, size: image.size)
      .applying(CGAffineTransform(rotationAngle: radians))
      .integral.size
    UIGraphicsBeginImageContext(rotatedSize)
    defer { UIGraphicsEndImageContext() }
    guard let context = UIGraphicsGetCurrentContext() else {
      return image
    }
    let origin = CGPoint(x: rotatedSize.width / 2.0, y: rotatedSize.height / 2.0)
    context.translateBy(x: origin.x, y: origin.y)
    context.rotate(by: radians)
    image.draw(
      in: CGRect(
        x: -image.size.width / 2.0,
        y: -image.size.height / 2.0,
        width: image.size.width,
        height: image.size.height
      )
    )
    return UIGraphicsGetImageFromCurrentImageContext() ?? image
  }

  private static func crop(image: UIImage, region: CropRegion) throws -> UIImage {
    guard let cgImage = image.cgImage else {
      throw RuntimeError.error(withMessage: "Failed to get CGImage!")
    }
    let imgWidth = Double(cgImage.width)
    let imgHeight = Double(cgImage.height)
    let left = region.left / 100.0 * imgWidth
    let top = region.top / 100.0 * imgHeight
    let width = region.width / 100.0 * imgWidth
    let height = region.height / 100.0 * imgHeight
    let cropRect = CGRect(x: left, y: top, width: width, height: height).integral
    guard let cropped = cgImage.cropping(to: cropRect) else {
      throw RuntimeError.error(withMessage: "Failed to crop image!")
    }
    return UIImage(cgImage: cropped)
  }

  private static func saveToTempFile(_ image: UIImage) throws -> String {
    let url = FileManager.default.temporaryDirectory
      .appendingPathComponent("cropped_\(UUID().uuidString)")
      .appendingPathExtension("jpg")
    guard let data = image.jpegData(compressionQuality: 1.0) else {
      throw RuntimeError.error(withMessage: "Failed to encode image!")
    }
    try data.write(to: url)
    return url.path
  }
}
