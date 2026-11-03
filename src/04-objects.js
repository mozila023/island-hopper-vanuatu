/* ---------------- world objects ---------------- */
function shadowE(x,y,w,h,a=.22){ ctx.fillStyle=`rgba(10,30,20,${a})`; for(let i=0;i<h;i++){ const q=1-Math.abs((i-(h-1)/2)/(h/2)); const ww=Math.round(w*Math.sqrt(Math.max(0,q))); ctx.fillRect(Math.floor(x-ww/2),Math.floor(y+i),ww,1); } }
function drawPalm(sx,sy,h,tm){
  if(imgOk('nature')){ shadowE(sx+11,sy+13,20,5,.2); atlasDraw('nature',0,sx+8,sy+17,h%2===1); return; }
  const lean=(h%3)-1;
  shadowE(sx+12+lean*4,sy+13,22,5,.2);
  for(let i=0;i<24;i++){ const y=sy+15-i, x=sx+6+Math.round(lean*4*(i/24)*(i/24)); R(x-1,y,5,1,C.out); R(x,y,3,1,i%4===0?C.trunk2:C.trunk); R(x,y,1,1,i%4===0?C.trunk2:'#c08a52'); }
  const tx=sx+7+lean*4, ty=sy-9, sway=Math.sin(tm*1.4+h)*0.6;
  const angs=[Math.PI+.15,-.15,-2.55,-.6,-1.6,2.5,.65];
  for(const pass of [0,1,2,3]) for(const a0 of angs){ const a=a0+sway*.08; for(let k=1;k<10;k++){ const fx=tx+Math.cos(a)*k*1.35, fy=ty+Math.sin(a)*k*.95+k*k*.07; const wd=k<7?3:2;
    if(pass===0) R(fx-1,fy-1,wd+2,4,C.out); else if(pass===1) R(fx,fy,wd,2,C.leaf); else if(pass===2){ if(k%3===0) R(fx,fy+1,wd,1,C.leaf2); } else if(k%2===0&&a0<0) R(fx,fy,1,1,C.leaf3); } }
  R(tx-2,ty+1,3,3,'#6b4a26'); R(tx+1,ty+2,3,3,'#7d5730'); R(tx-1,ty+1,1,1,'#a07a4a');
}
function drawJTree(sx,sy,h){
  if(imgOk('nature')){ shadowE(sx+9,sy+12,22,6,.22); atlasDraw('nature',1,sx+8,sy+17,h%2===1); return; }
  shadowE(sx+9,sy+12,22,6,.22);
  R(sx+5,sy+6,6,10,C.out); R(sx+6,sy+6,4,9,C.trunk2); R(sx+6,sy+6,1,9,C.trunk);
  blob(ctx,sx+8,sy+1,10,C.out); blob(ctx,sx+8,sy+1,9,'#245f2d'); blob(ctx,sx+7+(h%3),sy-1,7,'#2f7a33'); blob(ctx,sx+6+(h%3),sy-2,5,'#3f9a40'); blob(ctx,sx+5+(h%2),sy-4,3,'#62c357');
  for(let i=0;i<5;i++){ const q=hash(h,i); R(sx+2+q%13,sy-6+((q>>4)%12),1,1,'#7fd66a'); }
}
function drawHut(X,Y,w,h,b,tm){
  const st=b.style||'village';
  const P={tama:{wall:C.bamboo,wall2:C.bamboo2,roof:C.thatch,roof2:C.thatch2,roof3:C.thatch3},
    nakamal:{wall:'#8a6340',wall2:'#6a4a2d',roof:'#a77a3a',roof2:'#7a5622',roof3:'#c1934e'},
    village:{wall:'#b99a5e',wall2:'#987a44',roof:'#b58a45',roof2:'#86612a',roof3:'#d2a75e'},
    bungalow:{wall:'#efdcb0',wall2:'#cdb381',roof:C.thatch,roof2:C.thatch2,roof3:C.thatch3}}[st];
  shadowE(X+w/2+3,Y+h-3,w+10,7,.25);
  const wallH=st==='village'?14:19, wallTop=Y+h-wallH, wb=st==='bungalow'?5:0;
  if(st==='bungalow'){ for(const px of [X+3,X+w-6,X+w/2-1]){ R(px,Y+h-6,3,6,C.out); R(px+1,Y+h-6,1,6,C.wood); } R(X+1,Y+h-7,w-2,2,C.out); R(X+2,Y+h-7,w-4,1,C.wood); }
  R(X+2,wallTop-wb,w-4,wallH,C.out); R(X+3,wallTop+1-wb,w-6,wallH-2,P.wall);
  for(let i=X+4;i<X+w-4;i+=2) for(let j=wallTop+2-wb;j<wallTop+wallH-2-wb;j+=2) if(((i+j)>>1)%2) R(i,j,1,1,P.wall2);
  R(X+3,wallTop+wallH-3-wb,w-6,1,P.wall2);
  const night=(G.slot>=2||G.tint==='gold');
  if(b.door){ const dx=X+(b.door.x-b.x)*16; R(dx+2,Y+h-14-wb,12,14,C.out); R(dx+3,Y+h-13-wb,10,13,night&&b.light?'#7a4a1a':'#3b2616'); if(night&&b.light) R(dx+4,Y+h-12-wb,8,11,'#c8862a'); if(st==='tama') R(dx+3,Y+h-13,10,1,'#2f8fd0'); }
  if(st!=='village'){ const wx=X+w-14; R(wx,wallTop+4-wb,9,7,C.out); R(wx+1,wallTop+5-wb,7,5,night?'#ffd27a':'#2b3a52'); R(wx+1,wallTop+5-wb,7,1,night?'#fff0b0':'#4d6b8f'); R(wx+4,wallTop+5-wb,1,5,C.out); }
  const top=Y-(st==='village'?12:8), eave=wallTop+3-wb, inset0=Math.round(w*0.24);
  for(let yy=top;yy<eave;yy++){ const p=(yy-top)/(eave-top), ins=Math.round((1-p)*inset0); const x0=X-3+ins, ww=w+6-2*ins; R(x0-1,yy,ww+2,1,C.out); R(x0,yy,ww,1,p<.35?P.roof3:(yy-top)%4===0?P.roof2:P.roof); R(x0,yy,2,1,P.roof3); R(x0+ww-3,yy,3,1,P.roof2); }
  for(let yy=top+2;yy<eave-1;yy+=3){ for(let xx=X;xx<X+w;xx+=4){ const q=hash(xx,yy)%4; R(xx+q,yy,1,2,P.roof2); } }
  R(X-4,eave-1,w+8,2,C.out); for(let xx=X-3;xx<X+w+3;xx+=2) R(xx,eave,1,1+((xx>>1)%2),P.roof2);
  R(X-3+inset0,top-1,w+6-2*inset0,2,C.out);
  if(st==='tama'){ R(X+w-5,Y+h-6,4,4,'#b55a3a'); R(X+w-5,Y+h-9,4,3,'#ff5d6c'); R(X+1,Y+h-6,4,4,'#b55a3a'); R(X+1,Y+h-9,4,3,'#ffd84d'); }
  if(st==='nakamal'&&b.door){ const lx=X+(b.door.x-b.x)*16+14; R(lx,Y+h-17,3,1,C.out); R(lx,Y+h-16,3,4,night?'#fff0a0':'#ffcf5a'); }
}
function drawAirport(X,Y,w,h,b){
  shadowE(X+w/2+3,Y+h-3,w+12,7,.25);
  R(X,Y+2,w,h-2,C.out); R(X+1,Y+3,w-2,h-4,'#eef1f4'); R(X+1,Y+h-3,w-2,1,'#c9d0d8');
  R(X-2,Y,w+4,5,C.out); R(X-1,Y+1,w+2,3,'#a2abb6'); R(X-1,Y+1,w+2,1,'#c3cad3');
  R(X+2,Y+h-24,w-4,10,C.out); R(X+3,Y+h-23,w-6,8,'#5fa8d8'); for(let i=X+3;i<X+w-3;i+=7) R(i,Y+h-23,1,8,'#3d7fb0'); R(X+3,Y+h-23,w-6,2,'#9fd3f2');
  const dx=X+(b.door.x-b.x)*16; R(dx+1,Y+h-14,14,14,C.out); R(dx+2,Y+h-13,12,13,'#7ec0e6'); R(dx+7,Y+h-13,1,13,C.out); R(dx+3,Y+h-12,2,6,'#c9ecff');
  const lw=ptw(b.label)+6; R(dx+8-lw/2,Y+6,lw,9,C.out); R(dx+9-lw/2,Y+7,lw-2,7,'#1f4d86'); ptext(ctx,b.label,dx+11-lw/2,Y+8,'#ffffff');
  R(X+w-10,Y-14,9,16,C.out); R(X+w-9,Y-13,7,14,'#dfe4ea'); R(X+w-11,Y-18,11,6,C.out); R(X+w-10,Y-17,9,4,'#5fa8d8');
  R(X+2,Y-8,1,9,C.out); R(X+3,Y-8,5,3,'#ff7a1a'); R(X+3,Y-7,5,1,'#ffffff');
}
function drawStore(X,Y,w,h,b){
  shadowE(X+w/2+3,Y+h-3,w+10,7,.25);
  R(X,Y+2,w,h-2,C.out); R(X+1,Y+3,w-2,h-4,'#f0e6d0'); R(X+1,Y+3,w-2,2,'#e0d2b4');
  R(X-2,Y-2,w+4,6,C.out); for(let i=0;i<w;i+=6) R(X-1+i,Y-1,6,4,(i/6)%2?'#2f8fd0':'#ffffff');
  const dx=X+(b.door.x-b.x)*16; R(dx+1,Y+h-15,14,15,C.out); R(dx+2,Y+h-14,12,14,'#5a3a22'); R(dx+2,Y+h-14,12,3,'#3a8fd6');
  for(const wx of [X+5,X+w-17]){ R(wx,Y+h-22,12,10,C.out); R(wx+1,Y+h-21,10,8,'#bfe3f2'); R(wx+2,Y+h-17,3,4,'#ff8a3a'); R(wx+6,Y+h-18,3,5,'#ffd84d'); }
  const lw=ptw(b.label)+6; R(X+w/2-lw/2,Y+6,lw,9,C.out); R(X+w/2-lw/2+1,Y+7,lw-2,7,'#d9453a'); ptext(ctx,b.label,X+w/2-lw/2+3,Y+8,'#ffffff');
}
function drawMarket(X,Y,w,h,b){
  shadowE(X+w/2+3,Y+h-3,w+10,7,.25);
  R(X+1,Y+h-22,w-2,22,C.out); R(X+2,Y+h-21,w-4,20,'#f3e7cc');
  for(let i=0;i<5;i++){ const sx=X+6+i*((w-16)/4); R(sx,Y+h-12,12,7,C.out); R(sx+1,Y+h-11,10,5,C.wood); R(sx+1,Y+h-11,10,1,'#b88252');
    const cols=[['#ff8a2a','#ffd84d'],['#7ccf4a','#3f9a3a'],['#e84a5f','#ffb3c1'],['#b0703a','#7a4a26'],['#ffd84d','#9bd64a']][i];
    for(let k=0;k<5;k++){ R(sx+1+k*2,Y+h-14,2,2,cols[k%2]); R(sx+1+k*2,Y+h-14,1,1,'#ffffff'); } }
  for(let i=0;i<w;i+=8){ R(X+i,Y-6,8,12,C.out); R(X+i+1,Y-5,6,10,(i/8)%2?'#ffffff':'#d9453a'); R(X+i+1,Y-5,6,2,(i/8)%2?'#ffffff':'#ff6a5a'); }
  R(X-2,Y+5,w+4,3,C.out); for(let i=0;i<w;i+=8) R(X+i,Y+6,4,2,'#d9453a');
  for(const px of [X+2,X+w-5]) R(px,Y+8,3,h-10,C.wood2);
  const lw=ptw(b.label)+6; R(X+w/2-lw/2,Y-12,lw,9,C.out); R(X+w/2-lw/2+1,Y-11,lw-2,7,'#ffd84d'); ptext(ctx,b.label,X+w/2-lw/2+3,Y-10,C.out);
}
function drawBooth(X,Y,w,h,b){
  shadowE(X+w/2+2,Y+h-3,w+6,6,.25);
  const col=b.col||'#2f8fd0';
  R(X+2,Y+6,w-4,h-6,C.out); R(X+3,Y+7,w-6,h-8,col); R(X+6,Y+12,w-12,8,C.out); R(X+7,Y+13,w-14,6,'#bfe6ff');
  R(X,Y+1,w,6,C.out); R(X+1,Y+2,w-2,4,'#ffffff'); for(let i=X+1;i<X+w-1;i+=4) R(i,Y+2,2,4,'#d9453a');
  const lw=ptw(b.label)+4; R(X+w/2-lw/2,Y-7,lw,8,C.out); R(X+w/2-lw/2+1,Y-6,lw-2,6,'#ffd84d'); ptext(ctx,b.label,X+w/2-lw/2+2,Y-6,C.out);
}
function drawSign(X,Y,b){ R(X+7,Y+4,3,12,C.out); R(X+8,Y+5,1,11,C.wood); const lw=Math.max(14,ptw(b.label)+6); R(X+8-lw/2,Y-2,lw,9,C.out); R(X+9-lw/2,Y-1,lw-2,7,C.wood); R(X+9-lw/2,Y-1,lw-2,1,'#b88252'); ptext(ctx,b.label,X+11-lw/2,Y,'#fff3d0'); }
function drawPostSign(X,Y,tm){ const bob=Math.round(Math.sin(tm*2)); R(X+6,Y+2+bob,4,14,C.out); R(X+7,Y+3+bob,2,13,C.wood); R(X+1,Y-4+bob,14,9,C.out); R(X+2,Y-3+bob,12,7,'#ffd84d'); R(X+4,Y-2+bob,8,5,'#ffffff'); R(X+4,Y-2+bob,4,2,'#2d6cc0'); R(X+8,Y-2+bob,4,2,'#2d6cc0'); R(X+3,Y+12,10,2,C.foam); }
function drawBoat(X,Y,tm){ const y=Y+Math.round(Math.sin(tm*1.8)); R(X,y+8,30,7,C.out); R(X+1,y+9,28,4,'#ffffff'); R(X+3,y+12,24,2,'#2f8fd0'); R(X+8,y+1,13,8,C.out); R(X+9,y+2,11,6,'#e8eef2'); R(X+10,y+3,3,2,'#4d6b8f'); R(X+15,y+3,3,2,'#4d6b8f'); R(X+20,y-6,2,8,C.out); R(X+21,y-6,5,3,'#d9453a'); R(X-1,y+14,32,1,C.foam); }
function drawCanoe(X,Y,tm){ const y=Y+Math.round(Math.sin(tm*1.6)); R(X+1,y+6,26,5,C.out); R(X+2,y+7,24,2,C.trunk); R(X+2,y+9,24,1,C.trunk2); R(X+6,y+1,1,6,C.out); R(X+20,y+1,1,6,C.out); R(X+4,y,20,2,C.out); R(X+4,y-1,20,2,C.wood2); R(X,y+11,28,1,C.foam); }
function drawPlaneSmall(X,Y){ R(X+1,Y+5,30,7,C.out); R(X+2,Y+6,28,5,'#ffffff'); R(X+2,Y+9,28,1,'#d9453a'); for(let i=0;i<5;i++) R(X+9+i*4,Y+7,2,1,'#2b3a52'); R(X+27,Y+1,5,6,C.out); R(X+28,Y+2,3,4,'#d9453a'); R(X+10,Y+10,10,4,C.out); R(X+11,Y+11,8,2,'#cfd6dd'); R(X+30,Y+7,3,3,C.out); }
function cone(cxm,topY,baseY,topHalf,baseHalf,tm,night,shadeCol='#625d69'){
  for(let yy=topY;yy<baseY;yy++){ const p=(yy-topY)/(baseY-topY), hw=Math.round(topHalf+(baseHalf-topHalf)*Math.pow(p,.75));
    R(cxm-hw-1,yy,hw*2+2,1,C.out); R(cxm-hw,yy,hw*2,1,p<.12?'#4d4853':shadeCol); R(cxm-hw,yy,Math.round(hw*.4),1,'#6f6a77'); R(cxm+Math.round(hw*.6),yy,Math.round(hw*.4),1,'#55505d');
    for(const f of [-.62,-.28,.12,.46,.78]){ const gx=Math.round(cxm+f*hw+Math.sin(yy*.35+f*9)*1.5); R(gx,yy,2,1,'#4a4651'); } }
  R(cxm-topHalf,topY-1,topHalf*2,3,C.out); R(cxm-topHalf+2,topY,topHalf*2-4,2,`rgba(255,${120+Math.round(Math.sin(tm*5)*40)},40,${night?1:.6})`);
  for(let i=0;i<6;i++){ const ph=(tm*.18+i/6+cxm*.01)%1, sx=cxm+Math.sin(ph*5+i)*5+ph*16, sy=topY-4-ph*46, rr=Math.round(4+ph*9); blob(ctx,sx,sy,rr,`rgba(${night?120:190},${night?110:185},${night?120:190},${(1-ph)*.75})`); }
  if(night) for(let i=0;i<8;i++){ const ph=(tm*.9+i*.37+cxm)%1; if(ph<.6){ const sx=cxm+Math.sin(i*7.3)*ph*26, sy=topY-ph*30+ph*ph*40; R(sx,sy,2,2,ph<.3?'#ffd23f':'#ff7a1a'); } }
}
function drawVolcano(X,Y,w,h,tm,night){ cone(X+w/2,Y-14,Y+h,16,w/2+10,tm,night); }
function drawVolcano2(X,Y,w,h,tm,night){ cone(X+w*.3,Y-6,Y+h,11,w*.32,tm,night,'#5d5866'); cone(X+w*.72,Y-12,Y+h,12,w*.36,tm+3,night); }
function drawBanyan(X,Y,w,h,tm){
  const cxm=X+w/2; shadowE(cxm,Y+h-4,w+28,9,.25);
  R(cxm-11,Y-6,22,h+6,C.out); R(cxm-10,Y-6,20,h+5,'#7a5634'); R(cxm-10,Y-6,5,h+5,'#8c6440');
  for(let i=-14;i<=14;i+=3){ R(cxm+i,Y-10,1,h+10+((i*7)%3),i%2?'#5e4127':'#8c6440'); }
  const cs=[[-22,-20,16],[20,-20,16],[0,-30,19],[-10,-10,13],[12,-10,13],[0,-14,15]];
  for(const [dx,dy,r] of cs) blob(ctx,cxm+dx,Y+dy,r+1,C.out);
  for(const [dx,dy,r] of cs) blob(ctx,cxm+dx,Y+dy,r,'#245f2d');
  for(const [dx,dy,r] of cs) blob(ctx,cxm+dx-3,Y+dy-3,Math.round(r*.6),'#3a8f3d');
  for(const [dx,dy,r] of cs) blob(ctx,cxm+dx-5,Y+dy-6,Math.round(r*.25),'#66c65a');
}
function drawTower(X,Y,w,h,tm){
  const cxm=X+w/2, baseY=Y+h, topY=Y-70;
  shadowE(cxm+6,baseY-4,w+20,7,.28);
  for(let yy=topY;yy<baseY;yy++){ const p=(yy-topY)/(baseY-topY), hw=Math.round(6+p*12); if(yy%6===0) R(cxm-hw,yy,hw*2,2,C.out); }
  for(const s of [-1,1]){ for(let yy=topY;yy<baseY;yy++){ const p=(yy-topY)/(baseY-topY), hw=Math.round(6+p*12); R(cxm+s*hw-1,yy,3,1,C.out); R(cxm+s*hw,yy,1,1,C.wood); } }
  for(let yy=topY+3;yy<baseY;yy+=6){ const p=(yy-topY)/(baseY-topY), hw=Math.round(6+p*12); R(cxm-hw+1,yy,hw*2-2,1,C.wood); }
  for(let i=0;i<5;i++){ const yy=topY+8+i*12; R(cxm+8,yy,10,2,C.out); R(cxm+8,yy,9,1,'#b88252'); }
  R(cxm-8,topY-2,16,3,C.out); R(cxm-7,topY-2,14,1,'#c08a52');
  for(let i=0;i<4;i++){ const vx=cxm+14+i*2; pline(ctx,vx,topY+10+i*12,vx+2+Math.sin(tm+i)*2,baseY-8,'#3f9a3a'); }
  R(cxm-1,topY-10,2,8,C.out); R(cxm,topY-10,4,3,'#d9453a');
}
function drawTamtam(X,Y,w,h){
  shadowE(X+w/2,Y+h-3,w+8,6,.25);
  const ds=[[X+3,Y-18,10,34],[X+18,Y-26,12,42],[X+34,Y-14,10,30]];
  for(const [x,y,ww,hh] of ds){ R(x-1,y-1,ww+2,hh+2,C.out); R(x,y,ww,hh,'#7a4e2c'); R(x,y,2,hh,'#94643a'); R(x+ww-2,y,2,hh,'#5e3c22');
    R(x+2,y+4,ww-4,3,C.out); R(x+3,y+5,2,1,'#ffffff'); R(x+ww-5,y+5,2,1,'#ffffff');
    R(x+3,y+9,ww-6,2,'#3a2414'); R(x+ww/2-1,y+12,2,hh-16,C.out); R(x+2,y+hh-6,ww-4,1,'#d9453a'); }
}
function drawRopeTree(X,Y,tm){
  drawJTree(X,Y,7);
  const sw=Math.sin(tm*1.6)*4; pline(ctx,X+12,Y+2,X+14+sw,Y+26,'#c8a24a'); R(X+12+sw,Y+26,5,2,C.out);
}
function drawSandMini(X,Y){ ctx.drawImage(sandCanvas(32,16,true),X,Y); }
function atlasDraw(name,i,cxp,bottom,flip){ const r=ASSET_META[name][i]; const w=r[2]/SC, h=r[3]/SC; const x=snap(cxp-w/2), y=snap(bottom-h);
  if(flip){ ctx.save(); ctx.translate(x+w,y); ctx.scale(-1,1); ctx.drawImage(IMG[name],r[0],r[1],r[2],r[3],0,0,w,h); ctx.restore(); } else ctx.drawImage(IMG[name],r[0],r[1],r[2],r[3],x,y,w,h); return {x,y,w,h}; }
