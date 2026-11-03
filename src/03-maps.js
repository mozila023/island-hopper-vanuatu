/* ---------------- map building ---------------- */
const SOLID=new Set(['~','v','w','#','T','r','W','o','B','M','y']);
const isWaterCh=c=>c==='~'||c==='w'||c==='v';
function grid(w,h,c){ return Array.from({length:h},()=>Array(w).fill(c)); }
function rect(tl,x,y,w,h,c){ for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) if(tl[j]&&tl[j][i]!==undefined) tl[j][i]=c; }
function setT(tl,x,y,c){ if(tl[y]&&tl[y][x]!==undefined) tl[y][x]=c; }
function ellipse(tl,cx,cy,rx,ry,c,wob=0,seed=0,landOnly=false){ for(let y=0;y<tl.length;y++) for(let x=0;x<tl[0].length;x++){ const nx=(x-cx)/rx, ny=(y-cy)/ry; let d=nx*nx+ny*ny; if(wob) d+=wob*(Math.sin(x*1.3+seed)*.6+Math.cos(y*1.7+seed*2)*.6+((hash(x+seed,y)%100)/100-.5)*.5); if(d<1){ if(landOnly&&(isWaterCh(tl[y][x])||tl[y][x]==='M')) continue; tl[y][x]=c; } } }
function shore(tl){ const h=tl.length,w=tl[0].length, out=tl.map(r=>r.slice()); const land=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&tl[y][x]!=='~';
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(tl[y][x]!=='~'){ let d=9; for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) if(!land(x+dx,y+dy)) d=Math.min(d,Math.max(Math.abs(dx),Math.abs(dy))); if(d===1||(d===2&&hash(x,y)%3!==0)) out[y][x]=','; }
    else { let d=9; for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++) if(land(x+dx,y+dy)) d=Math.min(d,Math.max(Math.abs(dx),Math.abs(dy))); out[y][x]=d===1?'w':d===2?(hash(x,y)%2?'w':'v'):d<=4?'v':'~'; }
  }
  for(let y=0;y<h;y++) tl[y]=out[y];
}
function scatter(tl,seed,o={}){ const palm=o.palm??12, tree=o.tree??5; for(let y=0;y<tl.length;y++) for(let x=0;x<tl[0].length;x++){ const c=tl[y][x], r=hash(x*3+seed,y*7+seed)%100; if(c===','&&r<palm) tl[y][x]='#'; else if(c==='.'){ if(r<5) tl[y][x]='f'; else if(r<5+tree) tl[y][x]='T'; else if(r<5+tree+7) tl[y][x]=':'; } } }
function npc(id,x,y,look,talk,o={}){ return {id,x,y,hx:x,hy:y,fx:x,fy:y,prog:1,dir:o.dir||'down',look,talk,wander:!!o.wander}; }
function mk(id,w,h,tl,pal){ return {id,w,h,t:tl,name:ISLANDS[id].name,pal:pal||{},builds:[],inter:[],spawn:{},lights:[],defs:[]}; }
function walkable(tl,x,y,c='='){ const v=tl[y]&&tl[y][x]; if(v===undefined) return; if(v!=='c'&&v!=='='&&v!=='d'&&v!=='p') tl[y][x]=c; }
function airport(m,x,y,label){ const tl=m.t; rect(tl,x-1,y-1,7,5,'.'); rect(tl,x-1,y-1,7,1,'R');
  m.builds.push({type:'airport',x,y,w:5,h:3,door:{x:x+2,y:y+2},label}); m.builds.push({type:'plane',x:x,y:y-2,w:2,h:1,solid:false,flat:true});
  walkable(tl,x+2,y+3); for(const dx of [1,2,3]) m.inter.push({x:x+dx,y:y+2,fn:()=>travel('plane')}); m.spawn.airport={x:x+2,y:y+3,dir:'down'}; m.lights.push({x:x+2.5,y:y+2.2,r:26}); }
function wharfDown(m,col,from){ const tl=m.t; let ws=from; for(let y=from;y<m.h;y++){ if(isWaterCh(tl[y][col])){ ws=y; break; } }
  for(let y=from;y<ws;y++) walkable(tl,col,y); for(let y=ws;y<ws+3&&y<m.h;y++) tl[y][col]='p';
  m.spawn.pier={x:col,y:ws,dir:'up'}; m.defs.push(()=>npc('boat',col,ws+2,LOOK.boat,()=>travel('boat'),{dir:'up'})); m.builds.push({type:'boat',x:col+1,y:ws+2,w:2,h:1,solid:false,flat:true}); }
