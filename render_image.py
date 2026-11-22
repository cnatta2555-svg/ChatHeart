#!/usr/bin/env python3
"""แปลงข้อความเป็นรูป Infographic สำหรับเพจ insureingame

ใช้งาน
  python render_image.py content/week-01.json            # เรนเดอร์ทุกโพสต์ type=image
  python render_image.py content/week-01.json --post w1-tip
  python render_image.py --title "เช็ก 3 ข้อก่อนซื้อประกัน" \
      --point "ต้องการความคุ้มครองนี้จริงไหม" --point "จ่ายเบี้ยไหวทุกปีไหม" -o out/tip.png

รูปที่ได้: PNG 1080x1350 (สัดส่วน 4:5 สำหรับฟีด Facebook) เก็บใน out/
ฟอนต์: Kanit (หาในเครื่องก่อน ถ้าไม่เจอจะดาวน์โหลดจาก Google Fonts มาเก็บที่ assets/fonts/)
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, features

ROOT = Path(__file__).resolve().parent
FONT_DIR = ROOT / "assets" / "fonts"
OUT_DIR = ROOT / "out"

W, H = 1080, 1350
INK = "#3b2a2a"
NAVY = "#24366e"
CREAM = "#fff6e6"
PAPER = "#fffdf8"
MINT = "#4fe3c1"
GOLD = "#f2c14e"
RED = "#d94c55"
MUTED = "#8a7a70"

DEFAULT_DISCLAIMER = (
    "เนื้อหานี้เป็นข้อมูลทั่วไป รายละเอียดความคุ้มครองและเงื่อนไข"
    "ให้ยึดตามกรมธรรม์ของบริษัทเป็นหลัก"
)

# ---------------------------------------------------------------- content


def _parse_scalar(v: str):
    v = v.strip()
    if v.startswith("[") and v.endswith("]"):
        return [_parse_scalar(x) for x in v[1:-1].split(",") if x.strip()]
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
        return v[1:-1]
    if v.lower() in ("true", "false"):
        return v.lower() == "true"
    return v


def _parse_front_matter(text: str) -> tuple[dict, str]:
    """front matter แบบง่าย: key: value, รายการด้วย '- ' และ object ซ้อนหนึ่งชั้น (image:)"""
    if not text.startswith("---"):
        return {}, text
    _, fm, body = text.split("---", 2)
    data: dict = {}
    # (indent ของ key แม่, dict ลูก, dict แม่, ชื่อ key)
    stack: list[tuple[int, dict, dict | None, str | None]] = [(-1, data, None, None)]
    for raw in fm.splitlines():
        if not raw.strip() or raw.strip().startswith("#"):
            continue
        indent = len(raw) - len(raw.lstrip())
        line = raw.strip()
        if line.startswith("- "):
            # รายการ: เป็นของ key ล่าสุดที่ยังไม่มีค่า (อยู่บนสุดของ stack)
            while len(stack) > 1 and indent < stack[-1][0]:
                stack.pop()
            _, cur, parent, key = stack[-1]
            if parent is not None and key is not None:
                if not isinstance(parent.get(key), list):
                    parent[key] = []
                parent[key].append(_parse_scalar(line[2:]))
            continue
        while len(stack) > 1 and indent <= stack[-1][0]:
            stack.pop()
        cur = stack[-1][1]
        key, _, val = line.partition(":")
        key = key.strip()
        if val.strip():
            cur[key] = _parse_scalar(val)
        else:
            cur[key] = {}
            stack.append((indent, cur[key], cur, key))
    return data, body.strip()


def load_posts(path: str | Path) -> tuple[dict, list[dict]]:
    """อ่านโพสต์จากไฟล์ .json / .md หรือโฟลเดอร์ที่มีไฟล์เหล่านั้น คืน (ค่าตั้งต้นของสัปดาห์, รายการโพสต์)"""
    path = Path(path)
    files = sorted(p for p in path.iterdir() if p.suffix in (".json", ".md")) if path.is_dir() else [path]
    meta: dict = {}
    posts: list[dict] = []
    for f in files:
        if f.name.lower() == "readme.md":
            continue
        if f.suffix == ".json":
            data = json.loads(f.read_text(encoding="utf-8"))
            week_meta = {k: v for k, v in data.items() if k != "posts"}
            for p in data.get("posts", []):
                posts.append({**week_meta, **p, "_source": str(f)})
            meta.update(week_meta)
        elif f.suffix == ".md":
            fm, body = _parse_front_matter(f.read_text(encoding="utf-8"))
            fm.setdefault("id", f.stem)
            if body and "caption" not in fm:
                fm["caption"] = body
            posts.append({**fm, "_source": str(f)})
    ids = [p.get("id") for p in posts]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        raise SystemExit(f"มี id ซ้ำในไฟล์ content: {', '.join(sorted(map(str, dup)))}")
    return meta, posts


def full_caption(post: dict) -> str:
    """แคปชันที่ส่งขึ้นเพจจริง: ข้อความ + แฮชแท็ก + ข้อความท้าย (disclaimer)"""
    parts = [post.get("caption", "").strip()]
    tags = post.get("hashtags") or []
    if isinstance(tags, str):
        tags = tags.split()
    if tags:
        parts.append(" ".join(t if t.startswith("#") else "#" + t for t in tags))
    disc = post.get("disclaimer", DEFAULT_DISCLAIMER)
    if disc:
        parts.append(disc)
    return "\n\n".join(p for p in parts if p)


# ---------------------------------------------------------------- fonts

FONT_WEIGHTS = {"regular": 400, "bold": 700, "black": 800}


def _download_kanit() -> None:
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    css_url = "https://fonts.googleapis.com/css2?family=Kanit:wght@400;700;800&display=swap"
    req = urllib.request.Request(css_url, headers={"User-Agent": "Mozilla/5.0"})
    css = urllib.request.urlopen(req, timeout=30).read().decode()
    # CSS แยกบล็อกตาม subset (thai / latin ...) ต้องดึงทุกไฟล์ของแต่ละน้ำหนักแล้วเลือกบล็อก thai
    blocks = re.findall(r"/\*\s*(\S+)\s*\*/\s*@font-face\s*{([^}]*)}", css)
    got = {}
    for subset, block in blocks:
        w = re.search(r"font-weight:\s*(\d+)", block)
        u = re.search(r"url\((https://[^)]+)\)", block)
        if not (w and u):
            continue
        weight = int(w.group(1))
        if subset == "thai" or weight not in got:
            got[weight] = u.group(1)
    if not got:  # ไม่มี subset comment (บาง UA ได้ไฟล์เดียวต่อน้ำหนัก)
        for block in re.findall(r"@font-face\s*{([^}]*)}", css):
            w = re.search(r"font-weight:\s*(\d+)", block)
            u = re.search(r"url\((https://[^)]+)\)", block)
            if w and u:
                got[int(w.group(1))] = u.group(1)
    for name, weight in FONT_WEIGHTS.items():
        if weight in got:
            urllib.request.urlretrieve(got[weight], FONT_DIR / f"Kanit-{name}.ttf")


def font_path(weight: str, override: str | None = None) -> str:
    if override:
        return override
    local = FONT_DIR / f"Kanit-{weight}.ttf"
    if local.exists():
        return str(local)
    if not any(FONT_DIR.glob("Kanit-*.ttf")):
        try:
            print("กำลังดาวน์โหลดฟอนต์ Kanit ...", file=sys.stderr)
            _download_kanit()
        except Exception as e:  # noqa: BLE001
            print(f"ดาวน์โหลดฟอนต์ไม่สำเร็จ ({e}) ใช้ --font ระบุไฟล์ฟอนต์ไทยแทนได้", file=sys.stderr)
    if local.exists():
        return str(local)
    for cand in FONT_DIR.glob("Kanit-*.ttf"):
        return str(cand)
    raise SystemExit("ไม่พบฟอนต์ภาษาไทย: วางไฟล์ Kanit-bold.ttf ไว้ที่ assets/fonts/ หรือใช้ --font")


def load_font(weight: str, size: int, override: str | None = None) -> ImageFont.FreeTypeFont:
    engine = ImageFont.Layout.RAQM if features.check("raqm") else ImageFont.Layout.BASIC
    return ImageFont.truetype(font_path(weight, override), size, layout_engine=engine)


# ---------------------------------------------------------------- text wrap

_THAI_NONSTART = set("ะาำัิีึืฺุู็่้๊๋์ํ๎ๅๆฯ")


def _tokens(text: str) -> list[str]:
    """แยกคำสำหรับตัดบรรทัด ใช้ pythainlp ถ้ามี ไม่งั้นตัดที่ช่องว่าง/ตัวอักษร ('|' = จุดตัดที่ผู้เขียนกำหนด)"""
    if "|" in text:
        return [t for t in re.split(r"(\|| )", text) if t and t != "|"]
    try:
        from pythainlp.tokenize import word_tokenize  # type: ignore

        return word_tokenize(text, keep_whitespace=True)
    except Exception:  # noqa: BLE001
        pass
    # ตัวเลข/หน่วยสั้น ๆ ติดกับคำถัดไป เช่น "3 ข้อ", "30 วัน" จะไม่ถูกแยกบรรทัด
    text = re.sub(r"(\d[\d,.%]*) (?=\S)", "\\1\u00a0", text)
    return [part for part in re.split(r"( )", text) if part]


def _clusters(word: str) -> list[str]:
    cl: list[str] = []
    for ch in word:
        if cl and (unicodedata.combining(ch) or ch in _THAI_NONSTART):
            cl[-1] += ch
        else:
            cl.append(ch)
    return cl


def wrap(draw: ImageDraw.ImageDraw, text: str, font, max_w: int) -> list[str]:
    lines: list[str] = []
    for para in text.split("\n"):
        line = ""
        for tok in _tokens(para):
            trial = line + tok
            if draw.textlength(trial, font=font) <= max_w:
                line = trial
                continue
            if line.strip():
                lines.append(line.rstrip())
                line = ""
            tok = tok.lstrip()
            if draw.textlength(tok, font=font) <= max_w:
                line = tok
                continue
            for c in _clusters(tok):  # คำยาวเกินบรรทัด ตัดทีละตัวอักษร (ไม่แยกสระ/วรรณยุกต์)
                if draw.textlength(line + c, font=font) > max_w and line:
                    lines.append(line)
                    line = c
                else:
                    line += c
        lines.append(line.rstrip())
    return [l for l in lines if l] or [""]


# ---------------------------------------------------------------- drawing


def _rounded(draw, box, r, fill, outline=INK, width=6, shadow=8):
    x0, y0, x1, y1 = box
    if shadow:
        draw.rounded_rectangle((x0 + shadow, y0 + shadow, x1 + shadow, y1 + shadow), r, fill=INK)
    draw.rounded_rectangle(box, r, fill=fill, outline=outline, width=width)


def render(spec: dict, out_path: Path, font_override: str | None = None) -> Path:
    """spec: eyebrow, title, subtitle, points[], footer, disclaimer, accent"""
    accent = spec.get("accent", MINT)
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)
    pad = 72

    # --- แถบหัว
    eyebrow = spec.get("eyebrow", "insureingame")
    title = spec.get("title", "")
    f_eye = load_font("bold", 36, font_override)
    title_size = 76
    while True:
        f_title = load_font("black", title_size, font_override)
        t_lines = wrap(d, title, f_title, W - pad * 2)
        if len(t_lines) <= 3 or title_size <= 52:
            break
        title_size -= 4
    line_h = int(title_size * 1.3)
    sub = spec.get("subtitle")
    f_sub = load_font("regular", 40, font_override)
    s_lines = wrap(d, sub, f_sub, W - pad * 2) if sub else []
    title_top = 64 + 58 + 40
    sub_top = title_top + len(t_lines) * line_h + 14
    header_h = sub_top + len(s_lines) * 58 + (40 if s_lines else 26)
    d.rectangle((0, 0, W, header_h), fill=NAVY)
    d.rectangle((0, header_h, W, header_h + 10), fill=accent)
    ey_w = d.textlength(eyebrow, font=f_eye)
    d.rounded_rectangle((pad, 64, pad + ey_w + 48, 64 + 58), 29, fill=accent)
    d.text((pad + 24, 64 + 29), eyebrow, font=f_eye, fill=INK, anchor="lm")
    y = title_top
    for ln in t_lines:
        d.text((pad, y), ln, font=f_title, fill="#ffffff")
        y += line_h
    y = sub_top
    for ln in s_lines:
        d.text((pad, y), ln, font=f_sub, fill="#dfe6ff")
        y += 58

    # --- รายการข้อ
    points = spec.get("points") or []
    footer_h = 230
    top = header_h + 60
    avail = H - top - footer_h - 20
    size, gap = 52, 34
    while True:
        f_pt = load_font("bold", size, font_override)
        blocks = [wrap(d, p, f_pt, W - pad * 2 - 150) for p in points]
        total = sum(len(b) * int(size * 1.35) + 64 for b in blocks) + gap * max(len(blocks) - 1, 0)
        if total <= avail or size <= 30:
            break
        size -= 2
    lh = int(size * 1.35)
    y = top + max(0, (avail - total) // 2)  # จัดกลางในพื้นที่ว่าง
    for i, lines in enumerate(blocks, 1):
        h = len(lines) * lh + 64
        _rounded(d, (pad, y, W - pad, y + h), 28, PAPER)
        cx, cy = pad + 62, y + h // 2
        d.ellipse((cx - 38, cy - 38, cx + 38, cy + 38), fill=accent, outline=INK, width=6)
        d.text((cx, cy), str(i), font=load_font("black", 44, font_override), fill=INK, anchor="mm")
        ty = y + 30
        for ln in lines:
            d.text((pad + 130, ty), ln, font=f_pt, fill=INK)
            ty += lh
        y += h + gap

    # --- ท้ายรูป
    footer = spec.get("footer", "ทักแชท insureingame")
    f_foot = load_font("black", 40, font_override)
    fw = d.textlength(footer, font=f_foot)
    fy = H - footer_h + 30
    _rounded(d, (pad, fy, pad + fw + 64, fy + 76), 38, GOLD, shadow=6)
    d.text((pad + 32, fy + 38), footer, font=f_foot, fill=INK, anchor="lm")
    disc = spec.get("disclaimer", DEFAULT_DISCLAIMER)
    if disc:
        f_disc = load_font("regular", 26, font_override)
        dy = fy + 110
        for ln in wrap(d, disc, f_disc, W - pad * 2)[:3]:
            d.text((pad, dy), ln, font=f_disc, fill=MUTED)
            dy += 36

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def image_path_for(post: dict) -> Path:
    img = post.get("image") or {}
    if isinstance(img, dict) and img.get("file"):
        return ROOT / img["file"]
    return OUT_DIR / f"{post['id']}.png"


def render_post(post: dict, font_override: str | None = None) -> Path:
    spec = dict(post.get("image") or {})
    spec.setdefault("disclaimer", post.get("disclaimer", DEFAULT_DISCLAIMER))
    return render(spec, image_path_for(post), font_override)


def main() -> None:
    ap = argparse.ArgumentParser(description="แปลงข้อความเป็นรูป Infographic")
    ap.add_argument("content", nargs="?", help="ไฟล์ .json/.md หรือโฟลเดอร์ใน content/")
    ap.add_argument("--post", action="append", help="เรนเดอร์เฉพาะ id นี้ (ใส่ซ้ำได้)")
    ap.add_argument("--title")
    ap.add_argument("--eyebrow", default="insureingame")
    ap.add_argument("--subtitle")
    ap.add_argument("--point", action="append", default=[])
    ap.add_argument("--footer", default="ทักแชท insureingame")
    ap.add_argument("-o", "--out", default=str(OUT_DIR / "infographic.png"))
    ap.add_argument("--font", help="ไฟล์ฟอนต์ภาษาไทยที่จะใช้แทน Kanit")
    a = ap.parse_args()

    if not features.check("raqm"):
        print("คำเตือน: Pillow ไม่มี libraqm สระ/วรรณยุกต์ไทยอาจวางผิดตำแหน่ง (pip install -U pillow)", file=sys.stderr)

    if a.title:
        p = render({"eyebrow": a.eyebrow, "title": a.title, "subtitle": a.subtitle,
                    "points": a.point, "footer": a.footer}, Path(a.out), a.font)
        print(p)
        return
    if not a.content:
        ap.error("ระบุไฟล์ใน content/ หรือใช้ --title")
    _, posts = load_posts(a.content)
    chosen = [p for p in posts if (not a.post or p["id"] in a.post) and p.get("type") == "image"]
    if not chosen:
        raise SystemExit("ไม่มีโพสต์ type=image ที่ตรงเงื่อนไข")
    for p in chosen:
        print(f"{p['id']}: {render_post(p, a.font)}")


if __name__ == "__main__":
    main()
