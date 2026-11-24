from audio_lib import *
import re
def subs_times(d):
    js=open(f'day{d}.js').read(); return [float(x) for x in re.findall(r"\[\s*([\d.]+),[\d.]+,'",js)]
def gaugeS(m,tc,up=True): m.add(tc,sweep(300,1200,.8,2) if up else sweep(800,200,.9,2),.2)
def base(d,D,volf,major=False):
    m=Mix(D); music(m,volf,major)
    for x in subs_times(d):
        if x not in (12.05,): m.add(x,pop,.08)
    return m
# 22
m=base(22,33,lambda t:.045 if t<5.3 else (.05 if t>=25.65 else 0),True)
for k in range(5): m.add(0.5+k*.8,tone(700+k*40,.15,15),.06)               # laughs
for k in range(6): m.add(5.45+k*.25,noise(.15,20,k)*.6+tone(120,.15,20),.25)  # vibrate
m.add(5.5,tone(1319,.3,8)+tone(1760,.3,8),.22)
m.add(10.45,tone(220,2.5,1)+tone(233,2.5,1),.12)                           # dissonant sting
m.add(12.1,sweep(200,60,.8,3),.5); m.add(12.3,tone(1800,.15,20),.15)        # spoon drop
m.add(15.8,noise(.8,5,3),.3); m.add(15.8,sweep(3000,600,.6,4),.15)          # shatter
m.add(17.5,tone(110,3.5,.4),.08)
gaugeS(m,24.2,False); endjingle(m,25.65); finish(m,'voice_d22.wav','audio_d22.wav')
# 23
m=base(23,39.5,lambda t:.05 if t>=32.5 else (.035 if t<13.75 or t>=17.45 else .02))
m.add(4.6,tone(1568,1,2)+tone(2093,1,2),.12)                               # angel chime
m.add(9.2,tone(98,1,2,'sq')*.6,.15)                                         # devil
for k in range(12): m.add(13.8+k*.3,noise(.08,40,k),.15)                    # fight
for x in [14.0,14.9,15.7]: m.add(x,tone(200,.12,15,'sq'),.2)
m.add(18.7,tone(500,.2,10,'sq')*.6,.15); m.add(20.8,tone(1047,.8,3)+tone(1319,.8,3),.12)
m.add(24.6,tone(700,.15,12),.15); m.add(25.6,tone(900,.15,12),.15)
gaugeS(m,30.0); endjingle(m,32.5); finish(m,'voice_d23.wav','audio_d23.wav')
# 24
m=base(24,30.5,lambda t:.05 if t>=15.85 else .03,True)
for a,b in [(3.25,4.5),(5.6,6.5),(8.8,9.5)]:
    k=0
    while a+k*.08<b: m.add(a+k*.08,tone(1800,.03,90),.1); k+=1
for x in [4.7,6.6]: m.add(x,sweep(1200,400,.25,8),.15)
m.add(10.2,sweep(500,1500,.25,8),.22)
for k in range(5): m.add(11.6+k*.4,tone(900,.06,40),.08)
m.add(13.9,tone(1200,.05,60),.2); m.add(14.3,sweep(1000,300,.3,6),.15)
m.add(15.9,tone(1047,1.4,1.5)+tone(1319,1.4,1.5)+tone(1568,1.4,1.5),.1)
gaugeS(m,22.4)
for k in range(5): m.add(22.6+k*.3,noise(.2,14,k+60),.1)
endjingle(m,24.5); finish(m,'voice_d24.wav','audio_d24.wav')
# 25
m=base(25,39,lambda t:.05 if t>=31.6 else (0 if 4.65<=t<7.95 else .035),True)
m.add(0.2,noise(4,.3,4)*.4,.05)                                             # mall ambience
m.add(4.8,tone(220,2.5,1)+tone(233,2.5,1),.12)
m.add(8.0,sweep(900,300,.5,4),.2)
m.add(14.4,tone(523,.2,6),.12); m.add(16.1,sweep(300,1200,.6,3),.18)
m.add(20.3,tone(880,.2,8),.12)
m.add(22.5,tone(1047,1.4,1.5)+tone(1319,1.4,1.5),.1)
gaugeS(m,29.3); endjingle(m,31.6); finish(m,'voice_d25.wav','audio_d25.wav')
