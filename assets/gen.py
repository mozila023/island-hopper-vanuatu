import base64,os,json
d={}
for k in ['title','portraits','sprites']:
    p=f'assets/{k}.png'
    if os.path.exists(p): d[k]='data:image/png;base64,'+base64.b64encode(open(p,'rb').read()).decode()
open('src/00-assets.js','w').write('const ASSET_SRC='+json.dumps(d)+';\n')
print({k:len(v) for k,v in d.items()})
