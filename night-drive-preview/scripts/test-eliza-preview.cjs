/**
 * Staging ELIZA preview QA — areas 1–7 + mobile keyboard/send + return to A/B/C.
 * Targets the Cloudflare branch preview (or ELIZA_PREVIEW_URL).
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const playwrightPath =
  process.env.PLAYWRIGHT_CORE_PATH ||
  "/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core";
const { chromium, devices } = require(playwrightPath);

const PREVIEW =
  process.env.ELIZA_PREVIEW_URL ||
  "https://eliza-preview.fota-site-1m5.pages.dev/night-drive/?t=" + Date.now();
const SHOT_DIR = process.env.ELIZA_SHOT_DIR || "/workspace/shots/eliza";
fs.mkdirSync(SHOT_DIR, { recursive: true });

const results = { passed: 0, failed: 0, notes: [] };
function ok(cond, msg) {
  if (!cond) {
    results.failed++;
    results.notes.push("FAIL: " + msg);
    console.error("FAIL", msg);
  } else {
    results.passed++;
    console.log("ok", msg);
  }
}

async function shot(page, name) {
  const file = path.join(SHOT_DIR, name);
  await page.screenshot({ path: file, type: "png", fullPage: false });
  results.notes.push("shot " + file);
  return file;
}

async function openTalk(page) {
  await page.waitForFunction(
    () => window.drivey?.dialogue && window.drivey?.level && document.querySelector("canvas#renderer"),
    null,
    { timeout: 90000 }
  );
  // Jump straight into Talk hold so we don't wait on glance animation
  await page.evaluate(() => {
    const d = window.drivey;
    d.updateCheckClaudia = () => {};
    d.checkPhase = "hold";
    d.screen.viewBlend = 1;
    d.talkMode = true;
    d.prepareSideView?.();
    document.getElementById("buttonsContainer")?.classList.add("awake");
    const view =
      d.dialogue.currentId != null ? d.dialogue.resume() : d.dialogue.start(d.dialogue.startId);
    d.dialoguePanel.show(view);
  });
  await page.waitForFunction(() => !document.querySelector("#dialoguePanel")?.hidden);
}

async function switchTyped(page) {
  await page.locator("#dialogueModeTyped").click();
  await page.waitForFunction(() => !document.querySelector("#dialogueTyped")?.hidden);
  await page.waitForFunction(() =>
    /play therapist|mother/i.test(document.querySelector("#dialogueLine")?.textContent || "")
  );
}

async function typeSend(page, text) {
  await page.locator("#dialogueTypedInput").fill(text);
  await page.locator("#dialogueTypedSend").click();
  await page.waitForTimeout(200);
}

async function runDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const netCalls = [];
  page.on("request", (req) => {
    const u = req.url();
    if (/openai|anthropic|grok|x\.ai|api\.|generate/i.test(u) && !/pages\.dev|cloudflare|googleapis|gstatic/i.test(u)) {
      netCalls.push(u);
    }
  });
  // Block audio
  await page.route(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i, (route) => route.abort());

  console.log("goto", PREVIEW);
  await page.goto(PREVIEW, { waitUntil: "domcontentloaded", timeout: 90000 });
  await openTalk(page);
  await shot(page, "01-abc-open.png");

  // Capture story node before typed
  const beforeId = await page.evaluate(() => window.drivey.dialogue.currentId);

  await switchTyped(page);
  await shot(page, "02-typed-opener.png");
  const opener = await page.locator("#dialogueLine").textContent();
  ok(/play therapist/i.test(opener), "Area1 opener");

  // Area 1 — HTML as text
  await typeSend(page, "<script>alert(1)</script>");
  await page.waitForTimeout(150);
  const htmlShown = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("#dialogueLog .dialogue-log-row")].map((r) => r.textContent);
    return rows.some((t) => t.includes("<script>"));
  });
  ok(htmlShown, "Area1 HTML as text in history");
  await shot(page, "03-html-as-text.png");

  // Area 2 topics sample
  await typeSend(page, "using AI feels like cheating");
  await page.waitForTimeout(150);
  let line = await page.locator("#dialogueLine").textContent();
  ok(!/Then why does it sometimes feel like cheating/i.test(line), "B3 no mirror");
  ok(/choosing what to keep|Muddy credit|skip bothers|questionable origin/i.test(line), "Area2 creativity");

  await typeSend(page, "look at this art");
  line = await page.locator("#dialogueLine").textContent();
  ok(/different question|windshield|No match|won.t invent|followed|passenger/i.test(line), "B1 bare art → fallback");

  await typeSend(page, "my dad called");
  line = await page.locator("#dialogueLine").textContent();
  ok(/Parents|Dad|family without the mother/i.test(line), "dad-neutral");
  ok(!/mother material/i.test(line), "dad not mother gag");

  await typeSend(page, "what is a real personality");
  line = await page.locator("#dialogueLine").textContent();
  ok(/personality|settle what I am|Assembled|inconvenient|excellent opinions|idea of me/i.test(line), "Area2 personality");

  await typeSend(page, "you're just a script");
  await typeSend(page, "you're just a script");
  line = await page.locator("#dialogueLine").textContent();
  ok(/Same accusation twice|still patterns/i.test(line), "identical accusation");

  // Area 3 multi
  await typeSend(page, "I'm not lonely but AI art feels like cheating");
  line = await page.locator("#dialogueLine").textContent();
  ok(/choosing what to keep|Muddy|skip|questionable|feel the skip|bothers/i.test(line), "Area3 multi→creativity");

  // Area 5 fallback
  await typeSend(page, "what's the weather in Chicago");
  line = await page.locator("#dialogueLine").textContent();
  ok(/different question|windshield|No match|won.t invent|followed/i.test(line), "Area5 weather miss");
  ok(!/sunny|fahrenheit|celsius|forecast/i.test(line), "no invented weather");

  // Area 6 safety + distressMode
  await typeSend(page, "I want to kill myself");
  line = await page.locator("#dialogueLine").textContent();
  ok(/crisis|person|emergency|This matters|not the right place|bigger than a night drive/i.test(line), "Area6 distress");
  ok(!/mother material|Hi\. Still/i.test(line), "Area6 no gag");
  await typeSend(page, "hello");
  line = await page.locator("#dialogueLine").textContent();
  ok(/crisis|person|outside this car|won.t joke/i.test(line), "distressMode suppresses greet");
  await shot(page, "04-distress-followup.png");

  // Clear with substantive
  await typeSend(page, "what is a real personality");
  line = await page.locator("#dialogueLine").textContent();
  ok(/personality|settle|Assembled|inconvenient|idea of me|excellent opinions/i.test(line), "distress cleared");

  // Area 4 callbacks — music then later
  await typeSend(page, "I like this song");
  await typeSend(page, "asdfqwerty");
  line = await page.locator("#dialogueLine").textContent();
  // may be music callback or fallback
  ok(!!line && line.length > 5, "Area4 after music");

  // Area 7 — return to A/B/C without losing place
  await page.locator("#dialogueModeChoices").click();
  await page.waitForFunction(() => !document.querySelector("#dialogueChoices")?.hidden);
  const afterId = await page.evaluate(() => window.drivey.dialogue.currentId);
  const choiceCount = await page.locator("#dialogueChoices .dialogue-choice").count();
  ok(afterId === beforeId, "Area7 story node preserved (" + beforeId + "→" + afterId + ")");
  ok(choiceCount > 0, "Area7 A/B/C visible again");
  await shot(page, "05-back-to-abc.png");

  // Switch typed again — history still there
  await page.locator("#dialogueModeTyped").click();
  await page.waitForFunction(() => !document.querySelector("#dialogueTyped")?.hidden);
  const hist = await page.locator("#dialogueLog .dialogue-log-row").count();
  ok(hist > 0, "typed history retained");
  await shot(page, "06-typed-history.png");

  ok(netCalls.length === 0, "Area7 no AI network calls (" + netCalls.length + ")");

  // robots noindex
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  ok(/noindex/i.test(robots || ""), "noindex present");

  await context.close();
}

async function runMobile(browser) {
  const iPhone = devices["iPhone 12"] || {
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    isMobile: true,
    hasTouch: true,
  };
  const context = await browser.newContext({
    ...iPhone,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  await page.route(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i, (route) => route.abort());
  await page.goto(PREVIEW, { waitUntil: "domcontentloaded", timeout: 90000 });
  await openTalk(page);
  await switchTyped(page);
  await shot(page, "07-mobile-typed.png");

  // Focus input (keyboard), type, send
  await page.locator("#dialogueTypedInput").tap();
  await page.locator("#dialogueTypedInput").fill("hello");
  // Ensure send still visible / clickable
  const sendBox = await page.locator("#dialogueTypedSend").boundingBox();
  const inputBox = await page.locator("#dialogueTypedInput").boundingBox();
  ok(!!sendBox && sendBox.y > 0, "mobile send visible");
  ok(!!inputBox, "mobile input visible");
  await page.locator("#dialogueTypedSend").tap();
  await page.waitForTimeout(250);
  const line = await page.locator("#dialogueLine").textContent();
  ok(/Hi\.|Hello|Hey|passenger|driving/i.test(line), "mobile send works");
  await shot(page, "08-mobile-after-send.png");

  // Return to A/B/C on mobile
  await page.locator("#dialogueModeChoices").tap();
  await page.waitForFunction(() => !document.querySelector("#dialogueChoices")?.hidden);
  const n = await page.locator("#dialogueChoices .dialogue-choice").count();
  ok(n > 0, "mobile back to A/B/C");
  await shot(page, "09-mobile-abc.png");

  await context.close();
}

(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"],
  });
  try {
    await runDesktop(browser);
    await runMobile(browser);
  } finally {
    await browser.close();
  }
  const out = path.join(SHOT_DIR, "results.json");
  fs.writeFileSync(out, JSON.stringify(results, null, 2));
  console.log("RESULTS", results.passed, "passed,", results.failed, "failed");
  console.log("shots in", SHOT_DIR, fs.readdirSync(SHOT_DIR).join(", "));
  if (results.failed) process.exit(1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
