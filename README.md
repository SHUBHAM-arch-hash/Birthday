# Teen Patti - Neon Night UI Prototype

A responsive, front-end-only Teen Patti experience based on the supplied scope document.

Open `index.html` in a modern browser. No installation, backend, admin panel, authentication service, payment gateway, or real-money play is included.

Included local interactions:

- Game lobby filters, search, join flow, and private-table creation
- Simplified playable hand state: see cards, call, raise, fold, or show
- Local wallet balance, QR-payment simulation, and activity history
- Profile editing, notifications, help content, and responsive navigation
- Browser `localStorage` persistence, with a Reset demo control

## Birthday story opening scene

`birthday-story.html` is a separate, full-screen cinematic opening for **Her Life Story**. It leaves the Teen Patti prototype intact and uses the supplied character image at `assets/birthday-story/birthday-girl.png` plus an environment-only illustration at `assets/birthday-story/magical-room.png`.

Open [birthday-story.html](birthday-story.html) in a modern browser. It uses GSAP when the CDN is available and falls back gracefully to the static opening when it is not. The single **Start Her Journey** button triggers the book opening and audio. Optional local audio files are documented in [public/audio/README.md](public/audio/README.md); if they are absent, Web Audio produces a gentle chime and page-turn fallback.
