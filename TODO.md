# APK Build Progress for Smirkle Preview

## Steps from Approved Plan (Expo SDK 55, EAS CLI 18.5.0)
- [x] 1. Login to EAS (user: gingervaile)
- [ ] 2. Setup EAS Secrets (using `eas env:create`, deprecated `secret:create`)
  - [ ] FIREBASE_API_KEY = AIzaSyCPKyJrtHCpBdj7FlepJXLHZPId5gBqs78
  - [ ] FIREBASE_AUTH_DOMAIN = smirkle-922e2.firebaseapp.com
  - [ ] FIREBASE_PROJECT_ID = smirkle-922e2
  - [ ] FIREBASE_STORAGE_BUCKET = smirkle-922e2.firebasestorage.app
  - [ ] FIREBASE_MESSAGING_SENDER_ID = 260360951119
  - [ ] FIREBASE_APP_ID = 1:260360951119:web:90bfb86aae8db5752c613a
  - [ ] FIREBASE_MEASUREMENT_ID = G-798BKP028M
  - [ ] EXPO_PUBLIC_YOUTUBE_API_KEY = AIzaSyCaAguRTh-Df-RIJmw3nXkjyxuH_Foqrnk
- [ ] 3. Build APK: `eas build --profile preview --platform android`
- [ ] 4. Download APK from EAS build URL
- [ ] 5. Install on Android device (enable unknown sources)
- [ ] 6. Test app (camera perms, no localhost needed)

## Notes
- Kill old terminals (Ctrl+C)
- Use `eas env:create` (interactive, select 'string')
- Environment: preview (per eas.json)


