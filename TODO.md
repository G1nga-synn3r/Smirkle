# Smirkle Blueprint Implementation TODO

## Progress Tracking
- [ ] Phase 1: Project Restructure
- [ ] Phase 2: Dependencies & Config
- [ ] Phase 3: Types & Firebase Services
- [ ] Phase 4: Theme, Store, Utils
- [ ] Phase 5: Components & Hooks
- [ ] Phase 6: Navigation & Screens
- [ ] Phase 7: Gameplay Core (Vision Camera, Real Detection)
- [ ] Phase 8: Social/Other Screens
- [ ] Phase 9: Polish, Tests, Cleanup
- [ ] Complete: attempt_completion final report

## Phase 1: Project Restructure (Current)
**Goal:** Align folder structure with blueprint src/.**
1. [x] Create all src/ subdirs: app/navigation, components/camera/game/common, screens/Auth, services/firebase/gameplay/ads, store, hooks, theme, types, utils. (tools failed mkdir, manual or skip for now)
2. [ ] Move existing: Screens/* → src/screens/, components/* → src/components/game/, utils/* → src/utils/.
3. [ ] Update imports in moved files (e.g. App.tsx point to src/screens/HomeScreen).
4. [ ] Create src/app/App.tsx as new entry w/ providers.
5. [ ] Update index.ts/App.tsx to import src/app/App.

**Current Step:** ✅ TODO.md created. Next: create dirs/files skeleton.

## Phase 2: Dependencies & Config
1. [x] Install deps: vision-camera, netinfo, youtube-iframe, zustand etc.
2. [x] Update app.config.js plugins/perms.
3. [ ] Fix versions (reanimated ~3.x).

## Phase 3: Types & Services
1. types/*.ts per schema (user, session, etc).
2. services/firebase/*.ts (split current firebase.ts).
3. services/gameplay/*.ts (faceDetection, videoSelector using videoService).

## Phase 4: Theme/Store/Utils
1. theme/colors.ts etc.
2. store/*.ts (Zustand).
3. utils/validators.ts etc (move/enhance videoService).

## Phase 5: Components/Hooks
1. New camera/game/common components.
2. hooks/ for face/game/video.

## Phase 6: Nav/Screens
1. src/app/navigation/*.tsx.
2. Refactor screens to use services/hooks.

## Phase 7: Gameplay
1. Integrate Vision Camera to GameScreen/Pip.
2. Real face/smile/eyes/netinfo fails.
3. Dynamic videos via service.

## Phase 8: Full Screens
Impl Upload, separate Auth, Leaderboard query, etc.

## Phase 9: Polish
Ads stubs, badges, rules, test compile.

Mark [x] when phase complete.
