# 📱 Gustie Life

Chris Branch
**Gustie Life** is a mobile application built for students at **Gustavus Adolphus College**. It centralizes key campus features like events, dining options, student spotlights, and push notifications into one sleek, user-friendly experience. Built with **React Native (Expo)** and **Firebase**, it aims to make student life smoother and more connected.

---

## 🚀 Features

- 🏠 Home Tab: Categorized cards for Events, Spotlights, Study Tips, and Resources.
- 🧭 Discover Tab: Exploration of campus opportunities.
- 🗞️ News Tab: Personalized notifications based on student interaction history.
- 👤 You Tab: Login/Logout with Firebase Auth, editable profile (name and image).
- 🔔 Smart Notifications: Auto-generated based on user behavior and tags.
- 🔐 Future: Admin portal, digital student ID access, event creation, and analytics.

---

## 🛠️ Tech Stack

- React Native + Expo
- TypeScript
- Firebase (Auth, Firestore, Storage)
- Expo Router
- AsyncStorage
- Push Notifications (Expo Push API) – _in development_

---

## 🧭 Folder Structure

```bash
gustie-life/
├── app/
│   ├── (tabs)/               # Tab screens (_layout, Home, Discover, etc.)
│   ├── context/              # React contexts (e.g., auth)
│   ├── hooks/                # Custom React hooks (e.g., useNotifications)
│   ├── utils/                # Utility functions (e.g., notifications.ts)
│   ├── components/           # Reusable UI components
│   ├── constants/            # Static data/constants
│   ├── assets/               # Images and fonts
├── .gitignore
├── app.json
├── eas.json
├── firebase.json
├── FirebaseConfig.ts         # Firebase SDK config
├── tsconfig.json             # TypeScript config
```

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/gustie-life.git
cd gustie-life
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

- Go to [firebase.google.com](https://firebase.google.com) and create a project
- Enable:
  - **Email/Password Authentication**
  - **Firestore Database**
  - **(Optional)** Cloud Storage for profile photos
- Copy your Firebase config into `FirebaseConfig.ts`

### 4. Run the App

```bash
npx expo start
```

Scan the QR code with **Expo Go** or run it on an emulator.

---

## 🌐 Environment Variables

If using `.env`, include:

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

---

## 📲 Building & Deployment

### Build the app with EAS:

```bash
eas build --platform ios
eas build --platform android
```

### Submit to TestFlight or Play Store:

```bash
eas submit --platform ios --latest --profile production
eas submit --platform android --latest --profile production
```

---

## 🧰 Dev & Testing Notes

- 🔤 **Icon Library:** [https://icons.expo.fyi/Index](https://icons.expo.fyi/Index)
- 🧪 **Test Account:**
  - Email: `tester1@test.com`
  - Password: `tester1`
- 🚀 **Send New Build to TestFlight:**
  ```bash
  eas build -p ios --profile production
  eas submit -p ios --latest --profile production
  ```

---

## 📄 License

MIT License  
© 2025 Christopher Gutuza
