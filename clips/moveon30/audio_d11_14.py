from audio_lib import *
import re
def subs_times(d):
    js=open(f'day{d}.js').read(); return [float(x) for x in re.findall(r"\[\s*([\d.]+),[\d.]+,'",js)]
# Day 11
m=Mix(35); music(m,lambda t:.05 if t>=28.6 else (.02 if 20.9<=t<25.05 else .035))
for x in subs_times(11): m.add(x,pop,.1)
for k in range(10): m.add(3.2+k*.19,noise(.05,60,k),.18)                 # camera shutters
m.add(9.55,sweep(600,1500,.25,8),.18)                                     # share
for x in [13.85,14.85,15.8]: m.add(x,sweep(300,900,.25,8),.15)
for k in range(10): m.add(16.2+k*.1,tone(1500,.04,60),.1)
for k in range(5): m.add(18.0+k*.5+.0,tone(4200,.05,60)*np.sin(np.arange(int(SR*.05))/SR*2*np.pi*40),.1)
m.add(26.6,sweep(600,250,.4,5),.15); endjingle(m,28.6); finish(m,'voice_d11.wav','audio_d11.wav')
# Day 12
m=Mix(33); music(m,lambda t:.05 if t>=25.95 else (0 if t<2.85 or 5.9<=t<7.2 else .03))
for x in subs_times(12):
    if x not in (5.95,): m.add(x,pop,.08)
for k in range(4): m.add(0.1+k*.7,tone(880,.25,6)+tone(1100,.25,6),.15)  # ringtone
for k in range(4): m.add(14.3+k*.8,tone(500,.08,30),.12)                  # spoon clinks
m.add(18.1,tone(1047,1.5,1.5)+tone(1319,1.5,1.5)+tone(1568,1.5,1.5),.08)
m.add(23.4,sweep(400,900,.3,6),.15); m.add(24.85,tone(1568,.5,5)+tone(2093,.5,5),.2)
for k in range(5): m.add(24.9+k*.25,noise(.2,14,k),.1)
endjingle(m,25.95); finish(m,'voice_d12.wav','audio_d12.wav')
# Day 13
m=Mix(36); music(m,lambda t:.05 if t>=29 else (0 if 5.15<=t<13.25 else .035))
for x in subs_times(13): m.add(x,pop,.08)
m.add(1.75,noise(.1,40,1),.2)
m.add(5.6,tone(1319,.3,8)+tone(1760,.3,8),.25)                            # notification
m.add(9.0,sweep(200,1200,.5,3),.3)
for k in range(16): m.add(10.65+k*.35,tone(55,.15,18)*1.5,.6); m.add(10.8+k*.35,tone(55,.12,22),.4)  # heartbeat
for x in [13.35,14.6,15.65,17.15]: m.add(x,tone(900,.12,15),.12)
m.add(18.3,sweep(1500,500,.4,5),.12)
for k in range(8): m.add(20.2+k*.5,tone(2000,.03,80),.1)                  # clock tick
m.add(27.2,sweep(800,120,.9,2),.25); endjingle(m,29.0); finish(m,'voice_d13.wav','audio_d13.wav')
# Day 14
m=Mix(35.5); music(m,lambda t:.05 if t>=28.5 else (.02 if 12.2<=t<16.1 else .035),major=True)
for x in subs_times(14): m.add(x,pop,.08)
for x in [3.4,4.9,6.75,8.5]: m.add(x,tone(180,.1,25,'sq'),.2); m.add(x,sweep(900,1500,.1,20),.1)
m.add(12.35,tone(1319,.3,8)+tone(1760,.3,8),.2)
m.add(17.7,tone(1568,.5,5)+tone(2093,.5,5),.22)
m.add(19.9,sweep(300,1200,.8,2),.18)
for k in range(5): m.add(20.7+k*.3,noise(.2,14,k+30),.1)
m.add(24.6,tone(700,.15,12),.15); m.add(25.2,tone(900,.15,12),.15)
endjingle(m,28.5); finish(m,'voice_d14.wav','audio_d14.wav')
