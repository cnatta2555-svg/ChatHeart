PAL.o1=['#f6c9a4','#3a2a3f','#ffd166','#e6b84c'];PAL.o2=['#f6c9a4','#3a2a3f','#7ee0b5','#5fbf97'];PAL.o3=['#f6c9a4','#3a2a3f','#9b5de5','#7b3fc4'];
const SUBS=[
 [0.0,1.3,'วันที่ 27...'],[1.3,4.5,'หนุ่มฟิตเนสคนนั้น\nชวนไปกินกาแฟ ☕'],
 [4.5,5.75,'ลองชุดไปสามชุด...'],[5.75,7.85,'สุดท้ายใส่ฮู้ดตัวเดิม 😅'],
 [7.9,9.55,'คุยกันสองชั่วโมง...'],[9.55,11.95,'ไม่มีพูดถึงแฟนเก่า\nเลยสักคำ'],
 [11.95,15.2,'เขาหัวเราะกับ\nมุกห่วยๆ ของฉันด้วย 😂'],
 [15.2,16.85,'ยังไม่รู้หรอกว่าจะไปต่อไหม...'],[16.85,19.2,'แต่ใจมันเต้นแบบสบายๆ 💓'],
 [19.25,20.7,'จบวันที่ 27'],[20.7,23.2,'มูฟออน 85%'],
];
const END=31;
const moveon=t=>t<21.0?80:85;
function scene(t){
  let s='';
  if(t<4.5){ s=Wz(t,phone(t,`<rect x="226" y="276" width="628" height="150" fill="#f3f3f3"/><circle cx="300" cy="370" r="40" fill="#3b82f6"/><text x="360" y="385" font-size="40" font-weight="700" fill="#222">ภูมิ 💪</text>`+(t>=1.4?`<g transform="translate(250,560) scale(${back(P(t,1.4,.35))})"><rect width="520" height="100" rx="40" fill="#eee"/><text x="30" y="65" font-size="38" fill="#222">ว่างไหม ไปกินกาแฟกัน ☕</text></g>`:''))+(t>=2.5?`<text x="540" y="1790" text-anchor="middle" font-size="90">😳💓</text>`:'')); }
  else if(t<7.85){ const pal=t<4.9?'o1':t<5.3?'o2':t<5.75?'o3':'me';
    s=Wz(t-4.5,`<rect width="1080" height="1920" fill="#ffe3ec"/><rect x="190" y="230" width="700" height="900" rx="30" fill="#fff" stroke="#e8a0b4" stroke-width="16"/>`+who({t,expr:pal==='me'?'happy':'neutral',pose:'down',x:540,y:1350,s:.95,mush:true},pal)
      +`<g transform="translate(860,500)"><rect x="-120" y="-50" width="240" height="100" rx="20" fill="#222"/><text y="18" text-anchor="middle" font-size="48" font-weight="800" fill="#fff">${pal==='me'?'✓ ตัวเดิม':'ชุดที่ '+({o1:1,o2:2,o3:3}[pal])}</text></g>`); }
  else if(t<15.2){ const laugh=t>=11.95;
    s=Wz(t-7.85,`<rect width="1080" height="1920" fill="#e9d5c0"/><rect y="0" width="1080" height="180" fill="#d4b896"/><g transform="translate(540,420)"><circle r="110" fill="#fff" stroke="${OL}" stroke-width="10"/><path d="M0,0 L${70*Math.sin(t*3)},${-70*Math.cos(t*3)}" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M0,0 L${45*Math.sin(t*.25)},${-45*Math.cos(t*.25)}" stroke="#ff3b5c" stroke-width="10" stroke-linecap="round"/></g>`
      +me({t,expr:'happy',pose:'down',x:280,y:1330,s:.8,mush:true,talk:!laugh})+who({t,expr:'happy',pose:'down',x:800,y:1330,s:.8,male:true,talk:laugh,shake:laugh?4:0},'guy')
      +`<rect x="80" y="1460" width="920" height="60" rx="14" fill="#a0673d" stroke="${OL}" stroke-width="6"/>`+(laugh?`<text x="860" y="760" font-size="90">😂</text>`:'')); }
  else if(t<19.25){ const b=1+.08*Math.max(0,Math.sin(t*4))**6;
    s=Wz(t-15.2,`<rect width="1080" height="1920" fill="#ffd1dc"/>`+`<path transform="translate(540,560) scale(${2.6*b})" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff8fa3" opacity=".8"/>`+me({t,expr:'happy',pose:'down',x:540,y:1350,s:.95,mush:true,talk:true})); }
  else if(t<23.3){ s=gaugeScene(t,19.25,80,85,21.0); }
  else s=endCard(t,23.3,'วันที่ 28 เริ่มแล้ว',3,'ตอนหน้า: จดหมายถึงตัวเอง ✉️',25.9,'ถึงฉันเมื่อ 30 วันก่อน...',26.8,28.5);
  return finish(t,s,4,23.3,moveon,[21.0]);
}
