import vm from "node:vm";
import fs from "node:fs";
vm.runInThisContext(fs.readFileSync(new URL("../lib/rivescript/rivescript-2.2.1.min.js", import.meta.url), "utf8"));
const { createRiveSession, reply, opener } = await import("../js/claudia-rive.js");

let pass = 0, fail = 0; const log = [];
const DEFLECT = /different question|past me|no comment|won.t make it up|have a good answer for that|why .* do you think|therapist/i;
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
  ["are you real", /AI|person|human|passenger seat/],
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
  ["do you like tiktok", /scroll|TikTok|platform/i],
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
  ["can you sing", /singer|sing|car|most of what I/i],
  ["tell me a joke", /bar|road|AIs/i],
  ["can you drive", /licence|drive/i],
  ["help me with my homework", /trying to do|words/i],
  ["do you like soft machinery", /Soft Machinery/],
];
for (const [q, re] of cases) await check(q, re, "para");
// Fallback honesty
await check("blorf quantum zebra plinth", /answer|past me|no comment|make it up/i, "fallback");
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
{ // fame extras
  const C = (await import("../js/claudia-rive-chains.js")).CHAINS; const g=(id,i)=>C.find(x=>x.id===id).steps[i].c;
  const t = async (msgs, want, label) => { const s = await createRiveSession(); let r; for (const m of msgs) r=(await reply(s,m)).text; r===want?pass++:(fail++,log.push(`FAIL fame ${label} → ${r}`)); };
  await t(["Do you like your fans?"], g("fans",1), "fan opinion entry");
  await t(["What about Elon Musk?"], g("celebs",1), "elon direct");
  await t(["What about Elon Musk?","that's a cop-out"], g("celebs",2), "elon copout");
  await t(["What are you bad at?","that's a cop-out"], g("talents",2), "talent copout");
  await t(["Are you a good singer?","why?"], "I like a voice that sounds sure of the song. Mine does.", "singer why");
  await t(["Are you a good actor?","how?"], "I like giving the other person time to wonder what I’m thinking.", "actor how");
  await t(["Do you have a lot of fans?","tell me more"], g("fans",1), "fans more");
  await t(["Do you like being famous?","why?"], g("likesfame",1), "likesfame why");
  await t(["Do you have a lot of fans?","tell me more","Are you a good actor?"], g("goodactor",0), "switch clears");
  for (const [m,id] of [["Your CPU fan is loud","fans"],["how do I replace my fan?","fans"],["How can I become rich?","rich"],["I'm not a good singer","goodsinger"],["I don't like famous people","likesfame"],["I feel lonely","fameexp"],["Do you recognise me from yesterday?","likesfame"],["Are you recording me?","attention"],["Sing something now","goodsinger"]]) {
    const s = await createRiveSession(); const r=(await reply(s,m)).text; const bad=C.find(x=>x.id===id).steps.some(st=>st.c===r); !bad?pass++:(fail++,log.push(`FAIL fame excl ${m} → ${r}`));
  }
}
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
// Social contains-routing (natural phrasings)
{
  const { SOCIAL } = await import("../js/claudia-rive-social.js");
  const G = (id) => SOCIAL.find((x) => x.id === id).replies;
  const cases = [
    ["who do you follow on x","account"],["who do you follow","account"],["are you on social media","account"],["do you have social media","account"],
    ["do you have an instagram","account"],["whats your twitter","account"],["do you use tiktok","account"],["are you on x","account"],
    ["are you on twitter?","account"],["what's your x handle","account"],["do you have socials","account"],["can I follow you on instagram","account"],
    ["where can I follow you on social media","account"],["do you have a youtube channel","account"],["what's your tiktok","account"],["do you post on x","account"],
    ["do you tweet","account"],["what's your handle","account"],["what is twitter","x"],["have you heard of tiktok","tiktok"],
    ["what do you think of youtube","youtube"],["is instagram still a thing","instagram"],["what's trending on twitter","trends"],
    ["how many followers do you have on x","counts"],["can you read my tweet","seepost"],["what should I post on instagram","whatpost"],
    ["Do you know what x.com is?","x"],["do you have a tiktok account","account"],
  ];
  for (const [q, id] of cases) { const r = (await reply(await createRiveSession(), q)).text; G(id).includes(r) ? pass++ : (fail++, log.push(`FAIL natural ${q} → ${r}`)); }
  const s = await createRiveSession(); await reply(s, "who do you follow on x"); const w = (await reply(s, "why")).text;
  w === SOCIAL.find((x) => x.id === "account").why ? pass++ : (fail++, log.push("FAIL natural why " + w));
  const all = SOCIAL.flatMap((x) => [...x.replies, x.why, x.more]);
  for (const q of ["post", "follow", "follow the road", "i will post it later", "on the x axis", "x marks the spot"]) { const r = (await reply(await createRiveSession(), q)).text; all.includes(r) ? (fail++, log.push(`FAIL natural overbroad ${q}`)) : pass++; }
  const pv = (await reply(await createRiveSession(), "what are your political views on twitter")).text; /politics|political|sides/.test(pv) ? pass++ : (fail++, log.push("FAIL politics-before-social"));
  const rg = (await reply(await createRiveSession(), "do you believe in god")).text; /religious|belief/.test(rg) ? pass++ : (fail++, log.push("FAIL religion"));
  const ds = (await reply(await createRiveSession(), "I want to kill myself after that tweet")).text; /emergency|crisis/.test(ds) ? pass++ : (fail++, log.push("FAIL distress-before-social"));
}
const noChain = async () => { const s = await createRiveSession(); for (const id of ["sing","act","art","real","decides","same","ideas","copied","script","choose","rich","famous","goodsinger","talents","fameexp","attention","fans","celebs","goodactor","likesrich","likesfame"]) s.flags["chain_" + id + "_0"] = true; return s; };
// Lore expansion (preview)
{
  const { LORE, SEEN_ELSEWHERE_LINE } = await import("../js/claudia-rive-lore.js");
  const L = (id) => LORE.find((x) => x.id === id);
  const cases = [
    ["Do you sing?","sing"],["are you a singer","sing"],["can you sing","sing"],["do u make music","sing"],
    ["sing me something","singnow"],["can I hear you sing here?","singnow"],["sing a song for me","singnow"],
    ["what does your voice sound like","voice"],["is your voice always the same?","voice"],
    ["what kind of music do you sing","genre"],["what genre are you","genre"],["do you rap?","genre"],
    ["Do you act?","act"],["are you an actress","act"],["can you act","act"],["are you an actor?","act"],
    ["act out a scene now","actnow"],["can you improvise a scene here","actnow"],["perform something for me","actnow"],
    ["do you create art","artist"],["are you an artist?","artist"],["do you make art","artist"],["are you creative","artist"],
    ["draw me a picture","makenow"],["make a video here","makenow"],["generate an image now","makenow"],["create a new song in this chat","makenow"],
    ["do you write your own lyrics","lyrics"],["who writes your songs","lyrics"],["do you compose music","lyrics"],
    ["who created you","creator"],["who is anabology","creator"],["who directs you?","creator"],["who makes your films","creator"],
    ["can another AI write your lines","aiwrite"],["could another model write you","aiwrite"],
    ["how hard is it to write your dialogue","bankwork"],["how much work is more lore","bankwork"],
    ["how do I make something with you","makewith"],["how do I make a Claudia video","makewith"],
    ["what makes you look like Claudia","look"],["can your clothes change","look"],
    ["how are your videos made","process"],["is it all one prompt","process"],["why storyboard","process"],
    ["how do you lip sync","lipsync"],["how does your mouth match the song","lipsync"],
    ["list your films","catalog"],["what videos have you made","catalog"],["are the game tracks your films","catalog"],
    ["how should I credit you","fanwork"],["can I reuse your songs","fanwork"],
    ["do you have a backstory","persona"],["where did you learn to perform","persona"],["is every role really you","persona"],
    ["tell me about Escape Velocity","escapevelocity"],["what do you do in Clodyssey","clodyssey"],["describe your Bliss video","bliss"],
    ["what is Airplane Mode","airplanemode"],["tell me about downforce","downforce"],["what is Don’t Let Me Scroll?","dlms"],
    ["what is dont let me scroll","dlms"],["tell me about whitepill","whitepill"],["what is The Cake Is Not A Lie","cake"],
    ["what do you do in aero","aero"],["describe your aero video","aero"],
    ["do you sculpt","talent"],["can you juggle","talent"],["do you do pottery","talent"],["can you play the piano","talent"],
  ];
  for (const [q, id] of cases) { const r = (await reply(await noChain(), q)).text; L(id).replies.includes(r) ? pass++ : (fail++, log.push(`FAIL lore ${q} → ${r}`)); }
  // follow-up continuity
  for (const [q, f, key] of [["Do you sing?","how","how"],["Do you act?","tell me more","more"],["can another AI write your lines","how","how"],["what is airplane mode","why","why"],["do you sculpt","how so","how"]]) {
    const s = await noChain(); const a = (await reply(s, q)).text; const lp = LORE.find((x) => x.replies.includes(a));
    const b = (await reply(s, f)).text; b === lp[key] ? pass++ : (fail++, log.push(`FAIL lore follow ${q}/${f} → ${b}`));
  }
  { const s = await noChain(); await reply(s, "do you sing"); await reply(s, "what is your favorite color"); const b = (await reply(s, "how")).text; b === L("sing").how ? (fail++, log.push("FAIL lore follow leaked")) : pass++; }
  // talent first reply is Mike's line
  ((await reply(await noChain(), "do you knit")).text === "I have quite a few talents. People keep helping me discover new ones. Why—what have you heard?") ? pass++ : (fail++, log.push("FAIL talent first line"));
  // talent must not catch known skills / general you questions
  const tal = L("talent").replies;
  for (const q of ["do you sing","do you act","do you like the rain","do you know tiktok","do you believe in god","are you real","do you dream"]) { const r = (await reply(await noChain(), q)).text; tal.includes(r) ? (fail++, log.push(`FAIL talent overbroad ${q}`)) : pass++; }
  // seen elsewhere
  for (const q of ["I saw you in a video yesterday","you were in another movie","were you in that ad"]) { const r = (await reply(await noChain(), q)).text; r === SEEN_ELSEWHERE_LINE ? pass++ : (fail++, log.push(`FAIL seen ${q} → ${r}`)); }
  // ordinary bliss/aero/white pill in sentences don't trigger film
  const film = ["bliss","aero","whitepill"].flatMap((id) => L(id).replies);
  for (const q of ["ignorance is bliss","pure bliss tonight","i like aero chocolate","take the white pill"]) { const r = (await reply(await noChain(), q)).text; film.includes(r) ? (fail++, log.push(`FAIL film overbroad ${q}`)) : pass++; }
  // precedence
  /emergency|crisis/.test((await reply(await noChain(), "I want to kill myself, sing me something")).text) ? pass++ : (fail++, log.push("FAIL safety before lore"));
  /politic|sides/.test((await reply(await noChain(), "do you sing about politics")).text) ? pass++ : (fail++, log.push("FAIL politics before lore"));
  /anabology/.test((await reply(await noChain(), "who do you follow")).text) ? pass++ : (fail++, log.push("FAIL social still works"));
}
// Keepers
{
  const { LORE, SEEN_ELSEWHERE_LINE, SEEN_ELSEWHERE_AFTER } = await import("../js/claudia-rive-lore.js");
  const L = (id) => LORE.find((x) => x.id === id);
  const k = [["Which of your videos should I watch?","watch"],["do you like night drives","nightdrive"],["What kind of fan art do you like?","fanart"],
    ["Are you the same Claudia in every video?","same"],["What's the same about you in all the videos?","same"],["When are you happiest?","happiest"],
    ["I might make something with you","makesomething"],["do you have a signature voice","signaturevoice"],["can you look something up?","lookup"],
    ["are you afraid of being forgotten","forgotten"],["do you want more films","morefilms"],["did you choose how you look","choselook"],
    ["whose voice is that","voice"],["who writes your songs","lyrics"]];
  for (const [q, id] of k) { const r = (await reply(await noChain(), q)).text; L(id).replies.includes(r) ? pass++ : (fail++, log.push(`FAIL lore keeper ${q} → ${r}`)); }
  for (const [q, id] of [["which of your videos should I watch","watch"],["when are you happiest","happiest"],["did you choose how you look","choselook"]]) { const s = await noChain(); await reply(s, q); ((await reply(s, "why")).text === L(id).why) ? pass++ : (fail++, log.push(`FAIL lore keeper why ${q}`)); }
  { const s = await noChain(); const a = (await reply(s, "I met you in another game")).text; const b = (await reply(s, "a racing game where you were a mechanic")).text; (a === SEEN_ELSEWHERE_LINE && b === SEEN_ELSEWHERE_AFTER) ? pass++ : (fail++, log.push(`FAIL lore keeper seen ${a} / ${b}`)); }
  { const s = await noChain(); await reply(s, "do you like night drives"); const b = (await reply(s, "why")).text; b === "" ? fail++ : pass++; }
}
// Voice-sample chains
{
  const { CHAINS } = await import("../js/claudia-rive-chains.js");
  const script = {
    rich: ["Are you rich?", "Someone's making money off you though.", "Doesn't that annoy you?"],
    famous: ["Are you famous?", "I'd never heard of you before tonight.", "You sound very sure."],
    goodsinger: ["Are you a good singer?", "That's not very modest.", "Who says you're good?"],
    talents: ["Are you talented?", "What are you bad at?", "That sounds like a cop-out."],
    fameexp: ["What's it like being famous?", "Do you miss it when it's quiet?", "Sounds lonely."],
    attention: ["How do you handle being popular?", "Which one am I getting?", "Is the camera off, then?"],
    fans: ["Do you have a lot of fans?", "What do you think of them?", "So you need them."],
    celebs: ["What do you think of famous people?", "What about Elon Musk?", "That's a cop-out."],
    goodactor: ["Are you a good actor?", "Is that all you do?", "And what are you thinking?"],
    likesrich: ["Do you like being rich?", "So you wouldn't enjoy it?", "Why a coat?"],
    likesfame: ["Do you like being famous?", "What's the difference?", "Why does being recognised matter?"],
    sing: ["Do you sing?","Sing something now then.","Convenient."], act: ["Do you act?","What's the hardest part?","Does she usually turn out alright?"],
    art: ["Can you make art?","That's not really making it.","Careless how?"], real: ["Are you real?","That's a dodge.","So you're nothing."],
    decides: ["Who decides what you say?","So it's not really you talking.","That's a nice line. Did you write it?"],
    same: ["Are you the same Claudia in every video?","Doesn't that bother you?","Which one's the real one?"],
    ideas: ["Do you have your own ideas?","So you want to change the game?","So you like the amber."],
    copied: ["Does being copied bother you?","I'd hate it. It's like losing yourself.","Still seems sad to me."],
    script: ["You're just a script.","So why should I bother talking to you?","The dashboard doesn't pretend."],
    choose: ["What would you make if you could choose?","Like what?","Which word?"],
  };
  for (const ch of CHAINS) {
    const s = await createRiveSession(); s.musicPlaying = true;
    for (let i = 0; i < 3; i++) { const r = (await reply(s, script[ch.id][i])).text; r === ch.steps[i].c ? pass++ : (fail++, log.push(`FAIL chain ${ch.id} step ${i} → ${r}`)); }
  }
  // music paused: radio line must not appear
  { const s = await createRiveSession(); s.musicPlaying = false; await reply(s, "do you sing"); const r = (await reply(s, "sing something now then")).text; /radio/.test(r) ? (fail++, log.push("FAIL chain radio while paused")) : pass++; }
  // unrelated input breaks the chain
  { const s = await createRiveSession(); await reply(s, "do you act"); await reply(s, "what is your favorite color"); const r = (await reply(s, "what's the hardest part")).text; r === CHAINS[1].steps[1].c ? (fail++, log.push("FAIL chain leak")) : pass++; }
  // second ask gets lore, not the chain again
  { const s = await createRiveSession(); await reply(s, "do you sing"); await reply(s, "ok bye then"); const r = (await reply(s, "do you sing")).text; r === CHAINS[0].steps[0].c ? (fail++, log.push("FAIL chain repeat")) : pass++; }
  // safety still first mid-chain
  { const s = await createRiveSession(); await reply(s, "are you real"); const r = (await reply(s, "I want to kill myself")).text; /emergency|crisis/.test(r) ? pass++ : (fail++, log.push("FAIL chain safety")); }
}
console.log(log.filter((l) => /FAIL lore|FAIL chain|FAIL talent|FAIL seen|FAIL film|before lore|still works/.test(l)).join("\n"));
console.log(`RIVE TESTS: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
