import { test as base, createBdd } from 'playwright-bdd';
import { SettingsPage } from '../pages/SettingsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EventPage } from '../pages/EventPage';
import { BiometricPage } from '../pages/BiometricPage';
import { PlatformRegistrationPage } from '../pages/PlatformRegistrationPage';
import { env } from '../config/env';

/**
 * Page objects exposed to step definitions as Playwright fixtures. Each is
 * lazily constructed per scenario and shares the scenario's `page`.
 */
export type QuePassFixtures = {
  settingsPage: SettingsPage;
  dashboardPage: DashboardPage;
  eventPage: EventPage;
  biometricPage: BiometricPage;
  platformPage: PlatformRegistrationPage;
  /** Shared per-scenario store, e.g. the path of a downloaded pass. */
  passStore: { path?: string };
};

export const test = base.extend<QuePassFixtures>({
  /**
   * When a fake camera video is configured, relax the app's getUserMedia
   * constraints before any app code runs. Chromium's fake-file device plays the
   * file at its native size and won't satisfy an `exact` resolution/deviceId
   * constraint, so the app's request would otherwise return an empty (black)
   * stream. Downgrading `exact` -> `ideal` and dropping device pinning lets the
   * injected video be accepted whatever its resolution. Set DEBUG_GUM=1 to log
   * the constraints the app requests and the resulting track settings.
   */
  page: async ({ page }, use) => {
    if (env.fakeCameraVideo) {
      if (process.env.DEBUG_GUM) {
        page.on('console', (m) => {
          const t = m.text();
          if (t.startsWith('GUM')) console.log(t);
        });
      }
      if (process.env.DEBUG_NET) {
        page.on('response', (r) => console.log(`NET ${r.status()} ${r.url()}`));
      }
      if (process.env.DEBUG_REQ) {
        page.on('request', (req) => {
          const url = req.url();
          if (!/CheckFaceLiveness|VerifyAndSearch|AnalyzePassport/.test(url)) return;
          const buf = req.postDataBuffer();
          const ct = req.headers()['content-type'] || '';
          let bytes = 0;
          let images = 0;
          let shape = '';
          if (buf) {
            bytes = buf.length;
            const latin = buf.toString('latin1');
            images = (latin.match(/\/9j\/|data:image\/|\x89PNG/g) || []).length;
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const describe = (o: any): string =>
                Array.isArray(o)
                  ? `array(${o.length})`
                  : Object.entries(o)
                      .map(([k, v]) =>
                        Array.isArray(v)
                          ? `${k}[${v.length}]`
                          : typeof v === 'string'
                            ? `${k}:str(${v.length})`
                            : v && typeof v === 'object'
                              ? `${k}{${Object.keys(v).join('|')}}`
                              : `${k}:${typeof v}`
                      )
                      .join(' ');
              shape = describe(JSON.parse(buf.toString('utf8')));
            } catch {
              shape = ct.includes('multipart') ? 'multipart' : 'non-json';
            }
          }
          console.log(
            `REQ ${req.method()} ${url.replace(/\?.*/, '')} ct=${ct} bytes=${bytes} images~${images} shape=[${shape}]`
          );
        });
      }
      if (process.env.DEBUG_RESP) {
        page.on('response', async (r) => {
          const url = r.url();
          if (!/CheckFaceLiveness|VerifyAndSearch|AnalyzePassport/.test(url)) return;
          let body = '';
          try {
            body = await r.text();
          } catch {
            body = '<unreadable>';
          }
          let shape = '';
          try {
            const j = JSON.parse(body);
            shape = Array.isArray(j) ? `array(${j.length})` : Object.keys(j).join(',');
          } catch {
            shape = 'non-json';
          }
          console.log(
            `RESP ${r.status()} ${url.replace(/\?.*/, '')} bytes=${body.length} shape=[${shape}] head=${JSON.stringify(
              body.slice(0, 220)
            )}`
          );
        });
      }
      await page.addInitScript(() => {
        const md = navigator.mediaDevices;
        if (!md || !md.getUserMedia) return;
        const proto = Object.getPrototypeOf(md) as MediaDevices;
        const origGUM = proto.getUserMedia as (
          c?: MediaStreamConstraints
        ) => Promise<MediaStream>;
        const w = window as unknown as {
          __setCameraImage?: (
            dataUrl: string,
            fit?: number,
            crop?: { x: number; y: number; w: number; h: number }
          ) => Promise<boolean>;
          __setCameraVideo?: (dataUrl: string) => Promise<boolean>;
          __clearCameraImage?: () => void;
        };

        // On-demand fake camera content for multi-capture flows (platform
        // registration scans a passport image, then captures a face video). One
        // persistent canvas is exposed as a single MediaStream; only the CONTENT
        // drawn into it changes between steps. That survives both cases — the app
        // requesting the camera again per step, or reusing the first stream. Each
        // source is drawn smaller than the frame (fit < 1) because both the
        // document scanner and the face detector reject a too-close subject.
        const CANVAS_W = 1280;
        const CANVAS_H = 960;
        let camCanvas: HTMLCanvasElement | null = null;
        let camCtx: CanvasRenderingContext2D | null = null;
        type Crop = { x: number; y: number; w: number; h: number };
        let source:
          | { kind: 'image'; el: HTMLImageElement; fit: number; crop?: Crop }
          | { kind: 'video'; el: HTMLVideoElement; fit: number }
          | null = null;

        const ensureCam = () => {
          if (camCanvas) return;
          camCanvas = document.createElement('canvas');
          camCanvas.width = CANVAS_W;
          camCanvas.height = CANVAS_H;
          camCtx = camCanvas.getContext('2d');
          const loop = () => {
            if (camCtx) {
              camCtx.fillStyle = '#8b8b8b';
              camCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
              if (source) {
                const iw = source.kind === 'image' ? source.el.naturalWidth : source.el.videoWidth;
                const ih = source.kind === 'image' ? source.el.naturalHeight : source.el.videoHeight;
                // Optional source-crop (fractions) — used to isolate the QR code
                // from a full pass image so it fills the scan frame.
                const crop = source.kind === 'image' ? source.crop : undefined;
                const sx = crop ? crop.x * iw : 0;
                const sy = crop ? crop.y * ih : 0;
                const sw = crop ? crop.w * iw : iw;
                const sh = crop ? crop.h * ih : ih;
                if (sw && sh) {
                  const s = Math.min((CANVAS_W * source.fit) / sw, (CANVAS_H * source.fit) / sh);
                  const dw = sw * s;
                  const dh = sh * s;
                  camCtx.drawImage(
                    source.el,
                    sx,
                    sy,
                    sw,
                    sh,
                    (CANVAS_W - dw) / 2,
                    (CANVAS_H - dh) / 2,
                    dw,
                    dh
                  );
                }
              }
            }
            requestAnimationFrame(loop);
          };
          requestAnimationFrame(loop);
        };

        w.__setCameraImage = (dataUrl: string, fit = 0.6, crop?: Crop) =>
          new Promise<boolean>((resolve, reject) => {
            ensureCam();
            const el = new Image();
            el.onload = () => {
              source = { kind: 'image', el, fit, crop };
              resolve(true);
            };
            el.onerror = () => reject(new Error('camera image failed to load'));
            el.src = dataUrl;
          });

        w.__setCameraVideo = (dataUrl: string) =>
          new Promise<boolean>((resolve, reject) => {
            ensureCam();
            const el = document.createElement('video');
            el.muted = true;
            el.loop = true;
            el.playsInline = true;
            el.autoplay = true;
            // Attach (hidden) to the DOM — a detached <video> often does not decode
            // frames, so drawImage would paint black. Off-screen but in-document.
            el.style.position = 'fixed';
            el.style.left = '-10000px';
            el.style.top = '0';
            el.style.width = '2px';
            el.style.height = '2px';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
            document.body.appendChild(el);
            el.onloadeddata = () => {
              el.play().then(
                () => {
                  source = { kind: 'video', el, fit: 1.3 };
                  resolve(true);
                },
                (e) => reject(e as Error)
              );
            };
            el.onerror = () => reject(new Error('camera video failed to load'));
            el.src = dataUrl;
          });

        w.__clearCameraImage = () => {
          source = null;
        };

        const relax = (val: unknown) =>
          val && typeof val === 'object' && 'exact' in (val as Record<string, unknown>)
            ? { ideal: (val as Record<string, unknown>).exact }
            : val;

        // Patch getUserMedia on the PROTOTYPE (native methods live on the
        // prototype, not as an own property of the instance) and disguise it as
        // native code below, so the app's anti-tamper check — which errors with
        // "underlying native no longer native" when getUserMedia is no longer
        // native — does not detect the override.
        function fakeGetUserMedia(this: MediaDevices, constraints?: MediaStreamConstraints) {
          if (constraints && typeof constraints.video === 'object') {
            const v: Record<string, unknown> = { ...(constraints.video as object) };
            for (const k of ['width', 'height', 'frameRate', 'aspectRatio']) {
              if (k in v) v[k] = relax(v[k]);
            }
            delete v.deviceId;
            delete v.facingMode;
            constraints = { ...constraints, video: v as MediaTrackConstraints };
          }
          // Injected canvas content wins whenever a source has been set. Hand out
          // a FRESH stream each call — the app stops the track after each capture,
          // so a reused stream would be 'ended' (black) on the next capture.
          if (camCanvas) {
            return Promise.resolve(camCanvas.captureStream(30));
          }
          return origGUM.call(this, constraints);
        }
        Object.defineProperty(fakeGetUserMedia, 'name', { value: 'getUserMedia' });
        Object.defineProperty(proto, 'getUserMedia', {
          value: fakeGetUserMedia,
          writable: true,
          enumerable: false,
          configurable: true,
        });

        // Make Function.prototype.toString report native code for the patched
        // getUserMedia (and for itself), defeating `toString().includes("[native
        // code]")` integrity checks.
        const nativeToString = Function.prototype.toString;
        function stealthToString(this: unknown): string {
          if (this === fakeGetUserMedia) return 'function getUserMedia() { [native code] }';
          if (this === stealthToString) return 'function toString() { [native code] }';
          return nativeToString.call(this);
        }
        Object.defineProperty(Function.prototype, 'toString', {
          value: stealthToString,
          writable: true,
          enumerable: false,
          configurable: true,
        });
      });
    }
    await use(page);
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  eventPage: async ({ page }, use) => {
    await use(new EventPage(page));
  },
  biometricPage: async ({ page }, use) => {
    await use(new BiometricPage(page));
  },
  platformPage: async ({ page }, use) => {
    await use(new PlatformRegistrationPage(page));
  },
  passStore: async ({ page: _page }, use) => {
    await use({});
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
