# ระบบโพสต์เพจ insureingame

```
content/         ← โพสต์รายสัปดาห์ (ไฟล์ .json หรือ .md)
render_image.py  ← แปลงข้อความเป็นรูป Infographic (1080×1350)
post_to_fb.py    ← ส่งเข้าเพจ: ฉบับร่าง / ตั้งเวลา / โพสต์เลย
```

## 1. ติดตั้งครั้งแรก

```bash
pip install -r requirements-content.txt
```

ฟอนต์ Kanit จะดาวน์โหลดให้อัตโนมัติครั้งแรกที่สร้างรูป (เก็บที่ `assets/fonts/`)

## 2. เขียนโพสต์ใน `content/`

### แบบ JSON (ทั้งสัปดาห์ในไฟล์เดียว) — ดู `week-01.json`

```json
{
  "week": "2026-W48",
  "timezone": "Asia/Bangkok",
  "disclaimer": "เนื้อหานี้เป็นข้อมูลทั่วไป ...",
  "posts": [
    {
      "id": "w1-d2",
      "date": "2026-11-24",
      "time": "19:30",
      "type": "reel",
      "video": "insureingame_D2_รองเท้ากันสถานะ.mp4",
      "caption": "เจอตัวสายคุมยังออกรองเท้ากันสถานะ ...",
      "hashtags": ["#insureingame", "#ประกันโรคร้ายแรง"],
      "platforms": ["facebook"]
    }
  ]
}
```

### แบบ Markdown (หนึ่งไฟล์ต่อโพสต์) — ดู `examples/waiting-period-tip.md`

ส่วนหัวระหว่าง `---` คือข้อมูลโพสต์ ส่วนล่างคือแคปชัน

| ช่อง | ความหมาย |
|---|---|
| `id` | รหัสโพสต์ ห้ามซ้ำ ใช้กันโพสต์ซ้ำ |
| `date`, `time` | วันเวลาที่จะลง (เวลาไทย) ใช้ตอนตั้งเวลา |
| `type` | `reel` (วิดีโอแนวตั้ง) · `image` (รูป Infographic) · `text` (ข้อความล้วน) |
| `video` | path ไฟล์วิดีโอ (เทียบกับโฟลเดอร์บนสุดของโปรเจกต์) |
| `image` | ข้อความบนรูป: `eyebrow`, `title`, `subtitle`, `points` (รายการข้อ), `footer` |
| `caption` | แคปชัน (ระบบต่อแฮชแท็กและข้อความท้ายให้เอง) |
| `hashtags` | รายการแฮชแท็ก |
| `disclaimer` | ข้อความท้ายแคปชัน (ไม่ใส่ = ใช้ข้อความมาตรฐาน, ใส่ `""` = ไม่ต้องมี) |
| `platforms` | ตอนนี้รองรับ `facebook` |

เคล็ดลับการตัดบรรทัดบนรูป: ใส่ `|` ตรงที่อยากให้ขึ้นบรรทัดใหม่ได้ (จะไม่แสดง `|` บนรูป)

## 3. สร้างรูป Infographic

```bash
python render_image.py content/week-01.json                 # ทุกโพสต์ type=image → out/<id>.png
python render_image.py --title "เช็ก 3 ข้อก่อนซื้อประกัน" \
  --point "ต้องการความคุ้มครองนี้จริงไหม" --point "จ่ายเบี้ยไหวไหม" -o out/tip.png
```

ตอนโพสต์ ระบบสร้างรูปให้อัตโนมัติ ไม่ต้องรันเองก่อนก็ได้

## 4. ตั้งค่าการเชื่อมเพจ Facebook

ต้องมี **Page access token** ของเพจ insureingame

1. ไปที่ developers.facebook.com → สร้างแอป (ประเภท Business)
2. เพิ่มสิทธิ์ `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`
3. ใน Graph API Explorer เลือกแอป → เลือกเพจ → ขอ token แล้วแปลงเป็น **long-lived page token**
4. สร้างไฟล์ `.env` ที่โฟลเดอร์บนสุด (ไฟล์นี้ไม่ถูกอัปขึ้น GitHub):

```
FB_PAGE_ID=ไอดีเพจ
FB_PAGE_ACCESS_TOKEN=โทเคนของเพจ
```

> ห้ามใส่ token ลงในไฟล์ content หรือส่งให้ใครทางแชท

## 5. ส่งเข้าเพจ

```bash
# ดูก่อนว่าจะส่งอะไร (ไม่ส่งจริง)
python post_to_fb.py content/week-01.json --mode schedule --dry-run

# ตั้งเวลาทั้งสัปดาห์ → Facebook ปล่อยโพสต์เองตามวันเวลาในไฟล์
python post_to_fb.py content/week-01.json --mode schedule

# ส่งเป็นฉบับร่าง ไปกดโพสต์เองใน Meta Business Suite
python post_to_fb.py content/week-01.json --post w1-d2 --mode draft

# โพสต์ทันที
python post_to_fb.py content/week-01.json --post w1-d2 --mode now
```

- ส่งสำเร็จแล้วจะบันทึกใน `out/post_log.jsonl` รอบหน้าจะข้ามโพสต์ที่เคยส่งแล้ว (ใช้ `--force` ถ้าต้องการส่งซ้ำ)
- ตั้งเวลาได้ต้องล่วงหน้าอย่างน้อย 10 นาที

## 6. โพสต์อัตโนมัติผ่าน GitHub (ไม่ต้องเปิดคอม)

1. Settings → Secrets and variables → Actions → เพิ่ม `FB_PAGE_ID` และ `FB_PAGE_ACCESS_TOKEN`
2. แท็บ **Actions → Post to Facebook → Run workflow**
3. เลือกไฟล์ content และโหมด (แนะนำ `schedule`) แล้วลอง `dry_run` ก่อน 1 รอบ จากนั้นรันอีกครั้งโดยปิด `dry_run`

ตั้งเวลาไว้ครั้งเดียวต่อสัปดาห์ Facebook จะปล่อยโพสต์เองทุกวันตามเวลาในไฟล์

> ปุ่ม Run workflow จะขึ้นเมื่อไฟล์ workflow อยู่ใน branch หลักของ repo แล้ว
> บันทึกการส่งของแต่ละรอบเก็บเป็น artifact ของรอบนั้น (รันซ้ำบน GitHub จะส่งซ้ำได้ ให้ใช้ช่อง `post` เลือกเฉพาะโพสต์)

## ข้อจำกัด

- รองรับเฉพาะเพจ Facebook (Reels, รูป, ข้อความ) — TikTok ยังต้องอัปโหลดเอง
- เวอร์ชัน Graph API ตั้งค่าได้ด้วย `FB_GRAPH_VERSION` (ค่าเริ่มต้น `v23.0`) ถ้า Meta ปิดเวอร์ชันเก่าให้เปลี่ยนเลขนี้
