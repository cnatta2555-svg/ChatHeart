const SUBS=[
 [0.0,1.5,'วันที่ 30...'],[1.5,3.4,'วันสุดท้ายแล้ว 🥹'],
 [3.45,4.9,'สามสิบวันก่อน...'],[4.9,7.95,'ฉันส่องไอจีเขา\nวันละ 47 ครั้ง 📱'],
 [8.0,8.95,'วันนี้...'],[8.95,12.3,'จำไม่ได้ด้วยซ้ำ\nว่าเขาลงรูปอะไรล่าสุด 🤷'],
 [12.35,14.25,'ผมทรงเห็ดยาวขึ้นแล้ว 🍄'],[14.25,16.4,'ใจก็โตขึ้นด้วย 💪'],
 [16.45,19.2,'ขอบคุณทุกคน\nที่ดูมาด้วยกันทั้ง 30 วัน 🙏'],[19.2,21.9,'ทุกคอมเมนต์ ทำให้ฉัน\nไม่รู้สึกว่าเดินคนเดียว 💬'],
 [21.95,22.9,'มูฟออน...'],[22.9,25.3,'100%!!! 🎉'],
 [25.4,26.95,'แล้วมือถือก็เด้ง...'],[26.95,28.8,'หนุ่มฟิตเนสทักมา 😳'],
 [28.9,30.1,'ภารกิจใหม่...'],[30.1,31.85,'หาแฟนใหม่ใน 30 วัน 💘'],[31.85,34.2,'ซีซั่น 2 เร็วๆ นี้!'],
];
const END=40;
const moveon=t=>t<23.0?95:100;
function scene(t){
  let s='';
  if(t<3.45){ s=Wz(t,rays(t,'#ffb38a','#ffe0b3',540,700,.5)+me({t,expr:'happy',pose:'down',x:540,y:1300,s:.95,mush:true,talk:true})); }
  else if(t<7.95){ const n=Math.min(47,1+Math.floor(ease(P(t,4.9,2.2))*46));
    s=Wz(t-3.45,bedroom(t)+me({t,expr:'sad',pose:'phone',glow:true,x:540,y:1200})+`<rect width="1080" height="1920" fill="#c9a46b" opacity=".28"/><g transform="translate(540,560) rotate(-4)"><rect x="-300" y="-70" width="600" height="140" rx="24" fill="#ff3b5c" stroke="${OL}" stroke-width="8"/><text y="22" text-anchor="middle" font-size="58" font-weight="800" fill="#fff">ส่องวันนี้: ${n} ครั้ง</text></g>`
      +`<g transform="translate(830,1720) rotate(-4)"><rect x="-170" y="-50" width="340" height="100" rx="14" fill="#f4e4c1" stroke="${OL}" stroke-width="5"/><text y="16" text-anchor="middle" font-size="40" font-weight="700" fill="${OL}">⏪ Day 1</text></g>`); }
  else if(t<12.3){ s=Wz(t-7.95,`<rect width="1080" height="1920" fill="#8fd3ff"/><circle cx="860" cy="300" r="90" fill="#ffd166"/><rect y="1450" width="1080" height="470" fill="#7ee0b5"/>`+me({t,expr:'happy',pose:'down',x:540,y:1350,s:.95,mush:true,talk:true})+(t>=8.95?`<text x="200" y="${640+Math.sin(t*3)*15}" font-size="110">🤷</text><text x="830" y="${700+Math.cos(t*3)*15}" font-size="110" fill="#7c6cd6" font-weight="800">?</text>`:'')); }
  else if(t<16.4){ const now=t>=14.25;
    s=Wz(t-12.3,`<rect width="1080" height="1920" fill="#ffe3ec"/><g opacity=".9"><g transform="translate(-230,0)">${me({t,expr:'sad',pose:'down',x:540,y:1350,s:.7})}<text x="540" y="560" text-anchor="middle" font-size="48" font-weight="800" fill="#999">Day 1</text></g></g><text x="540" y="1100" text-anchor="middle" font-size="110">➡️</text>`
      +`<g transform="translate(230,0)">${me({t,expr:'happy',pose:now?'fist':'down',x:540,y:1350,s:.7,mush:true})}<text x="540" y="560" text-anchor="middle" font-size="48" font-weight="800" fill="#ff3b5c">Day 30</text></g>`+(now?sparkles(t,[[770,700],[920,880],[620,760]]):'')); }
  else if(t<21.95){ const cms=['❤️ สู้ๆ นะน้องมูฟ','🥹 ดูทุกวันเลย','💪 เราก็มูฟออนได้แล้ว','🍄 ทีมทรงเห็ด!','✨ ขอซีซั่น 2!'];
    s=Wz(t-16.4,rays(t,'#ff8fa3','#ffc2d1',540,900,.5)+me({t,expr:'happy',pose:'down',x:540,y:1400,s:.95,mush:true,talk:true,tilt:t>=17&&t<18.2?8:0})
      +cms.map((c,i)=>{const a=16.6+i*.8;return t>=a?`<g transform="translate(${[420,660,430,650,540][i]},${[430,560,690,820,300][i]}) scale(${back(P(t,a,.3))})"><rect x="${-c.length*12-40}" y="-40" width="${c.length*24+80}" height="80" rx="40" fill="#fff" stroke="${OL}" stroke-width="5"/><text y="12" text-anchor="middle" font-size="34" fill="${OL}">${c}</text></g>`:''}).join('')); }
  else if(t<25.4){ const conf=Array.from({length:30}).map((_,i)=>{const y=((t*350+i*80)%1500)+200;return `<rect x="${(i*137)%1040}" y="${y}" width="20" height="34" fill="${['#ffd166','#ff8fa3','#7ee0b5','#9fd8ff'][i%4]}" transform="rotate(${t*220+i*40},${(i*137)%1040+10},${y+17})"/>`;}).join('');
    s=gaugeScene(t,21.95,95,100,23.0,t>=23.0?fireworks(t,23.0)+conf:''); }
  else if(t<28.9){ s=Wz(t-25.4,bedroom(t,.1)+me({t,expr:t<26.95?'neutral':'shock',pose:'phone',glow:true,x:540,y:1300,s:.95,mush:true},`<ellipse cx="-100" cy="-268" rx="55" ry="28" fill="#ff4d6d" opacity="${t>=26.95?.7:0}"/><ellipse cx="100" cy="-268" rx="55" ry="28" fill="#ff4d6d" opacity="${t>=26.95?.7:0}"/>`)
      +`<g transform="translate(540,${420-(1-ease(P(t,25.6,.4)))*300})"><rect x="-320" y="-80" width="640" height="160" rx="30" fill="#ffffffee" stroke="#ddd" stroke-width="4"/><circle cx="-245" cy="0" r="46" fill="#3b82f6"/><text x="-180" y="-12" font-size="36" font-weight="700" fill="#222">ภูมิ 💪</text><text x="-180" y="38" font-size="32" fill="#444">ว่างไหม ไปกินกาแฟกันอีกนะ ☕</text></g>`
      +(t>=26.95?`<text x="860" y="900" font-size="100">💓</text>`:'')); }
  else if(t<34.3){ const k=P(t,28.9,.5);
    s=rays(t,'#9b5de5','#ff8fa3',540,960,.45)+`<g transform="translate(540,560) rotate(-4) scale(${back(k)})"><rect x="-420" y="-150" width="840" height="300" rx="30" fill="#ff3b8a" stroke="#fff" stroke-width="12"/><text y="-30" text-anchor="middle" font-size="64" font-weight="800" fill="#fff">น้องมูฟ ซีซั่น 2</text><text y="70" text-anchor="middle" font-size="76" font-weight="800" fill="#ffd166">หาแฟนใหม่ใน 30 วัน 💘</text></g>`
      +`<g transform="translate(60,120)"><rect width="560" height="76" rx="12" fill="#0d1124" opacity=".82"/><rect width="8" height="76" fill="#ff8fa3"/><text x="34" y="51" font-size="36" font-weight="700" fill="#fff">• เหลือ 30 วัน</text><text x="290" y="51" font-size="36" font-weight="700" fill="#ff8fa3">ใจเต้น 0% 💓</text></g>`
      +me({t,expr:'happy',pose:'fist',x:540,y:1450,s:.85,mush:true})+(t>=31.85?`<g transform="translate(540,1740) scale(${back(P(t,31.85,.3))})"><rect x="-260" y="-60" width="520" height="120" rx="60" fill="#fff"/><text y="20" text-anchor="middle" font-size="56" font-weight="800" fill="#9b5de5">เร็วๆ นี้! ⏳</text></g>`:''); }
  else { const lt=t-34.3;
    s=`<rect width="1080" height="1920" fill="#1b2340"/><g transform="translate(540,700) scale(${back(P(lt,0,.4))})"><text text-anchor="middle" font-size="76" font-weight="800" fill="#fff">ขอบคุณที่ดูจนจบ</text><text y="100" text-anchor="middle" font-size="76" font-weight="800" fill="#ffd166">ซีซั่น 1 🙏</text></g>`
     +`<g transform="translate(540,1150)">${me({t,expr:'happy',pose:'fist',x:0,y:300,s:.6,mush:true})}</g>`
     +`<g opacity="${P(lt,.8,.3)}" transform="translate(540,1600) scale(${1+Math.sin(lt*6)*.04})"><rect x="-330" y="-60" width="660" height="120" rx="60" fill="#ff3b5c"/><text y="20" text-anchor="middle" font-size="48" font-weight="800" fill="#fff">กดติดตาม รอซีซั่น 2! 💘</text></g>`;
  }
  return finish(t,s,1,28.9,moveon,[23.0]);
}
