/* ---------------- travel, time, endings ---------------- */
function route(a,b,mode){ const A=ISLANDS[a],B=ISLANDS[b], d=Math.hypot(A.x-B.x,A.y-B.y);
  if(mode==='plane') return {fare:Math.round((9000+d*190)/500)*500, slots:d>75?2:1};
  return {fare:Math.round((3000+d*55)/500)*500, days:d>75?2:1}; }
async function travel(mode){
  const here=G.island;
  if(G.slot>=3){ await say(mode==='plane'?NIGHT:S1('boat',`เรือคืนนี้ออกไปแล้ว มาใหม่พรุ่งนี้นะ`,`Tonight's boat has already left. Come back tomorrow.`)); return; }
  if(mode==='plane'&&G.slot>=2){ await say(S1(null,`ไม่มีเที่ยวบินตอนค่ำ เครื่องบินเล็กบินเฉพาะตอนกลางวัน`,`No flights after dusk. The small planes only fly in daylight.`)); return; }
  const dests=ISL_ORDER.filter(id=>id!==here);
  const items=dests.map(id=>{ const r=route(here,id,mode); const tm=mode==='plane'?(r.slots===2?t('2 ช่วงของวัน (ต่อเครื่อง)','2 parts of the day (connection)'):t('1 ช่วงของวัน','1 part of the day')):(r.days===2?t('2 คืนบนเรือ','2 nights at sea'):t('ข้ามคืน ถึงเช้าพรุ่งนี้','Overnight, arrive tomorrow morning'));
    const late=mode==='plane'&&G.slot+r.slots>2; const pc=PIECES.find(p=>p.isl===id); const mark=pc&&!G.pieces[pc.id]?' ✦':'';
    return {label:t(`${L(ISLANDS[id].name)}${mark} · ${fmt(r.fare)} VT`,`${L(ISLANDS[id].name)}${mark} · ${fmt(r.fare)} VT`),sub:late?t('เที่ยวบินวันนี้หมดแล้ว','No more flights today'):tm,disabled:late,id,r}; });
  items.push({label:t('ยกเลิก','Cancel')});
  const c=await choose(items,{title:mode==='plane'?t('สนามบิน · บินไปไหนดี? (✦ = ยังมีชิ้นส่วน)','Airport · Where to? (✦ = piece waiting)'):t('ท่าเรือ · ไปไหนดี? (✦ = ยังมีชิ้นส่วน)','Wharf · Where to? (✦ = piece waiting)')});
  if(c<0||!items[c].id) return;
  const dest=items[c].id, r=items[c].r, fare=r.fare;
  if(G.money<fare){
    if(mode==='boat'){ await say(S1('boat',`เงินไม่พอเหรอ? ช่วยขนกระสอบมะพร้าวแห้งขึ้นเรือสิ แล้วไปด้วยกันฟรี`,`Not enough money? Help me load the copra sacks and you can ride for free.`)); G.flags.helped=true; memory(t('ขนมะพร้าวแห้งแลกค่าเรือ','Loaded copra to pay for the boat')); }
    else { await say(S1(null,`เงินไม่พอ (ต้องใช้ ${fmt(fare)} VT) ลองไปท่าเรือดูสิ เรือถูกกว่ามาก`,`Not enough money (needs ${fmt(fare)} VT). Try the wharf, boats are much cheaper.`)); return; }
  } else spend(fare);
  await fadeTo(1,400); hudShow(false);
  await new Promise(res=>{ setScene(TravelScene(here,dest,mode,res)); fadeTo(0,400); });
  let delayed=false;
  if(mode==='plane'){ passTime(r.slots); if(rnd()<.18&&G.slot<2){ delayed=true; passTime(1); } }
  else {
    const ev=hash(G.day*7+dest.length,G.spent)%4;
    if(ev===0){ await say(S1(null,`ตอนรุ่งสาง ฝูงโลมาว่ายตามข้างเรือ!`,`At dawn, a pod of dolphins swims alongside the boat!`)); memory(t('เห็นโลมาตอนรุ่งสางบนเรือ','Dolphins at dawn from the boat')); }
    else if(ev===1){ await say(S1(null,`คืนนี้คลื่นแรงหน่อย แต่ดาวเต็มฟ้าสวยมาก`,`The sea is rough tonight, but the sky is full of stars.`)); memory(t('นอนดูดาวบนดาดฟ้าเรือ','Stargazing on the boat deck')); }
    else if(ev===2){ await say(S1('boat',`ชาวเกาะเดินทางด้วยเรือระหว่างเกาะแบบนี้มานานหลายชั่วอายุคนแล้ว`,`Islanders have travelled between these islands by boat for generations.`)); learnWord('solwota'); }
    else { await say(S1(null,`ผู้โดยสารคนหนึ่งขายของกินบนเรือ เลยซื้อขนมกล้วยทอดมากิน`,`A passenger is selling snacks on deck, so you buy some fried banana.`)); money(-300); }
    G.day+=r.days; G.slot=0;
  }
  await fadeTo(1,400);
  const sp=MAPS[dest].spawn[mode==='plane'?'airport':'pier'];
  enterMap(dest,sp.x,sp.y,sp.dir);
  if(G.day>G.maxDays){ await departureMorning(); return; }
  await fadeTo(0,400);
  await banner(mode==='plane'?t(`ถึง ${L(ISLANDS[dest].name)} · ${L(SLOTS[G.slot])}`,`Landed on ${L(ISLANDS[dest].name)} · ${L(SLOTS[G.slot])}`):t(`วันที่ ${G.day} · ถึง ${L(ISLANDS[dest].name)}`,`Day ${G.day} · Arrived on ${L(ISLANDS[dest].name)}`));
  if(delayed) await say(S1(null,`เครื่องบินดีเลย์เพราะฝนตก เสียเวลาไปอีกช่วงหนึ่ง`,`The flight was delayed by rain. You lost another part of the day.`));
  await arriveIsland(dest);
  await morningNotes();
}
async function sleepNow(){
  await fadeTo(1,600); G.day++; G.slot=0; G.rain=false; await wait(350);
  if(G.day>G.maxDays){ await departureMorning(); return; }
  hud(); save(); await fadeTo(0,600);
  await banner(t(`วันที่ ${G.day} · เช้า`,`Day ${G.day} · Morning`));
  await morningNotes();
  if(rnd()<.5) await randomEvent('morning');
}
async function morningNotes(){
  if(G.day>=G.maxDays-1&&G.slot===0&&!G.flags['warn'+G.day]){ G.flags['warn'+G.day]=1;
    const left=G.maxDays-G.day+1;
    if(G.island==='efate') await say(S1(null,left===1?`วันสุดท้ายแล้ว! เครื่องบินกลับบ้านออกจาก Port Vila เช้าพรุ่งนี้`:`เหลืออีก 2 วัน เครื่องบินกลับบ้านออกจาก Port Vila เช้าวันที่ 16`,left===1?`Last day! Your flight home leaves Port Vila tomorrow morning.`:`Two days left. Your flight home leaves Port Vila on the morning of Day 16.`));
    else await say(S1(null,left===1?`วันสุดท้ายแล้ว! ต้องกลับไป Efate ให้ทันวันนี้ ไม่งั้นตกเครื่อง`:`เหลืออีก 2 วัน! อย่าลืมเผื่อเวลากลับ Efate นะ`,left===1?`Last day! Get back to Efate today or you'll miss your flight.`:`Two days left! Leave enough time to get back to Efate.`)); }
}
async function departureMorning(){ if(G.island==='efate') await finale(); else await missedFlight(); }
async function finale(){
  G.ended=true; save();
  await fadeTo(1,500); hudShow(false);
  G.island='efate'; M=MAPS.efate; groundOf(M); G.flags.met=true; repopulate(); P.x=P.fx=13; P.y=P.fy=18; P.dir='down'; P.prog=1; P.moving=false; setScene(MapScene); G.tint='gold'; G.rain=false;
  await fadeTo(0,800);
  await banner(t('บทสุดท้าย · เส้นทางกลับบ้าน','Final Chapter · The Way Home'),2200);
  await say(S1('luna',`ถึงเวลาแล้วสินะ... ก่อนไปสนามบิน คุณยายมีอะไรจะให้`,`So it's time... Before you head to the airport, Grandma has something for you.`),S1('pita',`เอาชิ้นส่วนที่เก็บมาให้ยายดูซิ`,`Show me the pieces you gathered.`));
  while(G.kaloPart<PIECES.filter(p=>G.pieces[p.id]).length&&G.kaloPart<KALO.length-1){ G.kaloPart++; await say(KALO[G.kaloPart]); }
  await fadeTo(1,500); const sc=SandScene(); setScene(sc); await fadeTo(0,500);
  if(sc.final){ await sc.autoDone;
    await say(S1('pita',`ครบทุกชิ้น... เหลือเส้นสุดท้าย เส้นที่ Kalo ไม่เคยได้วาด`,`Every piece... only the last line is left, the one Kalo never drew.`),S1('pita',`วาดเส้นกลับบ้านให้ตาเขาหน่อยนะ`,`Please draw the way home for him.`));
    sc.startHold(); await sc.done; await wait(400);
    await say(S1('pita',`...ครบแล้ว ขอบใจนะ ตาคงยิ้มอยู่บนฟ้า`,`...It's whole now. Thank you. Kalo must be smiling up there.`)); memory(t('วาดเส้นกลับบ้านให้คุณตา Kalo','Drew the way home for Grandpa Kalo')); }
  else { await sc.done; await wait(500); await say(S1('pita',`เส้นยังไม่ครบ ไม่เป็นไร ทุกเส้นทางเริ่มจากก้าวเล็กๆ กลับมาวาดต่อวันหลังนะ`,`The line isn't finished. That's fine. Every path starts with a small step. Come back and finish it one day.`)); }
  const adv=G.flags.lunaAdvice;
  if(adv==='stay') await say(S1('luna',`เราตัดสินใจแล้ว ...จะอยู่ที่นี่ เป็นไกด์ดำน้ำ พาคนมาดูปะการังของเกาะเรา`,`I've decided... I'll stay and become a dive guide, showing people our island's reefs.`),S1('pita',`หลานเลือกเองนะ ยายดีใจทุกทาง`,`You chose for yourself, dear. I'm happy either way.`));
  else if(adv) await say(S1('luna',`เราตัดสินใจแล้ว ...จะไปเรียนที่ฟิจิ แล้วกลับมาดูแลปะการังของบ้านเรา`,`I've decided... I'll study in Fiji, then come home to protect our reefs.`),S1('pita',`ไปเถอะหลาน คนที่รักเกาะจะกลับมาเสมอ เหมือนเต่า เหมือนตาของหลาน`,`Go, dear. People who love the islands always come back, like the turtles, like your grandpa.`));
  else await say(S1('luna',`เรายังไม่รู้ว่าอนาคตจะไปทางไหน แต่การได้เห็น {name} เดินทางทำให้กล้าขึ้นเยอะ`,`I don't know where my future goes yet, but watching you travel made me braver.`));
  await say(S1('luna',`ภาพนี้ไม่เหมือนของใครเลย เพราะมันคือการเดินทางของ {name}`,`No one else has this drawing. It's your journey, {name}.`),S1('luna',`Lukim yu, {name}! แปลว่า แล้วเจอกันใหม่`,`Lukim yu, {name}! It means see you again.`));
  learnWord('lukim'); await wait(900); G.tint=null; save(); showCard();
}
async function missedFlight(){
  G.ended=true; G.flags.missed=true; save();
  G.tint=0; setScene(MapScene); hudShow(false); await fadeTo(0,700);
  await say(S1(null,`เสียงเครื่องบินดังผ่านไปไกลๆ ...นั่นคือเที่ยวบินกลับบ้านจาก Port Vila`,`A plane hums somewhere far away... That's your flight home leaving Port Vila.`),
    S1(null,`มือถือสั่น ข้อความจาก Luna`,`Your phone buzzes. A message from Luna.`),
    S1('luna',`ตกเครื่องเหรอ? ฮ่าๆ ไม่เป็นไร บางทีความฝันก็คือการได้อยู่ต่ออีกหน่อย`,`Missed your flight? Haha, no worries. Maybe the dream is staying a little longer.`),
    S1('boss',`[ข้อความ] {name}!!! อยู่ไหน!?`,`[Message] {name}!!! Where are you!?`),
    S1('luna',`คุณยายบอกว่าเส้นทางของ {name} ยังวาดไม่จบ ...Lukim yu!`,`Grandma says your path isn't finished yet... Lukim yu!`));
  learnWord('lukim'); await wait(900); G.tint=null; save(); showCard();
}

