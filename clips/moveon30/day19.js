const SUBS=[
 [0.05,1.4,'วันที่ 19...'],[1.4,2.75,'เพื่อนนัดกินกาแฟ ☕'],[2.75,4.8,'บอกว่ามีเรื่องต้องเล่า...'],
 [5.2,6.75,'"แก... รู้ไหม"'],[6.75,8.05,'"คนใหม่ของเขาน่ะ"'],[8.05,10.6,'"คุยกันตั้งแต่ตอนที่\nเขายังคบกับแกอยู่"'],
 [10.65,12.2,'...'],
 [12.2,14.6,'ร้องไห้มาสองอาทิตย์...'],[14.6,16.6,'ให้คนแบบนี้เหรอ!! 😤'],
 [16.8,18.8,'แต่แปลกนะ...\nพอรู้ความจริง'],[18.8,20.5,'ใจมันเบาขึ้นเยอะเลย ☀️'],[20.5,22.7,'ไม่ต้องสงสัยแล้ว\nว่าเราทำอะไรผิด'],
 [23.2,24.6,'จบวันที่ 19'],[24.6,26.9,'มูฟออน 40%'],
];
const END=34;
const moveon=t=>t<25.0?25:40;
function cafe(t){return `<rect width="1080" height="1920" fill="#e9d5c0"/><rect y="0" width="1080" height="180" fill="#d4b896"/>${[0,1,2,3,4].map(i=>`<g transform="translate(${120+i*210},250)"><path d="M0,0 V60" stroke="#333" stroke-width="4"/><path d="M-40,60 h80 l-20,50 h-40Z" fill="#ffd166"/><circle cy="120" r="${18+4*Math.sin(t*3+i)}" fill="#fff6c9" opacity=".7"/></g>`).join('')}
 <g transform="translate(540,560)"><rect x="-250" y="-110" width="500" height="220" rx="14" fill="#3b2a1e"/><text y="-30" text-anchor="middle" font-size="44" font-weight="800" fill="#fff">☕ MENU</text><text y="30" text-anchor="middle" font-size="32" fill="#e9d5c0">ลาเต้ 65 · อเมริกาโน่ 55</text></g>
 <rect y="1480" width="1080" height="440" fill="#8b5e34"/>`;}
function cup(x,y,shake=0){return `<g transform="translate(${x+Math.sin(shake*80)*shake*6},${y})"><path d="M-50,-60 L50,-60 L40,40 L-40,40Z" fill="#fff" stroke="${OL}" stroke-width="6"/><path d="M50,-35 q35,0 30,30 q-5,25 -35,20" stroke="${OL}" stroke-width="6" fill="none"/><ellipse cy="-60" rx="50" ry="12" fill="#6b4226"/></g>`;}
function scene(t){
  let s='';
  if(t<5.15){ s=Wz(t,cafe(t)+who({t,expr:'sad',pose:'down',x:270,y:1300,s:.8,talk:t>=2.75},'f2')+me({t,expr:'happy',pose:'down',x:800,y:1300,s:.8,mush:true,talk:t<2.75})+`<rect x="80" y="1440" width="920" height="60" rx="14" fill="#a0673d" stroke="${OL}" stroke-width="6"/>`+cup(380,1430)+cup(700,1430)); }
  else if(t<10.65){ s=Wz(t-5.15,cafe(t)+`<rect width="1080" height="1920" fill="#000" opacity=".25"/>`+who({t,expr:'sad',pose:'down',x:540,y:1350,s:1.1,talk:true},'f2',`<g transform="translate(150,-250)"><circle r="34" fill="#f2d0b0" stroke="${OL}" stroke-width="7"/></g>`)+`<text x="200" y="620" font-size="110">🤫</text>`); }
  else if(t<12.2){ const z=1+ease(P(t,10.65,1.4))*.3; s=`<g transform="translate(540,900) scale(${z}) translate(-540,-900)">`+cafe(t)+me({t:10.65,expr:'shock',pose:'down',x:540,y:1300,s:.9,mush:true})+cup(540,1460,1)+`</g><rect width="1080" height="1920" fill="#000" opacity=".35"/>`+Array.from({length:6}).map((_,i)=>`<path d="M${200+i*130},${300+((i*97)%200)} l40,60 l-30,40 l50,70" stroke="#fff" stroke-width="6" fill="none" opacity=".6"/>`).join(''); }
  else if(t<16.7){ const angry=t>=14.6;
    s=Wz(t-12.2,(angry?`<rect width="1080" height="1920" fill="#5a1a2a"/>`+Array.from({length:9}).map((_,i)=>{const h=260+90*Math.sin(t*12+i*1.7);return `<path d="M${60+i*120},1700 q-60,-${h*.5} 0,-${h} q60,${h*.5} 0,${h}Z" fill="${i%2?'#ff6a3d':'#ffd166'}" opacity=".85"/>`;}).join(''):cafe(t))
      +me({t,expr:angry?'determined':'cry',pose:angry?'fist':'down',x:540,y:1300,s:.95,mush:true,tears:!angry,shake:angry?7:0})
      +(angry?[0,1].map(i=>{const k=(t*1.5+i*.5)%1;return `<circle cx="${430+i*220}" cy="${780-k*250}" r="${30+k*40}" fill="#fff" opacity="${.6*(1-k)}"/>`}).join(''):'')); }
  else if(t<22.9){ const k=ease(P(t,16.9,2));
    s=Wz(t-16.7,`<rect width="1080" height="1920" fill="${k>.5?'#8fd3ff':'#6b7a99'}"/><circle cx="540" cy="520" r="${120+k*40}" fill="#ffd166" opacity="${k}"/>`+Array.from({length:12}).map((_,i)=>`<path d="M540,520 L${540+900*Math.cos(i/12*Math.PI*2+t*.2)},${520+900*Math.sin(i/12*Math.PI*2+t*.2)}" stroke="#fff6c9" stroke-width="30" opacity="${k*.35}"/>`).join('')
      +`<g transform="translate(${-k*600},0)"><ellipse cx="300" cy="480" rx="260" ry="110" fill="#4a4f63"/></g><g transform="translate(${k*600},0)"><ellipse cx="800" cy="560" rx="280" ry="120" fill="#4a4f63"/></g>`
      +me({t,expr:t<18.8?'neutral':'happy',pose:t<20.5?'down':'fist',x:540,y:1350,s:.9,mush:true,talk:true})); }
  else if(t<26.95){ s=gaugeScene(t,22.9,25,40,25.0); }
  else s=endCard(t,26.95,'วันที่ 20 เริ่มแล้ว',11,'ตอนหน้า: ลบรูปคู่ทั้งหมด 🗑️',28.6,'จะกดได้ไหม...?',29.35,31.0);
  return finish(t,s,12,26.95,moveon,[25.0]);
}
