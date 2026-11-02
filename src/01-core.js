(()=>{
'use strict';
const W=240,H=160;
const cvs=document.getElementById('game'), ctx=cvs.getContext('2d');
ctx.imageSmoothingEnabled=false;
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,q)=>a+(b-a)*q;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function hash(x,y){let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;}
const rnd=()=>Math.random();
function vnoise(x,y,seed=0){ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi; const r=(a,b)=>(hash(a+seed*131,b-seed*71)&1023)/1023; const s=q=>q*q*(3-2*q); const a=r(xi,yi),b=r(xi+1,yi),c=r(xi,yi+1),d=r(xi+1,yi+1),u=s(xf),v=s(yf); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const hex2rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
function shade(hex,amt){ const c=hex2rgb(hex); const f=v=>Math.max(0,Math.min(255,Math.round(amt>=0?v+(255-v)*amt:v*(1+amt)))); return '#'+c.map(v=>f(v).toString(16).padStart(2,'0')).join(''); }

/* ---------------- state ---------------- */
let LANG='th';
const t=(th,en)=>({th,en});
const SAVE_KEY='ihv-save-v2';
let G={};
function freshG(){ return {name:'',gender:'m',island:'efate',day:1,maxDays:15,slot:0,money:150000,budget:150000,spent:0,earned:0,
  stamps:{},words:{},pieces:{},flags:{},memories:[],visited:{efate:1},route:['efate'],kava:0,photo:0,photoData:null,karma:0,
  steps:0,lastEvStep:0,evKey:-1,evSeen:{},rain:false,kaloPart:0,chapter:1,px:0,py:0,dir:'down',ended:false}; }
G=freshG();
function L(x){ if(x==null) return ''; if(typeof x==='function') x=x(); if(typeof x==='string') return x.replace(/\{name\}/g,G.name||'...'); const s=(x[LANG]!=null?x[LANG]:x.en)||''; return s.replace(/\{name\}/g,G.name||'...'); }
const fmt=n=>Math.round(n).toLocaleString('en-US');

const STAMPS=[
  {id:'market',isl:'efate',name:t('ตลาด Port Vila','Port Vila Market')},
  {id:'post',isl:'efate',name:t('ไปรษณีย์ใต้น้ำ','Underwater Post')},
  {id:'mele',isl:'efate',name:t('น้ำตก Mele','Mele Cascades')},
  {id:'kava',isl:'efate',name:t('คาวาที่นากามาล','Nakamal Kava')},
  {id:'yasur',isl:'tanna',name:t('ภูเขาไฟ Yasur','Mount Yasur')},
  {id:'dance',isl:'tanna',name:t('ระบำ Kastom','Kastom Dance')},
  {id:'banyan',isl:'tanna',name:t('ต้นไทรยักษ์','Giant Banyan')},
  {id:'bluehole',isl:'santo',name:t('Blue Hole','Blue Hole')},
  {id:'coolidge',isl:'santo',name:t('ซากเรือ Coolidge','Coolidge Wreck')},
  {id:'champagne',isl:'santo',name:t('Champagne Beach','Champagne Beach')},
  {id:'nagol',isl:'pentecost',name:t('พิธี Nagol','Nagol Land Dive')},
  {id:'yam',isl:'pentecost',name:t('สวนมันเทศ','Yam Garden')},
  {id:'tamtam',isl:'ambrym',name:t('กลอง Tamtam','Tamtam Drums')},
  {id:'rom',isl:'ambrym',name:t('ระบำ Rom','Rom Dance')},
  {id:'ambvolc',isl:'ambrym',name:t('ภูเขาไฟคู่','Twin Volcanoes')},
  {id:'canoe',isl:'malekula',name:t('พายเรือดูเต่า','Turtle Canoe Trip')},
  {id:'clam',isl:'malekula',name:t('สวนหอยมือเสือ','Giant Clam Garden')},
];
const WORDS={
  halo:{w:'Halo',m:t('สวัสดี','Hello')},
  gudmoning:{w:'Gud moning',m:t('อรุณสวัสดิ์','Good morning')},
  solwota:{w:'Solwota',m:t('ทะเล','The sea')},
  tankyu:{w:'Tankyu tumas',m:t('ขอบคุณมาก','Thank you very much')},
  nakamal:{w:'Nakamal',m:t('ลานชุมนุมดื่มคาวา','Kava meeting place')},
  olsem:{w:'Olsem wanem?',m:t('สบายดีมั้ย?','How are you?')},
  glad:{w:'Mi glad tumas',m:t('ฉันดีใจมาก','I am very happy')},
  nambawan:{w:'Nambawan',m:t('ที่หนึ่ง สุดยอด','Number one, the best')},
  pikinini:{w:'Pikinini',m:t('เด็ก','Child')},
  tata:{w:'Tata',m:t('บ๊ายบาย','Bye')},
  yumi:{w:'Yumi',m:t('พวกเราทุกคน','All of us')},
  smolsmol:{w:'Smol smol',m:t('ค่อยๆ ไปทีละนิด','Little by little')},
  lukim:{w:'Lukim yu',m:t('แล้วเจอกันใหม่','See you')},
};
const PIECES=[
  {id:'begin',name:t('จุดเริ่มต้น','The Beginning'),isl:'efate'},
  {id:'fire',name:t('ไฟแห่ง Tanna','Fire of Tanna'),isl:'tanna'},
  {id:'water',name:t('น้ำแห่ง Santo','Water of Santo'),isl:'santo'},
  {id:'vine',name:t('เถาวัลย์แห่ง Pentecost','Vine of Pentecost'),isl:'pentecost'},
  {id:'drum',name:t('กลองแห่ง Ambrym','Drum of Ambrym'),isl:'ambrym'},
  {id:'turtle',name:t('เต่าแห่ง Malekula','Turtle of Malekula'),isl:'malekula'},
];
const SLOTS=[t('เช้า','Morning'),t('บ่าย','Afternoon'),t('เย็น','Evening'),t('กลางคืน','Night')];
const ISLANDS={
  efate:{name:t('Efate','Efate'),x:124,y:104,chap:t('Halo, Efate','Halo, Efate')},
  tanna:{name:t('Tanna','Tanna'),x:166,y:146,chap:t('ไฟแห่ง Tanna','The Fire of Tanna')},
  santo:{name:t('Espiritu Santo','Espiritu Santo'),x:46,y:34,chap:t('น้ำสีฟ้าแห่ง Santo','The Blue Waters of Santo')},
  malekula:{name:t('Malekula','Malekula'),x:72,y:64,chap:t('เต่าแห่ง Malekula','The Turtles of Malekula')},
  pentecost:{name:t('Pentecost','Pentecost'),x:120,y:46,chap:t('นักกระโดดแห่ง Pentecost','The Divers of Pentecost')},
  ambrym:{name:t('Ambrym','Ambrym'),x:104,y:66,chap:t('เสียงกลองแห่ง Ambrym','The Drums of Ambrym')},
};
const ISL_ORDER=['efate','tanna','santo','malekula','pentecost','ambrym'];

/* ---------------- audio ---------------- */
let AC=null, musicOn=true, musicStep=0, musicTimer=null;
function audio(){ if(!AC){ try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;} } if(AC&&AC.state==='suspended') AC.resume().catch(()=>{}); if(AC&&!musicTimer) musicTimer=setInterval(musicTick,170); return AC; }
const mtof=n=>440*Math.pow(2,(n-69)/12);
function tone(f,d,type='square',v=.05,when=0){ if(!AC) return; try{ const o=AC.createOscillator(),g=AC.createGain(),t0=AC.currentTime+when; o.type=type; o.frequency.setValueAtTime(f,t0); g.gain.setValueAtTime(v,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0+d+.03);}catch(e){} }
function noise(d,v=.2,cut=900){ if(!AC) return; try{ const n=Math.floor(AC.sampleRate*d), b=AC.createBuffer(1,n,AC.sampleRate), ch=b.getChannelData(0); for(let i=0;i<n;i++) ch[i]=(Math.random()*2-1)*(1-i/n); const s=AC.createBufferSource(); s.buffer=b; const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=cut; const g=AC.createGain(); g.gain.value=v; s.connect(f).connect(g).connect(AC.destination); s.start(); }catch(e){} }
const sfx={
  blip:()=>tone(620+Math.random()*60,.025,'square',.012),
  sel:()=>tone(880,.06,'square',.035),
  back:()=>tone(330,.07,'square',.03),
  stamp:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.14,'square',.04,i*.08)),
  word:()=>[660,880].forEach((f,i)=>tone(f,.1,'triangle',.06,i*.08)),
  coin:()=>[988,1319].forEach((f,i)=>tone(f,.09,'square',.035,i*.07)),
  lose:()=>[392,330,262].forEach((f,i)=>tone(f,.12,'square',.03,i*.09)),
  shutter:()=>noise(.09,.25,5000),
  boom:()=>noise(1.1,.4,260),
  splash:()=>noise(.35,.15,1800),
  drum:()=>{tone(90,.18,'sine',.25); noise(.05,.08,600);},
  hit:()=>{tone(140,.12,'sine',.3); tone(280,.06,'square',.03);},
  bump:()=>tone(120,.05,'square',.02),
  cheer:()=>{ for(let i=0;i<6;i++) tone(500+Math.random()*500,.15,'triangle',.02,i*.05); noise(.8,.08,3000); },
};
const MEL=[76,0,79,81,79,0,76,74,72,0,74,76,79,0,0,0,76,0,79,81,84,81,79,76,74,76,72,0,72,0,0,0];
const BAS=[48,55,52,55,53,60,57,60,55,62,59,62,48,55,52,55];
function musicTick(){ if(!AC||!musicOn||document.hidden) return; const n=MEL[musicStep%32]; if(n) tone(mtof(n),.2,'triangle',.03); if(musicStep%2===0) tone(mtof(BAS[(musicStep/2|0)%16]),.22,'square',.009); if(musicStep%4===2) noise(.025,.025,7000); musicStep++; }