/* ---------------- share card ---------------- */
function tripTitle(){
  const st=Object.keys(G.stamps).length, nP=PIECES.filter(p=>G.pieces[p.id]).length, isl=Object.keys(G.visited).length;
  if(G.flags.missed) return t('ผู้หลงรักเกาะ','Island Lover');
  if(st>=STAMPS.length) return t('ตำนานนักกระโดดเกาะ','Island Hopper Legend');
  if(nP>=PIECES.length) return t('ผู้เดินตามรอยคุณตา Kalo','Keeper of Kalo\'s Path');
  if(isl>=6) return t('นักกระโดดครบ 6 เกาะ','Six-Island Hopper');
  if(G.karma>=3) return t('นักเดินทางใจดี','Kind-Hearted Traveller');
  if(G.flags.helped) return t('นักเดินทางสาย Kastom','Kastom Traveller');
  if(G.photo>=3) return t('นักล่าลาวา','Lava Chaser');
  if(G.spent<=G.budget*.45&&st>=5) return t('นักเที่ยวงบน้อย','Budget Wizard');
  if(G.kava>=2) return t('เพื่อนแห่งนากามาล','Friend of the Nakamal');
  if(isl<=1) return t('ชาว Port Vila กิตติมศักดิ์','Honorary Port Vila Local');
  return t('นักเดินทางผู้อยากรู้','Curious Traveller');
}
function drawPostcardScene(g,x,y,w,h){ const gr=g.createLinearGradient(0,y,0,y+h); gr.addColorStop(0,'#f6a35c'); gr.addColorStop(.55,'#ffd08a'); gr.addColorStop(.56,'#2d6cc0'); gr.addColorStop(1,'#1d4f95'); g.fillStyle=gr; g.fillRect(x,y,w,h); blob(g,x+w*.65,y+h*.55,10,'#fff1b8'); g.fillStyle='#2d6cc0'; g.fillRect(x,y+h*.56,w,h*.44); g.fillStyle='#f1d68e'; g.fillRect(x,y+h*.82,w,h*.18); g.fillStyle='#1b2240'; for(let i=0;i<26;i++) g.fillRect(x+18+Math.round(i*i*.02),y+h*.82-i,2,1); for(const a of [-2.6,-.5,-1.6,2.6,.5]) for(let k=1;k<12;k++) g.fillRect(x+24+Math.cos(a)*k*1.5,y+h*.82-28+Math.sin(a)*k+k*k*.08,3,2); }
function wrapFit(g,text,maxW,size,weight='400'){ let s=size; while(s>14){ g.font=`${weight} ${s}px 'Mitr',system-ui,sans-serif`; if(g.measureText(text).width<=maxW) break; s-=2; } return s; }
function drawRouteMini(g,x,y,w,h){ g.fillStyle='#2d6cc0'; g.fillRect(x,y,w,h); const sx=w/240, sy=h/160;
  for(const [id,s] of Object.entries(WMAP)) blob(g,x+s.x*sx,y+s.y*sy,Math.max(2,Math.round(Math.max(s.rx*sx,s.ry*sy)*.8)),G.visited[id]?'#5fb546':'#7a8fa0');
  g.fillStyle='#ffd84d'; for(let i=1;i<G.route.length;i++){ const a=WMAP[G.route[i-1]], b=WMAP[G.route[i]]; if(!a||!b) continue; for(let k=0;k<=20;k++){ if(k%2) continue; g.fillRect(Math.round(x+lerp(a.x,b.x,k/20)*sx),Math.round(y+lerp(a.y,b.y,k/20)*sy),1,1); } } }
