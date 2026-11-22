#!/usr/bin/env python3
"""ส่งโพสต์จาก content/ เข้าเพจ Facebook (insureingame)

โหมด
  draft     สร้างเป็นฉบับร่าง (ไปกดโพสต์เองใน Meta Business Suite)
  schedule  ตั้งเวลาโพสต์ตาม date/time ในไฟล์ content (Facebook ปล่อยโพสต์เอง)
  now       โพสต์ทันที

ตัวอย่าง
  python post_to_fb.py content/week-01.json --mode schedule --dry-run   # ดูก่อนว่าจะส่งอะไร
  python post_to_fb.py content/week-01.json --mode schedule             # ตั้งเวลาทั้งสัปดาห์
  python post_to_fb.py content/week-01.json --post w1-d2 --mode draft
  python post_to_fb.py content/week-01.json --post w1-d2 --mode now --yes

ต้องตั้งค่า (ใน environment หรือไฟล์ .env ที่ root)
  FB_PAGE_ID            ไอดีเพจ
  FB_PAGE_ACCESS_TOKEN  Page access token ที่มีสิทธิ์ pages_manage_posts, pages_read_engagement
                        (โพสต์วิดีโอ/Reels ต้องมี pages_manage_posts และเพจต้องอนุญาตให้แอปโพสต์)
  FB_GRAPH_VERSION      (ไม่บังคับ) ค่าเริ่มต้น v23.0

ชนิดโพสต์ (type ในไฟล์ content)
  reel   วิดีโอแนวตั้ง → Facebook Reels   (video: path ไฟล์ mp4)
  image  รูป Infographic → โพสต์รูป        (image: {...} จะเรนเดอร์ด้วย render_image.py อัตโนมัติ)
  text   ข้อความล้วน
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

from render_image import ROOT, full_caption, image_path_for, load_posts, render_post

LOG = ROOT / "out" / "post_log.jsonl"
MIN_LEAD = timedelta(minutes=12)  # Facebook ต้องการเวลาตั้งโพสต์ล่วงหน้าอย่างน้อย 10 นาที


# ---------------------------------------------------------------- config


def load_env() -> None:
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


class Graph:
    def __init__(self, page_id: str, token: str, version: str):
        self.page_id, self.token, self.v = page_id, token, version
        self.base = f"https://graph.facebook.com/{version}"

    def _check(self, r: requests.Response) -> dict:
        try:
            data = r.json()
        except ValueError:
            r.raise_for_status()
            return {}
        if r.status_code >= 400 or "error" in data:
            err = data.get("error", {})
            raise RuntimeError(f"Graph API {r.status_code}: {err.get('message', data)} "
                               f"(code {err.get('code')}, subcode {err.get('error_subcode')})")
        return data

    def post(self, edge: str, data: dict | None = None, files=None) -> dict:
        data = {k: v for k, v in (data or {}).items() if v is not None}
        data["access_token"] = self.token
        r = requests.post(f"{self.base}/{edge}", data=data, files=files, timeout=300)
        return self._check(r)

    # ---- text
    def text(self, message: str, mode: str, when: int | None) -> dict:
        return self.post(f"{self.page_id}/feed", publish_fields({"message": message}, mode, when))

    # ---- image: อัปโหลดรูปแบบยังไม่เผยแพร่ แล้วแนบเข้าโพสต์ (รองรับทั้งร่าง/ตั้งเวลา/โพสต์เลย)
    def image(self, path: Path, message: str, mode: str, when: int | None) -> dict:
        with open(path, "rb") as fh:
            photo = self.post(f"{self.page_id}/photos", {"published": "false", "temporary": "true"},
                              files={"source": (path.name, fh, "image/png")})
        fields = publish_fields({"message": message,
                                 "attached_media": json.dumps([{"media_fbid": photo["id"]}])}, mode, when)
        return self.post(f"{self.page_id}/feed", fields)

    # ---- reel: start → upload → finish
    def reel(self, path: Path, description: str, mode: str, when: int | None) -> dict:
        start = self.post(f"{self.page_id}/video_reels", {"upload_phase": "start"})
        vid = start["video_id"]
        size = path.stat().st_size
        with open(path, "rb") as fh:
            r = requests.post(
                f"https://rupload.facebook.com/video-upload/{self.v}/{vid}",
                headers={"Authorization": f"OAuth {self.token}", "offset": "0", "file_size": str(size)},
                data=fh, timeout=1800)
        up = self._check(r)
        if not up.get("success", True):
            raise RuntimeError(f"อัปโหลดวิดีโอไม่สำเร็จ: {up}")
        state = {"draft": "DRAFT", "schedule": "SCHEDULED", "now": "PUBLISHED"}[mode]
        fin = self.post(f"{self.page_id}/video_reels", {
            "upload_phase": "finish", "video_id": vid, "video_state": state,
            "description": description,
            "scheduled_publish_time": str(when) if mode == "schedule" else None,
        })
        fin.setdefault("video_id", vid)
        return fin


def publish_fields(fields: dict, mode: str, when: int | None) -> dict:
    if mode == "now":
        return {**fields, "published": "true"}
    if mode == "schedule":
        return {**fields, "published": "false", "scheduled_publish_time": str(when),
                "unpublished_content_type": "SCHEDULED"}
    return {**fields, "published": "false", "unpublished_content_type": "DRAFT"}


# ---------------------------------------------------------------- helpers


def post_time(post: dict) -> datetime | None:
    if not post.get("date"):
        return None
    tz = ZoneInfo(post.get("timezone", "Asia/Bangkok"))
    t = post.get("time") or post.get("default_time") or "19:30"
    return datetime.fromisoformat(f"{post['date']}T{t}").replace(tzinfo=tz)


def already_posted() -> dict[str, dict]:
    done: dict[str, dict] = {}
    if LOG.exists():
        for line in LOG.read_text(encoding="utf-8").splitlines():
            try:
                rec = json.loads(line)
                if rec.get("ok"):
                    done[rec["id"]] = rec
            except ValueError:
                pass
    return done


def write_log(rec: dict) -> None:
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def describe(post: dict, mode: str, when: datetime | None) -> str:
    kind = post.get("type", "text")
    media = post.get("video") if kind == "reel" else (str(image_path_for(post).relative_to(ROOT)) if kind == "image" else "-")
    w = when.strftime("%a %d %b %Y %H:%M %Z") if when else "-"
    first = full_caption(post).splitlines()[0][:70]
    return f"[{post['id']}] {kind:<5} {mode:<8} {w:<26} {media}\n      {first}…"


# ---------------------------------------------------------------- main


def main() -> None:
    ap = argparse.ArgumentParser(description="ส่งโพสต์จาก content/ เข้าเพจ Facebook")
    ap.add_argument("content", help="ไฟล์ .json/.md หรือโฟลเดอร์ใน content/")
    ap.add_argument("--mode", choices=["draft", "schedule", "now"], default="draft")
    ap.add_argument("--post", action="append", help="เลือกเฉพาะ id นี้ (ใส่ซ้ำได้)")
    ap.add_argument("--date", help="เลือกเฉพาะโพสต์วันที่ YYYY-MM-DD")
    ap.add_argument("--platform", default="facebook", help="ส่งเฉพาะโพสต์ที่ platforms มีค่านี้")
    ap.add_argument("--dry-run", action="store_true", help="แสดงรายการที่จะส่ง ไม่ส่งจริง")
    ap.add_argument("--force", action="store_true", help="ส่งซ้ำแม้เคยส่งสำเร็จแล้ว")
    ap.add_argument("--yes", action="store_true", help="ไม่ต้องถามยืนยัน")
    a = ap.parse_args()

    load_env()
    _, posts = load_posts(a.content)
    done = already_posted()
    now = datetime.now(timezone.utc)

    chosen = []
    for p in posts:
        if a.post and p["id"] not in a.post:
            continue
        if a.date and p.get("date") != a.date:
            continue
        plats = p.get("platforms") or ["facebook"]
        if a.platform not in plats:
            continue
        if p["id"] in done and not a.force:
            print(f"ข้าม {p['id']} (เคยส่งแล้ว: {done[p['id']].get('mode')} {done[p['id']].get('result', {})}) ใช้ --force เพื่อส่งซ้ำ")
            continue
        chosen.append(p)
    if not chosen:
        raise SystemExit("ไม่มีโพสต์ที่ต้องส่ง")

    plan, problems = [], []
    for p in chosen:
        when = post_time(p)
        kind = p.get("type", "text")
        if a.mode == "schedule":
            if not when:
                problems.append(f"{p['id']}: ไม่มี date สำหรับตั้งเวลา")
            elif when - now < MIN_LEAD:
                problems.append(f"{p['id']}: เวลา {when:%d %b %H:%M} ใกล้หรือผ่านไปแล้ว (ต้องล่วงหน้า ≥ 10 นาที)")
        if kind == "reel":
            v = ROOT / p.get("video", "")
            if not p.get("video") or not v.is_file():
                problems.append(f"{p['id']}: ไม่พบไฟล์วิดีโอ {p.get('video')}")
        elif kind not in ("image", "text"):
            problems.append(f"{p['id']}: type '{kind}' ไม่รองรับ (reel / image / text)")
        plan.append((p, when))

    print(f"โหมด: {a.mode}  จำนวน {len(plan)} โพสต์\n")
    for p, when in plan:
        print(describe(p, a.mode, when))
    if problems:
        print("\nแก้ก่อนส่ง:\n  - " + "\n  - ".join(problems))
        raise SystemExit(1)
    if a.dry_run:
        print("\n(dry-run: ยังไม่ได้ส่งอะไร)")
        return

    page_id, token = os.environ.get("FB_PAGE_ID"), os.environ.get("FB_PAGE_ACCESS_TOKEN")
    if not page_id or not token:
        raise SystemExit("ตั้งค่า FB_PAGE_ID และ FB_PAGE_ACCESS_TOKEN ก่อน (ดู content/README.md)")
    if not a.yes and sys.stdin.isatty():
        word = {"draft": "สร้างฉบับร่าง", "schedule": "ตั้งเวลา", "now": "โพสต์ทันที"}[a.mode]
        if input(f"\nยืนยัน{word} {len(plan)} โพสต์ลงเพจ {page_id}? พิมพ์ y เพื่อยืนยัน: ").strip().lower() != "y":
            raise SystemExit("ยกเลิก")
    g = Graph(page_id, token, os.environ.get("FB_GRAPH_VERSION", "v23.0"))

    failed = 0
    for p, when in plan:
        ts = int(when.timestamp()) if when else None
        cap = full_caption(p)
        kind = p.get("type", "text")
        rec = {"id": p["id"], "mode": a.mode, "type": kind, "at": datetime.now().isoformat(timespec="seconds"),
               "scheduled_for": when.isoformat() if when and a.mode == "schedule" else None}
        try:
            if kind == "reel":
                res = g.reel(ROOT / p["video"], cap, a.mode, ts)
            elif kind == "image":
                img = image_path_for(p)
                if not img.exists() or p.get("image", {}).get("rerender", True):
                    img = render_post(p)
                res = g.image(img, cap, a.mode, ts)
            else:
                res = g.text(cap, a.mode, ts)
            rec.update(ok=True, result=res)
            print(f"✅ {p['id']} → {res}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            rec.update(ok=False, error=str(e))
            print(f"❌ {p['id']}: {e}")
        write_log(rec)
        time.sleep(2)
    print(f"\nเสร็จ: สำเร็จ {len(plan) - failed} / ล้มเหลว {failed}  (บันทึกไว้ที่ {LOG.relative_to(ROOT)})")
    if failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
