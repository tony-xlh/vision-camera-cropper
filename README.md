# vision-camera-cropper

A react native vision camera frame processor for cropping

[Demo video](https://github.com/tony-xlh/vision-camera-cropper/assets/5462205/81031752-4179-4439-a8c6-97f73587fd56)


## Versions

For Vision Camera v3, use versions 0.x.

For Vision Camera v4, use versions >= 1.0.0 < 2.0.0

For Vision Camera v5, use versions >= 2.0.0

## Installation

```sh
yarn add vision-camera-cropper
cd ios && pod install
```

Add the plugin to your `babel.config.js`:

```js
module.exports = {
   plugins: [['react-native-worklets/plugin']],
  // ...
```

> Note: You have to restart metro-bundler for changes in the `babel.config.js` file to take effect.

## Usage

1. Crop a frame and return its base64 or path.
      
    ```js
    import { crop } from 'vision-camera-cropper';

    // ...
    const frameOutput = useFrameOutput({
    pixelFormat: 'yuv',
    onFrame: (frame) => {
      'worklet';
      
      const result = crop(frame, {
        cropRegion: cropRegionShared.value,
        includeImageBase64: true,
      });

      frame.dispose();
    },
  });
    ```

2. Rotate an image.

    ```js
    const rotated = await rotateImage(base64,degree);
    ```

## Blog

[How to Create a React Native Vision Camera Plugin to Crop Frames](https://www.dynamsoft.com/codepool/react-native-vision-camera-cropper-plugin.html)

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
