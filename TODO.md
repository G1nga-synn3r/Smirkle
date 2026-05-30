# TODO: Video failure handling

- [ ] Update `components/YouTubePlayer.tsx`
  - [ ] Add `onError` prop
  - [ ] Bridge WebView errors via `onError`/`onHttpError`
  - [ ] Use YouTube IFrame API + postMessage events for `state` and `error`
  - [ ] Add RN-side `onMessage` handler
- [ ] Update `Screens/GameScreen.tsx`
  - [ ] Add `video_fail` to `FailReason`
  - [ ] Add "video never started" timeout (e.g. 12s) after `gameStarted`
  - [ ] Clear timeout on `playing` event
  - [ ] On video error callback, call `triggerFail('video_fail')`
- [ ] Validate
  - [ ] Typecheck/lint (if scripts exist)
  - [ ] Manual QA: kill internet / allow but fail youtube / ensure clean game-over

