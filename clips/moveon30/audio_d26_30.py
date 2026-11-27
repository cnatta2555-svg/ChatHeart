from audio_lib import *
import re
def subs_times(d):
    js=open(f'day{d}.js').read(); return [float(x) for x in re.findall(r"\[\s*([\d.]+),[\d.]+,'",js)]
def gaugeS(m,tc): m.add(tc,sweep(300,1200,.8,2),.18)
def base(d,D,volf,major=True):
    m=Mix(D); music(m,volf,major)
    for x in subs_times(d): m.add(x,pop,.07)
    return m
# 26
m=base(26,37.5,lambda t:.05 if t>=30.1 else .035)
m.add(0.3,tone(1319,.5,5),.1); m.add(7.3,tone(392,.4,6),.1); m.add(10.95,tone(392,.4,6),.1)
m.add(15.3,sweep(300,600,.3,6),.12); m.add(21.6,tone(1047,1.4,1.5)+tone(1319,1.4,1.5)+tone(1568,1.4,1.5),.1)
gaugeS(m,28.2); endjingle(m,30.1); finish(m,'voice_d26.wav','audio_d26.wav')
# 27
m=base(27,31,lambda t:.05 if t>=23.3 else .035)
m.add(1.4,tone(1319,.3,8)+tone(1760,.3,8),.2)
for x in [4.6,4.95,5.35]: m.add(x,sweep(600,1400,.15,12),.15)
m.add(5.8,tone(1568,.5,5)+tone(2093,.5,5),.18)
for k in range(5): m.add(12.0+k*.35,tone(700+k*40,.15,15),.07)
for k in range(8): m.add(15.3+k*.5,tone(60,.15,18),.3)
gaugeS(m,21.0); endjingle(m,23.3); finish(m,'voice_d27.wav','audio_d27.wav')
# 28
m=base(28,31,lambda t:.05 if t>=23.7 else (.03 if t<16.1 else .04),False)
for k in range(10): m.add(1.5+k*.25,noise(.05,50,k)*.5,.08)                 # pencil scratch
m.add(4.5,sweep(1500,500,.6,3),.1); m.add(16.1,tone(1047,1.6,1.2)+tone(1319,1.6,1.2)+tone(1568,1.6,1.2),.1)
gaugeS(m,21.9); endjingle(m,23.7); finish(m,'voice_d28.wav','audio_d28.wav')
# 29
m=base(29,31,lambda t:.05 if t>=26.1 else .035)
m.add(1.6,sweep(300,120,1.2,2)*.6,.2)
for x in [3.95,5.9,7.3]: m.add(x,sweep(400,1600,.35,5),.18)
m.add(9.1,tone(1568,.5,5),.15); m.add(16.3,tone(1319,.8,3)+tone(1568,.8,3),.12)
m.add(18.5,tone(1047,1.6,1.2)+tone(1319,1.6,1.2)+tone(1568,1.6,1.2),.1)
gaugeS(m,24.3); endjingle(m,26.1); finish(m,'voice_d29.wav','audio_d29.wav')
# 30
m=base(30,40,lambda t:.06 if t>=28.9 else (.03 if 3.45<=t<7.95 else .045))
m.add(4.9,tone(1800,.04,80),.05)
for k in range(5): m.add(16.6+k*.8,tone(1760,.1,25),.12)
gaugeS(m,23.0)
for k in range(10): m.add(23.0+k*.25,noise(.2,14,k+70),.12); m.add(23.1+k*.25,sweep(300,1500,.25,6)*.4,.15)
m.add(25.6,tone(1319,.3,8)+tone(1760,.3,8),.22)
for k in range(8): m.add(27.0+k*.25,tone(60,.12,20),.3)
m.add(28.9,sweep(200,1200,.6,3),.25); m.add(31.85,tone(784,.6,4)+tone(1047,.6,4),.25); m.add(32.1,tone(1319,.9,3),.25)
endjingle(m,34.3); finish(m,'voice_d30.wav','audio_d30.wav')
