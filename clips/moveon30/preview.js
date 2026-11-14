const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:540,height:960},deviceScaleFactor:1});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/index.html');await p.evaluate(()=>document.fonts.ready);
const ts=process.argv.slice(2).map(Number);
for(const t of ts){await p.evaluate(t=>renderAt(t),t);await p.screenshot({path:`pv_${t}.png`});}
await b.close();})();