function wharfRight(m,row,from){ const tl=m.t; let ws=from; for(let x=from;x<m.w;x++){ if(isWaterCh(tl[row][x])){ ws=x; break; } }
  for(let x=from;x<ws;x++) walkable(tl,x,row); for(let x=ws;x<ws+3&&x<m.w;x++) tl[row][x]='p';
  m.spawn.pier={x:ws,y:row,dir:'left'}; m.defs.push(()=>npc('boat',ws+2,row,LOOK.boat,()=>travel('boat'),{dir:'left'})); m.builds.push({type:'boat',x:ws+3,y:row,w:2,h:1,solid:false,flat:true}); }
function lodge(m,x,y,style,cost,title){ rect(m.t,x,y,4,3,'.'); m.builds.push({type:'hut',x,y,w:4,h:3,door:{x:x+1,y:y+2},style,light:true}); walkable(m.t,x+1,y+3);
  const fn=()=>lodging(cost,'host',title); m.inter.push({x:x+1,y:y+2,fn},{x:x+2,y:y+2,fn}); m.lights.push({x:x+1.5,y:y+2.2,r:28}); }
function signAt(m,x,y,label,fn){ m.builds.push({type:'sign',x,y,w:1,h:1,label}); if(fn) m.inter.push({x,y,fn}); }

const PAL_BASE={grass:['#88d35c','#74c34c','#63b041','#4f9836'],sand:['#fbe9b4','#f1d68e','#e2c179','#caa660'],path:['#ddb97a','#c9a265','#ac8450'],
  deep:['#2a66bc','#2459a8','#3577cc'],mid:['#3a8ed6','#3382cb','#4c9cdf'],shal:['#6fd0e8','#58c0e0','#9be6f3'],ash:['#57525f','#47434e','#3a3741'],
  road:['#a9afb7','#999fa8','#8a9099'],dirt:['#cc9d60','#b6874d','#a07443'],bh:['#0e46c4','#1a66e3','#45b2f7'],soil:['#8a5a36','#74492b','#5f3a22'],pool:['#4bd6cc','#38c3bb','#8bede5']};
const PAL_AMBRYM={grass:['#78c24f','#5aa53d','#468a32','#356f27'],sand:['#77727c','#625d68','#4e4a55','#3b3842']};
const PAL_SANTO={sand:['#ffffff','#fbf3dc','#efe0b9','#d8c499'],shal:['#7fe8ee','#5fd9e6','#b5f5f7']};
const PAL_PENTE={grass:['#86d65a','#62bb45','#4ca039','#3a8530']};

