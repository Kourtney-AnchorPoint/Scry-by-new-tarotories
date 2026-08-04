import { client } from '@/lib/amplifyClient';

// Call sites expect { data: ... } — matches the shape callers already unwrap.
async function invoke(mutation, params) {
  const { data, errors } = await client.mutations[mutation](params);
  if (errors?.length) throw new Error(errors[0].message);
  return { data };
}

// Real ephemeris math via amplify/functions/astronomy/chartMath.ts — never
// LLM-generated.
export const astronomy = {
  calculateChart: (params) => invoke('calculateChart', params),
  calculateTransits: (params) => invoke('calculateTransits', params),
  calculateHoroscope: (params) => invoke('calculateHoroscope', params),
};
