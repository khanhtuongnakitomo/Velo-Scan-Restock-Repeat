# Receiver form: audit, decisions, validation

Scope: the count form (`phone('count', 'counted')`), the flag form (`phone('flag')`), their shared primitives in `public/demo/velo-ui.css`, and the handlers in `public/demo/app.html`. Rules for the static screens and the prototype live in one place (`countCheck`, `countHint`, `flagCheck`, `summary` in `velo-ui.js`, exported on `VeloUI`).

## 1. Completion problems before

| Where | Problem |
|---|---|
| Count | Counts were `<b>` numbers with 34px −/+ buttons only. No way to type a count, so a pallet of 96 meant 96 taps. |
| Count | No label tied to a control, no focus ring, no error or loading state. |
| Count | Damaged could exceed the claimed quantity without comment. |
| Flag | Reason chips were `<button>`s at about 30px tall, no group label, no required-reason rule. |
| Flag | Submit worked with no reason, no photo or no driver. Damage claims reached the manager without evidence. |
| Flag | Photo and driver actions completed instantly: no uploading state, so no sense that something happened. |
| All | Header back / profile buttons were 32px, tabs and fallback chips under 44px. No hover or disabled-vs-loading distinction. |

## 2. Decisions

- Single column. Label above input. `<input type=number inputmode=numeric>` with 44px −/+ steppers kept (existing `inc:`/`dec:` `data-act`s unchanged, field order unchanged).
- Validation runs on blur (count inputs), on change (reason checkboxes) and after a photo/driver action. Never on `input`. While typing, an existing error stays; the next blur re-validates (fixed: clears, still wrong: new message).
- A blur updates the DOM in place (`paintCount`), so tabbing to the next field never rebuilds the screen and drops focus.
- Invalid text never reaches the state. `S.good/S.dmg` keep the last valid number; the typed text is kept in `S.raw` only so the field shows what the user typed next to the error.
- Short/over is not an error. It is a neutral helper line (`countHint`); the match screen handles it. Only impossible values are errors.
- Save and Submit validate everything, render errors plus a summary line, and focus the first invalid control. When valid: loading state for 700ms (`aria-busy`, further actions ignored), then the original outcome.
- Photo tap: 700ms `Uploading…` state, then the photo is attached.
- Error styling: alert border plus message text with a leading `!`, so colour is never the only cue. Messages say what to do ("Enter 0 if there are none").
- Loading: `.is-loading` + `.v-spin` (CSS border spinner, no gradients, honours `prefers-reduced-motion`).
- Focus: 2px violet outline, 2px offset, on every phone control (`:focus-visible`); reason chips show it on the label via `:has()`.
- Every interactive phone element is at least 44×44: `.ph-back`, `.ph-me`, `.ph-tab`, `.v-step`, `.v-input`, `.rsb` (the hidden checkbox covers its label), `.fb` chips, camera mode buttons, `.ev-add`, `.v-btn`, sheet close.

## 3. Validation table

| Field | Rule | Message | When |
|---|---|---|---|
| Counted good | not empty | Enter how many tubes you counted in good condition, like 96. Enter 0 if there are none. | blur, Save |
| Damaged | not empty | Enter how many tubes are damaged. Enter 0 if none are. | blur, Save |
| Both counts | whole number | Enter a whole number, like 96. Letters and decimals can't be counted. | blur, Save |
| Both counts | not negative | Counts can't go below 0. Enter 0 if there are none. | blur, Save |
| Both counts | at most 999 | N is more than 999 tubes. Check for an extra digit, then recount. | blur, Save |
| Damaged | not above the claimed quantity | Damaged can't be more than the 100 tubes on the note. Recount the damaged pile, or flag OVER on the next screen. | blur, Save |
| Reason | at least one | Pick at least one reason, like DAMAGED if units are crushed. | change, Submit |
| Photo | required when DAMAGED is selected | Take a photo of the damaged units. Managers can't approve damage without one. | Submit; refreshed after photo |
| Driver | required when DAMAGED, SHORT, OVER or WRONG ITEM, once the photo (if needed) exists | Hand the phone to the driver and tap confirm. Damage and shortage claims need the driver's OK at the dock. | Submit; refreshed after driver action |
| Summary | any of the above failing on Save / Submit | Can't save yet. Fix N items above: … / Can't submit yet … | Save, Submit |