function buildEfate(){
  const w=42,h=27,tl=grid(w,h,'~');
  ellipse(tl,20.5,13,17.5,11.5,'.',.1,1); ellipse(tl,40,13.5,5,3.4,'~');
  shore(tl); scatter(tl,11);
  ellipse(tl,13,6,6,3.4,'T',.25,3,true);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(tl[y][x]==='T'&&hash(x,y)%4===0) tl[y][x]=':';
  rect(tl,11,3,6,5,'.'); rect(tl,12,4,4,2,'r'); rect(tl,13,4,2,2,'W'); rect(tl,12,6,4,2,'o');
  rect(tl,19,3,14,3,'.'); rect(tl,22,5,9,4,'.');
  let ps=34; for(let x=30;x<w;x++){ if(isWaterCh(tl[12][x])){ ps=x; break; } }
  rect(tl,26,8,1,4,'c'); rect(tl,9,12,ps-9,1,'c');
  rect(tl,16,7,1,5,'='); rect(tl,9,13,1,6,'='); rect(tl,9,18,7,1,'='); rect(tl,20,13,1,6,'='); rect(tl,20,18,3,1,'='); setT(tl,23,18,'.');
  rect(tl,16,8,8,1,'.'); rect(tl,17,9,6,3,'.'); rect(tl,10,15,4,3,'.'); rect(tl,21,15,3,3,'.'); rect(tl,12,19,4,2,','); rect(tl,ps-4,10,2,2,'.');
  let ls=4; for(let x=0;x<w;x++){ if(!isWaterCh(tl[14][x])){ ls=x; break; } }
  rect(tl,ls,14,9-ls,1,'='); for(let x=ls-4;x<ls;x++) tl[14][x]='p'; tl[13][ls-4]='~';
  for(let x=ps;x<ps+4;x++) tl[12][x]='p';
  setT(tl,ls+2,15,','); rect(tl,24,9,2,1,'.'); setT(tl,21,13,'.');
  const m=mk('efate',w,h,tl);
  airportSpecial(m);
  m.builds.push({type:'market',x:17,y:9,w:6,h:3,label:'MAKET'},{type:'hut',x:10,y:15,w:4,h:3,door:{x:11,y:17},style:'tama',light:true},{type:'hut',x:21,y:15,w:3,h:3,door:{x:22,y:17},style:'nakamal',light:true},
    {type:'booth',x:ps-4,y:10,w:2,h:2,door:{x:ps-4,y:11},label:'BOAT'},{type:'sign',x:16,y:6,w:1,h:1,label:'MELE'},{type:'postsign',x:ls-4,y:13,w:1,h:1},{type:'sanddraw',x:13,y:19,w:2,h:1,flat:true},{type:'boat',x:ps+4,y:12,w:2,h:1,solid:false,flat:true});
  for(let x=17;x<=22;x++) m.inter.push({x,y:11,fn:market});
  m.inter.push({x:11,y:17,fn:doorLuna},{x:12,y:17,fn:doorLuna},{x:22,y:17,fn:nakamal},{x:ps-4,y:11,fn:()=>travel('boat')},{x:ps-3,y:11,fn:()=>travel('boat')},{x:16,y:6,fn:mele},{x:ls-4,y:13,fn:postOffice},{x:13,y:19,fn:lookDrawing},{x:14,y:19,fn:lookDrawing});
  for(let x=12;x<=15;x++) m.inter.push({x,y:7,fn:mele});
  m.spawn.pier={x:ps+1,y:12,dir:'left'}; m.spawn.home={x:11,y:18,dir:'down'};
  m.lights.push({x:22.5,y:17.2,r:34},{x:11.5,y:17.2,r:24});
  m.defs.push(()=>G.flags.met?npc('luna',12,19,LOOK.luna,talkLuna,{dir:'up'}):npc('luna',27,8,LOOK.luna,talkLuna,{dir:'left'}),
    ()=>npc('pita',15,19,LOOK.pita,talkPita,{dir:'left'}),()=>npc('driver',25,9,LOOK.driver,talkDriver,{dir:'right'}),()=>npc('kid',ls+2,15,LOOK.kid,talkKid,{dir:'up'}),
    ()=>npc('vendor',21,13,LOOK.vendor,talkVendor,{dir:'up'}),()=>npc('elder',23,18,LOOK.elder,talkElder,{dir:'left'}),()=>npc('boat',ps+3,12,LOOK.boat,()=>travel('boat'),{dir:'left'}));
  return m;
}
function airportSpecial(m){ const tl=m.t; rect(tl,20,4,12,1,'R'); m.builds.push({type:'airport',x:23,y:5,w:7,h:3,door:{x:26,y:7},label:'BAUERFIELD'},{type:'plane',x:21,y:3,w:2,h:1,solid:false,flat:true});
  for(const x of [25,26,27]) m.inter.push({x,y:7,fn:()=>travel('plane')}); m.spawn.airport={x:26,y:8,dir:'down'}; m.lights.push({x:26.5,y:7.2,r:30}); }
