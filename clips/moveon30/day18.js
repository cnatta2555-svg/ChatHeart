const SUBS=[
 [0.1,1.2,'วันที่ 18...'],[1.2,3.2,'เพื่อนยุให้โหลดแอปหาคู่ 📲'],
 [3.25,4.1,'ปัดซ้าย...'],[4.1,4.95,'ปัดซ้าย...'],[4.95,5.95,'ปัดขวา! 💚'],
 [6.0,6.9,'แมตช์แล้ว!!'],[6.9,7.95,'เขาทักมาเลย'],
 [7.95,9.1,'ประโยคแรก...'],[9.1,11.8,'"น้องสนใจธุรกิจ\nเครือข่ายไหมครับ" 💼'],
 [11.9,12.8,'คนที่สอง...'],[12.8,14.65,'รูปในแอปหล่อมาก 😍'],[14.65,15.7,'ตัวจริงคือ...'],[15.7,18.0,'รูปจากเมื่อสิบปีก่อน 👴'],
 [18.15,19.3,'สรุป...'],[19.3,20.4,'ลบแอปทิ้ง!'],[20.4,22.4,'ขอใช้ชีวิตแบบออฟไลน์\nไปก่อน 📴'],
 [22.5,23.6,'จบวันที่ 18'],[23.6,26.2,'มูฟออน 25%'],
];
const END=33;
const moveon=t=>t<23.9?30:25;
function card(x,rot,pal,name,op=1){return `<g transform="translate(${x},960) rotate(${rot})" opacity="${op}"><rect x="-260" y="-420" width="520" height="760" rx="30" fill="#fff" stroke="#ddd" stroke-width="5"/><rect x="-240" y="-400" width="480" height="560" rx="20" fill="${['#cde7ff','#ffe5a8','#d8f3dc'][name.length%3]}"/><g transform="translate(0,-70) scale(.55)">${who({t:0,expr:'happy',pose:'down',x:0,y:300,s:1,male:true},pal)}</g><text x="-230" y="230" font-size="48" font-weight="800" fill="#222">${name}</text></g>`;}
function scene(t){
  let s='';
  if(t<3.2){ s=Wz(t,street(t)+who({t,expr:'happy',pose:'phone',x:250,y:1300,s:.8,talk:true},'f1')+me({t,expr:'sweat',pose:'down',x:740,y:1300,s:.85,mush:true,sweatDrop:true})+`<g transform="translate(500,620) scale(${back(P(t,1.3,.35))})"><rect x="-90" y="-90" width="180" height="180" rx="40" fill="#ff5c8a"/><text y="40" text-anchor="middle" font-size="110">💘</text></g>`); }
  else if(t<5.95){ const sw=(t0,dir)=>{const k=ease(P(t,t0,.4));return [540+dir*k*900,dir*k*25,1-k*.3];};
    const c1=sw(3.35,-1),c2=sw(4.2,-1),c3=sw(5.0,1);
    s=Wz(t-3.2,`<rect width="1080" height="1920" fill="#fff0f5"/>`+card(c3[0],c3[1],'mlm','ต้น, 29')+(t<4.6?card(c2[0],c2[1],'old','สมชาย, 58'):'')+(t<3.75?card(c1[0],c1[1],'guard','บอส, 31'):'')
      +(t>=5.0?`<text x="540" y="1600" text-anchor="middle" font-size="140">💚</text>`:'')+`<text x="540" y="1750" text-anchor="middle" font-size="44" fill="#999">✕ ปัดซ้าย · ปัดขวา ♥</text>`); }
  else if(t<7.95){ s=Wz(t-5.95,rays(t,'#ff5c8a','#ff8fa3',540,900,.5)+`<g transform="translate(540,600) scale(${back(P(t,6.0,.35))})"><text text-anchor="middle" font-size="120" font-weight="800" fill="#fff" stroke="${OL}" stroke-width="10" paint-order="stroke">MATCH! 💘</text></g>`+card(540,0,'mlm','ต้น, 29').replace('translate(540,960)','translate(540,1250) scale(.6)')); }
  else if(t<11.85){ s=Wz(t-7.95,phone(t,`<rect x="226" y="276" width="628" height="150" fill="#f3f3f3"/><circle cx="300" cy="370" r="40" fill="#f4a261"/><text x="360" y="385" font-size="40" font-weight="700" fill="#222">ต้น, 29 💘</text>`
      +(t>=8.1?`<g transform="translate(250,${560})" opacity="${P(t,8.1,.3)}"><rect width="560" height="${t>=9.1?260:100}" rx="36" fill="#eee"/><text x="30" y="65" font-size="38" fill="#222">สวัสดีครับน้อง 😊</text>${t>=9.1?`<text x="30" y="135" font-size="38" fill="#222">น้องสนใจธุรกิจเครือข่ายไหม</text><text x="30" y="195" font-size="38" fill="#222">ครับ 💼💰 รายได้หลักแสน</text>`:''}</g>`:'')
      +(t>=10.2?`<text x="540" y="1200" text-anchor="middle" font-size="200">🔺</text>`:''))); }
  else if(t<14.7){ s=Wz(t-11.85,`<rect width="1080" height="1920" fill="#fff0f5"/>`+card(540,0,'hunk','เจมส์, 25')+sparkles(t,[[260,520],[820,560],[300,1100],[790,1150]],'#ffd166')+(t>=12.9?`<text x="540" y="1600" text-anchor="middle" font-size="90">😍😍😍</text>`:'')); }
  else if(t<18.1){ const real=t>=15.7;
    s=Wz(t-14.7,`<rect width="1080" height="1920" fill="#e8e3d9"/><g transform="translate(260,520) rotate(-6)"><rect x="-170" y="-210" width="340" height="420" rx="14" fill="#fff" stroke="${OL}" stroke-width="6"/><g transform="translate(0,-40) scale(.35)">${who({t:0,expr:'happy',pose:'down',x:0,y:300,s:1,male:true},'hunk')}</g><text y="180" text-anchor="middle" font-size="36" font-weight="700" fill="${OL}">ในแอป 📱</text></g>`
      +(real?who({t,expr:'happy',pose:'down',x:620,y:1320,s:.95,male:true,talk:false},'old',`<path d="M-70,-215 Q-35,-235 0,-220 Q35,-235 70,-215 Q35,-200 0,-208 Q-35,-200 -70,-215Z" fill="#777" stroke="${OL}" stroke-width="5"/><path d="M-130,-150 Q-60,-120 -90,-60 M130,-150 Q60,-120 90,-60" stroke="#c98b6b" stroke-width="5" fill="none" opacity=".6"/>`)+label(760,520,'ตัวจริง 📸',P(t,15.7,.3),5):`<text x="700" y="1100" text-anchor="middle" font-size="200">🚪</text>`)); }
  else if(t<22.45){ const del=t>=19.3, k=P(t,19.4,.6);
    s=Wz(t-18.1,(t<20.4?`<rect width="1080" height="1920" fill="#1b2340"/>`:rays(t,'#7ee0b5','#b8f2d9',540,900,.5))
      +(t<20.4?`<g transform="translate(540,700) rotate(${del?0:Math.sin(t*25)*6}) scale(${1-k})"><rect x="-150" y="-150" width="300" height="300" rx="66" fill="#ff5c8a"/><text y="60" text-anchor="middle" font-size="170">💘</text><circle cx="140" cy="-140" r="44" fill="#ff3b5c" stroke="#fff" stroke-width="6"/><path d="M118,-162 L162,-118 M162,-162 L118,-118" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>`+(del?Array.from({length:12}).map((_,i)=>{const a=i/12*Math.PI*2;return `<circle cx="${540+Math.cos(a)*k*300}" cy="${700+Math.sin(a)*k*300}" r="${20*(1-k)+2}" fill="#ff8fa3" opacity="${1-k}"/>`}).join(''):''):`<text x="540" y="620" text-anchor="middle" font-size="160">📴📚☕</text>`)
      +me({t,expr:t<20.4?'determined':'happy',pose:t<20.4?'down':'fist',x:540,y:1450,s:.85,mush:true,talk:true})); }
  else if(t<26.3){ s=gaugeScene(t,22.45,30,25,23.9); }
  else s=endCard(t,26.3,'วันที่ 19 เริ่มแล้ว',12,'ตอนหน้า: เพื่อนเล่าความลับของเขา 🤫',27.85,'ความลับอะไร...?',28.6,30.2);
  return finish(t,s,13,26.3,moveon,[23.9]);
}
