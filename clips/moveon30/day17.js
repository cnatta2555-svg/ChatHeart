function gym(t,red=0){
  return `<rect width="1080" height="1920" fill="${red?'#5a1a2a':'#2f3e57'}"/><rect y="0" width="1080" height="180" fill="${red?'#3d0f1c':'#26334a'}"/>
  <g transform="translate(540,330)"><rect x="-260" y="-70" width="520" height="140" rx="20" fill="#111" stroke="#ff8fa3" stroke-width="6"/><text y="25" text-anchor="middle" font-size="72" font-weight="800" fill="#ff8fa3">FITNESS 💪</text></g>
  <rect x="60" y="520" width="960" height="560" rx="10" fill="#b8d8f0" opacity=".25"/>
  <g transform="translate(160,1200)">${[0,1,2,3].map(i=>`<g transform="translate(0,${i*70})"><rect x="-60" y="-12" width="120" height="24" fill="#888"/><rect x="-80" y="-28" width="30" height="56" rx="6" fill="#333"/><rect x="50" y="-28" width="30" height="56" rx="6" fill="#333"/></g>`).join('')}</g>
  <rect y="1520" width="1080" height="400" fill="${red?'#2a0b14':'#1e2738'}"/>`;
}
function treadmill(t,time,red){
  return `<g><path d="M200,1560 L880,1560 L920,1640 L160,1640Z" fill="#333" stroke="${OL}" stroke-width="8"/>${Array.from({length:8}).map((_,i)=>`<path d="M${((i*100-t*900)%800+800)%800+180},1575 v50" stroke="#555" stroke-width="10"/>`).join('')}
  <path d="M820,1560 L860,1080" stroke="#555" stroke-width="22" stroke-linecap="round"/><rect x="740" y="1000" width="230" height="110" rx="14" fill="#111" stroke="#666" stroke-width="6"/><text x="855" y="1075" text-anchor="middle" font-size="56" font-weight="700" fill="${red?'#ff3b5c':'#7ee0b5'}">${time}</text></g>`;
}
const SUBS=[
 [0.1,1.1,'วันที่ 17...'],[1.1,2.6,'ไปฟิตเนสเหมือนเดิม'],
 [2.65,4.45,'แล้วหนุ่มลู่วิ่งข้างๆ...'],[4.45,6.2,'หันมายิ้มให้!! 😳'],
 [6.25,7.35,'ใจเต้นแรง...'],[7.35,9.2,'แบบที่ไม่ได้เต้น\nมานานแล้ว 💓'],
 [9.3,11.1,'ยิ้มกลับไปอย่างมั่นใจ 😎'],[11.1,12.45,'แล้วก็...'],[12.45,14.0,'ตกลู่วิ่ง!!!'],
 [14.1,15.8,'เขาเข้ามาช่วยพยุง'],[15.8,16.7,'หน้าแตก...'],[16.7,18.2,'แต่ได้จับมือ 🤝💕'],
 [18.3,19.5,'จบวันที่ 17'],[19.5,22.2,'มูฟออน 30%'],
];
const END=29.5;
const moveon=t=>t<19.9?20:30;
function scene(t){
  let s='';
  const guy=(o)=>who({t,expr:'happy',pose:'fist',x:800,y:1230,s:.8,male:true,...o},'guy');
  if(t<2.6){ s=Wz(t,gym(t)+me({t:t*2,expr:'neutral',pose:'fist',x:540,y:1230,s:.85,mush:true,band:true,talk:true})+treadmill(t,'05:20',false)); }
  else if(t<6.2){ const smile=t>=4.45;
    s=Wz(t-2.6,gym(t)+`<g transform="translate(-250,0)">`+me({t:t*2,expr:smile?'shock':'neutral',pose:'fist',x:540,y:1230,s:.8,mush:true,band:true})+treadmill(t,'06:02',false)+`</g>`+guy({t:t*2,expr:smile?'happy':'neutral'})
      +(smile?sparkles(t,[[740,720],[870,760]],'#fff')+`<text x="900" y="640" font-size="70">✨</text>`:'')); }
  else if(t<9.25){ const k=(t*.5)%1;
    s=Wz(t-6.2,rays(t,'#ff8fa3','#ffc2d1',540,900,.5)+me({t,expr:'happy',pose:'face',x:540,y:1280,s:.95,mush:true,band:true},`<ellipse cx="-100" cy="-268" rx="55" ry="28" fill="#ff4d6d" opacity=".7"/><ellipse cx="100" cy="-268" rx="55" ry="28" fill="#ff4d6d" opacity=".7"/>`)
      +[0,1,2,3,4].map(i=>{const q=(t*.6+i/5)%1;return `<path transform="translate(${200+i*170},${1100-q*700}) scale(${.6+.3*Math.sin(t*9)})" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff3b5c" opacity="${1-q}"/>`}).join('')); }
  else if(t<12.4){ s=Wz(t-9.25,gym(t)+`<g transform="translate(-250,0)">`+me({t:t*3,expr:'happy',pose:'fist',x:540,y:1230,s:.8,mush:true,band:true,talk:t<11.1,shake:t>=11.1?4:0})+treadmill(t*(1+P(t,11.1,1)*2),'06:40',t>=11.1)+`</g>`+guy({t:t*2})); }
  else if(t<14.05){ const k=ease(P(t,12.45,.5));
    s=Wz(t-12.4,gym(t)+`<g transform="translate(-250,0)">`+treadmill(t*3,'ERR',true)+`</g>`+me({t,expr:'scream',pose:'face',x:300-k*80,y:1230+k*250,s:.8,mush:true,band:true,tilt:-85*k})
      +`<text x="540" y="700" text-anchor="middle" font-size="${120+20*Math.sin(t*20)}" font-weight="800" fill="#ffd166" stroke="${OL}" stroke-width="10" paint-order="stroke" opacity="${P(t,12.7,.2)}">ตุ้บ!!</text>`); }
  else if(t<18.25){ const hold=t>=16.7;
    s=Wz(t-14.05,gym(t)+me({t,expr:t<15.8?'sweat':'happy',pose:'down',x:400,y:1300,s:.8,mush:true,band:true,sweatDrop:t<15.8},`<ellipse cx="-100" cy="-268" rx="55" ry="28" fill="#ff4d6d" opacity="${hold?.7:.3}"/><ellipse cx="100" cy="-268" rx="55" ry="28" fill="#ff4d6d" opacity="${hold?.7:.3}"/>`)
      +who({t,expr:'happy',pose:'down',x:760,y:1250,s:.85,male:true,talk:false},'guy')+`<circle cx="${hold?585:620}" cy="1480" r="34" fill="#f6c9a4" stroke="${OL}" stroke-width="7"/>`
      +(hold?`<path transform="translate(585,1360) scale(${.8+.15*Math.sin(t*9)})" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff3b5c" stroke="${OL}" stroke-width="5"/>`:'')); }
  else if(t<22.35){ s=gaugeScene(t,18.25,20,30,19.9); }
  else s=endCard(t,22.35,'วันที่ 18 เริ่มแล้ว',13,'ตอนหน้า: โหลดแอปหาคู่ 📲',24.15,'จะเจอใครบ้าง...?',25.05,26.6);
  return finish(t,s,14,22.35,moveon,[19.9]);
}
