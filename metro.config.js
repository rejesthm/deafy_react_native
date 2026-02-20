const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Extended for WASM support (required for MediaPipe)
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'wasm', // Add WASM support for MediaPipe
      'tflite', // Add TFLite model support
      'task', // Add MediaPipe task files
    ],
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'jsx',
      'js',
      'ts',
      'tsx',
      'json',
    ],
  },
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config);
