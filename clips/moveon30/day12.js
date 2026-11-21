const SUBS=[
 [0.15,1.5,'วันที่ 12...'],[1.5,2.8,'แม่โทรมา 📞'],
 [2.9,4.6,'"ลูก... แฟนสบายดีไหม"'],[4.6,5.9,'"ไม่เห็นพามาบ้านเลย"'],
 [5.95,7.2,'...'],
 [7.25,8.35,'เลิกกันแล้วแม่...'],[8.35,10.0,'สามเดือนแล้ว 😢'],
 [10.2,11.85,'"งั้นกลับบ้านมากินข้าวนะลูก"'],[11.85,13.6,'"แม่ทำต้มยำไว้ให้ 🍲"'],
 [14.1,15.6,'แม่ไม่ถามอะไรเลย...'],[15.6,17.6,'แค่ตักกับข้าวให้ไม่หยุด'],
 [18.05,19.4,'เลิกกับแฟนได้...'],[19.4,21.5,'แต่บ้านยังรอเราเสมอ 🏠❤️'],
 [21.9,23.2,'จบวันที่ 12'],[23.2,24.8,'มูฟออน 5%'],[24.8,25.9,'บวกแล้ว!! 🎉'],
];
const END=33;
const moveon=t=>t<23.4?-5:5;
function mom(o){return who(o,'mom');}
function homeKitchen(t){return `<rect width="1080" height="1920" fill="#ffe8b8"/><rect y="0" width="1080" height="160" fill="#f4d28f"/><rect x="620" y="260" width="380" height="300" rx="16" fill="#bfe6ff" stroke="#c99a6b" stroke-width="16"/><path d="M810,260 V560 M620,410 H1000" stroke="#c99a6b" stroke-width="10"/>
 <g transform="translate(180,330)"><rect x="-90" y="-70" width="180" height="140" rx="10" fill="#fff" stroke="#c99a6b" stroke-width="8"/><text y="20" text-anchor="middle" font-size="70">👨‍👩‍👧</text></g>
 <rect y="1500" width="1080" height="420" fill="#d9a066"/><rect y="1500" width="1080" height="30" fill="#b9844e"/>`;}
function pot(x,y,t){return `<g transform="translate(${x},${y})"><path d="M-170,-60 L170,-60 L150,90 Q0,130 -150,90Z" fill="#c0c7d1" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="-60" rx="170" ry="35" fill="#ff7b3d" stroke="${OL}" stroke-width="7"/><circle cx="-60" cy="-62" r="14" fill="#ff3b5c"/><circle cx="40" cy="-58" r="12" fill="#7ee0b5"/><rect x="-10" y="-70" width="40" height="14" rx="6" fill="#fff"/>${[0,1,2].map(i=>{const k=(t*.7+i/3)%1;return `<path d="M${-70+i*70},${-90-k*200} q-20,-30 0,-60 t0,-60" stroke="#fff" stroke-width="10" fill="none" opacity="${.6*(1-k)}" stroke-linecap="round"/>`}).join('')}</g>`;}
function scene(t){
  let s='';
  if(t<2.85){ const vib=Math.sin(t*60)*6;
    s=Wz(t,`<g transform="translate(${vib},0)">`+phone(t,`<rect x="226" y="276" width="628" height="1368" rx="58" fill="#2e7d5b"/><circle cx="540" cy="620" r="130" fill="#ffd1dc"/><text x="540" y="670" text-anchor="middle" font-size="130">👩</text><text x="540" y="860" text-anchor="middle" font-size="70" font-weight="800" fill="#fff">แม่ ❤️</text><text x="540" y="930" text-anchor="middle" font-size="40" fill="#cfe">กำลังโทร...</text><circle cx="380" cy="1450" r="70" fill="#ff3b5c"/><circle cx="700" cy="1450" r="${70+6*Math.sin(t*10)}" fill="#34c759"/><text x="700" y="1475" text-anchor="middle" font-size="70">📞</text>`)+`</g>`); }
  else if(t<5.9){ s=Wz(t-2.85,homeKitchen(t)+mom({t,expr:'happy',pose:'phone',x:540,y:1250,s:.95,talk:true})); }
  else if(t<7.2){ const z=1+ease(P(t,5.9,1.2))*.35; s=`<g transform="translate(540,800) scale(${z}) translate(-540,-800)">`+bedroom(t)+me({t:5.9,expr:'shock',pose:'phone',x:540,y:1250,mush:true})+`</g><rect width="1080" height="1920" fill="#000" opacity=".3"/>`; }
  else if(t<10.1){ s=Wz(t-7.2,bedroom(t)+me({t,expr:'cry',pose:'phone',x:540,y:1200,tears:true,mush:true,talk:false})); }
  else if(t<13.9){ s=Wz(t-10.1,homeKitchen(t)+mom({t,expr:'happy',pose:'phone',x:380,y:1250,s:.9,talk:true})+pot(800,1440,t)); }
  else if(t<17.9){ const n=Math.min(9,Math.floor((t-14.2)*2.6)+1);
    const food=Array.from({length:n}).map((_,i)=>`<ellipse cx="${700+((i*37)%80)-40}" cy="${1440-i*28}" rx="${70-i*4}" ry="24" fill="${['#ff7b3d','#7ee0b5','#ffd166','#c96b5a','#fff'][i%5]}" stroke="${OL}" stroke-width="4"/>`).join('');
    s=Wz(t-13.9,homeKitchen(t)+mom({t,expr:'happy',pose:'fist',x:280,y:1250,s:.85,talk:false})+me({t,expr:'happy',pose:'down',x:740,y:1250,s:.85,mush:true,talk:true})
      +`<ellipse cx="540" cy="1560" rx="520" ry="90" fill="#8b5e34"/><ellipse cx="700" cy="1480" rx="120" ry="34" fill="#fff" stroke="${OL}" stroke-width="6"/>`+food+pot(320,1480,t)); }
  else if(t<21.6){ s=Wz(t-17.9,rays(t,'#ffb38a','#ffe0b3',540,800,.5)+me({t,expr:'happy',pose:'down',x:540,y:1250,s:.95,mush:true,tears:true,talk:true})+`<text x="540" y="${560+Math.sin(t*2)*12}" text-anchor="middle" font-size="150">🏠</text><path transform="translate(640,470) scale(.7)" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff3b5c"/>`); }
  else if(t<25.95){ const v=Math.round(-5+10*ease(P(t,23.3,.8))), g=v>0;
    s=Wz(t-21.6,(g?rays(t,'#2e7d5b','#7ee0b5',540,700,.45):`<rect width="1080" height="1920" fill="#1b2340"/>`)+gauge(t,21.6,v,g?'#2e7d5b':'#ff3b5c')+(t>=24.85?fireworks(t,24.85):'')+me({t,expr:g?'happy':'neutral',pose:g?'fist':'down',x:540,y:1500,s:.75,mush:true,talk:!g})); }
  else s=endCard(t,25.95,'วันที่ 13 เริ่มแล้ว',18,'ตอนหน้า: เขาไลก์สตอรี่ฉัน!! ❤️',27.75,'หมายความว่าไง...?',28.6,30.4);
  return finish(t,s,19,25.95,moveon,[23.4]);
}
