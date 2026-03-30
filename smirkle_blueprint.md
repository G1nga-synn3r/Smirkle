# Smirkle Blueprint

## Project Title
Smirkle

## Tagline
The High-Stakes "Try Not to Laugh" Challenge

---

## 1. Executive Summary

Smirkle is a high-energy, gamified mobile application where players must maintain a neutral poker face while watching funny video content.

The game uses the front-facing camera and real-time facial detection to monitor the player’s face. If the player smiles, closes their eyes too long, leaves the frame, loses internet, or the video fails to load, the round ends immediately.

Players earn points by surviving without reacting. Registered users can save progress, climb global leaderboards, unlock levels and badges, and build social profiles. Guests can play without registering, but guest scores and progression are not saved.

Smirkle is designed for users age 14 and older and focuses on fast, addictive, competitive gameplay using randomly selected YouTube videos chosen from approved humor-related keyword pools.

---

## 2. Core Vision

Smirkle turns passive video watching into an active skill-based game.

Instead of simply watching funny content, the player must fight their reaction and try not to laugh. The challenge is the game.

Core principle:
**Control your reaction = survive = score = rank up**

Target audience:
- Age 14+
- Players who enjoy competitive social apps
- Fans of viral humor, fail videos, and reaction challenges

---

## 3. Core Gameplay Loop

### 3.1 Pre-Game Face Lock
Before a round can begin, the app must confirm:
- front-facing camera permission granted
- face detected
- eyes open
- face centered and clearly visible
- neutral expression
- internet connection available
- playable video loaded and ready

The **Start** button is only visible and enabled once all required conditions are met.

If front-facing camera permission is denied, the player cannot play.

Rear-facing camera is not allowed for gameplay under any circumstance.

---

### 3.2 Active Session
Once the player starts a round:
- a YouTube video begins playing in fullscreen
- a small fixed Picture-in-Picture front camera overlay appears in one corner
- the player cannot pause, skip, fast-forward, rewind, or choose another video
- the player cannot replay the current video by choice
- the game continuously tracks the player’s face in real time
- score increases while the player survives

---

### 3.3 Real-Time Detection Rules
The game monitors:
- smile probability
- eye openness
- whether the face remains visible and centered
- whether the user appears to still be present and live
- internet/video playback state

Warnings are short visual alerts that appear only when the player is close to failing.

Warning examples:
- a short neon red border flash
- a brief warning pulse around the screen
- optional short haptic tap if haptics are enabled

Warnings should not last long. They are only meant to alert the player that they are about to fail.

---

### 3.4 Fail Conditions
A round ends immediately if any of the following happen:
- smile detected above fail threshold
- eyes closed for more than 2 seconds
- face leaves the camera frame
- face becomes too obscured to verify
- internet connection drops
- YouTube video fails to load
- video playback breaks during the round
- required front camera input is unavailable

When a fail occurs:
- video stops immediately
- score stops increasing
- screen flashes red
- fail message appears
- final session score is shown
- haptic feedback plays for about 3 seconds if enabled
- player is returned to the home screen after the fail sequence

Internet loss and video load failure should be handled the same way as a normal gameplay fail.

---

## 4. Scoring System

### 4.1 Session Score
Players earn:

**+111 points per second survived**

Score updates in real time while the player is successfully maintaining a neutral face.

### 4.2 Stored Score Rules
For registered users:
- highest session score is saved
- lifetime total score is saved
- lifetime total contributes to leveling and badges

For guests:
- gameplay is allowed
- scores are temporary only
- guest scores are not saved
- guest scores do not appear on leaderboards
- guest accounts do not earn long-term progression

---

## 5. Levels and Badges

### 5.1 Lifetime Score Progression
A registered player’s lifetime score total is used to determine level progression.

### 5.2 Level Formula
Use a quadratic scaling formula:

`required_xp_for_level(x) = 111 * (900 * x^2)`

Examples:
- Level 1 requirement = 99,900 XP
- Level 2 requirement = 399,600 XP
- Level 3 requirement = 899,100 XP

This formula can be adjusted later if progression feels too slow or too fast.

### 5.3 Badge Milestones
Players unlock badges at milestone levels such as:
- 5
- 15
- 45
- 135
- 405

Badge examples:
- Poker Face
- Why So Serious
- Stone Cold
- Unbreakable
- Legend

Badges should be fun, memorable, and themed around emotional control, humor resistance, and survival.

---

## 6. Video Selection Rules

### 6.1 Video Source
Smirkle uses YouTube videos for gameplay.

### 6.2 Video Selection Method
Videos are selected randomly from approved content pools based on keywords and categories.