function buildTanna(){
  const w=36,h=30,tl=grid(w,h,'~');
  ellipse(tl,18,13,16,11.5,'.',.1,7); shore(tl); scatter(tl,23,{tree:9});
  ellipse(tl,22,7,8.5,4.6,'a',.2,5,true);
  const m=mk('tanna',w,h,tl);
  airport(m,5,13,'WHITEGRASS');
  rect(tl,7,16,22,1,'='); rect(tl,8,8,13,5,'.'); rect(tl,10,13,4,3,'d');
  rect(tl,15,13,1,3,'='); rect(tl,14,11,3,2,'.'); setT(tl,10,12,'='); rect(tl,17,11,1,5,'=');
  rect(tl,22,10,2,1,'a'); rect(tl,22,11,1,5,'='); rect(tl,24,12,1,1,'.');
  setT(tl,29,17,'.'); setT(tl,9,17,'.'); setT(tl,13,17,'.'); setT(tl,19,14,'.');
  m.builds.push({type:'volcano',x:19,y:4,w:7,h:5},{type:'banyan',x:14,y:11,w:3,h:2},{type:'sign',x:23,y:10,w:1,h:1,label:'YASUR'});
  lodge(m,25,13,'bungalow',5000,t('บังกะโลริมทะเล','Beach bungalow'));
  m.inter.push({x:23,y:10,fn:talkGuide},{x:14,y:12,fn:talkOld},{x:16,y:12,fn:talkOld});
  wharfDown(m,17,17);
  m.volcano={x:22.5,y:4.2};
  m.defs.push(()=>npc('driver2',9,17,LOOK.driver,talkDriver2,{dir:'up'}),()=>npc('guide',22,10,LOOK.guide,talkGuide,{dir:'down'}),()=>npc('chief',12,12,LOOK.chief,talkChief,{dir:'down'}),
    ()=>npc('old',15,13,LOOK.old,talkOld,{dir:'down'}),()=>npc('kid2',29,17,LOOK.kid,talkKid2,{dir:'left'}),()=>npc('woman',13,17,LOOK.woman,talkWoman,{wander:true}),()=>npc('woman2',19,14,LOOK.woman2,talkWoman2,{wander:true}));
  return m;
}
function buildSanto(){
  const w=40,h=30,tl=grid(w,h,'~');
  ellipse(tl,20,13.5,18,12,'.',.1,41); shore(tl); scatter(tl,41,{palm:14,tree:7});
  ellipse(tl,13,7,7.5,4.6,'T',.25,4,true); for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(tl[y][x]==='T'&&hash(x,y)%3===0) tl[y][x]=':';
  ellipse(tl,13,7,5,3.2,'.',0,0,true); ellipse(tl,12.5,7.2,3.4,2.2,'B');
  const m=mk('santo',w,h,tl,PAL_SANTO); m.pool={cx:13,cy:7.7,rx:3.6,ry:2.5};
  airport(m,5,14,'PEKOA');
  rect(tl,7,17,27,1,'c');
  rect(tl,12,14,5,3,'.'); m.builds.push({type:'store',x:12,y:14,w:5,h:3,door:{x:14,y:16},label:'STOA'}); for(let x=12;x<=16;x++) m.inter.push({x,y:16,fn:santoStore});
  rect(tl,23,15,2,2,'.'); m.builds.push({type:'booth',x:23,y:15,w:2,h:2,door:{x:23,y:16},label:'DIVE',col:'#1f9e8f'}); m.inter.push({x:23,y:16,fn:coolidge},{x:24,y:16,fn:coolidge});
  lodge(m,27,14,'bungalow',6000,t('บังกะโลริมหาด','Seaside bungalow'));
  rect(tl,16,9,1,8,'='); setT(tl,15,9,'.');
  m.builds.push({type:'ropetree',x:15,y:5,w:1,h:1});
  signAt(m,17,8,'BLUE HOLE',blueHole); setT(tl,17,9,'.');
  let ex=36; for(let x=w-1;x>=30;x--){ if(!isWaterCh(tl[11][x])){ ex=x; break; } }
  rect(tl,ex-3,9,4,5,','); rect(tl,32,12,1,5,'='); rect(tl,32,11,ex-3-32+1,1,'=');
  signAt(m,ex-1,10,'CHAMPAGNE',champagne); m.champ={x:ex-2,y:12}; setT(tl,ex-2,12,',');
  setT(tl,31,18,'.'); signAt(m,31,18,'WW2',mdp);
  wharfDown(m,20,18);
  setT(tl,25,18,'.'); setT(tl,10,18,'.');
  m.defs.push(()=>npc('rose',16,8,LOOK.rose,blueHole,{dir:'down'}),()=>npc('jimmy',25,18,LOOK.jimmy,coolidge,{dir:'up'}),()=>npc('woman',10,18,LOOK.woman2,talkSantoMama,{wander:true}),
    ()=>(G.flags.lunaSanto&&!G.flags.lunaTalk)?npc('luna',m.champ.x,m.champ.y,LOOK.luna,lunaHeart,{dir:'right'}):null);
  return m;
}
function buildPentecost(){
  const w=32,h=36,tl=grid(w,h,'~');
  ellipse(tl,16,17,9.5,15.5,'.',.1,53); shore(tl); scatter(tl,53,{tree:10,palm:10});
  const m=mk('pentecost',w,h,tl,PAL_PENTE);
  rect(tl,14,5,9,8,'d');
  m.builds.push({type:'tower',x:18,y:7,w:3,h:3});
  rect(tl,16,5,1,26,'=');
  airport(m,9,20,'LONORORE'); rect(tl,11,23,6,1,'=');
  rect(tl,9,12,5,5,'y'); rect(tl,14,14,2,1,'='); setT(tl,14,13,'.');
  lodge(m,18,21,'guest',4000,t('เกสต์เฮาส์หมู่บ้าน','Village guesthouse')); rect(tl,16,24,4,1,'=');
  wharfRight(m,27,16);
  setT(tl,14,27,'.'); setT(tl,13,27,'.');
  for(let y=12;y<=16;y++) m.inter.push({x:13,y,fn:yamGarden});
  m.defs.push(()=>npc('bule',17,11,LOOK.bule,talkBule,{dir:'left'}),()=>npc('moses',21,11,LOOK.moses,talkMoses,{dir:'down'}),()=>npc('farmer',14,13,LOOK.farmer,yamGarden,{dir:'down'}),
    ()=>npc('kid2',14,27,LOOK.kidG,talkPikinini,{wander:true}));
  return m;
}
function buildAmbrym(){
  const w=36,h=30,tl=grid(w,h,'~');
  ellipse(tl,18,14,16,11.5,'.',.1,67); shore(tl); scatter(tl,67,{tree:8,palm:9});
  ellipse(tl,18,7.5,9.5,4.8,'a',.2,6,true);
  const m=mk('ambrym',w,h,tl,PAL_AMBRYM);
  m.builds.push({type:'volcano2',x:14,y:3,w:9,h:5});
  airport(m,4,16,'CRAIG COVE');
  rect(tl,6,20,25,1,'='); setT(tl,6,19,'=');
  rect(tl,8,11,6,4,'.'); m.builds.push({type:'tamtam',x:9,y:12,w:3,h:2}); rect(tl,12,15,1,5,'='); setT(tl,12,14,'.');
  rect(tl,23,10,6,5,'d'); rect(tl,25,15,1,5,'=');
  rect(tl,18,9,1,1,'a'); rect(tl,18,10,1,10,'=');
  lodge(m,27,16,'guest',3500,t('บ้านพักหมู่บ้าน','Village homestay'));
  wharfDown(m,18,21);
  setT(tl,14,22,'.');
  m.inter.push({x:9,y:13,fn:tamtam},{x:10,y:13,fn:tamtam},{x:11,y:13,fn:tamtam});
  m.defs.push(()=>npc('willie',12,14,LOOK.willie,tamtam,{dir:'down'}),()=>npc('romchief',25,10,LOOK.rom,romDance,{dir:'down'}),()=>npc('guide2',18,9,LOOK.guide,ambVolcano,{dir:'down'}),
    ()=>npc('woman',14,22,LOOK.woman,talkYumi,{wander:true}));
  m.volcano={x:18.5,y:3};
  return m;
}
function buildMalekula(){
  const w=38,h=30,tl=grid(w,h,'~');
  ellipse(tl,17,14,15,11.5,'.',.1,79); ellipse(tl,32,21,3.2,2.2,'.'); ellipse(tl,35,16.5,2.4,1.8,'.');
  shore(tl); scatter(tl,79,{tree:9,palm:12});
  for(let y=17;y<h;y++) for(let x=0;x<=11;x++) if(tl[y][x]==='w'&&hash(x,y)%3) tl[y][x]='M';
  const m=mk('malekula',w,h,tl);
  airport(m,5,12,'LAMAP');
  rect(tl,7,16,22,1,'='); setT(tl,7,15,'=');
  rect(tl,9,8,8,6,'.');
  rect(tl,14,13,1,3,'=');
  lodge(m,19,12,'bungalow',5000,t('บังกะโลริมอ่าว','Bayside bungalow')); setT(tl,20,15,'=');
  let ws=24; for(let y=17;y<h;y++){ if(isWaterCh(tl[y][26])){ ws=y; break; } }
  for(let y=17;y<ws;y++) walkable(tl,26,y); setT(tl,25,ws-1,'.'); setT(tl,27,ws-1,'.');
  signAt(m,27,ws-1,'CLAMS',clamGarden);
  m.builds.push({type:'canoe',x:26,y:ws,w:2,h:1,solid:false,flat:true}); m.inter.push({x:26,y:ws,fn:canoeTrip});
  wharfDown(m,15,17);
  setT(tl,22,18,'.');
  m.defs.push(()=>npc('schief',14,12,LOOK.old,talkSchief,{dir:'down'}),()=>npc('leiwia',25,ws-1,LOOK.leiwia,canoeTrip,{dir:'right'}),()=>npc('nini',22,18,LOOK.nini,talkNini,{wander:true}));
  return m;
}
function finishMap(m){
  m.solid=grid(m.w,m.h,0);
  for(const b of m.builds){ if(b.solid===false) continue; for(let j=b.y;j<b.y+b.h;j++) for(let i=b.x;i<b.x+b.w;i++) if(m.solid[j]&&m.solid[j][i]!==undefined) m.solid[j][i]=1; }
  m.trees=[]; for(let y=0;y<m.h;y++) for(let x=0;x<m.w;x++){ const c=m.t[y][x]; if(c==='#'||c==='T') m.trees.push({x,y,c,h:hash(x,y)}); }
  m.clearTrees=()=>{ const npcs=m.populate(); const busy=(x,y)=>m.inter.some(o=>o.x===x&&o.y===y)||npcs.some(n=>Math.abs(n.x-x)+Math.abs(n.y-y)<=1)||(m.spawn.airport&&m.spawn.airport.x===x&&m.spawn.airport.y===y);
    const nearB=(x,y)=>m.builds.some(b=>b.solid!==false&&!b.flat&&x>=b.x-1&&x<=b.x+b.w&&y>=b.y-2&&y<=b.y+b.h);
    const pathish=c=>c==='='||c==='c'||c==='R'||c==='p'||c==='d';
    m.trees=m.trees.filter(tr=>{ const {x,y}=tr; const below=m.t[y+1]&&m.t[y+1][x];
      const side=[[1,0],[-1,0],[1,1],[-1,1]].some(([dx,dy])=>pathish(m.t[y+dy]&&m.t[y+dy][x+dx])||busy(x+dx,y+dy));
      const bad=nearB(x,y)||nearB(x-1,y)||nearB(x+1,y)||busy(x,y)||busy(x,y+1)||pathish(below)||side;
      if(bad){ m.t[y][x]=tr.c==='#'?',':'.'; return false; } return true; }); };
  m.ground=null; m.npcs=[]; m.populate=()=>m.defs.map(f=>f()).filter(Boolean);
  return m;
}
const BUILDERS={efate:buildEfate,tanna:buildTanna,santo:buildSanto,pentecost:buildPentecost,ambrym:buildAmbrym,malekula:buildMalekula};
const MAPS={}; for(const id in BUILDERS) MAPS[id]=finishMap(BUILDERS[id]());

