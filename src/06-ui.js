/* ---------------- UI ---------------- */
let busyCount=0;
async function run(fn){ busyCount++; try{ await fn(); } catch(e){ console.error(e); } finally{ busyCount--; } }
const S1=(who,th,en)=>({who,t:{th,en}});
const dlg={open:false,queue:[],cur:null,segs:[],shown:0,acc:0,res:null};
const segmenter=(window.Intl&&Intl.Segmenter)?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
const graphemes=s=>segmenter?Array.from(segmenter.segment(s),x=>x.segment):Array.from(s);
function say(...lines){ return new Promise(res=>{ dlg.queue=lines.flat().filter(Boolean); dlg.res=res; dlg.open=true; $('#dlg').hidden=false; nextLine(); }); }
function whoName(w){ if(!w) return ''; const c=CAST[w]; return c?L(c[0]):''; }
const pfEl=$('#dlg .pf'); let pfc=pfEl.getContext('2d');
const PORTRAIT_IDX={}; ['meM','meF','luna','pita','boat','guide','vendor','boss','driver','kid','elder','chief','old','woman','woman2','rose','jimmy','store','bule','moses','farmer','willie','leiwia','nini'].forEach((k,i)=>{ if(ASSET_META.portraitSheets.includes(Math.floor(i/8))) PORTRAIT_IDX[k]=i; });
function drawPortrait(key){ const k=key==='me'?(G.gender==='f'?'meF':'meM'):key; const i=PORTRAIT_IDX[k];
  if(i!=null&&imgOk('portraits')){ if(pfEl.width!==96){ pfEl.width=96; pfEl.height=96; pfc=pfEl.getContext('2d'); } pfc.imageSmoothingEnabled=false; pfc.clearRect(0,0,96,96); pfc.drawImage(IMG.portraits,i*96,0,96,96,0,0,96,96); return; }
  if(pfEl.width!==32){ pfEl.width=32; pfEl.height=32; pfc=pfEl.getContext('2d'); } drawFace(pfc,lookOf(key)); }
function nextLine(){ const ln=dlg.queue.shift(); if(!ln){ dlg.open=false; $('#dlg').hidden=true; const r=dlg.res; dlg.res=null; r&&r(); return; } dlg.cur=ln; dlg.segs=graphemes(L(ln.t)); dlg.shown=0; dlg.acc=0;
  const c=ln.who&&CAST[ln.who]; $('#dlg').classList.toggle('face',!!c); if(c) drawPortrait(c[1]); renderDlg(); }
function renderDlg(){ $('#dlg .who').textContent=whoName(dlg.cur.who); $('#dlg .txt').textContent=dlg.segs.slice(0,dlg.shown).join(''); $('#dlg .more').style.visibility=dlg.shown>=dlg.segs.length?'visible':'hidden'; }
function dlgAdvance(){ if(!dlg.open) return; if(dlg.shown<dlg.segs.length){ dlg.shown=dlg.segs.length; renderDlg(); } else { sfx.sel(); nextLine(); } }
function dlgUpdate(dt){ if(dlg.shown<dlg.segs.length){ dlg.acc+=dt*(keys.a||keys.b?110:42); const n=Math.floor(dlg.acc); if(n>0){ dlg.acc-=n; const before=dlg.shown; dlg.shown=Math.min(dlg.segs.length,dlg.shown+n); if(Math.floor(before/2)!==Math.floor(dlg.shown/2)) sfx.blip(); renderDlg(); } } if(consume('a')||consume('b')) dlgAdvance(); }