Examples of keyword groups:
- funny
- laugh
- hilarious
- fail
- America’s Funniest
- try not to laugh
- comedy
- prank
- meme
- bloopers

### 6.3 Video Rules
Videos must be:
- age-appropriate for users 14+
- humor-based
- playable in-app
- approved for gameplay use
- not user-selectable during gameplay

### 6.4 Player Restrictions During Playback
The player cannot:
- choose the next video
- replay the current video
- pause
- skip
- fast-forward
- rewind

The gameplay experience should feel automatic, random, and competitive.

### 6.5 Optional Future Expansion
Possible future options:
- themed categories
- daily challenge playlist
- trending humor playlist
- manually curated premium playlists

---

## 7. UI and Navigation

## 7.1 Main Navigation
Smirkle uses a 7-point navigation bar:

1. **Home**
   - Main game screen
   - Video player
   - fixed camera overlay
   - live score
   - start conditions
   - fail and retry flow

2. **Search**
   - Find users by username

3. **Friends**
   - Add, remove, and manage friends

4. **Leaderboard**
   - Tab 1: Highest Session Scores
   - Tab 2: Lifetime Scores
   - Default top view shows top 25
   - Expand option shows top 100

5. **Upload**
   - Submit YouTube links
   - optional future support for file submission if moderation is added later

6. **Profile**
   - Profile photo
   - username
   - real name
   - birthdate
   - location
   - motto or quote
   - bio
   - stats
   - social links
   - public/private privacy controls

7. **Settings**
   - haptics on/off
   - video quality selection
   - in-app volume control from mute to 100%
   - theme options if added later

---

## 8. Settings Page Requirements

The Settings page must allow the user to:
- mute audio or adjust volume up to 100%
- toggle haptic feedback on or off
- choose preferred video quality
- manage account settings
- manage privacy settings
- sign out if registered
- continue as guest if using guest mode

Possible video quality options:
- Auto
- Low
- Medium
- High

---

## 9. Authentication and User Rules

### 9.1 Authentication Modes
Smirkle supports:
- Anonymous guest play
- Registered account login

### 9.2 Guest Requirements
Guests must:
- confirm they are at least 14 years old
- agree to Terms of Service

### 9.3 Registered Account Requirements
To register, users must provide:
- username
- email address
- birthdate
- password
- password confirmation
- agreement to Terms of Service

### 9.4 Password Rules
Passwords must:
- be at least 8 characters long
- contain uppercase letter
- contain lowercase letter
- contain number
- contain symbol

### 9.5 Age Gate
Minimum age is 14 years old.

The app should block account creation or gameplay access if the user does not meet the age requirement.

---

## 10. Social Features

Smirkle includes social features for registered users.

Core social functions:
- search users by username
- add friends
- manage friends list
- public/private profile toggle
- view user stats
- view saved high score
- view level and badges

Possible future social features:
- friend leaderboards
- direct challenges
- streak comparison
- reaction-free duel mode

---

## 11. Ads and Monetization

Smirkle will include ads.

Initial monetization plan:
- ads between rounds
- optional rewarded ads for cosmetic content or profile customization later
- no gameplay advantage purchases at launch

Ads should not:
- interrupt active rounds
- appear during live gameplay
- cover the camera overlay
- block the fail sequence

Best placement:
- before a new round
- after a failed round
- between navigation events in appropriate places

---

## 12. Game Feel and UX Direction

### Design Theme
Smirkle uses an **Electric Midnight** design style:
- dark background
- neon cyan accents
- neon magenta accents
- neon yellow accents
- glow effects
- sharp contrast
- high-energy “hacker” visual identity

### UX Goals
The app should feel:
- fast
- intense
- responsive
- competitive
- modern
- addictive
- visually satisfying

### Feedback Design
Important actions should feel immediate:
- button presses
- warning flashes
- fail events
- score updates
- level-up moments
- badge unlocks

---

## 13. Technical Architecture

### Frontend
- React Native
- Expo
- TypeScript

### Core UI
- React Navigation
- StyleSheet or theme system for Electric Midnight UI
- Expo Haptics

### Video Engine
- YouTube embedded playback solution

### Face Detection
- Vision Camera
- face detection plugin
- real-time frame processing
- smile probability and eye state tracking

### Backend
Firebase services:
- Authentication
- Firestore
- Storage
- optional Analytics
- optional Crashlytics
- optional Remote Config

---

## 14. Detection Thresholds and Gameplay Logic

These thresholds are starting points and can be tuned after testing.

### Smile Detection
- warning threshold: smiling probability >= 0.40
- fail threshold: smiling probability >= 0.60

### Eye Closure
- brief blink allowed
- warning if eyes appear closed near 1.0 second
- fail if eyes remain closed for more than 2.0 seconds

