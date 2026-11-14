import numpy as np, wave
SR=44100; D=47; a=np.zeros(int(SR*D))
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
    vol=.05 if not (25.6<=t<34) else .03
    if 42.5<=t: vol=.06
    add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),vol)
    if i%8==0: add(t,tone(notes[ch[0]]/2,2.4,1.2),.06)
    i+=1; t+=step
pop=sweep(500,1100,.12,30)
for s in [0.2,2.3,4.5,6.8,9,11,13.5,15.5,18,20.5,23.5,25.6,29,31.5,34,36.4,37.6,39.5,41,42.5]: add(s,pop,.35)
for k in range(46): add(4.8+k*(2.6/46)**1*1,tone(1800,.04,80),.15)   # tick counter
add(9,sweep(200,900,.4,4),.4); add(13.5,sweep(300,700,.25,8),.3)
add(25.6,sweep(160,40,.8,3),.9); add(26.2,tone(1200,.3,15,'sq'),.2); add(26.6,tone(900,.3,15,'sq'),.2)  # crack
add(36.2,tone(1568,.8,5)+tone(2349,.8,6),.35)  # like ding
add(37.6,sweep(600,1400,.9,2)*np.sin(np.arange(int(SR*.9))/SR*2*np.pi*30),.25)  # scream wobble
add(42.5,tone(784,.6,4)+tone(1047,.6,4),.3); add(42.8,tone(1319,.9,3),.3)
a=a/max(1e-9,np.abs(a).max())*.85
fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
w=wave.open('audio.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
