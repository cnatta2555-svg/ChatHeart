const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:540,height:540},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/profile.html');await p.evaluate(()=>document.fonts.ready);
for(const v of ['pink','navy']){await p.evaluate(v=>draw(v),v);await p.screenshot({path:`profile_${v}.png`});}
await b.close();})();
