import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Reads a required environment variable, throwing a clear error when it is
 * missing so failures surface as configuration problems rather than obscure
 * runtime errors deep inside a test.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env and provide a value.`
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

/**
 * Centralised, typed configuration for the whole suite. Every credential,
 * URL and timeout lives here instead of being hardcoded in individual tests.
 */
export const env = {
  baseUrl: required('BASE_URL'),

  credentials: {
    email: required('AUTH_EMAIL'),
    password: required('AUTH_PASSWORD'),
    channel: optional('CHANNEL', '1'),
  },

  defaultEvent: optional('DEFAULT_EVENT', 'Mulitple - Mumbai'),

  /**
   * Absolute path to a Y4M/MJPEG video used as a fake webcam so face-capture
   * flows run without a person in front of the camera (CI-friendly). Empty
   * string disables it and the real camera is used. Set FAKE_CAMERA_VIDEO in
   * .env to a path relative to the project root or an absolute path.
   */
  fakeCameraVideo: process.env.FAKE_CAMERA_VIDEO
    ? path.resolve(process.cwd(), process.env.FAKE_CAMERA_VIDEO)
    : '',

  timeouts: {
    api: Number(optional('API_TIMEOUT', '60000')),
    test: Number(optional('TEST_TIMEOUT', '120000')),
  },
} as const;
