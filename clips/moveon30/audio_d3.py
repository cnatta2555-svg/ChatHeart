import numpy as np, wave, subprocess
SR=44100; D=29.5; a=np.zeros(int(SR*D))
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
    vol=.05 if t>=24.1 else (.025 if 5.2<=t<17.8 else .035)
    add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),vol)
    if i%8==0: add(t,tone(notes[ch[0]]/2,2.4,1.2),.06)
    i+=1; t+=step
pop=sweep(500,1100,.12,30)
for x in [0.25,1.75,3.7,5.25,6.7,8.8,10.9,12.5,14.3,16.3,17.9,19.3,20.1,21.25,22.1]: add(x,pop,.15)
add(3.7,tone(140,.25,10,'sq'),.25)                       # box thump
for x in [5.2,8.7,10.8]: add(x,sweep(400,1600,.35,5),.2)  # item reveal whoosh
add(5.4,tone(1047,1.2,2)+tone(1319,1.2,2),.12)
add(12.6,tone(1568,.8,3)+tone(1976,.8,3),.15)              # dreamy sniff
for k in range(10): add(14.3+k*.15,tone(2200,.03,90),.12) # clock fast-forward ticks
add(16.3,sweep(500,250,.6,3),.2)                           # sad trombone-ish
add(18.1,sweep(300,120,1.2,2)*.6,.2)                       # box slide
add(20.1,tone(1760,.12,20),.15); add(20.25,tone(2093,.12,20),.15)
add(24.1,tone(784,.6,4)+tone(1047,.6,4),.25); add(24.4,tone(1319,.9,3),.25)
a=a/max(1e-9,np.abs(a).max())*.35
v=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_d3.wav','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).astype(float)
add(0,v/np.abs(v).max()*.9,1)
a=a/max(1.0,np.abs(a).max())*.98
fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
w=wave.open('audio_d3.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
