/*
  Local MP3 playlist. Starts only on first user gesture, then auto-advances
  and loops the list. Prev / next / play-pause live in the button bar.
*/

import { musicTracks } from "./music-tracks.js?v=20261107b";

export default class MusicPlayer {
  constructor({ tracks = musicTracks } = {}) {
    this.tracks = Array.isArray(tracks) ? tracks.slice() : [];
    this.audio = new Audio();
    this.audio.preload = "metadata";
    // Soft default (half of the original 0.5).
    this.audio.volume = 0.25;
    // Start on Encore; playlist order stays 01→06 and wraps with next/prev.
    const encoreIndex = this.tracks.findIndex(
      (t) => t.id === "track-05" || /05-night-drive-with-claudia\.mp3/.test(t.src || "")
    );
    this.index = encoreIndex >= 0 ? encoreIndex : 0;
    this.currentId = null;
    this.listeners = [];
    this.userStarted = false;

    this.audio.addEventListener("ended", () => {
      if (this.userStarted && this.tracks.length > 0) this.next({ fromUser: false });
    });
    this.audio.addEventListener("play", () => this._syncMediaSession());
    this.audio.addEventListener("pause", () => this._syncMediaSession());
  }

  addListener(fn) {
    if (!this.listeners.includes(fn)) this.listeners.push(fn);
  }

  _emit() {
    for (const fn of this.listeners) fn(this.status());
  }

  status() {
    const cur = this.tracks[this.index] || null;
    return {
      tracks: this.tracks.map((t) => ({ id: t.id, title: t.title })),
      currentId: this.currentId,
      title: cur ? cur.title : "",
      index: this.index,
      paused: this.audio.paused,
      userStarted: this.userStarted,
      volume: this.audio.volume,
      muted: this.audio.muted,
    };
  }

  _syncMediaSession() {
    if (typeof navigator === "undefined" || !navigator.mediaSession) return;
    const cur = this.tracks[this.index] || null;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: cur ? cur.title : "Claudia Night Drive",
        artist: "Claudia Night Drive",
        album: "Night Drive",
      });
      navigator.mediaSession.playbackState =
        this.userStarted && !this.audio.paused ? "playing" : "paused";
    } catch (_) {
      /* MediaMetadata unsupported */
    }
  }

  _playIndex(index, { fromUser = false } = {}) {
    if (this.tracks.length === 0) return this.status();
    const i = ((index % this.tracks.length) + this.tracks.length) % this.tracks.length;
    const track = this.tracks[i];
    this.index = i;
    if (this.currentId !== track.id || !this.audio.src) {
      this.audio.src = track.src;
      this.currentId = track.id;
    }
    if (fromUser) this.userStarted = true;
    const p = this.audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    this._syncMediaSession();
    this._emit();
    return this.status();
  }

  /** Play/pause. First tap starts current index (Encore by default). */
  toggleFromUser() {
    if (this.tracks.length === 0) return this.status();
    if (!this.userStarted || !this.audio.src) {
      return this._playIndex(this.index, { fromUser: true });
    }
    if (this.audio.paused) {
      this.userStarted = true;
      const p = this.audio.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      this.audio.pause();
    }
    this._syncMediaSession();
    this._emit();
    return this.status();
  }

  next({ fromUser = false } = {}) {
    if (fromUser) this.userStarted = true;
    return this._playIndex(this.index + 1, { fromUser });
  }

  prev({ fromUser = false } = {}) {
    if (fromUser) this.userStarted = true;
    // If >2s into track, restart; else go previous
    if (this.audio.currentTime > 2) {
      this.audio.currentTime = 0;
      if (this.audio.paused && this.userStarted) {
        const p = this.audio.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
      this._syncMediaSession();
      this._emit();
      return this.status();
    }
    return this._playIndex(this.index - 1, { fromUser });
  }

  // Back-compat aliases used by older Drivey wiring
  select(trackId) {
    const i = this.tracks.findIndex((t) => t.id === trackId);
    if (i < 0) return this.status();
    return this._playIndex(i, { fromUser: true });
  }
  skip() { return this.next({ fromUser: false }); }
  skipFromUser() { return this.next({ fromUser: true }); }
  setVolume(v) {
    const x = Math.min(1, Math.max(0, Number(v)));
    this.audio.volume = x;
    this._emit();
    return x;
  }

  getVolume() {
    return this.audio.volume;
  }

  /** Autoplay: try now; if the browser blocks sound, start on the first tap or key anywhere. */
  autoStart() {
    if (this.tracks.length === 0) return;
    try { if (localStorage.getItem("nd_muted") === "1") this.audio.muted = true; } catch (_) {}
    const go = () => {
      if (this.userStarted && !this.audio.paused) return;
      this._playIndex(this.index, { fromUser: true });
    };
    const first = () => { off(); if (!this._autoOK) go(); };
    const evs = ["pointerdown", "touchstart", "keydown", "click"];
    const off = () => evs.forEach((ev) => window.removeEventListener(ev, first, true));
    evs.forEach((ev) => window.addEventListener(ev, first, { capture: true, passive: true }));
    this._playIndex(this.index, { fromUser: true });
    const p = this.audio.play();
    if (p && p.then) p.then(() => { this._autoOK = true; off(); this._emit(); }).catch(() => { this._emit(); });
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
    try { localStorage.setItem("nd_muted", this.audio.muted ? "1" : "0"); } catch (_) {}
    if (!this.audio.muted && (this.audio.paused || !this.userStarted)) this._playIndex(this.index, { fromUser: true });
    this._emit();
    return this.status();
  }

  stop() {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.currentId = null;
    this._syncMediaSession();
    this._emit();
  }
}
