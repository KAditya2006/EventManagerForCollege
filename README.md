# EventManagerForCollege
GIET(A) College Event Management App
An Android mobile application for discovering, registering, and managing college events at GIET(A).

Architecture
Mobile Client: React Native + Expo (TypeScript)
Backend API: Node.js + Express (TypeScript)
Database: MongoDB + Mongoose
Setup Instructions
Backend
cd server
npm install
Copy ../.env.example to server/.env and update values.
npm run dev (Starts the Express API server)
Mobile App
cd mobile
npm install
npx expo start
Use an Android emulator or the Expo Go app on your physical device to test the application.
Documentation
See the docs/ folder for comprehensive project documentation, including:

PRD
Architecture
Rules
Design Details
Development Tasks
Memory / Locked Decisions
Android Release Build Instructions
App Identity
App Name: GIET(A) College Event Management
Application ID: com.gieta.events
Version: 1.0.0
Version Code: 1
1. Production API Configuration
Set EXPO_PUBLIC_API_URL to point to your live backend (e.g. https://events.giet.edu/api):

# In mobile/.env or EAS build secret
EXPO_PUBLIC_API_URL=https://events.giet.edu/api
2. Standalone APK Build (College / Internal Testing)
cd mobile
# Using EAS Build (Cloud or Local):
eas build --platform android --profile production-apk

# Or export static release JS bundle:
npm run export
3. Google Play Store AAB Build
cd mobile
eas build --platform android --profile production
4. Backend Production Deployment
Set NODE_ENV=production
Provide MONGO_URI, JWT_SECRET, and SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM)
Build and launch:
cd server
npm run build
npm start
