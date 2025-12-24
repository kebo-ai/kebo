![hero](kebo-baner.png)

<h1 align="center">
  Kebo
  <br />
</h1>

<p align="center">
  Your Personal Finance Companion
  <br />
  <br />
  <a href="https://kebo.app">Website</a>
  ·
  <a href="https://github.com/kebo/kebo-mobile/issues">Issues</a>
  ·
  <a href="https://discord.gg/UmU9mbDkUx">Discord</a>
</p>

<p align="center">
  <a href="https://supabase.com">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </a>
  <a href="https://expo.dev">
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  </a>
  <a href="https://reactnative.dev">
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  </a>
  <a href="https://www.typescriptlang.org">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License" />
  </a>
</p>

<p align="center">
  <sub>
    Supported by:
    <div align="center">
      <div>
        <a href="https://crafter.station">
          <img src="https://raw.githubusercontent.com/Railly/crafter-station/main/public/logo.png" alt="Crafter Station" width="16" valign="middle" /> Crafter Station
        </a>
      </div>
      <div>
        <a href="https://moraleja.co">
          <img src="https://www.moraleja.co/brand_assets/MORALEJA_FAVICON.png" alt="Moraleja" width="16" valign="middle" /> Moraleja Design
        </a>
      </div>
    </div>
  </sub>
</p>

## About Kebo

Kebo is a personal finance app designed to help you take control of your money. Track expenses, manage budgets, and gain insights into your spending habits—all in one beautiful, intuitive interface. Built for people who want financial clarity without the complexity.

## Features

**Transaction Tracking**: Easily log income, expenses, and transfers with automatic categorization and smart suggestions.<br/>
**Budget Management**: Create custom budgets by category, track progress in real-time, and stay on top of your financial goals.<br/>
**Financial Reports**: Visualize your spending patterns with beautiful charts and gain insights into where your money goes.<br/>
**AI Assistant**: Chat with Kebo's AI to get personalized financial insights, tips, and answers to your money questions.<br/>
**Multi-Currency**: Support for multiple currencies with automatic formatting based on your preferences.<br/>
**Bank Integration**: Connect your accounts for automatic transaction syncing (coming soon).<br/>
**Multi-Language**: Available in 8 languages including English, Spanish, Portuguese, and more.<br/>
**Secure by Design**: Your data is encrypted and stored securely. We never sell your financial information.<br/>

## Get Started

### Prerequisites

- Node.js 18+
- npm or yarn
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/kebo/kebo-mobile.git
cd kebo-mobile

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the development server
npm start
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## App Architecture

### Core Stack

- React Native
- Expo SDK 52
- TypeScript
- MobX-State-Tree

### Backend & Services

- Supabase (Database, Auth, Storage, Realtime)
- PostHog (Analytics)

### UI & Styling

- Tailwind CSS (twrnc)
- React Navigation
- Custom component library

### Internationalization

- i18next
- 8 supported languages

## Project Structure

```
kebo-mobile/
├── assets/              # Images, icons, and fonts
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # App screens
│   ├── navigators/      # Navigation configuration
│   ├── models/          # MobX-State-Tree stores
│   ├── services/        # API and business logic
│   ├── hooks/           # Custom React hooks
│   ├── config/          # App configuration
│   ├── i18n/            # Translations
│   ├── theme/           # Colors and typography
│   └── utils/           # Utility functions
├── .env.example         # Environment template
└── app.json             # Expo configuration
```

## Configuration

Copy `.env.example` to `.env` and configure your environment:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
EXPO_PUBLIC_POSTHOG_API_KEY=your-posthog-key
```

See [`.env.example`](.env.example) for all available options.

## Contributing

We love contributions! Whether it's fixing bugs, adding features, or improving documentation—every contribution helps.

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## Community

- 💬 [Discord](https://discord.gg/UmU9mbDkUx) - Chat with the community
- 🐛 [Issues](https://github.com/kebo/kebo-mobile/issues) - Report bugs or request features
- 💡 [Feature Requests](https://keboapp.featurebase.app/) - Vote on upcoming features

## Security

Found a vulnerability? Please report it responsibly. See our [Security Policy](SECURITY.md) for details.

## Code of Conduct

We're committed to a welcoming community. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [Apache License 2.0](LICENSE).

Third-party attributions can be found in the [NOTICE](NOTICE) file.

---

<p align="center">
  Built with ❤️ by the <a href="https://kebo.app">Kebo</a> team
</p>
