package com.margelo.nitro.visioncameracropper

import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.util.Base64
import com.margelo.nitro.NitroModules
import com.margelo.nitro.camera.CameraOrientation
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.public.NativeFrame
import com.margelo.nitro.camera.extensions.toBitmap
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream

@DoNotStrip
@Keep
class VisionCameraCropperFactory : HybridVisionCameraCropperSpec() {

  @DoNotStrip
  @Keep
  override fun rotateImage(
    base64: String,
    degree: Double
  ): String {
    val decode = Base64.decode(base64, Base64.DEFAULT)
    var bitmap = BitmapFactory.decodeByteArray(decode, 0, decode.size)

    if (degree != 0.0) {
      val matrix = Matrix()
      matrix.postRotate(degree.toFloat())

      val newBitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)

      if(newBitmap != bitmap) {
        bitmap.recycle()
      }

      bitmap = newBitmap
    }

    val outputStream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
    return Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
  }

  @DoNotStrip
  @Keep
  override fun cropFrame(
    frame: HybridFrameSpec,
    options: CropConfig
  ): CropResult {
    val nativeFrame = (frame as? NativeFrame) ?: throw Exception("Frame is not a NativeFrame!")
    var bitmap = nativeFrame.image.toBitmap(frame.orientation, frame.isMirrored)

    // FOR SOME REASON NEED TO ROTATE WHEN ORIENTATION IS LEFT
    if(frame.orientation == CameraOrientation.LEFT) {
      val matrix = Matrix()
      matrix.postRotate(180.0F)

      val newBitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)

      if(newBitmap != bitmap) {
        bitmap.recycle()
      }

      bitmap = newBitmap
    }

    val cropRegion = options.cropRegion
    if (cropRegion != null) {
      val left = (cropRegion.left / 100.0 * bitmap.width).toInt()
      val top = (cropRegion.top / 100.0 * bitmap.height).toInt()
      val width = (cropRegion.width / 100.0 * bitmap.width).toInt()
      val height = (cropRegion.height / 100.0 * bitmap.height).toInt()
      val croppedBitmap = Bitmap.createBitmap(bitmap, left, top, width, height)

      if (croppedBitmap != bitmap) {
        bitmap.recycle()
      }

      bitmap = croppedBitmap
    }

    var base64: String? = null
    if (options.includeImageBase64 == true) {
      val outputStream = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
      base64 = Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
    }

    var path: String? = null
    if (options.saveAsFile == true) {
      val context = NitroModules.applicationContext ?: throw Exception("No Context available!")
      val file = File.createTempFile("cropped_", ".jpg", context.cacheDir)
      FileOutputStream(file).use { fos ->
        bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos)
      }
      path = file.absolutePath
    }

    bitmap.recycle()

    return CropResult(base64, path)
  }
}
