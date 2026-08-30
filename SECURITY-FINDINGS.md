# Security findings — camera injection & liveness

Authorized security testing of the QuePass platform-registration face capture, on
the **dev** environment, using the tester's own face and documents.

## TL;DR

The face capture reads frames from the browser's `getUserMedia`, which page
JavaScript fully controls. We replaced it and fed the SDK a **pre-recorded
video**. The app's new tamper check that tries to stop this is **bypassable from
the same page**. The **liveness backstop currently rejects** the injected video —
that is the layer actually holding today. Because every client-side control runs
where the attacker runs, the durable fix is **server-side**.

## What we did (plain english)

1. **Swapped the camera.** Before the app loads, we replace `getUserMedia` — the
   browser function the SDK calls for the webcam — with our own. Now the app gets
   whatever we choose, not a real camera.
2. **Fed it a video.** We play a recorded clip on a hidden `<video>`, paint it to
   a canvas every frame, and hand the app that canvas as a "live" stream. It looks
   identical to a webcam feed.
3. **Made it actually work:** relax the app's `exact` resolution request to
   `ideal` (else the fake device is rejected → black screen); hand out a **fresh**
   stream on every call (the app stops the track after each shot); and **zoom** the
   clip so the face sits right in the oval.
4. **Two cameras in one flow:** the same fake camera switches content — passport
   image first, then face video — for the passport-then-face registration.

## Getting past the new tamper check

The app recently added a check that errors with **"underlying native no longer
native"** when `getUserMedia` is no longer the genuine built-in. It looks for two
tells, and both are forgeable from the page:

- **Where the function lives.** Native functions live on the shared *prototype*,
  not as an own-property of the instance. A naive `obj.getUserMedia = fake` is a
  giveaway; we installed our fake **on the prototype**, where the real one lives.
- **What it says about itself.** Printing a native function shows
  `function getUserMedia() { [native code] }`. We hijacked the printer
  (`Function.prototype.toString`) so our fake reports that same `[native code]`
  string — **and made the printer lie about itself too**, so a check can't detect
  that the printer was tampered with. (We also set the fake's `.name` to
  `getUserMedia`.)

**Why it can never be won in the browser:** the check is JavaScript in the page;
the attacker's code is also JavaScript in the page, and loads first. Anything the
check can inspect, the attacker can fake before it looks. It's a speed bump, not a
lock.

## The real fix (server-side)

- **Untrust the browser camera** — anything the page can call, the page can fake.
- **Server-issued, time-bound, randomized challenges** (it's a fixed "Smile" today)
  so a recorded clip can't pre-answer a challenge it never saw.
- **Capture attestation** — cryptographic proof from the device/OS that frames came
  from a real capture pipeline; the page can't forge a signature it doesn't hold.
- **Drop the tamper check as a security control** (keep as telemetry) — it's
  page-side and forgeable.

## Where it lives in the code

| Piece | File |
| --- | --- |
| getUserMedia override, constraint softening, canvas injection, tamper bypass | `src/support/fixtures.ts` (`page.addInitScript`) |
| Passport image + face video injection during the flow | `src/pages/PlatformRegistrationPage.ts` |
| Real endpoint names (`AnalyzePassport`, `VerifyAndSearch`, `Signup`) | `src/config/apiEndpoints.ts` |
| Anti-spoof regression guard | `features/liveness-injection-guard.feature` |

## Regression guard

`features/liveness-injection-guard.feature` feeds a recorded clip as the camera and
**passes only if the system rejects it** (the injected face must never reach
`VerifyAndSearch`). It goes red if a future change ever lets an injected stream
through.

```bash
npm run test:headed:serial -- -g "must be rejected by liveness"
```

## Reproduce

See `RUNNING-AI-TESTS.md`. You need, shared privately (not in this repo):
operator **credentials** for `.env`, and a valid **passport image** at
`fixtures/media/passport-front.jpeg`.
