import numpy as np, wave, subprocess
SR=44100; D=30.5; a=np.zeros(int(SR*D))
def add(t,s,g=1):
    i=int(t*SR); n=min(len(s),len(a)-i); a[i:i+n]+=s[:n]*g
def tone(f,d,dec,shape='sin'):
    t=np.arange(int(SR*d))/SR; w=np.sin(2*np.pi*f*t) if shape=='sin' else np.sign(np.sin(2*np.pi*f*t))*.4
    return w*np.exp(-t*dec)
def sweep(f0,f1,d,dec):
    t=np.arange(int(SR*d))/SR; ph=2*np.pi*np.cumsum(np.linspace(f0,f1,len(t)))/SR; return np.sin(ph)*np.exp(-t*dec)
notes={'A3':220,'C4':261.6,'E4':329.6,'F3':174.6,'A4':440,'G3':196,'B3':246.9,'D4':293.7,'G4':392,'C5':523.3}
prog=[['A3','C4','E4','A4'],['F3','A3','C4','F3'],['C4','E4','G4','C5'],['G3','B3','D4','G4']]
step=60/96/2; i=0; t=0
while t<D-1.5:
    ch=prog[(i//8)%4]; f=notes[ch[i%4]]*2
    vol=.05 if t>=23.7 else (.02 if 14<=t<17.6 else .035)
    add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),vol)
    if i%8==0: add(t,tone(notes[ch[0]]/2,2.4,1.2),.06)
    i+=1; t+=step
pop=sweep(500,1100,.12,30)
for x in [0.15,2.2,3.95,5.0,6.0,6.9,9.7,11.4,14.1,15.5,16.1,17.7,18.85,20.2,21.3]: add(x,pop,.15)
add(4.15,tone(1200,.05,60),.2); add(5.3,tone(1200,.05,60),.2)
add(5.5,sweep(1200,200,.35,6),.25)                     # whoosh delete
add(6.0,tone(1568,.5,5)+tone(2093,.5,5),.25)           # success
add(11.4,sweep(300,1200,.5,3),.2)
for k,x in enumerate([14.25,14.55,14.85,15.3]): add(x,tone([941,852,697,770][k],.12,20)+tone([1336,1336,1209,1209][k],.12,20),.25)  # DTMF
add(15.5,tone(110,.4,6,'sq'),.35)                       # buzzer
add(17.7,sweep(2000,3000,.6,4)*.5,.15); add(18.3,tone(2637,.4,8),.15)  # icy sparkle
add(23.7,tone(784,.6,4)+tone(1047,.6,4),.25); add(24.0,tone(1319,.9,3),.25)
a=a/max(1e-9,np.abs(a).max())*.35
v=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_d2.wav','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).astype(float)
add(0,v/np.abs(v).max()*.9,1)
a=a/max(1.0,np.abs(a).max())*.98
fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
w=wave.open('audio_d2.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
