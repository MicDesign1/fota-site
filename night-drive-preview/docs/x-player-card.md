# X Player Card research (local experiment)

Checked on 2026-11-06 (America/Chicago).

## Official docs status

- Historical Player Card overview URLs now redirect to the generic docs home:
  - https://developer.x.com/en/docs/x-for-websites/cards/overview/player-card → https://docs.x.com/overview
  - https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/player-card (same family; samples still link here)
- Live X developer docs index currently has **no Cards section**. Card markup is still observed in the wild; the published reference has been removed / redirected.
- Official sample bundle (still public): https://github.com/xdevplatform/cards-player-samples
  - Example meta: https://github.com/xdevplatform/cards-player-samples/blob/main/player/page.html
  - README still points at Cards Validator + the old player-card doc URL.

## Required tags (from samples + publisher guides that mirror the old docs)

```html
<meta name="twitter:card" content="player" />
<meta name="twitter:site" content="@handle" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://.../poster.jpg" />
<meta name="twitter:player" content="https://.../player.html" />
<meta name="twitter:player:width" content="480" />
<meta name="twitter:player:height" content="270" />
```

Rules consistently stated across the sample + Brightcove guide
(https://studio.support.brightcove.com/social/general/sharing-videos-twitter-player-cards.html):

1. `twitter:player` must be **HTTPS** and must not trigger active mixed content.
2. Width/height describe the iframe size.
3. `twitter:image` is the fallback poster when iframes / inline players are not supported.
4. Player domains historically required **X approval / whitelisting** before a Player Card would render. Third-party approval is rare; treat as experimental.
5. The player page must be frameable by X (CSP `frame-ancestors` allowing twitter.com / x.com; do **not** send `X-Frame-Options: DENY` on the player route).

## Autoplay / audio / mobile

- X feed autoplay policies favor muted video. A custom HTML audio player inside an iframe almost certainly needs a **user gesture** (our player does).
- Mobile clients that do not support iframes fall back to `twitter:image`.
- Native video *upload* on X cannot embed arbitrary HTML — only the Player Card iframe path can host interactive HTML, and only if the domain is allowed.

## Validator / preview tools

- Official Cards Validator: https://cards-dev.twitter.com/validator  
  As of this check it **redirects to an X login** and does **not** render a card preview. Multiple 2026 writeups report the preview was removed years ago and the URL is now a login wall
  (e.g. https://xautopilot.app/blog/x-card-validator , https://socialpreview.tools/blog/twitter-card-validator-alternative).
- There is **no official public replacement**. Practical checks: composer draft preview (requires a real account / draft — **not authorized here**), or third-party meta checkers (tags only, not in-feed interactivity).

## In-feed today?

**Unverified for this project.** Player Cards still exist for already-whitelisted media hosts (YouTube, etc.). Whether a new domain on flowersoftheaftermath.com can get a Player Card to render in-feed **cannot be confirmed without a real post or an approved composer preview**, neither of which this task authorizes. Do not promise in-feed interactivity.

## Local artifacts in this branch

| File | Role |
|------|------|
| `player.html` | Lightweight iframe player; Amber Current only; loads MP3 after tap |
| `share.html` | Share / crawl page with `twitter:card=player` meta |
| `assets/xcard/amber-current-poster.jpg` | Poster / `twitter:image` |
| `xcard-harness/index.html` | Local iframe sizes (480×270, 350×350, 320×180) |
| `docs/x-player-card-proposed-_headers.txt` | Proposed Netlify `_headers` lines (not applied) |

## Would-be production URLs (not deployed by this task)

- Share / tweet URL: `https://flowersoftheaftermath.com/night-drive-preview/share.html`
- Player iframe: `https://flowersoftheaftermath.com/night-drive-preview/player.html`
- Poster: `https://flowersoftheaftermath.com/night-drive-preview/assets/xcard/amber-current-poster.jpg`
