# GIET(A) College Event Management App

An Android mobile application for discovering, registering, and managing college events at GIET(A).

## Architecture
- **Mobile Client:** React Native + Expo (TypeScript)
- **Backend API:** Node.js + Express (TypeScript)
- **Database:** MongoDB + Mongoose

## Setup Instructions

### Backend
1. `cd server`
2. `npm install`
3. Copy `../.env.example` to `server/.env` and update values.
4. `npm run dev` (Starts the Express API server)

### Mobile App
1. `cd mobile`
2. `npm install`
3. `npx expo start`
4. Use an Android emulator or the Expo Go app on your physical device to test the application.

## Documentation
See the `docs/` folder for comprehensive project documentation, including:
- [PRD](docs/prd.md)
- [Architecture](docs/architecture.md)
- [Rules](docs/rules.md)
- [Design Details](docs/designe.md)
- [Development Tasks](docs/tasks.md)
- [Memory / Locked Decisions](docs/memory.md)

## Android Release Build Instructions

### App Identity
- **App Name:** `GIET(A) College Event Management`
- **Application ID:** `com.gieta.events`
- **Version:** `1.0.0`
- **Version Code:** `1`

### 1. Production API Configuration
Set `EXPO_PUBLIC_API_URL` to point to your live backend (e.g. `https://events.giet.edu/api`):
```bash
# In mobile/.env or EAS build secret
EXPO_PUBLIC_API_URL=https://events.giet.edu/api
```

### 2. Standalone APK Build (College / Internal Testing)
```bash
cd mobile
# Using EAS Build (Cloud or Local):
eas build --platform android --profile production-apk

# Or export static release JS bundle:
npm run export
```

### 3. Google Play Store AAB Build
```bash
cd mobile
eas build --platform android --profile production
```

### 4. Backend Production Deployment
1. Set `NODE_ENV=production`
2. Provide `MONGO_URI`, `JWT_SECRET`, and SMTP credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`)
3. Build and launch:
```bash
cd server
npm run build
npm start
```

