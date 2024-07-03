package com.visioncameracropper;

import android.graphics.Bitmap;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = VisionCameraCropperModule.NAME)
public class VisionCameraCropperModule extends ReactContextBaseJavaModule {
  public static final String NAME = "VisionCameraCropper";
  private static ReactApplicationContext mContext;
  public VisionCameraCropperModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mContext = reactContext;
  }
  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  public static ReactApplicationContext getContext(){
    return mContext;
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  public void rotateImage(String base64, int degree, Promise promise) {
    Bitmap bitmap = BitmapUtils.base642Bitmap(base64);
    Bitmap rotated = BitmapUtils.rotateBitmap(bitmap, degree,false,false);
    promise.resolve(BitmapUtils.bitmap2Base64(rotated));
  }
}
