const SUBS=[
 [0.1,1.4,'วันที่ 16...'],[1.4,4.5,'จะเลิกสั่งเดลิเวอรี่\nทำอาหารกินเอง! 💪'],
 [5.05,7.2,'เมนูแรก... ไข่เจียว 🍳'],[7.2,9.0,'น้ำมันกระเด็น\nเหมือนโดนยิง!!'],
 [9.0,10.4,'ไข่ไหม้... 🔥'],[10.4,12.6,'สัญญาณเตือนไฟ\nดังทั้งตึก 🚨'],
 [12.7,14.2,'ยามขึ้นมาถามว่า...'],[14.2,15.8,'"น้องเผาอะไรอยู่ครับ"'],
 [15.9,17.9,'ไหม้ไปครึ่งนึง...'],[17.9,21.2,'แต่เป็นไข่เจียวที่อร่อย\nที่สุดในชีวิต เพราะทำเอง 🥹'],
 [21.5,22.8,'จบวันที่ 16'],[22.8,25.3,'มูฟออน 20%'],
];
const END=33;
const moveon=t=>t<23.1?15:20;
function stove(t,burn,fire){
  const egg=`<ellipse cx="0" cy="-20" rx="110" ry="40" fill="${burn?`rgb(${255-burn*200},${220-burn*190},${120-burn*110})`:'#ffd166'}" stroke="${OL}" stroke-width="5"/>`;
  const splat=fire?'':Array.from({length:10}).map((_,i)=>{const k=((t*2+i/10)%1);const a=-Math.PI*(.1+.8*(i/10));return `<circle cx="${Math.cos(a)*k*420}" cy="${-40+Math.sin(a)*k*420}" r="${10*(1-k)+4}" fill="#ffcc4d" opacity="${1-k}"/>`;}).join('');
  const flames=fire?Array.from({length:6}).map((_,i)=>{const h=120+50*Math.sin(t*14+i*1.3);return `<path d="M${-150+i*60},-30 q-30,-${h*.5} 0,-${h} q30,${h*.5} 0,${h}Z" fill="${i%2?'#ff6a3d':'#ffd166'}" opacity=".9"/>`;}).join(''):'';
  return `<g transform="translate(540,1380)"><rect x="-330" y="20" width="660" height="140" rx="16" fill="#3a3f4b" stroke="${OL}" stroke-width="8"/><ellipse cx="0" cy="20" rx="220" ry="40" fill="#222" stroke="${OL}" stroke-width="8"/><path d="M200,10 L420,-30" stroke="#222" stroke-width="30" stroke-linecap="round"/>${egg}${splat}${flames}</g>`;
}
function smoke(t,k){return Array.from({length:6}).map((_,i)=>{const q=(t*.5+i/6)%1;return `<circle cx="${400+i*60+Math.sin(t+i)*60}" cy="${1250-q*900}" r="${60+q*120}" fill="#555" opacity="${k*.5*(1-q)}"/>`}).join('');}
function scene(t){
  let s='';
  if(t<5.0){ s=Wz(t,kitchen(t)+`<g transform="translate(830,1560)"><rect x="-110" y="-80" width="220" height="160" rx="16" fill="#2e7d5b"/><text y="20" text-anchor="middle" font-size="44" font-weight="800" fill="#fff">🛵 FOOD</text><path d="M-130,-100 L130,100 M130,-100 L-130,100" stroke="#ff3b5c" stroke-width="24" stroke-linecap="round" opacity="${P(t,1.6,.3)}"/></g>`
      +me({t,expr:'determined',pose:'fist',x:480,y:1260,s:.9,mush:true},apronMe)); }
  else if(t<7.15){ s=Wz(t-5.0,kitchen(t)+me({t,expr:'happy',pose:'down',x:540,y:1150,s:.75,mush:true,talk:true},apronMe)+stove(t,0,false).replace(/<circle[^>]*#ffcc4d[^>]*\/>/g,'')); }
  else if(t<9.0){ s=Wz(t-7.15,kitchen(t)+me({t,expr:'scream',pose:'face',x:540,y:1150,s:.75,mush:true,shake:7},apronMe)+stove(t,0,false)+`<text x="830" y="700" font-size="100" font-weight="800" fill="#ff3b5c" stroke="#fff" stroke-width="8" paint-order="stroke">ปิ้ว!</text>`); }
  else if(t<12.65){ const red=Math.sin(t*12)>0;
    s=Wz(t-9.0,kitchen(t)+smoke(t,P(t,9.0,.8))+me({t,expr:'shock',pose:'down',x:540,y:1150,s:.75,mush:true,shake:4},apronMe)+stove(t,P(t,9.0,.8),true)
      +`<g transform="translate(540,330)"><circle r="70" fill="${red&&t>=10.4?'#ff3b5c':'#888'}" stroke="${OL}" stroke-width="8"/><text y="25" text-anchor="middle" font-size="70">🚨</text></g><rect width="1080" height="1920" fill="#ff3b5c" opacity="${t>=10.4&&red?.18:0}"/>`); }
  else if(t<15.85){ s=Wz(t-12.65,`<rect width="1080" height="1920" fill="#d9c7a8"/><rect x="250" y="250" width="580" height="1300" fill="#8b5e34" stroke="${OL}" stroke-width="12"/><rect x="250" y="250" width="${580-ease(P(t,12.7,.5))*380}" height="1300" fill="#a0673d" stroke="${OL}" stroke-width="10"/><circle cx="${780-ease(P(t,12.7,.5))*380}" cy="900" r="22" fill="#ffd166"/>`+smoke(t,.6)
      +who({t,expr:t<14.2?'shock':'neutral',pose:'down',x:640,y:1250,s:.85,cap:true,male:true,talk:t>=14.2},'guard')); }
  else if(t<21.4){ s=Wz(t-15.85,rays(t,'#ffd8a8','#ffe8c7',540,900,.6)+me({t,expr:'happy',pose:'down',x:540,y:1250,s:.85,mush:true,talk:true,tears:t>=17.9},apronMe)+`<rect y="1480" width="1080" height="440" fill="#c98b4f"/><g transform="translate(540,1560)"><ellipse rx="260" ry="60" fill="#fff" stroke="${OL}" stroke-width="8"/><ellipse rx="160" ry="34" fill="#4a3426"/><ellipse cx="40" rx="90" ry="22" fill="#ffd166"/></g>`+(t>=17.9?sparkles(t,[[230,600],[850,640],[200,1000],[880,1000]]):'')); }
  else if(t<25.6){ s=gaugeScene(t,21.4,15,20,23.1); }
  else s=endCard(t,25.6,'วันที่ 17 เริ่มแล้ว',14,'ตอนหน้า: หนุ่มฟิตเนสยิ้มให้ 😳',27.2,'ใจจะไหวไหม...?',28.15,30.0);
  return finish(t,s,15,25.6,moveon,[23.1]);
}