Browsers block letters in `type=number`, so typing `abc` leaves the field empty; the empty-field message shows on blur. Pasted/odd text that the browser flags unparseable gets the whole-number message.

## 4. State matrix

| State | Count input / step | Reason chip | Photo | Driver | Primary button |
|---|---|---|---|---|---|
| Default | fog fill, hairline border | white, hairline | dashed border | fog card | violet fill |
| Hover | border ink | border ink | border ink | button border ink | fill turns ink |
| Focus-visible | violet 2px ring | ring on label | ring | ring | ring |
| Disabled | 40% opacity, no pointer (while saving) | n/a | n/a | locked until photo | 40% opacity |
| Loading | inputs disabled | n/a | spinner + `Uploading…` | n/a | spinner + `Saving…` / `Submitting…`, `aria-busy` |
| Error | alert border, `!` message, `aria-invalid` | alert border on chips | alert message | alert border + message | summary line above it |

Static screens for review (`/demo/screens.html`): `phone-count-error`, `phone-count-saving`, `phone-flag-error`, `phone-flag-submitting`.

## 5. Measurements

Interactive elements (`a, button, [role=button], input, select, summary, label, [data-act]`) inside `.ph-screen` and the app chrome, by `offsetWidth/offsetHeight`, excluding `label.v-lbl[for]` captions (their control, the input, is 44px tall):

- `/demo/screens.html` at 1440, all 21 phone screens: 0 elements under 44px.
- `/demo/app.html` at 390, walked live (deliveries, note, extract, count aim, count, match, flag, flag with photo + driver, submitted): 0 under 44px on every screen.
- `/demo/app.html` initial view at 390, 768, 1440: 0 under 44px.
- Horizontal scroll (`scrollWidth` / `innerWidth`): 390/390, 768/768, 1440/1440.
- Console errors on app, screens and player: 0.

## 6. Walk-through results (`/demo/app.html`, 390×844)

1. Type letters into COUNTED GOOD: field stays empty, no message while typing. Blur: the fix-it message appears, focus stays moving to the next control. Type 90, no change while typing; blur: message clears, hint recomputes (94 counted, 6 short).
2. Damaged 150: on blur, error "can't be more than the 100 tubes"; counts in state stay at the last valid values.
3. Save with an error showing: summary line "Can't save yet…", focus moves to the first invalid field. Fixing both fields clears the summary.
4. Save with valid counts: `Saving…` spinner with `aria-busy=true`, then line 2. Same for line 2, then the match screen.
5. Flag: Submit with no photo: photo error, summary, focus on the photo button. Photo tap shows `Uploading…`, then the thumbnail; the photo error clears. Driver confirm clears the driver rule. Submit shows `Submitting…` (`aria-busy=true`), then the Submitted screen; double taps are ignored while busy.
6. Demo player (`/demo/index.html`) still plays the full sequence: deliveries, note, extract, both counts, match, flag, submitted, receipt. No console errors.

Screenshots: `design/audit/after/phone-count-{default,error,focus,loading}-390.png`, `phone-flag-{default,error,uploading,submitting}-390.png`, `*-static.png` for the four new screens, `demo-app-{390,768,1440}.png`.

## 7. Review fixes

- Count fields are a single column: COUNTED GOOD (label, then − input +, full width), then DAMAGED, then errors and helper. Field order unchanged.
- Camera: `.ph-cam` has 64px bottom padding and a 280px minimum height, and the scan frame is offset to match, so the 44px mode bar (BARCODE · EAN / SEARCH / PHOTO) no longer covers the barcode digits. Checked on the count and note camera at 390 and in the 390×844 phone frame (`phone-count-aim-390.png`, `phone-note-aim-390.png`, `*-static.png`).
- While a count error is showing, the batch card and the helper line are hidden so Save stays above the tab bar in the phone frame.
- The black "Submit for approval" in the earlier flag-error shot was the hover state (the pointer was still over the button after the click). Computed background after moving the pointer away: `rgb(95, 121, 255)` (violet). All states re-shot with the pointer parked away from controls, after the checkbox hit-area fix.
