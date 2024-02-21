package com.visioncameracropper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.mrousavy.camera.frameprocessor.Frame;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessor.VisionCameraProxy;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CropperFrameProcessorPlugin extends FrameProcessorPlugin {
  CropperFrameProcessorPlugin(@NonNull VisionCameraProxy proxy, @Nullable Map<String, Object> options) {super();}

  @Nullable
  @Override
  public Object callback(@NonNull Frame frame, @Nullable Map<String, Object> arguments) {
    Log.d("Cropper","frame processor");
    List<Object> array = new ArrayList<>();
    return array;
  }


}