async function renderCard(){
  try{ await Promise.all([document.fonts.load("600 40px Mitr","กขค123"),document.fonts.load("400 40px Mitr","กขค123")]); }catch(e){}
  const c=document.createElement('canvas'); c.width=1080; c.height=1350; const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  const a=document.createElement('canvas'); a.width=270; a.height=338; const ag=a.getContext('2d'); ag.imageSmoothingEnabled=false;
  ag.fillStyle='#f3dfae'; ag.fillRect(0,0,270,338); for(let i=0;i<900;i++){ const q=hash(i,31); ag.fillStyle=q%3?'#e6cd93':'#fbebc0'; ag.fillRect(q%270,(q>>9)%338,1,1); }
  const sg=ag.createLinearGradient(0,0,0,70); sg.addColorStop(0,'#24306e'); sg.addColorStop(.6,'#c85a6a'); sg.addColorStop(1,'#f7a35c'); ag.fillStyle=sg; ag.fillRect(0,0,270,62); ag.fillStyle='#2c5fa6'; ag.fillRect(0,62,270,14); for(let i=0;i<30;i++){ const q=hash(i,8); ag.fillStyle='#6aa3e0'; ag.fillRect(q%270,63+(q>>8)%12,4,1); }
  blob(ag,220,62,12,'#ffd27a'); ag.fillStyle='#2c5fa6'; ag.fillRect(200,63,40,13);
  ag.fillStyle='#1b2240'; for(let x=0;x<70;x++){ const hh=Math.max(0,22-Math.abs(x-36)*.7)+4; ag.fillRect(x,76-hh,1,hh); }
  for(let x=0;x<270;x+=6){ ag.fillStyle='#f3dfae'; ag.fillRect(x,74+(x/6%2),6,4); }
  const logo='ISLAND HOPPER'; ptext(ag,logo,135-ptw(logo,3)/2+1,13,'#7f2f22',3); ptext(ag,logo,135-ptw(logo,3)/2,12,'#ffffff',3);
  ptext(ag,'VANUATU',135-ptw('VANUATU',2)/2,34,'#ffd27a',2);
  ag.fillStyle='#1c1d26'; ag.fillRect(10,126,82,82); ag.fillRect(94,126,82,82); ag.fillRect(178,126,82,82);
  const scv=document.createElement('canvas'); scv.width=80; scv.height=80; drawSand(scv.getContext('2d'),0,0,80,80,pieceIds(),1,{bg:true,ghost:true}); ag.drawImage(scv,11,127);
  let photoImg=null; if(G.photoData){ photoImg=await new Promise(r=>{ const im=new Image(); im.onload=()=>r(im); im.onerror=()=>r(null); im.src=G.photoData; }); }
  if(photoImg) ag.drawImage(photoImg,70,24,100,100,95,127,80,80); else drawPostcardScene(ag,95,127,80,80);
  drawRouteMini(ag,179,127,80,80);
  const got=STAMPS.map(s=>!!G.stamps[s.id]);
  STAMPS.forEach((s,i)=>{ const row=i<9?0:1, col=row?i-9:i, n=row?8:9, iw=20, gap=7, x0=Math.round(135-(n*iw+(n-1)*gap)/2), x=x0+col*(iw+gap), y=228+row*27;
    ag.fillStyle=got[i]?'#1c1d26':'#c9b688'; ag.fillRect(x-2,y-2,iw+4,iw+4); ag.fillStyle=got[i]?'#fff7e3':'#efe0b8'; ag.fillRect(x-1,y-1,iw+2,iw+2); drawIcon(ag,s.id,x,y,2,!got[i]); });
  ag.fillStyle='#1c1d26'; for(let x=4;x<266;x+=4){ ag.fillRect(x,4,2,1); ag.fillRect(x,333,2,1); } for(let y=4;y<334;y+=4){ ag.fillRect(4,y,1,2); ag.fillRect(265,y,1,2); }
  g.drawImage(a,0,0,1080,1352);
  const F=(s,wt='400')=>`${wt} ${s}px 'Mitr',system-ui,sans-serif`;
  g.textAlign='center'; g.textBaseline='middle';
  const line1=LANG==='th'?`ทริปในฝันของ ${G.name}`:`${G.name}'s Dream Trip`; g.fillStyle='#1b1d26'; g.font=F(wrapFit(g,line1,960,54,'700'),'700'); g.fillText(line1,540,350);
  const ttl=L(tripTitle()); const ts=wrapFit(g,ttl,820,62,'700'); g.font=F(ts,'700'); const tw=g.measureText(ttl).width+80;
  g.fillStyle='#1b1d26'; g.fillRect(540-tw/2-6,392,tw+12,104); g.fillStyle='#c4513a'; g.fillRect(540-tw/2,398,tw,92); g.fillStyle='#ffffff'; g.fillText(ttl,540,446);
  g.font=F(26); g.fillStyle='#5a4a30';
  const nP=PIECES.filter(p=>G.pieces[p.id]).length;
  g.fillText(LANG==='th'?`ภาพวาดทราย ${nP}/${PIECES.length}`:`Sand drawing ${nP}/${PIECES.length}`,204,858);
  g.fillText(photoImg?(LANG==='th'?`ภาพลาวา ${['☆☆☆','★☆☆','★★☆','★★★'][G.photo]}`:`Lava shot ${['☆☆☆','★☆☆','★★☆','★★★'][G.photo]}`):(LANG==='th'?'พระอาทิตย์ตกที่ Efate':'Sunset on Efate'),540,858);
  g.fillText(LANG==='th'?`${Object.keys(G.visited).length}/6 เกาะ`:`${Object.keys(G.visited).length}/6 islands`,876,858);
  const st=Object.keys(G.stamps).length, wd=Object.keys(G.words).length, days=Math.min(G.day,G.maxDays);
  g.font=F(30); g.fillText(LANG==='th'?`แสตมป์ ${st}/${STAMPS.length}`:`Stamps ${st}/${STAMPS.length}`,540,1150);
  const stats=LANG==='th'?`${days} วัน · ใช้ไป ${fmt(G.spent)} VT · ${wd} คำ Bislama`:`${days} days · ${fmt(G.spent)} VT spent · ${wd} Bislama words`;
  g.fillStyle='#1b1d26'; g.font=F(wrapFit(g,stats,960,40,'600'),'600'); g.fillText(stats,540,1210);
  const best=G.memories.slice(-2)[0]; if(best){ const s=(LANG==='th'?'ไฮไลต์: ':'Highlight: ')+L(best); g.fillStyle='#6b5a3a'; g.font=F(wrapFit(g,s,960,28)); g.fillText(s,540,1268); }
  return c.toDataURL('image/png');
}
async function showCard(){
  hudShow(false);
  const m=$('#cardModal'); m.hidden=false; $('#cmMsg').textContent='';
  $('#cmHint').textContent=LANG==='th'?'กดค้างที่รูป (มือถือ) หรือคลิกขวาแล้วเลือกบันทึกรูป เพื่อแชร์ลงโซเชียล':'Long-press the image (phone) or right-click and save it to share on social media.';
  $('#cmCopy').textContent=LANG==='th'?'คัดลอกข้อความแชร์':'Copy share text';
  $('#cmAgain').textContent=LANG==='th'?'เดินทางอีกครั้ง':'Travel again';
  $('#cardImg').alt=LANG==='th'?'การ์ดทริปในฝันของคุณ':'Your dream trip card';
  try{ $('#cardImg').src=await renderCard(); }catch(e){ console.error(e); }
}
$('#cmCopy').addEventListener('click',()=>{ const st=Object.keys(G.stamps).length, wd=Object.keys(G.words).length, isl=Object.keys(G.visited).length;
  const txt=LANG==='th'?`ทริปในฝันที่วานูอาตูของ ${G.name}: "${L(tripTitle())}" · ${isl}/6 เกาะ · แสตมป์ ${st}/${STAMPS.length} · เรียนภาษา Bislama ${wd} คำ #IslandHopperVanuatu`:`${G.name}'s dream trip to Vanuatu: "${L(tripTitle())}" · ${isl}/6 islands · ${st}/${STAMPS.length} stamps · ${wd} Bislama words #IslandHopperVanuatu`;
  const ok=()=>{ $('#cmMsg').textContent=LANG==='th'?'คัดลอกแล้ว':'Copied'; };
  const fail=()=>{ $('#cmMsg').textContent=txt; const r=document.createRange(); r.selectNodeContents($('#cmMsg')); const s=getSelection(); s.removeAllRanges(); s.addRange(r); };
  try{ navigator.clipboard.writeText(txt).then(ok,fail); }catch(e){ fail(); } });
