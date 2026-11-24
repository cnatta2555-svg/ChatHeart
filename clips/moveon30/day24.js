const SUBS=[
 [0.15,1.6,'วันที่ 24...'],[1.6,3.15,'ฉันตัดสินใจแล้ว ✍️'],
 [3.2,4.6,'พิมพ์ไปยาวเหยียด...'],[4.6,5.5,'ลบ'],[5.5,6.5,'พิมพ์ใหม่...'],[6.5,7.4,'ลบอีก'],
 [7.45,8.7,'สุดท้ายเหลือแค่...'],[8.7,10.1,'"สบายดีจ้า"'],[10.1,11.4,'ส่ง!'],
 [11.5,13.5,'เขาขึ้นว่ากำลังพิมพ์...'],[13.6,15.8,'แต่ฉันกดปิดแชท\nไม่รออ่าน 🔕'],
 [15.85,17.9,'ไม่ได้โกรธ ไม่ได้รอ...'],[17.9,20.1,'แค่ไม่ต้องการคำตอบอะไร\nจากเขาอีกแล้ว ☀️'],
 [20.15,21.9,'จบวันที่ 24'],[21.9,24.4,'มูฟออน 60%'],
];
const END=30.5;
const moveon=t=>t<22.4?35:60;
function typing(t){
  const drafts=[[3.25,4.7,'ที่ผ่านมามันเจ็บมากนะ แต่เราก็ยัง...'],[5.6,6.6,'ทำไมเพิ่งทักมา...'],[8.8,99,'สบายดีจ้า']];
  const d=drafts.find(([a,b])=>t>=a&&t<b+.6); let txt='';
  if(d){const [a,b,str]=d; if(t<b){txt=str.slice(0,Math.floor(clamp((t-a)/Math.max(.5,Math.min(1.2,b-a-.1)))*str.length));} else {txt=str.slice(0,Math.floor((1-clamp((t-b)/.4))*str.length));}}
  if(t>=10.2) txt='';
  const sent=t>=10.2;
  return `<rect x="226" y="276" width="628" height="150" fill="#f3f3f3"/><circle cx="300" cy="370" r="40" fill="#b06b8b"/><text x="360" y="385" font-size="40" font-weight="700" fill="#222">ex.jaa_</text>
  <g transform="translate(250,540)"><rect width="320" height="90" rx="40" fill="#eee"/><text x="30" y="60" font-size="38" fill="#222">สบายดีไหม</text></g>
  ${sent?`<g transform="translate(560,700) scale(${back(P(t,10.2,.3))})"><rect width="270" height="90" rx="40" fill="#3b82f6"/><text x="30" y="60" font-size="38" fill="#fff">สบายดีจ้า</text></g>`:''}
  ${t>=11.6&&t<13.7?`<g transform="translate(250,840)"><rect width="170" height="80" rx="40" fill="#eee"/>${[0,1,2].map(i=>`<circle cx="${50+i*35}" cy="40" r="11" fill="#999" opacity="${.4+.6*Math.max(0,Math.sin(t*8-i))}"/>`).join('')}</g><text x="250" y="960" font-size="28" fill="#999">ex.jaa_ กำลังพิมพ์...</text>`:''}
  <rect x="240" y="1430" width="500" height="100" rx="50" fill="#fff" stroke="#ccc" stroke-width="4"/><text x="270" y="1495" font-size="34" fill="#222">${txt}<tspan fill="#3b82f6" opacity="${Math.sin(t*10)>0?1:0}">|</tspan></text>
  <circle cx="790" cy="1480" r="55" fill="#3b82f6"/><path d="M765,1480 L815,1480 M795,1460 L815,1480 L795,1500" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>`;
}
function scene(t){
  let s='';
  if(t<3.15){ s=Wz(t,bedroom(t)+me({t,expr:'determined',pose:'fist',x:540,y:1250,s:.95,mush:true})); }
  else if(t<13.65){ s=Wz(t-3.15,phone(t,typing(t))+(t>=9.9&&t<10.6?thumb(790,1420+60):'')+(t>=4.7&&t<5.2||t>=6.6&&t<7.1?`<text x="540" y="1780" text-anchor="middle" font-size="80" font-weight="800" fill="#ff3b5c" stroke="#fff" stroke-width="8" paint-order="stroke">⌫ ลบ!</text>`:'')); }
  else if(t<15.85){ const k=P(t,14.3,.5);
    s=Wz(t-13.65,phone(t,`<g opacity="${1-k}">${typing(13.6)}</g><g opacity="${k}"><rect x="226" y="276" width="628" height="1368" rx="58" fill="#7ee0b5"/><text x="540" y="900" text-anchor="middle" font-size="200">🔕</text><text x="540" y="1050" text-anchor="middle" font-size="50" font-weight="800" fill="#1b4332">ปิดแชทแล้ว</text></g><g transform="translate(790,370)"><circle r="44" fill="#ff3b5c"/><path d="M-16,-16 L16,16 M16,-16 L-16,16" stroke="#fff" stroke-width="9" stroke-linecap="round"/></g>`)+(t<14.4?thumb(790,1700-ease(P(t,13.7,.6))*1270+60):'')); }
  else if(t<20.15){ s=Wz(t-15.85,rays(t,'#8fd3ff','#fff6c9',540,500,.6)+`<circle cx="540" cy="500" r="140" fill="#ffd166"/>`+me({t,expr:'happy',pose:t<17.9?'down':'fist',x:540,y:1350,s:.95,mush:true,talk:true})+sparkles(t,[[200,800],[880,820],[230,1150],[860,1180]])); }
  else if(t<24.5){ s=gaugeScene(t,20.15,35,60,22.4,t>=22.6?fireworks(t,22.6):''); }
  else s=endCard(t,24.5,'วันที่ 25 เริ่มแล้ว',6,'ตอนหน้า: เจอเขาที่ห้าง! 🛍️',26.15,'จะหลบหรือจะสู้...?',26.8,28.0);
  return finish(t,s,7,24.5,moveon,[22.4]);
}
