const SUBS=[
 [0.1,0.95,'วันที่ 10...'],[0.95,3.6,'มือถือเครื่องใหม่\nภารกิจใหม่ 📱'],
 [4.3,5.2,'วันนี้...'],[5.2,7.2,'จะกดอันฟอลโลว์เขา!'],
 [7.3,9.2,'ลุ้นยิ่งกว่ากู้ระเบิด 💣'],[9.3,10.35,'ตัดสายสีแดง...'],[10.35,11.9,'หรือสายสีน้ำเงิน...'],
 [12.0,12.95,'กดแล้ว!!'],[12.95,14.4,'อันฟอลโลว์แล้ว!! 🎉'],
 [14.45,16.6,'ไม่ต้องเห็นหน้าเขา\nในฟีดอีกต่อไป'],
 [16.75,18.3,'จบ...'],[18.35,20.1,'วันที่ 10 มูฟออน'],[20.1,21.3,'0% !!!'],[21.3,23.2,'ไม่ติดลบแล้ว! 🥳'],
];
const END=30.5;
const moveon=t=>t<20.15?-10:0;
function newPhoneBox(t){return `<g transform="translate(540,640) rotate(${Math.sin(t*2)*3})"><rect x="-200" y="-260" width="400" height="520" rx="40" fill="#fff" stroke="${OL}" stroke-width="10"/><rect x="-160" y="-220" width="320" height="440" rx="30" fill="#1b1830"/><rect x="-140" y="-200" width="280" height="400" rx="20" fill="#9fd8ff"/><text y="20" text-anchor="middle" font-size="90">✨</text><path d="M-120,-160 L-40,-220" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".7"/></g>`;}
function followBtn(t,state){ // state 0 following, 1 pressed, 2 follow
  const fill=state===2?'#3b82f6':'#eee', txt=state===2?'ติดตาม':'กำลังติดตาม ✓', col=state===2?'#fff':'#222';
  return `<rect x="250" y="640" width="580" height="90" rx="20" fill="${fill}" stroke="${state===1?'#ff3b5c':'#ccc'}" stroke-width="${state===1?8:3}"/><text x="540" y="700" text-anchor="middle" font-size="40" font-weight="700" fill="${col}">${txt}</text>`;
}
function bomb(t){
  const left=Math.max(0,Math.ceil(12.0-t));
  const cutX=t<10.35?380+ease(P(t,9.3,.5))*0:700;
  const sx=t<9.3?540:(t<10.35?380:700);
  return `<rect width="1080" height="1920" fill="#14141f"/>${Array.from({length:30}).map((_,i)=>`<path d="M0,${i*70} H1080" stroke="#1d1d2b" stroke-width="3"/>`).join('')}
  <g transform="translate(540,800)"><rect x="-380" y="-260" width="760" height="520" rx="30" fill="#3a3f4b" stroke="${OL}" stroke-width="10"/>
   <rect x="-250" y="-200" width="500" height="160" rx="16" fill="#000"/><text y="-90" text-anchor="middle" font-size="110" font-weight="800" fill="#ff3b5c" opacity="${Math.sin(t*12)>-.3?1:.3}">00:0${left}</text>
   <text y="10" text-anchor="middle" font-size="40" fill="#fff">ปุ่ม: อันฟอลโลว์ 💔</text>
   <path d="M-250,80 C-150,250 -50,-30 -160,200" stroke="#ff3b5c" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M250,80 C150,250 50,-30 160,200" stroke="#3b82f6" stroke-width="22" fill="none" stroke-linecap="round"/></g>
  ${t>=9.3?`<g transform="translate(${sx},${980+Math.sin(t*30)*6}) rotate(-30)">${scissorsSvg(t)}</g>`:''}`;
}
function scissorsSvg(t){const o=6+Math.abs(Math.sin(t*4))*10;return `<g transform="rotate(${-o})"><path d="M0,0 L-140,-10" stroke="#ccd" stroke-width="16" stroke-linecap="round"/><circle cx="30" cy="12" r="22" fill="none" stroke="#ffd166" stroke-width="10"/></g><g transform="rotate(${o})"><path d="M0,0 L-140,10" stroke="#ccd" stroke-width="16" stroke-linecap="round"/><circle cx="30" cy="-12" r="22" fill="none" stroke="#ffd166" stroke-width="10"/></g>`;}
function fireworks(t,t0){return [[250,500,'#ffd166'],[800,450,'#ff8fa3'],[540,350,'#7ee0b5'],[300,900,'#9fd8ff'],[820,850,'#ffd166']].map(([x,y,c],j)=>{const k=((t-t0)*.9+j*.23)%1;return Array.from({length:12}).map((_,i)=>{const a=i/12*Math.PI*2;return `<circle cx="${x+Math.cos(a)*k*170}" cy="${y+Math.sin(a)*k*170+k*k*40}" r="${12*(1-k)+3}" fill="${c}" opacity="${1-k}"/>`;}).join('');}).join('');}
function feedUI(t){
  const posts=[['🐱','#ffe5a8','แมวบ้านข้างๆ'],['🍜','#ffd6e0','ร้านใหม่หน้าปากซอย'],['🌸','#d8f3dc','ทะเลดอกไม้'],['🐶','#cde7ff','น้องหมาแห่งปี'],['🍰','#e4c1f9','เค้กโกโก้']];
  const off=(t*220)%420;
  return `<defs><clipPath id="scr"><rect x="226" y="440" width="628" height="1204" rx="40"/></clipPath></defs><text x="270" y="400" font-size="44" font-weight="800" fill="#222">ฟีด</text><g clip-path="url(#scr)">`+posts.concat(posts).map(([e,c,cap],i)=>{const y=470+i*420-off;return y>1700||y<260?'':`<g><rect x="250" y="${y}" width="580" height="330" rx="20" fill="${c}"/><text x="540" y="${y+220}" text-anchor="middle" font-size="160">${e}</text><text x="260" y="${y+380}" font-size="32" fill="#444">${cap}</text></g>`;}).join('')+'</g>';
}
function scene(t){
  let s='';
  if(t<4.25){ s=Wz(t,rays(t,'#ff8fa3','#ffb3c1',540,700)+newPhoneBox(t)+sparkles(t,[[230,420],[860,440],[200,900],[880,880]])+me({t,expr:'happy',pose:'fist',x:540,y:1450,s:.75,mush:true,talk:true})); }
  else if(t<7.25){ const lt=t-4.25;
    s=Wz(lt,phone(t,profileUI(t)+followBtn(t,0)+thumb(640,1700-ease(P(t,5.3,1))*900+60))+`<g transform="translate(540,1780) scale(${back(P(t,5.3,.3))})"><text text-anchor="middle" font-size="58" font-weight="800" fill="#ffd166" stroke="${OL}" stroke-width="10" paint-order="stroke">ภารกิจ: อันฟอลโลว์ 🎯</text></g>`); }
  else if(t<12.0){ s=Wz(t-7.25,bomb(t)+me({t,expr:'sweat',pose:'down',x:540,y:1650,s:.6,sweatDrop:true,shake:2,mush:true})); }
  else if(t<12.95){ const lt=t-12.0, st=t<12.25?1:2;
    s=Wz(lt,phone(t,profileUI(t)+followBtn(t,st)+thumb(640,(t<12.25?800+25:840)+60))+fireworks(t,12.2)); }
  else if(t<14.45){ s=Wz(t-12.95,rays(t,'#2a1d4a','#ffd166',540,800,.35)+fireworks(t,12.95)+who({t,expr:'happy',pose:'fist',x:200,y:1300,s:.7},'f1')+who({t,expr:'happy',pose:'fist',x:880,y:1300,s:.7},'f2')+me({t,expr:'happy',pose:'fist',x:540,y:1280,s:.9,mush:true,shake:3})); }
  else if(t<16.7){ s=Wz(t-14.45,phone(t,feedUI(t))); }
  else if(t<23.3){ const lt=t-16.7, v=Math.round(-10+10*ease(P(t,19.3,.9))), green=t>=20.15;
    s=Wz(lt,(green?rays(t,'#2e7d5b','#7ee0b5',540,700,.45):`<rect width="1080" height="1920" fill="#1b2340"/>`)
      +`<g transform="translate(540,600) scale(${back(P(lt,0,.4))*(green?1+.05*Math.sin(t*8):1)})"><circle r="250" fill="#fff" stroke="${OL}" stroke-width="12"/><text y="60" text-anchor="middle" font-size="${v===0?190:150}" font-weight="800" fill="${green?'#2e7d5b':'#ff3b5c'}">${v}%</text><text y="140" text-anchor="middle" font-size="40" fill="#666">มูฟออน</text></g>`
      +(green?fireworks(t,20.15):'')+me({t,expr:green?'happy':'neutral',pose:green?'fist':'down',x:540,y:1500,s:.75,mush:true,talk:!green,shake:t>=21.3?4:0})); }
  else s=endCard(t,23.3,'วันที่ 11 เริ่มแล้ว',20,'ตอนหน้า: ลงสตอรี่ให้เขาเห็น 📸',25.7,'เขาจะดูไหม...?',26.4,27.8);
  return finish(t,s,21,23.3,moveon,[20.15]);
}
