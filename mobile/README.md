# NexusOS Mobile

React Native client for Android and iOS, built with Expo and connected to the existing NexusOS API.

## Try it now

1. Install the current Expo Go app on an Android or iPhone.
2. Connect the phone and development computer to the same Wi-Fi.
3. From this folder run `npm install` and `npm start` (the current local server uses port `8084`).
4. Scan the Expo QR code. Email/password, chats, realtime messages, images, and voice messages use the configured API.

The current development URL is `exp://192.168.100.11:8084`. It only works while this computer and the Metro process remain online on that network.

## Configure OAuth and EAS

Google sign-in requires the Web, Android, and iOS OAuth client IDs. Put them in this folder's ignored `.env` using the names in `.env.example`. Add the Android and iOS client IDs to the backend `GOOGLE_CLIENT_ID` as a comma-separated allowlist alongside any existing web ID. These are public OAuth client IDs; never put a client secret in the app.

Set up an Expo account, then run `npx eas-cli@latest login` and `npx eas-cli@latest init`. Copy the generated EAS project UUID to `EXPO_PUBLIC_EAS_PROJECT_ID` and `expo.extra.eas.projectId` in `app.json`. Make a custom development build before testing Google OAuth or remote push; those native integrations are not available in Expo Go.

```powershell
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
```

Android cloud builds need an Android signing key (EAS can create one) and Firebase Cloud Messaging v1 credentials for push. iOS cloud builds and push require an Apple Developer account and APNs credentials. iOS can be built from Windows using EAS cloud build; a local iOS build requires macOS/Xcode.

## Backend deployment

The backend changes add Expo push token persistence and native M4A audio acceptance. Deploy the backend changes, apply `npm run db:migrate` against the intended server database, then restart its API process. Do not run a migration against production until confirming the configured `DATABASE_URL` points at the intended database.

Universal invite links additionally require `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json` on `nexusos.sparkpair.dev`, with the final Apple Team ID and Android signing certificate fingerprint. Until those association files are deployed, `nexusos://join/<token>` works in a native build and the website invite remains usable in a browser.

## Current feature coverage

- Email/password authentication, secure session restore, customer registration, and Google OAuth wiring.
- Chat list with unread, archive, pin, mute, realtime updates, and text/image/voice messages.
- Business customer lists, broadcast sending/history, customer update feed, save/mute actions.
- Profile invite-link sharing/regeneration, notification permission status, quiet hours, read-receipt preference.
- Invite deep links connect the signed-in customer and open that business conversation.

## Checks

```powershell
npm run typecheck
npx expo install --check
npx expo export --platform android
```
