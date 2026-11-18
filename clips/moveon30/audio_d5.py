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
    vol=.05 if t>=22.2 else (0 if 11.4<=t<14.6 else .04)
    add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),vol)
    if i%8==0: add(t,tone(notes[ch[0]]/2,2.4,1.2),.06)
    i+=1; t+=step
pop=sweep(500,1100,.12,30)
for x in [0.15,1.5,3.6,4.75,5.7,7.6,9.7,11.05,14.6,17.5,18.6,20.7]: add(x,pop,.12)
add(1.5,sweep(900,300,.8,2),.15)                         # dragged whoosh
nz=np.random.default_rng(1).standard_normal(int(SR*3.9))*np.exp(-0*np.arange(int(SR*3.9))/SR)
add(3.5,nz*.5,.05)                                        # sizzle
add(5.9,tone(1568,.5,5)+tone(2093,.5,5),.2)               # happy ding
add(7.7,tone(660,.15,10)+tone(880,.15,10),.12)            # staff steps in
add(11.4,sweep(200,60,.6,3),.6)                           # record-scratch thud
add(11.45,sweep(2500,300,.25,8),.25)
for k in range(5): add(12.8+k*.4,tone(4200,.05,60)*np.sin(np.arange(int(SR*.05))/SR*2*np.pi*40),.12)  # crickets
for x in [15.0,15.6,16.2]: add(x,tone(180,.12,15,'sq'),.25); add(x+.05,sweep(800,1600,.1,20),.15)
add(18.7,sweep(400,900,.3,6),.15)
add(22.2,tone(784,.6,4)+tone(1047,.6,4),.25); add(22.5,tone(1319,.9,3),.25)
a=a/max(1e-9,np.abs(a).max())*.35
v=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_d5.wav','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).astype(float)
add(0,v/np.abs(v).max()*.9,1)
a=a/max(1.0,np.abs(a).max())*.98
fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
w=wave.open('audio_d5.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
