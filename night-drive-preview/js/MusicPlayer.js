/*
  Manual local-MP3 picker. Audio starts only on a user gesture (button click).
  After the first play gesture, tracks advance automatically one after another.
  Skip/next is available once playback has been started by the user.
  Still no unprompted autoplay on page load.
*/

import { musicTracks } from "./music-tracks.js";

export default class MusicPlayer {
  constructor({ tracks = musicTracks } = {}) {
    this.tracks = Array.isArray(tracks) ? tracks.slice() : [];
    this.audio = new Audio();
    this.audio.preload = "none";
    this.currentId = null;
    this.listeners = [];
    /** True after the user has started playback at least once this page session. */
    this.userStarted = false;

    this.audio.addEventListener("ended", () => {
      if (this.userStarted && this.tracks.length > 0) {
        this.skip();
        return;
      }
      this.currentId = null;
      this._emit();
    });
  }

  addListener(fn) {
    if (!this.listeners.includes(fn)) this.listeners.push(fn);
  }

  _emit() {
    for (const fn of this.listeners) fn(this.status());
  }

  status() {
    return {
      tracks: this.tracks.map((t) => ({ id: t.id, title: t.title })),
      currentId: this.currentId,
      paused: this.audio.paused,
      userStarted: this.userStarted,
    };
  }

  _indexOf(trackId) {
    return this.tracks.findIndex((t) => t.id === trackId);
  }

  _playIndex(index, { fromUser = false } = {}) {
    if (this.tracks.length === 0) return this.status();
    const i = ((index % this.tracks.length) + this.tracks.length) % this.tracks.length;
    const track = this.tracks[i];
    this.audio.src = track.src;
    this.currentId = track.id;
    if (fromUser) this.userStarted = true;
    const p = this.audio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    this._emit();
    return this.status();
  }

  /** User-gesture play/pause toggle for a track id. */
  select(trackId) {
    const track = this.tracks.find((t) => t.id === trackId);
    if (track == null) return this.status();

    if (this.currentId === trackId && !this.audio.paused) {
      this.audio.pause();
      this._emit();
      return this.status();
    }

    return this._playIndex(this._indexOf(trackId), { fromUser: true });
  }

  /** Advance to the next track (wraps). Safe after userStarted; also usable as Skip. */
  skip() {
    if (this.tracks.length === 0) return this.status();
    // Skip is a user control — counts as a gesture if they haven't started yet? Only when called from UI.
    // Auto-advance from 'ended' keeps userStarted as-is.
    let idx = this._indexOf(this.currentId);
    if (idx < 0) idx = -1;
    return this._playIndex(idx + 1, { fromUser: false });
  }

  /** User-gesture Skip / next. */
  skipFromUser() {
    this.userStarted = true;
    return this.skip();
  }

  stop() {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.currentId = null;
    this._emit();
  }
}
