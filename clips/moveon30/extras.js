const PAL={me:['#f6c9a4','#3a2a3f','#ff8fa3','#e86a84'],f1:['#e8b48a','#1e1e1e','#6cc4a1','#4fa184'],f2:['#f2d0b0','#7a4a2a','#ffd166','#e6b84c'],staff:['#efc19c','#151515','#9b5de5','#7b3fc4'],mom:['#e9b993','#5a5a5a','#7fb8a8','#5f9a8a']};
function who(o,pal,extra=''){const old=[SKIN,HAIR,HOOD,HOOD2];[SKIN,HAIR,HOOD,HOOD2]=PAL[pal];let g=girl(o);[SKIN,HAIR,HOOD,HOOD2]=old;
  if(extra){const i=g.lastIndexOf('</g>');g=g.slice(0,i)+extra+g.slice(i);}return g;}
function me(o,extra=''){return who(o,'me',extra);}
const punch=lt=>1+0.06*(1-ease(P(lt,0,.35)));
const Wz=(lt,inner)=>`<g transform="translate(540,960) scale(${punch(lt)}) translate(-540,-960)">${inner}</g>`;
function thumb(x,y){return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="85" ry="110" fill="${SKIN}" stroke="${OL}" stroke-width="8"/><rect x="-85" y="0" width="170" height="700" fill="${SKIN}" stroke="${OL}" stroke-width="8"/><rect x="-77" y="-4" width="154" height="20" fill="${SKIN}"/><ellipse cx="0" cy="-55" rx="45" ry="38" fill="#ffe3d2" stroke="${OL}" stroke-width="5"/></g>`;}
function rays(t,bg,col,cx=540,cy=960,op=.5){return `<rect width="1080" height="1920" fill="${bg}"/>`+Array.from({length:14}).map((_,i)=>`<path d="M${cx},${cy} L${cx+1700*Math.cos(i/14*Math.PI*2+t*.3)},${cy+1700*Math.sin(i/14*Math.PI*2+t*.3)} L${cx+1700*Math.cos((i+.5)/14*Math.PI*2+t*.3)},${cy+1700*Math.sin((i+.5)/14*Math.PI*2+t*.3)}Z" fill="${col}" opacity="${op}"/>`).join('');}
function sparkles(t,pts,col='#fff'){return pts.map(([x,y],i)=>`<path transform="translate(${x},${y}) scale(${.7+.4*Math.sin(t*6+i)})" d="M0,-40 L10,-10 L40,0 L10,10 L0,40 L-10,10 L-40,0 L-10,-10Z" fill="${col}"/>`).join('');}
function label(x,y,text,k,rot=-6,w=null){const ww=w||Math.max(300,text.length*34+80);return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${back(k)})"><rect x="${-ww/2}" y="-55" width="${ww}" height="110" rx="20" fill="#fff" stroke="${OL}" stroke-width="6"/><text y="15" text-anchor="middle" font-size="42" fill="${OL}">${text}</text></g>`;}
function bedHead(t,o={}){
  const {mush=false,eyesKind='sleep',dim=.2,morning=false}=o;
  const eyesSvg=eyesKind==='sleep'?`<path d="M-90,-40 Q-62,-25 -34,-40 M34,-40 Q62,-25 90,-40" stroke="${OL}" stroke-width="10" fill="none" stroke-linecap="round"/>`
    :eyesKind==='pain'?`<path d="M-85,-55 L-40,-25 M-40,-55 L-85,-25 M40,-55 L85,-25 M85,-55 L40,-25" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><path d="M-30,20 q15,-12 30,0 t30,0" stroke="${OL}" stroke-width="8" fill="none"/>`
    :eyesKind==='open'?`<circle cx="-62" cy="-40" r="22" fill="#fff" stroke="${OL}" stroke-width="6"/><circle cx="62" cy="-40" r="22" fill="#fff" stroke="${OL}" stroke-width="6"/><circle cx="-62" cy="-40" r="8" fill="${OL}"/><circle cx="62" cy="-40" r="8" fill="${OL}"/><path d="M-95,-5 Q-62,8 -30,-5 M30,-5 Q62,8 95,-5" stroke="#7d6b9e" stroke-width="7" fill="none"/>`
    :`<path d="M-90,-30 Q-62,-55 -34,-30 M34,-30 Q62,-55 90,-30" stroke="${OL}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  const hair=mush?`<path d="M-195,-40 Q-210,-235 0,-240 Q210,-235 195,-40 Q190,-80 150,-90 L-150,-90 Q-190,-80 -195,-40Z" fill="${HAIR}" stroke="${OL}" stroke-width="8"/>`:`<path d="M-172,-60 Q-175,-215 0,-210 Q175,-215 172,-60 Q120,-140 0,-130 Q-120,-140 -172,-60Z" fill="${HAIR}" stroke="${OL}" stroke-width="8"/>`;
  return bedroom(t,morning?0:dim)+(morning?`<rect width="1080" height="1920" fill="#ffd8a8" opacity=".22"/><circle cx="950" cy="345" r="60" fill="#ffd166"/>`:'')
   +`<g transform="translate(540,1480)"><path d="M-420,0 Q-430,-300 -200,-330 Q0,-380 200,-330 Q430,-300 420,0Z" fill="#7d8ad6" stroke="${OL}" stroke-width="10"/></g>`
   +`<g transform="translate(540,${1200+Math.sin(t*2)*6})"><ellipse cx="0" cy="-60" rx="170" ry="130" fill="${SKIN}" stroke="${OL}" stroke-width="8"/>${hair}${eyesSvg}<path d="M-300,30 Q0,-40 300,30 L300,120 L-300,120Z" fill="#7d8ad6" stroke="${OL}" stroke-width="10"/></g>`
   +(eyesKind==='sleep'?`<text x="760" y="${900-((t*40)%120)}" font-size="${60+((t*40)%120)/3}" font-weight="800" fill="#cfd6ff" opacity="${1-((t*40)%120)/120}">Z</text>`:'');
}
function endCard(t,t0,title,left,n1,tn1,n2,tn2,tf){const lt=t-t0;
  return `<rect width="1080" height="1920" fill="#1b2340"/>`
   +`<g transform="translate(540,760) rotate(-3) scale(${back(P(lt,0,.4))})"><rect x="-400" y="-95" width="800" height="190" rx="18" fill="#2e7d5b" stroke="#fff" stroke-width="10"/><text y="28" text-anchor="middle" font-size="${title.length>16?72:88}" font-weight="800" fill="#fff">${title}</text></g>`
   +`<text x="540" y="930" text-anchor="middle" font-size="46" font-weight="700" fill="#7ee0b5" opacity="${P(lt,.3,.3)}">เหลือ ${left} วัน</text>`
   +`<g opacity="${P(t,tn1,.3)}"><text x="540" y="1220" text-anchor="middle" font-size="54" font-weight="700" fill="#fff">${n1}</text><text x="540" y="1300" text-anchor="middle" font-size="54" font-weight="700" fill="#ffd166" opacity="${P(t,tn2,.3)}">${n2}</text></g>`
   +`<g opacity="${P(t,tf,.3)}" transform="translate(540,1520) scale(${1+Math.sin(lt*6)*.04})"><rect x="-290" y="-60" width="580" height="120" rx="60" fill="#ff3b5c"/><text y="20" text-anchor="middle" font-size="50" font-weight="800" fill="#fff">กดติดตาม ไม่งั้นพลาด!</text></g>`;
}
function bumpsAt(t,list){for(const a of list){if(t>=a&&t<a+.4)return Math.sin((t-a)/.4*Math.PI);}return 0;}
function finish(t,s,day,hudUntil,moveon,bumps){
  if(t<hudUntil) s+=hud(day,moveon(t),bumpsAt(t,bumps));
  const cur=SUBS.find(([a,b])=>t>=a&&t<b); if(cur) s+=sub(cur[2],t-cur[0]);
  return s;
}

function gauge(t,t0,v,col){return `<g transform="translate(540,600) scale(${back(P(t,t0,.4))})"><circle r="250" fill="#fff" stroke="${OL}" stroke-width="12"/><text y="60" text-anchor="middle" font-size="170" font-weight="800" fill="${col}">${v>0?'+':''}${v}%</text><text y="140" text-anchor="middle" font-size="40" fill="#666">มูฟออน</text></g>`;}
function fireworks(t,t0){return [[250,500,'#ffd166'],[800,450,'#ff8fa3'],[540,350,'#7ee0b5'],[300,900,'#9fd8ff'],[820,850,'#ffd166']].map(([x,y,c],j)=>{const k=((t-t0)*.9+j*.23)%1;return Array.from({length:12}).map((_,i)=>{const a=i/12*Math.PI*2;return `<circle cx="${x+Math.cos(a)*k*170}" cy="${y+Math.sin(a)*k*170+k*k*40}" r="${12*(1-k)+3}" fill="${c}" opacity="${1-k}"/>`;}).join('');}).join('');}
function polaroid(x,y,rot,emo,txt,k){return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${back(k)*.82})"><rect x="-140" y="-150" width="280" height="300" rx="10" fill="#fff" stroke="${OL}" stroke-width="6"/><rect x="-115" y="-125" width="230" height="190" fill="#ffe3ec"/><text y="15" text-anchor="middle" font-size="110">${emo}</text><text y="120" text-anchor="middle" font-size="36" font-weight="700" fill="${OL}">${txt}</text><circle cx="0" cy="-150" r="14" fill="#ff3b5c" stroke="${OL}" stroke-width="4"/></g>`;}
function board(t,items){return `<rect width="1080" height="1920" fill="#c99a6b"/><rect x="40" y="200" width="1000" height="1580" rx="24" fill="#d9ab7c" stroke="#8b5e34" stroke-width="20"/>`+items.map(([a,e,tx],i)=>t>=a?polaroid(330+(i%2)*420,370+Math.floor(i/2)*300,[-6,5,4,-5,-3,7][i],e,tx,P(t,a,.3)):'').join('');}
function lineChart(t,k,title,vals,labels){const x0=180,x1=900,y0=470;const pts=vals.map((v,i)=>[x0+i*(x1-x0)/(vals.length-1),y0-v*6]);
  const n=Math.max(1,Math.min(vals.length,Math.floor(k*vals.length)+1));const path='M'+pts.slice(0,n).map(p=>p.join(',')).join(' L');
  return `<g><rect x="110" y="250" width="860" height="520" rx="30" fill="#fff" stroke="${OL}" stroke-width="8"/><text x="540" y="320" text-anchor="middle" font-size="42" font-weight="800" fill="${OL}">${title}</text><path d="M${x0},${y0} H${x1}" stroke="#ccc" stroke-width="4" stroke-dasharray="12 10"/><text x="${x0-20}" y="${y0+12}" text-anchor="end" font-size="28" fill="#999">0</text><path d="${path}" stroke="#ff3b5c" stroke-width="10" fill="none" stroke-linejoin="round" stroke-linecap="round"/>${pts.slice(0,n).map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="14" fill="${vals[i]>=0?'#2e7d5b':'#ff3b5c'}" stroke="#fff" stroke-width="4"/><text x="${p[0]}" y="745" text-anchor="middle" font-size="28" fill="#666">${labels[i]}</text>`).join('')}</g>`;}
function notif(x,y,k,txt){return `<g transform="translate(${x},${y-(1-ease(k))*300})" opacity="${k>0?1:0}"><rect x="-300" y="-70" width="600" height="140" rx="30" fill="#ffffffee" stroke="#ddd" stroke-width="4"/><circle cx="-230" cy="0" r="40" fill="#b06b8b"/><text x="-170" y="-10" font-size="32" font-weight="700" fill="#222">ex.jaa_</text><text x="-170" y="35" font-size="30" fill="#444">${txt}</text></g>`;}
function viewers(t,list){return `<text x="270" y="400" font-size="40" font-weight="800" fill="#222">👁️ คนดูสตอรี่ ${list.length} คน</text>`+list.map(([n,c],i)=>`<g><circle cx="310" cy="${520+i*130}" r="46" fill="${c}"/><text x="380" y="${535+i*130}" font-size="42" fill="#222">${n}</text><path d="M260,${585+i*130} H830" stroke="#eee" stroke-width="3"/></g>`).join('');}
