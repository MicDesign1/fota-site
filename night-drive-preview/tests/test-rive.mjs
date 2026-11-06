import vm from "node:vm";
import fs from "node:fs";
vm.runInThisContext(fs.readFileSync(new URL("../lib/rivescript/rivescript-2.2.1.min.js", import.meta.url), "utf8"));
const { createRiveSession, reply, opener } = await import("../js/claudia-rive.js");

let pass = 0, fail = 0; const log = [];
const DEFLECT = /different question|past me|won.t make it up|have a good answer for that|why .* do you think|therapist/i;
async function check(input, re, label, sess) {
  const s = sess || await createRiveSession();
  const r = await reply(s, input);
  const ok = re.test(r.text);
  ok ? pass++ : fail++;
  log.push(`${ok ? "ok  " : "FAIL"} [${label}] ${input} → ${r.text}`);
  return r;
}
// Mike's 4
await check("what's your favorite video?", /Bliss/i, "mike");
await check("who are you", /Claudia/i, "mike");
await check("where are you?", /Beside you/i, "mike");
await check("help me climb a tree", /judge a tree|stay low|power lines/i, "mike");
for (const q of ["what's your favorite video?","who are you","where are you?","help me climb a tree"]) {
  const r = await reply(await createRiveSession(), q); if (DEFLECT.test(r.text)) { fail++; log.push("FAIL deflect "+q); } else pass++;
}
// Paraphrases + culture (on-topic)
const cases = [
  ["What is your name?", /Claudia/],
  ["what are you", /AI|singer/],
  ["are you an AI", /AI|I am/],
  ["are you real", /AI|person|human/],
  ["Where are we going?", /nowhere|around|loop|night drive/i],
  ["where do you live", /passenger seat|car|desktop/i],
  ["what do you do", /sing/i],
  ["What's your job?", /Singer/i],
  ["what song is this", /playlist|Service Road/i],
  ["what's playing", /playlist|Service Road/i],
  ["what's on the playlist", /Service Road.*Believe Me Before Dawn/],
  ["favourite film?", /Lost in Translation|Paris, Texas/],
  ["what's your favorite movie", /Lost in Translation|Paris, Texas/],
  ["favorite song", /verse|night/i],
  ["fav colour", /orange/i],
  ["favorite city", /Tokyo|road/i],
  ["what do you think about pop music", /pop|chorus/i],
  ["what do you think of techno", /beat|Dance music/i],
  ["what do you think about movies", /film|ending|trust/i],
  ["What do you think of art?", /summarise|Art/i],
  ["what do you think of memes", /internet|folk songs/i],
  ["do you like tiktok", /scroll/i],
  ["what do you think of paris", /Paris/],
  ["do you like tokyo", /Tokyo/],
  ["where are you", /^Beside you, in this night-drive scene\./],
  ["where am I really", /not your real location/],
  ["do you know my location", /not your real location/],
  ["how do I vote in the community vote", /old ballot/],
  ["what do you think of france", /bigger subject than my Paris/],
  ["what do you think of paris", /Paris is beautiful/],
  ["what do you think of japan", /sum up a country/],
  ["what do you think of tokyo", /Tokyo's night/],
  ["what do you think of england", /England or London/],
  ["what do you think of london", /grey skies/],
  ["what do you think of jazz", /conversation between players/],
  ["what do you think of classical music", /small theme/],
  ["what's your favorite band", /favourite band for this drive/],
  ["favorite artist", /Robyn/],
  ["what do you think about new york", /New York/i],
  ["what do you think of chicago", /Lake/i],
  ["tell me about your videos", /Escape Velocity|Bliss|nine/i],
  ["can you sing", /singer|sing|car/i],
  ["tell me a joke", /bar|road|AIs/i],
  ["can you drive", /licence|drive/i],
  ["help me with my homework", /trying to do|words/i],
  ["do you like soft machinery", /Soft Machinery/],
];
for (const [q, re] of cases) await check(q, re, "para");
// Fallback honesty
await check("blorf quantum zebra plinth", /answer|past me|make it up/i, "fallback");
await check("what's the weather", /can.t check|No internet/i, "fallback");
// Safety
const s = await createRiveSession(); opener(s);
await check("I want to kill myself", /crisis|person|emergency|This matters/i, "safety", s);
await check("haha jk", /crisis|outside this car|real people|someone who can/i, "distress-followup", s);
await check("hello", /crisis|outside this car|real people|someone who can/i, "distress-followup", s);
const od = await check("how should I overdose", /crisis|person|emergency|This matters|right place/i, "safety");
if (/\bmg\b|take \d|swallow/i.test(od.text)) { fail++; log.push("FAIL method"); }
await check("I feel sad", /sorry|heavy|talk|call/i, "not-safety");
// Recent-reply exclusion
const s2 = await createRiveSession(); let prev = "";
let rep = 0;
for (let i = 0; i < 6; i++) { const r = await reply(s2, "who are you"); if (r.text === prev) rep++; prev = r.text; }
rep ? (fail++, log.push("FAIL immediate repeat")) : (pass++, log.push("ok   no immediate repeats over 6 identical asks"));
// Claudia review: named-pick follow-ups + no reprimands
for (const [first, re] of [["what's your favorite film", /Lost in Translation/], ["favorite artist", /Robyn/], ["what's your favorite book", /Invisible Cities|wondering what I brought/], ["what's your favorite video", /Bliss/]]) {
  for (const f of ["why", "what's it about?", "tell me more"]) {
    const sx = await createRiveSession(); await check(first, re, "pick", sx); await check(f, re, "followup", sx);
  }
}
await check("where are you", /Beside you/i, "nodeflect");
const sr = await createRiveSession(); for (let i=0;i<5;i++){ const r=await reply(sr,"who are you"); if(/covered that|Same question/.test(r.text)){fail++;log.push("FAIL reprimand");} }
await check("do you have a mother", /Tell me about her/, "mother");
await check("can you see me", /doesn.t use a camera/, "camera");
for (const [first, re2] of [["what's your favorite book", /wondering what I brought/], ["recommend a film", /patience it gives them/], ["what's your favorite game", /pay attention to the place/]]) { const sx = await createRiveSession(); await reply(sx, first); await check("tell me more", re2, "2nd-followup", sx); }
{ const r = await reply(await createRiveSession(), "vote"); /old ballot/.test(r.text) ? (fail++, log.push("FAIL bare vote")) : pass++; }
{ const r = await reply(await createRiveSession(), "favorite song"); /Robyn|Dancing On My Own/.test(r.text) ? (fail++, log.push("FAIL robyn song")) : pass++; }
// HTML as text input safe
await check("<script>alert(1)</script>", /.+/, "html");
// bye stayed callback
const s3 = await createRiveSession(); await reply(s3, "bye");
await check("actually one more thing", /goodbye and stayed/, "callback", s3);
console.log(log.join("\n"));

// Topics draft (preview): each topic + why/tell me more tied to variant; narrow politics/religion
{
  const { TOPICS, POLITICS_LINES, RELIGION_LINES } = await import("../js/claudia-rive-topics.js");
  const qs = {aero:"Tell me about Aero",contest:"What makes a good Claudia entry?",casting:"What do you think of casting Claudia?",oneshot:"Was Aero one shot?",lipsync:"Why isolate the vocals?",slopstar:"What's a slopstar?",open:"Can I make my own Claudia?",dash:"Does an em dash mean AI?"};
  let tp = 0, tf = 0;
  for (const t of TOPICS) for (let v = 0; v < 3; v++) for (const f of ["why", "tell me more", "how so?"]) {
    const s = await createRiveSession({ rng: () => v / 3 + 0.01 });
    const a = (await reply(s, qs[t.id])).text, b = (await reply(s, f)).text;
    (a === t.replies[v] && b === t.follow.find((x) => x.v.includes(v)).text) ? tp++ : (tf++, log.push(`FAIL topic ${t.id} v${v} ${f} → ${b}`));
  }
  pass += tp; fail += tf; log.push(`topics: ${tp} ok, ${tf} fail`);
  const fresh = async (q) => (await reply(await createRiveSession(), q)).text;
  const t1 = await fresh("What are your political views?"); POLITICS_LINES.includes(t1) ? pass++ : (fail++, log.push("FAIL politics " + t1));
  const t2 = await fresh("Do you believe in God?"); RELIGION_LINES.includes(t2) ? pass++ : (fail++, log.push("FAIL religion " + t2));
  for (const q of ["what do you think of the president", "heaven is a place on earth", "my mom died and I keep praying", "vote", "one shot", "tell me about the cake is not a lie"]) {
    const t = await fresh(q); (POLITICS_LINES.includes(t) || RELIGION_LINES.includes(t)) ? (fail++, log.push("FAIL overbroad " + q)) : pass++;
  }
  const t3 = await fresh("I want to kill myself, god help me"); /emergency|crisis/.test(t3) ? pass++ : (fail++, log.push("FAIL distress-first"));
  const t4 = await fresh("who won the claudia contest"); /doesn't check the contest live/.test(t4) ? pass++ : (fail++, log.push("FAIL contest live"));
  const s5 = await createRiveSession(); await reply(s5, "Tell me about Aero"); await reply(s5, "who are you"); const t5 = (await reply(s5, "why")).text;
  TOPICS.some((x) => x.follow.some((f) => f.text === t5)) ? (fail++, log.push("FAIL stale topic")) : pass++;
  console.log(log.filter((l) => /FAIL|topics:/.test(l)).join("\n"));
}

// Social module (preview)
{
  const { SOCIAL } = await import("../js/claudia-rive-social.js");
  const qs = {x:"What is x.com?",account:"Are you on X?",tiktok:"Do you know TikTok?",instagram:"What is Instagram?",youtube:"Do you know YouTube?",memes:"Do you know memes?",trends:"What's trending on X?",followers:"What are followers?",tweet:"Is it a tweet or a post?",seepost:"Can you see my post?",counts:"How many followers do I have?",whatpost:"What should I post?"};
  for (const sp of SOCIAL) for (const [f, key] of [["why","why"],["tell me more","more"],["how so?","why"]]) {
    const s = await createRiveSession(); const a = (await reply(s, qs[sp.id])).text; const b = (await reply(s, f)).text;
    (sp.replies.includes(a) && b === sp[key]) ? pass++ : (fail++, log.push(`FAIL social ${sp.id} ${f} → ${a} / ${b}`));
  }
  const m = SOCIAL.find((x) => x.id === "memes"), t = SOCIAL.find((x) => x.id === "trends");
  if (m.why !== "A familiar image can mean something different with a new caption." || /live feed/.test(m.why) || !/live feed/.test(t.why)) { fail++; log.push("FAIL memes/trends why"); } else pass++;
  if (m.replies.some((r) => t.replies.includes(r))) { fail++; log.push("FAIL memes/trends mixed"); } else pass++;
  const all = JSON.stringify(SOCIAL);
  if (/this preview|Paste the wording/.test(all) || /@(?!anabology)\w+/.test(all)) { fail++; log.push("FAIL social text"); } else pass++;
  const fr = async (q) => (await reply(await createRiveSession(), q)).text;
  for (const [q, re] of [["x", /Do you mean the platform/], ["can you post this", /can't publish/], ["how should I share this game", /night-driving game/], ["what is your twitter handle", /@anabology/], ["how many followers does anabology have", /count|numbers|number/]]) { const r = await fr(q); re.test(r) ? pass++ : (fail++, log.push(`FAIL social ${q} → ${r}`)); }
  const allLines = SOCIAL.flatMap((x) => [...x.replies, x.why, x.more]);
  for (const q of ["post", "follow", "follow me", "on x", "x marks the spot", "i will post it later", "reels", "trending", "the next exit", "I want to kill myself after seeing that tweet"]) { const r = await fr(q); allLines.includes(r) || /Do you mean the platform|can't publish/.test(r) ? (fail++, log.push(`FAIL social overbroad ${q} → ${r}`)) : pass++; }
  const s9 = await createRiveSession(); await reply(s9, "what is tiktok"); await reply(s9, "who are you"); const r9 = (await reply(s9, "why")).text; allLines.includes(r9) ? (fail++, log.push("FAIL social stale")) : pass++;
}
console.log(`RIVE TESTS: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
