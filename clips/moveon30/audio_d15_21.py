from audio_lib import *
import re
def subs_times(d):
    js=open(f'day{d}.js').read(); return [float(x) for x in re.findall(r"\[\s*([\d.]+),[\d.]+,'",js)]
def gaugeS(m,tc,up=True): m.add(tc,sweep(300,1200,.8,2) if up else sweep(800,250,.6,3),.18)
def base(d,D,volf,major=False):
    m=Mix(D); music(m,volf,major)
    for x in subs_times(d): m.add(x,pop,.08)
    return m
# 15
m=base(15,31.5,lambda t:.05 if t>=24.6 else .035,True)
for k in range(6): m.add(0.1+k*.6,tone(70,.2,10),.15)                    # bus rumble
m.add(3.75,noise(2.5,.6,3),.04)                                            # waves
m.add(9.1,tone(1500,.08,40),.15); m.add(9.95,noise(.08,50,5),.25)          # shutter
m.add(11.0,sweep(2000,600,.3,8),.25); m.add(11.05,tone(150,.2,10,'sq'),.25)
m.add(14.85,tone(523,2.5,1)+tone(659,2.5,1)+tone(784,2.5,1),.06)
gaugeS(m,21.9); endjingle(m,24.6); finish(m,'voice_d15.wav','audio_d15.wav')
# 16
m=base(16,33,lambda t:.05 if t>=25.6 else (0 if 9.0<=t<15.85 else .035))
m.add(5.1,noise(2,.5,1)*.6,.08)                                            # sizzle
for k in range(8): m.add(7.2+k*.22,noise(.05,60,k),.25)                    # splatter pops
for k in range(10): m.add(10.4+k*.4,tone(1000 if k%2 else 800,.2,6,'sq'),.12)  # alarm
for x in [12.75,12.95,13.15]: m.add(x,tone(120,.08,25),.35)               # knock
m.add(17.9,tone(1047,1.2,2)+tone(1319,1.2,2),.1)
gaugeS(m,23.1); endjingle(m,25.6); finish(m,'voice_d16.wav','audio_d16.wav')
# 17
m=base(17,29.5,lambda t:.05 if t>=22.35 else .035,True)
for k in range(20): m.add(0.1+k*.3,tone(90,.06,40),.18)
m.add(4.5,tone(2637,.4,8)+tone(3136,.4,8),.2)                              # sparkle smile
for k in range(8): m.add(6.25+k*.35,tone(60,.15,18)*1.5,.4)                # heartbeat
m.add(12.5,sweep(900,200,.4,5),.25); m.add(12.9,tone(80,.3,8),.6); m.add(12.9,noise(.2,15,7),.25)  # fall thud
m.add(16.7,tone(1319,.8,3)+tone(1568,.8,3),.15)
gaugeS(m,19.9); endjingle(m,22.35); finish(m,'voice_d17.wav','audio_d17.wav')
# 18
m=base(18,33,lambda t:.05 if t>=26.3 else .035,True)
for x in [3.35,4.2]: m.add(x,sweep(900,300,.25,8),.2)
m.add(5.0,sweep(400,1400,.25,8),.2); m.add(6.0,tone(1047,.4,5)+tone(1319,.4,5)+tone(1568,.4,5),.25)
m.add(8.1,tone(1319,.15,15),.2); m.add(9.1,tone(1319,.15,15),.2)
m.add(10.2,tone(196,.6,3,'sq')*.5,.2)                                      # suspicious
m.add(12.9,tone(2637,.4,8),.15); m.add(15.7,tone(392,.25,6,'sq')*.6,.2); m.add(15.95,tone(294,.6,3,'sq')*.6,.2)
m.add(19.4,noise(.4,8,9),.25); gaugeS(m,23.9,False); endjingle(m,26.3); finish(m,'voice_d18.wav','audio_d18.wav')
# 19
m=base(19,34,lambda t:.05 if t>=26.95 else (0 if 5.15<=t<16.7 else .035))
m.add(0.2,noise(3,.4,2)*.4,.05)                                            # cafe ambience
m.add(5.2,tone(220,4,.3)*.5,.05)                                           # tension drone
m.add(10.65,sweep(200,60,.8,3),.5); m.add(10.7,noise(.2,15,4),.2)
m.add(14.6,noise(2,.5,6),.08); m.add(14.6,tone(90,.5,4,'sq'),.2)
m.add(16.9,sweep(400,1600,1.2,1.5),.12)
gaugeS(m,25.0); endjingle(m,26.95); finish(m,'voice_d19.wav','audio_d19.wav')
# 20
m=base(20,30.5,lambda t:.05 if t>=23.5 else .035)
for x in [5.2,6.3,7.45]: m.add(x,sweep(900,1500,.1,20),.12)
for k in range(18): m.add(9.3+k*.06,tone(1800,.03,90),.1)
m.add(10.5,noise(.6,6,8),.25); m.add(10.5,sweep(1200,200,.5,4),.2)
m.add(11.7,tone(880,.15,10),.15); m.add(14.0,tone(1200,.05,60),.25); m.add(14.0,noise(.5,7,10),.2)
m.add(15.2,sweep(300,1200,1.5,1),.12)
gaugeS(m,20.6); 
for k in range(5): m.add(21.95+k*.3,noise(.2,14,k+40),.1)
endjingle(m,23.5); finish(m,'voice_d20.wav','audio_d20.wav')
# 21
m=base(21,30,lambda t:.05 if t>=22.85 else .035,True)
for x in [2.95,4.05,5.3,6.6,7.8,9.5]: m.add(x,tone(180,.1,25,'sq'),.2); m.add(x,sweep(900,1500,.1,20),.1)
m.add(13.6,tone(1047,1.2,2)+tone(1319,1.2,2)+tone(1568,1.2,2),.08)
gaugeS(m,16.3)
for k in range(5): m.add(17.65+k*.3,noise(.2,14,k+50),.1)
for x in [20.6,21.0,21.5]: m.add(x,tone(1760,.1,25),.15)
endjingle(m,22.85); finish(m,'voice_d21.wav','audio_d21.wav')
