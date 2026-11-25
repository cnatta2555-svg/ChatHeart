// ทำคลิปสไลด์ที่ขยับตรงกับเสียงพากย์
// ใช้:  node make_video.js <slides.html> <audio.mp3> <out.mp4> [--preview 3,20,50] [--model large-v3-turbo] [--fps 30]
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const preview = opt('--preview', null);
const model = opt('--model', 'large-v3-turbo');
const FPS = +opt('--fps', 30);
const [htmlArg, audioArg, outArg] = args;
if (!outArg) { console.log('usage: node make_video.js slides.html audio.mp3 out.mp4 [--preview 3,20] [--model large-v3-turbo] [--fps 30]'); process.exit(1); }
const html = path.resolve(htmlArg), audio = path.resolve(audioArg), out = path.resolve(outArg);
const here = __dirname;
const work = out.replace(/\.mp4$/i, '') + '_work';
fs.mkdirSync(work, { recursive: true });

const py = (script, ...a) => execFileSync('python3', [path.join(here, script), ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
const duration = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]).toString().trim();

(async () => {
  // 1) ถอดเสียง (เก็บแคชไว้ข้างไฟล์เสียง ไม่ต้องถอดซ้ำ)
  const wordsFile = audio.replace(/\.[^.]+$/, '') + '.words.json';
  if (!fs.existsSync(wordsFile)) { console.log('ถอดเสียงด้วย Whisper ...'); py('transcribe.py', audio, wordsFile, model); }

  const b = await chromium.launch();
  const pg = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
  pg.on('pageerror', e => console.log('ERR', e.message));
  await pg.goto('file://' + html);
  await pg.evaluate(() => document.fonts.ready);

  // 2) เก็บ cue ทั้งหมดตามลำดับในหน้า แล้วหาเวลาจากเสียง
  const cues = await pg.evaluate(() => {
    const list = [];
    document.querySelectorAll('[data-cue],[data-ccue]').forEach(e => {
      for (const k of ['cue', 'ccue']) if (e.dataset[k] && !list.includes(e.dataset[k])) list.push(e.dataset[k]);
    });
    return list;
  });
  fs.writeFileSync(path.join(work, 'cues.json'), JSON.stringify(cues, null, 1));
  py('align.py', wordsFile, path.join(work, 'cues.json'), path.join(work, 'timing.json'));
  const timing = JSON.parse(fs.readFileSync(path.join(work, 'timing.json'), 'utf8'));
  console.log('\nเวลาที่จับได้ (score ต่ำกว่า 0.6 = ควรเช็ก):');
  for (const t of timing) console.log(`${t.t.toFixed(2).padStart(7)}s  ${t.score < 0.6 ? '⚠' : ' '} ${t.score}  ${t.cue}   ← ได้ยิน: ${t.heard}`);
  const map = Object.fromEntries(timing.map(t => [t.cue, t.t]));
  await pg.evaluate(([m, dur]) => window.setup(m, dur), [map, duration]);

  // 3a) พรีวิวเป็นภาพ
  if (preview) {
    for (const t of preview.split(',')) {
      await pg.evaluate(async t => { render(t); if (window.afterRender) await window.afterRender(); }, +t);
      await pg.screenshot({ path: path.join(work, `preview_${t}.png`) });
    }
    console.log('preview ->', work); await b.close(); return;
  }

  // 3b) เรนเดอร์ทีละเฟรม ส่งเข้า ffmpeg
  const N = Math.ceil(duration * FPS);
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', audio,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    await pg.evaluate(async t => { render(t); if (window.afterRender) await window.afterRender(); }, f / FPS);
    const buf = await pg.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 600 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await b.close();
  await new Promise(r => ff.on('close', r));
  console.log('เสร็จ ->', out);
})();