const menu={open:false,items:[],idx:0,res:null,cancel:true,title:null,center:false};
function choose(items,o={}){ return new Promise(res=>{ Object.assign(menu,{open:true,items:items.map(it=>it.label?it:{label:it}),res,cancel:o.cancel!==false,title:o.title||null,center:!!o.center}); menu.idx=Math.max(0,menu.items.findIndex(i=>!i.disabled)); renderMenu(); $('#menu').hidden=false; }); }
function renderMenu(){ const el=$('#menu'); el.className='box'+(menu.center?' center':''); el.innerHTML=(menu.title?`<div class="ttl">${esc(L(menu.title))}</div>`:'')+menu.items.map((it,i)=>`<button type="button" data-i="${i}" class="${i===menu.idx?'on':''}"${it.disabled?' disabled':''}><span class="cur">▶</span><span>${esc(L(it.label))}${it.sub?`<small class="sub">${esc(L(it.sub))}</small>`:''}</span></button>`).join(''); const on=el.querySelector('button.on'); if(on&&on.scrollIntoView) on.scrollIntoView({block:'nearest'}); }
function menuPick(i){ if(!menu.open) return; if(i>=0&&menu.items[i]?.disabled) return; menu.open=false; $('#menu').hidden=true; i>=0?sfx.sel():sfx.back(); const r=menu.res; menu.res=null; r&&r(i); }
function menuMove(d){ const n=menu.items.length; let i=menu.idx; for(let k=0;k<n;k++){ i=(i+d+n)%n; if(!menu.items[i].disabled) break; } menu.idx=i; sfx.blip(); renderMenu(); }
function menuUpdate(){ if(consume('up')) menuMove(-1); if(consume('down')) menuMove(1); if(consume('a')) menuPick(menu.idx); else if(consume('b')&&menu.cancel) menuPick(-1); }
$('#menu').addEventListener('click',e=>{ audio(); const b=e.target.closest('button'); if(b) menuPick(+b.dataset.i); });
$('#menu').addEventListener('pointermove',e=>{ const b=e.target.closest('button'); if(b&&!b.disabled&&+b.dataset.i!==menu.idx){ menu.idx=+b.dataset.i; renderMenu(); } });

const toastQ=[]; let toastBusy=false;
function toast(text,kind){ toastQ.push({text,kind}); if(!toastBusy) nextToast(); }
function nextToast(){ const it=toastQ.shift(); const el=$('#toast'); if(!it){ toastBusy=false; el.hidden=true; return; } toastBusy=true; el.className=it.kind||''; el.textContent=L(it.text); el.hidden=true; void el.offsetWidth; el.hidden=false; setTimeout(nextToast,2200); }
function banner(text,ms=1700){ return new Promise(res=>{ const el=$('#banner'); el.textContent=L(text); el.hidden=false; setTimeout(()=>{ el.hidden=true; res(); },ms); }); }
function hudShow(v){ $('#hud').hidden=!v; }
function dayStr(){ return LANG==='th'?`วันที่ ${Math.min(G.day,G.maxDays)}/${G.maxDays}`:`Day ${Math.min(G.day,G.maxDays)}/${G.maxDays}`; }
function hud(){ $('#hud .where').textContent=`${L(ISLANDS[G.island].name)} · ${dayStr()} · ${L(SLOTS[G.slot])}`; $('#hud .money').textContent=`${fmt(G.money)} VT`; }
function flashMoney(){ const el=$('#hud .money'); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }

const fade={a:1,from:1,to:1,t:0,dur:1,res:null};
function fadeTo(to,ms=500){ return new Promise(res=>{ Object.assign(fade,{from:fade.a,to,t:0,dur:ms/1000,res}); }); }
function fadeUpdate(dt){ if(fade.res||fade.a!==fade.to){ fade.t+=dt; const q=Math.min(1,fade.t/fade.dur); fade.a=lerp(fade.from,fade.to,q); if(q>=1&&fade.res){ const r=fade.res; fade.res=null; r(); } } }
function fadeDraw(){ if(fade.a<=0) return; if(fade.a>=1){ R(0,0,W,H,'#080a10'); return; } ctx.fillStyle='#080a10'; for(let y=0;y<H;y+=2) for(let x=0;x<W;x+=2){ if(BAYER[((y>>1)&3)*4+((x>>1)&3)]<fade.a) ctx.fillRect(x,y,2,2); } }

