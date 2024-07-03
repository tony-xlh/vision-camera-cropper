@objc(VisionCameraCropper)
class VisionCameraCropper: NSObject {

  @objc(rotateImage:degree:withResolver:withRejecter:)
  func rotateImage(base64: String, degree: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
      
      guard let image = VisionCameraCropper.convertBase64ToImage(base64) else {
          reject("error","Invalid base64",nil);
          return;
      };
      print("image width %d", image.size.width)
      let rotated = VisionCameraCropper.rotate(image: image,degree: CGFloat(degree))
      print("rotated image width %d", rotated.size.width)
      resolve(VisionCameraCropper.getBase64FromImage(rotated))
  }
    
    public static func rotate(image: UIImage, degree: CGFloat) -> UIImage {
        let radians = degree / (180.0 / .pi)
        let rotatedSize = CGRect(origin: .zero, size: image.size)
            .applying(CGAffineTransform(rotationAngle: CGFloat(radians)))
            .integral.size
        UIGraphicsBeginImageContext(rotatedSize)
        if let context = UIGraphicsGetCurrentContext() {
            let origin = CGPoint(x: rotatedSize.width / 2.0,
                                 y: rotatedSize.height / 2.0)
            context.translateBy(x: origin.x, y: origin.y)
            context.rotate(by: radians)
            image.draw(in: CGRect(x: -origin.y, y: -origin.x,
                                  width: image.size.width, height: image.size.height))
            let rotatedImage = UIGraphicsGetImageFromCurrentImageContext()
            UIGraphicsEndImageContext()

            return rotatedImage ?? image
        }
        return image
    }
    
    public static func getBase64FromImage(_ image:UIImage) -> String {
      let dataTmp = image.jpegData(compressionQuality: 100)
      if let data = dataTmp {
          return data.base64EncodedString()
      }
      return ""
    }
    
    public static func convertBase64ToImage(_ imageStr:String) ->UIImage?{
        if let data: NSData = NSData(base64Encoded: imageStr, options:NSData.Base64DecodingOptions.ignoreUnknownCharacters)
        {
            if let image: UIImage = UIImage(data: data as Data)
            {
                return image
            }
        }
        return nil
    }
}
