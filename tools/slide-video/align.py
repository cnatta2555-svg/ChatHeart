"""จับคู่ข้อความ cue กับเวลาคำจาก Whisper (fuzzy, เรียงตามลำดับ)
ใช้: python3 align.py words.json cues.json out.json"""
import json, re, sys
from difflib import SequenceMatcher

def norm(s):
    return re.sub(r'[\s\.,!?\'"“”‘’…:;()\-–—/]+', '', s).lower()

words = json.load(open(sys.argv[1], encoding='utf-8'))
cues = json.load(open(sys.argv[2], encoding='utf-8'))
text, times = '', []
for w in words:
    n = norm(w['w'])
    for k in range(len(n)):
        # interpolate inside the word so a cue starting mid-word gets a fair time
        times.append(w['s'] + (w['e'] - w['s']) * k / max(len(n), 1))
    text += n

pos, out, WINDOW = 0, [], 500
for c in cues:
    q = norm(c)
    L = len(q)
    best, bi = -1, pos
    for i in range(pos, min(len(text) - 1, pos + WINDOW) + 1):
        r = SequenceMatcher(None, q, text[i:i + L], autojunk=False).ratio()
        if r > best + 1e-9:
            best, bi = r, i
    # ขยับจุดเริ่มไปที่ตัวอักษรแรกที่ตรงกันจริง (กันติดพยางค์ของคำก่อนหน้า)
    sm = SequenceMatcher(None, q, text[bi:bi + L + 4], autojunk=False)
    blk = next((m for m in sm.get_matching_blocks() if m.size >= 2), None)
    if blk: bi += blk.b
    t = times[min(bi, len(times) - 1)] if times else 0
    out.append({'cue': c, 't': round(t, 2), 'score': round(best, 2), 'heard': text[bi:bi + L]})
    pos = bi + 1
json.dump(out, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
