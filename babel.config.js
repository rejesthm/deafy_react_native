module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-worklets-core/plugin',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@screens': './src/screens',
          '@components': './src/components',
          '@navigation': './src/navigation',
          '@routes': './src/routes',
          '@store': './src/store',
          '@services': './src/services',
          '@theme': './src/theme',
          '@models': './src/models',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
