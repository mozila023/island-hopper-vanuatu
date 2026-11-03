# usage: slice_portraits.py in.png out.png  (4x2 grid, white gaps, optional magenta border) -> 8 cells of 48x48 in a row
import sys
from PIL import Image
import numpy as np
SZ=int(sys.argv[3]) if len(sys.argv)>3 else 48
im=Image.open(sys.argv[1]).convert('RGB'); a=np.asarray(im).astype(int)
mag=(a[:,:,0]>170)&(a[:,:,1]<110)&(a[:,:,2]>170)
ys=np.where((~mag).mean(axis=1)>0.5)[0]; xs=np.where((~mag).mean(axis=0)>0.5)[0]
im=im.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1)); a=np.asarray(im).astype(int)
white=(a.min(axis=2)>215)
def segs(v,n):
    on=v<0.6; out=[]; s=None
    for i,x in enumerate(on):
        if x and s is None: s=i
        if not x and s is not None: out.append((s,i)); s=None
    if s is not None: out.append((s,len(on)))
    out=[o for o in out if o[1]-o[0]>40]
    return out[:n]
cs=segs(white.mean(axis=0),4); rs=segs(white.mean(axis=1),2); print(cs,rs)
out=Image.new('RGB',(SZ*8,SZ))
k=0
for (y0,y1) in rs:
  for (x0,x1) in cs:
    w=x1-x0-8; h=y1-y0-8; sq=min(w,h); cx=x0+4+(w-sq)//2; cy=y0+4+(h-sq)//2
    out.paste(im.crop((cx,cy,cx+sq,cy+sq)).resize((SZ,SZ),Image.BOX),(k*SZ,0)); k+=1
out=out.quantize(colors=64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
out.save(sys.argv[2],optimize=True)
