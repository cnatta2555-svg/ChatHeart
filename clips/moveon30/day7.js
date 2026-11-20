const SUBS=[
 [0.25,1.6,'วันที่ 7...'],[1.6,3.7,'ครบหนึ่งสัปดาห์แล้ว'],
 [3.8,5.9,'ส่องไอจี กดไลก์'],[5.9,8.4,'จำเบอร์ได้\nทิ้งของขวัญไม่ลง'],
 [8.5,10.2,'ร้องไห้กับลุงแท็กซี่'],[10.2,12.0,'แล้วก็ทำมือถือพัง'],
 [12.5,13.8,'ฟังดูแย่ใช่ไหม...'],[13.8,14.8,'แต่รู้อะไรไหม'],[14.8,16.9,'ฉันยังไม่ได้ทักเขา\nเลยสักครั้ง!'],
 [17.0,19.1,'มูฟออนติดลบ 20%'],[19.1,20.5,'แต่ไม่ได้ยอมแพ้ 💪'],
 [20.55,22.1,'ใครกำลังมูฟออนอยู่เหมือนกัน'],[22.1,24.5,'คอมเมนต์บอกหน่อย\nตอนนี้กี่เปอร์เซ็นต์แล้ว 👇'],
];
const END=31;
const moveon=t=>t<17.5?-25:-20;
const VALS=[-20,-25,-30,-40,-30,-25,-20];
function chart(t,k){ // line chart of D1..D7
  const x0=180,x1=900,y0=420,yz=300; const pts=VALS.map((v,i)=>[x0+i*(x1-x0)/6,y0+(-v)*6]);
  const n=Math.max(1,Math.min(7,Math.floor(k*7)+1));
  const path='M'+pts.slice(0,n).map(p=>p.join(',')).join(' L');
  return `<g><rect x="110" y="250" width="860" height="520" rx="30" fill="#fff" stroke="${OL}" stroke-width="8"/><text x="540" y="320" text-anchor="middle" font-size="42" font-weight="800" fill="${OL}">กราฟมูฟออน สัปดาห์ที่ 1</text>
   <path d="M${x0},${y0} H${x1}" stroke="#ccc" stroke-width="4" stroke-dasharray="12 10"/><text x="${x0-20}" y="${y0+12}" text-anchor="end" font-size="28" fill="#999">0</text>
   <path d="${path}" stroke="#ff3b5c" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
   ${pts.slice(0,n).map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="14" fill="#ff3b5c" stroke="#fff" stroke-width="4"/><text x="${p[0]}" y="745" text-anchor="middle" font-size="28" fill="#666">D${i+1}</text>`).join('')}</g>`;
}
function polaroid(x,y,rot,emo,txt,k){return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${back(k)*.82})"><rect x="-140" y="-150" width="280" height="300" rx="10" fill="#fff" stroke="${OL}" stroke-width="6"/><rect x="-115" y="-125" width="230" height="190" fill="#ffe3ec"/><text y="15" text-anchor="middle" font-size="110">${emo}</text><text y="120" text-anchor="middle" font-size="36" font-weight="700" fill="${OL}">${txt}</text><circle cx="0" cy="-150" r="14" fill="#ff3b5c" stroke="${OL}" stroke-width="4"/></g>`;}
function scene(t){
  let s='';
  if(t<3.7){ s=Wz(t,bedroom(t)+me({t,expr:'neutral',pose:'down',x:540,y:1300,s:.85,talk:true})+chart(t,P(t,.3,3))); }
  else if(t<12.2){ const lt=t-3.7;
    const items=[[3.85,'📱','ส่องไอจี'],[4.9,'❤️','นิ้วลั่น'],[6.0,'☎️','จำเบอร์ได้'],[7.1,'🎁','ทิ้งไม่ลง'],[8.6,'🚕','ร้องกับลุง'],[10.4,'📵','มือถือพัง']];
    s=Wz(lt,`<rect width="1080" height="1920" fill="#c99a6b"/><rect x="40" y="200" width="1000" height="1580" rx="24" fill="#d9ab7c" stroke="#8b5e34" stroke-width="20"/>`
      +items.map(([a,e,tx],i)=>t>=a?polaroid(330+(i%2)*420,370+Math.floor(i/2)*300,[-6,5,4,-5,-3,7][i],e,tx,P(t,a,.3)):'').join('')); }
  else if(t<17.0){ const lt=t-12.2, proud=t>=14.8;
    s=Wz(lt,(proud?rays(t,'#ff8fa3','#ffb3c1',540,1000):bedroom(t))+me({t,expr:proud?'happy':(t<13.8?'cry':'neutral'),pose:proud?'fist':'down',x:540,y:1280,s:.9,talk:!proud&&t>=13.8,tears:t<13.8})
      +(proud?`<g transform="translate(540,480) rotate(-5) scale(${back(P(t,14.9,.35))})"><rect x="-330" y="-110" width="660" height="220" rx="26" fill="#2e7d5b" stroke="#fff" stroke-width="10"/><text y="-15" text-anchor="middle" font-size="56" font-weight="800" fill="#fff">ทักเขาไปแล้ว</text><text y="75" text-anchor="middle" font-size="80" font-weight="800" fill="#ffd166">0 ครั้ง ✅</text></g>`+sparkles(t,[[180,450],[900,520],[220,880],[880,900]]):'')); }
  else if(t<20.5){ const lt=t-17.0;
    const g=`<g transform="translate(540,560) scale(${back(P(lt,0,.4))})"><circle r="230" fill="#fff" stroke="${OL}" stroke-width="10"/><path d="M-170,0 A170,170 0 0 1 170,0" stroke="#eee" stroke-width="40" fill="none"/><path d="M-170,0 A170,170 0 0 1 ${-170*Math.cos(Math.PI*(1-.4*ease(P(t,17.3,.8))))},${-170*Math.sin(Math.PI*(1-.4*ease(P(t,17.3,.8))))}" stroke="#ff6b81" stroke-width="40" fill="none"/><text y="90" text-anchor="middle" font-size="90" font-weight="800" fill="#ff3b5c">-20%</text></g>`;
    s=Wz(lt,bedroom(t,.15)+g+me({t,expr:t<19.1?'neutral':'determined',pose:t<19.1?'down':'fist',x:540,y:1350,s:.8,talk:t<19.1})); }
  else if(t<24.6){ const lt=t-20.5;
    const cm=[[22.2,'-50% 😭',380,430],[22.6,'10% แล้วจ้า ✨',700,560],[23.0,'-80% เพิ่งเลิกเมื่อวาน',420,690],[23.4,'100% มีคนใหม่แล้ว 😎',660,820]];
    s=Wz(lt,rays(t,'#7c6cd6','#9b8cf0',540,900)+me({t,expr:'happy',pose:'down',x:540,y:1350,s:1.15,talk:true})
      +cm.map(([a,tx,x,y])=>t>=a?`<g transform="translate(${x},${y}) scale(${back(P(t,a,.3))})"><rect x="${-tx.length*12-50}" y="-42" width="${tx.length*24+100}" height="84" rx="42" fill="#fff" stroke="${OL}" stroke-width="5"/><text y="14" text-anchor="middle" font-size="34" fill="${OL}">💬 ${tx}</text></g>`:'').join('')); }
  else s=endCard(t,24.6,'สัปดาห์ที่ 2 เริ่มแล้ว',23,'ตอนหน้า: ตัดผมใหม่ ✂️',26.0,'ชีวิตใหม่ ✨',27.7,28.6);
  return finish(t,s,24,24.6,moveon,[17.5]);
}
