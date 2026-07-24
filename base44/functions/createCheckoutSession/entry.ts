import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.7.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { success_url, cancel_url, plan } = await req.json();
    const isAnnual = plan === 'annual';
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: isAnnual ? 8000 : 999,
            recurring: { interval: isAnnual ? 'year' : 'month' },
            product_data: {
              name: isAnnual ? 'Cosmic Encounters Premium (Annual)' : 'Cosmic Encounters Premium (Monthly)',
              description: 'Unlimited readings, all spreads, oracle draws, spell generator, and more. 3-day free trial.',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: { trial_period_days: 3 },
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: success_url,
      cancel_url: cancel_url,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});