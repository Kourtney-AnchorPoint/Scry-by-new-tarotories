import { client } from '@/lib/amplifyClient';
import { fetchAuthSession } from 'aws-amplify/auth';

// Narration only. CRITICAL: never used to compute astrological placements —
// Sun/Moon/Rising and all chart data come from src/api/functions/astronomy.js
// (real ephemeris math), not from this.
//
// Calls Bedrock via the invokeClaude mutation — client sends only
// {action, params, model}, never raw prompt text (server-side prompt
// templates build the actual prompt).
export async function invokeLLM({ action, params, model }) {
  try {
    // The backend accepts a user_email fallback for rate-limiting/lookup
    // when Cognito identity claims aren't present on the AppSync event
    // (attaching it explicitly here sidesteps that rather than relying on
    // userPool auth propagation, which this client setup doesn't reliably do).
    let user_email;
    try {
      const session = await fetchAuthSession();
      user_email = session.tokens?.idToken?.payload?.email;
    } catch {
      // not signed in — leave user_email undefined
    }

    // The `params` argument is an AWSJSON scalar — AppSync's variable
    // coercion for AWSJSON expects a JSON-encoded string on the wire, not a
    // raw object (passing an object throws "Variable 'params' has an
    // invalid value").
    const { data, errors } = await client.mutations.invokeClaude({
      action,
      params: JSON.stringify(params || {}),
      model,
      user_email,
    });
    if (errors?.length) throw new Error(errors[0].message);
    return data;
  } catch (err) {
    console.error('invokeLLM failed:', err);
    throw err;
  }
}
