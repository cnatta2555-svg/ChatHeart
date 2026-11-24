const SUBS=[
 [0.1,1.8,'วันที่ 23...'],[1.8,4.5,'ข้อความยังอยู่\nยังไม่ได้ตอบ 📩'],
 [4.6,6.0,'นางฟ้าบอกว่า... 😇'],[6.0,9.1,'"ตอบไปสุภาพๆ ก็ได้\nไม่เสียหาย"'],
 [9.15,10.5,'นางมารบอกว่า... 😈'],[10.5,13.7,'"อ่านแล้วไม่ตอบ\nให้เขารู้ว่ามันเจ็บยังไง"'],
 [13.9,15.8,'สองคนนี้เถียงกันทั้งคืน'],[15.8,17.4,'ฉันนอนไม่หลับเลย 😵'],
 [17.5,18.7,'เพื่อนบอกว่า...'],[18.7,19.8,'"อย่าตอบ!!" 🙅'],[19.8,20.8,'แม่บอกว่า...'],[20.8,22.5,'"ทำตามใจลูก" ❤️'],
 [22.6,24.5,'ถ้าเป็นคุณ จะตอบไหม?'],[24.5,27.8,'คอมเมนต์ "ตอบ" หรือ\n"ไม่ตอบ" มาเลย 👇'],
 [28.1,29.7,'จบวันที่ 23'],[29.7,32.3,'มูฟออน 35%'],
];
const END=39.5;
const moveon=t=>t<30.0?30:35;
const halo=`<ellipse cx="0" cy="-560" rx="110" ry="26" fill="none" stroke="#ffd166" stroke-width="16"/><path d="M-200,-60 Q-420,-200 -330,40 Q-300,-20 -200,20Z M200,-60 Q420,-200 330,40 Q300,-20 200,20Z" fill="#fff" stroke="${OL}" stroke-width="7"/>`;
const horns=`<path d="M-110,-470 L-150,-600 L-50,-490Z M110,-470 L150,-600 L50,-490Z" fill="#c1121f" stroke="${OL}" stroke-width="7"/><path d="M200,250 Q380,200 330,60 L370,40 L340,100" stroke="#c1121f" stroke-width="16" fill="none" stroke-linecap="round"/>`;
function scene(t){
  let s='';
  if(t<4.55){ s=Wz(t,bedroom(t)+me({t,expr:'sad',pose:'phone',x:540,y:1250,s:.95,mush:true,glow:true,talk:true})+`<g transform="translate(640,1110)"><circle r="34" fill="#ff3b5c" stroke="#fff" stroke-width="5"/><text y="12" text-anchor="middle" font-size="36" font-weight="800" fill="#fff">1</text></g>`); }
  else if(t<9.15){ s=Wz(t-4.55,bedroom(t,.2)+me({t,expr:'neutral',pose:'phone',x:380,y:1350,s:.85,mush:true,glow:true})+who({t,expr:'happy',pose:'down',x:780,y:900+Math.sin(t*3)*20,s:.45,talk:t>=6.0},'angel',halo)+`<rect width="1080" height="1920" fill="#fff6c9" opacity=".12"/>`); }
  else if(t<13.75){ s=Wz(t-9.15,bedroom(t,.4)+me({t,expr:'neutral',pose:'phone',x:700,y:1350,s:.85,mush:true,glow:true})+who({t,expr:'determined',pose:'fist',x:280,y:900+Math.sin(t*3)*20,s:.45,talk:true},'devil',horns)+`<rect width="1080" height="1920" fill="#c1121f" opacity=".1"/>`); }
  else if(t<17.45){ const dust=Array.from({length:10}).map((_,i)=>`<circle cx="${540+Math.cos(i+t*4)*170}" cy="${700+Math.sin(i*2+t*5)*110}" r="${50+20*Math.sin(t*9+i)}" fill="#e8e3d9" opacity=".85"/>`).join('');
    s=Wz(t-13.75,bedHead(t,{mush:true,eyesKind:'open'})+dust+who({t:t*3,expr:'happy',pose:'fist',x:400+Math.sin(t*9)*30,y:780,s:.35,shake:6},'angel',halo)+who({t:t*3,expr:'determined',pose:'fist',x:680+Math.cos(t*9)*30,y:780,s:.35,shake:6},'devil',horns)
      +`<text x="540" y="560" text-anchor="middle" font-size="70">💥⭐💢</text>`); }
  else if(t<19.85){ s=Wz(t-17.45,phone(t,`<rect x="226" y="276" width="628" height="150" fill="#f3f3f3"/><circle cx="300" cy="370" r="40" fill="#6cc4a1"/><text x="360" y="385" font-size="40" font-weight="700" fill="#222">พี่ฝน 💚</text>`+(t>=18.7?`<g transform="translate(300,600) scale(${back(P(t,18.7,.35))})"><rect width="420" height="320" rx="30" fill="#ffe3ec"/><text x="210" y="190" text-anchor="middle" font-size="130">🙅</text><text x="210" y="280" text-anchor="middle" font-size="48" font-weight="800" fill="#ff3b5c">อย่าตอบ!!</text></g>`:''))); }
  else if(t<22.55){ s=Wz(t-19.85,`<rect width="1080" height="1920" fill="#ffe8b8"/><rect y="1500" width="1080" height="420" fill="#d9a066"/>`+who({t,expr:'happy',pose:'down',x:540,y:1280,s:.95,talk:t>=20.8},'mom')+(t>=20.8?`<path transform="translate(540,560) scale(${1.6*back(P(t,20.8,.35))})" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff3b5c"/>`:'')); }
  else if(t<28.1){ const vote=(x,col,txt,k)=>`<g transform="translate(${x},560) scale(${back(k)})"><rect x="-200" y="-90" width="400" height="180" rx="40" fill="${col}" stroke="#fff" stroke-width="8"/><text y="25" text-anchor="middle" font-size="64" font-weight="800" fill="#fff">${txt}</text></g>`;
    s=Wz(t-22.55,rays(t,'#7c6cd6','#9b8cf0',540,900)+vote(290,'#3b82f6','ตอบ 💬',P(t,24.6,.3))+vote(790,'#ff3b5c','ไม่ตอบ 🙅',P(t,25.6,.3))+me({t,expr:'happy',pose:'down',x:540,y:1350,s:1.1,mush:true,talk:true})); }
  else if(t<32.5){ s=gaugeScene(t,28.1,30,35,30.0); }
  else s=endCard(t,32.5,'วันที่ 24 เริ่มแล้ว',7,'ตอนหน้า: ฉันตัดสินใจแล้ว ✍️',34.8,'จะเลือกทางไหน...?',35.5,37.0);
  return finish(t,s,8,32.5,moveon,[30.0]);
}
