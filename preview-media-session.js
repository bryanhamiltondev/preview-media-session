/**
 * preview-media-session.js - wire the OS media popover to any <audio> preview.
 *
 * Without MediaMetadata, macOS/iOS/Android show the PAGE TITLE in the system
 * media popover while your preview plays. This fixes that in one call:
 * title, artist, album and 600x600 artwork on play; cleared on pause/end.
 *
 * Zero dependencies. Fails silent on browsers without the Media Session API.
 *
 * Usage:
 *   const pms = new PreviewMediaSession(audioEl);
 *   pms.setTrack({ trackName: 'Miracle', artistName: 'Calvin Harris',
 *                  artworkUrl100: 'https://.../100x100bb.jpg' });
 *   audioEl.play();                       // popover now shows the track
 *   pms.clear();                          // or let pause/end clear it
 *
 * Provenance: extracted November 2026 from two production preview players
 * (a DJ-directory hover player and a ticker-tray EQ dock) that both played
 * iTunes previews and both popped over the page title.
 */
(function (global) {
  'use strict';

  function PreviewMediaSession(audio, options) {
    options = options || {};
    this.audio = audio;
    this.album = options.album || '';
    this.artSize = options.artworkSize || 600;
    this.clearOnStop = options.clearOnStop !== false;
    this._track = null;
    this._supported = 'mediaSession' in navigator && 'MediaMetadata' in global;
    if (this._supported) this._bind();
  }

  PreviewMediaSession.prototype._bind = function () {
    var self = this;
    this._onPlay = function () { self.push(); };
    this._onStop = function () { self.clear(); };
    this.audio.addEventListener('play', this._onPlay);
    this.audio.addEventListener('pause', this._onStop);
    this.audio.addEventListener('ended', this._onStop);
  };

  /** Upgrade an iTunes-style artworkUrl100 (.../100x100bb.jpg) to N x N. */
  PreviewMediaSession.prototype.artworkUrl = function (url) {
    if (!url) return '';
    return String(url).replace(/\/(\d+)x\1/, '/' + this.artSize + 'x' + this.artSize);
  };

  /** Push the current track (set via setTrack) into the media session. */
  PreviewMediaSession.prototype.push = function () {
    if (!this._supported) return;
    var t = this._track || {};
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.trackName || t.title || 'Preview',
        artist: t.artistName || t.artist || '',
        album: this.album,
        artwork: t.artworkUrl100 || t.artworkUrl
          ? [{ src: this.artworkUrl(t.artworkUrl100 || t.artworkUrl),
               sizes: this.artSize + 'x' + this.artSize, type: 'image/jpeg' }]
          : []
      });
      navigator.mediaSession.playbackState = 'playing';
    } catch (e) { /* media session is best-effort by design */ }
  };

  /** Store the track object; accepts iTunes-shaped fields. */
  PreviewMediaSession.prototype.setTrack = function (track) {
    this._track = track || null;
  };

  /** Clear the popover (call when your UI stops or dismisses the player). */
  PreviewMediaSession.prototype.clear = function () {
    if (!this._supported) return;
    try {
      navigator.mediaSession.playbackState = 'paused';
      if (this.clearOnStop) navigator.mediaSession.metadata = null;
    } catch (e) {}
  };

  PreviewMediaSession.prototype.detach = function () {
    if (!this._supported) return;
    this.audio.removeEventListener('play', this._onPlay);
    this.audio.removeEventListener('pause', this._onStop);
    this.audio.removeEventListener('ended', this._onStop);
  };

  global.PreviewMediaSession = PreviewMediaSession;
})(typeof window !== 'undefined' ? window : this);
