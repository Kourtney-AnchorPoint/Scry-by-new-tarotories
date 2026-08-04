import { client } from '@/lib/amplifyClient';

// Text-to-speech via Amazon Polly — replaces Base44's GenerateSpeech integration.
export async function generateSpeech(params) {
  const { data, errors } = await client.mutations.generateSpeech(params);
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}
