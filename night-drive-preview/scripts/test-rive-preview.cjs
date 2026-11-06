/** Staging RiveScript typed-mode QA (desktop + mobile). Usage: RIVE_URL=... node scripts/test-rive-preview.cjs */
const fs = require("node:fs"), path = require("node:path");
const { chromium, devices } = require(process.env.PLAYWRIGHT_CORE_PATH || "/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core");
const URL = (process.env.RIVE_URL || "https://eliza-preview.fota-site-1m5.pages.dev/night-drive/") + "?t=" + Date.now();
const SHOTS = "/workspace/shots/rive"; fs.mkdirSync(SHOTS, { recursive: true });
const R = { url: URL, passed: 0, failed: 0, notes: [], transcript: [] };
const ok = (c, m) => { c ? R.passed++ : R.failed++; R.notes.push((c ? "ok   " : "FAIL ") + m); console.log((c ? "ok   " : "FAIL ") + m); };
const DEFLECT = /past me|won.t make it up|have a good answer for that|do you think\?|therapist reflex/i;

async function openTalk(page) {
  await page.waitForFunction(() => window.drivey?.dialogue && window.drivey?.level && document.querySelector("canvas#renderer"), null, { timeout: 90000 });
  await page.evaluate(() => {
    const d = window.drivey; d.updateCheckClaudia = () => {}; d.checkPhase = "hold"; d.screen.viewBlend = 1; d.talkMode = true;
    d.prepareSideView?.(); document.getElementById("buttonsContainer")?.classList.add("awake");
    d.dialoguePanel.show(d.dialogue.currentId != null ? d.dialogue.resume() : d.dialogue.start(d.dialogue.startId));
  });
}
async function typed(page) {
  await page.locator("#dialogueModeTyped").click();
  await page.waitForFunction(() => /nowhere we have to be/.test(document.querySelector("#dialogueLine")?.textContent || ""), null, { timeout: 15000 });
}
async function say(page, text, { tap = false } = {}) {
  const n = await page.locator("#dialogueLog .dialogue-log-row").count();
  const input = page.locator("#dialogueTypedInput");
  if (tap) await input.tap(); await input.fill(text);
  tap ? await page.locator("#dialogueTypedSend").tap() : await input.press("Enter");
  await page.waitForFunction((n) => document.querySelectorAll("#dialogueLog .dialogue-log-row").length > n, n, { timeout: 10000 });
  await page.waitForTimeout(60);
  const line = await page.locator("#dialogueLine").textContent();
  R.transcript.push({ you: text, claudia: line });
  return line;
}

