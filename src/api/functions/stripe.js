import { client } from '@/lib/amplifyClient';

async function invoke(mutation, params) {
  const { data, errors } = await client.mutations[mutation](params);
  if (errors?.length) throw new Error(errors[0].message);
  return { data };
}

export const stripe = {
  createCheckoutSession: (params) => invoke('createCheckoutSession', params),
  createPortalSession: (params) => invoke('createPortalSession', params),
  checkSubscription: (params) => invoke('checkSubscription', params),
  verifyCheckoutSession: (params) => invoke('verifyCheckoutSession', params),
};
