const SUBS=[
 [0.15,1.5,'วันที่ 11...'],[1.5,3.1,'แต่งหน้าจัดเต็ม 💄'],[3.1,5.1,'ถ่ายเซลฟี่ไปร้อยรูป 📸'],
 [5.2,7.1,'ลงสตอรี่ แคปชั่นว่า...'],[7.1,10.3,'"ชีวิตดีมาก\nไม่ได้คิดถึงใครเลย ✨"'],
 [10.4,12.0,'ห้านาทีผ่านไป...'],[12.0,13.6,'เขายังไม่ดู 👀'],
 [13.75,14.8,'รีเฟรช...'],[14.8,15.7,'รีเฟรช...'],[15.7,17.6,'รีเฟรชไปห้าสิบรอบ 🔄'],
 [17.8,19.2,'คนดูมีแค่แม่...'],[19.2,20.8,'กับเพื่อนสองคน'],
 [20.95,23.0,'ลงสตอรี่ให้คนที่ไม่ดู...'],[23.0,25.0,'เหมือนร้องเพลง\nให้ห้องว่าง 🎤'],
 [25.15,26.4,'จบวันที่ 11'],[26.4,28.5,'มูฟออนติดลบ 5%'],
];
const END=35;
const moveon=t=>t<26.6?0:-5;
function vanity(t){return `<rect width="1080" height="1920" fill="#ffd6e0"/><rect x="190" y="230" width="700" height="760" rx="350" fill="#fff" stroke="#e8a0b4" stroke-width="20"/>${[0,1,2,3,4,5,6,7].map(i=>{const a=i/8*Math.PI*2;return `<circle cx="${540+Math.cos(a)*400}" cy="${610+Math.sin(a)*440}" r="22" fill="#fff6c9" stroke="#e8a0b4" stroke-width="5"/>`}).join('')}
 <rect y="1500" width="1080" height="420" fill="#e8a0b4"/><g transform="translate(160,1470)"><rect x="-20" y="-90" width="40" height="90" rx="8" fill="#ff3b5c"/><rect x="-24" y="-20" width="48" height="40" fill="#333"/></g><g transform="translate(900,1470) rotate(20)"><rect x="-10" y="-130" width="20" height="130" fill="#b07a3c"/><path d="M-22,-130 Q0,-200 22,-130Z" fill="#555"/></g>`;}
function storyEditor(t){const cap='ชีวิตดีมาก ✨ ไม่ได้คิดถึงใครเลย';const n=Math.floor(clamp((t-7.15)/1.6)*cap.length);
  return `<rect x="226" y="276" width="628" height="1368" rx="58" fill="#ff8fa3"/><g transform="translate(540,980) scale(.55)">${me({t,expr:'happy',pose:'down',x:0,y:300,s:1,mush:true})}</g>
  <rect x="250" y="${n?560:9999}" width="580" height="${cap.length>16?150:90}" rx="20" fill="#0008"/><text x="540" y="620" text-anchor="middle" font-size="38" font-weight="700" fill="#fff">${cap.slice(0,Math.min(n,cap.indexOf('ไม่')))}</text><text x="540" y="672" text-anchor="middle" font-size="38" font-weight="700" fill="#fff">${n>cap.indexOf('ไม่')?cap.slice(cap.indexOf('ไม่'),n):''}</text>
  <g transform="translate(700,1560) scale(${t>=9.5&&t<9.75?.9:1})"><rect x="-110" y="-45" width="220" height="90" rx="45" fill="#fff"/><text y="14" text-anchor="middle" font-size="38" font-weight="700" fill="#222">แชร์ ➤</text></g>`;}