### Face Visibility
- warning if face is drifting too close to leaving frame
- fail if face is no longer reliably tracked
- fail if face is too obscured to verify expression

### Presence / Liveness
Basic anti-cheat/liveness checks should include:
- slight head movement over time
- natural eye state changes
- continuously updated face landmarks
- rejection if the app appears to be viewing a static image instead of a live face

These are starting rules only and may need refinement after testing on real devices.

---

## 15. Edge Case Handling

### If internet drops during a session
Treat as fail.

### If video fails to load
Treat as fail.

### If camera permission is denied
Player cannot start the game.

### If the front camera becomes unavailable
Treat as fail if already in session.
Prevent start if not already in session.

### If face is lost before the round starts
Keep Start button disabled.

### If YouTube video ends normally while player survives
Round ends successfully and score is finalized.

---

## 16. Anti-Cheat Guidelines

Smirkle should make cheating difficult.

Basic anti-cheat goals:
- front camera only
- no rear camera option
- detect live face, not a static image
- do not allow hidden or heavily obscured face
- require continuous face tracking during rounds
- fail if face disappears
- fail if camera feed becomes unusable

Possible future anti-cheat upgrades:
- stronger liveness detection
- challenge prompts
- random blink verification
- anti-spoofing model support

---

## 17. Firebase Architecture Overview

Firebase is the primary backend for:
- user accounts
- profiles
- sessions
- scores
- leaderboards
- video metadata
- uploads
- friendships
- badges
- settings

### Firebase Products Used
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- optional Firebase Analytics
- optional Firebase Crashlytics
- optional Firebase Cloud Functions
- optional Firebase Remote Config

---

## 18. Firestore Database Schema

## 18.1 Collection: `users`

Document ID:
- `uid`

Example fields:
- `uid: string`
- `isGuest: boolean`
- `username: string | null`
- `email: string | null`
- `realName: string | null`
- `birthdate: timestamp | null`
- `ageVerified14Plus: boolean`
- `createdAt: timestamp`
- `updatedAt: timestamp`
- `profileImageUrl: string | null`
- `location: string | null`
- `motto: string | null`
- `bio: string | null`
- `socialLinks: string[]`
- `privacyProfilePublic: boolean`
- `privacyStatsPublic: boolean`
- `highestSessionScore: number`
- `lifetimeScore: number`
- `currentLevel: number`
- `badgeIds: string[]`
- `friendsCount: number`
- `lastActiveAt: timestamp`
- `authProvider: string`
- `status: string`

Notes:
- guest users may have minimal user documents or temporary-only handling depending on implementation choice
- if guest docs are created, they should not save leaderboard progression

---

## 18.2 Collection: `userSettings`

Document ID:
- same as `uid`

Fields:
- `uid: string`
- `hapticsEnabled: boolean`
- `volumePercent: number`
- `videoQuality: string`
- `themeMode: string`
- `updatedAt: timestamp`

Allowed values:
- `volumePercent`: 0 to 100
- `videoQuality`: `auto`, `low`, `medium`, `high`
- `themeMode`: `dark`, `light`, or `system`

---

## 18.3 Collection: `sessions`

Document ID:
- auto-generated

Fields:
- `sessionId: string`
- `uid: string | null`
- `isGuest: boolean`
- `startedAt: timestamp`
- `endedAt: timestamp`
- `durationSeconds: number`
- `score: number`
- `videoId: string`
- `videoTitle: string`
- `videoSourceType: string`
- `failReason: string`
- `warningCount: number`
- `smileTriggered: boolean`
- `eyesClosedTriggered: boolean`
- `faceLostTriggered: boolean`
- `internetLostTriggered: boolean`
- `videoLoadFailureTriggered: boolean`
- `completedSuccessfully: boolean`
- `deviceModel: string | null`
- `appVersion: string | null`

Example `failReason` values:
- `smile_detected`
- `eyes_closed_too_long`
- `face_lost`
- `internet_lost`
- `video_load_failed`
- `camera_unavailable`
- `video_finished_success`

---

## 18.4 Collection: `leaderboards`

This collection can be generated by Cloud Functions or stored directly for fast reads.

Possible documents:
- `global_high_session`
- `global_lifetime`

Example structure:
- `type: string`
- `updatedAt: timestamp`
- `entries: array`

Each entry:
- `uid: string`
- `username: string`
- `profileImageUrl: string | null`
- `score: number`
- `level: number`

Alternative approach:
Use queryable ranking collections instead of arrays if scale becomes large.

---

## 18.5 Collection: `videos`

Document ID:
- auto-generated or YouTube video ID