/* ---------------- input ---------------- */
const keys={up:false,down:false,left:false,right:false,a:false,b:false};
const pressed=new Set();
function press(k){ if(!keys[k]) pressed.add(k); keys[k]=true; audio(); }
function release(k){ keys[k]=false; }
const consume=k=>{ if(pressed.has(k)){ pressed.delete(k); return true; } return false; };
const KEYMAP={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyZ:'a',Enter:'a',Space:'a',KeyX:'b',Escape:'b',Backspace:'b',ShiftLeft:'b',ShiftRight:'b',KeyM:'menu',KeyQ:'menu'};
addEventListener('keydown',e=>{ if(e.target&&e.target.tagName==='INPUT') return; const k=KEYMAP[e.code]; if(!k) return; e.preventDefault(); if(e.repeat) return; if(k==='menu'){ pressed.add('menu'); audio(); return; } press(k); });
addEventListener('keyup',e=>{ const k=KEYMAP[e.code]; if(k&&k!=='menu') release(k); });
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; });
const dpad=$('#dpad');
function setDir(d){ for(const k of ['up','down','left','right']){ if(k===d) press(k); else release(k); } dpad.className='dpad'+(d?' on-'+d:''); }
function dirFromEvent(e){ const r=dpad.getBoundingClientRect(); const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2); if(Math.hypot(dx,dy)<10) return null; return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'); }
dpad.addEventListener('pointerdown',e=>{ e.preventDefault(); dpad.setPointerCapture(e.pointerId); setDir(dirFromEvent(e)); });
dpad.addEventListener('pointermove',e=>{ if(dpad.hasPointerCapture(e.pointerId)){ const d=dirFromEvent(e); if(!keys[d]||d===null) setDir(d); } });
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>dpad.addEventListener(ev,()=>setDir(null)));
function bindBtn(el,k){ el.addEventListener('pointerdown',e=>{ e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('down'); press(k); }); ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>el.addEventListener(ev,()=>{ el.classList.remove('down'); release(k); })); }
bindBtn($('#btnA'),'a'); bindBtn($('#btnB'),'b');
$('#btnMenu').addEventListener('click',()=>{ audio(); pressed.add('menu'); });
$('#btnLang').addEventListener('click',()=>{ audio(); setLang(LANG==='th'?'en':'th'); });
$('#btnMusic').addEventListener('click',()=>{ audio(); musicOn=!musicOn; $('#btnMusic').textContent=musicOn?'♪ ON':'♪ OFF'; });
{ const fb=$('#btnFull'), pf=$('#playFull'), de=document.documentElement; const req=de.requestFullscreen||de.webkitRequestFullscreen;
  const isFull=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
  const goFull=async()=>{ audio(); try{ if(!isFull()){ const p=req.call(de,{navigationUI:'hide'}); if(p&&p.then) await p; } }catch(e){} try{ if(screen.orientation&&screen.orientation.lock) await screen.orientation.lock('landscape'); }catch(e){} };
  if(req&&(document.fullscreenEnabled||document.webkitFullscreenEnabled)){ fb.hidden=false; pf.hidden=false;
    fb.addEventListener('click',()=>{ if(isFull()){ try{ (document.exitFullscreen||document.webkitExitFullscreen).call(document); }catch(e){} } else goFull(); });
    pf.addEventListener('click',goFull); } }

