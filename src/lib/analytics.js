import { client } from '@/lib/amplifyClient';

function getSessionId() {
  try {
    let id = localStorage.getItem('cosmic_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('cosmic_session_id', id);
    }
    return id;
  } catch {
    return '';
  }
}

// Writes to the app's own AppEvent log via the trackEvent mutation — works
// for anonymous visitors too. Base44's bundled platform-analytics product
// has no AWS equivalent, so this is now the only event stream.
export function trackEvent(eventName, properties = {}) {
  try {
    client.mutations.trackEvent({
      event_name: eventName,
      properties,
      session_id: getSessionId(),
      path: window.location.pathname,
    }).catch(() => {});
  } catch {
    // non-critical
  }
}

// Fires once per browser session — counts every visitor, logged in or not
export function trackVisit() {
  try {
    if (sessionStorage.getItem('visit_tracked')) return;
    sessionStorage.setItem('visit_tracked', '1');
    trackEvent('app_opened');
  } catch {
    // non-critical
  }
}
