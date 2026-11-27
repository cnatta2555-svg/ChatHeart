const SUBS=[
 [0.0,1.5,'วันที่ 26...'],[2.5,4.4,'ตื่นมาแล้วรู้สึกแปลกๆ 🤔'],
 [4.5,7.3,'ลองเปิดเพลงที่เคยร้องคู่กัน...'],[7.3,8.85,'เฉยๆ 😐'],
 [8.9,10.95,'ลองนึกถึงหน้าเขา...'],[10.95,12.85,'ก็เฉยๆ 😐'],
 [12.9,15.3,'เดินผ่านร้านหมูกระทะร้านเดิม...'],[15.3,17.1,'แค่รู้สึกหิว 🤤'],
 [17.15,20.3,'เพื่อนถามว่า "หายแล้วเหรอ?"'],[20.3,21.6,'ไม่รู้สิ...'],[21.6,23.8,'แต่ทั้งวันไม่ได้นึกถึงเขาเลย'],[23.8,25.9,'จนถึงตอนนี้แหละ 😅'],
 [26.0,27.9,'จบวันที่ 26'],[27.9,30.0,'มูฟออน 80%'],
];
const END=37.5;
const moveon=t=>t<28.2?65:80;
function porkShop(t){return `<rect width="1080" height="1920" fill="#3b2a4f"/><rect x="80" y="300" width="920" height="1200" rx="20" fill="#5a3a26"/><rect x="140" y="560" width="800" height="700" fill="#ffd8a8" opacity=".85"/>
 <rect x="180" y="330" width="720" height="190" rx="16" fill="#e63946" stroke="#fff" stroke-width="8"/><text x="540" y="450" text-anchor="middle" font-size="96" font-weight="800" fill="#fff">หมูกระทะ 🔥</text>
 ${[0,1,2].map(i=>{const k=(t*.6+i/3)%1;return `<circle cx="${350+i*190}" cy="${1000-k*400}" r="${50+k*60}" fill="#fff" opacity="${.4*(1-k)}"/>`}).join('')}<rect y="1500" width="1080" height="420" fill="#8c8c9e"/>`;}
function scene(t){
  let s='';
  if(t<4.4){ s=Wz(t,bedHead(t,{mush:true,eyesKind:'open',morning:true})+`<text x="${780+Math.sin(t*3)*20}" y="700" font-size="140" font-weight="800" fill="#7c6cd6">?</text>`); }
  else if(t<8.85){ const flat=t>=7.3;
    s=Wz(t-4.4,rays(t,'#4a6fa5','#6d8fc4',540,900,.3)+`<g transform="translate(540,520) scale(${back(P(t,4.5,.3))*.8})"><rect x="-260" y="-200" width="520" height="400" rx="30" fill="#ff5c8a"/><text y="20" text-anchor="middle" font-size="150">🎤</text><text y="150" text-anchor="middle" font-size="44" font-weight="800" fill="#fff">เพลงของเรา (Duet)</text></g>`
      +me({t,expr:'neutral',pose:'down',x:540,y:1450,s:.9,mush:true})+headphones(540,1450,.9,t)+(flat?`<text x="850" y="1100" font-size="120">😐</text>`:'')); }
  else if(t<12.9){ s=Wz(t-8.85,bedroom(t)+me({t,expr:'neutral',pose:'down',x:540,y:1350,s:.9,mush:true})+`<g transform="translate(760,560) scale(${back(P(t,9.0,.35))})"><circle cx="-180" cy="150" r="20" fill="#fff"/><circle cx="-130" cy="100" r="32" fill="#fff"/><ellipse rx="230" ry="170" fill="#fff"/><g transform="translate(0,70) scale(.35)">${who({t,expr:'happy',pose:'down',x:0,y:300,s:1,male:true},'ex')}</g></g>`+(t>=10.95?`<text x="200" y="700" font-size="120">😐</text>`:'')); }
  else if(t<17.15){ s=Wz(t-12.9,porkShop(t)+me({t,expr:t<15.3?'neutral':'happy',pose:'down',x:540+(t-12.9)*-30,y:1500,s:.85,mush:true,talk:true})+(t>=15.3?`<text x="760" y="1180" font-size="120">🤤</text>`:'')); }
  else if(t<26.0){ const real=t>=21.6;
    s=Wz(t-17.15,(real?rays(t,'#ffd8a8','#ffe8c7',540,800,.55):`<rect width="1080" height="1920" fill="#e9d5c0"/><rect y="1480" width="1080" height="440" fill="#8b5e34"/>`)
      +(t<21.6?who({t,expr:'happy',pose:'down',x:250,y:1330,s:.8,talk:t<20.3},'f2')+(t>=17.2&&t<20.3?speech(380,560,'หายแล้วเหรอ? 🤔',P(t,17.2,.3)):''):'')
      +me({t,expr:real?'happy':'neutral',pose:'down',x:real?540:780,y:1330,s:.85,mush:true,talk:t>=20.3})+(real?sparkles(t,[[230,600],[850,640],[220,1000],[870,1000]]):'')); }
  else if(t<30.1){ s=gaugeScene(t,26.0,65,80,28.2); }
  else s=endCard(t,30.1,'วันที่ 27 เริ่มแล้ว',4,'ตอนหน้า: เดตครั้งแรก ☕',32.6,'ใจจะเต้นไหม...?',33.55,35.0);
  return finish(t,s,5,30.1,moveon,[28.2]);
}

function headphones(x,y,s,t){return `<g transform="translate(${x},${y+Math.sin(t*3.5)*7}) scale(${s})"><path d="M-178,-330 Q-190,-560 0,-560 Q190,-560 178,-330" fill="none" stroke="${OL}" stroke-width="40" stroke-linecap="round"/><path d="M-178,-330 Q-190,-560 0,-560 Q190,-560 178,-330" fill="none" stroke="#7c6cd6" stroke-width="24" stroke-linecap="round"/><rect x="-215" y="-400" width="70" height="140" rx="30" fill="#7c6cd6" stroke="${OL}" stroke-width="8"/><rect x="145" y="-400" width="70" height="140" rx="30" fill="#7c6cd6" stroke="${OL}" stroke-width="8"/></g>`;}
