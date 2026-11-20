# มูฟออน 30 วัน — TikTok series

- `day1.mp4` — Day 1 (44.5s, 1080×1920), voiced
- `day1_voice.wav` — voice-over (Google AI Studio); `voice_env.js` = its loudness per frame for lip-sync
- `day2.mp4` — Day 2 (30.5s), voiced; sources `day2.html`, `audio_d2.py`, `voice_env_d2.js`, `day2_voice.wav` (render: `PAGE=day2.html OUT=video_d2.mp4 node render.js`)
- `day3.mp4` — Day 3 (29.5s), voiced; sources `day3.html`, `audio_d3.py`, `voice_env_d3.js`, `day3_voice.wav`
- `day4.mp4` — Day 4 (25s), voiced; sources `day4.html`, `audio_d4.py`, `voice_env_d4.js`, `day4_voice.wav`
- `day5.mp4` — Day 5 (28s), voiced; sources `day5.html`, `audio_d5.py`, `voice_env_d5.js`, `day5_voice.wav`
- `day6.mp4` — Day 6 (28s), voiced; sources `day6.html`, `audio_d6.py`, `voice_env_d6.js`, `day6_voice.wav`
- `day7.mp4`–`day10.mp4` — Days 7–10 (30–31s each), voiced. Built from `lib.html` + `extras.js` + `dayN.js` via `python3 build.py N`; audio via `audio_d7_10.py` (uses `audio_lib.py`)
- `index.html` — animation (SVG, `renderAt(t)`); Kanit font from `npm i @fontsource/kanit@5.1.0`
- `audio.py` — music + SFX → `audio.wav`
- `render.js` — renders frames via Playwright → `video.mp4`
- `preview.js` — screenshot keyframes: `node preview.js 2 10 25`

Build: `npm i @fontsource/kanit@5.1.0 && python3 audio.py && node render.js && ffmpeg -i video.mp4 -i audio.wav -c:v copy -c:a aac -shortest day1.mp4`
