from audio_lib import *
import re
def subs_times(d):
    js=open(f'day{d}.js').read(); return [float(x) for x in re.findall(r"\[\s*([\d.]+),[\d.]+,'",js)]
# Day 7
m=Mix(31); music(m,lambda t:.05 if t>=24.6 else .035)
for x in subs_times(7): m.add(x,pop,.1)
for x in [3.85,4.9,6.0,7.1,8.6,10.4]: m.add(x,tone(180,.1,25,'sq'),.2); m.add(x,sweep(900,1500,.1,20),.1)  # pin
m.add(14.9,tone(1568,.5,5)+tone(2093,.5,5),.22); m.add(17.3,sweep(300,900,.8,2),.15)
for x in [22.2,22.6,23.0,23.4]: m.add(x,tone(1760,.1,25),.15)
endjingle(m,24.6); finish(m,'voice_d7.wav','audio_d7.wav')
# Day 8
m=Mix(31); music(m,lambda t:.05 if t>=26.1 else (0 if 11.4<=t<14.4 else .035))
for x in subs_times(8): m.add(x,pop,.1)
for k in range(24): m.add(7.6+k*.16,noise(.05,80,k),.12)              # snips
m.add(11.4,sweep(2000,200,.5,3),.3); m.add(11.45,noise(.3,10,9),.2)
m.add(12.8,tone(523,.25,6,'sq')*.6,.2); m.add(13.05,tone(392,.6,3,'sq')*.6,.2)  # wah-wah
m.add(17.6,sweep(1500,3000,.4,5),.15)
m.add(19.3,noise(.15,30,3),.3)                                         # camera shutter
for k in range(6): m.add(19.6+k*.45,tone(660+k*30,.15,15),.08)          # giggles
m.add(24.2,sweep(400,900,.3,6),.15); endjingle(m,26.1); finish(m,'voice_d8.wav','audio_d8.wav')
# Day 9
m=Mix(30); music(m,lambda t:.05 if t>=24.4 else (.045 if 7.7<=t<14 else .035))
for x in subs_times(9): m.add(x,pop,.1)
for k in range(30): m.add(7.8+k*.21,tone(90,.08,30),.25)               # footsteps
for k in range(40): m.add(11.1+k*.07,tone(90,.06,40),.25)
m.add(9.3,sweep(800,400,.8,2),.15); m.add(11.1,noise(2.8,.3,5),.08)     # ghost / fire
for x in [15.4,16.0,16.8,17.4]: m.add(x,tone(1200,.06,50,'sq'),.12)     # zaps
m.add(19.7,tone(1319,1.2,2)+tone(1760,1.2,2),.12)
m.add(22.4,sweep(400,900,.3,6),.15); endjingle(m,24.4); finish(m,'voice_d9.wav','audio_d9.wav')
# Day 10
m=Mix(30.5); music(m,lambda t:.05 if t>=23.3 else (0 if 7.25<=t<12.0 else (.05 if t>=12 else .035)),major=True)
for x in subs_times(10): m.add(x,pop,.1)
m.add(0.2,sweep(1200,2400,.4,4),.15)
for k in range(5): m.add(7.3+k, tone(1000,.08,30),.25)                  # bomb beeps
m.add(9.3,noise(.08,50,4),.25); m.add(10.4,noise(.08,50,6),.25)
m.add(12.1,tone(1200,.05,60),.25)
for k in range(6): m.add(12.2+k*.35,sweep(300,1500,.25,6)*.5,.2); m.add(12.45+k*.35,noise(.25,12,k),.15)  # fireworks
m.add(20.15,tone(1047,.5,4)+tone(1319,.5,4)+tone(1568,.5,4),.25)
for k in range(5): m.add(20.3+k*.3,noise(.2,14,k+20),.12)
endjingle(m,23.3); finish(m,'voice_d10.wav','audio_d10.wav')