/* ---------------- ground painter (per-pixel, dithered) ---------------- */
function paintGround(m){
  const pal={}; const P=Object.assign({},PAL_BASE,m.pal); for(const k in P) pal[k]=P[k].map(hex2rgb);
  const PW=m.w*16*SC, PH=m.h*16*SC, c=document.createElement('canvas'); c.width=PW; c.height=PH; const g=c.getContext('2d');
  const img=g.createImageData(PW,PH), d=img.data;
  const at=(x,y)=>(m.t[y]&&m.t[y][x])||'~';
  const base=ch=>ch==='#'?',':('T:fr'.includes(ch)?'.':ch==='M'?'w':ch==='p'?'w':ch);
  const bh=grid(m.w,m.h,0); for(let y=0;y<m.h;y++) for(let x=0;x<m.w;x++) if(m.t[y][x]==='B'){ let k=0; for(let r=1;r<4;r++){ let all=true; for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++) if(at(x+dx,y+dy)!=='B') all=false; if(all) k=r; else break; } bh[y][x]=k; }
  for(let PY=0;PY<PH;PY++){ const py=PY/SC, ty=Math.floor(py/16), ly=py-ty*16; for(let PX=0;PX<PW;PX++){
    const px=PX/SC, tx=Math.floor(px/16), lx=px-tx*16; let b=base(m.t[ty][tx]); const bay=BAYER[(PY&3)*4+(PX&3)];
    if(b===','||b==='='||b==='d'||b==='a'||b==='y'){ const n=vnoise(px*.45,py*.45,9);
      const nb=(ddx,ddy)=>base(at(tx+ddx,ty+ddy));
      if(lx<4&&nb(-1,0)==='.'&&n*4>lx) b='.'; else if(lx>11&&nb(1,0)==='.'&&n*4>15-lx) b='.'; else if(ly<4&&nb(0,-1)==='.'&&n*4>ly) b='.'; else if(ly>11&&nb(0,1)==='.'&&n*4>15-ly) b='.';
    }
    let col;
    switch(b){
      case '.': { const v=vnoise(px/22,py/22,1)*.62+vnoise(px/6,py/6,2)*.38; const l=clamp(Math.floor(v*3.4+(bay-.5)*1.1-.2),0,3); col=pal.grass[l]; break; }
      case ',': { let wet=0; for(const [ddx,ddy] of [[-1,0],[1,0],[0,-1],[0,1]]){ const nc=base(at(tx+ddx,ty+ddy)); if(nc==='w'||nc==='v'||nc==='~'){ const dist=ddx<0?lx:ddx>0?15-lx:ddy<0?ly:15-ly; if(dist<4) wet=Math.max(wet,(4-dist)/4); } }
        const rip=Math.sin(py*.55+vnoise(px/14,py/14,3)*5+px*.05), v=.5+rip*.22+(vnoise(px/9,py/9,4)-.5)*.5;
        let l=v+bay*.55>1.05?0:v+bay*.55>.6?1:2; if(wet>0&&wet+bay*.4>.55) l=wet>.6?3:2; col=pal.sand[l]; break; }
      case '=': { const v=vnoise(px/5,py/5,5); col=pal.path[v+bay*.5>.95?0:v+bay*.5>.5?1:2]; break; }
      case 'd': { const v=vnoise(px/6,py/6,15); col=pal.dirt[v+bay*.5>.95?0:v+bay*.5>.5?1:2]; break; }
      case 'y': { const v=vnoise(px/4,py/4,16); col=pal.soil[v+bay*.5>.95?0:v+bay*.5>.5?1:2]; break; }
      case 'a': { const v=vnoise(px/7,py/7,6); col=pal.ash[v+bay*.5>1?0:v+bay*.5>.55?1:2]; break; }
      case 'c': { const v=vnoise(px/3,py/3,7); col=pal.road[v+bay*.3>1?0:v+bay*.3>.4?1:2]; break; }
      case 'R': col=[86,91,100]; if(ly===0||ly===15) col=[66,70,78]; if(tx%2===0&&ly>=7&&ly<=8&&lx>=3&&lx<13) col=[242,242,242]; break;
      case '~': { const v=vnoise(px/30,py/14,8)*.7+vnoise(px/9,py/5,9)*.3; col=pal.deep[v+bay*.4>1.02?2:v+bay*.4>.58?0:1]; break; }
      case 'v': { const v=vnoise(px/24,py/12,10)*.7+vnoise(px/8,py/5,11)*.3; col=pal.mid[v+bay*.4>1.02?2:v+bay*.4>.58?0:1]; break; }
      case 'w': { const cs=Math.abs(Math.sin(px*.38+vnoise(px/8,py/8,12)*6)+Math.sin(py*.42+vnoise(px/7,py/9,13)*6)); col=pal.shal[cs+bay*.45<.42?2:(vnoise(px/12,py/12,14)>.5?0:1)]; break; }
      case 'o': { const cs=Math.abs(Math.sin(px*.5+vnoise(px/6,py/6,17)*5)); col=pal.pool[cs+bay*.4<.35?2:(vnoise(px/9,py/9,18)>.5?0:1)]; break; }
      case 'B': { const pl=m.pool; if(pl){ const ex=(px/16-pl.cx)/pl.rx, ey=(py/16-pl.cy)/pl.ry, dd=Math.sqrt(ex*ex+ey*ey)+(vnoise(px/5,py/5,23)-.5)*.12;
          if(dd>1){ const v=vnoise(px/22,py/22,1)*.62+vnoise(px/6,py/6,2)*.38; col=pal.grass[clamp(Math.floor(v*3.4+(bay-.5)*1.1-.2),0,3)]; break; }
          if(dd>.9){ col=[52,40,30]; break; } if(dd>.82){ col=[96,160,90]; break; }
          const k=(1-dd)*3.2+(vnoise(px/6,py/6,19)-.5)*.9+(bay-.5)*.5; col=pal.bh[k>1.9?0:k>.7?1:2]; break; }
        const k=bh[ty][tx]+(vnoise(px/6,py/6,19)-.5)*1.4+(bay-.5)*.6; col=pal.bh[k>1.2?0:k>.35?1:2]; break; }
      case 'W': col=[127,211,240]; break;
      default: col=pal.grass[1];
    }
    const i=(PY*PW+PX)*4; d[i]=col[0]; d[i+1]=col[1]; d[i+2]=col[2]; d[i+3]=255;
  } }
  g.putImageData(img,0,0); g.setTransform(SC,0,0,SC,0,0);
  const r=(x,y,w,h,cl)=>{ g.fillStyle=cl; g.fillRect(x,y,w,h); };
  const G2=P.grass;
  for(let y=0;y<m.h;y++) for(let x=0;x<m.w;x++){
    const ch=m.t[y][x], X=x*16, Y=y*16, h=hash(x,y), b=base(ch);
    if(b==='.'&&ch!=='T'&&ch!=='r'){ for(let i=0;i<2;i++){ const q=hash(x*7+i,y*3+i); if(q%3) continue; const bx=X+2+(q%11), by=Y+3+((q>>4)%10); r(bx,by,1,2,G2[3]); r(bx+2,by-1,1,3,G2[3]); r(bx+1,by,1,1,G2[0]); } }
    if(ch==='f'){ const fc=['#ff5d6c','#ffd84d','#ffffff','#ff8ad1'][h%4]; for(let i=0;i<2;i++){ const px=X+3+((h>>(i*5))%9), py=Y+3+((h>>(i*5+3))%9); r(px,py+2,1,2,G2[3]); r(px-1,py,3,1,fc); r(px,py-1,1,3,fc); r(px,py,1,1,'#ffe27a'); } }
    if(ch===':'){ for(let i=0;i<3;i++){ const q=hash(x*5+i,y*9); const px=X+1+(q%11), py=Y+4+((q>>4)%8); r(px,py+1,1,3,G2[3]); r(px+1,py-1,1,5,G2[3]); r(px+3,py,1,4,G2[3]); r(px+1,py-1,1,1,G2[1]); } }
    if(ch==='r'){ r(X+1,Y+3,14,12,C.out); r(X+2,Y+4,12,10,C.rock); r(X+3,Y+5,5,2,C.rock3); r(X+2,Y+11,12,3,C.rock2); }
    if(ch==='p'){ const horiz=at(x-1,y)==='p'||at(x+1,y)==='p';
      if(horiz){ r(X,Y+3,16,10,C.out); r(X,Y+4,16,8,C.wood); r(X,Y+4,16,1,'#b88252'); for(let i=0;i<16;i+=4) r(X+i,Y+4,1,8,C.wood2); r(X+1,Y+13,2,3,C.wood2); r(X+12,Y+13,2,3,C.wood2); }
      else { r(X+3,Y,10,16,C.out); r(X+4,Y,8,16,C.wood); r(X+4,Y,1,16,'#b88252'); for(let i=0;i<16;i+=4) r(X+4,Y+i,8,1,C.wood2); r(X+1,Y+5,2,3,C.wood2); r(X+13,Y+5,2,3,C.wood2); } }
    if(ch==='c'){ const rd=a=>a==='c'; if(!rd(at(x,y-1))) r(X,Y,16,1,'#c4c9cf'); if(!rd(at(x,y+1))) r(X,Y+15,16,1,'#7b818a'); if(!rd(at(x-1,y))) r(X,Y,1,16,'#c4c9cf'); if(!rd(at(x+1,y))) r(X+15,Y,1,16,'#7b818a'); if(rd(at(x-1,y))&&rd(at(x+1,y))&&!rd(at(x,y-1))&&!rd(at(x,y+1))&&x%2===0) r(X+4,Y+7,8,1,'#e8e2c8'); }
    if(ch==='=') { if(h%3===0) r(X+(h%12)+1,Y+((h>>4)%12)+1,2,2,P.path[2]); }
    if(ch==='y'){ for(let i=0;i<2;i++){ const mx=X+2+i*7, my=Y+4+((h>>(i*3))%5); r(mx,my+3,6,3,shade(P.soil[0],.15)); r(mx+1,my+2,4,1,shade(P.soil[0],.15)); r(mx+2,my-2,1,4,'#3f9a3a'); r(mx+3,my-3,2,1,'#5cc25b'); r(mx,my-1,2,1,'#5cc25b'); } }
    if(ch==='M'){ r(X+2,Y+8,12,4,'#2d5a2a'); for(let i=0;i<4;i++){ r(X+2+i*4,Y+10,1,6,'#6b4a2a'); r(X+3+i*4,Y+12,1,4,'#6b4a2a'); } blob(g,X+8,Y+6,7,'#1f4a22'); blob(g,X+6,Y+4,4,'#2f6a2f'); blob(g,X+10,Y+5,3,'#3c7f36'); }
  }
  return c;
}
function groundOf(m){ if(!m.ground) m.ground=paintGround(m); return m.ground; }
