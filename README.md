# Deafy React Native

ASL sign language recognition app with MediaPipe Holistic.

## Features

- Real-time hand detection with MediaPipe Holistic (543 landmarks)
- LSTM-based gesture recognition
- Redux Toolkit state management
- Camera integration with react-native-vision-camera
- Secure authentication with JWT tokens

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install iOS pods:
```bash
cd ios && pod install && cd ..
```

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
- **ML**: MediaPipe Holistic + TFLite for gesture recognition

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
