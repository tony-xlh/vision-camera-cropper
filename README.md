# vision-camera-cropper

A react native vision camera frame processor for cropping

[Demo video](https://github.com/tony-xlh/vision-camera-cropper/assets/5462205/81031752-4179-4439-a8c6-97f73587fd56)


## Versions

For Vision Camera v3, use versions 0.x.

For Vision Camera v4, use versions >= 1.0.0.

## Installation

```sh
yarn add vision-camera-cropper
cd ios && pod install
```

Add the plugin to your `babel.config.js`:

```js
module.exports = {
   plugins: [['react-native-worklets-core/plugin']],
    // ...
```

> Note: You have to restart metro-bundler for changes in the `babel.config.js` file to take effect.

## Usage

1. Crop a frame and return its base64 or path.
      
    ```js
    import { crop } from 'vision-camera-cropper';

    // ...
    const frameProcessor = useFrameProcessor((frame) => {
      'worklet';
      //coordinates in percentage
      const cropRegion = {
        left:10,
        top:10,
        width:80,
        height:30
      }
      const result = crop(frame,{cropRegion:cropRegion,includeImageBase64:true,saveAsFile:false});
      console.log(result.base64);
    }, []);
    ```

2. Rotate an image.

    ```js
    const rotated = await rotateImage(base64,degree);
    ```

## Get Bitmap/UIImage via Reflection

If you are developing a plugin to get the camera frames, you can use reflection to get it as Bitmap or UIImage on the native side.

Java:

```java
Class cls = Class.forName("com.visioncameracropper.CropperFrameProcessorPlugin");
Method m = cls.getMethod("getBitmap",null);
Bitmap bitmap = (Bitmap) m.invoke(null, null);
```


Objective-C:

```objc
- (UIImage*)getUIImage{
    UIImage *image = ((UIImage* (*)(id, SEL))objc_msgSend)(objc_getClass("CropperFrameProcessorPlugin"), sel_registerName("getBitmap"));
    return image;
}
```

You have to pass `{saveBitmap: true}` for the `crop` function.

## Blog

[How to Create a React Native Vision Camera Plugin to Crop Frames](https://www.dynamsoft.com/codepool/react-native-vision-camera-cropper-plugin.html)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
