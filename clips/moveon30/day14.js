const SUBS=[
 [0.1,1.5,'วันที่ 14...'],[1.5,3.3,'ครบสองสัปดาห์แล้ว'],
 [3.35,4.8,'ได้ผมทรงเห็ด 🍄'],[4.8,6.6,'ได้กล้ามแขนนิดนึง 💪'],
 [6.7,8.4,'กดอันฟอลโลว์เขาได้'],[8.4,11.2,'แล้วก็ได้กินข้าว\nฝีมือแม่ 🍲'],
 [12.3,14.0,'ไลก์เดียวของเขา...'],[14.0,16.0,'ทำใจสั่นทั้งคืน'],
 [16.25,17.6,'แต่รู้อะไรไหม...'],[17.6,19.6,'ฉันไม่ได้ตอบ\nอะไรกลับไปเลย 😎'],
 [19.85,21.8,'มูฟออน 10%'],[21.8,23.3,'ครึ่งทางแล้ว! 🏁'],
 [23.5,24.4,'ถ้าเป็นคุณ...'],[24.4,26.9,'แฟนเก่ามาไลก์สตอรี่\nจะตอบไหม? 🤔'],[27.0,28.4,'คอมเมนต์บอกหน่อย 👇'],
];
const END=35.5;
const moveon=t=>t<20.0?-15:10;
function scene(t){
  let s='';
  if(t<3.3){ s=Wz(t,bedroom(t)+me({t,expr:'neutral',pose:'down',x:540,y:1300,s:.85,mush:true,talk:true})+lineChart(t,P(t,.3,2.8),'กราฟมูฟออน สัปดาห์ที่ 2',[-15,-10,0,-5,5,-15,10],['D8','D9','D10','D11','D12','D13','D14'])); }
  else if(t<12.2){ s=Wz(t-3.3,board(t,[[3.4,'🍄','ทรงเห็ด'],[4.9,'💪','กล้ามแขน'],[6.75,'🚫','อันฟอลโลว์'],[8.5,'🍲','ข้าวฝีมือแม่']])); }
  else if(t<16.1){ s=Wz(t-12.2,`<rect width="1080" height="1920" fill="#2a1030"/>`+notif(540,520,P(t,12.35,.4),'ถูกใจสตอรี่ของคุณ ❤️')+me({t,expr:'sweat',pose:'down',x:540,y:1300,s:.9,mush:true,sweatDrop:true,talk:true,shake:t>=14?3:0})); }
  else if(t<19.75){ const proud=t>=17.6;
    s=Wz(t-16.1,(proud?rays(t,'#ff8fa3','#ffb3c1',540,1000):bedroom(t))+me({t,expr:proud?'happy':'neutral',pose:proud?'fist':'down',x:540,y:1300,s:.9,mush:true,talk:!proud})
      +(proud?`<g transform="translate(540,480) rotate(-5) scale(${back(P(t,17.7,.35))})"><rect x="-330" y="-110" width="660" height="220" rx="26" fill="#2e7d5b" stroke="#fff" stroke-width="10"/><text y="-15" text-anchor="middle" font-size="56" font-weight="800" fill="#fff">ตอบกลับเขา</text><text y="75" text-anchor="middle" font-size="80" font-weight="800" fill="#ffd166">0 ครั้ง ✅</text></g>`+sparkles(t,[[180,450],[900,520],[220,880],[880,900]]):'')); }
  else if(t<23.4){ const v=Math.round(-15+25*ease(P(t,19.9,.8))), g=v>0;
    s=Wz(t-19.75,(g?rays(t,'#2e7d5b','#7ee0b5',540,700,.45):`<rect width="1080" height="1920" fill="#1b2340"/>`)+gauge(t,19.75,v,g?'#2e7d5b':'#ff3b5c')+(g?fireworks(t,20.7):'')
      +`<g transform="translate(540,1000)"><rect x="-380" y="-30" width="760" height="60" rx="30" fill="#fff3"/><rect x="-380" y="-30" width="${760*14/30*ease(P(t,21.8,.8))}" height="60" rx="30" fill="#ffd166"/><text y="100" text-anchor="middle" font-size="44" font-weight="800" fill="#fff" opacity="${P(t,21.8,.3)}">14 / 30 วัน 🏁</text></g>`
      +me({t,expr:g?'happy':'neutral',pose:g?'fist':'down',x:540,y:1560,s:.65,mush:true})); }
  else if(t<28.5){ const vote=(x,col,txt,k)=>`<g transform="translate(${x},560) scale(${back(k)})"><rect x="-200" y="-90" width="400" height="180" rx="40" fill="${col}" stroke="#fff" stroke-width="8"/><text y="25" text-anchor="middle" font-size="64" font-weight="800" fill="#fff">${txt}</text></g>`;
    s=Wz(t-23.4,rays(t,'#7c6cd6','#9b8cf0',540,900)+vote(290,'#3b82f6','ตอบ 💬',P(t,24.6,.3))+vote(790,'#ff3b5c','ไม่ตอบ 🙅',P(t,25.2,.3))
      +`<text x="540" y="580" text-anchor="middle" font-size="60" font-weight="800" fill="#fff" opacity="${P(t,24.6,.3)}">VS</text>`+me({t,expr:'happy',pose:'down',x:540,y:1350,s:1.1,mush:true,talk:true})); }
  else s=endCard(t,28.5,'สัปดาห์ที่ 3 เริ่มแล้ว',16,'ตอนหน้า: ไปทะเลคนเดียว 🌊',30.35,'หัวใจจะหายไหม...?',31.25,32.6);
  return finish(t,s,17,28.5,moveon,[20.0]);
}
