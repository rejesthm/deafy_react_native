module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
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