Fields:
- `videoId: string`
- `youtubeVideoId: string`
- `title: string`
- `description: string | null`
- `thumbnailUrl: string | null`
- `sourceUrl: string`
- `keywordTags: string[]`
- `categoryTags: string[]`
- `isApproved: boolean`
- `isBlocked: boolean`
- `minAge: number`
- `language: string | null`
- `submittedByUid: string | null`
- `submittedAt: timestamp | null`
- `approvedAt: timestamp | null`
- `playCount: number`
- `failCount: number`
- `averageWatchDuration: number | null`
- `active: boolean`

---

## 18.6 Collection: `videoKeywordPools`

Document ID examples:
- `default_funny`
- `fails`
- `try_not_to_laugh`
- `americas_funniest`

Fields:
- `name: string`
- `keywords: string[]`
- `active: boolean`
- `updatedAt: timestamp`

This collection controls what kinds of random videos Smirkle fetches or rotates through.

---

## 18.7 Collection: `friendships`

Document ID:
- auto-generated or combined uid pair

Fields:
- `requestId: string`
- `fromUid: string`
- `toUid: string`
- `status: string`
- `createdAt: timestamp`
- `updatedAt: timestamp`

Allowed status values:
- `pending`
- `accepted`
- `declined`
- `blocked`

---

## 18.8 Collection: `badges`

Document ID:
- badge id string

Fields:
- `badgeId: string`
- `name: string`
- `description: string`
- `iconUrl: string | null`
- `requiredLevel: number`
- `active: boolean`
- `sortOrder: number`

---

## 18.9 Collection: `uploads`

Document ID:
- auto-generated

Fields:
- `uploadId: string`
- `submittedByUid: string`
- `type: string`
- `youtubeUrl: string | null`
- `storagePath: string | null`
- `status: string`
- `reviewNotes: string | null`
- `createdAt: timestamp`
- `reviewedAt: timestamp | null`
- `reviewedBy: string | null`

Allowed status values:
- `pending`
- `approved`
- `rejected`

---

## 18.10 Collection: `reports`
Optional but recommended for moderation.

Fields:
- `reportId: string`
- `reportedByUid: string`
- `targetType: string`
- `targetId: string`
- `reason: string`
- `details: string | null`
- `createdAt: timestamp`
- `status: string`

---

## 19. Firebase Storage Structure

Recommended paths:

- `profileImages/{uid}/avatar.jpg`
- `badgeIcons/{badgeId}.png`
- `uploadedVideos/{uid}/{uploadId}`
- `reportAttachments/{reportId}/{filename}`

Storage rules should prevent unauthorized access and writes.

---

## 20. Suggested Firestore Security Rules Strategy

High-level rules:
- users can read public profiles
- users can edit only their own profile
- users can edit only their own settings
- guest scores should not populate public leaderboard entries
- uploads should require authentication if guest uploads are not allowed
- moderation/admin fields should be protected
- blocked or inactive videos should not be served to gameplay clients

---

## 21. Suggested Cloud Functions

Recommended backend functions:
- update highest session score after session ends
- update lifetime score after session ends
- recalculate user level after lifetime score changes
- grant badges automatically when level milestones are reached
- maintain leaderboard snapshots
- validate uploaded video submissions
- clean/sanitize usernames and profile data
- possibly rotate or refresh approved random video pools

---

## 22. Recommended App Directory Structure

```text
src/
  app/
    navigation/
      AppNavigator.tsx
      RootTabs.tsx
  components/
    camera/
      FaceLockOverlay.tsx
      PipCameraView.tsx
      WarningBorder.tsx
    game/
      GameHUD.tsx
      FailOverlay.tsx
      ScoreDisplay.tsx
      StartPanel.tsx
    common/
      AppButton.tsx
      AppText.tsx
      LoadingScreen.tsx
  screens/
    HomeScreen.tsx
    SearchScreen.tsx
    FriendsScreen.tsx
    LeaderboardScreen.tsx
    UploadScreen.tsx
    ProfileScreen.tsx
    SettingsScreen.tsx
    Auth/
      LoginScreen.tsx
      RegisterScreen.tsx
      GuestGateScreen.tsx
  services/
    firebase/
      firebase.ts
      auth.ts
      firestore.ts
      storage.ts
    gameplay/
      faceDetection.ts
      failLogic.ts
      scoreEngine.ts
      videoSelector.ts
    ads/
      adManager.ts
  store/
    authStore.ts
    settingsStore.ts
    gameStore.ts
  hooks/
    useFaceDetection.ts
    useGameSession.ts
    useVideoPlayback.ts
  theme/
    colors.ts
    spacing.ts
    typography.ts
  types/
    user.ts
    session.ts
    video.ts
    leaderboard.ts
    badge.ts
  utils/
    validators.ts
    math.ts
    formatters.ts

    