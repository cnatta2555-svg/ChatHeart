const SUBS=[
 [0.05,1.5,'วันที่ 15...'],[1.5,3.6,'นั่งรถทัวร์ไปทะเลคนเดียว 🚌'],
 [3.75,4.7,'ถึงปุ๊บ...'],[4.7,7.4,'เจอแต่คู่รัก\nจูงมือกันทั้งหาด 💑'],
 [7.5,9.1,'ถ่ายรูปคู่ไม่ได้...'],[9.1,10.9,'เลยถ่ายคู่กับปูแทน 🦀'],
 [11.0,12.4,'ปูหนีบนิ้ว!!'],[12.4,14.6,'ขนาดปูยังไม่อยาก\nอยู่กับฉัน 😭'],
 [14.85,16.2,'แต่พอพระอาทิตย์ตก...'],[16.2,17.6,'ฉันนั่งดูคนเดียว'],[17.6,20.3,'แล้วรู้สึกว่า\nมันก็ไม่ได้แย่นี่นา 🌅'],
 [20.45,21.6,'จบวันที่ 15'],[21.6,23.9,'มูฟออน 15%'],
];
const END=31.5;
const moveon=t=>t<21.9?10:15;
function beach(t,sunset=0){
  const sky=sunset?`<defs><linearGradient id="ss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b3d8f"/><stop offset=".5" stop-color="#ff7e5f"/><stop offset="1" stop-color="#feb47b"/></linearGradient></defs><rect width="1080" height="1100" fill="url(#ss)"/><circle cx="540" cy="${900+sunset*120}" r="150" fill="#ffd166"/>`
    :`<rect width="1080" height="1100" fill="#8fd3ff"/><circle cx="860" cy="300" r="90" fill="#ffd166"/>`;
  const waves=Array.from({length:5}).map((_,i)=>`<path d="M0,${1000+i*40} ${Array.from({length:12}).map((_,j)=>`q45,${-20+((i+j)%2)*0} 90,0`).join(' ')}" transform="translate(${Math.sin(t+i)*30},0)" stroke="#fff" stroke-width="6" fill="none" opacity=".5"/>`).join('');
  return sky+`<rect y="950" width="1080" height="400" fill="${sunset?'#3a6ea5':'#2a9df4'}"/>${waves}<rect y="1300" width="1080" height="620" fill="#f4d9a0"/><path d="M0,1300 Q540,1260 1080,1300" fill="#f4d9a0"/>
  <g transform="translate(120,1300)"><path d="M0,0 Q10,-250 -20,-420" stroke="#8b5e34" stroke-width="26" fill="none"/>${[0,1,2,3,4].map(i=>`<path transform="translate(-20,-420) rotate(${i*72+Math.sin(t*2)*4})" d="M0,0 Q90,-40 170,30" stroke="#2e7d5b" stroke-width="26" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
}
function crab(x,y,s,t,open=0){return `<g transform="translate(${x},${y+Math.abs(Math.sin(t*6))*-8}) scale(${s})"><ellipse rx="90" ry="60" fill="#ff5a3c" stroke="${OL}" stroke-width="7"/><path d="M-90,10 l-40,40 M-80,35 l-30,45 M90,10 l40,40 M80,35 l30,45" stroke="${OL}" stroke-width="8"/><g transform="translate(-110,-60) rotate(${-20-open*25})"><path d="M0,0 C-60,-20 -60,-80 0,-60 L-15,-35Z" fill="#ff5a3c" stroke="${OL}" stroke-width="6"/></g><g transform="translate(110,-60) rotate(${20+open*25})"><path d="M0,0 C60,-20 60,-80 0,-60 L15,-35Z" fill="#ff5a3c" stroke="${OL}" stroke-width="6"/></g><path d="M-30,-55 V-90 M30,-55 V-90" stroke="${OL}" stroke-width="6"/><circle cx="-30" cy="-95" r="13" fill="#fff" stroke="${OL}" stroke-width="5"/><circle cx="30" cy="-95" r="13" fill="#fff" stroke="${OL}" stroke-width="5"/><circle cx="-30" cy="-95" r="5" fill="${OL}"/><circle cx="30" cy="-95" r="5" fill="${OL}"/><path d="M-20,-10 Q0,5 20,-10" stroke="${OL}" stroke-width="5" fill="none"/></g>`;}
function couple(x,y,s,t,a,b){return `<g transform="translate(${x+Math.sin(t*.8)*20},0)">`+who({t,expr:'happy',pose:'down',x:0,y,s},a)+who({t,expr:'happy',pose:'down',x:190*s/.45,y,s,male:true},b)+`<path transform="translate(${95*s/.45},${y-200*s}) scale(${s*1.4})" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff5c8a"/></g>`;}
function scene(t){
  let s='';
  if(t<3.7){ const trees=Array.from({length:4}).map((_,i)=>{const x=((i*330-t*600)%1320+1320)%1320-120;return `<g transform="translate(${x},620)"><path d="M0,0 V-200" stroke="#8b5e34" stroke-width="20"/><circle cy="-220" r="80" fill="#2e7d5b"/></g>`}).join('');
    s=Wz(t,`<rect width="1080" height="1920" fill="#4a90c2"/><rect x="60" y="250" width="960" height="520" rx="40" fill="#bfe8ff" stroke="#2d3748" stroke-width="24"/><g clip-path="url(#win)"><defs><clipPath id="win"><rect x="72" y="262" width="936" height="496" rx="30"/></clipPath></defs><rect x="72" y="262" width="936" height="496" fill="#8fd3ff"/><rect x="72" y="600" width="936" height="160" fill="#2a9df4"/>${trees}</g><rect y="1400" width="1080" height="520" fill="#2d3748"/>`
      +me({t:t*1.6,expr:'happy',pose:'down',x:540,y:1300,s:.9,mush:true,hat:true,talk:true})); }
  else if(t<7.45){ s=Wz(t-3.7,beach(t)+couple(80,1420,.45,t,'f1','guy')+couple(640,1440,.45,t+1,'f2','hunk')+me({t,expr:t<4.7?'happy':'sweat',pose:'down',x:540,y:1500,s:.75,mush:true,hat:true,sweatDrop:t>=4.7})); }
  else if(t<10.95){ s=Wz(t-7.45,beach(t)+me({t,expr:'happy',pose:'phone',x:420,y:1450,s:.85,mush:true,hat:true,talk:true})+(t>=9.1?crab(760,1520,1.1*back(P(t,9.1,.3)),t):'')+`<rect width="1080" height="1920" fill="#fff" opacity="${t>9.9&&t<10.05?.7:0}"/>`); }
  else if(t<14.75){ s=Wz(t-10.95,beach(t)+me({t,expr:t<12.4?'scream':'cry',pose:'face',x:540,y:1450,s:.9,mush:true,hat:true,shake:t<12.4?9:2,tears:t>=12.4})+crab(770,1170,.7,t,Math.max(0,Math.sin(t*12)))+`<text x="250" y="700" font-size="${110+Math.sin(t*20)*10}" font-weight="800" fill="#ff3b5c" stroke="#fff" stroke-width="8" paint-order="stroke">หนีบ!</text>`); }
  else if(t<20.4){ s=Wz(t-14.75,beach(t,ease(P(t,14.85,5.5)))+me({t,expr:t<17.6?'neutral':'happy',pose:'down',x:540,y:1560,s:.75,mush:true,hat:true,talk:true})+`<rect width="1080" height="1920" fill="#ff7e5f" opacity=".12"/>`); }
  else if(t<24.6){ s=gaugeScene(t,20.4,10,15,21.9); }
  else s=endCard(t,24.6,'วันที่ 16 เริ่มแล้ว',15,'ตอนหน้า: ทำอาหารกินเองครั้งแรก 🍳',26.1,'ครัวจะรอดไหม...?',26.85,28.3);
  return finish(t,s,16,24.6,moveon,[21.9]);
}
