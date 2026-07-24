export function calculateLifePathNumber(dateString) {
  if (!dateString) return null;
  const digits = dateString.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

export function calculateDailyNumber() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  let sum = dateStr.split('').map(Number).reduce((a, b) => a + b, 0);
  while (sum > 9) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

const LETTER_VALUES = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function reduceToCore(sum) {
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function sumLetters(name, filterFn) {
  if (!name) return null;
  const sum = name.toLowerCase().split('')
    .filter(c => LETTER_VALUES[c] && filterFn(c))
    .map(c => LETTER_VALUES[c])
    .reduce((a, b) => a + b, 0);
  return sum > 0 ? reduceToCore(sum) : null;
}

export function calculateExpressionNumber(name) {
  return sumLetters(name, () => true);
}

// Soul Urge (Heart's Desire) — vowels only: what your soul secretly craves
export function calculateSoulUrgeNumber(name) {
  return sumLetters(name, c => VOWELS.includes(c));
}

// Personality Number — consonants only: the mask you show the world
export function calculatePersonalityNumber(name) {
  return sumLetters(name, c => !VOWELS.includes(c));
}

// Birthday Number — the day of the month you were born, a special gift you carry
export function calculateBirthdayNumber(dateString) {
  if (!dateString) return null;
  const day = parseInt(dateString.split('-')[2], 10);
  if (!day) return null;
  return reduceToCore(day);
}

export const LIFE_PATH_MEANINGS = {
  1: { title: "The Leader", description: "Independent, ambitious, and innovative. You're a born pioneer with the drive to forge your own path.", strengths: "Leadership, independence, originality", challenges: "Stubbornness, self-doubt, isolation" },
  2: { title: "The Diplomat", description: "Sensitive, intuitive, and cooperative. You thrive in partnerships and bring harmony to every situation.", strengths: "Diplomacy, sensitivity, cooperation", challenges: "Over-sensitivity, indecision, dependency" },
  3: { title: "The Communicator", description: "Creative, expressive, and social. You have a gift for inspiring others through your words and artistic expression.", strengths: "Creativity, optimism, self-expression", challenges: "Scattered energy, moodiness, superficiality" },
  4: { title: "The Builder", description: "Practical, disciplined, and hardworking. You create lasting structures and bring stability wherever you go.", strengths: "Organization, determination, loyalty", challenges: "Rigidity, workaholism, stubbornness" },
  5: { title: "The Adventurer", description: "Freedom-loving, versatile, and dynamic. You crave variety and experience, always seeking the next horizon.", strengths: "Adaptability, curiosity, resourcefulness", challenges: "Restlessness, irresponsibility, excess" },
  6: { title: "The Nurturer", description: "Loving, responsible, and harmonious. You're drawn to caring for others and creating beauty in the world.", strengths: "Compassion, responsibility, artistry", challenges: "Self-sacrifice, perfectionism, control" },
  7: { title: "The Seeker", description: "Analytical, introspective, and spiritual. You're on a deep quest for knowledge and inner truth.", strengths: "Intuition, analysis, wisdom", challenges: "Isolation, cynicism, overthinking" },
  8: { title: "The Powerhouse", description: "Ambitious, authoritative, and business-minded. You have the ability to manifest great material and spiritual abundance.", strengths: "Leadership, vision, abundance", challenges: "Materialism, workaholism, control" },
  9: { title: "The Humanitarian", description: "Compassionate, wise, and selfless. You're here to serve humanity and leave the world better than you found it.", strengths: "Compassion, idealism, generosity", challenges: "Martyrdom, detachment, moodiness" },
  11: { title: "The Intuitive Master", description: "Highly intuitive, inspiring, and spiritually aware. You carry the energy of illumination and serve as a channel for higher wisdom.", strengths: "Inspiration, intuition, spiritual insight", challenges: "Anxiety, self-doubt, nervous energy" },
  22: { title: "The Master Builder", description: "Visionary, practical, and powerful. You have the rare ability to turn the most ambitious dreams into tangible reality.", strengths: "Vision, mastery, manifestation", challenges: "Overwhelm, self-imposed pressure, burnout" },
  33: { title: "The Master Teacher", description: "Deeply compassionate, healing, and devoted. You embody unconditional love and inspire spiritual growth in others.", strengths: "Healing, devotion, selflessness", challenges: "Self-neglect, taking on others' pain, martyrdom" },
};