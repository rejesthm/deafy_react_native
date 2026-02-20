# Deafy React Native

ASL sign language recognition app with real-time hand detection and letter recognition (A–G).

## Features

- **Real-time hand landmarks** from the camera using Vision Camera + `vision-camera-resize-plugin` + `react-native-fast-tflite` (MediaPipe hand_landmark_lite model)
- **ASL letter recognition (A–G)** via rule-based classifier on 21 hand landmarks
- MediaPipe Holistic (543 landmarks) support for LSTM/sequence pipeline
- Redux Toolkit state management
- Camera integration with react-native-vision-camera
- Secure authentication with JWT tokens

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install iOS pods (required for vision-camera-resize-plugin and react-native-fast-tflite):
```bash
cd ios && pod install && cd ..
```

3. **Real-time pipeline**: The Tensor screen uses the resize plugin and TFLite hand landmark model. The model is loaded from CDN at runtime (`hand_landmark_lite.tflite`). For offline use, bundle the model and pass a local require/URL.

3. Run the app:

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Architecture

- **State Management**: Redux Toolkit with persistent storage
- **Navigation**: React Navigation (Stack + Tab)
- **Styling**: Styled Components with design tokens
- **Camera**: react-native-vision-camera with frame processors
- **ML**: Real-time hand landmarks via TFLite (hand_landmark_lite) in frame processor; ASL letters A–G from landmarks; MediaPipe Holistic + TFLite for LSTM/sequence

## Project Structure

```
src/
├── components/      # Reusable UI components
├── models/          # TypeScript interfaces
├── routes/          # Navigation configuration
├── screens/         # App screens
├── services/        # MediaPipe, API services
├── store/           # Redux slices
├── theme/           # Design system (colors, tokens, typography)
└── utils/           # Helper functions
```

## Development

- TypeScript strict mode enabled
- ESLint + Prettier configured
- Path aliases: `@screens`, `@components`, etc.
- Metro bundler with WASM support for MediaPipe