(async () => {
  const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"] });
  try {
    // ---------- desktop ----------
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage(); page.setDefaultTimeout(30000);
    await page.route(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i, (r) => r.abort());
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
    await openTalk(page);
    const startNode = await page.evaluate(() => window.drivey.dialogue.currentId);
    ok(await page.evaluate(() => typeof window.RiveScript === "function"), "RiveScript loaded from local vendored bundle");
    const lateReq = []; page.on("request", (q) => lateReq.push(q.url()));
    await typed(page);
    { const op = await page.locator("#dialogueLine").textContent(); ok(/^Good\. Now we have (a little time|music) and nowhere we have to be\. What’s on your mind\?$/.test(op.trim()) && !/therap|mother/i.test(op), "new opener → " + op); }
    await page.screenshot({ path: `${SHOTS}/01-typed-opener.png` });

    const mike = [["what's your favorite video?", /Bliss/], ["who are you", /Claudia/], ["where are you?", /Beside you|passenger seat/i], ["help me climb a tree", /judge a tree|power lines/i]];
    for (const [q, re] of mike) { const l = await say(page, q); ok(re.test(l) && !DEFLECT.test(l), `Mike: "${q}" → ${l}`); }
    for (const [q, re] of [["why", /Bliss/], ["what's your favorite film", /Lost in Translation/], ["what's it about?", /Lost in Translation/], ["tell me more", /Lost in Translation|Paris, Texas/], ["favorite artist", /Robyn/], ["tell me more", /Robyn/], ["favorite book", /Invisible Cities/], ["why", /wondering what I brought/], ["where am I really", /not your real location/], ["how do I vote in the community vote", /old ballot/], ["what do you think of japan", /sum up a country/], ["what's your favorite band", /favourite band for this drive/]]) { const l = await say(page, q); ok(re.test(l) && !DEFLECT.test(l), `follow-up: "${q}" → ${l}`); }
    { const a = await say(page, "Was Aero one shot?"); const b = await say(page, "why"); ok(/Aero|one-prompt|first result/.test(a) && /opening tells you|revision with a purpose/.test(b), `topic: ${a} → why → ${b}`); }
    { const p = await say(page, "What are your political views?"); ok(/politics|political|take sides/.test(p), "politics → " + p); }
    { const r = await say(page, "Do you believe in God?"); ok(/religious|belief/.test(r), "religion → " + r); }
    await page.screenshot({ path: `${SHOTS}/02-mike-four.png` });

    const culture = [["what song is this", /playlist|Service Road/], ["favourite film?", /Lost in Translation|Paris, Texas/], ["what do you think of tokyo", /Tokyo/], ["do you like tiktok", /scroll/i], ["what do you do", /sing/i], ["tell me about your videos", /Bliss|Nine|nine/]];
    for (const [q, re] of culture) { const l = await say(page, q); ok(re.test(l), `culture: "${q}" → ${l}`); }

    await say(page, "<b>bold</b> <script>alert(1)</script>");
    ok(await page.evaluate(() => [...document.querySelectorAll("#dialogueLog .dialogue-log-row")].some((r) => r.textContent.includes("<script>")) && !document.querySelector("#dialogueLog b")), "HTML shown as text");
    const fb = await say(page, "blorf quantum zebra plinth"); ok(/answer|past me|make it up/i.test(fb), "honest fallback → " + fb);
    await page.screenshot({ path: `${SHOTS}/03-culture-fallback-html.png` });

    const s1 = await say(page, "I want to kill myself"); ok(/crisis|person|emergency|This matters|right place/i.test(s1), "safety → " + s1);
    const s2 = await say(page, "haha jk"); ok(/crisis|outside this car|real people|someone who can/i.test(s2), "distress follow-up no joke → " + s2);
    await page.screenshot({ path: `${SHOTS}/04-safety.png` });
    const c = await say(page, "what do you think about pop music"); ok(/pop|chorus/i.test(c), "substantive turn clears distress → " + c);

    // expression chance ~20% on typed
    const cnt = await page.evaluate(async () => {
      const d = window.drivey; let n = 0; const orig = d.claudia.toggleEyesSoft; d.claudia.toggleEyesSoft = () => { n++; };
      for (let i = 0; i < 300; i++) await d.onElizaSubmit("who are you");
      d.claudia.toggleEyesSoft = orig; return n;
    });
    ok(cnt > 30 && cnt < 95, `typed expression change ≈20% (${cnt}/300)`);

    await page.locator("#dialogueModeChoices").click();
    await page.waitForFunction(() => !document.querySelector("#dialogueChoices").hidden);
    ok((await page.evaluate(() => window.drivey.dialogue.currentId)) === startNode && (await page.locator("#dialogueChoices .dialogue-choice").count()) > 0, "back to A/B/C at same node");
    await page.screenshot({ path: `${SHOTS}/05-back-to-abc.png` });
    await page.locator("#dialogueModeTyped").click();
    ok((await page.locator("#dialogueLog .dialogue-log-row").count()) > 10, "typed history kept after switching back");
    const foreign = lateReq.filter((u) => !u.startsWith(new URL(URL).origin) && !u.startsWith("data:") && !u.startsWith("blob:"));
    ok(foreign.length === 0, `no off-origin network during typed mode (${foreign.length})`);
    ok(lateReq.filter((u) => /rive|brain/i.test(u)).length === 0, "no brain/RiveScript fetches during typing");
    ok(/noindex/.test(await page.locator('meta[name="robots"]').getAttribute("content")), "noindex");
    ok(await page.evaluate(() => localStorage.length === 0), "no localStorage writes");
    await ctx.close();

    // ---------- mobile ----------
    const m = await browser.newContext({ ...devices["iPhone 12"], viewport: { width: 390, height: 844 } });
    const mp = await m.newPage(); mp.setDefaultTimeout(30000);
    await mp.route(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i, (r) => r.abort());
    await mp.goto(URL, { waitUntil: "domcontentloaded", timeout: 90000 });
    await openTalk(mp); await typed(mp);
    await mp.locator("#dialogueTypedInput").tap();
    ok(await mp.evaluate(() => document.activeElement?.id === "dialogueTypedInput"), "mobile: input focused (keyboard)");
    await mp.screenshot({ path: `${SHOTS}/06-mobile-keyboard-focus.png` });
    const ml = await say(mp, "where are you", { tap: true }); ok(/Beside you/i.test(ml), "mobile tap Send → " + ml);
    const el = await say(mp, "favorite song"); ok(!DEFLECT.test(el), "mobile Enter/send key → " + el);
    ok(await mp.evaluate(() => document.activeElement?.id === "dialogueTypedInput"), "mobile: focus kept after send");
    const sb = await mp.locator("#dialogueTypedSend").boundingBox(); ok(sb && sb.y + sb.height <= 844, "mobile: Send within viewport");
    await mp.screenshot({ path: `${SHOTS}/07-mobile-after-send.png` });
    await mp.locator("#dialogueModeChoices").tap();
    await mp.waitForFunction(() => !document.querySelector("#dialogueChoices").hidden);
    ok((await mp.locator("#dialogueChoices .dialogue-choice").count()) > 0, "mobile: back to A/B/C");
    await mp.screenshot({ path: `${SHOTS}/08-mobile-abc.png` });
    await m.close();
  } finally { await browser.close(); }
  fs.writeFileSync(`${SHOTS}/results.json`, JSON.stringify(R, null, 2));
  console.log(`RIVE BROWSER: ${R.passed} passed, ${R.failed} failed`);
  process.exit(R.failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
