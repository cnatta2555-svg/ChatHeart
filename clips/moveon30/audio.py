import numpy as np, wave
SR=44100; D=44.5; a=np.zeros(int(SR*D))
def add(t,s,g=1):
    i=int(t*SR); n=min(len(s),len(a)-i); a[i:i+n]+=s[:n]*g
def tone(f,d,dec,shape='sin'):
    t=np.arange(int(SR*d))/SR; w=np.sin(2*np.pi*f*t) if shape=='sin' else np.sign(np.sin(2*np.pi*f*t))*.4
    return w*np.exp(-t*dec)
def sweep(f0,f1,d,dec):
    t=np.arange(int(SR*d))/SR; ph=2*np.pi*np.cumsum(np.linspace(f0,f1,len(t)))/SR; return np.sin(ph)*np.exp(-t*dec)
# music box arpeggio bed: Am F C G
notes={'A3':220,'C4':261.6,'E4':329.6,'F3':174.6,'A4':440,'G3':196,'B3':246.9,'D4':293.7,'G4':392,'C5':523.3,'E5':659.3}
prog=[['A3','C4','E4','A4'],['F3','A3','C4','F3'],['C4','E4','G4','C5'],['G3','B3','D4','G4']]
bpm=96; step=60/bpm/2; i=0; t=0
while t<D-1.5:
    ch=prog[(i//8)%4]; f=notes[ch[i%4]]*2
    vol=.035 if not (20.3<=t<31.7) else .02
    if 37.3<=t: vol=.05
    add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),vol)
    if i%8==0: add(t,tone(notes[ch[0]]/2,2.4,1.2),.06)
    i+=1; t+=step
pop=sweep(500,1100,.12,30)
for x in [0.15,2.1,3.9,5.6,8.0,8.9,10.5,11.5,13.6,14.9,16.5,18.6,20.4,23.4,26.0,28.7,30.4,31.7,34.2,35.3]: add(x,pop,.18)
for k in range(46): add(4.0+2.2*(1-(1-k/46)**3),tone(1800,.04,80),.1)   # counter ticks
add(7.8,sweep(200,900,.4,4),.3); add(10.4,sweep(300,700,.25,8),.2); add(11.6,sweep(900,300,.2,10),.25)
add(20.4,sweep(160,40,.8,3),.8); add(21.3,tone(1200,.3,15,'sq'),.15); add(21.7,tone(900,.3,15,'sq'),.15)
add(30.8,tone(1568,.8,5)+tone(2349,.8,6),.3)
add(31.7,sweep(600,1400,.9,2)*np.sin(np.arange(int(SR*.9))/SR*2*np.pi*30),.18)
add(37.3,tone(784,.6,4)+tone(1047,.6,4),.25); add(37.6,tone(1319,.9,3),.25)
a=a/max(1e-9,np.abs(a).max())*.35
# voice
import subprocess
v=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice.wav','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).astype(float)
v=v/np.abs(v).max()*.9
add(0,v,1)
a=a/max(1.0,np.abs(a).max())*.98
fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
w=wave.open('audio.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
