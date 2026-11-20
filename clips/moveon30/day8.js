const SUBS=[
 [0.1,1.1,'วันที่ 8...'],[1.1,3.6,'เขาว่ากันว่า\nอกหักต้องตัดผม ✂️'],
 [3.8,4.95,'"ขอทรงนี้ค่ะพี่"'],[4.95,7.4,'"สวยๆ เปรี้ยวๆ\nลืมแฟนเก่า"'],
 [7.55,9.6,'ช่างตัดไปฮัมเพลงไป 🎵'],[9.6,11.3,'เพลงอกหักอีกแล้ว...'],
 [11.4,12.7,'อ๊ากกก!!!'],[12.7,14.4,'ทำไมเป็นทรงเห็ด! 🍄'],
 [14.45,15.3,'แต่...'],[15.3,16.6,'ดูไปดูมา ก็...'],[16.6,17.6,'แปลกใหม่ดี'],[17.6,19.1,'เหมือนคนใหม่จริงๆ ✨'],
 [19.15,20.5,'เพื่อนบอกน่ารัก...'],[20.5,22.5,'หลังจากหัวเราะไป\nสิบนาที 🤣'],
 [22.7,23.9,'จบวันที่ 8'],[23.9,25.9,'มูฟออนติดลบ 15%'],
];
const END=31;
const moveon=t=>t<24.2?-20:-15;
const cape=`<path d="M-70,-175 L-270,330 L270,330 L70,-175Z" fill="#e6eef7" stroke="${OL}" stroke-width="7"/><path d="M-150,100 L-120,330 M-50,100 L-40,330 M50,100 L40,330 M150,100 L120,330" stroke="#c9d6e6" stroke-width="10"/>`;
function salon(t){
  return `<rect width="1080" height="1920" fill="#bfe8dc"/><rect y="0" width="1080" height="200" fill="#9fd6c6"/>
  ${Array.from({length:6}).map((_,i)=>`<rect x="${i*190}" y="200" width="95" height="1300" fill="#b2e0d3"/>`).join('')}
  <rect x="300" y="300" width="480" height="640" rx="240" fill="#e8f6ff" stroke="#c9a46b" stroke-width="22"/><path d="M380,420 L470,340 M420,520 L560,380" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".8"/>
  <g transform="translate(160,320) rotate(-8)"><rect x="-110" y="-50" width="220" height="100" rx="14" fill="#ff8fa3" stroke="${OL}" stroke-width="6"/><text y="15" text-anchor="middle" font-size="42" font-weight="800" fill="#fff">ซาลอน ✂️</text></g>
  <rect y="1500" width="1080" height="420" fill="#f2e6d8"/>${Array.from({length:12}).map((_,i)=>`<rect x="${i*90}" y="1500" width="45" height="420" fill="#e6d5c1"/>`).join('')}`;
}
function photoCard(x,y,k){return `<g transform="translate(${x},${y}) rotate(8) scale(${back(k)})"><rect x="-130" y="-170" width="260" height="320" rx="12" fill="#fff" stroke="${OL}" stroke-width="6"/><rect x="-110" y="-150" width="220" height="230" fill="#ffd1dc"/><circle cx="0" cy="-50" r="55" fill="#f6c9a4"/><path d="M-70,-40 Q-75,-130 0,-128 Q75,-130 70,-40 L70,30 L45,30 L45,-60 Q0,-100 -45,-60 L-45,30 L-70,30Z" fill="#2a1d2f"/><text y="125" text-anchor="middle" font-size="34" font-weight="700" fill="${OL}">✨ เปรี้ยวๆ ✨</text></g>`;}
function scissors(x,y,t){const o=Math.abs(Math.sin(t*18))*18;return `<g transform="translate(${x},${y})"><g transform="rotate(${-o})"><path d="M0,0 L-120,-10" stroke="#aab" stroke-width="14" stroke-linecap="round"/><circle cx="25" cy="10" r="18" fill="none" stroke="#ff3b5c" stroke-width="9"/></g><g transform="rotate(${o})"><path d="M0,0 L-120,10" stroke="#ccd" stroke-width="14" stroke-linecap="round"/><circle cx="25" cy="-10" r="18" fill="none" stroke="#ff3b5c" stroke-width="9"/></g></g>`;}
function hairBits(t,t0){return Array.from({length:14}).map((_,i)=>{const k=((t-t0)*1.3+i/14)%1;return `<path transform="translate(${420+(i*67)%260+Math.sin(i)*40},${700+k*700}) rotate(${i*40+t*200})" d="M0,0 q20,-15 40,0" stroke="${HAIR}" stroke-width="7" fill="none" opacity="${1-k}"/>`;}).join('');}
function scene(t){
  let s='';
  const stylist=(o)=>who({t,expr:'happy',pose:'down',x:870,y:1250,s:.8,...o},'staff');
  if(t<3.7){ s=Wz(t,salon(t)+me({t,expr:'determined',pose:'fist',x:540,y:1300,s:.9,talk:false})+label(540,560,'อกหัก = ตัดผม ✂️',P(t,1.2,.3),-4)); }
  else if(t<7.5){ s=Wz(t-3.7,salon(t)+me({t,expr:'happy',pose:'down',x:440,y:1300,s:.85,talk:true},cape)+stylist({})+photoCard(190,640,P(t,3.85,.35))); }
  else if(t<11.35){ const lt=t-7.5, notes=Array.from({length:4}).map((_,i)=>{const k=(t*.6+i/4)%1;return `<text x="${930+Math.sin(t*2+i)*60}" y="${620-k*300}" font-size="70" fill="#4a6fa5" opacity="${1-k}">${i%2?'♪':'♫'}</text>`}).join('');
    s=Wz(lt,salon(t)+me({t,expr:t<9.6?'happy':'sweat',pose:'down',x:440,y:1300,s:.85,shake:3},cape)+stylist({expr:'sad',talk:true})+scissors(560+Math.sin(t*9)*90,750+Math.cos(t*7)*60,t)+hairBits(t,7.5)+notes
      +(t>=9.6?`<g transform="translate(860,500) scale(${back(P(t,9.6,.3))})"><rect x="-150" y="-50" width="300" height="100" rx="18" fill="#4a6fa5"/><text y="16" text-anchor="middle" font-size="40" fill="#fff">🎵 ลืมไม่ลง 💔</text></g>`:'')); }
  else if(t<14.4){ const lt=t-11.4, flash=1-P(lt,0,.3);
    s=Wz(lt,rays(t,'#2a1d4a','#ff3b5c',540,900,.3)+me({t,expr:t<12.7?'scream':'shock',pose:t<12.7?'face':'down',x:540,y:1300,s:1,shake:t<12.7?9:3,mush:true})
      +(t>=12.7?`<text x="850" y="${520+Math.sin(t*5)*15}" font-size="130">🍄</text><text x="200" y="${640+Math.cos(t*5)*15}" font-size="100">🍄</text>`:'')+`<rect width="1080" height="1920" fill="#fff" opacity="${flash}"/>`); }
  else if(t<19.15){ const lt=t-14.4, turn=t<16.6?Math.sign(Math.sin(t*3.2))||1:1;
    s=Wz(lt,salon(t)+`<g transform="translate(540,0) scale(${turn},1) translate(-540,0)">`+me({t,expr:t<16.6?'neutral':'happy',pose:'down',x:540,y:1300,s:.9,mush:true,talk:true})+`</g>`
      +(t>=17.6?sparkles(t,[[250,600],[850,620],[230,1000],[870,1050]],'#fff')+label(540,560,'คนใหม่ ✨',P(t,17.6,.3),-3):'')); }
  else if(t<22.6){ const lt=t-19.15, fl=t>=19.3&&t<19.5?1:0;
    s=Wz(lt,salon(t)+who({t,expr:'happy',pose:'phone',x:200,y:1300,s:.72,talk:true,shake:4},'f1')+who({t,expr:'happy',pose:'face',x:880,y:1300,s:.72,talk:true,shake:5},'f2')
      +me({t,expr:'sweat',pose:'down',x:540,y:1300,s:.85,mush:true,sweatDrop:true})
      +(t>=20.5?label(540,560,'⏱️ 10 นาทีต่อมา...',P(t,20.5,.3),-4):'')+`<rect width="1080" height="1920" fill="#fff" opacity="${fl*.8}"/>`); }
  else if(t<26.1){ s=Wz(t-22.6,bedHead(t,{mush:true})+label(300,700,'ผมสั้น ใจเบา 🍄',P(t,22.9,.3))); }
  else s=endCard(t,26.1,'วันที่ 9 เริ่มแล้ว',22,'ตอนหน้า: สมัครฟิตเนส 🏋️',27.5,'จะรอดไหม...?',28.2,29.3);
  return finish(t,s,23,26.1,moveon,[24.2]);
}