$('#cmAgain').addEventListener('click',()=>{ $('#cardModal').hidden=true; G=freshG(); for(const k in sandCache) delete sandCache[k]; try{ localStorage.removeItem(SAVE_KEY); }catch(e){} titleFlow(); });

/* ---------------- flows ---------------- */
async function intro(){
  const gender=G.gender, name=G.name; G=freshG(); G.gender=gender; G.name=name; for(const k in sandCache) delete sandCache[k];
  await fadeTo(1,400); RoomScene.postcard=0; RoomScene.pcT=0; setScene(RoomScene); await fadeTo(0,700);
  await say(S1(null,`กรุงเทพฯ ห้าทุ่มครึ่ง ฝนตกมาสามวันแล้ว`,`Bangkok, 11:30 PM. It has rained for three days.`),S1(null,`{name} ยังนั่งทำงานอยู่ ตั้งแต่เริ่มงานนี้มา ยังไม่เคยลาพักร้อนเลยสักครั้ง`,`{name} is still working. Not a single holiday since starting this job.`));
  RoomScene.postcard=1; noise(.3,.08,2500); await wait(1500);
  await say(S1(null,`ฟึ่บ... มีอะไรบางอย่างถูกสอดเข้ามาใต้ประตู`,`Shff... Something slides in under the door.`),S1(null,`โปสการ์ดชื้นๆ ประทับตรา "ไปรษณีย์ใต้น้ำ วานูอาตู"`,`A damp postcard, stamped "Underwater Post Office, Vanuatu".`),
    S1('luna',`Halo {name}! จำเราได้มั้ย Luna เพื่อนทางจดหมายไง เขียนหากันตั้งแต่เรียนมัธยม`,`Halo {name}! Remember me? Luna, your pen pal since high school.`),
    S1('luna',`{name} เคยเขียนมาว่าอยากเห็นภูเขาไฟสักครั้งในชีวิต ...ที่นี่มีให้ดูเพียบเลย`,`You once wrote that you wanted to see a volcano once in your life... We have plenty here.`),
    S1('luna',`คุณยายของเราก็มีเรื่องอยากขอให้ช่วยด้วย มาสิ เกาะรออยู่ ~ Luna`,`My grandma has a favour to ask you, too. Come. The islands are waiting. ~ Luna`));
  await say(S1(null,`{name} เปิดบัญชีเงินเก็บ... แลกได้ 150,000 วาตู`,`{name} checks the savings account... enough for 150,000 vatu.`),S1('boss',`วันลาสะสมเหลือ 15 วันใช่มั้ย ...ก็ได้ ไปเถอะ แต่กลับมาให้ทันนะ!`,`You have 15 days of leave saved up? ...Fine, go. But come back on time!`),S1(null,`เครื่องบินกลับบ้านออกจาก Port Vila เช้าวันที่ 16`,`The flight home leaves Port Vila on the morning of Day 16.`));
  await choose([{label:t('ไปเลย!','Let\'s go!')},{label:t('เดี๋ยวนะ... ไปก็ได้!','Hmm... OK, let\'s go!')}],{title:t('ไปวานูอาตูมั้ย?','Go to Vanuatu?'),cancel:false});
  await fadeTo(1,500); setScene(FlightScene); await fadeTo(0,500); await wait(500);
  await banner(t('บินข้ามมหาสมุทรแปซิฟิก...','Across the Pacific...'),2000); await wait(400);
  await fadeTo(1,500);
  enterMap('efate',26,8,'down');
  await fadeTo(0,600);
  await banner(t('บทที่ 1 · Halo, Efate','Chapter 1 · Halo, Efate'),2000);
  await arrival();
}
async function titleFlow(){
  hudShow(false); setScene(TitleScene); $('#titleUI').hidden=false; await fadeTo(0,600);
  const l=await choose([{label:'ภาษาไทย'},{label:'English'}],{title:'เลือกภาษา · Language',cancel:false,center:true});
  setLang(l===0?'th':'en'); audio();
  const has=!!loadSave(true);
  const items=[{label:t('เริ่มการเดินทางใหม่','Start a new journey')}]; if(has) items.unshift({label:t('เดินทางต่อ','Continue journey')});
  const c=await choose(items,{cancel:false,center:true});
  if(has&&c===0){ $('#titleUI').hidden=true; loadSave(); for(const k in sandCache) delete sandCache[k]; await fadeTo(1,400); enterMap(G.island,G.px,G.py,G.dir); await fadeTo(0,500); await banner(t(`${L(ISLANDS[G.island].name)} · วันที่ ${G.day}`,`${L(ISLANDS[G.island].name)} · Day ${G.day}`)); return; }
  G=freshG();
  const gd=await choose([{label:t('ผู้ชาย','Boy')},{label:t('ผู้หญิง','Girl')}],{title:t('เลือกตัวละคร','Choose your traveller'),cancel:false,center:true});
  G.gender=gd===0?'m':'f';
  $('#titleUI').hidden=true;
  G.name=await askName();
  await run(intro);
}