const BIDX={tama:0,nakamal:1,village:2,bungalow:3,airport:4,market:5,store:6,booth:7};
function plate(label,cxp,y,bg,fg){ const lw=ptw(label)+6; R(cxp-lw/2,y,lw,9,C.out); R(cxp-lw/2+1,y+1,lw-2,7,bg); ptext(ctx,label,cxp-lw/2+3,y+2,fg); }
const B2IDX={ticket:0,canteen:1,craft:2,guest:3,copra:4,resto:5,busstop:6,shed:7};
function drawBuildArt(b,X,Y,w,h,tm){
  const key=b.type==='hut'?(b.style||'village'):(b.type==='booth'&&b.label==='BOAT'?'ticket':b.type); let atlas='buildings', i=BIDX[key];
  if(i==null||key==='ticket'){ i=B2IDX[key]; atlas='buildings2'; }
  if(i==null||!imgOk(atlas)||!ASSET_META[atlas]||!ASSET_META[atlas][i]) return false;
  const cxp=X+w/2; shadowE(cxp+3,Y+h-4,w+10,7,.25);
  const r=atlasDraw(atlas,i,cxp,Y+h+2);
  if(b.label){ if(b.type==='airport') plate(b.label,cxp,r.y+r.h-38,'#1f4d86','#ffffff'); else if(b.type==='market') plate(b.label,cxp,r.y-4,'#ffd84d',C.out); else plate(b.label,cxp,r.y-2,b.type==='booth'?'#ffd84d':'#d9453a',b.type==='booth'?C.out:'#ffffff'); }
  return true; }