function emptyHall(t){return `<rect width="1080" height="1920" fill="#120f1f"/><path d="M540,0 L180,1520 L900,1520Z" fill="#fff6c9" opacity=".18"/>`+Array.from({length:3}).map((_,r)=>Array.from({length:6}).map((_,c)=>`<path d="M${70+c*170},${1600+r*110} h120 v-60 a60,40 0 0 0 -120,0Z" fill="#3a2f55" stroke="#251d38" stroke-width="5"/>`).join('')).join('');}
function scene(t){
  let s='';
  if(t<5.1){ const n=t<3.15?0:Math.min(100,Math.floor((t-3.15)*55)), fl=t>=3.15&&(t*6)%1<.15;
    s=Wz(t,vanity(t)+me({t,expr:t<3.15?'happy':'happy',pose:t<3.15?'down':'phone',x:540,y:1250,s:.9,mush:true,talk:true},`<ellipse cx="-62" cy="-360" rx="35" ry="12" fill="#c77dff" opacity=".6"/><ellipse cx="62" cy="-360" rx="35" ry="12" fill="#c77dff" opacity=".6"/><path d="M-26,-246 Q0,-232 26,-246" stroke="#ff3b5c" stroke-width="12" fill="none"/>`)
      +sparkles(t,[[250,500],[830,520]])+(n?`<g transform="translate(850,1650)"><rect x="-150" y="-55" width="300" height="110" rx="55" fill="#222"/><text y="18" text-anchor="middle" font-size="48" font-weight="800" fill="#fff">📸 x${n}</text></g>`:'')+`<rect width="1080" height="1920" fill="#fff" opacity="${fl?.6:0}"/>`); }
  else if(t<10.3){ s=Wz(t-5.1,phone(t,storyEditor(t))+(t>=9.4?thumb(700,1630-ease(P(t,9.2,.3))*60+60):'')); }
  else if(t<13.65){ s=Wz(t-10.3,bedroom(t)+me({t,expr:t<12.0?'neutral':'sad',pose:'phone',glow:true,x:540,y:1200,mush:true,talk:true})+label(540,560,'⏱️ 5 นาทีต่อมา...',P(t,10.4,.3),-4)); }
  else if(t<17.7){ const pulls=[13.85,14.85,15.8,16.2,16.5,16.8], last=pulls.filter(x=>t>=x).pop()||13.7, k=P(t,last,.3), cnt=t<15.8?pulls.filter(x=>t>=x).length:Math.min(50,3+Math.floor((t-15.8)*28));
    s=Wz(t-13.7,phone(t,viewers(t,[['แม่ ❤️','#ffb3c1'],['พี่ฝน','#6cc4a1'],['มายด์','#ffd166']])+`<g transform="translate(540,${470+Math.sin(k*Math.PI)*90})"><circle r="40" fill="#fff" stroke="#ccc" stroke-width="4"/><path d="M-20,0 A20,20 0 1 1 0,20" stroke="#3b82f6" stroke-width="7" fill="none" transform="rotate(${t*720})"/></g>`+thumb(540,900+Math.sin(k*Math.PI)*200+60))
      +`<g transform="translate(540,1780) scale(${1+.1*Math.sin(k*Math.PI)})"><rect x="-170" y="-55" width="340" height="110" rx="55" fill="#ff3b5c"/><text y="18" text-anchor="middle" font-size="50" font-weight="800" fill="#fff">🔄 x${cnt}</text></g>`); }
  else if(t<20.9){ const list=[['แม่ ❤️','#ffb3c1'],['พี่ฝน','#6cc4a1'],['มายด์','#ffd166']].slice(0,t<19.3?1:3);
    s=Wz(t-17.7,phone(t,viewers(t,list)+`<text x="540" y="1100" text-anchor="middle" font-size="40" fill="#bbb">ไม่มี ex.jaa_ 🦗</text>`)); }
  else if(t<25.05){ s=Wz(t-20.9,emptyHall(t)+me({t,expr:'sad',pose:'fist',x:540,y:1250,s:.9,mush:true},`<g transform="translate(250,-200) rotate(20)"><rect x="-14" y="0" width="28" height="120" rx="8" fill="#333"/><circle r="30" fill="#777" stroke="${OL}" stroke-width="5"/></g>`)+`<text x="540" y="${560+Math.sin(t*2)*10}" text-anchor="middle" font-size="80" opacity=".8">🦗</text>`); }
  else if(t<28.6){ s=Wz(t-25.05,bedHead(t,{mush:true,eyesKind:'open'})+label(300,700,'รอเขาดู... 👀',P(t,25.3,.3))); }
  else s=endCard(t,28.6,'วันที่ 12 เริ่มแล้ว',19,'ตอนหน้า: แม่โทรมา 📞',30.2,'จะว่ายังไง...?',31.35,32.5);
  return finish(t,s,20,28.6,moveon,[26.6]);
}
