function box(x,y,s=1,label=true,hands=true){
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-210,-40 L-250,-110 L-20,-110 L0,-40Z M210,-40 L250,-110 L20,-110 L0,-40Z" fill="#d9a066" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/>
  <rect x="-210" y="-40" width="420" height="300" rx="10" fill="#c98b4f" stroke="${OL}" stroke-width="8"/>
  ${label?`<rect x="-120" y="40" width="240" height="90" rx="10" fill="#fff" stroke="${OL}" stroke-width="5" transform="rotate(-4)"/><text x="0" y="105" text-anchor="middle" font-size="56" font-weight="800" fill="#ff3b5c" transform="rotate(-4)">ทิ้ง!!</text>`:''}
  ${hands?`<circle cx="-210" cy="90" r="34" fill="${SKIN}" stroke="${OL}" stroke-width="7"/><circle cx="210" cy="90" r="34" fill="${SKIN}" stroke="${OL}" stroke-width="7"/>`:''}</g>`;
}
function bear(){
  return `<g><circle cx="-95" cy="-150" r="55" fill="#a0673d" stroke="${OL}" stroke-width="8"/><circle cx="95" cy="-150" r="55" fill="#a0673d" stroke="${OL}" stroke-width="8"/><circle cx="-95" cy="-150" r="25" fill="#e8b48a"/><circle cx="95" cy="-150" r="25" fill="#e8b48a"/>
  <ellipse cx="0" cy="130" rx="150" ry="140" fill="#a0673d" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="150" rx="85" ry="80" fill="#e8b48a"/>
  <circle cx="0" cy="-60" r="135" fill="#a0673d" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="-20" rx="60" ry="45" fill="#e8b48a"/><ellipse cx="0" cy="-38" rx="20" ry="14" fill="${OL}"/><circle cx="-50" cy="-85" r="12" fill="${OL}"/><circle cx="50" cy="-85" r="12" fill="${OL}"/>
  <g transform="translate(0,140) scale(.9)"><path d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff3b5c" stroke="${OL}" stroke-width="6"/></g>
  <g transform="translate(150,40) rotate(15)"><rect x="-20" y="-30" width="170" height="70" rx="8" fill="#fff" stroke="${OL}" stroke-width="5"/><text x="65" y="15" text-anchor="middle" font-size="30" font-weight="700" fill="#ff3b5c">14 ก.พ. 💕</text></g></g>`;
}
function ticket(){
  return `<g transform="rotate(-6)"><path d="M-300,-140 H300 V-40 a40,40 0 0 0 0,80 V140 H-300 V40 a40,40 0 0 0 0,-80Z" fill="#ffd166" stroke="${OL}" stroke-width="8"/>
  <path d="M150,-140 V140" stroke="${OL}" stroke-width="5" stroke-dasharray="14 12"/>
  <text x="-240" y="-60" font-size="44" font-weight="800" fill="${OL}">CINEMA</text><text x="-240" y="5" font-size="34" fill="${OL}">แถว F  ที่นั่ง 7–8</text><text x="-240" y="70" font-size="30" fill="#7a5b00">ADMIT 2 · 20:30</text>
  <text x="225" y="20" text-anchor="middle" font-size="60">🎬</text></g>`;
}
function hoodieItem(){ // grey hoodie held to face
  return `<g><path d="M-170,-70 Q-120,-130 0,-110 Q120,-130 170,-70 L200,200 L-200,200Z" fill="#9aa3b5" stroke="${OL}" stroke-width="8" stroke-linejoin="round"/><path d="M-90,-110 Q0,-20 90,-110" fill="#7d8698" stroke="${OL}" stroke-width="6"/><path d="M-30,-60 V40 M30,-60 V40" stroke="#fff" stroke-width="8" stroke-linecap="round"/><rect x="-90" y="90" width="180" height="70" rx="20" fill="#8a93a6" stroke="${OL}" stroke-width="5"/></g>`;
}
function itemCard(t,t0,inner,bg){
  const k=back(P(t,t0,.35));
  const rays=Array.from({length:12}).map((_,i)=>`<path d="M540,760 L${540+1500*Math.cos(i/12*Math.PI*2+t*.2)},${760+1500*Math.sin(i/12*Math.PI*2+t*.2)} L${540+1500*Math.cos((i+.5)/12*Math.PI*2+t*.2)},${760+1500*Math.sin((i+.5)/12*Math.PI*2+t*.2)}Z" fill="#fff" opacity=".12"/>`).join('');
  return `<rect width="1080" height="1920" fill="${bg}"/>${rays}<g transform="translate(540,${760+Math.sin(t*2)*10}) scale(${k})">${inner}</g>`;
}
const SUBS=[
 [0.0,1.4,'วันที่ 29...'],[1.4,3.9,'ดึงกล่องที่ฝากไว้\nใต้เตียงออกมา 📦'],
 [3.95,5.9,'ตุ๊กตาหมี... 🧸'],[5.9,7.3,'ตั๋วหนัง... 🎟️'],[7.3,9.0,'เสื้อฮู้ดของเขา...'],
 [9.05,10.9,'คราวนี้มือไม่สั่นแล้ว ✋'],
 [11.0,12.8,'ตุ๊กตาหมีให้น้องข้างบ้าน'],[12.8,14.5,'เสื้อเอาไปบริจาค'],
 [14.6,16.3,'ส่วนตั๋วหนัง...'],[16.3,18.4,'เก็บไว้เป็นความทรงจำดีๆ 🤍'],
 [18.5,20.0,'ไม่ได้ทิ้งเพราะเกลียด...'],[20.0,22.1,'แต่เพราะไม่ต้องเก็บไว้\nอีกแล้ว ✨'],
 [22.2,23.9,'จบวันที่ 29'],[23.9,26.0,'มูฟออน 95%'],
];
const END=31;
const moveon=t=>t<24.3?90:95;
function scene(t){
  let s='';
  if(t<3.9){ const k=ease(P(t,1.4,1.8));
    s=Wz(t,bedroom(t,.05)+`<rect x="0" y="1480" width="1080" height="440" fill="#262c52"/><rect x="0" y="1290" width="760" height="150" rx="20" fill="#7d8ad6" stroke="${OL}" stroke-width="8"/><rect x="0" y="1430" width="760" height="40" fill="#5d68b0" stroke="${OL}" stroke-width="6"/><rect x="0" y="1470" width="760" height="190" fill="#0e1129"/>`
      +`<g transform="translate(${380+k*420},1565) scale(.4)">${box(0,0,1,false,false)}</g><rect x="0" y="1660" width="1080" height="260" fill="#323a6b"/>`+me({t,expr:'determined',pose:'down',x:880,y:1360,s:.75,mush:true,talk:true})); }
  else if(t<5.9){ s=Wz(t-3.9,itemCard(t,3.95,bear(),'#ff9eb5')); }
  else if(t<7.3){ s=Wz(t-5.9,itemCard(t,5.9,ticket(),'#7c6cd6')); }
  else if(t<9.0){ s=Wz(t-7.3,itemCard(t,7.3,hoodieItem(),'#9aa3b5')); }
  else if(t<10.95){ s=Wz(t-9.0,bedroom(t)+me({t,expr:'happy',pose:'down',x:540,y:1250,s:.9,mush:true,talk:true})+box(540,1330,.9,false,true)+`<text x="830" y="760" font-size="110">✋✨</text>`); }
  else if(t<14.55){ const donate=t>=12.8;
    s=Wz(t-10.95,street(t)+(donate?`<g transform="translate(820,1350)"><rect x="-170" y="-180" width="340" height="360" rx="16" fill="#2e7d5b" stroke="${OL}" stroke-width="8"/><text y="-60" text-anchor="middle" font-size="48" font-weight="800" fill="#fff">บริจาค</text><text y="70" text-anchor="middle" font-size="110">👕</text></g>`
      :who({t,expr:'happy',pose:'fist',x:820,y:1420,s:.5},'f1')+`<g transform="translate(820,1060) scale(.35)">${bear()}</g>`)+me({t,expr:'happy',pose:'down',x:360,y:1330,s:.85,mush:true,talk:true})); }
  else if(t<18.45){ s=Wz(t-14.55,`<rect width="1080" height="1920" fill="#f4e4c1"/><g transform="translate(540,760) rotate(-4)"><rect x="-380" y="-320" width="760" height="640" rx="20" fill="#fffaf0" stroke="#c9a46b" stroke-width="14"/><text y="-220" text-anchor="middle" font-size="48" font-weight="800" fill="#8b5e34">สมุดความทรงจำ 📒</text></g><g transform="translate(540,${820-ease(P(t,14.7,1))*60}) scale(.7)">${ticket()}</g>`
      +(t>=16.3?`<path transform="translate(800,520) scale(${1.2*back(P(t,16.3,.35))})" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff8fa3"/>`:'')+me({t,expr:'happy',pose:'down',x:540,y:1650,s:.6,mush:true})); }
  else if(t<22.15){ s=Wz(t-18.45,rays(t,'#8fd3ff','#fff6c9',540,600,.55)+me({t,expr:'happy',pose:'fist',x:540,y:1300,s:.95,mush:true,talk:true})+`<g transform="translate(830,1560) scale(.5)">${box(0,0,1,false,false)}</g><text x="830" y="1460" text-anchor="middle" font-size="60">✨ ว่างแล้ว</text>`); }
  else if(t<26.1){ s=gaugeScene(t,22.15,90,95,24.3); }
  else s=endCard(t,26.1,'พรุ่งนี้... วันสุดท้าย',1,'ตอนจบ: มูฟออน 100%? 💯',26.4,'ห้ามพลาด!!',27.3,28.6);
  return finish(t,s,2,26.1,moveon,[24.3]);
}
