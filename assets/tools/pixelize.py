# usage: pixelize.py in.png out.png W H [colors]
import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB'); W,H=int(sys.argv[3]),int(sys.argv[4]); n=int(sys.argv[5]) if len(sys.argv)>5 else 48
sm=im.resize((W,H),Image.BOX).quantize(colors=n,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
sm.save(sys.argv[2],optimize=True); print('ok',sys.argv[2])
