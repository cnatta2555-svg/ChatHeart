const SUBS=[
 [0.2,1.25,'วันที่ 9...'],[1.25,2.5,'สมัครฟิตเนส 💪'],[2.5,4.3,'จะกลับไปให้เขาเสียดาย!'],
 [4.4,5.8,'ยกดัมเบลหนึ่งกิโล...'],[5.8,7.6,'แขนสั่นเหมือนเจ้าเข้า'],
 [7.8,9.3,'วิ่งได้สามนาที...'],[9.3,11.0,'เห็นภาพแฟนเก่าลอยมา 👻'],
 [11.1,13.9,'เลยวิ่งต่ออีกสิบนาที\nด้วยความแค้น 🔥'],
 [14.1,15.3,'แต่เช้านี้...'],[15.3,16.7,'ลุกจากเตียงไม่ได้'],[16.7,18.8,'ปวดทุกอณู\nของร่างกาย 😵'],
 [18.9,19.7,'แต่แปลกนะ...'],[19.7,21.3,'ใจมันเบาขึ้นนิดนึง 🪶'],
 [21.4,22.2,'จบวันที่ 9'],[22.2,24.3,'มูฟออนติดลบ 10%'],
];
const END=30;
const moveon=t=>t<22.4?-15:-10;
function gym(t,red=0){
  return `<rect width="1080" height="1920" fill="${red?'#5a1a2a':'#2f3e57'}"/><rect y="0" width="1080" height="180" fill="${red?'#3d0f1c':'#26334a'}"/>
  <g transform="translate(540,330)"><rect x="-260" y="-70" width="520" height="140" rx="20" fill="#111" stroke="#ff8fa3" stroke-width="6"/><text y="25" text-anchor="middle" font-size="72" font-weight="800" fill="#ff8fa3">FITNESS 💪</text></g>
  <rect x="60" y="520" width="960" height="560" rx="10" fill="#b8d8f0" opacity=".25"/>
  <g transform="translate(160,1200)">${[0,1,2,3].map(i=>`<g transform="translate(0,${i*70})"><rect x="-60" y="-12" width="120" height="24" fill="#888"/><rect x="-80" y="-28" width="30" height="56" rx="6" fill="#333"/><rect x="50" y="-28" width="30" height="56" rx="6" fill="#333"/></g>`).join('')}</g>
  <rect y="1520" width="1080" height="400" fill="${red?'#2a0b14':'#1e2738'}"/>`;
}
function dumbbell(x,y){return `<g transform="translate(${x},${y})"><rect x="-55" y="-10" width="110" height="20" fill="#999" stroke="${OL}" stroke-width="4"/><rect x="-75" y="-28" width="28" height="56" rx="6" fill="#ff8fa3" stroke="${OL}" stroke-width="5"/><rect x="47" y="-28" width="28" height="56" rx="6" fill="#ff8fa3" stroke="${OL}" stroke-width="5"/><text y="-38" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">1kg</text></g>`;}
function treadmill(t,time,red){
  return `<g><path d="M200,1560 L880,1560 L920,1640 L160,1640Z" fill="#333" stroke="${OL}" stroke-width="8"/>${Array.from({length:8}).map((_,i)=>`<path d="M${((i*100-t*900)%800+800)%800+180},1575 v50" stroke="#555" stroke-width="10"/>`).join('')}
  <path d="M820,1560 L860,1080" stroke="#555" stroke-width="22" stroke-linecap="round"/><rect x="740" y="1000" width="230" height="110" rx="14" fill="#111" stroke="#666" stroke-width="6"/><text x="855" y="1075" text-anchor="middle" font-size="56" font-weight="700" fill="${red?'#ff3b5c':'#7ee0b5'}">${time}</text></g>`;
}
function flames(t){return Array.from({length:9}).map((_,i)=>{const h=220+80*Math.sin(t*12+i*1.7);return `<path d="M${60+i*120},1540 q-50,-${h*.5} 0,-${h} q50,${h*.5} 0,${h}Z" fill="${i%2?'#ff6a3d':'#ffd166'}" opacity=".85"/>`;}).join('');}
function exGhost(t,k){return `<g transform="translate(${280+Math.sin(t*2)*60},${720+Math.cos(t*3)*20}) scale(${back(k)})" opacity=".85"><path d="M-90,60 Q-100,-120 0,-120 Q100,-120 90,60 L60,30 L30,60 L0,30 L-30,60 L-60,30Z" fill="#e8e3f7" stroke="${OL}" stroke-width="6"/><circle cx="-30" cy="-40" r="10" fill="${OL}"/><circle cx="30" cy="-40" r="10" fill="${OL}"/><text y="-140" text-anchor="middle" font-size="40" fill="#fff">แฟนเก่า</text></g>`;}
function scene(t){
  let s='';
  if(t<4.35){ s=Wz(t,gym(t)+me({t,expr:'determined',pose:'fist',x:540,y:1300,s:.9,mush:true,band:true})
    +(t>=2.5?label(540,600,'ให้เขาเสียดาย 😤',P(t,2.5,.3),-4):'')); }
  else if(t<7.7){ const lt=t-4.35, sh=t>=5.8?7:2;
    const by=1300+Math.sin(t*3.5)*7, up=Math.sin(t*1.5)*20;
    s=Wz(lt,gym(t)+me({t,expr:'sweat',pose:'fist',x:540,y:1300,s:.9,mush:true,band:true,shake:sh,sweatDrop:true})
      +dumbbell(540-250*.9+(Math.sin(t*70)*sh),by-200*.9-60+up)+dumbbell(540+250*.9+(Math.sin(t*70)*sh),by-200*.9-60-up)
      +(t>=5.8?`<text x="150" y="650" font-size="80" opacity="${.5+.5*Math.sin(t*20)}">⚡</text><text x="880" y="700" font-size="80" opacity="${.5+.5*Math.cos(t*20)}">⚡</text>`:'')); }
  else if(t<11.05){ const lt=t-7.7, mm=Math.min(3,Math.floor(lt*1.2));
    s=Wz(lt,gym(t)+me({t:t*2.2,expr:t<9.3?'sweat':'shock',pose:'fist',x:500,y:1230,s:.85,mush:true,band:true,sweatDrop:true})+treadmill(t,`0${mm}:${String(Math.floor((lt*40)%60)).padStart(2,'0')}`,false)
      +(t>=9.3?exGhost(t,P(t,9.3,.4)):'')); }
  else if(t<14.0){ const lt=t-11.05, mm=3+Math.floor(lt*3.4);
    s=Wz(lt,gym(t,1)+flames(t)+me({t:t*3.5,expr:'determined',pose:'fist',x:500,y:1230,s:.85,mush:true,band:true,shake:5})+treadmill(t*2.2,`${String(Math.min(13,mm)).padStart(2,'0')}:${String(Math.floor((lt*97)%60)).padStart(2,'0')}`,true)
      +Array.from({length:8}).map((_,i)=>`<path d="M${80+(i*130)%300},${700+i*90} h-${150+i*20}" stroke="#ffd166" stroke-width="8" opacity=".5" stroke-linecap="round"/>`).join('')); }
  else if(t<18.85){ const lt=t-14.0, pain=t>=15.3;
    s=Wz(lt,bedHead(t,{mush:true,eyesKind:pain?'pain':'sleep',morning:true})
      +(pain?[[300,950],[780,980],[540,820]].map(([x,y],i)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${70+10*Math.sin(t*15+i)}">⚡</text>`).join(''):'')
      +(t>=16.7?label(540,600,'ปวด 100% 😵',P(t,16.7,.3),-4):'')); }
  else if(t<21.35){ const lt=t-18.85, k=(t*.4)%1;
    s=Wz(lt,bedroom(t,0)+`<rect width="1080" height="1920" fill="#ffd8a8" opacity=".3"/><circle cx="950" cy="345" r="60" fill="#ffd166"/>`
      +me({t,expr:t<19.7?'neutral':'happy',pose:'down',x:540,y:1300,s:.9,mush:true,talk:true})
      +(t>=19.7?`<text x="${250+Math.sin(t*2)*80}" y="${900-k*400}" font-size="110" opacity="${1-k}">🪶</text><text x="${820+Math.cos(t*2)*60}" y="${1000-((k+.5)%1)*400}" font-size="90" opacity="${1-((k+.5)%1)}">🪶</text>`:'')); }
  else if(t<24.4){ s=Wz(t-21.35,bedHead(t,{mush:true})+label(300,700,'พรุ่งนี้ไปอีก 💪',P(t,21.6,.3))); }
  else s=endCard(t,24.4,'วันที่ 10 เริ่มแล้ว',21,'ตอนหน้า: กดอันฟอลโลว์เขา 👆',26.2,'ทำได้ไหม...?',26.9,28.0);
  return finish(t,s,22,24.4,moveon,[22.4]);
}