let panelOpen=false;
function goalText(){
  if(!G.flags.pita) return t('ไปบ้านของ Luna ทางตะวันตกของเมือง (เดินตามถนนใหญ่ไปทางซ้าย)','Visit Luna\'s home west of town (follow the main road left).');
  const left=PIECES.filter(p=>!G.pieces[p.id]).map(p=>L(ISLANDS[p.isl].name));
  if(G.day>=G.maxDays-1&&G.island!=='efate') return t('ใกล้วันกลับแล้ว! กลับ Efate ให้ทันก่อนเช้าวันที่ 16','Almost time to fly home! Get back to Efate before the morning of Day 16.');
  if(left.length) return t(`ตามหาชิ้นส่วนภาพวาดทรายที่เหลือบนเกาะ: ${left.join(', ')} แล้วกลับมาเล่าให้คุณยาย Pita ฟัง`,`Find the remaining sand drawing pieces on: ${left.join(', ')}. Then come back and tell Grandma Pita.`);
  if(G.island!=='efate') return t('ได้ครบทุกชิ้นแล้ว! กลับ Efate ไปหาคุณยาย Pita','You have every piece! Head back to Efate to see Grandma Pita.');
  return t('คุยกับ Luna เมื่อพร้อมจะจบการเดินทาง','Talk to Luna when you are ready to end your journey.');
}
function openPanel(){ panelOpen=true; renderPanel(); $('#panel').hidden=false; sfx.sel(); }
function closePanel(){ panelOpen=false; $('#panel').hidden=true; sfx.back(); }
function renderPanel(){ const el=$('#panel');
  const nP=PIECES.filter(p=>G.pieces[p.id]).length, nS=Object.keys(G.stamps).length;
  const groups=ISL_ORDER.map(id=>`<div style="font-size:.8em;margin:.4em 0 .2em;color:#5a5244">${G.visited[id]?'●':'○'} ${esc(L(ISLANDS[id].name))}</div><div class="stamps">${STAMPS.filter(s=>s.isl===id).map(s=>`<div class="stamp${G.stamps[s.id]?' got':''}"><canvas width="10" height="10" data-ico="${s.id}"></canvas><span>${esc(L(s.name))}</span></div>`).join('')}</div>`).join('');
  el.innerHTML=`<button class="close" type="button" id="pClose">${LANG==='th'?'ปิด':'Close'}</button>
  <h2>${esc(LANG==='th'?`สมุดเดินทางของ ${G.name||'...'}`:`${G.name||'...'}'s Travel Journal`)}</h2>
  <div>${esc(dayStr())} · ${esc(L(SLOTS[G.slot]))} · <b>${fmt(G.money)} VT</b></div>
  <p class="goal">${esc(L(goalText()))}</p>
  <h3>${LANG==='th'?`ภาพวาดทราย ${nP}/${PIECES.length}`:`Sand drawing ${nP}/${PIECES.length}`}</h3>
  <div class="pieces"><canvas width="56" height="56" id="pSand"></canvas><ul class="plist">${PIECES.map(p=>`<li class="${G.pieces[p.id]?'':'no'}">${esc(L(p.name))}</li>`).join('')}</ul></div>
  <h3>${LANG==='th'?`แสตมป์ ${nS}/${STAMPS.length}`:`Stamps ${nS}/${STAMPS.length}`}</h3>${groups}
  <h3>${LANG==='th'?`เรื่องเล่าลับ ${secretCount()}/6`:`Secret stories ${secretCount()}/6`}</h3>
  <ul class="plist">${SECRETS.map(s=>`<li class="${G.secrets&&G.secrets[s.id]?'':'no'}">${G.secrets&&G.secrets[s.id]?esc(L(s.title)):'??? '+(G.visited[s.isl]?`<small>(${esc(L(ISLANDS[s.isl].name))}: ${esc(L(s.hint))})</small>`:`<small>(${esc(L(ISLANDS[s.isl].name))})</small>`)}</li>`).join('')}</ul>
  <h3>${LANG==='th'?`คำ Bislama ${Object.keys(G.words).length}/${Object.keys(WORDS).length}`:`Bislama words ${Object.keys(G.words).length}/${Object.keys(WORDS).length}`}</h3>
  ${Object.keys(G.words).length?`<dl class="words">${Object.keys(G.words).map(k=>`<dt>${esc(WORDS[k].w)}</dt><dd>${esc(L(WORDS[k].m))}</dd>`).join('')}</dl>`:`<p style="margin:0;color:#7b715d">${LANG==='th'?'ยังไม่มี ลองคุยกับคนบนเกาะดูสิ':'None yet. Talk to people on the islands.'}</p>`}
  <h3>${LANG==='th'?'ตั้งค่า':'Settings'}</h3>
  <div class="set"><button type="button" data-l="th" class="${LANG==='th'?'on':''}">ภาษาไทย</button><button type="button" data-l="en" class="${LANG==='en'?'on':''}">English</button><button type="button" id="pMusic">${musicOn?'♪ ON':'♪ OFF'}</button></div>`;
  el.querySelectorAll('canvas[data-ico]').forEach(c=>drawIcon(c.getContext('2d'),c.dataset.ico,0,0,1,!G.stamps[c.dataset.ico]));
  el.querySelector('#pSand').getContext('2d').drawImage(sandCanvas(56,56,false),0,0);
  el.querySelector('#pClose').onclick=closePanel;
  el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>setLang(b.dataset.l));
  el.querySelector('#pMusic').onclick=()=>{ musicOn=!musicOn; $('#btnMusic').textContent=musicOn?'♪ ON':'♪ OFF'; renderPanel(); };
}
function panelUpdate(){ if(consume('menu')||consume('b')) closePanel(); if(keys.down) $('#panel').scrollTop+=6; if(keys.up) $('#panel').scrollTop-=6; consume('a'); }

let nameRes=null;
function askName(){ return new Promise(res=>{ nameRes=res; $('#nameUI').hidden=false; const i=$('#nameIn'); i.value=''; setTimeout(()=>i.focus(),50); }); }
function submitName(){ if(!nameRes) return; const v=$('#nameIn').value.trim().slice(0,12)||(LANG==='th'?'นักเดินทาง':'Traveller'); $('#nameUI').hidden=true; $('#nameIn').blur(); const r=nameRes; nameRes=null; sfx.sel(); r(v); }
$('#nameOk').addEventListener('click',submitName);
$('#nameIn').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); submitName(); } e.stopPropagation(); });

const uiOpen=()=>dlg.open||menu.open||panelOpen||!!nameRes;
function applyLang(){ document.documentElement.lang=LANG; document.querySelectorAll('[data-th]').forEach(e=>{ const v=e.dataset[LANG]; if(v) e.textContent=v; });
  $('.keys').innerHTML=LANG==='th'?'เดิน <kbd>ลูกศร</kbd>/<kbd>WASD</kbd> · คุย/ตกลง <kbd>Z</kbd>/<kbd>Enter</kbd> · ย้อนกลับ/วิ่ง <kbd>X</kbd>/<kbd>Shift</kbd> · สมุดเดินทาง <kbd>M</kbd> · บนมือถือใช้ปุ่มบนเครื่อง':'Move <kbd>Arrows</kbd>/<kbd>WASD</kbd> · Talk/OK <kbd>Z</kbd>/<kbd>Enter</kbd> · Back/Run <kbd>X</kbd>/<kbd>Shift</kbd> · Journal <kbd>M</kbd> · On phones, use the buttons';
  $('#btnLang').textContent=LANG==='th'?'TH ▸ EN':'EN ▸ TH'; }
function setLang(l){ LANG=l; applyLang(); if(dlg.open&&dlg.cur){ const full=dlg.shown>=dlg.segs.length; dlg.segs=graphemes(L(dlg.cur.t)); dlg.shown=full?dlg.segs.length:Math.min(dlg.shown,dlg.segs.length); renderDlg(); } if(menu.open) renderMenu(); if(panelOpen) renderPanel(); if(!$('#hud').hidden) hud(); if(!$('#cardModal').hidden) showCard(); }

/* ---------------- game helpers ---------------- */
function save(){ try{ G.px=P.x; G.py=P.y; G.dir=P.dir; localStorage.setItem(SAVE_KEY,JSON.stringify(G)); }catch(e){} }
function loadSave(peek){ try{ const s=localStorage.getItem(SAVE_KEY); if(!s) return null; const o=JSON.parse(s); if(!o||o.ended||!o.name) return null; if(!peek) G=Object.assign(freshG(),o); return o; }catch(e){ return null; } }
function learnWord(id){ if(G.words[id]) return; G.words[id]=1; const w=WORDS[id]; toast(t(`คำใหม่! ${w.w} = ${w.m.th}`,`New word! ${w.w} = ${w.m.en}`)); sfx.word(); }
function getStamp(id){ if(G.stamps[id]) return false; G.stamps[id]=1; burst(W/2,40,'#ffd84d',24,true); const s=STAMPS.find(x=>x.id===id); toast(t(`ได้แสตมป์! ${s.name.th}`,`Stamp collected! ${s.name.en}`),'stamp'); sfx.stamp(); return true; }
function getPiece(id){ if(G.pieces[id]) return; G.pieces[id]=1; burst(W/2,60,'#f3dfae',36,true); const p=PIECES.find(x=>x.id===id); toast(t(`ชิ้นส่วนภาพวาดทราย: ${p.name.th}`,`Sand drawing piece: ${p.name.en}`),'stamp'); sfx.stamp(); }
function memory(m){ G.memories.push(m); }
function spend(c){ G.money-=c; G.spent+=c; hud(); flashMoney(); }
function money(delta){ if(delta<0){ const d=Math.min(G.money,-delta); G.money-=d; G.spent+=d; toast(t(`-${fmt(d)} VT`,`-${fmt(d)} VT`),'minus'); sfx.lose(); } else { G.money+=delta; G.earned+=delta; toast(t(`+${fmt(delta)} VT`,`+${fmt(delta)} VT`),'plus'); sfx.coin(); } hud(); flashMoney(); }
function passTime(n=1){ G.slot=Math.min(3,G.slot+n); G.rain=false; hud(); save(); }
const NIGHT=S1(null,`ดึกแล้ว ทุกที่ปิดหมด กลับไปที่พักเพื่อนอนดีกว่า`,`It's late and everything is closed. Head back to your lodging and sleep.`);
async function needSlot(allowed,wrong){ if(G.slot>=3){ await say(NIGHT); return false; } if(!allowed.includes(G.slot)){ await say(wrong); return false; } return true; }
async function pay(cost,title,sub){ if(G.money<cost){ await say(S1(null,`เงินไม่พอ ต้องใช้ ${fmt(cost)} VT แต่มีอยู่ ${fmt(G.money)} VT`,`Not enough money. It costs ${fmt(cost)} VT and you have ${fmt(G.money)} VT.`)); return false; }
  const c=await choose([{label:cost?t(`จ่าย ${fmt(cost)} VT`,`Pay ${fmt(cost)} VT`):t('ไปเลย (ฟรี)','Go (free)'),sub:sub||t('ใช้เวลา 1 ช่วงของวัน','Takes one part of the day')},{label:t('ไว้ก่อน','Not now')}],{title}); if(c!==0) return false; if(cost) spend(cost); return true; }
async function scenePlay(make){ await fadeTo(1,400); hudShow(false); let done; const pr=new Promise(res=>done=res); setScene(make(done)); await fadeTo(0,400); const r=await pr; await fadeTo(1,300); setScene(MapScene); hudShow(true); hud(); await fadeTo(0,400); return r; }
async function lodging(cost,host,title){
  if(cost>0&&G.money<cost){ await say(S1(host,`เงินไม่พอเหรอ ไม่เป็นไร คืนนี้พักฟรี ช่วยงานบ้านนิดหน่อยก็พอ`,`Short on money? No worries, stay tonight for free. Just help out with a few chores.`)); G.flags.helped=true; await sleepNow(); return; }
  const c=await choose([{label:cost?t(`นอนพัก · ${fmt(cost)} VT`,`Sleep · ${fmt(cost)} VT`):t('นอนพัก (ฟรี)','Sleep (free)'),sub:t('ข้ามไปเช้าวันถัดไป','Skip to the next morning')},{label:t('ยังไม่นอน','Not yet')}],{title});
  if(c===0){ if(cost) spend(cost); await sleepNow(); }
}

/* ---------------- random money events ---------------- */
const EVENTS=[
  {id:'note',w:3,run:async()=>{ await say(S1(null,`มีธนบัตร 1,000 วาตูตกอยู่ข้างทาง...`,`A 1,000 vatu note is lying by the path...`));
    const c=await choose([{label:t('ตามหาเจ้าของ','Look for the owner')},{label:t('เก็บไว้เอง','Keep it')}],{cancel:false,title:t('จะทำยังไงดี?','What will you do?')});
    if(c===0){ await say(S1(null,`ป้าคนหนึ่งวิ่งมาด้วยความโล่งใจ ขอบคุณยกใหญ่ แล้วยัดมะม่วงใส่มือมาสามลูก`,`A relieved auntie hurries over, thanks you again and again, and presses three mangoes into your hands.`)); G.karma++; memory(t('คืนเงินให้ป้าที่ทำตก','Returned a lost note to its owner')); }
    else { money(1000); await say(S1(null,`...รู้สึกแปลกๆ อยู่นิดหน่อย`,`...It feels a little strange.`)); } }},
  {id:'photo',w:2,cond:()=>G.photo>=2,run:async()=>{ await say(S1(null,`นักท่องเที่ยวคนหนึ่งเห็นรูปลาวาในกล้องของคุณ แล้วขอซื้อไปทำโปสเตอร์`,`A tourist sees the lava shot on your camera and wants to buy it for a poster.`));
    const c=await choose([{label:t('ขาย 3,000 VT','Sell for 3,000 VT')},{label:t('เก็บไว้เป็นความทรงจำ','Keep it as a memory')}],{cancel:false}); if(c===0) money(3000); else await say(S1(null,`บางอย่างก็ไม่ขาย`,`Some things aren't for sale.`)); }},
  {id:'fisher',w:2,cond:()=>G.slot<2,run:async()=>{ await say(S1(null,`ชาวประมงกำลังลากอวนขึ้นฝั่ง ตะโกนเรียกให้ช่วย`,`Fishermen are hauling a net onto the beach and call out for a hand.`));
    const c=await choose([{label:t('ช่วยลาก!','Help pull!')},{label:t('ขอตัวก่อน','Excuse yourself')}],{cancel:false});
    if(c===0){ await say(S1(null,`ฮึบ! อวนเต็มไปด้วยปลา พวกเขาแบ่งค่าแรงให้ด้วย`,`Heave! The net is full of fish, and they share some of the takings with you.`)); money(1500); memory(t('ช่วยชาวประมงลากอวน','Helped fishermen haul a net')); } }},
  {id:'rain',w:2,cond:()=>G.slot<2,run:async()=>{ G.rain=true; await say(S1(null,`ฝนเขตร้อนเทลงมาแบบไม่ทันตั้งตัว!`,`A tropical downpour arrives out of nowhere!`));
    const c=await choose([{label:t('ซื้อเสื้อกันฝน 800 VT','Buy a poncho for 800 VT')},{label:t('ช่างมัน เปียกก็เปียก','Whatever, get wet')}],{cancel:false});
    if(c===0) money(-800); else { await say(S1(null,`เปียกโชกทั้งตัว ...แต่สนุกดีนะ`,`Soaked to the bone... but it's kind of fun.`)); memory(t('เดินตากฝนเขตร้อนทั้งตัว','Danced through a tropical downpour')); } }},
  {id:'phone',w:1,run:async()=>{ await say(S1(null,`มือถือลื่นหล่นลงพื้นหิน! จอร้าวเป็นใยแมงมุม`,`Your phone slips onto the rocks! The screen cracks like a spider web.`));
    const c=await choose([{label:t('ซ่อมที่ร้านในเมือง 2,000 VT','Fix it in town for 2,000 VT')},{label:t('ใช้ต่อไปแบบร้าวๆ','Live with it')}],{cancel:false}); if(c===0) money(-2000); else memory(t('ถ่ายรูปทั้งทริปด้วยจอร้าว','Shot the whole trip on a cracked screen')); }},
  {id:'boss',w:3,cond:()=>G.slot<2,run:async()=>{ await say(S1('boss',`[ข้อความ] {name} ช่วยแก้สไลด์ประชุมด่วนหน่อย! ให้ค่าโอทีนะ`,`[Message] {name}, I need you to fix the meeting slides. Urgent! I'll pay overtime.`));
    const c=await choose([{label:t('ทำงานหนึ่งช่วง (+6,000 VT)','Work for a while (+6,000 VT)'),sub:t('เสียเวลา 1 ช่วงของวัน','Uses one part of the day')},{label:t('ตอบว่า "สัญญาณไม่ดีครับ/ค่ะ"','Reply: "Bad signal here!"')},{label:t('ปิดเครื่อง','Turn off the phone')}],{cancel:false});
    if(c===0){ money(6000); passTime(1); await say(S1(null,`นั่งทำสไลด์ในร้านกาแฟริมทะเล... อย่างน้อยวิวก็สวย`,`You fix slides in a seaside café... at least the view is nice.`)); }
    else if(c===1) await say(S1('boss',`[ข้อความ] ...แต่ข้อความนี้ส่งถึงนะ`,`[Message] ...and yet this message arrived just fine.`));
    else { await say(S1(null,`ความเงียบช่างงดงาม`,`Silence is beautiful.`)); memory(t('ปิดมือถือเพื่อฟังเสียงคลื่น','Switched off the phone to hear the waves')); } }},
  {id:'school',w:2,run:async()=>{ await say(S1(null,`เด็กๆ ถือกล่องรับบริจาคเพื่อซื้อหนังสือให้ห้องสมุดโรงเรียน`,`Kids are collecting donations to buy books for their school library.`));
    const c=await choose([{label:t('บริจาค 1,000 VT','Donate 1,000 VT')},{label:t('ยิ้มให้แล้วเดินต่อ','Smile and walk on')}],{cancel:false});
    if(c===0){ money(-1000); G.karma++; await say(S1('kid2',`Tankyu tumas! ขอบคุณมากเลย!`,`Tankyu tumas! Thank you so much!`)); memory(t('บริจาคหนังสือให้โรงเรียนบนเกาะ','Donated books to an island school')); } }},
  {id:'mosquito',w:1,cond:()=>G.slot>=1,run:async()=>{ await say(S1(null,`ยุงฝูงใหญ่บุก! ตบกันมือเป็นระวิง`,`A cloud of mosquitoes attacks! You're slapping like crazy.`));
    const c=await choose([{label:t('ซื้อยากันยุง 500 VT','Buy repellent for 500 VT')},{label:t('ทนเอา','Tough it out')}],{cancel:false}); if(c===0) money(-500); else await say(S1(null,`คันยิบๆ ไปทั้งคืน`,`Itchy all night long.`)); }},
  {id:'contest',w:2,cond:()=>G.slot<2,run:async()=>{ await say(S1(null,`มีการแข่งปอกมะพร้าว ผู้ชนะได้รางวัล 2,500 VT!`,`There's a coconut-husking contest. The winner gets 2,500 VT!`));
    const c=await choose([{label:t('ลงแข่ง!','Join in!')},{label:t('ยืนเชียร์','Just cheer')}],{cancel:false});
    if(c===0){ if(rnd()<.45){ await say(S1(null,`ไม่น่าเชื่อ! ชนะแบบเฉียดฉิว ทุกคนปรบมือให้`,`Unbelievable! You win by a hair, and everyone cheers.`)); money(2500); memory(t('ชนะการแข่งปอกมะพร้าว','Won a coconut-husking contest')); }
      else { await say(S1(null,`แพ้ให้คุณยายอายุ 70 แบบขาดลอย ฮ่าๆ`,`You lose badly to a 70-year-old granny. Ha!`)); memory(t('แพ้คุณยายแข่งปอกมะพร้าว','Lost a coconut contest to a granny')); } } }},
  {id:'atm',w:1,run:async()=>{ await say(S1(null,`ไปกดเงินที่ตู้ ATM ...ค่าธรรมเนียมแลกเงินต่างประเทศเพียบ`,`You withdraw cash at an ATM... and the foreign exchange fees bite.`)); money(-1200); }},
  {id:'band',w:2,cond:()=>G.slot>=1,run:async()=>{ await say(S1(null,`วงสตริงแบนด์เล่นกีตาร์กับกลองไม้อยู่ใต้ต้นไม้ เพลงเพราะจนต้องหยุดฟัง`,`A string band plays guitar and wooden drums under a tree. You have to stop and listen.`));
    const c=await choose([{label:t('ให้ทิป 300 VT','Tip 300 VT')},{label:t('ปรบมือให้','Applaud')}],{cancel:false}); if(c===0){ money(-300); G.karma++; } memory(t('ฟังวงสตริงแบนด์ใต้ต้นไม้','Listened to a string band under a tree')); }},
  {id:'ride',w:2,cond:()=>G.slot<2,run:async()=>{ await say(S1(null,`รถกระบะคันหนึ่งจอดให้ติดรถฟรี ลมเย็นๆ ตีหน้า`,`A pickup truck stops and offers you a free ride. Cool wind on your face.`),S1(null,`คนขับยื่นกล้วยให้ด้วย ...โชคดีจริงๆ`,`The driver hands you a banana too. Lucky day.`)); memory(t('นั่งท้ายรถกระบะกับชาวบ้าน','Rode in the back of a pickup with locals')); }},
  {id:'souvenir',w:2,run:async()=>{ await say(S1(null,`มีคนขายตะกร้าสานใบเตยสวยมาก ราคา 1,500 VT`,`Someone is selling a beautiful woven pandanus basket for 1,500 VT.`));
    const c=await choose([{label:t('ซื้อเป็นของฝาก','Buy it as a gift')},{label:t('ไม่เป็นไร ขอบคุณ','No thanks')}],{cancel:false}); if(c===0){ money(-1500); memory(t('ซื้อตะกร้าสานฝากคนที่บ้าน','Bought a woven basket for family')); } }},
  {id:'luckyshell',w:1,run:async()=>{ await say(S1(null,`เจอเปลือกหอยเบี้ยสวยๆ บนหาด นักสะสมคนหนึ่งขอแลกด้วยเงิน`,`You find a pretty cowrie shell. A collector offers to buy it.`)); const c=await choose([{label:t('ขาย 800 VT','Sell for 800 VT')},{label:t('เก็บไว้','Keep it')}],{cancel:false}); if(c===0) money(800); else memory(t('เก็บเปลือกหอยเบี้ยไว้เป็นเครื่องราง','Kept a cowrie shell as a charm')); }},
];
async function randomEvent(kind){
  if(window.__noEvents&&kind!=='t') return;
  const pool=EVENTS.filter(e=>(!e.cond||e.cond())&&(G.evSeen[e.id]||0)<(e.id==='boss'?3:1));
  if(!pool.length) return;
  let sum=pool.reduce((a,e)=>a+e.w,0), r=rnd()*sum, ev=pool[0]; for(const e of pool){ r-=e.w; if(r<=0){ ev=e; break; } }
  G.evSeen[ev.id]=(G.evSeen[ev.id]||0)+1; G.evKey=G.day*4+G.slot; G.lastEvStep=G.steps;
  await ev.run(); save();
}