/* ---------------- pixel helpers ---------------- */
const R=(x,y,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(Math.floor(x),Math.floor(y),w,h); };
function blob(g,cx,cy,r,c){ g.fillStyle=c; for(let dy=-r;dy<=r;dy++){ const w=Math.round(Math.sqrt(r*r-dy*dy)); g.fillRect(Math.floor(cx-w),Math.floor(cy+dy),w*2,1); } }
function pline(g,x0,y0,x1,y1,c,wd=1){ g.fillStyle=c; x0=Math.round(x0); y0=Math.round(y0); x1=Math.round(x1); y1=Math.round(y1); const dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1; let e=dx+dy; for(let i=0;i<600;i++){ g.fillRect(x0,y0,wd,wd); if(x0===x1&&y0===y1) break; const e2=2*e; if(e2>=dy){ e+=dy; x0+=sx; } if(e2<=dx){ e+=dx; y0+=sy; } } }
const FONT={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'111101111100100',Q:'010101101110011',R:'111101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110','.':'000000000000010','-':'000000111000000','!':'010010010000010',':':'000010000010000','/':'001001010100100','*':'010111010101000','+':'000010111010000'};
function ptext(g,s,x,y,c,sc=1){ x=Math.round(x); y=Math.round(y); g.fillStyle=c; let cx=x; for(const ch of String(s).toUpperCase()){ if(ch===' '){cx+=3*sc;continue;} const f=FONT[ch]; if(!f){cx+=4*sc;continue;} for(let i=0;i<15;i++) if(f[i]==='1') g.fillRect(cx+(i%3)*sc,y+((i/3)|0)*sc,sc,sc); cx+=4*sc; } return cx-x; }
function ptextS(g,s,x,y,c,sc=1,sh='#1c1d26'){ ptext(g,s,x+sc,y+sc,sh,sc); ptext(g,s,x,y,c,sc); }
const ptw=(s,sc=1)=>String(s).length*4*sc-sc;

