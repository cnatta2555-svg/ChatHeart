import json,re,sys,subprocess,base64,wave
md=open('/home/user/ChatHeart/clips/moveon30/scripts_day26-30.md',encoding='utf-8').read()
BASE='อ่านแบบสาววัยรุ่นเล่าเรื่องให้เพื่อนสนิทฟัง ตลกปนเศร้า ประชดตัวเองนิดๆ จังหวะเร็ว มีเว้นจังหวะก่อนมุก'
for sec in re.split(r'\n## ',md)[1:]:
    day=int(re.match(r'Day (\d+)',sec).group(1))
    if str(day) not in sys.argv[1:]: continue
    extra=re.search(r'เพิ่มใน style: _(.+?)_',sec).group(1)
    lines=re.search(r'```\n(.+?)```',sec,re.S).group(1).strip()
    EN={26:'puzzled and surprised at herself, ending with a relaxed smile',27:'excited and a little shy, ending with a calm happy heartbeat',28:'gentle and touching, slower than usual, like reading a heartfelt letter',29:'calm, confident and warm',30:'proud and moved, sincerely thanking the audience, then excited about the new season at the end'}[day]
    prompt=('Speak the Thai transcript below as a young Thai woman telling a story to her best friend: funny with a touch of sadness, a bit self-mocking, fast pace, with short pauses before punchlines and between lines. Mood for this episode: '+EN+'. '
            'Only speak the transcript lines. Do not read these directions.\n\nTranscript:\n'+lines)
    body={'contents':[{'parts':[{'text':prompt}]}],'generationConfig':{'responseModalities':['AUDIO'],'speechConfig':{'voiceConfig':{'prebuiltVoiceConfig':{'voiceName':'Leda'}}}}}
    out=subprocess.run(['curl','-sS','-m','300','-X','POST','https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent','-H','Content-Type: application/json','-d',json.dumps(body)],capture_output=True).stdout
    d=json.loads(out)
    if 'error' in d: print(day,d['error']); continue
    part=d['candidates'][0]['content']['parts'][0]['inlineData']
    pcm=base64.b64decode(part['data']); rate=int(re.search(r'rate=(\d+)',part['mimeType']).group(1)) if 'rate=' in part['mimeType'] else 24000
    if pcm[:4]==b'RIFF': open(f'clip/voice_d{day}.wav','wb').write(pcm)
    else:
        w=wave.open(f'clip/voice_d{day}.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm); w.close()
    print(day, part['mimeType'], subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'clip/voice_d{day}.wav'],capture_output=True,text=True).stdout.strip(),'s')