function volcFx(x,y,tm,night){ for(let i=0;i<5;i++){ const ph=(tm*.18+i/5)%1, sx=x+Math.sin(ph*5+i)*4+ph*14, sy=y-4-ph*40, rr=Math.round(3+ph*8); blob(ctx,sx,sy,rr,`rgba(${night?120:200},${night?110:195},${night?120:200},${(1-ph)*.6})`); }
  if(night) for(let i=0;i<6;i++){ const ph=(tm*.9+i*.37)%1; if(ph<.6) R(x+Math.sin(i*7.3)*ph*22,y-ph*26+ph*ph*34,2,2,ph<.3?'#ffd23f':'#ff7a1a'); } }
function drawBuild(b,cx,cy,tm){
  const X=b.x*16-cx, Y=b.y*16-cy, w=b.w*16, h=b.h*16, night=G.slot>=2;
  if(['hut','airport','store','market','booth','canteen','craft','copra','resto','busstop','shed'].includes(b.type)&&drawBuildArt(b,X,Y,w,h,tm)) return;
  if(imgOk('nature')){ if(b.type==='banyan'){ shadowE(X+w/2,Y+h-4,w+40,10,.25); atlasDraw('nature',2,X+w/2,Y+h+4); return; } if(b.type==='tower'){ shadowE(X+w/2+6,Y+h-4,w+14,7,.28); atlasDraw('nature',3,X+w/2,Y+h+2); return; } if(b.type==='boat'){ const bob=Math.round(Math.sin(tm*1.8)); atlasDraw('nature',5,X+16,Y+16+bob); R(X-1,Y+15+bob,34,1,C.foam); return; } if(b.type==='canoe'){ const bob=Math.round(Math.sin(tm*1.6)); atlasDraw('nature',6,X+14,Y+14+bob); return; } if(b.type==='plane'){ atlasDraw('nature',7,X+16,Y+20); return; } }
  if(imgOk('objs2')){
    if(b.type==='volcano'){ const r=atlasDraw('objs2',0,X+w/2,Y+h+10); volcFx(X+w/2-4,r.y+14,tm,G.slot>=2); return; }
    if(b.type==='volcano2'){ const r=atlasDraw('objs2',1,X+w/2,Y+h+10); volcFx(X+w/2-38,r.y+30,tm,G.slot>=2); volcFx(X+w/2+30,r.y+20,tm+2,G.slot>=2); return; }
    if(b.type==='sign'){ shadowE(X+8,Y+15,14,3,.22); const r=atlasDraw('objs2',4,X+8,Y+17); const lw=Math.max(14,ptw(b.label)+6); R(X+8-lw/2,r.y+2,lw,9,C.out); R(X+9-lw/2,r.y+3,lw-2,7,'#a26b3a'); ptext(ctx,b.label,X+11-lw/2,r.y+4,'#fff3d0'); return; }
    if(b.type==='postsign'){ const bob=Math.round(Math.sin(tm*2)); atlasDraw('objs2',5,X+8,Y+18+bob); return; }
    if(b.type==='ropetree'){ shadowE(X+10,Y+13,30,6,.22); atlasDraw('objs2',6,X+8,Y+18); return; }
  }
  switch(b.type){
    case 'hut': drawHut(X,Y,w,h,b,tm); break;
    case 'airport': drawAirport(X,Y,w,h,b); break;
    case 'store': drawStore(X,Y,w,h,b); break;
    case 'market': drawMarket(X,Y,w,h,b); break;
    case 'booth': drawBooth(X,Y,w,h,b); break;
    case 'sign': drawSign(X,Y,b); break;
    case 'postsign': drawPostSign(X,Y,tm); break;
    case 'boat': drawBoat(X,Y,tm); break;
    case 'canoe': drawCanoe(X,Y,tm); break;
    case 'plane': drawPlaneSmall(X,Y+2); break;
    case 'volcano': drawVolcano(X,Y,w,h,tm,night); break;
    case 'volcano2': drawVolcano2(X,Y,w,h,tm,night); break;
    case 'banyan': drawBanyan(X,Y,w,h,tm); break;
    case 'tower': drawTower(X,Y,w,h,tm); break;
    case 'tamtam': drawTamtam(X,Y,w,h); break;
    case 'ropetree': drawRopeTree(X,Y,tm); break;
    case 'sanddraw': drawSandMini(X,Y); break;
  }
}

