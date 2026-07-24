import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.entities.UserProfile.filter({ created_by_id: user.id });
    const profile = profiles[0];
    if (!profile) return Response.json({ premium: false });

    // Manually-flagged premium accounts (no Stripe customer) are never demoted here
    if (!profile.stripe_customer_id) {
      return Response.json({ premium: profile.is_premium === true });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const subs = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 10,
    });
    const active = subs.data.some((s) => s.status === 'active' || s.status === 'trialing');

    if (!active && profile.is_premium === true) {
      await base44.entities.UserProfile.update(profile.id, { is_premium: false });
    }

    return Response.json({ premium: active });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});