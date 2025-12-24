# Contributing to Kebo

Thank you for your interest in contributing to Kebo! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kebo/kebo-mobile.git
   cd kebo-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in the required values in `.env`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on simulator/emulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

6. **Android: Generate debug keystore** (first time only)
   ```bash
   cd android/app
   keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
   cd ../..
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define explicit types for function parameters and return values
- Avoid using `any` type when possible

### Component Structure

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### Naming Conventions

- **Files**: PascalCase for components (`HomeScreen.tsx`), camelCase for utilities (`authUtils.ts`)
- **Components**: PascalCase (`TransactionCard`)
- **Functions/Variables**: camelCase (`getUserInfo`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)

### Logging

Use the centralized logger instead of `console.log`:

```typescript
import logger from "../utils/logger";

logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Keep commits focused and atomic

3. **Test your changes**
   - Ensure the app builds without errors
   - Test on both iOS and Android if possible

4. **Submit a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

## Reporting Issues

When reporting issues, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Device/OS information
- Screenshots or logs if applicable

## Feature Requests

Feature requests are welcome! Please:

- Check existing issues to avoid duplicates
- Provide a clear use case
- Explain why this feature would benefit users

## License

By contributing to Kebo, you agree that your contributions will be licensed under the Apache License 2.0.

