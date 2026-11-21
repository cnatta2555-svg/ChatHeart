function gym(t,red=0){
  return `<rect width="1080" height="1920" fill="${red?'#5a1a2a':'#2f3e57'}"/><rect y="0" width="1080" height="180" fill="${red?'#3d0f1c':'#26334a'}"/>
  <g transform="translate(540,330)"><rect x="-260" y="-70" width="520" height="140" rx="20" fill="#111" stroke="#ff8fa3" stroke-width="6"/><text y="25" text-anchor="middle" font-size="72" font-weight="800" fill="#ff8fa3">FITNESS 💪</text></g>
  <rect x="60" y="520" width="960" height="560" rx="10" fill="#b8d8f0" opacity=".25"/>
  <g transform="translate(160,1200)">${[0,1,2,3].map(i=>`<g transform="translate(0,${i*70})"><rect x="-60" y="-12" width="120" height="24" fill="#888"/><rect x="-80" y="-28" width="30" height="56" rx="6" fill="#333"/><rect x="50" y="-28" width="30" height="56" rx="6" fill="#333"/></g>`).join('')}</g>
  <rect y="1520" width="1080" height="400" fill="${red?'#2a0b14':'#1e2738'}"/>`;
}
const SUBS=[
 [0.2,1.6,'วันที่ 13...'],[1.6,3.5,'ลงสตอรี่รูปไปฟิตเนส 💪'],[3.5,5.1,'ไม่ได้หวังอะไรเลย'],
 [5.2,7.5,'แล้วแจ้งเตือนก็เด้ง... 🔔'],
 [7.6,9.0,'เขา...'],[9.0,10.6,'ไลก์สตอรี่ฉัน!!! ❤️'],
 [10.65,13.2,'หัวใจเต้นแรง\nจนได้ยินเสียง 💓'],
 [13.3,14.5,'หมายความว่าไง?'],[14.5,15.55,'คิดถึงเหรอ?'],[15.55,17.0,'อยากกลับมาเหรอ?'],
 [17.1,18.25,'หรือนิ้วลั่น...'],[18.25,19.9,'เหมือนฉันวันแรก 😅'],
 [20.2,21.5,'คิดจนตีสาม...'],[21.5,23.8,'ทั้งที่เขาคงหลับ\nไปตั้งแต่สี่ทุ่ม 😴'],
 [24.0,25.5,'จบวันที่ 13'],[25.5,27.2,'มูฟออนตกลงไป...'],[27.2,28.9,'ติดลบ 15% 📉'],
];
const END=36;
const moveon=t=>t<27.4?5:-15;
function lock(t){return `<rect x="226" y="276" width="628" height="1368" rx="58" fill="#1d2b53"/><text x="540" y="560" text-anchor="middle" font-size="150" font-weight="300" fill="#fff">22:47</text><text x="540" y="630" text-anchor="middle" font-size="38" fill="#cfd6ff">วันพุธ</text>`;}
function heartBig(t,cx,cy,base,col='#ff3b5c'){const b=1+.18*Math.max(0,Math.sin(t*9))**8+.1*Math.max(0,Math.sin(t*9-.6))**8;return `<g transform="translate(${cx},${cy}) scale(${base*b})"><path d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="${col}" stroke="${OL}" stroke-width="4"/></g>`;}
function ecg(t){let d='M0,1700';for(let x=0;x<=1080;x+=10){const p=((x/1080*3+t*1.5)%1);const y=p>.45&&p<.5?-160:p>.5&&p<.55?90:0;d+=` L${x},${1700+y}`;}return `<path d="${d}" stroke="#7ee0b5" stroke-width="8" fill="none"/>`;}
function qBubble(x,y,txt,k){return `<g transform="translate(${x},${y}) scale(${back(k)})"><ellipse rx="${txt.length*15+50}" ry="72" fill="#fff" stroke="${OL}" stroke-width="7"/><text y="16" text-anchor="middle" font-size="40" font-weight="800" fill="${OL}">${txt}</text></g>`;}
function scene(t){
  let s='';
  if(t<5.15){ const fl=t>1.7&&t<1.85?.8:0;
    s=Wz(t,gym(t)+me({t,expr:'happy',pose:'phone',x:540,y:1300,s:.9,mush:true,band:true,talk:true})+(t>=2.2?label(540,580,'✓ แชร์สตอรี่แล้ว',P(t,2.2,.3),-4):'')+`<rect width="1080" height="1920" fill="#fff" opacity="${fl}"/>`); }
  else if(t<7.55){ s=Wz(t-5.15,phone(t,lock(t)+(t>=5.6?notif(540,820,P(t,5.6,.4),'ถูกใจสตอรี่ของคุณ ❤️'):''))); }
  else if(t<10.6){ const z=t<9.0?1+ease(P(t,7.6,1.4))*.3:1.3;
    s=`<g transform="translate(540,900) scale(${z}) translate(-540,-900)">`+rays(t,'#ff3b5c','#ff8fa3',540,800,.45)+me({t,expr:'shock',pose:'face',x:540,y:1300,s:.95,mush:true,shake:t>=9.0?9:2})+`</g>`
      +(t>=9.0?heartBig(t,540,500,4*back(P(t,9.0,.3)),'#a4133c'):''); }
  else if(t<13.25){ s=Wz(t-10.6,`<rect width="1080" height="1920" fill="#2a1030"/>`+me({t,expr:'shock',pose:'down',x:540,y:1250,s:.95,mush:true})+heartBig(t,540,1230,2.4)+ecg(t)+`<text x="850" y="600" font-size="80" font-weight="800" fill="#ff8fa3" opacity="${Math.max(0,Math.sin(t*9))}">ตุบ!</text><text x="140" y="700" font-size="80" font-weight="800" fill="#ff8fa3" opacity="${Math.max(0,Math.sin(t*9-.6))}">ตุบ!</text>`); }
  else if(t<20.1){ const flash=t>=18.3;
    s=Wz(t-13.25,`<rect width="1080" height="1920" fill="#4b2c7a"/>`+Array.from({length:6}).map((_,i)=>`<circle cx="540" cy="900" r="${(i*180+t*150)%1100}" fill="none" stroke="#6b4aa0" stroke-width="30"/>`).join('')
      +me({t,expr:t<17.1?'sweat':'neutral',pose:'face',x:540,y:1350,s:.85,mush:true,sweatDrop:true,talk:true})
      +(t>=13.35?qBubble(400,430,'หมายความว่าไง?',P(t,13.35,.3)):'')+(t>=14.6?qBubble(700,600,'คิดถึงเหรอ?',P(t,14.6,.3)):'')+(t>=15.65?qBubble(410,780,'อยากกลับมาเหรอ?',P(t,15.65,.3)):'')
      +(t>=17.15?qBubble(690,950,'หรือนิ้วลั่น 👆',P(t,17.15,.3)):'')
      +(flash?`<g transform="translate(540,1700) rotate(-4) scale(${back(P(t,18.3,.3))})"><rect x="-230" y="-80" width="460" height="160" rx="12" fill="#fff" stroke="${OL}" stroke-width="6"/><text y="-10" text-anchor="middle" font-size="36" fill="#666">ย้อนไป Day 1...</text><text y="50" text-anchor="middle" font-size="44" font-weight="800" fill="#ff3b5c">❤️ นิ้วลั่นกดไลก์</text></g>`:'')); }
  else if(t<23.95){ s=Wz(t-20.1,bedHead(t,{mush:true,eyesKind:'open'})+`<g transform="translate(250,560)"><rect x="-150" y="-70" width="300" height="140" rx="16" fill="#111" stroke="#444" stroke-width="6"/><text y="28" text-anchor="middle" font-size="84" font-weight="700" fill="#ff4d6d">03:00</text></g>`
      +(t>=21.5?`<g transform="translate(790,560) scale(${back(P(t,21.5,.35))})"><circle cx="-160" cy="130" r="16" fill="#fff"/><circle cx="-120" cy="90" r="26" fill="#fff"/><ellipse rx="190" ry="120" fill="#fff"/><circle cx="-40" cy="0" r="50" fill="#6b5b7b"/><text x="60" y="20" font-size="60">😴</text><text y="85" text-anchor="middle" font-size="34" fill="#666">หลับตั้งแต่ 22:00</text></g>`:'')); }
  else if(t<29.0){ const v=Math.round(5-20*ease(P(t,27.2,.7))), neg=v<0;
    s=Wz(t-23.95,`<rect width="1080" height="1920" fill="${neg?'#3a1020':'#1b2340'}"/>`+gauge(t,23.95,v,neg?'#ff3b5c':'#2e7d5b')+me({t,expr:neg?'cry':'sad',pose:'down',x:540,y:1500,s:.75,mush:true,tears:neg,talk:!neg})+(neg?`<text x="850" y="${560+((t*200)%300)}" font-size="90">📉</text>`:'')); }
  else s=endCard(t,29.0,'วันที่ 14 เริ่มแล้ว',17,'ตอนหน้า: สรุปสัปดาห์ที่ 2 📊',30.85,'ตอบหรือไม่ตอบ...?',31.6,33.0);
  return finish(t,s,18,29.0,moveon,[27.4]);
}
