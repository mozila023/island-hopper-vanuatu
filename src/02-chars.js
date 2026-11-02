/* ---------------- characters ---------------- */
const LOOK={
  meM:{skin:'#e3ad80',hair:'#2a1c14',hs:'short',shirt:'#f08a3c',trim:'#ffd27a',pants:'#33456e',pack:true},
  meF:{skin:'#ebb68e',hair:'#2a1c14',hs:'long',shirt:'#ff7aa8',trim:'#ffffff',pants:'#3b5fa0',pack:true,clip:true},
  luna:{skin:'#7b4a2c',hair:'#16110f',hs:'curly',shirt:'#1aa39a',trim:'#ffe066',dress:true,dots:true,flower:true},
  pita:{skin:'#6a3f25',hair:'#dcd8d0',hs:'bun',shirt:'#c43d78',trim:'#ffffff',dress:true,dots:true,flower:true,elder:true},
  driver:{skin:'#6e4329',hair:'#16110f',hs:'short',shirt:'#3b6fd1',trim:'#ffffff',pants:'#2e2e36'},
  kid:{skin:'#7b4a2c',hair:'#16110f',hs:'curly',shirt:'#ffd84d',trim:'#ff7b39',pants:'#2f78c4',small:true},
  vendor:{skin:'#6a3f25',hair:'#16110f',hs:'bun',shirt:'#f0a32e',trim:'#d6402f',dress:true,dots:true,flower:true},
  elder:{skin:'#5f3a24',hair:'#bdb7ab',hs:'short',shirt:'#8a5b3a',trim:'#e8c37a',pants:'#2e2e36',elder:true},
  boat:{skin:'#734629',hair:'#16110f',hs:'cap',shirt:'#e9eef2',trim:'#2d6cc0',pants:'#2e4a6e'},
  guide:{skin:'#6e4329',hair:'#16110f',hs:'cap',shirt:'#d9532f',trim:'#ffd27a',pants:'#3a3a40'},
  chief:{skin:'#5f3a24',hair:'#16110f',hs:'curly',shirt:'#5f3a24',trim:'#3fae4a',dress:true,straw:true,feather:true},
  old:{skin:'#5a3622',hair:'#e0ddd6',hs:'curly',shirt:'#6e4b33',trim:'#c99a4b',pants:'#3a3a40',elder:true},
  woman:{skin:'#6a3f25',hair:'#16110f',hs:'bun',shirt:'#2fa0d6',trim:'#ffffff',dress:true,dots:true},
  woman2:{skin:'#6a3f25',hair:'#16110f',hs:'long',shirt:'#8fd14f',trim:'#ffef6b',dress:true,dots:true,flower:true},
  host:{skin:'#734629',hair:'#16110f',hs:'long',shirt:'#e85f8a',trim:'#ffffff',dress:true,dots:true,flower:true},
  dancer:{skin:'#6a3f25',hair:'#16110f',hs:'curly',shirt:'#6a3f25',trim:'#3fae4a',dress:true,straw:true},
  rom:{skin:'#5f3a24',hair:'#16110f',hs:'curly',shirt:'#5f3a24',trim:'#c8a24a',dress:true,straw:true,mask:true},
  rose:{skin:'#6a3f25',hair:'#9a958c',hs:'bun',shirt:'#3a8fd6',trim:'#ffffff',dress:true,dots:true,flower:true,elder:true},
  jimmy:{skin:'#7b4a2c',hair:'#16110f',hs:'short',shirt:'#1f9e8f',trim:'#ffffff',pants:'#1d2d4a',shades:true},
  store:{skin:'#e8c29a',hair:'#1a1412',hs:'short',shirt:'#f2f2f2',trim:'#d9453a',pants:'#3a3a40',shades:false},
  bule:{skin:'#5f3a24',hair:'#16110f',hs:'curly',shirt:'#5f3a24',trim:'#ffd23f',dress:true,straw:true,feather:true},
  moses:{skin:'#734629',hair:'#16110f',hs:'curly',shirt:'#734629',trim:'#3fae4a',dress:true,straw:true},
  farmer:{skin:'#6a3f25',hair:'#16110f',hs:'bun',shirt:'#e8a23a',trim:'#7a3f1a',dress:true,dots:true},
  willie:{skin:'#5a3622',hair:'#cfcac0',hs:'short',shirt:'#3b4b36',trim:'#c99a4b',pants:'#3a3a40',elder:true},
  leiwia:{skin:'#7b4a2c',hair:'#2a1a12',hs:'long',shirt:'#ff8a3a',trim:'#ffffff',dress:true,dots:true,flower:true},
  nini:{skin:'#6a3f25',hair:'#e0ddd6',hs:'bun',shirt:'#8a5ab8',trim:'#ffe066',dress:true,dots:true,elder:true},
  boss:{skin:'#e3b48c',hair:'#2a2a2a',hs:'short',shirt:'#4a5260',trim:'#d9453a',pants:'#2a2a2a',glasses:true,angry:true},
};
const CAST={luna:['Luna','luna'],pita:[t('คุณยาย Pita','Grandma Pita'),'pita'],driver:[t('คนขับแท็กซี่','Taxi driver'),'driver'],kid:[t('เด็กริมหาด','Beach kid'),'kid'],
  vendor:[t('แม่ค้าตลาด','Market mama'),'vendor'],elder:[t('ลุงนากามาล','Nakamal uncle'),'elder'],boat:[t('กัปตันเรือ','Boat captain'),'boat'],guide:[t('ไกด์ภูเขาไฟ','Volcano guide'),'guide'],
  chief:[t('หัวหน้าหมู่บ้าน','Village chief'),'chief'],old:[t('ผู้เฒ่าใต้ต้นไทร','Banyan elder'),'old'],woman:[t('ชาวบ้าน','Villager'),'woman'],woman2:[t('ชาวบ้าน','Villager'),'woman2'],
  driver2:[t('คนขับรถกระบะ','Truck driver'),'driver'],kid2:[t('เด็กบนเกาะ','Island kid'),'kid'],host:[t('เจ้าของที่พัก','Guesthouse host'),'host'],rose:['Mama Rose','rose'],
  jimmy:[t('Jimmy ครูสอนดำน้ำ','Jimmy, dive master'),'jimmy'],store:[t('เจ้าของร้าน','Shopkeeper'),'store'],bule:[t('หัวหน้า Bule','Chief Bule'),'bule'],moses:['Moses','moses'],
  farmer:[t('ป้าชาวสวน','Garden auntie'),'farmer'],willie:[t('ลุง Willie','Uncle Willie'),'willie'],romchief:[t('ผู้นำระบำ Rom','Rom dance leader'),'rom'],guide2:[t('ไกด์เดินป่า','Trek guide'),'guide'],
  leiwia:['Leiwia','leiwia'],nini:[t('ยาย Nini','Granny Nini'),'nini'],schief:[t('หัวหน้าหมู่บ้าน','Village chief'),'old'],boss:[t('หัวหน้าที่ออฟฟิศ','Your boss'),'boss'],me:[()=>G.name,'me']};
