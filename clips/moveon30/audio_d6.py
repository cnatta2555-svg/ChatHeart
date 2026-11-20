import numpy as np, wave, subprocess
SR=44100; D=28; a=np.zeros(int(SR*D))
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
    vol=.05 if t>=21.9 else (0 if 10.75<=t<14.6 else .04)
    add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),vol)
    if i%8==0: add(t,tone(notes[ch[0]]/2,2.4,1.2),.06)
    i+=1; t+=step
pop=sweep(500,1100,.12,30)
for x in [0.15,1.4,4.0,5.3,6.75,8.2,9.7,10.75,14.65,16.75,17.85,19.1,19.8]: add(x,pop,.12)
for x in [0.4,0.9]: add(x,sweep(1200,2400,.15,15),.15)             # party poppers
for x in [4.05,6.8,9.8]: add(x,tone(2637,.25,12)+tone(3136,.25,14),.2) # glass clink
for k in range(8): add(11.95+k*.1,tone(1800,.03,90),.12)             # typing
add(12.9,sweep(80,40,1.6,1)*.8,.5)                                   # slow-mo drone
add(13.0,sweep(600,300,1.5,1.5),.15)
add(14.8,sweep(400,1400,.8,2),.18)                                   # throw whoosh
nz=np.random.default_rng(2).standard_normal(int(SR*.6))*np.exp(-np.arange(int(SR*.6))/SR*6)
add(15.6,nz,.25); add(15.6,tone(140,.3,10),.3)                       # splash
add(17.85,sweep(500,200,.9,2),.15)
add(19.9,sweep(400,900,.3,6),.15)
add(21.9,tone(784,.6,4)+tone(1047,.6,4),.25); add(22.2,tone(1319,.9,3),.25)
a=a/max(1e-9,np.abs(a).max())*.35
v=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_d6.wav','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).astype(float)
add(0,v/np.abs(v).max()*.9,1)
a=a/max(1.0,np.abs(a).max())*.98
fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
w=wave.open('audio_d6.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
