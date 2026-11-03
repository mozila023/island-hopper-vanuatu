# usage: slice_objs.py in.png out.png cols rows "w1,w2,..."  -> packs objects horizontally (alpha), prints JSON atlas
import sys, json
from PIL import Image
import numpy as np
import scipy.ndimage as ndi
src_p,out_p=sys.argv[1],sys.argv[2]; C,Rn=int(sys.argv[3]),int(sys.argv[4]); widths=[int(x) for x in sys.argv[5].split(',')]
im=Image.open(src_p).convert('RGB'); a=np.asarray(im).astype(int)
mag=(a[:,:,0]>170)&(a[:,:,1]<110)&(a[:,:,2]>170)&(a[:,:,0]-a[:,:,1]>90)
fg=~mag
# clean speckles near magenta: erode isolated
H,W=fg.shape
def down(cell,w):
    A=np.asarray(cell).astype(int); scale=cell.width/w; h=max(1,round(cell.height/scale))
    o=np.zeros((h,w,4),np.uint8)
    for j in range(h):
      for i in range(w):
        bx0=int(i*cell.width/w); bx1=max(bx0+1,int((i+1)*cell.width/w)); by0=int(j*cell.height/h); by1=max(by0+1,int((j+1)*cell.height/h))
        blk=A[by0:by1,bx0:bx1].reshape(-1,4); op=blk[blk[:,3]>0]
        if len(op)<blk.shape[0]*0.45: continue
        key=(op[:,0]//20)*10000+(op[:,1]//20)*100+(op[:,2]//20)
        vals,cnt=np.unique(key,return_counts=True); k=vals[cnt.argmax()]
        o[j,i,:3]=op[key==k][:,:3].mean(axis=0); o[j,i,3]=255
    return Image.fromarray(o,'RGBA')
rgba=np.dstack([a,np.where(fg,255,0)]).astype(np.uint8); src=Image.fromarray(rgba,'RGBA')
objs=[]
for r in range(Rn):
  for c in range(C):
    x0,x1=c*W//C,(c+1)*W//C; y0,y1=r*H//Rn,(r+1)*H//Rn
    sub=fg[y0:y1,x0:x1]
    # keep every sizeable connected part of the object (drop specks), full extent, nothing trimmed
    lab,n=ndi.label(ndi.binary_opening(sub,iterations=1))
    sizes=ndi.sum(sub,lab,range(1,n+1)); big=max(sizes) if n else 0
    keep=np.isin(lab,[i+1 for i,sz in enumerate(sizes) if sz>=max(150,big*0.004)])
    keep=ndi.binary_dilation(keep,iterations=2)&sub
    ys=np.where(keep.any(axis=1))[0]; xs=np.where(keep.any(axis=0))[0]
    m=np.zeros_like(fg); m[y0:y1,x0:x1]=keep
    arr=np.asarray(src).copy(); arr[:,:,3]=np.where(m,255,0); cs=Image.fromarray(arr,'RGBA')
    cell=cs.crop((x0+xs.min(),y0+ys.min(),x0+xs.max()+1,y0+ys.max()+1))
    objs.append(down(cell,widths[len(objs)]))
tw=sum(o.width for o in objs)+len(objs); th=max(o.height for o in objs)
out=Image.new('RGBA',(tw,th),(0,0,0,0)); x=0; atlas=[]
for o in objs: out.paste(o,(x,0),o); atlas.append([x,0,o.width,o.height]); x+=o.width+1
out.save(out_p,optimize=True); print(json.dumps(atlas))
