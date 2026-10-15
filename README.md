# ROV Highlight

แอป Android (Kotlin) สำหรับมือถือ realme 5G: อัดหน้าจอตอนดู **replay ใน ROV** แล้วเก็บไว้เฉพาะ **ช็อตไฮไลท์** ให้อัตโนมัติ

## ดาวน์โหลด APK

ทุกครั้งที่ push โค้ด GitHub Actions จะ build APK ให้ (workflow `Build APK`)

- **วิธีง่ายสุด:** เปิดหน้า **Releases → `latest-apk`** ของ repo นี้บนมือถือ แล้วกดไฟล์ `ROV-Highlight-<เลข>.apk`
- หรือเปิดแท็บ **Actions → Build APK → (รอบล่าสุด) → Artifacts → `ROV-Highlight-apk`** (จะได้ไฟล์ .zip ที่มี .apk อยู่ข้างใน)

ติดตั้ง: เปิดไฟล์ .apk → อนุญาต “ติดตั้งแอปที่ไม่รู้จัก” ให้เบราว์เซอร์/ตัวจัดการไฟล์ → ติดตั้ง
ต้องใช้ Android 10 ขึ้นไป

## ทำงานอย่างไร

| ส่วน | รายละเอียด |
|---|---|
| อัดหน้าจอ | MediaProjection → OpenGL → H.264 (720p หรือ 1080p, 30fps) |
| เก็บย้อนหลัง | วิดีโอ+เสียงที่ encode แล้วอยู่ใน **ring buffer ในแรม** (~20–90 วินาที) ไม่เขียนทั้งเกมลงเครื่อง |
| อ่านป้าย Kill | OCR บนเครื่อง (ML Kit) อ่านบริเวณกลางบนของจอทุก ~0.5 วิ จับ Double / Triple / Quadra / Penta / Solo Kill (ทนต่อการอ่านเพี้ยน เช่น `D0UBLE K1LL`) |
| ไฟต์ใหญ่ / จังหวะสวย | เสียงเกมดังกว่าปกติ (เทียบ baseline) **+** ภาพเคลื่อนไหวเยอะ ต่อเนื่อง ≥ 2.5 วิ (ถ้าดึงเสียงเกมไม่ได้จะใช้ความเคลื่อนไหวอย่างเดียว) ปรับความไวได้ 5 ระดับ |
| ปุ่มลอย ★ | แตะ = เซฟช็อตนี้, กดค้าง 1 วิ = หยุด & รวมคลิป, ลากย้ายตำแหน่งได้ (มีปุ่มเดียวกันในแจ้งเตือนด้วย) |
| ความยาวคลิป | **12 วิ ก่อน + 5 วิ หลัง** เหตุการณ์, ช่วงที่ทับกันรวมเป็นคลิปเดียว (ยาวสุด 60 วิ/คลิป) |
| ดูจบ | (ค่าเริ่มต้น) รวม**เฉพาะช็อตฆ่า** Double/Triple/Quadra/Penta/Solo เป็นวิดีโอเดียว — ปิดสวิตช์ “วิดีโอรวมเอาเฉพาะช็อตฆ่า” ถ้าอยากรวมทุกคลิป (ไม่ encode ใหม่ เร็วและไม่เสียคุณภาพ) เซฟลงแกลเลอรี อัลบั้ม **“ROV Highlight”** (`Movies/ROV Highlight`) |
| หน้าคลิปของฉัน | แยกตามรอบที่อัด: ดู / แชร์ / ลบ แต่ละคลิป และกด “รวม & เซฟลงแกลเลอรี” ใหม่ได้ เลือกได้ว่าเฉพาะช็อตฆ่าหรือทุกคลิป (กดค้างเพื่อรวมซ้ำ) |

## วิธีใช้

1. เปิดแอป → **เริ่มจับไฮไลท์** → อนุญาตแจ้งเตือน / ไมโครโฟน (ใช้ดึงเสียงเกม ไม่ได้อัดเสียงไมค์) / แสดงทับแอปอื่น
2. ระบบถามแชร์หน้าจอ → เลือก **ทั้งหน้าจอ**
3. แอปจะเปิด ROV ให้ → เข้าไปดู replay ตามปกติ
4. ดูจบ → กดค้างปุ่มลอย หรือกด **หยุด & รวมคลิป** ในแจ้งเตือน → รอแจ้งเตือน “เซฟไฮไลท์ … แล้ว”

## ข้อควรรู้ / ข้อจำกัด

- **realme UI ปิดแอปเบื้องหลังเก่ง**: ไปที่ ตั้งค่า → แบตเตอรี่ → ROV Highlight → อนุญาตทำงานเบื้องหลัง / ไม่จำกัด
- ปุ่มลอยจะติดอยู่ในวิดีโอด้วย (Android ไม่ให้แอปซ่อนหน้าต่างตัวเองจากการอัดจอ) — ลากไปไว้มุมจอ หรือปิดปุ่มลอยแล้วใช้ปุ่มในแจ้งเตือนแทน
- ถ้า ROV ไม่อนุญาตให้แอปอื่นดึงเสียง คลิปจะเงียบ และการจับไฟต์จะใช้ความเคลื่อนไหวของภาพอย่างเดียว
- OCR อ่านได้เฉพาะตัวอักษรละติน — จับป้ายภาษาอังกฤษ (DOUBLE KILL ฯลฯ) ได้ แต่อ่านข้อความภาษาไทยไม่ได้
- คลิปแยกเก็บในพื้นที่ของแอป ถ้าถอนการติดตั้งจะหายไป (วิดีโอรวมในแกลเลอรียังอยู่)

## ลายเซ็น APK (ถ้าอยากอัปเดตทับได้โดยไม่ต้องถอนแอปเก่า)

ถ้าไม่ตั้งค่าอะไร CI จะเซ็นด้วย debug key ที่สร้างใหม่ทุกรอบ → ติดตั้งทับเวอร์ชันเก่าไม่ได้ ต้องถอนก่อน
ถ้าอยากให้ลายเซ็นคงที่ สร้าง keystore ครั้งเดียว:

```bash
keytool -genkeypair -v -keystore rovhighlight.jks -alias rovhighlight -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 rovhighlight.jks   # คัดลอกผลลัพธ์
```

แล้วเพิ่มใน **Settings → Secrets and variables → Actions**: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`

## Build เอง

```bash
./gradlew testDebugUnitTest assembleRelease
# APK: app/build/outputs/apk/release/app-release.apk
```

## โครงสร้างโค้ด

```
app/src/main/java/com/rovhighlight/app/
  capture/   ScreenRenderer (MediaProjection→GL), VideoEncoder, AudioCapture, MediaRingBuffer
  detect/    FrameAnalyzer (OCR + motion), KeywordMatcher, FightDetector, HighlightType
  clip/      ClipScheduler (12+5 วิ, รวมช่วงทับ), ClipWriter, VideoMerger, GallerySaver, ClipRepository
  service/   RecorderService (foreground service), FloatingButton
  ui/        MainActivity, ClipsActivity, PlayerActivity
```
