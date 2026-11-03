/* ---------------- map scene ---------------- */
let M=MAPS.efate;
const P={x:26,y:8,fx:26,fy:8,prog:1,dir:'down',moving:false,walkT:0};
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const opp=d=>({up:'down',down:'up',left:'right',right:'left'}[d]);
function tileAt(m,x,y){ return (m.t[y]&&m.t[y][x])||null; }
function blocked(x,y,self){
  if(x<0||y<0||x>=M.w||y>=M.h) return true;
  if(SOLID.has(M.t[y][x])) return true; if(M.solid[y][x]) return true;
  for(const n of M.npcs){ if(n===self) continue; if((n.x===x&&n.y===y)||(n.prog<1&&n.fx===x&&n.fy===y)) return true; }
  if(self&&((P.x===x&&P.y===y)||(P.fx===x&&P.fy===y))) return true;
  return false;
}
function facing(){ const [dx,dy]=DIRS[P.dir]; const tx=P.x+dx, ty=P.y+dy; const n=M.npcs.find(n=>n.x===tx&&n.y===ty); if(n) return {npc:n}; const o=M.inter.find(o=>o.x===tx&&o.y===ty); if(o) return {obj:o}; return null; }
function interact(){ const f=facing(); if(!f) return; if(f.npc){ f.npc.dir=opp(P.dir); run(f.npc.talk); } else run(f.obj.fn); }
function enterMap(id,x,y,dir='down'){
  G.island=id; if(!G.visited[id]) G.visited[id]=1; if(G.route[G.route.length-1]!==id) G.route.push(id);
  M=MAPS[id]; groundOf(M); M.npcs=M.populate();
  P.x=P.fx=x; P.y=P.fy=y; P.dir=dir; P.prog=1; P.moving=false;
  amb.reset(); setScene(MapScene); hudShow(true); hud(); save();
}
function repopulate(){ M.npcs=M.populate(); }
let scene=null; function setScene(s){ scene=s; }
let wobble=0;
const amb={birds:[],bflies:[],t:0,reset(){ this.birds=[]; this.bflies=Array.from({length:4},(_,i)=>({x:rnd()*W,y:20+rnd()*120,p:rnd()*6,c:['#ffd84d','#ff8ad1','#ffffff','#8fe0ff'][i%4]})); }};
function onStep(){ G.steps++; if(busyCount===0&&!uiOpen()&&G.steps-G.lastEvStep>45&&G.evKey!==G.day*4+G.slot&&G.day>1&&rnd()<.03){ G.lastEvStep=G.steps; G.evKey=G.day*4+G.slot; run(()=>randomEvent('walk')); } }
let lastDir=null;
function heldDir(){ const ks=['up','down','left','right'].filter(k=>keys[k]); if(!ks.length){ lastDir=null; return null; } if(lastDir&&keys[lastDir]&&ks.length>1){ const other=ks.find(k=>k!==lastDir); if(other) return other; } if(ks.length===1) lastDir=ks[0]; return ks.includes(lastDir)?lastDir:ks[0]; }
function tryStep(d,carry){ P.dir=d; const [dx,dy]=DIRS[d]; if(!blocked(P.x+dx,P.y+dy)){ P.fx=P.x; P.fy=P.y; P.x+=dx; P.y+=dy; P.prog=carry; P.moving=true; if(G.steps%2===0) stepFx(P.fx,P.fy); return true; } P.bumpT=(P.bumpT||0)-1; if(P.bumpT<=0){ sfx.bump(); P.bumpT=14; } return false; }
const MapScene={
  anim(dt,tm){
    if(P.moving){ P.prog+=dt*(keys.b?8.5:4.8); P.walkT+=dt; if(P.prog>=1){ const carry=P.prog-1; P.prog=1; P.moving=false; P.fx=P.x; P.fy=P.y; onStep();
        if(busyCount===0&&!uiOpen()){ const d=heldDir(); if(d) tryStep(d,Math.min(carry,.5)); } } }
    for(const n of M.npcs){
      if(n.prog<1){ n.prog=Math.min(1,n.prog+dt*2.6); if(n.prog>=1){ n.fx=n.x; n.fy=n.y; } continue; }
      if(n.wander&&busyCount===0&&!uiOpen()){ n.wt=(n.wt??(1+rnd()*3))-dt; if(n.wt<=0){ n.wt=2+rnd()*3; const ds=['up','down','left','right'], d=ds[(rnd()*4)|0]; n.dir=d; const [dx,dy]=DIRS[d], nx=n.x+dx, ny=n.y+dy; if(Math.abs(nx-n.hx)<=2&&Math.abs(ny-n.hy)<=2&&!blocked(nx,ny,n)&&!SOLID.has(tileAt(M,nx,ny))&&tileAt(M,nx,ny)!=='p'){ n.fx=n.x; n.fy=n.y; n.x=nx; n.y=ny; n.prog=0; } } }
    }
    if(wobble>0) wobble=Math.max(0,wobble-dt);
    amb.t+=dt; if(G.slot<2&&!G.rain&&rnd()<dt*.08&&amb.birds.length<3) amb.birds.push({x:-10,y:10+rnd()*60,v:22+rnd()*14,p:rnd()*6});
    for(const b of amb.birds) b.x+=b.v*dt; amb.birds=amb.birds.filter(b=>b.x<W+20);
  },
  input(){
    if(P.moving) return;
    if(consume('menu')){ openPanel(); return; }
    if(consume('a')){ interact(); return; }
    const d=heldDir(); if(d) tryStep(d,0);
  },
  draw(tm){
    const ppx=snap(lerp(P.fx,P.x,P.prog)*16), ppy=snap(lerp(P.fy,P.y,P.prog)*16);
    const cx=snap(clamp(ppx+8-W/2,0,M.w*16-W)), cy=snap(clamp(ppy+8-H/2,0,M.h*16-H));
    ctx.drawImage(groundOf(M),cx*SC,cy*SC,W*SC,H*SC,0,0,W,H);
    animTiles(cx,cy,tm);
    const list=[], vis=(px,py,m)=>px>-m&&px<W+m&&py>-m&&py<H+m+16;
    for(const tr of M.trees){ const sx=tr.x*16-cx, sy=tr.y*16-cy; if(vis(sx,sy,30)) list.push({y:tr.y*16+15,d:()=>tr.c==='#'?drawPalm(sx,sy,tr.h,tm):drawJTree(sx,sy,tr.h)}); }
    for(const b of M.builds){ const sx=b.x*16-cx, sy=b.y*16-cy; if(sx>W+60||sy>H+60||sx+b.w*16<-60||sy+b.h*16<-90) continue; list.push({y:b.flat?b.y*16:(b.y+b.h)*16-1,d:()=>drawBuild(b,cx,cy,tm)}); }
    for(const n of M.npcs){ const nx=lerp(n.fx,n.x,n.prog)*16, ny=lerp(n.fy,n.y,n.prog)*16; if(vis(nx-cx,ny-cy,20)) list.push({y:ny+15.5,d:()=>drawChar(nx-cx,ny-cy,n.dir,n.prog<1?(Math.floor(n.prog*4)%4):0,n.look)}); }
    list.push({y:ppy+15.6,d:()=>drawChar(ppx-cx,ppy-cy,P.dir,P.moving?(Math.floor(P.walkT*8)%4):0,lookOf('me'))});
    list.sort((a,b)=>a.y-b.y); for(const o of list) o.d();
    worldFx(cx,cy,tm);
    ambientDraw(tm,cx,cy);
    if(!P.moving&&busyCount===0&&!uiOpen()&&facing()){ const bx=Math.round(ppx-cx)+4, by=Math.round(ppy-cy)-16+Math.round(Math.sin(tm*6)); R(bx-1,by-1,10,9,C.out); R(bx,by,8,7,'#ffffff'); ptext(ctx,'A',bx+3,by+1,'#c4513a'); R(bx+3,by+8,2,2,C.out); }
    tintPass(tm,cx,cy);
    if(G.rain) rainFx(tm);
    screenFx(tm);
    if(wobble>0) wobbleFx(tm,wobble);
  }
};
function animTiles(cx,cy,tm){
  const x0=Math.floor(cx/16), y0=Math.floor(cy/16);
  const land=c=>c&&!isWaterCh(c)&&c!=='p'&&c!=='M'&&c!=='B'&&c!=='o'&&c!=='W';
  for(let y=y0;y<=y0+10;y++) for(let x=x0;x<=x0+15;x++){
    const ch=tileAt(M,x,y); if(!ch) continue; const X=x*16-cx, Y=y*16-cy, h=hash(x,y);
    if(ch==='~'||ch==='v'){ if(h%3===0){ const ph=(tm*.35+(h%100)/100)%1, ox=Math.round(ph*10)-2; const a=Math.sin(ph*Math.PI); if(a>.25){ R(X+((h>>3)%8)+ox,Y+((h>>6)%13),4,1,ch==='~'?'#5d97dc':'#73b5ea'); R(X+((h>>3)%8)+ox+1,Y+((h>>6)%13)-1,2,1,ch==='~'?'#4a86cf':'#5ea6e2'); } }
      if(h%23===0&&Math.sin(tm*3+h)>.92) R(X+(h%14),Y+((h>>5)%14),1,1,'#ffffff'); }
    if(ch==='w'){ if(h%4===0){ const ox=Math.round(Math.sin(tm*1.2+h)*2); R(X+((h>>3)%10)+ox,Y+((h>>6)%13),3,1,'#b5ecf6'); }
      const ph=(Math.sin(tm*1.8+x*.7+y*.9)+1)*1.4;
      const edges=[[0,-1],[0,1],[-1,0],[1,0]];
      for(const [dx,dy] of edges){ if(!land(tileAt(M,x+dx,y+dy))) continue; const o=Math.round(ph);
        for(let i=0;i<16;i++){ if((hash(x*16+i,y*3+dx+dy*2)+Math.floor(tm*3))%5===0) continue; const px=dy?X+i:(dx<0?X+o:X+15-o), py=dx?Y+i:(dy<0?Y+o:Y+15-o); R(px,py,1,1,C.foam); if(i%3===0) R(dy?px:(dx<0?px+1:px-1),dx?py:(dy<0?py+1:py-1),1,1,'rgba(234,252,255,.55)'); } } }
    if(ch==='W'){ for(let i=0;i<4;i++) R(X+i*4+1,Y+((tm*42+i*7)%16)-2,2,6,'#ffffff'); }
    if(ch==='o'&&tileAt(M,x,y-1)==='W'){ const q=(tm*3+x)%1; R(X+2+q*4,Y+2,10-q*6,1,'#ffffff'); }
    if(ch==='B'&&h%5===0&&Math.sin(tm*2+h)>.7) R(X+(h%12)+2,Y+((h>>4)%12)+2,2,1,'#9fe0ff');
  }
}
function ambientDraw(tm,cx,cy){
  const s=G.tint!=null?G.tint:G.slot;
  if(s<2&&!G.rain){ for(const b of amb.bflies){ b.p+=.05; const x=(b.x+Math.sin(b.p*.7)*30+W)%W, y=b.y+Math.sin(b.p)*6; const f=Math.sin(tm*18+b.p)>0; R(x,y,1,1,C.out); R(x-(f?2:1),y-1,f?2:1,2,b.c); R(x+1,y-1,f?2:1,2,b.c); } }
  for(const b of amb.birds){ const f=Math.sin(tm*10+b.p)>0; R(b.x,b.y,1,1,'#2a2f3a'); R(b.x-2,b.y-(f?1:0),2,1,'#2a2f3a'); R(b.x+1,b.y-(f?1:0),2,1,'#2a2f3a'); }
  if(s===3||s===2){ for(let i=0;i<14;i++){ const q=hash(i,M.w); const x=((q%W)+Math.sin(tm*.6+i)*14+W)%W, y=((q>>8)%H)+Math.cos(tm*.8+i)*8; if(Math.sin(tm*3+i*1.7)>.2) R(x,y,1,1,s===3?'#fff27a':'rgba(255,242,122,.6)'); } }
}
function tintPass(tm,cx,cy){
  const s=G.tint!=null?G.tint:G.slot;
  ctx.save();
  if(G.rain){ ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#a9b6c8'; ctx.fillRect(0,0,W,H); }
  if(s===1){ ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#fff0d8'; ctx.fillRect(0,0,W,H); }
  else if(s===2){ ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#ffb79e'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#f4e0ea'; ctx.fillRect(0,0,W,H); }
  else if(s==='gold'){ ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#ffc58a'; ctx.fillRect(0,0,W,H); }
  else if(s===3){ ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#4a5698'; ctx.fillRect(0,0,W,H); }
  ctx.restore();
  if(s===2||s===3||s==='gold'){
    ctx.save(); ctx.globalCompositeOperation='lighter';
    const lights=(M.lights||[]).slice(); if(M.volcano) lights.push({x:M.volcano.x,y:M.volcano.y,r:s===3?90:60,c:'255,90,30'});
    for(const l of lights){ const lx=l.x*16-cx, ly=l.y*16-cy; if(lx<-120||lx>W+120||ly<-120||ly>H+120) continue; const rr=l.r*(1+Math.sin(tm*3+l.x)*.04); const gr=ctx.createRadialGradient(lx,ly,0,lx,ly,rr); const col=l.c||'255,190,90'; gr.addColorStop(0,`rgba(${col},${s===3?.55:.3})`); gr.addColorStop(1,`rgba(${col},0)`); ctx.fillStyle=gr; ctx.fillRect(lx-rr,ly-rr,rr*2,rr*2); }
    ctx.restore();
  }
}
function rainFx(tm){ for(let i=0;i<60;i++){ const q=hash(i,7); const x=(q%W+tm*30)%W, y=((q>>8)%H+tm*220+i*13)%H; R(x,y,1,4,'rgba(200,225,255,.55)'); } }
const fxBuf=document.createElement('canvas'); fxBuf.width=W*SC; fxBuf.height=H*SC; const fxg=fxBuf.getContext('2d');
function wobbleFx(tm,amt){ fxg.clearRect(0,0,fxBuf.width,fxBuf.height); fxg.drawImage(cvs,0,0); const a=Math.min(1,amt)*2.2; for(let y=0;y<H;y+=1){ const o=snap(Math.sin(y*.09+tm*3.5)*a); ctx.drawImage(fxBuf,0,y*SC,W*SC,SC,o,y,W,1); } }

/* ---------------- other scenes ---------------- */
const skyCache={};
function gradCanvas(key,stops){ if(skyCache[key]) return skyCache[key]; const c=document.createElement('canvas'); c.width=1; c.height=H; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,H); for(const [p,col] of stops) gr.addColorStop(p,col); g.fillStyle=gr; g.fillRect(0,0,1,H);
  const d=g.getImageData(0,0,1,H); for(let i=0;i<d.data.length;i++) d.data[i]=Math.round(d.data[i]/10)*10; g.putImageData(d,0,0); return skyCache[key]=c; }
function silPalm(px,base,col,tm,sc=1){ for(let i=0;i<20*sc;i++) R(px+Math.round(i*i*.01/sc),base-i,2,1,col); for(const a of [-2.6,-.5,-1.6,2.6,.5]) for(let k=1;k<9*sc;k++) R(px+Math.round(20*sc*20*sc*.01/sc)+Math.cos(a+Math.sin(tm+px)*.05)*k*1.4,base-20*sc+Math.sin(a)*k+k*k*.08,3,2,col); }
const TitleScene={ draw(tm){
  if(imgOk('title')){ ctx.drawImage(IMG.title,0,0,W,H);
    for(let i=0;i<10;i++){ const q=hash(i,51); const x=150+(q%30), y=118+((q>>6)%30); if(Math.sin(tm*3+i*1.9)>.55) R(x,y,2,1,'#fff6d0'); }
    for(let i=0;i<4;i++){ const ph=(tm*.12+i/4)%1; blob(ctx,52+ph*14+Math.sin(ph*6)*2,70-ph*26,Math.round(2+ph*5),`rgba(230,190,200,${(1-ph)*.45})`); }
    for(let i=0;i<3;i++){ const bx=(tm*10+i*90)%280-20, by=36+i*8+Math.sin(tm*2+i)*2; R(bx,by,2,1,'#3a2a50'); R(bx+2,by-1,1,1,'#3a2a50'); R(bx-1,by-1,1,1,'#3a2a50'); }
    return; }
  ctx.drawImage(gradCanvas('title',[[0,'#1d2763'],[.42,'#c85a6a'],[.6,'#f7a35c'],[.61,'#2c5fa6'],[1,'#173d73']]),0,0,W,H);
  for(let i=0;i<20;i++){ const q=hash(i,44); if(Math.sin(tm*2+i)>-.3) R(q%W,(q>>8)%40,1,1,'rgba(255,255,255,.7)'); }
  blob(ctx,176,98,20,'#ffd27a'); blob(ctx,176,98,16,'#ffe9a6'); R(150,98,60,62,'#2c5fa6');
  for(let y=99;y<160;y+=3){ const q=(y-98)/60; for(let i=0;i<4;i++){ const x=176-12+Math.sin(tm*2+y*.4+i)*8*q+i*6-9; R(x,y,4+i%2*2,1,'#ffc670'); } }
  for(let i=0;i<30;i++){ const y=102+(i*7)%58, x=((i*53+tm*(6+i%5))%260)-10; R(x,y,4,1,'#6aa3e0'); }
  ctx.fillStyle='#232b52'; for(let x=150;x<240;x++){ const hgt=Math.max(0,16-Math.abs(x-205)*.5); ctx.fillRect(x,98-hgt,1,hgt); }
  ctx.fillStyle='#1b2240'; for(let x=0;x<130;x++){ const hgt=Math.max(0,40-Math.abs(x-62)*.7)+8+Math.sin(x*.3)*2; ctx.fillRect(x,160-hgt-6,1,hgt+6); }
  R(55,107,16,3,'#ff7a1a'); R(58,106,10,1,'#ffd23f');
  for(let i=0;i<5;i++){ const ph=(tm*.15+i/5)%1; blob(ctx,63+ph*20+Math.sin(ph*6)*3,103-ph*40,Math.round(3+ph*8),`rgba(40,40,70,${(1-ph)*.7})`); }
  for(const px of [12,30,104]) silPalm(px,154,'#1b2240',tm);
  for(let i=0;i<3;i++){ const bx=(tm*14+i*70)%280-20, by=40+i*9+Math.sin(tm*2+i)*2; R(bx,by,2,1,'#1b2240'); R(bx+2,by-1,1,1,'#1b2240'); R(bx-1,by-1,1,1,'#1b2240'); }
}};
const RoomScene={postcard:0,pcT:0, anim(dt){ if(this.postcard) this.pcT=Math.min(1,this.pcT+dt*.8); }, draw(tm){
  if(imgOk('bg_room')){ ctx.drawImage(IMG.bg_room,0,0,W,H);
    for(let i=0;i<26;i++){ const rx=18+((i*29+tm*40)%92), ry=16+((i*17+tm*120)%46); R(rx,ry,1,3,'rgba(170,200,255,.55)'); }
    const lg=ctx.createRadialGradient(158,78,1,158,78,26); lg.addColorStop(0,'rgba(170,220,255,.25)'); lg.addColorStop(1,'rgba(170,220,255,0)'); ctx.fillStyle=lg; ctx.fillRect(120,50,80,60);
    drawChar(80,96,'right',0,lookOf('me'));
    if(this.postcard){ const x=lerp(214,190,this.pcT); R(x,123,16,10,C.out); R(x+1,124,14,8,'#fff4dc'); R(x+2,125,5,4,'#4fb3de'); R(x+10,125,4,3,'#d9453a'); }
    return; }
  R(0,0,W,H,'#262a44'); for(let x=0;x<W;x+=4) R(x,0,1,120,'#2a2e4a'); R(0,120,W,40,'#3b3552'); for(let x=0;x<W;x+=20) R(x,120,1,40,'#2f2a45'); R(0,119,W,2,'#1a1c2e');
  R(18,18,86,66,C.out); R(21,21,80,60,'#121a3a');
  for(let i=0;i<9;i++){ const bx=22+i*9, bh=18+((i*37)%30); R(bx,81-bh,8,bh,'#1d2550'); for(let k=0;k<bh-4;k+=4) for(let j=0;j<2;j++) if(hash(i*7+j,k)%3===0) R(bx+1+j*4,81-bh+2+k,2,2,'#ffd96b'); }
  for(let i=0;i<30;i++){ const rx=(i*29+tm*40)%80+21, ry=(i*17+tm*120)%60+21; R(rx,ry,1,3,'rgba(160,190,255,.6)'); }
  R(60,18,2,66,C.out); R(18,49,86,2,C.out);
  R(196,40,34,80,C.out); R(198,42,30,78,'#7a4a2e'); R(202,48,22,28,'#6a3f25'); R(202,82,22,30,'#6a3f25'); R(222,80,3,3,'#ffd27a');
  R(116,88,74,5,C.out); R(117,89,72,3,'#a0703f'); R(120,93,4,27,C.out); R(182,93,4,27,C.out);
  R(150,74,24,15,C.out); R(151,75,22,12,'#cfe8ff'); R(147,88,30,2,C.out); for(let i=0;i<4;i++) R(153,77+i*2,12+(i*5)%8,1,'#7aa8d8');
  const gl=ctx.createRadialGradient(162,82,2,162,82,40); gl.addColorStop(0,'rgba(170,220,255,.35)'); gl.addColorStop(1,'rgba(170,220,255,0)'); ctx.fillStyle=gl; ctx.fillRect(110,40,110,80);
  R(124,96,16,4,C.out); R(126,100,3,20,C.out); R(122,76,4,22,C.out);
  drawChar(126,80,'right',0,lookOf('me'));
  R(118,30,14,3,C.out); R(124,33,2,18,C.out); R(118,50,14,10,'#ffcf6a'); const lg=ctx.createRadialGradient(125,56,1,125,56,28); lg.addColorStop(0,'rgba(255,200,110,.35)'); lg.addColorStop(1,'rgba(255,200,110,0)'); ctx.fillStyle=lg; ctx.fillRect(95,28,60,60);
  R(30,100,10,20,C.out); R(31,101,8,18,'#3f9a3a'); blob(ctx,35,96,7,'#2f7a33');
  if(this.postcard){ const x=lerp(200,176,this.pcT); R(x,124,16,10,C.out); R(x+1,125,14,8,'#fff4dc'); R(x+2,126,5,4,'#4fb3de'); R(x+10,126,4,3,'#d9453a'); }
}};
const FlightScene={ draw(tm){
  const FB=imgOk('bg_flight'); if(FB){ ctx.drawImage(IMG.bg_flight,0,0,W,H); for(let i=0;i<14;i++){ const y=110+(i*7)%46, x=((i*47-tm*(30+i%4*10))%280+280)%280-20; R(x,y,6,1,'rgba(150,190,240,.6)'); } } else {
  ctx.drawImage(gradCanvas('dawn',[[0,'#3a4a9a'],[.5,'#f08a6a'],[.7,'#ffd08a'],[.71,'#3b7fcf'],[1,'#235aa5']]),0,0,W,H);
  blob(ctx,60,112,14,'#fff1b8');
  for(let i=0;i<30;i++){ const y=116+(i*5)%44, x=((i*47-tm*(30+i%4*10))%280+280)%280-20; R(x,y,6,1,'#78b2ec'); }
  for(let i=0;i<6;i++){ const x=((i*67-tm*(18+i*3))%320+320)%320-40, y=20+i*14; for(const [dx,dy,r] of [[0,0,7],[9,2,6],[-8,3,5]]) blob(ctx,x+dx,y+dy+1,r,'rgba(220,180,190,.8)'); for(const [dx,dy,r] of [[0,0,7],[9,2,6],[-8,3,5]]) blob(ctx,x+dx,y+dy,r,'rgba(255,255,255,.9)'); } }
  const px=96, py=62+Math.sin(tm*2)*2;
  R(px,py+6,52,10,C.out); R(px+1,py+7,50,8,'#ffffff'); R(px+1,py+12,50,2,'#d9453a'); for(let i=0;i<8;i++) R(px+12+i*4,py+9,2,2,'#2b3a52'); R(px+44,py+8,7,4,'#2b3a52');
  R(px-2,py-2,10,10,C.out); R(px-1,py-1,8,8,'#d9453a'); R(px+18,py+13,18,6,C.out); R(px+19,py+14,16,4,'#cfd6dd'); R(px+18,py+2,14,5,C.out); R(px+19,py+3,12,3,'#dfe4ea');
}};
/* world map */
const WMAP={santo:{x:46,y:34,rx:20,ry:13,label:'SANTO'},malekula:{x:72,y:64,rx:9,ry:12,label:'MALEKULA',left:true},pentecost:{x:120,y:46,rx:4,ry:15,label:'PENTECOST'},
  ambrym:{x:104,y:66,rx:8,ry:5,label:'AMBRYM'},epi:{x:110,y:84,rx:6,ry:3},efate:{x:124,y:104,rx:10,ry:7,label:'EFATE'},erromango:{x:150,y:126,rx:10,ry:7},tanna:{x:166,y:146,rx:8,ry:6,label:'TANNA'}};
let worldC=null;
function worldMap(){ if(worldC) return worldC; const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d');
  const im=g.createImageData(W,H); for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const v=vnoise(x/30,y/18,3)*.7+vnoise(x/8,y/6,4)*.3, b=BAYER[(y&3)*4+(x&3)]; const col=v+b*.35>1?[58,124,204]:v+b*.35>.55?[45,108,192]:[38,96,178]; const i=(y*W+x)*4; im.data[i]=col[0]; im.data[i+1]=col[1]; im.data[i+2]=col[2]; im.data[i+3]=255; } g.putImageData(im,0,0);
  g.fillStyle='rgba(255,255,255,.08)'; for(let x=0;x<W;x+=30) g.fillRect(x,0,1,H); for(let y=0;y<H;y+=30) g.fillRect(0,y,W,1);
  for(const [id,s] of Object.entries(WMAP)) for(let pass=0;pass<4;pass++) for(let dy=-s.ry-3;dy<=s.ry+3;dy++) for(let dx=-s.rx-3;dx<=s.rx+3;dx++){ const n=(dx/s.rx)**2+(dy/s.ry)**2+((hash(dx+s.x,dy+s.y)%100)/100-.5)*.35; const lim=[1.6,1.2,.9,.4][pass]; if(n<lim){ g.fillStyle=pass===0?'#56b9e0':pass===1?(id==='ambrym'?'#6a6570':'#f1d68e'):pass===2?'#5fb546':'#3f8a35'; g.fillRect(s.x+dx,s.y+dy,1,1); } }
  for(const [id,s] of Object.entries(WMAP)){ if(!s.label) continue; const lx=s.left?s.x-s.rx-4-ptw(s.label):s.x+s.rx+4, ly=s.y-2; ptext(g,s.label,lx+1,ly+1,'#16325e'); ptext(g,s.label,lx,ly,'#ffffff'); }
  ptext(g,'VANUATU',8,146,'#bfe0ff',2);
  const cx=210,cy=24; g.fillStyle='#bfe0ff'; for(let i=-8;i<=8;i++){ g.fillRect(cx+i,cy,1,1); g.fillRect(cx,cy+i,1,1); } ptext(g,'N',cx-1,cy-15,'#ffffff');
  return worldC=c; }
function TravelScene(from,to,mode,res){ let p=0, done=false; const A=WMAP[from], B=WMAP[to];
  return { anim(dt){ p=Math.min(1,p+dt/3.6); if(p>=1&&!done){ done=true; setTimeout(res,350); } },
    draw(tm){ ctx.drawImage(worldMap(),0,0);
      for(const id of Object.keys(G.visited)){ const s=WMAP[id]; if(s) { R(s.x-1,s.y-1,3,3,'#ffd84d'); } }
      const arc=mode==='plane'?22:4; const pos=q=>[lerp(A.x,B.x,q),lerp(A.y,B.y,q)-Math.sin(q*Math.PI)*arc];
      for(let i=0;i<=50;i++){ if(i%2) continue; const [x,y]=pos(i/50); R(x,y,1,1,i/50<=p?'#ffd84d':'rgba(255,255,255,.6)'); }
      const e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2; const [vx,vy]=pos(e);
      if(mode==='plane'){ const dir=B.x>=A.x?1:-1; const r=(x,y,w,h,c)=>R(dir>0?vx+x:vx-x-w,vy+y,w,h,c); shadowE(vx,vy+10,10,3,.25); r(-6,-2,12,5,C.out); r(-5,-1,10,3,'#ffffff'); r(-2,-5,4,11,C.out); r(-1,-4,2,9,'#ffffff'); r(-7,-4,3,4,C.out); r(-6,-3,2,2,'#d9453a'); }
      else { R(vx-6,vy-1,12,5,C.out); R(vx-5,vy,10,3,'#ffffff'); R(vx-2,vy-5,5,5,C.out); R(vx-1,vy-4,3,3,'#e8eef2'); R(vx-9,vy+4,18,1,C.foam); R(vx-14+Math.sin(tm*4)*2,vy+3,4,1,C.foam); }
      for(let i=0;i<4;i++){ const x=((i*80+tm*8)%300)-30, y=20+i*33; blob(ctx,x,y,6,'rgba(255,255,255,.55)'); blob(ctx,x+7,y+2,5,'rgba(255,255,255,.55)'); }
      if(mode==='boat'){ const n=Math.sin(p*Math.PI); ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.fillStyle=`rgba(60,70,150,${n*.75})`; ctx.fillRect(0,0,W,H); ctx.restore(); if(n>.4) for(let i=0;i<24;i++){ const q=hash(i,3); R(q%W,(q>>8)%90,1,1,`rgba(255,255,255,${(n-.4)*1.6})`); } }
      const lab=mode==='plane'?'FLIGHT':'OVERNIGHT BOAT'; R(6,6,ptw(lab)+8,11,C.out); R(7,7,ptw(lab)+6,9,'#ffd84d'); ptext(ctx,lab,10,9,C.out);
    } }; }
/* swimming: underwater post / Coolidge wreck */
function SwimScene(res,v='post'){ const wreck=v==='wreck'; const S={x:30,y:26,vx:0,vy:0,air:1,done:false,fail:false,dir:1};
  const fish=Array.from({length:wreck?5:8},(_,i)=>({x:(i*41)%240,y:40+(i*23)%80,s:12+i*3,c:['#ffd84d','#ff7a3a','#5fd0ff','#ff5d9e','#9bf06b'][i%5]}));
  const box=wreck?(imgOk('bg_wreck')?{x:195,y:128}:{x:186,y:118}):{x:198,y:120}; const airT=wreck?13:10;
  return { always:true,
    anim(dt){ for(const f of fish){ f.x+=f.s*dt; if(f.x>250) f.x=-10; }
      if(S.done) return; S.air-=dt/airT; if(S.air<=0&&!S.fail){ S.fail=true; run(async()=>{ await say(S1(null,`หายใจไม่ทัน! ว่ายขึ้นมาสูดลมแล้วลองใหม่`,`Out of breath! You pop up for air. Try again.`)); S.x=30; S.y=26; S.vx=S.vy=0; S.air=1; S.fail=false; }); } },
    input(dt){ if(S.done||S.fail) return; const ax=(keys.right?1:0)-(keys.left?1:0), ay=(keys.down?1:0)-(keys.up?1:0); if(ax) S.dir=ax; S.vx+=ax*170*dt; S.vy+=ay*170*dt; S.vy-=6*dt; S.vx*=.94; S.vy*=.94; S.x=clamp(S.x+S.vx*dt,8,232); S.y=clamp(S.y+S.vy*dt,18,138);
      if(Math.abs(S.x-box.x)<18&&S.y>box.y-32&&S.y<box.y+10){ S.done=true; sfx.stamp(); setTimeout(res,1000); } },
    draw(tm){ const bgk=wreck?'bg_wreck':'bg_reef';
      if(imgOk(bgk)){ ctx.drawImage(IMG[bgk],0,0,W,H); for(let x=0;x<W;x+=6) if(Math.sin(tm*3+x)>.6) R(x,5+Math.round(Math.sin(tm*2+x*.3)),3,1,'#ffffff'); } else {
      ctx.drawImage(gradCanvas(wreck?'wreck':'sea',wreck?[[0,'#4f9ad0'],[.1,'#2a6aa8'],[.6,'#173f73'],[1,'#0e2647']]:[[0,'#7fd3f0'],[.08,'#4fb3de'],[.6,'#2a74b8'],[1,'#1a4f8f']]),0,0,W,H);
      for(let i=0;i<5;i++){ ctx.fillStyle='rgba(255,255,255,.07)'; const x=20+i*50+Math.sin(tm*.6+i)*8; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+14,0); ctx.lineTo(x+40,H); ctx.lineTo(x+20,H); ctx.fill(); }
      R(0,10,W,2,'#bff0ff'); for(let x=0;x<W;x+=6) R(x+Math.sin(tm*3+x)*2,9,3,1,'#ffffff');
      R(0,142,W,18,wreck?'#8f8a72':'#e5c98a'); for(let x=0;x<W;x+=9) R(x,141+Math.round(Math.sin(x)),6,2,wreck?'#77735f':'#d4b676');
      if(wreck){ R(70,86,170,58,C.out); R(72,88,168,54,'#3d4a58'); R(72,88,168,4,'#56677a'); for(let i=0;i<7;i++){ R(86+i*20,100,8,8,C.out); R(88+i*20,102,4,4,'#0e2647'); } R(150,60,8,30,C.out); R(152,62,4,28,'#4a5a6c'); for(let i=0;i<20;i++){ const q=hash(i,9); R(72+q%160,90+(q>>8)%50,2,1,'#6b8f6a'); }
        R(box.x-14,box.y-34,28,36,C.out); R(box.x-12,box.y-32,24,32,'#0f2238'); }
      for(const [cx,cc] of wreck?[[30,'#c779ff'],[60,'#ff7a8a']]:[[40,'#ff7a8a'],[86,'#ffb54a'],[140,'#c779ff'],[226,'#ff7a8a']]){ for(let k=0;k<4;k++){ R(cx+k*3-5,128-k*4,3,16+k*4,C.out); R(cx+k*3-4,129-k*4,1,15+k*4,cc); } } }
      for(const f of fish){ R(f.x,f.y,7,4,C.out); R(f.x+1,f.y+1,5,2,f.c); R(f.x-3,f.y,3,4,C.out); R(f.x+5,f.y+1,1,1,C.out); }
      if(wreck){ R(box.x-7,box.y-26,14,20,'#e8e0c8'); R(box.x-5,box.y-24,10,16,'#cfc4a4'); R(box.x-2,box.y-22,4,5,'#e8e0c8'); R(box.x-3,box.y-17,6,8,'#e8e0c8'); R(box.x+2,box.y-20,4,2,'#ffffff'); ptextS(ctx,'LADY',box.x-7,box.y-4,'#ffd84d'); }
      else { R(box.x-1,box.y-2,3,24,C.out); R(box.x-9,box.y-16,18,14,C.out); R(box.x-8,box.y-15,16,12,'#ffd84d'); R(box.x-6,box.y-12,12,3,C.out); ptext(ctx,'POST',box.x-7,box.y-7,C.out); }
      const bub=(tm*30)%40; R(box.x+6,box.y-20-bub,2,2,'rgba(255,255,255,.7)');
      const sx=Math.round(S.x), sy=Math.round(S.y), d=S.dir; const r=(x,y,w,h,c)=>R(d>0?sx+x:sx-x-w,sy+y,w,h,c); const kick=Math.round(Math.sin(tm*12)*2);
      const me=lookOf('me');
      r(-12,-3,7,3,C.out); r(-14,-4+kick,4,3,'#2d2f3a'); r(-8,-3,14,7,C.out); r(-7,-2,12,5,me.shirt); r(-7,1,12,1,me.pants); r(4,-5,8,8,C.out); r(5,-4,6,6,me.skin); r(5,-4,6,2,me.hair); r(8,-2,4,3,'#5fd0ff'); r(10,-8,2,4,C.out);
      if((tm*3)%1<.1) r(12,-10,2,2,'rgba(255,255,255,.8)');
      R(6,6,52,7,C.out); R(7,7,50,5,'#123'); R(7,7,Math.max(0,50*S.air),5,S.air>.3?'#7fe3ff':'#ff6b5a'); ptextS(ctx,'AIR',62,7,'#ffffff');
      if(S.done) ptextS(ctx,wreck?'FOUND!':'POSTED!',W/2-ptw(wreck?'FOUND!':'POSTED!',2)/2,60,'#ffffff',2);
    } }; }
/* Yasur photo */
function VolcanoScene(res){ const V={t:0,next:1.6,er:false,et:0,parts:[],shots:3,flash:0,shake:0,photos:[],cap:null,ending:false};
  const stars=Array.from({length:40},(_,i)=>[hash(i,1)%W,hash(i,2)%70]);
  return { always:true,
    anim(dt){ V.t+=dt; if(!V.er&&V.next-V.t<.9) V.shake=Math.max(V.shake,(1-(V.next-V.t)/.9)*1.2);
      if(!V.er&&V.t>=V.next){ V.er=true; V.et=0; V.shake=3; sfx.boom(); for(let i=0;i<70;i++) V.parts.push({x:(imgOk('bg_crater')?103:120)+(rnd()-.5)*20,y:imgOk('bg_crater')?114:100,vx:(rnd()-.5)*90,vy:-100-rnd()*60,life:0}); }
      if(V.er){ V.et+=dt; if(V.et>2.4){ V.er=false; V.next=V.t+1.4+rnd()*2.2; } }
      for(const p of V.parts){ p.vy+=140*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.life+=dt; } V.parts=V.parts.filter(p=>p.y<140&&p.life<3);
      V.shake=Math.max(0,V.shake-dt*3); if(V.flash>0) V.flash-=dt*3;
      if(V.shots===0&&V.flash<=0&&!V.ending){ V.ending=true; setTimeout(()=>{ const best=V.photos.sort((a,b)=>b.s-a.s)[0]; res(best); },800); } },
    input(){ if(V.shots>0&&V.flash<=0&&consume('a')){ V.shots--; V.cap=V.er?(Math.abs(V.et-.85)<.2?3:Math.abs(V.et-.85)<.45?2:1):0; sfx.shutter(); } },
    draw(tm){ const sh=V.shake, ox=Math.round((rnd()-.5)*sh*2), oy=Math.round((rnd()-.5)*sh*2);
      ctx.save(); ctx.translate(ox,oy);
      const BG=imgOk('bg_crater'), LX=BG?103:120, LY=BG?120:108;
      if(BG){ ctx.drawImage(IMG.bg_crater,-4,-4,W+8,H+8); for(const [x,y] of stars) if(Math.sin(tm*2+x)>.7) R(x,y*.6,1,1,'#ffffff'); } else {
      ctx.drawImage(gradCanvas('vnight',[[0,'#070a22'],[.5,'#1e1440'],[1,'#3a1730']]),-4,-4,W+8,H+8);
      for(const [x,y] of stars) R(x,y,1,1,'rgba(255,255,255,.75)');
      for(let i=0;i<5;i++){ const ph=(tm*.12+i/5)%1; blob(ctx,120+Math.sin(ph*4+i)*10+ph*30,90-ph*80,Math.round(8+ph*18),`rgba(80,50,70,${(1-ph)*.6})`); }
      ctx.fillStyle='#231a26'; ctx.beginPath(); ctx.ellipse(120,106,104,30,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3a1a1a'; ctx.beginPath(); ctx.ellipse(120,108,52,13,0,0,Math.PI*2); ctx.fill();
      }
      for(let i=0;i<60;i++){ const q=hash(i,Math.floor(tm*6)); const px=LX+((q%100)/100-.5)*(BG?60:90), py=LY+(((q>>8)%100)/100-.5)*(BG?14:20); if(((px-LX)/(BG?30:45))**2+((py-LY)/(BG?7:10))**2<1) R(px,py,3,1,q%3?'#ff7a1a':'#ffd23f'); }
      const gi=V.er?Math.max(0,1-V.et/2.4):.25; ctx.save(); ctx.globalCompositeOperation='lighter'; const gr=ctx.createRadialGradient(LX,LY-4,4,LX,LY-4,110); gr.addColorStop(0,`rgba(255,110,30,${.35+gi*.5})`); gr.addColorStop(1,'rgba(255,60,20,0)'); ctx.fillStyle=gr; ctx.fillRect(0,0,W,H); ctx.restore();
      for(const p of V.parts){ R(p.x,p.y,2,2,p.life<.6?'#fff2a0':p.life<1.2?'#ffd23f':p.life<1.8?'#ff7a1a':'#b8361f'); }
      if(!BG){ ctx.fillStyle='#0e0b12'; ctx.beginPath(); ctx.moveTo(0,H); for(let x=0;x<=W;x+=8) ctx.lineTo(x,128+Math.sin(x*.05)*6+(hash(x,4)%4)); ctx.lineTo(W,H); ctx.fill(); }
      drawChar(34,126,'up',0,lookOf('me'),true); drawChar(54,128,'up',0,LOOK.guide,true);
      ctx.restore();
      if(V.cap!=null){ const c=document.createElement('canvas'); c.width=W; c.height=H; c.getContext('2d').drawImage(cvs,0,0,W,H); V.photos.push({s:V.cap,c}); V.cap=null; V.flash=1; }
      for(const [x,y,sx,sy] of [[14,12,1,1],[226,12,-1,1],[14,148,1,-1],[226,148,-1,-1]]){ ctx.fillStyle='#fff'; ctx.fillRect(sx>0?x:x-9,y,10,1); ctx.fillRect(x,sy>0?y:y-9,1,10); }
      R(W/2-6,H/2,12,1,'rgba(255,255,255,.4)'); R(W/2,H/2-6,1,12,'rgba(255,255,255,.4)');
      ptextS(ctx,'SHOTS '+V.shots,18,18,'#ffffff'); if((tm*2)%1<.6) R(212,17,5,5,'#ff3b30'); ptextS(ctx,'REC',196,18,'#ffffff');
      if(V.flash>0) R(0,0,W,H,`rgba(255,255,255,${Math.min(1,V.flash)})`);
    } }; }
/* dances: kastom (Tanna) and rom (Ambrym) */
function DanceScene(res,v='kastom'){ let tt=0, beat=0, done=false; const rom=v==='rom';
  return { always:true, anim(dt){ tt+=dt; if(tt>beat){ beat+=.5; sfx.drum(); } if(tt>6&&!done){ done=true; res(); } }, input(){ if(tt>2.5&&!done&&consume('a')){ done=true; res(); } },
    draw(tm){ if(imgOk('bg_dance')){ ctx.drawImage(IMG.bg_dance,0,0,W,H); if(rom){ ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#8f8a9a'; ctx.fillRect(0,0,W,H); ctx.restore(); } } else {
      R(0,0,W,H,rom?'#2f5a2a':'#5aa83f'); for(let i=0;i<140;i++){ const q=hash(i,9); R(q%W,(q>>8)%H,1,2,rom?'#264a22':'#4b9235'); }
      R(16,52,208,104,C.out); R(18,54,204,100,rom?'#4e4a55':'#c09358'); for(let i=0;i<90;i++){ const q=hash(i,5); R(20+q%200,56+(q>>8)%96,2,1,rom?'#3e3a44':'#a37744'); }
      if(rom){ for(const x of [30,200]){ drawTamtam(x-12,40,48,20); } } else { drawBanyan(36,30,48,22,tm); drawBanyan(164,26,48,22,tm+1); } }
      const n=7, list=[];
      for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+tt*.5; const x=120+Math.cos(a)*66-8, y=104+Math.sin(a)*30-8; const stomp=Math.floor(tt*4+i)%2; list.push({y,d:()=>{ drawChar(x,y-stomp*2,Math.sin(a)>0?'down':'up',stomp?1:3,rom?LOOK.rom:LOOK.dancer); if(stomp) for(let k=0;k<3;k++) R(x+2+k*5,y+16+((tt*20+k)%3),2,1,'rgba(230,200,150,.8)'); }}); }
      list.push({y:104,d:()=>drawChar(112,96,'down',0,rom?LOOK.rom:LOOK.chief)});
      list.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
      drawChar(24,136,'up',0,lookOf('me'));
    } }; }
/* Blue Hole rope swing */
function SwingScene(res){ const BG=imgOk('bg_bluehole'); const pv=BG?{x:104,y:13}:{x:60,y:8}, Lr=BG?56:62, thMax=.95, om=2.5; let t=0, st='swing', th=0, pos={x:0,y:0}, v={x:0,y:0}, score=0, endT=0, spl=[];
  return { always:true,
    anim(dt){ t+=dt; if(st==='swing'){ th=thMax*Math.sin(om*t); pos.x=pv.x+Math.sin(th)*Lr; pos.y=pv.y+Math.cos(th)*Lr; }
      else if(st==='fly'){ v.y+=230*dt; pos.x+=v.x*dt; pos.y+=v.y*dt; if(pos.y>=(BG?121:118)){ st='splash'; sfx.splash(); score=pos.x>195?3:pos.x>150?2:1; for(let i=0;i<26;i++) spl.push({x:pos.x,y:BG?121:118,vx:(rnd()-.5)*90,vy:-60-rnd()*90}); endT=t; } }
      for(const s of spl){ s.vy+=220*dt; s.x+=s.vx*dt; s.y+=s.vy*dt; }
      if(st==='splash'&&t-endT>1.8&&!this.d){ this.d=1; res(score); } },
    input(){ if(st==='swing'&&consume('a')){ const dth=thMax*om*Math.cos(om*t); v.x=Lr*dth*Math.cos(th); v.y=-Lr*dth*Math.sin(th); st='fly'; sfx.sel(); } },
    draw(tm){ if(BG){ ctx.drawImage(IMG.bg_bluehole,0,0,W,H); for(let y=122;y<160;y+=5) for(let x=0;x<W;x+=12){ if(hash(x,y+Math.floor(tm*3))%5===0) R(x+(y%12),y,4,1,'#9fe0ff'); } } else {
      ctx.drawImage(gradCanvas('jungle',[[0,'#bfe8a0'],[.5,'#6fb85a'],[.74,'#3d8a45'],[.75,'#1a66e3'],[1,'#0e46c4']]),0,0,W,H);
      for(let i=0;i<10;i++){ blob(ctx,(i*31)%W,6+(i%3)*8,14,'#2f7a33'); blob(ctx,(i*31+12)%W,10+(i%2)*6,9,'#3f9a40'); }
      R(0,70,46,90,C.out); R(0,72,44,88,'#6b5a44'); for(let y=74;y<160;y+=6) R(2,y,40,1,'#5a4a38');
      R(226,60,14,100,C.out); R(228,62,12,98,'#5a4a38');
      for(let y=120;y<160;y+=4) for(let x=0;x<W;x+=8){ if(hash(x,y+Math.floor(tm*4))%4===0) R(x+(y%8),y,4,1,'#45b2f7'); }
      for(let i=0;i<5;i++){ ctx.fillStyle='rgba(255,255,255,.06)'; const x=60+i*40; ctx.fillRect(x,120,8,40); }
      R(40,4,60,6,C.out); R(42,5,56,4,'#6b4a2a'); }
      if(st==='swing') pline(ctx,pv.x,pv.y,pos.x,pos.y,'#c8a24a'); else pline(ctx,pv.x,pv.y,pv.x+Math.sin(tm*3)*8,pv.y+Lr,'#c8a24a');
      if(st!=='splash') drawChar(pos.x-8,pos.y-12,'right',st==='fly'?1:0,lookOf('me'));
      for(const s of spl) if(s.y<160) R(s.x,s.y,2,2,'#e8faff');
      if(st==='swing') ptextS(ctx,'PRESS A TO JUMP!',W/2-ptw('PRESS A TO JUMP!')/2,146,'#ffffff');
      if(st==='splash'){ const s='*'.repeat(score); ptextS(ctx,'SPLASH! '+s,W/2-ptw('SPLASH! '+s,2)/2,40,'#ffd84d',2); }
    } }; }
/* Nagol: tie knots then watch the dive */
function KnotScene(res){ let t=0, cur=0, dir=1, zone=40+rnd()*90, zw=30, ok=0, tries=0, fb=0, fbt=null, done=false; const bx=40, bw=160;
  return { always:true,
    anim(dt){ t+=dt; cur+=dir*dt*(110+ok*35); if(cur>bw){ cur=bw; dir=-1; } if(cur<0){ cur=0; dir=1; } if(fb>0) fb-=dt; if((ok>=3||tries>=6)&&!done){ done=true; setTimeout(()=>res(ok),900); } },
    input(){ if(done) return; if(consume('a')){ tries++; if(cur>=zone&&cur<=zone+zw){ ok++; sfx.sel(); fbt='TIGHT!'; zone=10+rnd()*(bw-zw-20); zw=Math.max(18,zw-4); } else { sfx.bump(); fbt='LOOSE...'; } fb=.8; } },
    draw(tm){ R(0,0,W,H,'#7ab86a'); for(let i=0;i<80;i++){ const q=hash(i,12); R(q%W,(q>>8)%H,2,1,'#6aa85a'); }
      for(let x=0;x<W;x+=22){ R(x,0,10,H,C.out); R(x+1,0,8,H,'#9a6a3c'); R(x+1,0,2,H,'#b88252'); }
      R(0,40,W,6,C.out); R(0,41,W,4,'#3f9a3a'); for(let x=0;x<W;x+=6) R(x+Math.sin(tm+x)*1,46,2,8,'#2f7a33');
      R(bx-2,90,bw+4,14,C.out); R(bx,92,bw,10,'#e9d7a8'); R(bx+zone,92,zw,10,'#5cc25b'); R(bx+zone,92,zw,2,'#9be08a');
      R(bx+cur-2,86,4,22,C.out); R(bx+cur-1,87,2,20,'#ffffff');
      for(let i=0;i<3;i++){ R(80+i*30,118,20,14,C.out); R(81+i*30,119,18,12,i<ok?'#3f9a3a':'#cfc3a0'); ptext(ctx,i<ok?'*':'-',89+i*30,122,i<ok?'#ffffff':'#7b715d'); }
      ptextS(ctx,'TIE 3 KNOTS - PRESS A IN GREEN',W/2-ptw('TIE 3 KNOTS - PRESS A IN GREEN')/2,66,'#ffffff');
      if(fb>0&&fbt) ptextS(ctx,fbt,W/2-ptw(fbt,2)/2,140,fbt==='TIGHT!'?'#ffd84d':'#ffb3a8',2);
    } }; }
function NagolScene(res){ let t=0, done=false, cheered=false; const BG=imgOk('bg_nagol'); const tx=150, top=BG?14:22, ground=BG?128:140;
  return { always:true,
    anim(dt){ t+=dt; if(t>2.6&&!cheered&&t>2.9){ cheered=true; sfx.cheer(); } if(Math.floor(t*2)!==Math.floor((t-dt)*2)&&t<2.4) sfx.drum(); if(t>6&&!done){ done=true; res(); } },
    input(){},
    draw(tm){ if(BG) ctx.drawImage(IMG.bg_nagol,0,0,W,H); else { ctx.drawImage(gradCanvas('pday',[[0,'#7fc8f0'],[.6,'#bfe8f6'],[.61,'#7ab86a'],[1,'#5a9a4a']]),0,0,W,H);
      ctx.fillStyle='#8c6a44'; ctx.beginPath(); ctx.moveTo(60,H); ctx.lineTo(240,110); ctx.lineTo(240,H); ctx.fill(); ctx.fillStyle='#a07a50'; for(let i=0;i<40;i++){ const q=hash(i,4); ctx.fillRect(80+q%160,125+(q>>8)%30,2,1); } }
      for(let yy=top;yy<ground;yy++){ const p=(yy-top)/(ground-top), hw=Math.round(5+p*14); if(yy%7===0) R(tx-hw,yy,hw*2,2,C.out); R(tx-hw,yy,2,1,C.wood); R(tx+hw-2,yy,2,1,C.wood); }
      R(tx-26,top+4,20,3,C.out); R(tx-26,top+4,20,2,'#b88252');
      const plat={x:tx-24,y:top+4};
      let dx=plat.x, dy=plat.y-14, ang=0;
      if(t>1.6){ const q=Math.min(1,(t-1.6)/.85); dx=plat.x-q*26; dy=plat.y-14+q*q*(ground-plat.y-6); ang=q; }
      if(t>2.45){ const b=Math.sin((t-2.45)*6)*Math.exp(-(t-2.45)*2)*8; dy=ground-22-b; }
      pline(ctx,plat.x+4,plat.y,dx+8,dy+(t>1.6?2:16),'#3f9a3a',1);
      if(t<1.6){ drawChar(dx,dy,'left',Math.floor(t*4)%2?1:0,LOOK.moses); R(dx+2,dy-6,2,4,LOOK.moses.skin); R(dx+12,dy-6,2,4,LOOK.moses.skin); }
      else { const X=Math.round(dx), Y=Math.round(dy); R(X+4,Y,8,4,C.out); R(X+5,Y+1,6,2,'#c8a24a'); R(X+5,Y+4,6,8,C.out); R(X+6,Y+5,4,6,LOOK.moses.skin); R(X+4,Y+12,8,8,C.out); R(X+5,Y+13,6,6,LOOK.moses.skin); R(X+6,Y+14,4,2,'#16110f'); }
      if(t>2.45&&t<3.6) for(let i=0;i<10;i++){ const a=i/10*Math.PI; R(dx+8+Math.cos(a)*(t-2.45)*30,ground-4-Math.sin(a)*(t-2.45)*14,2,2,'rgba(200,170,120,.8)'); }
      for(let i=0;i<6;i++) drawChar(20+i*16,124+(i%2)*4,'right',(t>2.9&&Math.floor(t*6+i)%2)?1:0,[LOOK.woman,LOOK.kid,LOOK.bule,LOOK.farmer,lookOf('me'),LOOK.woman2][i]);
      if(t>2.9) ptextS(ctx,'NAGOL!',W/2-ptw('NAGOL!',3)/2-30,20,'#ffd84d',3);
    } }; }
/* Ambrym tamtam rhythm */
function DrumScene(res){ const beats=[0,.5,1,1.5,2.25,2.5,3,3.5,4,4.5,4.75,5,5.5,6,6.5,7]; const notes=beats.map(b=>({t:b+2,st:0})); let t=0, hits=0, perf=0, fb=0, fbt='', done=false; const hitX=48, spd=100;
  return { always:true,
    anim(dt){ t+=dt; for(const n of notes) if(n.st===0&&t>n.t+.2){ n.st=-1; fb=.5; fbt='MISS'; } if(fb>0) fb-=dt; if(t>notes[notes.length-1].t+1.5&&!done){ done=true; res(hits/notes.length); } },
    input(){ if(consume('a')){ let best=null,bd=9; for(const n of notes){ if(n.st!==0) continue; const d=Math.abs(n.t-t); if(d<bd){ bd=d; best=n; } } if(best&&bd<.18){ best.st=1; hits++; if(bd<.08){ perf++; fbt='PERFECT'; } else fbt='GOOD'; fb=.5; sfx.hit(); } else { sfx.bump(); } } },
    draw(tm){ if(imgOk('bg_drums')){ ctx.drawImage(IMG.bg_drums,0,0,W,H); R(0,98,W,18,'rgba(0,0,0,.35)'); } else {
      ctx.drawImage(gradCanvas('adusk',[[0,'#3a2a5a'],[.5,'#c86a4a'],[.62,'#5a4a3a'],[1,'#2e2a24']]),0,0,W,H);
      for(let i=0;i<6;i++){ const x=10+i*40; R(x-1,52-((i%2)*10),20,74+((i%2)*10),C.out); R(x,53-((i%2)*10),18,72+((i%2)*10),'#7a4e2c'); R(x,53-((i%2)*10),3,72,'#94643a'); R(x+3,60-((i%2)*10),12,4,C.out); R(x+4,61-((i%2)*10),2,2,'#ffffff'); R(x+12,61-((i%2)*10),2,2,'#ffffff'); R(x+8,70-((i%2)*10),2,40,C.out); }
      R(0,126,W,34,'#3a2f28'); R(0,96,W,20,'rgba(0,0,0,.45)'); }
      blob(ctx,hitX,106,10,C.out); blob(ctx,hitX,106,8,(fb>0&&fbt!=='MISS')?'#ffd84d':'#e9d7a8'); blob(ctx,hitX,106,5,'#7a4e2c');
      for(const n of notes){ if(n.st!==0) continue; const x=hitX+(n.t-t)*spd; if(x>W+10||x<-10) continue; blob(ctx,x,106,6,C.out); blob(ctx,x,106,5,'#d9453a'); R(x-2,104,4,1,'#ff8a7a'); }
      ptextS(ctx,'HITS '+hits+'/'+notes.length,8,8,'#ffffff'); ptextS(ctx,'PRESS A ON THE BEAT',W/2-ptw('PRESS A ON THE BEAT')/2,140,'#ffffff');
      if(fb>0) ptextS(ctx,fbt,hitX-ptw(fbt,2)/2+30,82,fbt==='MISS'?'#ffb3a8':'#ffd84d',2);
      drawChar(hitX-8+(fb>0&&fbt!=='MISS'?2:0),110,'right',0,lookOf('me'));
    } }; }
/* Malekula canoe */
function CanoeScene(res){ let x=0, v=0, last=null, t=0, done=false; const goal=900;
  return { always:true,
    anim(dt){ t+=dt; v-=v*dt*1.1; x+=v*dt; if(x>=goal&&!done){ done=true; sfx.stamp(); setTimeout(()=>res(t),2200); } },
    input(){ if(done) return; const l=consume('left')||consume('b'), r=consume('right')||consume('a'); if(l){ v+=last!=='l'?24:5; last='l'; sfx.blip(); } if(r){ v+=last!=='r'?24:5; last='r'; sfx.blip(); } v=Math.min(v,160); },
    draw(tm){ if(imgOk('bg_mangrove')){ const o=Math.round(x*.25)%W; ctx.drawImage(IMG.bg_mangrove,-o,0,W,H); ctx.drawImage(IMG.bg_mangrove,W-o,0,W,H); } else {
      ctx.drawImage(gradCanvas('mday',[[0,'#8fd8f8'],[.45,'#cdeff8'],[.46,'#3fb0d6'],[1,'#1f7fb0']]),0,0,W,H);
      for(let i=0;i<4;i++){ const ix=((i*90-x*.08)%360+360)%360-60; blob(ctx,ix,74,22,'#5f9a6a'); }
      for(let i=0;i<8;i++){ const mx=((i*60-x*.45)%480+480)%480-60; blob(ctx,mx,60,14,'#1f4a22'); blob(ctx,mx+8,56,10,'#2f6a2f'); for(let k=0;k<5;k++) R(mx-8+k*4,66,1,10,'#6b4a2a'); } }
      for(let y=90;y<160;y+=9) for(let i=0;i<5;i++){ const wx=((i*53+y*7-x*(.6+y/200))%300+300)%300-30; R(wx,y,6,1,imgOk('bg_mangrove')?'rgba(255,255,255,.4)':'#7fd3f0'); }
      if(x>goal-300){ for(let i=0;i<3;i++){ const tx2=goal-x+120+i*30, ty=118+Math.sin(tm*2+i)*4; if(tx2<W+20){ blob(ctx,tx2,ty,6,C.out); blob(ctx,tx2,ty,5,'#4a8a4a'); R(tx2+5,ty-1,4,3,'#6aa86a'); R(tx2-7,ty+2,4,2,'#6aa86a'); } } }
      const cxp=80, cyp=104+Math.sin(tm*2)*1.5;
      R(cxp-30,cyp,64,8,C.out); R(cxp-28,cyp+1,60,4,C.trunk); R(cxp-28,cyp+5,60,1,C.trunk2); R(cxp-20,cyp-10,1,10,C.out); R(cxp+12,cyp-10,1,10,C.out); R(cxp-24,cyp-12,44,3,C.out); R(cxp-24,cyp-11,44,1,C.wood);
      drawChar(cxp-24,cyp-18,'right',0,LOOK.leiwia); drawChar(cxp+2,cyp-18,'right',0,lookOf('me'));
      const ps=last==='l'?-1:1; pline(ctx,cxp+12,cyp-6,cxp+12+ps*8,cyp+14,'#5a3a1e'); R(cxp+10+ps*8,cyp+12,5,4,'#5a3a1e');
      R(cxp-34,cyp+9,72,1,C.foam);
      R(10,8,220,6,C.out); R(11,9,218,4,'#e9d7a8'); R(11,9,Math.min(218,218*x/goal),4,'#3f9a3a'); ptextS(ctx,'TURTLE BAY',196-ptw('TURTLE BAY')+30,17,'#ffffff');
      if(!done){ ptextS(ctx,'LEFT + RIGHT  OR  B + A',W/2-ptw('LEFT + RIGHT  OR  B + A')/2,146,'#ffffff'); }
      else ptextS(ctx,'TURTLES!',W/2-ptw('TURTLES!',2)/2,40,'#ffd84d',2);
    } }; }
/* Ambrym twin volcano view */
function VolcViewScene(res){ let t=0, done=false;
  return { always:true, anim(dt){ t+=dt; if(t>5&&!done){ done=true; res(); } }, input(){ if(t>2&&consume('a')&&!done){ done=true; res(); } },
    draw(tm){ if(imgOk('bg_volcview')){ ctx.drawImage(IMG.bg_volcview,0,0,W,H); for(let i=0;i<5;i++){ const ph=(tm*.1+i/5)%1; blob(ctx,165+ph*16+Math.sin(ph*5)*3,48-ph*40,Math.round(3+ph*7),`rgba(235,235,240,${(1-ph)*.35})`); } drawChar(90,132,'up',0,lookOf('me')); drawChar(110,134,'up',0,LOOK.guide); return; }
      ctx.drawImage(gradCanvas('aday',[[0,'#8a9ab8'],[.55,'#d8c8b0'],[.56,'#4b4752'],[1,'#2e2a34']]),0,0,W,H);
      cone(70,48,96,14,52,tm,false,'#5d5866'); cone(170,38,96,16,58,tm+2,false);
      ctx.save(); ctx.globalCompositeOperation='lighter'; for(const [x,y] of [[70,48],[170,38]]){ const gr=ctx.createRadialGradient(x,y,1,x,y,26); gr.addColorStop(0,'rgba(255,120,40,.5)'); gr.addColorStop(1,'rgba(255,80,20,0)'); ctx.fillStyle=gr; ctx.fillRect(x-30,y-30,60,60); } ctx.restore();
      for(let i=0;i<120;i++){ const q=hash(i,6); R(q%W,96+(q>>8)%64,2,1,'#3a3741'); }
      drawChar(90,132,'up',0,lookOf('me')); drawChar(110,134,'up',0,LOOK.guide);
    } }; }
/* finale sand drawing */
function SandScene(){ let p=0, res, resA, p2=0, phase='auto'; const done=new Promise(r=>res=r), autoDone=new Promise(r=>resA=r); const ids=PIECES.filter(x=>G.pieces[x.id]).map(x=>x.id); const final=ids.length===PIECES.length;
  const bg=document.createElement('canvas'); bg.width=W; bg.height=H; const bgg=bg.getContext('2d'); bgg.fillStyle='#e7cd92'; bgg.fillRect(0,0,W,H); for(let i=0;i<1400;i++){ const q=hash(i,77); bgg.fillStyle=q%3?'#d9bc7c':'#f3dfae'; bgg.fillRect(q%W,(q>>8)%H,1,1); }
  const sc={ done, autoDone, always:true, final, anim(dt){ if(phase==='auto'){ p=Math.min(1,p+dt/4.5); if(p>=1){ phase=final?'wait':'end'; if(resA){ resA(); resA=null; } if(!final&&res){ res(); res=null; } } }
      if(phase==='hold'){ if(keys.a) p2=Math.min(1,p2+dt/3); if(p2>=1){ phase='end'; G.pieces.home=1; sfx.stamp(); setTimeout(()=>{ if(res){ res(); res=null; } },900); } } },
    startHold(){ phase='hold'; },
    draw(tm){ ctx.drawImage(bg,0,0); const head=drawSand(ctx,50,6,140,140,ids,p,{ghost:true});
      if(phase==='hold'||phase==='end'&&final){ const h2=drawSand(ctx,50,6,140,140,['home'],p2,{}); if(h2&&p2<1){ R(h2[0]-2,h2[1]-6,4,6,C.out); R(h2[0]-1,h2[1]-5,2,5,lookOf('me').skin); } if(phase==='hold'&&p2<1) ptextS(ctx,'HOLD A',W/2-ptw('HOLD A',2)/2,148,'#7a3a1a',2,'#f3dfae'); }
      if(head&&p<1){ R(head[0]-2,head[1]-6,4,6,C.out); R(head[0]-1,head[1]-5,2,5,'#6a3f25'); }
      if(phase==='end'){ const s='THE TRAVELLER S PATH'; ptext(ctx,s,W/2-ptw(s)/2,150,'#7a5a2a'); }
      if(G.flags.goldLine){ ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<120;i++){ const a=i/120*Math.PI*2+tm*.2, r=72+Math.sin(a*6)*5; const x=120+Math.cos(a)*r, y=76+Math.sin(a)*r; ctx.fillStyle=`rgba(255,215,90,${.5+.4*Math.sin(tm*3+i*.3)})`; ctx.fillRect(snap(x),snap(y),1,1); } ctx.restore(); }
    } };
  return sc; }
