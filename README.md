# vision-camera-cropper

A react native vision camera frame processor for cropping

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

Crop a frame and return its base64 or path.
   
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

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
