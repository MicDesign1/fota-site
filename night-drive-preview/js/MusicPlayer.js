/*
  Local MP3 playlist. Starts only on first user gesture, then auto-advances
  and loops the list. Prev / next / play-pause live in the button bar.
*/

import { musicTracks } from "./music-tracks.js";

export default class MusicPlayer {
  constructor({ tracks = musicTracks } = {}) {
    this.tracks = Array.isArray(tracks) ? tracks.slice() : [];
    this.audio = new Audio();
    this.audio.preload = "metadata";
    this.index = 0;
    this.currentId = null;
    this.listeners = [];
    this.userStarted = false;

    this.audio.addEventListener("ended", () => {
      if (this.userStarted && this.tracks.length > 0) this.next({ fromUser: false });
    });
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
    };
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
    this._emit();
    return this.status();
  }

  /** Play/pause. First tap starts track 0 (or current). */
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
  stop() {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.currentId = null;
    this._emit();
  }
}
