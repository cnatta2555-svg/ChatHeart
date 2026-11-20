import numpy as np, wave, subprocess
SR=44100
class Mix:
    def __init__(s,D): s.D=D; s.a=np.zeros(int(SR*D))
    def add(s,t,x,g=1):
        i=int(t*SR); n=min(len(x),len(s.a)-i)
        if n>0: s.a[i:i+n]+=x[:n]*g
def tone(f,d,dec,shape='sin'):
    t=np.arange(int(SR*d))/SR; w=np.sin(2*np.pi*f*t) if shape=='sin' else np.sign(np.sin(2*np.pi*f*t))*.4
    return w*np.exp(-t*dec)
def sweep(f0,f1,d,dec):
    t=np.arange(int(SR*d))/SR; ph=2*np.pi*np.cumsum(np.linspace(f0,f1,len(t)))/SR; return np.sin(ph)*np.exp(-t*dec)
def noise(d,dec,seed=0):
    return np.random.default_rng(seed).standard_normal(int(SR*d))*np.exp(-np.arange(int(SR*d))/SR*dec)
pop=sweep(500,1100,.12,30)
def music(m,volf,major=False):
    notes={'A3':220,'C4':261.6,'E4':329.6,'F3':174.6,'A4':440,'G3':196,'B3':246.9,'D4':293.7,'G4':392,'C5':523.3}
    prog=[['C4','E4','G4','C5'],['A3','C4','E4','A4'],['F3','A3','C4','F3'],['G3','B3','D4','G4']] if major else [['A3','C4','E4','A4'],['F3','A3','C4','F3'],['C4','E4','G4','C5'],['G3','B3','D4','G4']]
    step=60/96/2; i=0; t=0
    while t<m.D-1.5:
        ch=prog[(i//8)%4]; f=notes[ch[i%4]]*2; v=volf(t)
        if v>0:
            m.add(t,tone(f,1.2,4)+.3*tone(f*2,1.2,6),v)
            if i%8==0: m.add(t,tone(notes[ch[0]]/2,2.4,1.2),v*1.6)
        i+=1; t+=step
def endjingle(m,t): m.add(t,tone(784,.6,4)+tone(1047,.6,4),.25); m.add(t+.3,tone(1319,.9,3),.25)
def finish(m,voice,out):
    a=m.a/max(1e-9,np.abs(m.a).max())*.35
    v=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',voice,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32).astype(float)
    m.a=a; m.add(0,v/np.abs(v).max()*.9,1); a=m.a
    a=a/max(1.0,np.abs(a).max())*.98
    fade=np.ones_like(a); fade[-SR:]=np.linspace(1,0,SR); a*=fade
    w=wave.open(out,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