/* ---------------- sand drawing ---------------- */
function densify(pts,step=.006){ const out=[]; for(let i=0;i<pts.length-1;i++){ const [x1,y1]=pts[i],[x2,y2]=pts[i+1]; const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/step)); for(let k=0;k<n;k++) out.push([lerp(x1,x2,k/n),lerp(y1,y2,k/n)]); } out.push(pts[pts.length-1]); return out; }
const PIECE_PTS={};
(function(){
  const b=[]; for(let i=0;i<=160;i++){ const a=i/160*Math.PI*2, s=Math.sin(a), c=Math.cos(a), d=1+s*s; b.push([.5+.22*c/d,.47+.22*s*c/d]); } PIECE_PTS.begin=densify(b);
  PIECE_PTS.fire=densify([[.5,.47],[.5,.6],[.47,.62],[.5,.65],[.53,.62],[.5,.6],[.5,.66],[.37,.86],[.63,.86],[.5,.66],[.44,.77],[.56,.77]]);
  const wa=[[.4,.42],[.3,.3]]; for(let i=0;i<=90;i++){ const a=-Math.PI*.75+i/90*Math.PI*3.2, rr=.1*(1-i/120); wa.push([.22+Math.cos(a)*rr,.22+Math.sin(a)*rr]); } PIECE_PTS.water=densify(wa);
  const v=[[.6,.42],[.72,.3]]; for(let i=0;i<=60;i++){ const q=i/60; v.push([.78+Math.sin(q*Math.PI*4)*.05,.3-q*.22]); } PIECE_PTS.vine=densify(v);
  PIECE_PTS.drum=densify([[.38,.52],[.26,.64],[.15,.64],[.15,.88],[.27,.88],[.27,.64],[.21,.64],[.21,.88]]);
  const tu=[[.62,.52],[.74,.64],[.8,.66]]; for(let i=0;i<=60;i++){ const a=-Math.PI/2+i/60*Math.PI*2; tu.push([.8+Math.cos(a)*.08,.76+Math.sin(a)*.1]); } tu.push([.8,.66],[.8,.62],[.86,.7],[.9,.68],[.86,.7],[.88,.86],[.8,.86],[.72,.86],[.74,.7],[.7,.68]); PIECE_PTS.turtle=densify(tu);
  const hm=[]; for(let i=0;i<=200;i++){ const a=-Math.PI/2+i/200*Math.PI*2; hm.push([.5+Math.cos(a)*.47,.5+Math.sin(a)*.47]); } PIECE_PTS.home=densify(hm);
})();
const DOTS=[]; for(let i=0;i<5;i++) for(let j=0;j<5;j++) DOTS.push([.14+i*.18,.14+j*.18]);
function drawSand(g,x,y,w,h,ids,prog=1,o={}){
  if(o.bg){ g.fillStyle='#e7cd92'; g.fillRect(x,y,w,h); for(let i=0;i<w*h/18;i++){ const q=hash(i,w+h); g.fillStyle=q%3?'#d9bc7c':'#f3dfae'; g.fillRect(x+q%w,y+((q>>8)%h),1,1); } }
  g.fillStyle='#a8854a'; for(const [u,v] of DOTS) g.fillRect(Math.round(x+u*w),Math.round(y+v*h),1,1);
  if(o.ghost){ for(const p of PIECES){ if(ids.includes(p.id)) continue; const pts=PIECE_PTS[p.id]; g.fillStyle='rgba(120,90,40,.28)'; for(let k=0;k<pts.length;k+=7) g.fillRect(Math.round(x+pts[k][0]*w),Math.round(y+pts[k][1]*h),1,1); } }
  let total=0; for(const id of ids) total+=PIECE_PTS[id].length; let left=Math.floor(total*prog), head=null;
  for(const id of ids){ const pts=PIECE_PTS[id]; const n=Math.min(pts.length,left); left-=n;
    for(let k=0;k<n;k++){ g.fillStyle='#fbe7b3'; g.fillRect(Math.round(x+pts[k][0]*w)+1,Math.round(y+pts[k][1]*h)+1,1,1); }
    for(let k=0;k<n;k++){ const px=Math.round(x+pts[k][0]*w), py=Math.round(y+pts[k][1]*h); g.fillStyle=id==='home'?'#8a3a1a':'#7a5a2a'; g.fillRect(px,py,1,1); if(k===n-1) head=[px,py]; }
    if(left<=0) break; }
  return head;
}
const sandCache={};
const pieceIds=()=>PIECES.filter(p=>G.pieces[p.id]).map(p=>p.id).concat(G.pieces.home?['home']:[]);
function sandCanvas(w,h,patch){ const key=w+'x'+h+':'+pieceIds().join(','); if(sandCache[key]) return sandCache[key]; const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d');
  if(patch){ g.fillStyle='#e7cd92'; g.fillRect(1,1,w-2,h-2); g.fillStyle='#d4b676'; g.fillRect(1,h-2,w-2,1); drawSand(g,6,0,20,16,pieceIds(),1,{}); }
  else drawSand(g,0,0,w,h,pieceIds(),1,{bg:true,ghost:true});
  return sandCache[key]=c; }
