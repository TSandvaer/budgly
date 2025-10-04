# Budgly - Budget Management App

A React Native mobile application built with Expo for managing monthly budgets and tracking expenses.

## Features

- 📱 Cross-platform (iOS & Android)
- 🔐 Firebase Authentication (Email/Password)
- 💾 Cloud Firestore for data storage
- 💰 Track income and expenses
- 📊 Monthly budget overview
- 🏷️ Categorize transactions
- ⚡ Real-time data sync

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Email/Password authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Create a Firestore database:
   - Go to Firestore Database
   - Create database (start in test mode for development)
5. Get your Firebase config:
   - Go to Project Settings > Your apps
   - Add a web app
   - Copy the configuration object

### 3. Configure Firebase

Update the Firebase configuration in `src/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Firestore Security Rules

Add these rules to your Firestore Database (for production, make them more restrictive):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{transaction} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    match /budgets/{budget} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Running the App

### Development

```bash
# Start the Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in web browser
npx expo start --web
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure your project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Project Structure

```
budgly/
├── src/
│   ├── context/          # React Context (Auth)
│   ├── navigation/       # Navigation setup
│   ├── screens/          # App screens
│   ├── services/         # Firebase services
│   └── types/            # TypeScript types
├── assets/               # Images and icons
├── App.tsx               # Root component
└── app.json              # Expo configuration
```

## Key Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Firebase Auth** - User authentication
- **Cloud Firestore** - NoSQL database
- **React Navigation** - Navigation library

## Screens

- **Login/Register** - User authentication
- **Home** - Budget overview and recent transactions
- **Transactions** - View all transactions
- **Add Transaction** - Add new income/expense

## Environment Variables

Create a `.env` file (see `.env.example`) for sensitive configuration (optional):

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
```

## Troubleshooting

### Metro Bundler Issues
```bash
npx expo start -c
```

### Package Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
