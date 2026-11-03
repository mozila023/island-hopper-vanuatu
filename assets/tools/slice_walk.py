# usage: slice_walk.py in.png out.png [TH]
# Slices a magenta-background walk sheet (3 chars x 3 cols = 9 columns, 4 rows) into 20x27 frames.
import sys
from PIL import Image
import numpy as np
src_p,out_p=sys.argv[1],sys.argv[2]; TH=int(sys.argv[3]) if len(sys.argv)>3 else 26
im=Image.open(src_p).convert('RGB'); a=np.asarray(im).astype(int)
mag=(a[:,:,0]>170)&(a[:,:,1]<110)&(a[:,:,2]>170)&(a[:,:,0]-a[:,:,1]>90)
fg=~mag
def runs(v,th,mingap):
    on=v>th; out=[]; s=None
    for i,x in enumerate(on):
        if x and s is None: s=i
        if not x and s is not None: out.append([s,i-1]); s=None
    if s is not None: out.append([s,len(on)-1])
    m=[]
    for r in out:
        if m and r[0]-m[-1][1]<mingap: m[-1][1]=r[1]
        else: m.append(r)
    return [r for r in m if r[1]-r[0]>15]
rr=runs(fg.mean(axis=1),0.003,10)
if len(rr)!=4: print('ROWS',len(rr),rr); 
rgba=np.dstack([a,np.where(fg,255,0)]).astype(np.uint8); src=Image.fromarray(rgba,'RGBA')
FW,FH=20,27
frames=[]
for (y0,y1) in rr[:4]:
    band=fg[y0:y1+1]; cr=runs(band.mean(axis=0),0.003,6)
    if len(cr)!=9: print('COLS',len(cr),cr)
    frames.append([(x0,y0,x1,y1) for x0,x1 in cr[:9]])
maxh=max(y1-y0 for row in frames for (x0,y0,x1,y1) in row)
# measure each frame's true height
hs=[]
for row in frames:
    for (x0,y0,x1,y1) in row:
        ys=np.where(fg[y0:y1+1,x0:x1+1].any(axis=1))[0]; hs.append(ys.max()-ys.min()+1)
scale=max(hs)/TH
out=Image.new('RGBA',(FW*9,FH*4),(0,0,0,0))
for r,row in enumerate(frames):
  for c,(x0,y0,x1,y1) in enumerate(row):
    cell=src.crop((x0,y0,x1+1,y1+1)); arr=np.asarray(cell)
    ys,xs=np.where(arr[:,:,3]>0); cell=cell.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1)); A=np.asarray(cell).astype(int)
    w=max(1,min(FW,round(cell.width/scale))); h=max(1,min(FH,round(cell.height/scale)))
    o=np.zeros((h,w,4),np.uint8)
    for j in range(h):
      for i in range(w):
        bx0=int(i*cell.width/w); bx1=max(bx0+1,int((i+1)*cell.width/w)); by0=int(j*cell.height/h); by1=max(by0+1,int((j+1)*cell.height/h))
        blk=A[by0:by1,bx0:bx1].reshape(-1,4); op=blk[blk[:,3]>0]
        if len(op)<blk.shape[0]*0.45: continue
        key=(op[:,0]//24)*10000+(op[:,1]//24)*100+(op[:,2]//24)
        vals,cnt=np.unique(key,return_counts=True); k=vals[cnt.argmax()]
        o[j,i,:3]=op[key==k][:,:3].mean(axis=0); o[j,i,3]=255
    fr=Image.fromarray(o,'RGBA'); out.paste(fr,(c*FW+(FW-w)//2,r*FH+FH-h),fr)
out.save(out_p,optimize=True); print('ok',out_p,'scale',round(scale,2))
