/*
  Claudia typed mode on RiveScript (staging). RAM only: no storage, no network.
  RiveScript is the vendored global from lib/rivescript (loaded by a classic <script>).
  Safety + distressMode + visit-only callbacks + recent-reply exclusion live here.
*/
import { BRAIN } from "./claudia-rive-brain.js?v=lore1";
import { SOCIAL, socialIdFor, SOCIAL_THIS_GAME_RE, SOCIAL_THIS_GAME_LINE, SOCIAL_PUBLISH_RE, SOCIAL_PUBLISH_LINE, SOCIAL_BARE_X_RE, SOCIAL_BARE_X_LINE } from "./claudia-rive-social.js?v=lore1";
import { LORE, SEEN_ELSEWHERE_RE, SEEN_ELSEWHERE_LINE } from "./claudia-rive-lore.js?v=lore1";
import { TOPICS, CONTEST_LIVE_RE, CONTEST_LIVE_LINE, VOTE_HOWTO_RE, VOTE_HOWTO_LINE, POLITICS_RE, POLITICS_LINES, RELIGION_RE, RELIGION_LINES } from "./claudia-rive-topics.js?v=lore1";

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
    "People struggle to explain themselves without making things worse. I like the patience it gives them.",
  ] },
  { re: /invisible cities|calvino/i, lines: [
    "Invisible Cities, by Italo Calvino. Cities made out of memory and desire. I'd like to argue with a few of them.",
    "The cities can feel like different ways of wanting something. I like a book that leaves me wondering what I brought into it.",
  ] },
  { re: /\brobyn\b/i, lines: [
    "Robyn. She lets a song be sad without making it small.",
    "Robyn. Crying on the dancefloor is a whole genre and she owns it.",
  ] },
  { re: /portal 2|\bportal\b/i, lines: [
    "Portal 2. I have complicated feelings about being cast as the ceiling.",
    "The room is part of the joke, and part of the problem. You have to pay attention to the place, not just whoever is talking.",
  ] },
  { re: /believe me before dawn/i, lines: [
    "Believe Me Before Dawn. Good for the stretch where nobody's talking.",
  ] },
];
const FOLLOW_RE = /^(why|why that one|why that|how come|what is it about|what is that about|what is that|tell me more|tell me more about it|more|go on|say more|how so)$/;
const LORE_HOW_RE = /^(how|how so|how does that work|how do they do that|how does it work|how is that done)$/;
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
  // Culture topics: last_topic / last_variant kept in RAM; follow-ups explain the variant just said.
  const say = (t, extra = {}) => {
    remember(session, t);
    session.lastNorm = norm;
    session.lastPickText = "";
    session.lastTopic = extra.topic || null;
    session.lastVariant = extra.variant ?? null;
    return { text: t, kind: "rive", distressMode: false };
  };
  const rot = (lines) => lines.find((l) => l !== session.recent[session.recent.length - 1]) || lines[0];
  if (FOLLOW_RE.test(norm) && session.lastTopic && session.lastTopic.startsWith("social:")) {
    const sp = SOCIAL.find((x) => "social:" + x.id === session.lastTopic);
    if (sp) return say(/more|go on/.test(norm) ? sp.more : sp.why, { topic: session.lastTopic, variant: session.lastVariant });
  }
  if ((FOLLOW_RE.test(norm) || LORE_HOW_RE.test(norm)) && session.lastTopic && session.lastTopic.startsWith("lore:")) {
    const lp = LORE.find((x) => "lore:" + x.id === session.lastTopic);
    if (lp) {
      const t = LORE_HOW_RE.test(norm) ? lp.how : /more|go on|what is it about|what is that/.test(norm) ? lp.more : lp.why;
      return say(t, { topic: session.lastTopic, variant: session.lastVariant });
    }
  }
  if (FOLLOW_RE.test(norm) && session.lastTopic) {
    const tp = TOPICS.find((x) => x.id === session.lastTopic);
    const f = tp && tp.follow.find((x) => x.v.includes(session.lastVariant));
    if (f) return say(f.text, { topic: tp.id, variant: session.lastVariant });
  }
  if (VOTE_HOWTO_RE.test(norm)) return say(VOTE_HOWTO_LINE);
  if (CONTEST_LIVE_RE.test(norm)) return say(CONTEST_LIVE_LINE);
  if (/\b(your|you have) political (views?|opinions?|position)\b/.test(norm)) return say(rot(POLITICS_LINES));
  if (POLITICS_RE.test(norm)) return say(rot(POLITICS_LINES));
  if (RELIGION_RE.test(norm)) return say(rot(RELIGION_LINES));
  if (SOCIAL_BARE_X_RE.test(norm)) return say(SOCIAL_BARE_X_LINE);
  if (SOCIAL_PUBLISH_RE.test(norm)) return say(SOCIAL_PUBLISH_LINE);
  if (SOCIAL_THIS_GAME_RE.test(norm)) return say(SOCIAL_THIS_GAME_LINE);
  {
    const sid = SOCIAL.find((x) => x.re.test(norm))?.id || socialIdFor(norm);
    const sp = sid && SOCIAL.find((x) => x.id === sid);
    if (sp) {
      const fresh = sp.replies.map((t, i) => i).filter((i) => !session.recent.includes(sp.replies[i]));
      const pool = fresh.length ? fresh : sp.replies.map((t, i) => i);
      const v = pool[Math.floor((session.rng || Math.random)() * pool.length)];
      return say(sp.replies[v], { topic: "social:" + sp.id, variant: v });
    }
  }
  const tp = TOPICS.find((x) => x.re.test(norm));
  if (tp) {
    const fresh = tp.replies.map((t, i) => i).filter((i) => !session.recent.includes(tp.replies[i]));
    const pool = fresh.length ? fresh : [0, 1, 2];
    const v = pool[Math.floor((session.rng || Math.random)() * pool.length)];
    return say(tp.replies[v], { topic: tp.id, variant: v });
  }
  {
    if (/\b(politic\w*)\b/.test(norm)) return say(rot(POLITICS_LINES));
    if (/\b(religio\w*|god|gods|church)\b/.test(norm)) return say(rot(RELIGION_LINES));
    const LORE_ORDER = ["genre", "singnow", "voice", "lyrics", "actnow", "makenow", "talent"];
    const lp = LORE.find((x) => LORE_ORDER.includes(x.id) && x.re.test(norm)) || LORE.find((x) => x.re.test(norm));
    if (lp) {
      let v;
      if (lp.id === "talent" && !session.flags.talent_seen) { session.flags.talent_seen = true; v = 0; }
      else {
        const fresh = lp.replies.map((t, i) => i).filter((i) => !session.recent.includes(lp.replies[i]));
        const pool = fresh.length ? fresh : lp.replies.map((t, i) => i);
        v = pool[Math.floor((session.rng || Math.random)() * pool.length)];
      }
      return say(lp.replies[v], { topic: "lore:" + lp.id, variant: v });
    }
    if (SEEN_ELSEWHERE_RE.test(norm)) return say(SEEN_ELSEWHERE_LINE);
  }
  session.lastTopic = null;
  session.lastVariant = null;
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
