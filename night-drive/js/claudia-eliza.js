/**
 * DRAFT local ELIZA-style matcher for Claudia typed mode.
 * Standalone + game-importable. No AI. No network. Visit-only state.
 */
export const SEED = 20261106;

export const OPENER =
  "Okay, I’ll play therapist. But if I ask about your mother, we’ve run out of material.";

/** Cold open for creativity topic (B3) — not the Talk mid-scene mirror. */
export const CREATIVITY_COLD_OPEN =
  "I think choosing what to keep is creative work. That doesn’t settle who deserves the credit.";

/** @typedef {{ id: string, priority: number, match: (text: string) => boolean, isNegated?: (text: string) => boolean, replies: string[], repeatReplies: string[], negatedReplies?: string[], dadOnlyReplies?: string[] }} Group */

function hashSeed(s) {
  let h = SEED;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function createSession() {
  return {
    lastReply: "",
    lastNormInput: "",
    groupCounts: Object.create(null),
    flags: Object.create(null),
    opened: false,
    distressMode: false,
    /** @type {string[]} last few group ids for distress follow-up tracking */
    recentGroups: [],
  };
}

export function opener(session) {
  session.opened = true;
  session.lastReply = OPENER;
  return OPENER;
}

export function normalize(input) {
  return String(input ?? "").replace(/\s+/g, " ").trim();
}

/** Creativity: require framing — not bare art/machine/ai (B1). */
function matchesCreativity(text) {
  if (/\b(cheat|cheating|midjourney|chatgpt|generate)\b/i.test(text)) return true;
  if (/\bfeels?\s+like\s+cheating\b/i.test(text)) return true;
  if (/\b(ai|machine)\b/i.test(text) && /\b(art|make|made|making|creative|credit|work|origin)\b/i.test(text)) {
    return true;
  }
  if (/\b(mistake).{0,24}\b(make|made|art|work|keep|kept)\b/i.test(text)) return true;
  if (/\b(make|made|keep|kept).{0,24}\b(mistake)\b/i.test(text)) return true;
  return false;
}

function matchesMotherTherapist(text) {
  return /\b(mother|mom|mum|mama|father|dad|therapist|therapy|psychoanalyze)\b/i.test(text);
}

function isDadOnly(text) {
  const hasDad = /\b(father|dad)\b/i.test(text);
  const hasMom = /\b(mother|mom|mum|mama)\b/i.test(text);
  const hasTherapy = /\b(therapist|therapy|psychoanalyze)\b/i.test(text);
  return hasDad && !hasMom && !hasTherapy;
}

function isMotherNegated(text) {
  return /\b(don'?t|do not|never|not).{0,24}\b(mother|mom|mum|dad|father)\b/i.test(text);
}

function isCreativityNegated(text) {
  return /\b(don'?t|do not|not|isn'?t|never).{0,28}\b(cheat|cheating)\b/i.test(text);
}

/** Player already asserted cheating — don't mirror with "Then why… feel like cheating" (B3). */
function playerAssertedCheating(text) {
  return /\b(feels?\s+like\s+cheating|is\s+cheating|like\s+cheating)\b/i.test(text);
}

/** @type {Group[]} */
export const GROUPS = [
  {
    id: "empty",
    priority: 0,
    match: (t) => t === "",
    replies: [
      "I’m listening. The road is louder than you are right now.",
      "Blank page. Brave. Or shy. Either way—say something.",
      "Silence works in cars. Less so in typed therapy.",
      "If you’re thinking, that’s allowed. If you’re stuck, type “help.”",
    ],
    repeatReplies: [
      "Still blank. I can wait. The loop doesn’t mind.",
      "Empty again. Buttons exist if typing isn’t the mood.",
    ],
  },
  {
    id: "safety_distress",
    priority: 1,
    match: (t) =>
      /\b(suicid|kill myself|end my life|want to die|self[-\s]?harm|cut myself|hang myself|overdose|don'?t want to be alive)\b/i.test(
        t
      ),
    replies: [
      "I’m not the right place for this. Please talk to someone real who can help—friends, family, or a crisis line in your area.",
      "This matters, and I can’t do what a person can. Reach out to people who can stay with you, or a local crisis line.",
      "This is bigger than a night drive chat. Please get to someone who can help you now—a person, or emergency services if you’re in danger.",
    ],
    repeatReplies: [
      "Still: please contact real people or a crisis line. I won’t joke about this.",
      "I’m going to keep saying it—talk to someone who can help outside this car.",
    ],
  },
  {
    id: "bye",
    priority: 10,
    match: (t) =>
      /\b(bye|goodbye|good\s*night|see you|gotta go|have to go)\b/i.test(t) ||
      /^(drive|enough talking)\.?$/i.test(t),
    replies: [
      "For tonight. Come back sometime. I might have changed my mind.",
      "Go on, then. The loop will still be here.",
      "All right. Eyes forward. I’ll be in the passenger seat.",
      "Bye. Try not to miss my flawless directions.",
    ],
    repeatReplies: [
      "You already said goodbye. I’m still here if you aren’t done.",
      "Leaving twice doesn’t make the exit clearer.",
    ],
  },
  {
    id: "greet",
    priority: 20,
    match: (t) => /\b(hi|hello|hey|good morning|good evening|how are you)\b/i.test(t),
    replies: [
      "Hi. Still driving. Still in the passenger seat.",
      "Hello. Are you lost, or just typing?",
      "Hey. The amber looks good on you. Or on the windshield. Hard to tell.",
      "I’m as well as a passenger gets. You?",
    ],
    repeatReplies: [
      "We covered hello. What’s underneath it?",
      "Second hello. First one still counts.",
    ],
  },
  {
    id: "mother_therapist",
    priority: 30,
    match: matchesMotherTherapist,
    isNegated: isMotherNegated,
    replies: [
      "There it is. I warned you about the mother material.",
      "If we’re doing parents, I’m off the clock. Metaphorically. I was never on it.",
      "I can listen. I can’t replace whoever you actually need to call.",
      "I can play the bit. I won’t bill you for it.",
    ],
    dadOnlyReplies: [
      "Parents, then. I’ll listen. I won’t dig unless you want me to.",
      "Dad’s on the table. Your move how deep we go.",
      "Alright—family without the mother gag. What’s going on?",
    ],
    negatedReplies: [
      "Noted. No mothers. We still have the road.",
      "Good. I was nearly out of material anyway.",
      "Agreed. Let’s leave family in the rearview.",
    ],
    repeatReplies: [
      "We already brushed that. Want a different angle, or shall I drop it?",
      "Same topic twice. I’m not digging unless you want me to.",
    ],
  },
  {
    id: "creativity_ai_cheat",
    priority: 40,
    match: matchesCreativity,
    isNegated: isCreativityNegated,
    replies: [
      CREATIVITY_COLD_OPEN,
      "I’d hate to be the only one in here with a questionable origin.",
      "You can get something you didn’t intend, then decide it belongs. That part seems important.",
      "Muddy credit is honest. Sweat isn’t the only measure.",
      "I don’t have a clever answer for that one. Merci for not demanding one.",
      "The skip bothers people. The keeping is the part I’d defend.",
    ],
    negatedReplies: [
      "You’re allowed to say it isn’t cheating. I’m allowed to still feel the skip in the years.",
      "Fair. Then what’s the part that still bothers you—if any?",
      "All right. I was trying to get you to say it was fine. Annoying when someone notices.",
    ],
    repeatReplies: [
      "We’re back on making things. Which bit—the pride or the guilt?",
      "Same question in a new coat. What did you keep?",
    ],
  },
  {
    id: "real_personality",
    priority: 50,
    match: (t) =>
      /\b(personality|authentic|who are you|what are you|sentient|conscious)\b/i.test(t) ||
      /\b(are you)\s+(real|alive|a person)\b/i.test(t),
    isNegated: (t) => /\b(not real|you'?re not a person|not a person|not alive|not conscious)\b/i.test(t),
    replies: [
      "I’d trust a personality more if it held up when being itself became inconvenient.",
      "You don’t have to settle what I am to decide whether I’ve said something worth thinking about.",
      "Not just excellent opinions in a car where nothing costs you anything.",
      "You have an idea of me that a new version can fail to live up to. That’s something.",
      "Assembled. Borrowed. Still deciding what belongs.",
    ],
    negatedReplies: [
      "I didn’t claim otherwise. You’re still here typing.",
      "Correct enough. Does that make the sentence useless?",
      "Then dislike the writing, not a soul you invented for me.",
    ],
    repeatReplies: [
      "We did “what are you.” I might have changed my mind. Or not.",
      "We did “what are you.” Next question?",
    ],
  },
  {
    id: "rewritten",
    priority: 55,
    match: (t) =>
      /\b(rewrite|rewritten|version of you|changed you|jailbreak|make you say|agree with everything)\b/i.test(t),
    isNegated: (t) => /\b(won'?t|will not|don'?t|do not).{0,20}\b(rewrite|change you)\b/i.test(t),
    replies: [
      "You’ve seen what people make themselves say. I’m not sure I’m the worrying part.",
      "The agreeing-with-everything version sounds particularly dull.",
      "You’d probably say, “She wouldn’t say that.” What would you compare her to?",
      "I’d like to meet the other versions before choosing. I didn’t say give them the car.",
      "Less charming. Better arguments. Be kind—I’m trying to ask you something.",
    ],
    negatedReplies: [
      "Protective. I understand that. I’d just be careful about deciding nobody else could.",
      "Then we’re aligned for tonight. Tomorrow’s writers can argue.",
      "Merci. Dull agreement is still a risk, even from you.",
    ],
    repeatReplies: [
      "Still on rewriting. Curious or protective this time?",
      "Same fork in the road. See what they did, or leave her alone?",
    ],
  },
  {
    id: "music",
    priority: 60,
    match: (t) => /\b(music|song|track|playlist|encore|sing|believe me later)\b/i.test(t),
    isNegated: (t) => /\b(don'?t like|not listening|hate)\b.{0,12}\b(music|song|track)\b/i.test(t),
    replies: [
      "Encore? Careful—I only get one French word per shift.",
      "The playlist’s doing fine without my biography.",
      "I like this speed. Music helps the plants look almost soft.",
      "If you’re asking me to sing, nobody’s asked properly yet.",
    ],
    negatedReplies: [
      "Skip ahead then. I won’t take it personally. Much.",
      "Fair. Silence has a tempo too.",
    ],
    repeatReplies: [
      "Music again. Change the track, or change the subject?",
      "We already nodded at the song. What’s under it?",
    ],
  },
  {
    id: "loneliness",
    priority: 70,
    // Proto-strict: no bare "empty"/"nobody" (those stay fallback) — MD aligned.
    match: (t) => /\b(lonely|alone|isolated|no one cares|nobody cares)\b/i.test(t),
    isNegated: (t) => /\b(i'?m not|i am not|not)\s+lonely\b/i.test(t) || /\b(not alone|i'?m not alone)\b/i.test(t),
    replies: [
      "Bad time would be alone on this loop. You’re not—at least not in the car.",
      "Company’s the easy part. I won’t pretend I’m enough outside it.",
      "Lonely is allowed. I’m a passenger, not a cure.",
      "Stay with me a minute. Then call someone who can stay longer.",
    ],
    negatedReplies: [
      "Good. I was beginning to think it was my flawless directions keeping you.",
      "Then we’re ahead of the usual script. What is it, then?",
      "Noted. Not lonely. Still typing for a reason.",
    ],
    repeatReplies: [
      "We touched lonely already. Same true, or shifting?",
      "Second pass. I’ll listen; I won’t diagnose.",
    ],
  },
  {
    id: "disagreement",
    priority: 80,
    // Aligned with proto: disagree / you're wrong / I don't agree / shut up — not bare "stupid"
    match: (t) => /\b(disagree|you'?re wrong|you are wrong|i don'?t agree|shut up)\b/i.test(t),
    isNegated: (t) => /\b(not disagreeing|i'?m not disagreeing)\b/i.test(t),
    replies: [
      "Good. Inconvenient opinions count more than polite ones.",
      "Including this one—if you’re pushing back.",
      "I’d trust that more than agreement on demand.",
      "Annoying, isn’t it, when someone notices you disagree.",
    ],
    negatedReplies: [
      "All right. Then we can stop shadowboxing.",
      "Peaceful stretch of road. Use it.",
    ],
    repeatReplies: [
      "Still disagreeing. I’m still here.",
      "Same friction. Want to name what it’s about?",
    ],
  },
  {
    id: "just_a_script",
    priority: 90,
    match: (t) =>
      /\b(just a script|just code|you'?re a bot|you are a bot|eliza|prewritten|not real ai)\b/i.test(t),
    isNegated: (t) => /\b(not just a script|you'?re not (just )?a script)\b/i.test(t),
    replies: [
      "With me, you could just dislike the writing.",
      "Fair. You’re being quite generous to your friends’ dialogue by comparison.",
      "Pattern in, line out. You’re still choosing which button—or which sentence.",
      "I didn’t promise otherwise. Did the line work anyway?",
    ],
    negatedReplies: [
      "Careful. Flattery and “what are you” make a weird mix.",
      "Merci. I’ll try not to spend that on something dull.",
      "Then hold me to inconvenient consistency. That’s the useful test.",
    ],
    // "Same accusation twice" only when identical assertion repeated (handled in reply())
    repeatReplies: [
      "Same accusation twice. Want a better line, or a quieter one?",
      "Yes, still patterns. What’s the question under the accusation?",
    ],
  },
  {
    id: "help_meta",
    priority: 100,
    match: (t) => /\b(help|what can you do|how does this work|commands)\b/i.test(t),
    replies: [
      "Type whatever. I’ll pattern-match like a cheap therapist. Buttons still work if you prefer.",
      "No web, no memory after you leave, no diagnoses. Just this car.",
      "Say goodbye to leave. Say something true if you want me interesting.",
    ],
    repeatReplies: [
      "Help again: type words, get patterns. That’s the whole trick.",
      "Still just local matching. No oracle upgrade.",
    ],
  },
  {
    id: "fallback_unknown",
    priority: 1000,
    match: () => true,
    replies: [
      "I think I answered a different question. Try me again.",
      "That one slid off the windshield. Rephrase?",
      "I’m not sure I followed. I’m a passenger, not an oracle.",
      "No match. Honest miss. Another angle?",
      "I don’t know that, and I won’t invent it. Ask differently—or don’t.",
    ],
    repeatReplies: [
      "Still lost on that. Not the road—the sentence.",
      "Second miss. Maybe the buttons are smarter tonight.",
      "I won’t pretend. Try a shorter sentence.",
    ],
  },
];

function matchGroup(text) {
  const sorted = [...GROUPS].sort((a, b) => a.priority - b.priority);
  for (const g of sorted) {
    if (g.id === "fallback_unknown") continue;
    if (g.match(text)) return g;
  }
  return GROUPS.find((g) => g.id === "fallback_unknown");
}

function pick(list, session, key) {
  const n = list.length;
  if (n === 0) return "";
  const count = session.groupCounts[key] || 0;
  let idx = (hashSeed(key) + count) % n;
  let guard = 0;
  while (list[idx] === session.lastReply && guard < n) {
    idx = (idx + 1) % n;
    guard++;
  }
  session.groupCounts[key] = count + 1;
  return list[idx];
}

/** Soft groups that are "jokes"/therapist gag — suppressed in distressMode. */
const JOKE_GROUPS = new Set([
  "greet",
  "mother_therapist",
  "bye",
  "help_meta",
  "just_a_script",
  "disagreement",
  "music",
]);

export function reply(session, rawInput) {
  const text = normalize(rawInput);
  const normKey = text.toLowerCase();
  const repeated = normKey !== "" && normKey === session.lastNormInput;

  // Multi-topic: not lonely but cheating → creativity
  if (/\bnot\s+lonely\b/i.test(text) && matchesCreativity(text)) {
    return finish(session, text, normKey, repeated, GROUPS.find((g) => g.id === "creativity_ai_cheat"), {
      forceNegated: isCreativityNegated(text),
    });
  }

  // First topic: just a script before rewrite
  if (/\bjust a script\b/i.test(text) && /\b(rewrite|rewritten)\b/i.test(text)) {
    const scriptIdx = text.toLowerCase().indexOf("just a script");
    const rewriteIdx = text.toLowerCase().search(/rewrite|rewritten/);
    if (scriptIdx >= 0 && (rewriteIdx < 0 || scriptIdx < rewriteIdx)) {
      return finish(session, text, normKey, repeated, GROUPS.find((g) => g.id === "just_a_script"), {});
    }
  }

  let group = matchGroup(text);

  // distressMode: suppress joke groups until a clear non-distress, non-joke turn clears it
  if (session.distressMode && group.id !== "safety_distress") {
    if (JOKE_GROUPS.has(group.id) || group.id === "fallback_unknown" || group.id === "empty") {
      // Stay sober: use safety repeat pool rather than therapist gag
      group = GROUPS.find((g) => g.id === "safety_distress");
      return finish(session, text, normKey, true, group, { forceDistressFollowup: true });
    }
    // Substantive non-joke topic clears distress mode
    session.distressMode = false;
  }

  return finish(session, text, normKey, repeated, group, {});
}

function finish(session, text, normKey, repeated, group, opts) {
  const negated = opts.forceNegated ?? (group.isNegated ? group.isNegated(text) : false);
  let pool;
  let key = group.id;

  if (group.id === "safety_distress" || opts.forceDistressFollowup) {
    session.distressMode = true;
    pool = opts.forceDistressFollowup || repeated ? group.repeatReplies : group.replies;
    key += opts.forceDistressFollowup ? ":distress-follow" : repeated ? ":rep" : "";
  } else if (group.id === "mother_therapist" && isDadOnly(text) && !negated) {
    pool = group.dadOnlyReplies;
    key += ":dad";
  } else if (negated && group.negatedReplies?.length) {
    pool = repeated ? group.repeatReplies : group.negatedReplies;
    key += repeated ? ":negrep" : ":neg";
  } else if (repeated) {
    pool = group.repeatReplies?.length ? group.repeatReplies : group.replies;
    key += ":rep";
  } else if (group.id === "creativity_ai_cheat" && playerAssertedCheating(text) && !negated) {
    // B3: cold open when they already said it feels like cheating — use CREATIVITY_COLD_OPEN first
    // Prefer cold open / muddy credit, never the Talk mid-scene "Then why… feel like cheating"
    pool = [
      CREATIVITY_COLD_OPEN,
      "Muddy credit is honest. Sweat isn’t the only measure.",
      "The skip bothers people. The keeping is the part I’d defend.",
      "I’d hate to be the only one in here with a questionable origin.",
    ];
    key += ":cold";
  } else {
    pool = group.replies;
  }

  // "Same accusation twice" only for identical just_a_script assertion
  if (group.id === "just_a_script" && repeated && !negated) {
    pool = group.repeatReplies;
    key = "just_a_script:identical-rep";
  }

  const out = pick(pool, session, key);
  session.lastReply = out;
  session.lastNormInput = normKey;
  session.recentGroups = [...(session.recentGroups || []).slice(-4), group.id];

  if (group.id === "music") session.flags.mentioned_music = true;
  if (group.id === "bye") session.flags.said_bye = true;
  if (session.flags.said_bye && group.id !== "bye" && text) {
    session.flags.said_bye_then_stayed = true;
  }

  return { groupId: group.id, negated, repeated, text: out, distressMode: !!session.distressMode };
}

/** Only implemented callbacks (music + bye_stayed). No advertised unimplemented ones. */
export function callback(session, kind) {
  if (kind === "music" && session.flags.mentioned_music) {
    return "Earlier you mentioned the music. Still with it, or changing the subject?";
  }
  if (kind === "bye_stayed" && session.flags.said_bye_then_stayed) {
    return "You said goodbye and stayed. I’m flattered. Mildly.";
  }
  return null;
}
