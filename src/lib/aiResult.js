function stripCodeFence(value) {
  return value
    .trim()
    .replace(/^```(?:json|javascript|js|txt|text)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function tryParseJson(value) {
  if (typeof value !== 'string') return value;

  const cleaned = stripCodeFence(value);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return cleaned;
      }
    }
    return cleaned;
  }
}

export function unwrapAiResult(result) {
  let payload = result;

  for (let i = 0; i < 5; i += 1) {
    const parsed = tryParseJson(payload);
    if (parsed !== payload) {
      payload = parsed;
      continue;
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const wrappedValue = payload.response ?? payload.result ?? payload.body ?? payload.data;
      if (typeof wrappedValue === 'string') {
        payload = wrappedValue;
        continue;
      }
    }

    break;
  }

  return payload;
}

function cleanText(value) {
  if (typeof value !== 'string') return '';
  const parsed = unwrapAiResult(value);
  if (typeof parsed === 'string') return stripCodeFence(parsed);
  if (parsed && typeof parsed === 'object') {
    return cleanText(parsed.message ?? parsed.answer ?? parsed.text ?? parsed.content ?? '');
  }
  return '';
}

function normalizeOmens(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((omen) => (typeof omen === 'string' ? omen : omen?.message ?? omen?.sign ?? ''))
    .map(cleanText)
    .filter(Boolean);
}

function normalizeSongSign(value) {
  const parsed = unwrapAiResult(value);
  if (typeof parsed === 'string') return cleanText(parsed);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const title = cleanText(parsed.title ?? parsed.song ?? parsed.name ?? '');
    const artist = cleanText(parsed.artist ?? '');
    const why = cleanText(parsed.why ?? parsed.reason ?? parsed.message ?? '');
    if (title || artist || why) return { title, artist, why };
  }
  return '';
}

export function normalizeChanneledPayload(result) {
  const payload = unwrapAiResult(result);

  if (typeof payload === 'string') {
    return { message: cleanText(payload), visual_omens: [], song_sign: '' };
  }

  const nestedMessage = unwrapAiResult(payload?.message);
  const merged = nestedMessage && typeof nestedMessage === 'object' && !Array.isArray(nestedMessage)
    ? { ...payload, ...nestedMessage }
    : payload;

  return {
    message: cleanText(merged?.message ?? merged?.text ?? merged?.content ?? merged?.response ?? ''),
    visual_omens: normalizeOmens(merged?.visual_omens ?? merged?.visualOmens),
    song_sign: normalizeSongSign(merged?.song_sign ?? merged?.songSign ?? ''),
  };
}

export function normalizeFollowUpPayload(result) {
  const payload = unwrapAiResult(result);

  if (typeof payload === 'string') {
    return { answer: cleanText(payload), needs_grounding: false };
  }

  const nestedAnswer = unwrapAiResult(payload?.answer);
  const merged = nestedAnswer && typeof nestedAnswer === 'object' && !Array.isArray(nestedAnswer)
    ? { ...payload, ...nestedAnswer }
    : payload;

  return {
    answer: cleanText(merged?.answer ?? merged?.message ?? merged?.text ?? merged?.content ?? ''),
    needs_grounding: merged?.needs_grounding === true || merged?.needsGrounding === true,
  };
}
