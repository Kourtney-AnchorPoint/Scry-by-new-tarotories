import { base44 } from '@/api/base44Client';

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

export function trackEvent(eventName, properties = {}) {
  // Platform analytics (signed-in users only — silently no-ops for anonymous)
  try {
    base44.analytics.track({ eventName, properties });
  } catch {
    // analytics is non-critical — silent fail
  }
  // Our own event log — works for EVERYONE, anonymous visitors included
  try {
    base44.functions.invoke('trackEvent', {
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