/* ---------------- loop ---------------- */
let last=performance.now(), TM=0;
$('#screen').addEventListener('pointerdown',e=>{ audio(); if(dlg.open&&!e.target.closest('#menu,#panel,#nameUI')){ e.preventDefault(); dlgAdvance(); } });
function loop(now){
  const dt=Math.min(.05,(now-last)/1000); last=now; TM+=dt;
  if(nameRes){ if(consume('a')&&document.activeElement!==$('#nameIn')) submitName(); }
  else if(menu.open) menuUpdate();
  else if(dlg.open) dlgUpdate(dt);
  else if(panelOpen) panelUpdate();
  if(scene){ scene.anim&&scene.anim(dt,TM); if(!uiOpen()&&(busyCount===0||scene.always)) scene.input&&scene.input(dt); scene.draw(TM); }
  fadeUpdate(dt); fadeDraw();
  pressed.clear();
  requestAnimationFrame(loop);
}
function check(){ const out=[]; for(const id in MAPS){ const m=MAPS[id]; const seen=grid(m.w,m.h,0); const sp=m.spawn.airport; const q=[[sp.x,sp.y]]; seen[sp.y][sp.x]=1; const npcs=m.populate();
  const ok=(x,y)=>x>=0&&y>=0&&x<m.w&&y<m.h&&!SOLID.has(m.t[y][x])&&!m.solid[y][x]&&!npcs.some(n=>n.x===x&&n.y===y);
  while(q.length){ const [x,y]=q.pop(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(ok(nx,ny)&&!seen[ny][nx]){ seen[ny][nx]=1; q.push([nx,ny]); } } }
  const adj=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen[y+dy]&&seen[y+dy][x+dx]);
  for(const n of npcs) if(!adj(n.x,n.y)) out.push(id+': npc '+n.id+' unreachable at '+n.x+','+n.y);
  const groups={}; for(const o of m.inter){ const k=o.fn.name||String(o.fn).slice(0,30); (groups[k]=groups[k]||[]).push(o); }
  for(const k in groups) if(!groups[k].some(o=>adj(o.x,o.y))) out.push(id+': inter '+k+' unreachable');
  if(m.spawn.pier&&!seen[m.spawn.pier.y][m.spawn.pier.x]) out.push(id+': pier spawn unreachable'); }
  return out; }
applyLang();
window.IHV={get busy(){return busyCount;},get mini(){return !!(scene&&scene.always);},get G(){return G;},P,MAPS,enterMap,run,travel,setScene,finale,showCard,setLang,check,get M(){return M;},randomEvent,arriveIsland,menuPick,uiReset:()=>{ menu.open=false; menu.res=null; $('#menu').hidden=true; $('#titleUI').hidden=true; }};
requestAnimationFrame(loop);
titleFlow();
})();
