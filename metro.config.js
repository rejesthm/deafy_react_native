const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Extended for WASM support (required for MediaPipe)
 */
const defaultConfig = getDefaultConfig(__dirname);

const path = require('path');

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'axios' || moduleName.startsWith('axios/')) {
        return {
          filePath: path.resolve(
            __dirname,
            'node_modules/axios/dist/browser/axios.cjs',
          ),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
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
        inlineRequires: false, // true can cause "Requiring unknown module undefined" crash
      },
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config);
