# preview-media-session.js

One dependency-free file that makes the OS media popover show the **track**
instead of your page title when an `<audio>` preview plays.

Without Media Session metadata, macOS, iOS and Android fall back to the page
title - so hovering a name and playing a 30-second iTunes preview popped up
"My Site - Home" instead of the song. This file fixes that:

- **title / artist / album** pushed into `navigator.mediaSession.metadata` on play
- **600x600 artwork** upgraded automatically from an iTunes-style
  `artworkUrl100` (`.../100x100bb.jpg` -> `.../600x600bb.jpg`)
- cleared on pause/ended (or keep the artwork and just flip the state)
- no-op on browsers without the API; every call is try/catch-guarded

## Usage

```html
<script src="preview-media-session.js"></script>
<script>
  var audio = new Audio(previewUrl);
  var pms = new PreviewMediaSession(audio, { album: 'My Site' });
  pms.setTrack(track);          // { trackName, artistName, artworkUrl100 }
  audio.play();                 // popover now shows the track + cover art
  pms.clear();                  // when your UI dismisses the player
</script>
```

Accepts either iTunes field names (`trackName`, `artistName`, `artworkUrl100`)
or generic ones (`title`, `artist`, `artworkUrl`).

## API

| Method | What it does |
|---|---|
| `new PreviewMediaSession(audio, opts)` | binds play/pause/ended; opts: `album`, `artworkSize` (default 600), `clearOnStop` (default true) |
| `setTrack(track)` | store the now-playing object (iTunes or generic field names) |
| `push()` | push the stored track into the media session |
| `clear()` | flip state to paused and drop the metadata |
| `detach()` | unbind listeners |

## Provenance

Extracted November 2026 from two production preview players (a hover player
and a ticker-tray dock) that both played iTunes previews and both popped over
the page title. The same five lines fixed both.

MIT licensed. See LICENSE.
