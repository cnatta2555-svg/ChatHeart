const SUBS=[
 [0.05,1.4,'วันที่ 25...'],[1.4,2.7,'เดินห้างกับเพื่อน 🛍️'],[2.7,4.6,'ช้อปปิ้งสบายใจ'],
 [4.75,6.1,'แล้วก็เห็นเขา...'],[6.1,7.9,'เดินมากับคนใหม่ 💑'],
 [8.0,10.4,'ร่างกายวิ่งไปหลบ\nหลังหุ่นโชว์อัตโนมัติ 🏃‍♀️'],
 [10.45,11.9,'พนักงานถามว่า...'],[11.9,14.4,'"น้องจะลองชุดหุ่น\nตัวนี้ไหมคะ" 😊'],
 [14.5,16.1,'แต่แล้วฉันก็คิดได้...'],[16.1,17.1,'ทำไมต้องหลบ?'],[17.1,18.8,'ฉันไม่ได้ทำอะไรผิด 😤'],
 [18.85,20.2,'เดินสวนกันไป...'],[20.2,22.4,'เขาทักว่า "หวัดดี" 👋'],
 [22.45,24.45,'ฉันยิ้ม พยักหน้า 🙂'],[24.45,25.6,'แล้วเดินต่อ...'],[25.6,27.4,'ไม่หันกลับไปมองเลย ✨'],
 [27.5,28.9,'จบวันที่ 25'],[28.9,31.5,'มูฟออน 65%'],
];
const END=39;
const moveon=t=>t<29.3?60:65;
function mall(t){
  const shops=[['#ff8fa3','FASHION 👗'],['#7c6cd6','SHOES 👟'],['#2e7d5b','CAFÉ ☕']];
  return `<rect width="1080" height="1920" fill="#f4f1ea"/><rect y="0" width="1080" height="170" fill="#e2ddd1"/>${[0,1,2,3,4,5].map(i=>`<rect x="${i*190+40}" y="40" width="120" height="90" rx="12" fill="#fff" opacity=".7"/>`).join('')}
  ${shops.map(([c,n],i)=>`<g transform="translate(${30+i*350},260)"><rect width="320" height="620" rx="14" fill="#fff" stroke="#ccc" stroke-width="6"/><rect width="320" height="110" rx="14" fill="${c}"/><text x="160" y="72" text-anchor="middle" font-size="40" font-weight="800" fill="#fff">${n}</text><rect x="30" y="150" width="260" height="440" fill="#dff1ff" opacity=".7"/></g>`).join('')}
  <rect y="1450" width="1080" height="470" fill="#e8e3d9"/>${Array.from({length:9}).map((_,i)=>`<path d="M${i*135},1450 L${i*135-200},1920" stroke="#d8d1c3" stroke-width="5"/>`).join('')}`;
}
function bags(x,y){return `<g transform="translate(${x},${y})"><rect x="-50" y="0" width="100" height="120" rx="8" fill="#ff8fa3" stroke="${OL}" stroke-width="5"/><path d="M-25,0 Q0,-40 25,0" stroke="${OL}" stroke-width="5" fill="none"/><rect x="40" y="20" width="80" height="100" rx="8" fill="#ffd166" stroke="${OL}" stroke-width="5"/></g>`;}
function mannequin(x,y,s){return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-8" y="250" width="16" height="200" fill="#aaa"/><ellipse cx="0" cy="450" rx="110" ry="24" fill="#999"/><circle cx="0" cy="-330" r="120" fill="#d9d9d9" stroke="${OL}" stroke-width="7"/><path d="M-140,-180 Q0,-230 140,-180 L220,300 L-220,300Z" fill="#c77dff" stroke="${OL}" stroke-width="8"/><path d="M-60,-200 Q0,-140 60,-200" stroke="#a05fd6" stroke-width="10" fill="none"/></g>`;}
function exPair(x,y,s,t,talk=false){return `<g>`+who({t,expr:'happy',pose:'down',x,y,s,male:true,talk},'ex')+who({t,expr:'happy',pose:'down',x:x+300*s,y,s},'gf')+`<path transform="translate(${x+150*s},${y-180*s}) scale(${s*1.3})" d="M0,30 C-70,-20 -50,-75 0,-45 C50,-75 70,-20 0,30Z" fill="#ff5c8a"/></g>`;}
function scene(t){
  let s='';
  if(t<4.65){ s=Wz(t,mall(t)+who({t,expr:'happy',pose:'down',x:280,y:1350,s:.8,talk:true},'f2')+me({t,expr:'happy',pose:'down',x:760,y:1330,s:.85,mush:true,talk:true})+bags(900,1450)+bags(150,1480)); }
  else if(t<7.95){ const z=1+ease(P(t,4.8,1))*.15;
    s=`<g transform="translate(540,960) scale(${z}) translate(-540,-960)">`+mall(t)+exPair(760-(t-4.65)*40,1120,.42,t)+me({t,expr:'shock',pose:'down',x:280,y:1450,s:.95,mush:true,shake:t<5.4?6:0})+`</g>`; }
  else if(t<10.45){ const k=ease(P(t,8.0,.6));
    s=Wz(t-7.95,mall(t)+exPair(700,1120,.42,t)+me({t,expr:'sweat',pose:'down',x:900-k*500,y:1330,s:.85,mush:true,sweatDrop:true})+mannequin(420,1000,.85)+Array.from({length:5}).map((_,i)=>`<path d="M${600+i*40},${1000+i*80} h${140+i*20}" stroke="#999" stroke-width="10" opacity="${(1-k)*.7}" stroke-linecap="round"/>`).join('')); }
  else if(t<14.45){ s=Wz(t-10.45,mall(t)+me({t,expr:'sweat',pose:'down',x:380,y:1330,s:.85,mush:true,sweatDrop:true})+mannequin(420,1000,.85)+who({t,expr:'happy',pose:'down',x:820,y:1300,s:.8,talk:t>=11.9},'staff')+(t>=11.9?speech(620,520,'ลองชุดหุ่นตัวนี้ไหมคะ? 😊',P(t,11.9,.3),null,'right'):'')); }
  else if(t<18.85){ const up=t>=16.1;
    s=Wz(t-14.45,(up?rays(t,'#ff8fa3','#ffc2d1',540,900,.5):mall(t)+mannequin(420,1000,.85))+me({t,expr:up?'determined':'neutral',pose:up?'fist':'down',x:540,y:1330,s:.95,mush:true,talk:true})); }
  else if(t<22.45){ s=Wz(t-18.85,mall(t)+me({t,expr:'neutral',pose:'down',x:300-(t-18.85)*20,y:1330,s:.85,mush:true})+who({t,expr:'happy',pose:'down',x:780+(t-18.85)*20,y:1330,s:.85,male:true,talk:t>=20.2},'ex')+(t>=20.3?speech(800,560,'หวัดดี 👋',P(t,20.3,.3),360,'right'):'')); }
  else if(t<27.45){ const walk=ease(P(t,24.5,2.8));
    s=Wz(t-22.45,rays(t,'#fff0f5','#ffd1dc',540,900,.6)+`<g opacity="${1-walk*.8}">`+who({t,expr:'neutral',pose:'down',x:880,y:1350,s:.7,male:true},'ex')+`</g>`+me({t:t*(walk>0?1.6:1),expr:'happy',pose:'down',x:460-walk*200,y:1330,s:.95,mush:true,talk:t<24.4})+(t>=25.6?label(540,560,'ไม่หันกลับ ✨',P(t,25.6,.3),-4):'')); }
  else if(t<31.6){ s=gaugeScene(t,27.45,60,65,29.3); }
  else s=endCard(t,31.6,'วันที่ 26 เริ่มแล้ว',5,'ตอนหน้า: ทำไมรู้สึกเฉยๆ 😐',33.55,'นี่คือหายแล้วเหรอ...?',34.7,36.0);
  return finish(t,s,6,31.6,moveon,[29.3]);
}
