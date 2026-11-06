const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const playwrightPath = process.env.PLAYWRIGHT_CORE_PATH || "/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core";
const { chromium } = require(playwrightPath);
const output = path.resolve(__dirname, "../artifacts/story-ch1");
fs.mkdirSync(output, { recursive: true });

let browser;
async function run() {
  const watchdog = setTimeout(() => {
    console.error("Timed out: closing only this story-test Chrome");
    browser?.close().finally(() => process.exit(1));
  }, 180000);
  console.log("Launching isolated headless Chrome…");
  browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--mute-audio"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errors = [], requests = [], transcripts = [];
  let blockedAudio = 0;
  await context.addInitScript(() => {
    window.__storyStorageReads = [];
    const original = window.Storage?.prototype?.getItem;
    if (!original) return;
    for (const kind of ["localStorage", "sessionStorage"]) {
      Object.defineProperty(Storage.prototype, "getItem", {
        configurable: true,
        value(key) {
          window.__storyStorageReads.push({ kind, key, stack: new Error().stack });
          return original.call(this, key);
        },
      });
    }
    window.__storyAudioPlays = 0;
    const originalPlay = window.HTMLMediaElement?.prototype?.play;
    if (!originalPlay) return;
    HTMLMediaElement.prototype.play = function (...args) {
      window.__storyAudioPlays++;
      return originalPlay.apply(this, args);
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", (exception) => errors.push(String(exception)));
  page.on("console", (message) => { if (message.type() === "error") { errors.push(message.text()); console.error("Browser console error:", message.text()); } });
  page.on("request", (request) => requests.push(request.url()));
  await page.route(/\.(mp3|wav|ogg|m4a)(\?.*)?$/i, async (route) => { blockedAudio++; await route.abort(); });

  async function clickTalk() {
    await page.waitForFunction(() => window.drivey.checkPhase === "idle" || window.drivey.checkPhase === "hold");
    await page.locator("#button_talkClaudia").click();
    await page.waitForFunction(() => !document.querySelector("#dialoguePanel").hidden && document.querySelectorAll("#dialogueChoices .dialogue-choice").length > 0);
  }
  async function open() {
    console.log("Open road and click Talk…");
    await page.goto("http://127.0.0.1:8876/?side", { waitUntil: "networkidle" });
    await page.waitForTimeout(100);
    await page.waitForFunction(() => Object.keys(window.drivey?.dialogue?.script ?? {}).length === 53);
    await page.waitForFunction(() => window.drivey?.dialogue && window.drivey?.level && document.querySelector("canvas#renderer"));
    assert.equal(await page.evaluate(() => window.drivey.music.userStarted), false);
    await clickTalk();
  }
  async function view() {
    return page.evaluate(() => ({
      id: window.drivey.dialogue.currentId,
      line: document.querySelector("#dialogueLine").textContent,
      choices: [...document.querySelectorAll("#dialogueChoices .dialogue-choice")].map((button) => button.textContent),
      expected: window.drivey.dialogue.current ? window.drivey.dialogue.resolveLine(window.drivey.dialogue.current) : null,
      flags: { ...window.drivey.dialogue.flags },
      history: window.drivey.dialogue.history.map((item) => ({ nodeId: item.nodeId, choiceIndex: item.choiceIndex, label: item.label })),
      cruiseSpeed: window.drivey.cruiseSpeed,
      controlMode: window.drivey.controlMode,
      music: window.drivey.music.status(),
      audioPlays: window.__storyAudioPlays,
    }));
  }
  async function checkView(label, expectedId) {
    const current = await view();
    assert.equal(current.id, expectedId, `${label}: expected ${expectedId}, got ${current.id}`);
    if (expectedId) assert.equal(current.line, current.expected, `${label}: panel and engine lines differ`);
    if (expectedId) assert.equal(current.choices.length, 3, `${label}: expected three buttons`);
    assert.equal(current.cruiseSpeed, 1);
    assert.equal(current.controlMode, "autopilot");
    assert.ok(current.line.length > 0, `${label}: blank panel line`);
    assert.equal(current.music.userStarted, false);
    assert.equal(current.audioPlays, 0);
    return current;
  }
  async function choose(label, index, expectedId) {
    const buttons = page.locator("#dialogueChoices .dialogue-choice");
    assert.equal(await buttons.count(), 3, `${label}: three choices before clicking`);
    const current = await view();
    transcripts.push({ from: current.id, line: current.line, choice: current.choices[index], expectedNext: expectedId });
    await buttons.nth(index).click();
    return checkView(`${label} -> ${expectedId}`, expectedId);
  }
  async function finish(label, endIndex = 0) {
    await choose(`${label} final node`, endIndex, null);
    assert.equal(await page.locator("#dialogueChoices .dialogue-choice").count(), 1);
    assert.equal(await page.locator("#dialogueChoices .dialogue-drive").textContent(), "Drive");
    transcripts.push({ from: null, end: true, line: await page.locator("#dialogueLine").textContent });
    await page.locator("#dialogueChoices .dialogue-drive").click();
    await page.waitForFunction(() => document.querySelector("#dialoguePanel").hidden);
  }

  await open();
  console.log("Read opener…");
  const opener = await checkView("opener", "start");
  assert.equal(opener.line, "Are you lost?");
  assert.deepEqual(opener.choices, ["A. A little.", "B. I thought you knew the way.", "C. Does it matter?"]);
  assert.deepEqual(opener.flags, {});
  assert.equal(opener.history.length, 0);
  await page.screenshot({ path: path.join(output, "01-opener-desktop.png") });
  await choose("B opener", 1, "b1");
  assert.equal((await checkView("B reply", "b1")).line, "I do. I was asking about you.");
  await page.locator("#dialogueClose").click();
  await page.waitForFunction(() => document.querySelector("#dialoguePanel").hidden);
  const savedHistory = await page.evaluate(() => window.drivey.dialogue.history.length);
  await clickTalk();
  assert.equal((await view()).history.length, savedHistory, "Closing and reopening Talk retains history");
  await page.screenshot({ path: path.join(output, "02-resumed-b-reply.png") });

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.drivey?.dialogue && window.drivey?.level);
  assert.deepEqual(await page.evaluate(() => ({ flags: { ...window.drivey.dialogue.flags }, history: window.drivey.dialogue.history })), { flags: {}, history: [] });
  await open();
  assert.equal((await checkView("fresh page", "start")).line, "Are you lost?");
  await choose("curious", 2, "c1");
  await choose("curiosity", 0, "c2_curious");
  await choose("optional topic", 2, "bml_start");
  await page.screenshot({ path: path.join(output, "03-optional-topic.png") });
  await choose("believe what", 0, "bml_later");
  assert.equal((await view()).line, "You want to do the later part now?");
  await page.screenshot({ path: path.join(output, "04-believe-later-play.png") });
  await choose("title preview", 0, "bml_title_talk");
  await choose("escape velocity", 1, "bml_velocity");
  assert.equal((await view()).line, "You've passed the same warehouse three times. Not yet.");
  await page.screenshot({ path: path.join(output, "05-escape-velocity.png") });
  await finish("escape velocity");
  assert.equal(await page.evaluate(() => window.drivey.music.userStarted), false);

  await open();
  await choose("curious again", 2, "c1");
  await choose("curiosity again", 0, "c2_curious");
  await choose("optional again", 2, "bml_start");
  await choose("heard song", 1, "bml_heard");
  await choose("someone stays", 1, "bml_reflect");
  assert.equal((await view()).line, "Staying's a clean read. Still yours.");
  await choose("whose song", 1, "bml_whose");
  await choose("anabology", 0, "bml_ana");
  assert.equal((await view()).line, "You can tell him. I'm not turning around.");
  await page.screenshot({ path: path.join(output, "06-anabology-playful.png") });
  await finish("anabology", 0);

  await open();
  await choose("a little", 0, "a1");
  await choose("want way out", 1, "out_want");
  await choose("appreciate", 0, "out1");
  await choose("why not", 0, "not1");
  await choose("sure", 0, "not1b");
  await choose("heads up", 0, "after_not");
  await choose("breakfast", 2, "breakfast_ordinary");
  await choose("good order", 1, "bridge_prep");
  assert.equal((await view()).line, "Past the bridge, the south spur's after the crest. I'll say if I remember fencing.");
  await choose("bridge", 0, "bridge1");
  await choose("crest", 0, "bridge2");
  await choose("fencing", 0, "fenced1");
  await page.screenshot({ path: path.join(output, "07-main-tree-fencing.png") });
  await choose("another lap", 0, "settle_lap");
  await finish("main route");

  await open();
  await choose("lap curiosity", 2, "c1");
  await choose("company", 2, "lap1");
  await choose("lap", 1, "lap_pace");
  assert((await view()).line.startsWith("Encore? Then"), "French is sparse and contextual");
  await page.screenshot({ path: path.join(output, "08-sparse-french.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const mobileBounds = await page.locator("#dialoguePanel .dialogue-card").boundingBox();
  assert(mobileBounds.width <= 390);
  assert(mobileBounds.y + mobileBounds.height <= 844);
  await page.screenshot({ path: path.join(output, "09-portrait-talk.png") });
  await choose("portrait bad ramp", 0, "ramp_prep");
  await choose("portrait explain", 2, "ramp1");
  await choose("portrait why", 1, "not1b");
  await choose("portrait road", 2, "pace_ok");
  await choose("portrait trust", 0, "bridge_prep");
  await choose("portrait clear", 1, "bridge1_clearq");
  await page.screenshot({ path: path.join(output, "10-portrait-bridge.png") });
  await choose("portrait tell south", 0, "bridge2_exit");
  await choose("portrait clear spur", 1, "open1");
  await choose("portrait leave talk", 1, "settle_out");
  await finish("portrait route", 2);

  const storage = await page.evaluate(() => window.__storyStorageReads);
  const dialogueStorage = storage.filter(({ stack }) => /dialogue/i.test(stack));
  assert.deepEqual(dialogueStorage, [], "Dialogue must never read browser storage");
  assert.equal(await page.evaluate(() => window.__storyAudioPlays), 0);
  assert.equal(await page.evaluate(() => window.drivey.music.userStarted), false);
  assert.equal(await page.evaluate(() => window.drivey.cruiseSpeed), 1);
  assert.equal(await page.evaluate(() => window.drivey.controlMode), "autopilot");
  assert.equal(errors.length, 0, errors.join("\n"));
  assert.equal(requests.filter((url) => /\.mp3(?:\?|$)/i.test(url)).length, 0);

  const result = {
    chrome: await browser.version(),
    opener: opener.line,
    totalDialogueViews: transcripts.length,
    transcript: transcripts,
    freshLoadResets: true,
    closeReopenResumes: true,
    allRoutesUseThreeChoices: true,
    musicNeverStarted: true,
    musicPlaybackCalls: 0,
    audioInterceptionArmed: true,
    noAudioNeededForStory: true,
    blockedAudioRequests: blockedAudio,
    musicModulesLoaded: requests.filter((url) => /(?:music-tracks)\.js/.test(url)),
    mp3Requests: requests.filter((url) => /\.mp3(?:\?|$)/i.test(url)),
    dialogueStorageReads: dialogueStorage,
    unrelatedThemeStorageRead: storage,
    browserErrors: errors,
    screenshots: fs.readdirSync(output).filter((name) => name.endsWith(".png")).sort(),
  };
  fs.writeFileSync(path.join(output, "browser-results.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(`PASS Chrome ${result.chrome}: ${transcripts.length} rendered dialogue views, four real button walks plus resume/reset`);
  console.log("PASS opener, B reply, three approved optional exchanges, main-tree and portrait routes match the engine");
  console.log("PASS every visited node has 3 buttons; Drive exits preserve automatic drive; close/reopen resumes; reload resets");
  console.log(`PASS no dialogue storage reads; music.userStarted=false and Audio.play() calls=0; ${blockedAudio} audio requests blocked; 0 MP3 requests; interceptors armed but no audio needed`);
  console.log("PASS desktop and 390x844 portrait screenshots; zero page or console errors");
  console.log(`Artifacts: ${output}`);
  await browser.close();
  clearTimeout(watchdog);
}
run().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close();
  process.exitCode = 1;
});


