# มูฟออน 30 วัน — TikTok series

- `day1.mp4` — Day 1 (47s, 1080×1920)
- `index.html` — animation (SVG, `renderAt(t)`); Kanit font from `npm i @fontsource/kanit@5.1.0`
- `audio.py` — music + SFX → `audio.wav`
- `render.js` — renders frames via Playwright → `video.mp4`
- `preview.js` — screenshot keyframes: `node preview.js 2 10 25`

Build: `npm i @fontsource/kanit@5.1.0 && python3 audio.py && node render.js && ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac -shortest day1.mp4`