const C={out:'#1c1d26',foam:'#eafcff',wood:'#9a6a3c',wood2:'#70482a',leaf:'#2f9a45',leaf2:'#1d7034',leaf3:'#5cc25b',trunk:'#a4713f',trunk2:'#76502f',
  thatch:'#c9974a',thatch2:'#94692c',thatch3:'#e2b86c',bamboo:'#d8b46e',bamboo2:'#b38c4c',rock:'#8d929b',rock2:'#666b74',rock3:'#b6bbc3'};

/* ---------------- icons ---------------- */
const ICONS={
  market:{r:['....gg....','...g..g...','..bbbbbb..','.bbbbbbbb.','.bwbbbbbb.','.bbbbbbbb.','.bbbbbbbb.','..bbbbbb..','...bbbb...','..........'],p:{g:'#3f9a3a',b:'#8a5a32',w:'#ffffff'}},
  post:{r:['..........','.oooooooo.','.ommmmmmo.','.obmmmmbo.','.ombmmbmo.','.ommbbmmo.','.ommmmmmo.','.oooooooo.','..........','..........'],p:{o:'#1c1d26',m:'#f5f1e6',b:'#2d6cc0'}},
  mele:{r:['.rrrrrrrr.','.rwbwbwbr.','.rbwbwbwr.','..wbwbwb..','..bwbwbw..','..wbwbwb..','.cccccccc.','cccwccwccc','.cccccccc.','..........'],p:{r:'#7c818a',w:'#ffffff',b:'#4fb3de',c:'#43d0c8'}},
  kava:{r:['..........','..........','.k......k.','.kmmmmmmk.','.kmmmmmmk.','..kmmmmk..','...kkkk...','....kk....','...kkkk...','..........'],p:{k:'#5a3a1e',m:'#a8935e'}},
  yasur:{r:['....yy....','...oyyo...','....oo....','...gggg...','..gggggg..','..gglggg..','.gggggggg.','.gglggglg.','gggggggggg','..........'],p:{y:'#ffd23f',o:'#ff7a1a',g:'#4b4752',l:'#7c7884'}},
  dance:{r:['....hh....','....ss....','.s..ss..s.','..s.rr.s..','...rrrr...','....rr....','...gggg...','...g..g...','..s....s..','..........'],p:{h:'#1c1d26',s:'#6a3f25',r:'#d9453a',g:'#3f9a3a'}},
  banyan:{r:['..gggggg..','.gGgggGgg.','ggggGgggGg','.gggggggg.','..b.bb.b..','..b.bb.b..','..b.bb.b..','.bb.bb.bb.','..........','..........'],p:{g:'#3f9a3a',G:'#62c357',b:'#8a5a32'}},
  bluehole:{r:['..........','..gggggg..','.ggbbbbgg.','.gbBBBBbg.','.gbBwBBbg.','.gbBBBBbg.','.ggbbbbgg.','..gggggg..','..........','..........'],p:{g:'#3f9a3a',b:'#43b8f0',B:'#1b5fd0',w:'#ffffff'}},
  coolidge:{r:['..........','....kk....','...kkkk...','.kkkkkkkk.','kkkwkkwkkk','.kkkkkkkk.','..........','.bbbbbbbb.','bbbbbbbbbb','..........'],p:{k:'#4a5260',w:'#9fd3f2',b:'#2d6cc0'}},
  champagne:{r:['...w...w..','.w...w....','....w..w..','..w.......','bbbbbbbbbb','bbbbbbbbbb','ssssssssss','ssssssssss','..........','..........'],p:{w:'#ffffff',b:'#5fd8e6',s:'#f6e7c3'}},
  nagol:{r:['....kk....','...k..k...','...kkkk...','...k..k...','..kkkkkk..','..k.v..k..','.kkkvkkkk.','.k..v...k.','kkkkkkkkkk','..........'],p:{k:'#8a5a32',v:'#3f9a3a'}},
  yam:{r:['....gg....','...g.gg...','....gg....','...bbbb...','..bbbbbb..','.bbbbbbbb.','.bbbbbbbb.','..bbbbbb..','..........','..........'],p:{g:'#3f9a3a',b:'#8a5a32'}},
  tamtam:{r:['...kkkk...','..kwkkwk..','..kkkkkk..','..kkrrkk..','..kkkkkk..','..k.kk.k..','..k.kk.k..','..kkkkkk..','..kkkkkk..','..........'],p:{k:'#6b4423',w:'#ffffff',r:'#d9453a'}},
  rom:{r:['....r.....','...ryr....','...rrr....','..ryyyr...','..rrrrr...','.gggggggg.','..gggggg..','..g.gg.g..','..g.gg.g..','..........'],p:{r:'#d9453a',y:'#ffd23f',g:'#6faa3a'}},
  ambvolc:{r:['.y......y.','.o......o.','.gg....gg.','gggg..gggg','gglggggggg','gggggglggg','gggggggggg','kkkkkkkkkk','..........','..........'],p:{y:'#ffd23f',o:'#ff7a1a',g:'#4b4752',l:'#7c7884',k:'#2a2730'}},
  canoe:{r:['..........','..k.......','...k......','.cccccccc.','cccccccccc','.bbbbbbbbb','bbbbbbbbbb','..........','..........','..........'],p:{k:'#5a3a1e',c:'#a4713f',b:'#2d9ad6'}},
  clam:{r:['..........','..pppppp..','.pppppppp.','pPpPpPpPpp','pppppppppp','.mmmmmmmm.','..mmmmmm..','bbbbbbbbbb','..........','..........'],p:{p:'#8a5ab8',P:'#c89ae8',m:'#3fb0e0',b:'#2d6cc0'}},
};
function drawIcon(g,id,x,y,sc,grey){ const ic=ICONS[id]; for(let j=0;j<10;j++) for(let i=0;i<10;i++){ const ch=ic.r[j][i]; if(ch==='.') continue; let col=ic.p[ch]||'#000';
  if(grey){ const c=hex2rgb(col); const v=c[0]*.3+c[1]*.59+c[2]*.11; const gv=Math.round(150+v*.25); col=`rgb(${gv},${gv-4},${gv-14})`; }
  g.fillStyle=col; g.fillRect(x+i*sc,y+j*sc,sc,sc); } }
