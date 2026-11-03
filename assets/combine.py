import os, json, base64
from PIL import Image
import os
D=os.path.dirname(os.path.abspath(__file__))+'/'
# walk sheets
sheets=['sprites','npc1','npc2','npc3','npc4','npc5','npc6','npc7']
have=[s for s in sheets if os.path.exists(D+s+'.png')]
walk=Image.new('RGBA',(180,108*len(sheets)),(0,0,0,0)); avail=[]
for i,s in enumerate(sheets):
    if os.path.exists(D+s+'.png'): walk.paste(Image.open(D+s+'.png').convert('RGBA'),(0,i*108)); avail.append(i)
walk.save(D+'walk.png',optimize=True)
# portraits
por=Image.new('RGB',(48*24,48),(127,215,210)); pav=[]
for i,s in enumerate(['portraits1','portraits2','portraits3']):
    if os.path.exists(D+s+'.png'): por.paste(Image.open(D+s+'.png').convert('RGB'),(i*384,0)); pav.append(i)
por.save(D+'portraits_all.png',optimize=True)
meta={'walkSheets':avail,'portraitSheets':pav,'buildings':json.load(open(D+'buildings.json')),'nature':json.load(open(D+'nature.json')),'objs2':json.load(open(D+'objs2.json'))}
src={}
for k,f in [('title','title'),('walk','walk'),('portraits','portraits_all'),('buildings','buildings'),('nature','nature'),('objs2','objs2'),('bg_reef','bg_reef'),('bg_wreck','bg_wreck'),('bg_crater','bg_crater'),('bg_bluehole','bg_bluehole'),('bg_volcview','bg_volcview'),('bg_mangrove','bg_mangrove'),('bg_room','bg_room'),('bg_drums','bg_drums'),('bg_dance','bg_dance'),('bg_romground','bg_romground'),('bg_flight','bg_flight'),('bg_nagol','bg_nagol')]:
    p=D+f+'.png'
    if os.path.exists(p): src[k]='data:image/png;base64,'+base64.b64encode(open(p,'rb').read()).decode()
open(D+'../src/00-assets.js','w').write('const ASSET_SRC='+json.dumps(src)+';\nconst ASSET_META='+json.dumps(meta)+';\n')
print(sorted(src), meta['walkSheets'], meta['portraitSheets'], sum(len(v) for v in src.values())//1024,'KB')
