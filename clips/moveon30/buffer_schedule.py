# Schedules มูฟออน clips to TikTok (@nongmoove) via the Buffer API.
# Usage: python3 buffer_schedule.py 25 26 ...   (Day 15 = 2026-11-29 19:30 Asia/Bangkok, +1 day per clip)
# The Buffer API key is injected by the session network proxy; it is not stored here.
# SHA must point to a pushed commit that contains the clip files.
import json, sys, subprocess, datetime
SHA='036e8af77feff5e713ca5d4dbde678d34796613a'
CH='6b0977a58541f09ecbc0e7e4'
TAGS='#มูฟออน #อกหัก #แฟนเก่า #การ์ตูน #น้องมูฟ #30วัน'
CAP={
15:'Day 15/30 มูฟออน 🌊 ไปทะเลคนเดียว เจอแต่คู่รักทั้งหาด... ขนาดปูยังหนีบใส่ 🦀😭',
16:'Day 16/30 มูฟออน 🍳 ทำอาหารกินเองครั้งแรก ไข่ไหม้ สัญญาณไฟดังทั้งตึก ยามขึ้นมาเคาะ 🚨',
17:'Day 17/30 มูฟออน 😳 หนุ่มฟิตเนสยิ้มให้... แล้วฉันก็ตกลู่วิ่งต่อหน้าเขา 🏃‍♀️💥',
18:'Day 18/30 มูฟออน 📲 โหลดแอปหาคู่ แมตช์แรกชวนขายตรง คนที่สองรูปไม่ตรงปก 👴',
19:'Day 19/30 มูฟออน 🤫 เพื่อนเล่าความลับของเขา... รู้แล้วเจ็บ แต่ใจเบาขึ้นเยอะ ☀️',
20:'Day 20/30 มูฟออน 🗑️ ลบรูปคู่ 2,300 รูป พื้นที่ว่าง +10GB ใจก็โล่งขึ้น ครึ่งทางแล้ว! 🎉',
21:'Day 21/30 มูฟออน 📊 สรุปสัปดาห์ที่ 3 ดีที่สุดเลย! ใครเคยรู้ความจริงแล้วใจเบาขึ้นบ้าง? คอมเมนต์เล่าหน่อย 👇',
22:'Day 22/30 มูฟออน 💬 เขาทักมาว่า "สบายดีไหม"... ทุกอย่างพังในสามคำ 💔',
23:'Day 23/30 มูฟออน 😇😈 นางฟ้าบอกตอบ นางมารบอกไม่ตอบ ถ้าเป็นคุณ จะตอบไหม? คอมเมนต์เลย 👇',
24:'Day 24/30 มูฟออน ✍️ พิมพ์ยาวแล้วลบ... สุดท้ายตอบแค่ "สบายดีจ้า" แล้วปิดแชท 🔕',
25:'Day 25/30 มูฟออน 🛍️ เจอเขากับคนใหม่ที่ห้าง! หลบหลังหุ่น... แล้วเดินสวนไปไม่หันกลับ ✨',
}
def due(day):  # Day 15 -> 2026-11-29 19:30 +07:00
    d=datetime.date(2026,11,29)+datetime.timedelta(days=day-15)
    return f'{d.isoformat()}T12:30:00.000Z'
def create(day):
    url=f'https://raw.githubusercontent.com/cnatta2555-svg/ChatHeart/{SHA}/clips/moveon30/day{day}.mp4'
    q='''mutation($input: CreatePostInput!){ createPost(input:$input){ __typename
      ... on PostActionSuccess { post { id dueAt status } }
      ... on InvalidInputError { message } ... on LimitReachedError { message } ... on UnexpectedError { message }
      ... on UnauthorizedError { message } ... on NotFoundError { message } ... on RestProxyError { message } } }'''
    inp={'channelId':CH,'text':CAP[day]+'\n\n'+TAGS,'schedulingType':'automatic','mode':'customScheduled','dueAt':due(day),
         'needsApproval':False,'assets':[{'video':{'url':url}}],'metadata':{'tiktok':{'isAiGenerated':False}}}
    out=subprocess.run(['curl','-sS','-m','60','-X','POST','https://api.buffer.com','-H','Content-Type: application/json','-d',json.dumps({'query':q,'variables':{'input':inp}})],capture_output=True,text=True).stdout
    print(day, due(day), out[:600])
for d in map(int,sys.argv[1:]): create(d)