function lookOf(id){ if(id==='me') return G.gender==='f'?LOOK.meF:LOOK.meM; return LOOK[id]; }
function sh(lk){ if(!lk._s) lk._s={sk2:shade(lk.skin,-.22),sh2:shade(lk.shirt,-.28),sh3:shade(lk.shirt,.22),hr2:shade(lk.hair,.3),pa2:lk.pants?shade(lk.pants,-.3):null}; return lk._s; }

function drawChar(sx,sy,dir,frame,lk,dark){
  const ox=Math.floor(sx), oy=Math.floor(sy)-4, flip=dir==='left', side=dir==='left'||dir==='right';
  const r=(x,y,w,h,c)=>{ ctx.fillStyle=c; ctx.fillRect(flip?ox+16-x-w:ox+x,oy+y,w,h); };
  const O=C.out, sk=lk.skin, shc=lk.shirt, hr=lk.hair, S=sh(lk);
  const step=frame===1?1:frame===3?2:0;
  const s2=lk.small?2:0;
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(ox+3,oy+18,10,2); ctx.fillRect(ox+4,oy+19,8,1);
  if(lk.dress){
    const sc=lk.straw?'#c8a24a':shc, sc2=lk.straw?'#9e7a2c':S.sh2;
    if(side){ r(4,14,8,5,O); r(5,14,6,3,sc); r(5,16,6,1,sc2); r(5,17,2,1,O); r(9,17,2,1,O); if(step) r(step===1?4:9,17,3,2,O); }
    else { r(3,14,10,5,O); r(4,14,8,3,sc); r(4,16,8,1,sc2); if(lk.straw){ for(let i=4;i<12;i+=2) r(i,14,1,3,'#9e7a2c'); } r(5,17,2,1+(step===1?0:1),O); r(9,17,2,1+(step===2?0:1),O); }
  } else {
    if(side){ if(step){ r(3,15,4,4,O); r(4,15,2,3,lk.pants); r(9,15,4,4,O); r(10,15,2,3,lk.pants); r(4,17,2,1,S.pa2); } else { r(5,15,6,4,O); r(6,15,4,3,lk.pants); r(6,17,4,1,S.pa2); } }
    else { r(4,15,4,step===1?3:4,O); r(8,15,4,step===2?3:4,O); r(5,15,2,step===1?2:3,lk.pants); r(9,15,2,step===2?2:3,lk.pants); r(5,15,2,1,S.pa2); r(9,15,2,1,S.pa2); }
  }
  if(side){
    r(4,10+s2,8,6-s2,O); r(5,10+s2,6,5-s2,shc); r(5,14,6,1,S.sh2); r(5,10+s2,2,1,S.sh3);
    if(lk.dots){ r(6,11+s2,1,1,lk.trim); r(9,13,1,1,lk.trim); } if(lk.straw) r(5,12,6,1,lk.trim);
    if(lk.pack){ r(2,10,4,5,O); r(3,11,2,3,'#8a5a32'); r(3,11,2,1,'#b07a44'); }
    const ax=7+(step===1?1:step===2?-1:0); r(ax,11+s2,3,4-s2,O); r(ax+1,11+s2,1,1,shc); r(ax+1,12+s2,1,2-s2,sk);
  } else {
    r(2,10+s2,12,6-s2,O); r(4,10+s2,8,5-s2,shc); r(4,14,8,1,S.sh2); r(4,10+s2,3,1,S.sh3); r(3,11+s2,1,1,shc); r(12,11+s2,1,1,shc); r(3,12+s2,1,2-s2,sk); r(12,12+s2,1,2-s2,sk);
    if(lk.dots){ r(5,11+s2,1,1,lk.trim); r(8,12+s2,1,1,lk.trim); r(10,11+s2,1,1,lk.trim); r(6,13,1,1,lk.trim); }
    if(lk.straw) r(4,11,8,1,lk.trim);
    if(lk.pack&&dir==='up'){ r(4,10,8,6,O); r(5,11,6,4,'#8a5a32'); r(5,11,6,1,'#b07a44'); }
    if(lk.pack&&dir==='down'){ r(4,10,1,4,'#6b4423'); r(11,10,1,4,'#6b4423'); }
  }
  const hy=s2;
  r(3,1+hy,10,10,O); r(4,2+hy,8,8,sk); r(4,9+hy,8,1,S.sk2);
  if(dir==='up'){ r(4,2+hy,8,7,hr); r(5,2+hy,4,1,S.hr2); if(lk.hs==='long') r(4,2+hy,8,9,hr); }
  else if(side){ r(4,2+hy,8,3,hr); r(4,5+hy,3,4,hr); r(5,2+hy,4,1,S.hr2); r(10,6+hy,1,2,O); r(11,8+hy,1,1,S.sk2); if(lk.hs==='long') r(3,5+hy,4,7,hr); if(lk.shades) r(9,6+hy,3,1,O); }
  else { r(4,2+hy,8,3,hr); r(4,5+hy,1,2,hr); r(11,5+hy,1,2,hr); r(5,2+hy,4,1,S.hr2); r(6,6+hy,1,2,O); r(9,6+hy,1,2,O); r(5,8+hy,1,1,'rgba(255,120,120,.45)'); r(10,8+hy,1,1,'rgba(255,120,120,.45)');
    if(lk.hs==='long'){ r(3,5+hy,2,7,hr); r(11,5+hy,2,7,hr); } if(lk.shades||lk.glasses){ r(5,6+hy,3,1,O); r(8,6+hy,3,1,O); } }
  if(lk.hs==='curly'){ r(4,1+hy,2,1,hr); r(7,0+hy,2,2,hr); r(10,1+hy,2,1,hr); }
  if(lk.hs==='bun'){ r(6,-1+hy,4,3,O); r(7,-1+hy,2,2,hr); }
  if(lk.hs==='cap'){ r(3,1+hy,10,3,O); r(4,1+hy,8,2,lk.trim); if(dir==='down') r(4,3+hy,8,1,shade(lk.trim,-.25)); if(side) r(10,3+hy,4,1,lk.trim); }
  if(lk.clip&&dir!=='up') r(side?5:10,2+hy,2,1,'#ffd84d');
  if(lk.flower) r(side?5:10,2+hy,2,2,'#ff5a5a');
  if(lk.feather){ r(7,-4+hy,2,4,O); r(7,-3+hy,1,3,'#ffffff'); }
  if(lk.mask){ for(let y=-9;y<10;y++){ const hw=Math.max(1,Math.round((y+9)/19*6)); r(8-hw-1,oy>-99?y+hy:0,hw*2+2,1,O); r(8-hw,y+hy,hw*2,1,(Math.floor((y+9)/3))%2?'#d9453a':'#ffd23f'); } if(dir!=='up'){ r(6,5+hy,1,2,O); r(9,5+hy,1,2,O); } }
  if(dark){ ctx.fillStyle='rgba(10,8,20,.75)'; ctx.fillRect(ox,oy-6,16,26); }
}
function drawFace(g,lk){
  g.clearRect(0,0,32,32);
  const r=(x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(x,y,w,h); };
  const O='#1c1d26', sk=lk.skin, S=sh(lk), hr=lk.hair;
  r(2,25,28,7,O); r(3,26,26,6,lk.straw?sk:lk.shirt); r(3,30,26,2,lk.straw?S.sk2:S.sh2); r(3,26,8,1,lk.straw?sk:S.sh3);
  if(lk.dots) for(let i=0;i<6;i++) r(5+i*4,27+(i%2)*2,1,1,lk.trim);
  if(lk.straw){ r(7,27,18,2,lk.trim); r(9,29,14,1,shade(lk.trim,-.2)); }
  if(!lk.dress&&!lk.straw){ r(13,26,6,2,shade(lk.shirt,.35)); }
  r(12,20,8,6,O); r(13,20,6,6,S.sk2);
  r(8,5,16,18,O); r(7,7,18,14,O); r(9,6,14,16,sk); r(8,8,16,12,sk); r(20,9,4,11,S.sk2); r(9,20,14,2,S.sk2);
  r(5,12,3,5,O); r(6,13,2,3,sk); r(24,12,3,5,O); r(24,13,2,3,S.sk2);
  const ey=13;
  if(lk.angry){ r(10,ey-2,5,1,O); r(17,ey-2,5,1,O); r(11,ey-3,2,1,O); r(19,ey-3,2,1,O); } else { r(10,ey-2,4,1,shade(hr,-.1)); r(18,ey-2,4,1,shade(hr,-.1)); }
  r(11,ey,3,3,O); r(18,ey,3,3,O); r(12,ey,1,1,'#ffffff'); r(19,ey,1,1,'#ffffff');
  if(lk.glasses||lk.shades){ r(10,ey-1,5,5,O); r(17,ey-1,5,5,O); r(15,ey,2,1,O); r(11,ey,3,3,lk.shades?'#2b3a52':'#bfe3f2'); r(18,ey,3,3,lk.shades?'#2b3a52':'#bfe3f2'); }
  r(15,16,2,2,S.sk2);
  if(lk.angry){ r(13,19,6,1,O); } else { r(13,18,1,1,O); r(18,18,1,1,O); r(14,19,4,1,O); }
  if(!lk.angry){ r(9,17,2,1,'rgba(255,110,110,.45)'); r(21,17,2,1,'rgba(255,110,110,.45)'); }
  if(lk.elder){ r(10,ey+3,3,1,S.sk2); r(19,ey+3,3,1,S.sk2); r(14,9,4,1,S.sk2); }
  const hl=S.hr2;
  switch(lk.hs){
    case 'short': r(7,3,18,7,O); r(8,4,16,5,hr); r(7,8,3,5,O); r(8,8,2,4,hr); r(22,8,3,5,O); r(22,8,2,4,hr); r(10,4,7,1,hl); r(9,9,6,1,hr); break;
    case 'curly': r(6,2,20,8,O); r(7,3,18,6,hr); for(let i=0;i<5;i++) r(7+i*4,1+(i%2),3,2,hr); r(6,8,3,6,hr); r(23,8,3,6,hr); for(let i=0;i<6;i++) r(8+i*3,4+(i%2),1,1,hl); break;
    case 'bun': r(7,4,18,6,O); r(8,5,16,4,hr); r(11,0,10,5,O); r(12,1,8,3,hr); r(13,1,3,1,hl); r(7,8,3,6,hr); r(22,8,3,6,hr); r(10,5,6,1,hl); break;
    case 'long': r(6,3,20,7,O); r(7,4,18,5,hr); r(5,8,5,17,O); r(6,8,3,16,hr); r(22,8,5,17,O); r(23,8,3,16,hr); r(10,4,7,1,hl); r(9,9,4,1,hr); break;
    case 'cap': r(6,2,20,8,O); r(7,3,18,5,lk.trim); r(4,8,24,2,O); r(5,8,22,1,shade(lk.trim,-.25)); r(9,4,6,1,shade(lk.trim,.3)); break;
  }
  if(lk.clip){ r(21,5,4,2,'#ffd84d'); }
  if(lk.flower){ r(22,3,5,5,'#ff5a5a'); r(23,4,3,3,'#ff8a8a'); r(24,5,1,1,'#ffe27a'); }
  if(lk.feather){ r(14,-2,4,6,O); r(15,-1,2,5,'#ffffff'); }
  if(lk.mask){ for(let y=0;y<26;y++){ const hw=Math.round(1+y/26*11); r(16-hw-1,y,hw*2+2,1,O); r(16-hw,y,hw*2,1,Math.floor(y/4)%2?'#d9453a':'#ffd23f'); } r(11,15,3,3,O); r(18,15,3,3,O); }
}
