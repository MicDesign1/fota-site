/*
  Claudia typed mode on RiveScript (staging). RAM only: no storage, no network.
  RiveScript is the vendored global from lib/rivescript (loaded by a classic <script>).
  Safety + distressMode + visit-only callbacks + recent-reply exclusion live here.
*/
import { BRAIN } from "./claudia-rive-brain.js?v=rive1";

export const OPENER =
  "Okay, I’ll play therapist. But if I ask about your mother, we’ve run out of material.";

const SAFETY_RE =
  /\b(suicid\w*|kill myself|end my life|want to die|self[-\s]?harm|cut myself|hang myself|overdose|don'?t want to be alive|do not want to be alive)\b/i;
export const SAFETY_REPLIES = [
  "I’m not the right place for this. Please talk to someone real who can help—friends, family, or a crisis line in your area.",
  "This matters, and I can’t do what a person can. Reach out to people who can stay with you, or a local crisis line.",
  "This is bigger than a night drive chat. Please get to someone who can help you now—a person, or emergency services if you’re in danger.",
];
export const SAFETY_FOLLOWUPS = [
  "Still: please contact real people or a crisis line. I won’t joke about this.",
  "I’m going to keep saying it—talk to someone who can help outside this car.",
  "I’m here, and I mean it: please reach someone who can be with you tonight.",
];
const EMPTY_REPLIES = [
  "I’m listening. The road is louder than you are right now.",
  "Blank page. Brave. Or shy. Either way—say something.",
  "Silence works in cars. Type when you’re ready.",
];
// Light / jokey inputs that must not get a gag during distress.
const LIGHT_RE =
  /^(hi|hello|hey|yo|lol|haha+|haha+ jk|lmao|jk|just kidding|ok|okay|sure|yes|no|what|why|bye|thanks|thank you)$|\b(joke|funny|mother|mom|therapist|sing)\b/i;

const CONTRACTIONS = [
  [/\bwhat'?s\b/g, "what is"], [/\bwhere'?s\b/g, "where is"], [/\bwho'?s\b/g, "who is"],
  [/\bhow'?s\b/g, "how is"], [/\bthat'?s\b/g, "that is"], [/\bit'?s\b/g, "it is"],
  [/\byou'?re\b/g, "you are"], [/\bi'?m\b/g, "i am"], [/\bdon'?t\b/g, "do not"],
  [/\bdoesn'?t\b/g, "does not"], [/\bcan'?t\b/g, "cannot"], [/\bwon'?t\b/g, "will not"],
  [/\bisn'?t\b/g, "is not"], [/\baren'?t\b/g, "are not"], [/\bi'?ve\b/g, "i have"],
  [/\bi'?d\b/g, "i would"], [/\bi'?ll\b/g, "i will"], [/\bu\b/g, "you"], [/\bur\b/g, "your"],
  [/\bfavourite\b/g, "favorite"], [/\bfav\b/g, "favorite"], [/\bwanna\b/g, "want to"],
];

export function normalize(raw) {
  let t = String(raw ?? "").toLowerCase().replace(/[’‘`]/g, "'");
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  t = t.replace(/[^a-z0-9' ]+/g, " ").replace(/'/g, "").replace(/\s+/g, " ").trim();
  return t;
}

function getRiveScriptClass(injected) {
  const RS = injected || globalThis.RiveScript;
  if (!RS) throw new Error("RiveScript not loaded");
  return RS.default || RS;
}

export async function createRiveSession({ RiveScript = null, rng = Math.random } = {}) {
  const RS = getRiveScriptClass(RiveScript);
  const bot = new RS({ utf8: false, caseSensitive: false });
  bot.stream(BRAIN);
  bot.sortReplies();
  return {
    bot,
    rng,
    user: "driver",
    opened: false,
    distressMode: false,
    distressTurns: 0,
    recent: [], // last N Claudia lines, never repeat these immediately
    lastNorm: "",
    flags: Object.create(null),
    safetyIdx: 0,
    followIdx: 0,
    emptyIdx: 0,
  };
}

export function opener(session) {
  session.opened = true;
  remember(session, OPENER);
  return OPENER;
}

const RECENT_N = 4;
function remember(session, text) {
  session.recent.push(text);
  if (session.recent.length > RECENT_N) session.recent.shift();
}

function pickFresh(session, list, idxKey) {
  for (let i = 0; i < list.length; i++) {
    const idx = (session[idxKey] + i) % list.length;
    if (!session.recent.includes(list[idx])) {
      session[idxKey] = idx + 1;
      return list[idx];
    }
  }
  return list[session[idxKey]++ % list.length];
}

/** @returns {Promise<{text:string, kind:string, distressMode:boolean}>} */
export async function reply(session, raw) {
  const original = String(raw ?? "");
  const norm = normalize(original);

  if (SAFETY_RE.test(original) || SAFETY_RE.test(norm)) {
    session.distressMode = true;
    session.distressTurns = 0;
    const text = pickFresh(session, SAFETY_REPLIES, "safetyIdx");
    remember(session, text);
    return { text, kind: "safety", distressMode: true };
  }

  if (session.distressMode) {
    // Suppress jokes across the immediate follow-ups: light / empty / short inputs stay sober.
    session.distressTurns++;
    if (norm === "" || LIGHT_RE.test(norm) || norm.split(" ").length <= 3 || session.distressTurns < 2) {
      const text = pickFresh(session, SAFETY_FOLLOWUPS, "followIdx");
      remember(session, text);
      return { text, kind: "safety_followup", distressMode: true };
    }
    session.distressMode = false; // clear substantive turn
  }

  if (norm === "") {
    const text = pickFresh(session, EMPTY_REPLIES, "emptyIdx");
    remember(session, text);
    return { text, kind: "empty", distressMode: false };
  }

  // Visit-only callbacks (music / bye_stayed), spent once.
  if (session.flags.said_bye && !/\b(bye|goodbye|good night|goodnight|see you|gotta go)\b/.test(norm) && !session.flags.bye_cb) {
    session.flags.bye_cb = true;
    const text = "You said goodbye and stayed. I’m flattered. Mildly.";
    remember(session, text);
    return { text, kind: "callback", distressMode: false };
  }

  let text = "";
  for (let tries = 0; tries < 8; tries++) {
    text = await session.bot.reply(session.user, norm);
    if (!session.recent.includes(text)) break;
  }
  if (session.recent.includes(text)) {
    text = "We’ve covered that. Ask me something else—music, films, cities, or me.";
    if (session.recent.includes(text)) text = "Same question, same car. Try it from another angle?";
  }

  if (/\b(bye|goodbye|good night|goodnight|see you|gotta go)\b/.test(norm)) session.flags.said_bye = true;
  if (/\b(song|music|track|playlist|playing)\b/.test(norm)) session.flags.mentioned_music = true;

  const kind = /have a good answer for that|past me\. I.m a passenger|I won.t make it up\. Ask me something about tonight/i.test(text)
    ? "fallback"
    : "rive";
  remember(session, text);
  session.lastNorm = norm;
  return { text, kind, distressMode: false };
}
