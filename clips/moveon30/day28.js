const SUBS=[
 [0.0,1.4,'วันที่ 28...'],[1.4,4.5,'เขียนจดหมายถึงตัวเอง\nเมื่อสามสิบวันก่อน ✉️'],
 [4.5,5.6,'"ถึงฉัน..."'],[5.6,8.2,'"ที่นั่งส่องไอจีเขา\nตอนตีสอง"'],
 [8.2,9.85,'"ไม่ต้องรีบหายนะ"'],[9.85,12.6,'"ร้องไห้ได้\nกินมาม่าได้"'],
 [12.6,14.2,'"ไม่ต้องเก่งทุกวัน..."'],[14.2,16.1,'"แค่ไม่ยอมแพ้ก็พอ"'],
 [16.1,18.5,'"อีกไม่นาน เธอจะ\nหัวเราะได้อีกครั้ง..."'],[18.5,20.1,'"ฉันสัญญา" 🤍'],
 [20.15,21.7,'จบวันที่ 28'],[21.7,23.6,'มูฟออน 90%'],
];
const END=31;
const moveon=t=>t<21.9?85:90;
const sepia=`<rect width="1080" height="1920" fill="#c9a46b" opacity=".28"/><rect width="1080" height="1920" fill="none" stroke="#f4e4c1" stroke-width="40"/>`;
const pastTag=k=>`<g transform="translate(830,1720) rotate(-4) scale(${back(k)})"><rect x="-170" y="-50" width="340" height="100" rx="14" fill="#f4e4c1" stroke="${OL}" stroke-width="5"/><text y="16" text-anchor="middle" font-size="40" font-weight="700" fill="${OL}">⏪ 30 วันก่อน</text></g>`;
function desk(t){return `<rect width="1080" height="1920" fill="#2b2440"/><circle cx="820" cy="420" r="260" fill="#ffd166" opacity=".18"/><path d="M760,300 L880,300 L920,420 L720,420Z" fill="#ffd166" stroke="${OL}" stroke-width="6"/><path d="M820,420 V560" stroke="#555" stroke-width="12"/><rect y="1460" width="1080" height="460" fill="#8b5e34"/>`;}
function letter(t,k){const lines=['ถึงฉัน...','ไม่ต้องรีบหายนะ','ร้องไห้ได้ กินมาม่าได้','แค่ไม่ยอมแพ้ก็พอ','ฉันสัญญา 🤍'];
  return `<g transform="translate(540,1600) rotate(-3)"><rect x="-300" y="-130" width="600" height="300" rx="10" fill="#fffaf0" stroke="${OL}" stroke-width="6"/>${lines.slice(0,Math.ceil(k*5)).map((l,i)=>`<text x="-260" y="${-80+i*50}" font-size="34" fill="#4a3426">${l}</text>`).join('')}</g>`;}
function scene(t){
  let s='';
  if(t<4.5){ s=Wz(t,desk(t)+me({t,expr:'happy',pose:'down',x:540,y:1320,s:.9,mush:true,talk:true})+letter(t,P(t,1.4,3))+`<g transform="translate(${700+Math.sin(t*6)*20},1550) rotate(30)"><rect x="-10" y="-120" width="20" height="140" fill="#ff8fa3"/><path d="M-10,20 L0,50 L10,20Z" fill="#333"/></g>`); }
  else if(t<8.2){ s=Wz(t-4.5,bedroom(t)+me({t,expr:'sad',pose:'phone',glow:true,x:540,y:1200,talk:false})+sepia+pastTag(P(t,4.6,.3))); }
  else if(t<12.6){ s=Wz(t-8.2,kitchen(t)+me({t,expr:'cry',pose:'bowl',tears:true,x:600,y:1210})+sepia+pastTag(1)); }
  else if(t<16.1){ s=Wz(t-12.6,bedroom(t,.2)+me({t,expr:'sad',pose:'down',x:540,y:1250,s:.95})+sepia+pastTag(1)
      +(t>=14.2?`<g transform="translate(540,600) scale(${back(P(t,14.2,.35))})"><path transform="scale(2)" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#fff" stroke="${OL}" stroke-width="3"/><path d="M0,-90 L-20,-30 L16,0 L-8,50" stroke="${OL}" stroke-width="6" fill="none"/></g>`:'')); }
  else if(t<20.1){ const k=P(t,16.1,1.2);
    s=Wz(t-16.1,rays(t,'#ffd8a8','#ffe8c7',540,800,.55)+me({t,expr:'happy',pose:'down',x:540,y:1300,s:.95,mush:true,talk:true})+`<g opacity="${1-k}">${sepia}</g>`+(t>=18.5?sparkles(t,[[230,620],[850,640],[220,1000],[870,1020]]):'')); }
  else if(t<23.7){ s=gaugeScene(t,20.1,85,90,21.9); }
  else s=endCard(t,23.7,'วันที่ 29 เริ่มแล้ว',2,'ตอนหน้า: กล่องใต้เตียง 📦',25.8,'ถึงเวลาแล้ว...',27.0,28.5);
  return finish(t,s,3,23.7,moveon,[21.9]);
}
