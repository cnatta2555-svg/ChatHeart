import sys
d=sys.argv[1]
lib=open('lib.html').read().replace('voice_env_d6.js',f'voice_env_d{d}.js')
html=lib+open('extras.js').read()+'\n'+open(f'day{d}.js').read()+"""
window.renderAt=t=>{document.getElementById('v').innerHTML=scene(t);};
window.DURATION=END;
renderAt(0);
</script></body></html>
"""
open(f'day{d}.html','w').write(html)
i=html.index('<script>\nconst OL')+8;j=html.index('</script>',i);open('chk.js','w').write(html[i:j])
