/**
 * URL fragments for the backend API calls the UI triggers. Tests wait on these
 * (via `page.waitForResponse`) to synchronise on real network completion instead
 * of arbitrary sleeps. Grouped by the business action that fires them.
 */
export const Api = {
  getConfig: 'GetConfig',
  checkFaceLiveness: 'CheckFaceLiveness',
  search: 'Search',

  biometricLogin: 'BiometricLogin',
  biometricVerify: 'BiometricVerify',
  expressVerification: 'ExpressVerification',

  registerEventByQr: 'RegisterEventByQR',

  eventBiometricCheckIn: 'EventBiometricCheckIn',
  checkInRegistrantByBiometric: 'CheckInRegistrantByBiometric',

  eventQrCheckIn: 'EventQRCheckIn',
  getEventPub: 'GetEventPub',
  checkInRegistrantByQr: 'CheckInRegistrantByQR',

  analysePassport: 'AnalyzePassport',
  verifyAndSearch: 'VerifyAndSearch',
  signup: 'Signup',
} as const;

/** Endpoint groups a single business action is expected to trigger together. */
export const ApiGroups = {
  faceLogin: [Api.checkFaceLiveness, Api.biometricLogin],
  faceTransaction: [Api.checkFaceLiveness, Api.biometricVerify],
  expressVerification: [Api.checkFaceLiveness, Api.expressVerification],
  faceSearch: [Api.checkFaceLiveness, Api.search],
  search: [Api.search],
  registration: [Api.search, Api.registerEventByQr],
  biometricCheckIn: [Api.eventBiometricCheckIn, Api.checkInRegistrantByBiometric],
  qrCheckIn: [Api.eventQrCheckIn, Api.getEventPub, Api.checkInRegistrantByQr],
  // Platform registration: face capture triggers liveness + a combined verify/search.
  platformFaceVerify: [Api.checkFaceLiveness, Api.verifyAndSearch],
} as const;
