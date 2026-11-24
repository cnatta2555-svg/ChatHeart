const SUBS=[
 [0.15,1.5,'วันที่ 22...'],[1.5,2.85,'ชีวิตกำลังดีเลย ✨'],[2.85,5.3,'กินข้าวกับเพื่อน\nหัวเราะทั้งวัน 😂'],
 [5.4,6.8,'แล้วมือถือก็สั่น... 📳'],[6.8,9.2,'ชื่อที่ไม่ได้เห็น\nมายี่สิบสองวัน...'],
 [9.25,10.4,'เขาทักมาว่า...'],[10.4,12.0,'"สบายดีไหม"'],
 [12.05,13.9,'...'],
 [13.95,17.4,'ทุกอย่างที่ทำมาสามสัปดาห์\nเหมือนพังลงในสามคำ 💔'],
 [17.5,18.9,'ยังไม่ได้กดอ่าน...'],[18.9,21.0,'แต่อ่านซ้ำในหัว\nไปร้อยรอบแล้ว'],
 [21.15,22.6,'จบวันที่ 22'],[22.6,24.0,'มูฟออนตกลงไป...'],[24.0,25.6,'เหลือ 30% 📉'],
];
const END=33;
const moveon=t=>t<24.2?55:30;
function scene(t){
  let s='';
  if(t<5.3){ s=Wz(t,rays(t,'#ffb38a','#ffe0b3',540,800,.5)+who({t,expr:'happy',pose:'down',x:220,y:1320,s:.75,talk:true,shake:2},'f1')+who({t,expr:'happy',pose:'face',x:860,y:1320,s:.75,talk:true,shake:3},'f2')+me({t,expr:'happy',pose:'down',x:540,y:1300,s:.9,mush:true,talk:true})+`<rect y="1560" width="1080" height="360" fill="#8b5e34"/>`); }
  else if(t<9.2){ const vib=t<6.9?Math.sin(t*70)*8:0;
    s=Wz(t-5.3,`<g transform="translate(${vib},0)">`+phone(t,`<rect x="226" y="276" width="628" height="1368" rx="58" fill="#1d2b53"/><text x="540" y="560" text-anchor="middle" font-size="150" font-weight="300" fill="#fff">19:42</text>`+notif(540,820,P(t,5.5,.4),'สบายดีไหม'))+`</g>`
      +(t>=6.9?`<g transform="translate(540,1780) scale(${back(P(t,6.9,.3))})"><text text-anchor="middle" font-size="64" font-weight="800" fill="#ff8fa3" stroke="${OL}" stroke-width="10" paint-order="stroke">ex.jaa_ 💔</text></g>`:'')); }
  else if(t<12.0){ const z=1+ease(P(t,9.3,2.5))*.25;
    s=`<g transform="translate(540,900) scale(${z}) translate(-540,-900)"><rect width="1080" height="1920" fill="#14141f"/><g transform="translate(540,880) scale(${back(P(t,10.45,.35))})"><rect x="-330" y="-110" width="660" height="220" rx="70" fill="#eee"/><text y="30" text-anchor="middle" font-size="90" font-weight="700" fill="#222">สบายดีไหม</text></g><circle cx="150" cy="880" r="70" fill="#b06b8b"/></g>`; }
  else if(t<13.95){ const z=1+ease(P(t,12.0,1.6))*.4; s=`<g transform="translate(540,800) scale(${z}) translate(-540,-800)">`+bedroom(t)+me({t:12,expr:'shock',pose:'down',x:540,y:1250,s:.95,mush:true})+`</g><rect width="1080" height="1920" fill="#000" opacity=".35"/>`+chopsticks(540,1350+ease(P(t,12.1,.5))*300,ease(P(t,12.1,.5))*90); }
  else if(t<17.45){ const items=[['🦀','ปูหนีบ'],['🍳','ไข่ไหม้'],['🏃','ตกลู่วิ่ง'],['🗑️','ลบรูป'],['🍲','ข้าวแม่'],['🚫','อันฟอลโลว์']], k=P(t,15.8,1.5);
    s=Wz(t-13.95,`<rect width="1080" height="1920" fill="#2a1030"/>`+items.map(([e,tx],i)=>{const fall=k*k*(900+i*120);return `<g transform="translate(0,${fall}) rotate(${k*(i%2?40:-40)},${330+(i%2)*420},${370+Math.floor(i/2)*300})">${polaroid(330+(i%2)*420,370+Math.floor(i/2)*300,[-6,5,4,-5,-3,7][i],e,tx,1)}</g>`;}).join('')
      +(t>=15.8?Array.from({length:10}).map((_,i)=>`<path d="M${100+i*95},${200+((i*137)%600)} l40,70 l-30,50 l60,80" stroke="#fff" stroke-width="7" fill="none" opacity="${.7*(1-k)}"/>`).join(''):'')); }
  else if(t<21.1){ const txt=Array.from({length:8}).map((_,i)=>{const q=(t*.4+i/8)%1;return `<text x="${120+(i*233)%840}" y="${300+((i*317)%900)}" font-size="${40+q*30}" fill="#cfd6ff" opacity="${Math.sin(q*Math.PI)*.8}">สบายดีไหม</text>`;}).join('');
    s=Wz(t-17.45,bedHead(t,{mush:true,eyesKind:'open'})+txt+`<g transform="translate(760,1140)"><rect x="-60" y="-100" width="120" height="200" rx="18" fill="#1b1830" stroke="${OL}" stroke-width="6"/><rect x="-48" y="-86" width="96" height="172" rx="10" fill="#9fd8ff" opacity="${.6+.3*Math.sin(t*6)}"/><circle cx="40" cy="-90" r="24" fill="#ff3b5c"/><text x="40" y="-80" text-anchor="middle" font-size="28" font-weight="800" fill="#fff">1</text></g>`); }
  else if(t<25.65){ s=gaugeScene(t,21.1,55,30,24.2,t>=24.2?`<text x="850" y="${560+((t*200)%300)}" font-size="90">📉</text>`:''); }
  else s=endCard(t,25.65,'วันที่ 23 เริ่มแล้ว',8,'ตอนหน้า: จะตอบ หรือไม่ตอบ? 🤔',27.8,'ช่วยคิดหน่อย...',28.8,30.4);
  return finish(t,s,9,25.65,moveon,[24.2]);
}
function chopsticks(x,y,r){return `<g transform="translate(${x},${y}) rotate(${r})"><path d="M0,0 L-260,-20 M0,22 L-260,8" stroke="#b07a3c" stroke-width="12" stroke-linecap="round"/></g>`;}
