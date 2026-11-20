import subprocess,sys
out=sys.argv[1]; ws=sys.argv[2:]
fs=[f'pv_{w}.png' for w in ws]; args=[]
for f in fs: args+=['-i',f]
n=len(fs)
subprocess.run(['ffmpeg','-v','error','-y',*args,'-filter_complex',''.join(f'[{i}]scale=270:480[a{i}];' for i in range(n))+''.join(f'[a{i}]' for i in range(n))+f'xstack=inputs={n}:grid=6x2',out])
