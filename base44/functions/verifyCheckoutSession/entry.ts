import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_id } = await req.json();
    if (!session_id) return Response.json({ error: 'Missing session_id' }, { status: 400 });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.client_reference_id !== user.id) {
      return Response.json({ error: 'Session does not belong to this user' }, { status: 403 });
    }
    // 'complete' covers both paid sessions and trial signups (payment_status 'no_payment_required')
    if (session.status !== 'complete') {
      return Response.json({ premium: false, error: 'Checkout not completed' }, { status: 402 });
    }

    const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
    const data = { is_premium: true, stripe_customer_id: String(session.customer || '') };
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, data);
    } else {
      await base44.entities.UserProfile.create(data);
    }

    return Response.json({ premium: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});