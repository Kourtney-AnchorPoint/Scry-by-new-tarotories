const KEY = 'installed_from_play_store';

// The Android (Google Play) build opens with referrer android-app://<package>.
// Once detected, remember it — Play policy forbids selling subscriptions via
// outside payment systems inside the Play-distributed app.
export function detectPlayStore() {
  try {
    if (document.referrer.startsWith('android-app://')) {
      localStorage.setItem(KEY, '1');
    }
  } catch {
    // storage unavailable — treat as web
  }
}

export function isPlayStoreApp() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}