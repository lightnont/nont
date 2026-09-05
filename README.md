# nont

nont is a local-first desktop music application. This foundation contains the React interface and a minimal Tauri 2 command boundary; it deliberately does not pretend that online search, playback, or downloading work in a web preview.

## Current foundation

- Original, responsive dark desktop interface
- Persistent queue, likes, playlists, playback selection, history and queued download state in preview storage
- Typed Tauri command boundary with URL validation
- Tauri configuration for the `nont` desktop application
- Native download, FFmpeg and SQLite services are explicitly the next implementation milestone

## Run the interface

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

To build the desktop runtime, install the Rust toolchain, then use `cargo tauri dev` after adding the Tauri CLI. The native layer must add SQLite persistence, a managed yt-dlp/FFmpeg lifecycle, structured download events, and a real local audio engine before those capabilities are represented as available in the UI.
