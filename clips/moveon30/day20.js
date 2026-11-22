const SUBS=[
 [0.15,1.45,'วันที่ 20...'],[1.45,2.7,'เปิดแกลเลอรี่ 🖼️'],[2.7,5.1,'รูปคู่สองพันสามร้อยรูป 😵'],
 [5.2,6.25,'รูปไปทะเล...'],[6.25,7.4,'รูปวันเกิด...'],[7.4,9.1,'รูปหมูกระทะร้านเดิม...'],
 [9.15,10.5,'กดเลือกทั้งหมด...'],[10.5,11.6,'ลบ!'],
 [11.6,12.6,'มือถือถามว่า...'],[12.6,13.95,'"ลบถาวรไหม?"'],[13.95,15.0,'ลบ!!'],
 [15.0,17.0,'พื้นที่มือถือว่างเพิ่ม\nสิบกิกะ 📲'],[17.0,19.0,'หัวใจก็โล่งขึ้นอีกเยอะ 🫶'],
 [19.1,20.35,'จบวันที่ 20'],[20.35,21.95,'มูฟออน 50%'],[21.95,23.4,'ครึ่งหนึ่งแล้ว!! 🎉'],
];
const END=30.5;
const moveon=t=>t<20.6?40:50;
function galleryUI(t,sel,gone){
  const tiles=Array.from({length:18}).map((_,i)=>{const x=250+(i%3)*196,y=470+Math.floor(i/3)*196,k=gone?clamp(gone*1.6-(i%6)*.12):0;
    return `<g transform="translate(${x+93},${y+93}) scale(${1-k}) rotate(${k*40})" opacity="${1-k}"><rect x="-93" y="-93" width="186" height="186" fill="${['#ffd6e0','#cde7ff','#ffe5a8'][i%3]}"/><circle cx="-28" cy="-10" r="26" fill="#6b5b7b"/><circle cx="28" cy="-10" r="26" fill="#8a7a9a"/><rect x="-55" y="15" width="50" height="60" rx="20" fill="#6b5b7b"/><rect x="5" y="15" width="50" height="60" rx="20" fill="#8a7a9a"/>${sel?`<circle cx="62" cy="-62" r="22" fill="#3b82f6" stroke="#fff" stroke-width="4"/><path d="M52,-62 l8,8 l14,-16" stroke="#fff" stroke-width="5" fill="none"/>`:''}</g>`;}).join('');
  return `<text x="270" y="400" font-size="42" font-weight="800" fill="#222">แกลเลอรี่</text><text x="810" y="400" text-anchor="end" font-size="34" fill="#888">2,300 รูป</text>${tiles}`+(sel&&!gone?`<g transform="translate(540,1560)"><rect x="-200" y="-50" width="400" height="100" rx="50" fill="#ff3b5c"/><text y="16" text-anchor="middle" font-size="44" font-weight="800" fill="#fff">🗑️ ลบ</text></g>`:'');
}
function scene(t){
  let s='';
  if(t<5.15){ s=Wz(t,phone(t,galleryUI(t,false,0))+(t>=2.7?`<g transform="translate(540,1780) scale(${back(P(t,2.7,.3))})"><text text-anchor="middle" font-size="64" font-weight="800" fill="#ffd166" stroke="${OL}" stroke-width="10" paint-order="stroke">📸 2,300 รูปคู่</text></g>`:'')); }
  else if(t<9.1){ const items=[[5.2,'🏖️','ทะเลด้วยกัน'],[6.3,'🎂','วันเกิดปีที่แล้ว'],[7.45,'🔥','หมูกระทะร้านเดิม']]; const cur=[...items].reverse().find(([a])=>t>=a);
    s=Wz(t-5.15,`<rect width="1080" height="1920" fill="#2a2440"/>`+items.filter(([a])=>t>=a).map(([a,e,tx],i)=>`<g transform="translate(${340+i*200},${700+i*120}) rotate(${[-8,4,-3][i]}) scale(${back(P(t,a,.3))*.95})"><rect x="-230" y="-260" width="460" height="520" rx="14" fill="#fff" stroke="${OL}" stroke-width="6"/><rect x="-200" y="-230" width="400" height="360" fill="#ffd6e0"/><text y="20" text-anchor="middle" font-size="180">${e}</text><circle cx="-90" cy="90" r="32" fill="#6b5b7b"/><circle cx="90" cy="90" r="32" fill="#8a7a9a"/><text y="210" text-anchor="middle" font-size="40" font-weight="700" fill="${OL}">${tx}</text></g>`).join('')
      +me({t,expr:'sad',pose:'down',x:830,y:1620,s:.55,mush:true,talk:true})); }
  else if(t<11.6){ const gone=t>=10.5?P(t,10.5,1):0;
    s=Wz(t-9.1,phone(t,galleryUI(t,true,gone))+(t<10.6?thumb(540,1700-ease(P(t,9.6,.6))*180+60):'')+(gone?`<text x="540" y="1780" text-anchor="middle" font-size="80" font-weight="800" fill="#ff3b5c" stroke="#fff" stroke-width="8" paint-order="stroke">💨 ลบ!</text>`:'')); }
  else if(t<15.0){ const hit=t>=13.95;
    s=Wz(t-11.6,phone(t,`<rect x="226" y="276" width="628" height="1368" fill="#f3f3f3"/><g transform="translate(540,900) scale(${hit?1-P(t,14.0,.4):back(P(t,11.7,.3))})"><rect x="-260" y="-200" width="520" height="400" rx="36" fill="#fff" stroke="#ddd" stroke-width="4"/><text y="-100" text-anchor="middle" font-size="44" font-weight="800" fill="#222">ลบถาวร?</text><text y="-40" text-anchor="middle" font-size="30" fill="#777">ย้อนกลับไม่ได้นะ</text><path d="M-260,60 H260 M0,60 V200" stroke="#ddd" stroke-width="4"/><text x="-130" y="145" text-anchor="middle" font-size="40" fill="#3b82f6">ยกเลิก</text><text x="130" y="145" text-anchor="middle" font-size="44" font-weight="800" fill="#ff3b5c">ลบ</text></g>`)
      +(t>=13.5?thumb(670,(t<13.95?1700-ease(P(t,13.5,.45))*590:1110)+60):'')+(hit?Array.from({length:14}).map((_,i)=>{const a=i/14*Math.PI*2,k=P(t,14.0,.9);return `<circle cx="${540+Math.cos(a)*k*400}" cy="${900+Math.sin(a)*k*400}" r="${22*(1-k)+3}" fill="#ffd166" opacity="${1-k}"/>`}).join(''):'')); }
  else if(t<19.1){ const k=ease(P(t,15.2,1.5));
    s=Wz(t-15.0,rays(t,'#7ee0b5','#b8f2d9',540,700,.5)+`<g transform="translate(540,560)"><rect x="-360" y="-110" width="720" height="220" rx="30" fill="#fff" stroke="${OL}" stroke-width="8"/><text y="-30" text-anchor="middle" font-size="44" font-weight="800" fill="${OL}">พื้นที่ว่าง 📲</text><rect x="-310" y="10" width="620" height="50" rx="25" fill="#eee"/><rect x="-310" y="10" width="${620*(.1+.6*k)}" height="50" rx="25" fill="#2e7d5b"/><text x="0" y="48" text-anchor="middle" font-size="34" font-weight="800" fill="#fff">+${Math.round(k*10)} GB</text></g>`
      +me({t,expr:'happy',pose:t<17?'down':'fist',x:540,y:1350,s:.9,mush:true,talk:true})+(t>=17?sparkles(t,[[230,900],[850,900]]):'')); }
  else if(t<23.5){ s=gaugeScene(t,19.1,40,50,20.6,t>=21.95?fireworks(t,21.95):''); }
  else s=endCard(t,23.5,'วันที่ 21 เริ่มแล้ว',10,'ตอนหน้า: สรุปสัปดาห์ที่ 3 📊',25.5,'ดีที่สุดเลยไหม...?',26.2,27.8);
  return finish(t,s,11,23.5,moveon,[20.6]);
}
