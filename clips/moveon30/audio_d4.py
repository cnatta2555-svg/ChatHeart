import numpy as np, wave, subprocess
SR=44100; D=25; a=np.zeros(int(SR*D))
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
    vol=.05 if t>=19.2 else (.0 if 3.3<=t<15.2 else .035)
    add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),vol)
    if i%8==0: add(t,tone(notes[ch[0]]/2,2.4,1.2),.06)
    i+=1; t+=step
pop=sweep(500,1100,.12,30)
for x in [0.25,1.3,3.3,4.3,5.5,6.2,7.45,8.15,10.3,11.15,12.75,15.3,16.5]: add(x,pop,.12)
# upbeat bleeps at start (fun music)
for k in range(12): add(0.2+k*.25,tone([523,659,784,1047][k%4],.2,10,'sq'),.06)
# sad piano loop for songs 1-2
def sadloop(t0,t1,root):
    k=0;t=t0
    while t<t1: add(t,tone(root*[1,1.2,1.5,1.2][k%4],.9,3),.07); k+=1; t+=.45
add(3.6,tone(1400,.05,60),.2); sadloop(3.7,5.6,220)
add(5.6,sweep(1500,600,.15,20),.2); sadloop(5.75,7.5,196)
add(7.55,sweep(1500,600,.15,20),.2)
# duet: sweet major arpeggio 8.15-15.2 (song continues in taxi)
k=0;t=8.15
while t<15.2:
    add(t,tone([523,659,784,659][k%4],.6,4)+tone([1047,1319,1568,1319][k%4],.6,6)*.3,.06 if t<10.3 else .035); k+=1; t+=.3
add(8.15,sweep(300,1200,.4,3),.25)
add(10.3,tone(300,.15,12,'sq'),.15); add(10.45,tone(300,.15,12,'sq'),.15)  # car door / honk
add(12.75,sweep(500,250,.8,2),.15)
add(19.2,tone(784,.6,4)+tone(1047,.6,4),.25); add(19.5,tone(1319,.9,3),.25)
a=a/max(1e-9,np.abs(a).max())*.35
v=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','voice_d4.wav','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).astype(float)
add(0,v/np.abs(v).max()*.9,1)
a=a/max(1.0,np.abs(a).max())*.98
fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
w=wave.open('audio_d4.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
