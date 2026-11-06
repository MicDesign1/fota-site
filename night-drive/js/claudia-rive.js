/*
  Claudia typed mode on RiveScript (staging). RAM only: no storage, no network.
  RiveScript is the vendored global from lib/rivescript (loaded by a classic <script>).
  Safety + distressMode + visit-only callbacks + recent-reply exclusion live here.
*/
import { BRAIN } from "./claudia-rive-brain.js?v=rive1";

export const OPENER_MUSIC =
  "Good. Now we have music and nowhere we have to be. What’s on your mind?";
export const OPENER_QUIET =
  "Good. Now we have a little time and nowhere we have to be. What’s on your mind?";
export const OPENER = OPENER_QUIET;

const SAFETY_RE =
  /\b(suicid\w*|kill myself|end my life|want to die|self[-\s]?harm|cut myself|hang myself|overdose|don'?t want to be alive|do not want to be alive)\b/i;
export const SAFETY_REPLIES = [
  "I'm glad you told me. Please reach someone who can be with you now. If you're in immediate danger, call emergency services or a crisis line in your area.",
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

export function opener(session, musicPlaying = false) {
  session.opened = true;
  const line = musicPlaying ? OPENER_MUSIC : OPENER_QUIET;
  remember(session, line);
  return line;
}


// Named-pick follow-ups (why / what's it about / tell me more). Lines reuse Claudia's
// reviewed wording (RIVESCRIPT-CREATIVE-REVIEW); game characterization, not sourced canon.
const PICKS = [
  { re: /\bbliss\b/i, lines: [
    "Bliss is my Windows XP video: I fight the cursor, then send you outside to the hill in the wallpaper.",
    "Of mine? Bliss. I got to send someone outside. That's rare for something that lives on a screen.",
  ] },
  { re: /lost in translation/i, lines: [
    "Lost in Translation. Two people in a city at night, not quite knowing what to say. I like that it leaves room.",
    "Lost in Translation is my favourite. Paris, Texas is the one I'd recommend after a drive like this.",
  ] },
  { re: /paris,? texas/i, lines: [
    "Paris, Texas. Long roads and people struggling to say what they mean. I think it would stay with you.",
  ] },
  { re: /invisible cities|calvino/i, lines: [
    "Invisible Cities, by Italo Calvino. Cities made out of memory and desire. I'd like to argue with a few of them.",
  ] },
  { re: /\brobyn\b/i, lines: [
    "Robyn. She lets a song be sad without making it small.",
    "Robyn. Crying on the dancefloor is a whole genre and she owns it.",
  ] },
  { re: /portal 2|\bportal\b/i, lines: [
    "Portal 2. I have complicated feelings about being cast as the ceiling.",
  ] },
  { re: /believe me before dawn/i, lines: [
    "Believe Me Before Dawn. Good for the stretch where nobody's talking.",
  ] },
];
const FOLLOW_RE = /^(why|why that one|why that|how come|what is it about|what is that about|what is that|tell me more|tell me more about it|more|go on|say more)$/;
const NAMED_ASK_RE = /^(tell me about|what is|what about|why|have you seen|have you heard|do you like|what do you think of|what do you think about) /;
function pickFor(text) {
  return PICKS.find((p) => p.re.test(text)) || null;
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
  const pick = FOLLOW_RE.test(norm)
    ? pickFor(session.lastPickText || "")
    : NAMED_ASK_RE.test(norm) ? pickFor(norm) : null;
  if (pick) {
    text = pick.lines.find((l) => !session.recent.includes(l)) || pick.lines[0];
    remember(session, text);
    session.lastPickText = text;
    session.lastNorm = norm;
    return { text, kind: "rive", distressMode: false };
  }
  for (let tries = 0; tries < 8; tries++) {
    text = await session.bot.reply(session.user, norm);
    if (!session.recent.includes(text)) break;
  }
  // Repeated direct answers are allowed when no fresh answer exists (Claudia review: no reprimand).
  const last = session.recent[session.recent.length - 1];
  for (let tries = 0; tries < 8 && text === last; tries++) {
    text = await session.bot.reply(session.user, norm);
  }

  if (/\b(bye|goodbye|good night|goodnight|see you|gotta go)\b/.test(norm)) session.flags.said_bye = true;
  if (/\b(song|music|track|playlist|playing)\b/.test(norm)) session.flags.mentioned_music = true;

  const kind = /have a good answer for that|past me\. I.m a passenger|I won.t make it up\. Ask me something about tonight/i.test(text)
    ? "fallback"
    : "rive";
  if (pickFor(text)) session.lastPickText = text;
  remember(session, text);
  session.lastNorm = norm;
  return { text, kind, distressMode: false };
}
