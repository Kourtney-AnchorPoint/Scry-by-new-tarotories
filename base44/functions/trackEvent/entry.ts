import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const eventName = typeof body?.event_name === 'string' ? body.event_name.slice(0, 64) : '';
    if (!eventName) {
      return Response.json({ error: 'event_name required' }, { status: 400 });
    }

    // Works for anonymous visitors too — user is simply null
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }

    const properties = (body?.properties && typeof body.properties === 'object' && !Array.isArray(body.properties))
      ? body.properties
      : {};

    await base44.asServiceRole.entities.AppEvent.create({
      event_name: eventName,
      properties,
      session_id: String(body?.session_id || '').slice(0, 64),
      path: String(body?.path || '').slice(0, 200),
      user_email: user?.email || '',
      is_anonymous: !user,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});