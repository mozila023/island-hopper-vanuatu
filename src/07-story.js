/* ---------------- Efate ---------------- */
async function arrival(){
  await say(S1('luna',`Halo! {name}! มาถึงจนได้!`,`Halo, {name}! You finally made it!`),
    S1('luna',`"Halo" แปลว่าสวัสดีในภาษา Bislama ภาษากลางของพวกเรา`,`"Halo" means hello in Bislama, the language we all share.`));
  learnWord('halo');
  await say(S1('luna',`วานูอาตูมี 83 เกาะ พูดกันกว่า 100 ภาษา แต่ทุกคนเข้าใจ Bislama`,`Vanuatu has 83 islands and more than 100 languages, but everyone understands Bislama.`),
    S1('luna',`นี่ ของขวัญต้อนรับ สมุดเดินทาง ได้ลองอะไรใหม่ก็เก็บแสตมป์ไว้นะ`,`Here, a welcome gift: a travel journal. Collect a stamp for every new experience.`),
    S1(null,`ได้รับสมุดเดินทาง! กดปุ่ม "สมุด" หรือ M เพื่อดูเป้าหมาย แสตมป์ และคำศัพท์`,`You got the Travel Journal! Press JOURNAL (or M) to check your goal, stamps and words.`),
    S1('luna',`มีเวลา 15 วัน งบ 150,000 วาตู ทุกกิจกรรมกินเวลาหนึ่งช่วงของวัน วางแผนดีๆ นะ`,`You have 15 days and 150,000 vatu. Each activity takes one part of the day, so plan well.`),
    S1('luna',`เครื่องบินเร็วแต่แพง เรือถูกแต่ต้องค้างคืนบนเรือ ส่วนระหว่างทางก็อาจเจอเรื่องเซอร์ไพรส์ได้ตลอด`,`Planes are fast but pricey. Boats are cheap but take the night. And surprises can pop up anywhere.`),
    S1('luna',`อ้อ คุณตา Kalo เคยบอกว่าทุกเกาะมี "เรื่องเล่าลับ" ที่ผู้เฒ่าจะเล่าตอนพลบค่ำ ถ้าเห็นแสงระยิบตอนค่ำ ลองเข้าไปดูนะ`,`Oh, Grandpa Kalo used to say every island has a "secret story" the elders tell after dusk. If you see a glimmer in the evening, go and look.`),
    S1('luna',`บ้านเราอยู่ทางตะวันตกของเมือง เดินตามถนนใหญ่ไปทางซ้ายนะ คุณยายอยากเจอมาก`,`My home is west of town. Follow the main road to the left. Grandma can't wait to meet you.`));
  G.flags.met=true; await fadeTo(1,300); repopulate(); await fadeTo(0,300); save();
}
async function talkLuna(){
  if(!G.flags.met){ await arrival(); return; }
  if(!G.flags.pita){ await pitaIntro(); return; }
  const items=[{label:t('คุยเล่น','Chat')},{label:t('ขอคำแนะนำหน่อย','Any tips?')}];
  const heart=!G.flags.lunaTalk&&G.day>=8; if(heart) items.push({label:t('ดูเหมือน Luna มีเรื่องกังวล','You seem worried, Luna')});
  items.push({label:t('ถึงเวลากลับบ้านแล้ว','I\'m ready to go home')},{label:t('ไม่มีอะไร','Nothing')});
  const c=await choose(items,{title:'Luna'}); const pick=c<0?null:items[c];
  if(!pick) return;
  if(c===0){ const facts=[
      S1('luna',`รู้มั้ย วานูอาตูเคยติดอันดับหนึ่งของ Happy Planet Index ด้วยนะ`,`Did you know Vanuatu once topped the Happy Planet Index?`),
      S1('luna',`บันจี้จัมพ์ได้แรงบันดาลใจจากพิธีกระโดดเถาวัลย์ Nagol บนเกาะ Pentecost`,`Bungee jumping was inspired by Nagol, the land-diving ritual on Pentecost.`),
      S1('luna',`ที่นี่มีภาษาทางการ 3 ภาษา Bislama อังกฤษ และฝรั่งเศส`,`We have three official languages: Bislama, English and French.`),
      S1('luna',`Laplap คืออาหารประจำชาติ มันขูดหรือกล้วยขูดราดกะทิ ห่อใบไม้แล้วอบบนหินร้อน`,`Laplap is our national dish: grated yam or banana with coconut cream, wrapped in leaves and baked on hot stones.`),
      S1('luna',`เราชอบทะเลมาก ตอนเด็กๆ คุณตา Kalo พาออกเรือบ่อยๆ`,`I love the sea. When I was little, Grandpa Kalo took me out on his boat all the time.`)];
    await say(facts[(G.day+G.slot+Object.keys(G.stamps).length)%facts.length]); }
  else if(c===1){ const left=PIECES.filter(p=>!G.pieces[p.id]);
    if(left.length) await say(S1('luna',`ยังขาดชิ้นส่วนจาก ${left.map(p=>L(ISLANDS[p.isl].name)).join(', ')} ลองบินจากสนามบินหรือนั่งเรือจากท่าเรือดูนะ`,`Pieces still missing from ${left.map(p=>L(ISLANDS[p.isl].name)).join(', ')}. Fly from the airport or take a boat from the wharf.`));
    else await say(S1('luna',`ได้ครบทุกชิ้นแล้ว! เก่งมาก ไปหาคุณยายสิ`,`You have every piece! Amazing. Go see Grandma.`)); }
  else if(heart&&c===2){ await lunaHeart(); }
  else if(pick.label.en&&pick.label.en.startsWith('I\'m ready')){ const k=await choose([{label:t('ใช่ จบทริปเลย','Yes, end the trip')},{label:t('ยังก่อน','Not yet')}],{title:t('จบการเดินทางตอนนี้เลยมั้ย?','End your journey now?')}); if(k===0) await finale(); }
}
async function lunaHeart(){
  await say(S1('luna',`{name} ...ขอเล่าอะไรให้ฟังหน่อยได้มั้ย`,`{name}... can I tell you something?`),
    S1('luna',`เราได้ทุนไปเรียนวิทยาศาสตร์ทางทะเลที่ฟิจิ อยากเรียนเรื่องปะการังมาตั้งแต่เด็ก`,`I got a scholarship to study marine science in Fiji. I've wanted to study coral reefs since I was a kid.`),
    S1('luna',`แต่ถ้าไป คุณยายก็ต้องอยู่คนเดียว ...คุณตาเองก็ออกทะเลไปทุกเกาะ จนแทบไม่ได้อยู่บ้าน`,`But if I go, Grandma will be alone... Grandpa sailed to every island too, and was hardly ever home.`),
    S1('luna',`{name} มาจากเมืองใหญ่ ...ถ้าเป็น {name} จะทำยังไง?`,`You came from a big city, {name}... what would you do?`));
  const c=await choose([{label:t('ไปเถอะ โลกกว้างรออยู่','Go. The world is waiting')},{label:t('ทำตามหัวใจตัวเอง','Follow your heart')},{label:t('อยู่ใกล้คุณยายก็ดีนะ','Staying close to Grandma is good too')}],{cancel:false,title:t('ตอบ Luna','Answer Luna')});
  G.flags.lunaAdvice=['go','heart','stay'][c]; G.flags.lunaTalk=true;
  const rep=[S1('luna',`...จริงด้วย ถ้าไม่ไปตอนนี้ คงเสียใจไปตลอด`,`...You're right. If I don't go now, I'll regret it forever.`),S1('luna',`หัวใจเหรอ ...หัวใจเราอยู่ทั้งในทะเลและที่บ้าน ขอคิดอีกนิดนะ`,`My heart? ...It lives in the sea and at home. Let me think a little more.`),S1('luna',`อืม ...ที่นี่ก็มีแนวปะการังให้ดูแลเหมือนกันนะ`,`Hmm... there are reefs to look after right here, too.`)][c];
  await say(rep,S1('luna',`ขอบคุณที่ฟังนะ {name}`,`Thank you for listening, {name}.`)); memory(t('ฟัง Luna เล่าความฝัน','Heard about Luna\'s dream')); save();
  if(G.island==='santo'){ await fadeTo(1,300); repopulate(); await fadeTo(0,300); }
}
const KALO=[
  null,
  [S1('pita',`ภาพนี้คุณตา Kalo สามีของยายเป็นคนเริ่มวาด เขาเป็นกะลาสีเรือสินค้า แล่นเรือไปทุกเกาะ`,`Kalo, my husband, began this drawing. He was a cargo-ship sailor who sailed to every island.`)],
  [S1('pita',`ทุกครั้งที่ขึ้นฝั่งเกาะใหม่ ตาจะส่งเรื่องเล่ากลับมาให้ยาย แต่จดหมายพวกนั้นหายไปตอนพายุไซโคลนเข้า`,`Each time he landed on a new island, he sent its story back to me. But those letters were lost in a cyclone.`),S1('pita',`ดีใจที่ผู้เฒ่าบนเกาะต่างๆ ยังจำเรื่องเล่าได้`,`I'm glad the island elders still remember the stories.`)],
  [S1('pita',`ตาเคยบอกว่า การเดินทางไม่ได้ทำให้เราไกลบ้าน แต่ทำให้รู้ว่าบ้านอยู่ตรงไหน`,`Kalo used to say travel doesn't take you away from home. It shows you where home is.`)],
  [S1('pita',`Luna เหมือนตามาก ชอบทะเล อยากออกไปดูโลก ...ยายกลัวว่าหลานจะไม่กลับมา`,`Luna is so like him. She loves the sea and wants to see the world... I'm afraid she won't come back.`)],
  [S1('pita',`แต่ยายเริ่มเข้าใจแล้ว คนที่รักเกาะจะกลับมาเสมอ เหมือนเส้นในภาพที่วนกลับมาจุดเดิม`,`But I'm starting to understand. People who love the islands always come back, like this line that returns to where it began.`)],
  [S1('pita',`ครบแล้ว... เหลือแค่เส้นสุดท้ายที่ตาไม่เคยได้วาด "เส้นกลับบ้าน"`,`It's complete... except the last line Kalo never got to draw: "the way home".`),S1('pita',`ก่อนเธอกลับ ยายอยากให้เธอเป็นคนวาดเส้นนั้นเองนะ`,`Before you leave, I want you to draw that line yourself.`)],
];
async function pitaIntro(){
  await say(S1('luna',`มาแล้ว! คุณยาย นี่ไง {name} เพื่อนทางจดหมายของเรา`,`You made it! Grandma, this is {name}, my pen pal.`),
    S1('pita',`อ้อ เพื่อนจากเมืองไกลของ Luna ยินดีต้อนรับจ้ะ`,`Ah, Luna's friend from the faraway city. Welcome, dear.`),
    S1('pita',`ชาวเกาะของเราวาดรูปบนทรายเพื่อเล่าเรื่องและส่งข้อความ ลากเส้นเดียวต่อเนื่อง ไม่ยกนิ้วขึ้นเลย`,`Our people draw in the sand to tell stories and send messages. One continuous line, never lifting the finger.`),
    S1('pita',`UNESCO ยกให้การวาดทรายของวานูอาตูเป็นมรดกทางวัฒนธรรมของมนุษยชาติด้วยนะ`,`UNESCO recognises Vanuatu sand drawing as cultural heritage of humanity.`),
    S1('pita',`ภาพนี้ชื่อ "เส้นทางของนักเดินทาง" แต่ยังไม่สมบูรณ์ ชิ้นส่วนที่เหลือซ่อนอยู่ในเรื่องเล่าของ 5 เกาะ`,`This one is called "The Traveller's Path". It isn't finished. The missing parts hide in the stories of five islands.`),
    S1('pita',`เรื่องเล่าไม่ได้อยู่ในหนังสือ มันอยู่กับผู้คน ไปฟังพวกเขาสิ`,`Stories don't live in books. They live in people. Go and listen.`),
    S1('pita',`เริ่มจากตรงนี้ ชิ้นแรกคือ "จุดเริ่มต้น"`,`Begin here. The first piece is "The Beginning".`));
  getPiece('begin'); G.kaloPart=1; await say(KALO[1]);
  await say(S1('luna',`Tanna มีภูเขาไฟ Santo มีน้ำสีฟ้า Pentecost มีคนกระโดดหอ Ambrym มีกลองยักษ์ Malekula มีเต่าทะเล ...ไปให้ครบนะ!`,`Tanna has the volcano, Santo the blue water, Pentecost the tower divers, Ambrym the giant drums, Malekula the sea turtles... Visit them all!`),
    S1('luna',`กลับมาเล่าให้คุณยายฟังบ้างนะ ทุกชิ้นที่ได้ คุณยายจะวาดต่อให้`,`Come back and tell Grandma now and then. She'll draw in every piece you bring.`),
    S1('luna',`นอนที่บ้านเราได้ฟรี แค่เคาะประตู`,`You can sleep at our place for free. Just knock on the door.`));
  G.flags.pita=true; save();
}
async function talkPita(){
  if(!G.flags.pita){ await pitaIntro(); return; }
  const n=PIECES.filter(p=>G.pieces[p.id]).length;
  if(n>G.kaloPart){ await say(S1('pita',`ได้ชิ้นส่วนใหม่มาเหรอ! มา ยายจะวาดต่อให้`,`You brought new pieces! Come, let me draw them in.`)); while(G.kaloPart<n){ G.kaloPart++; await say(KALO[G.kaloPart]); } for(const k in sandCache) delete sandCache[k]; save(); return; }
  await say(S1('pita',n<PIECES.length?`ตอนนี้มี ${n} จาก ${PIECES.length} ชิ้น ค่อยๆ ไปนะ Smol smol`:`ครบทุกชิ้นแล้ว รอวันสุดท้ายนะ`,n<PIECES.length?`You have ${n} of ${PIECES.length} pieces. Take your time. Smol smol.`:`Every piece is here. Wait for the last day.`));
}
async function lookDrawing(){ const n=PIECES.filter(p=>G.pieces[p.id]).length; await say(S1(null,`ภาพวาดทรายของคุณยาย "เส้นทางของนักเดินทาง" (${n}/${PIECES.length} ชิ้น)`,`Grandma's sand drawing, "The Traveller's Path" (${n}/${PIECES.length} pieces).`)); }
async function doorLuna(){
  if(!G.flags.pita){ await say(S1(null,`ก๊อกๆ ...ไม่มีใครตอบ ลองคุยกับ Luna หรือคุณยายที่ลานหน้าบ้าน`,`Knock knock... No answer. Talk to Luna or Grandma in the yard.`)); return; }
  await lodging(0,'luna',t('บ้านของ Luna','Luna\'s home'));
}
async function talkDriver(){ await say(S1('driver',`Gud moning! ต้องการแท็กซี่มั้ย?`,`Gud moning! Need a taxi?`),S1('driver',`ล้อเล่นน่า เมืองเล็กนิดเดียว เดินเที่ยวสนุกกว่า ตลาดอยู่ริมถนนใหญ่ ท่าเรืออยู่สุดถนนทางตะวันออก`,`Just kidding. The town is tiny, walking is more fun. The market is on the main road and the wharf is at the east end.`),S1('driver',`"Gud moning" แปลว่าอรุณสวัสดิ์นะ`,`"Gud moning" means good morning.`)); learnWord('gudmoning'); }
async function talkKid(){ await say(S1('kid',`Solwota! Solwota!`,`Solwota! Solwota!`),S1(null,`(เด็กชี้ไปที่ทะเล)`,`(The kid points at the sea.)`),S1('kid',`"Solwota" แปลว่าทะเล! ไปรษณีย์ใต้น้ำอยู่ปลายสะพานไม้นั่นไง ต้องดำน้ำลงไปส่งนะ`,`"Solwota" means the sea! The underwater post office is at the end of that pier. You have to dive down to post!`)); learnWord('solwota'); }
async function talkVendor(){ await say(S1('vendor',`แวะตลาดก่อนสิ! Laplap ของป้าอร่อยที่สุดใน Port Vila`,`Come into the market! My laplap is the best in Port Vila.`),S1('vendor',`แม่ค้าหลายคนมาจากหมู่บ้านไกลๆ บางคนนอนค้างที่แผงเลยนะ`,`Many of us come from faraway villages. Some even sleep at their stalls.`)); }
async function talkElder(){ if(G.slot===2){ await nakamal(); return; } if(G.slot>=3){ await say(NIGHT); return; } await say(S1('elder',`นากามาลจะเปิดตอนพลบค่ำ ตอนนี้ยังเร็วไป`,`The nakamal opens at dusk. It's still too early.`),S1('elder',`กลับมาตอนเย็นนะ แล้วจะได้ลองคาวา`,`Come back this evening and try some kava.`)); }
async function market(){
  if(G.slot>=3){ await say(S1(null,`ตลาดเงียบแล้ว แม่ค้ากำลังหลับอยู่ข้างแผง`,`The market is quiet. The mamas are asleep beside their stalls.`)); return; }
  const c=await choose([{label:t('Laplap · 500 VT','Laplap · 500 VT'),sub:t('อาหารประจำชาติ','The national dish')},{label:t('มะพร้าวสด · 200 VT','Fresh coconut · 200 VT')},{label:t('เดินดูเฉยๆ','Just looking')}],{title:t('ตลาด Port Vila','Port Vila Market')});
  if(c<0) return; if(c===2){ await say(S1(null,`กองผลไม้สูงเป็นภูเขา ทั้งมะละกอ กล้วย และผักที่ไม่เคยเห็นมาก่อน`,`Fruit piled like mountains: papaya, bananas and vegetables you've never seen.`)); return; }
  const cost=c===0?500:200; if(G.money<cost){ await say(S1(null,`เงินไม่พอ`,`Not enough money.`)); return; }
  spend(cost);
  if(c===0){ await say(S1(null,`Laplap หอมกะทิ เนื้อนุ่มเหนียว ห่อใบไม้มาอุ่นๆ`,`The laplap is soft and chewy, rich with coconut cream, still warm in its leaf.`)); memory(t('ชิม Laplap ที่ตลาด','Tasted laplap at the market')); }
  else { await say(S1(null,`แม่ค้าใช้มีดสับมะพร้าวทีเดียวเปิด เย็นชื่นใจ!`,`The mama cracks the coconut with one swing. Ice cold and sweet!`)); memory(t('ดื่มมะพร้าวสดที่ Port Vila','Fresh coconut in Port Vila')); }
  await say(S1('vendor',`Tankyu tumas! แปลว่าขอบคุณมากจ้ะ`,`Tankyu tumas! That means thank you very much.`)); learnWord('tankyu');
  if(getStamp('market')) passTime(1);
}
async function mele(){
  if(G.stamps.mele){ await say(S1(null,`น้ำตก Mele ยังฟ้าใสเหมือนเดิม`,`Mele Cascades is as blue as ever.`)); return; }
  if(!await needSlot([0,1],S1(null,`น้ำตกปิดตอนเย็น กลับมาพรุ่งนี้นะ`,`The cascades close in the evening. Come back tomorrow.`))) return;
  if(!await pay(2000,t('น้ำตก Mele · ค่าเข้า','Mele Cascades · entry'))) return;
  await fadeTo(1,300); await wait(250); await fadeTo(0,300);
  await say(S1(null,`น้ำตกขั้นบันไดสีฟ้าใสไหลลดหลั่นผ่านป่า คุณลงไปแช่ในแอ่งน้ำเย็นฉ่ำ`,`Turquoise terraces tumble down through the jungle. You slip into a cool pool.`),S1(null,`เสียงนกกับเสียงน้ำ ทำให้ลืมอีเมลที่ค้างไว้ไปเลย`,`Birdsong and rushing water. You forget all about your unread emails.`));
  getStamp('mele'); memory(t('แช่น้ำที่น้ำตก Mele','Swam at Mele Cascades')); passTime(1);
}
async function postOffice(){
  if(G.stamps.post){ await say(S1(null,`ตู้ไปรษณีย์ยังรออยู่ใต้น้ำลึกราว 3 เมตร`,`The postbox still waits about 3 metres down.`)); return; }
  if(!await needSlot([0,1],S1(null,`มืดเกินไปที่จะดำน้ำแล้ว ไปรษณีย์ใต้น้ำเปิดตอนกลางวัน`,`It's too dark to dive. The underwater post office opens in daylight.`))) return;
  if(!await pay(1500,t('ไปรษณีย์ใต้น้ำ · โปสการ์ดกันน้ำ','Underwater Post · waterproof postcard'))) return;
  const who=await choose([{label:t('ครอบครัว','My family')},{label:t('ตัวเองในอนาคต','My future self')},{label:t('หัวหน้าที่ออฟฟิศ','My boss')}],{title:t('ส่งโปสการ์ดถึงใคร?','Who is the postcard for?'),cancel:false});
  await say(S1(null,`ไปรษณีย์ตั้งอยู่ใต้น้ำลึกราว 3 เมตร ในเขตอนุรักษ์ทางทะเลรอบเกาะ Hideaway ว่ายลงไปให้ถึงตู้ก่อนหมดลม!`,`The post office sits about 3 metres down in the marine reserve around Hideaway Island. Reach the box before you run out of breath!`),S1(null,`ใช้ปุ่มทิศทางเพื่อว่ายน้ำ`,`Use the arrows to swim.`));
  await scenePlay(res=>SwimScene(res,'post'));
  const msg=[t(`"ที่นี่สวยมาก คิดถึงทุกคน"`,`"It's beautiful here. Miss you all."`),t(`"อย่าลืมพักผ่อนบ้างนะ ตัวเรา"`,`"Remember to rest, future me."`),t(`"ขอลาเพิ่มอีกสักวันได้มั้ย"`,`"Could I take one more day off, please?"`)][Math.max(0,who)];
  await say(S1(null,`โปสการ์ดลงตู้เรียบร้อย ข้อความ: ${msg.th}`,`Card posted. It says: ${msg.en}`));
  getStamp('post'); memory(t('ส่งโปสการ์ดจากใต้ทะเล','Posted a card from under the sea')); passTime(1);
}
async function nakamal(){
  if(G.slot>=3){ await say(NIGHT); return; }
  if(G.slot<2){ await say(S1(null,`นากามาลยังไม่เปิด จะเปิดตอนพลบค่ำ`,`The nakamal isn't open yet. It opens at dusk.`)); return; }
  if(!await pay(200,t('นากามาล · คาวา 1 กะลา','Nakamal · one shell of kava'))) return;
  await say(S1('elder',`คาวาทำจากรากพืช ดื่มรวดเดียวจากกะลามะพร้าว แล้วนั่งเงียบๆ ฟังเสียงกลางคืน`,`Kava is made from a plant root. Drink the shell in one go, then sit quietly and listen to the night.`));
  wobble=3.2; await wait(2600);
  await say(S1(null,`ปากชาๆ นิดหน่อย ใจสงบลงอย่างประหลาด...`,`Your lips tingle a little. Your mind goes strangely calm...`),S1('elder',`ที่นี่เรียกว่า "Nakamal" ลานที่คนมานั่งคุยและดื่มคาวาด้วยกัน`,`We call this place a "nakamal": where people gather to talk and drink kava.`));
  learnWord('nakamal'); G.kava++; getStamp('kava'); memory(t('ดื่มคาวาที่นากามาลยามค่ำ','Kava at a nakamal at dusk')); passTime(1);
}

/* ---------------- Tanna ---------------- */
async function talkDriver2(){ await say(S1('driver2',`Olsem wanem? แปลว่าสบายดีมั้ย ยินดีต้อนรับสู่ Tanna!`,`Olsem wanem? That means how are you. Welcome to Tanna!`),S1('driver2',`ภูเขาไฟอยู่ทางตะวันออก ทัวร์ออกตอนเย็น หมู่บ้านอยู่ตรงกลางเกาะ บังกะโลอยู่ริมทะเล`,`The volcano is to the east and tours leave in the evening. The village is in the middle, the bungalow is by the sea.`)); learnWord('olsem'); }
async function talkKid2(){ await say(S1('kid2',`Mi glad tumas! มีคนมาเที่ยวบ้านเรา ดีใจจัง!`,`Mi glad tumas! Someone came to visit us!`),S1('kid2',`"Mi glad tumas" แปลว่าฉันดีใจมาก`,`"Mi glad tumas" means I'm very happy.`)); learnWord('glad'); }
async function talkWoman(){ await say(S1('woman',`ชีวิตแบบ Kastom คือการใช้ชีวิตตามวิถีของบรรพบุรุษ เราปลูกเผือกปลูกมัน และแบ่งปันกัน`,`Kastom life means living the way our ancestors did. We grow taro and yam, and we share.`)); }
async function talkWoman2(){ await say(S1('woman2',`ระวังเถ้าภูเขาไฟเข้าตานะ ลมพัดมาทางนี้บ่อย`,`Mind the volcanic ash in your eyes. The wind often blows it this way.`)); }
async function villageHut(){ await say(S1(null,`บ้านของชาวบ้าน เข้าไปโดยไม่ได้รับเชิญคงไม่ดี`,`Someone's home. Better not go in uninvited.`)); }
async function talkChief(){
  if(G.stamps.dance){ await say(S1('chief',`ขอบคุณที่มาเต้นกับเรา ผืนดินจำเสียงเท้าของเธอได้แล้ว`,`Thank you for dancing with us. The land remembers your footsteps now.`)); return; }
  await say(S1('chief',`ยินดีต้อนรับสู่หมู่บ้าน Kastom ของเรา`,`Welcome to our kastom village.`),S1('chief',`ระบำของเราเล่าเรื่องของบรรพบุรุษ ทุกจังหวะเท้าคือการขอบคุณผืนดิน`,`Our dances tell the stories of our ancestors. Every stomp is a thank you to the land.`));
  if(!await needSlot([0,1],S1('chief',`ค่ำแล้ว พวกเราจะเต้นกันอีกทีพรุ่งนี้กลางวันนะ`,`It's getting dark. We'll dance again tomorrow in daylight.`))) return;
  if(!await pay(3000,t('ชมระบำ Kastom','Watch the kastom dance'))) return;
  await say(S1(null,`(กด A เพื่อจบการชมได้)`,`(Press A to finish watching.)`));
  await scenePlay(res=>DanceScene(res,'kastom'));
  await say(S1('chief',`เป็นยังไงบ้าง เสียงเท้าดังไปถึงภูเขาไฟเลยนะ`,`How was it? Our feet can be heard all the way to the volcano.`));
  getStamp('dance'); memory(t('ชมระบำ Kastom ที่ Tanna','Watched a kastom dance on Tanna')); passTime(1);
}
async function talkOld(){
  if(!G.stamps.banyan){ await say(S1('old',`ต้นไทรต้นนี้อายุหลายร้อยปี ว่ากันว่าเป็นหนึ่งในต้นไทรที่ใหญ่ที่สุดในโลก`,`This banyan is hundreds of years old. People say it's one of the biggest in the world.`),S1('old',`รากของมันห้อยลงมาแล้วกลายเป็นลำต้นใหม่ เหมือนครอบครัวที่ขยายออกไป`,`Its roots drop down and become new trunks, like a family growing wider.`)); getStamp('banyan'); memory(t('นั่งใต้ต้นไทรยักษ์','Sat under the giant banyan')); }
  if(G.slot>=3){ await say(NIGHT); return; }
  if(G.slot===2){ await say(S1('old',`ค่ำแล้ว นั่งลงสิ คาวาของ Tanna แรงกว่าที่ไหนๆ นะ`,`Evening already. Sit down. Tanna kava is the strongest anywhere.`)); if(!await pay(200,t('คาวาใต้ต้นไทร','Kava under the banyan'))) return; wobble=4; await wait(3000); await say(S1(null,`โลกหมุนช้าลง เสียงภูเขาไฟดังมาเบาๆ ไกลๆ`,`The world slows down. The volcano rumbles softly in the distance.`)); G.kava++; getStamp('kava'); memory(t('ดื่มคาวาใต้ต้นไทรที่ Tanna','Kava under the banyan on Tanna')); passTime(1); }
  else await say(S1('old',`ตอนเย็นแวะมาดื่มคาวาด้วยกันนะ`,`Come back in the evening and share some kava.`));
}
async function talkGuide(){
  if(G.stamps.yasur){ await say(S1('guide',`Yasur ปะทุต่อเนื่องมาหลายร้อยปีแล้ว ว่ากันว่ากัปตันคุกเห็นแสงของมันจากทะเลเมื่อปี 1774`,`Yasur has been erupting for centuries. They say Captain Cook saw its glow from the sea in 1774.`)); return; }
  await say(S1('guide',`จะไปภูเขาไฟ Yasur ใช่มั้ย เป็นภูเขาไฟที่ยังมีพลังที่เข้าถึงง่ายที่สุดแห่งหนึ่งของโลกเลย`,`Off to Mount Yasur? It's one of the most accessible active volcanoes in the world.`));
  if(!await needSlot([2],S1('guide',`ทัวร์ออกตอนเย็น ลาวาสวยที่สุดตอนฟ้ามืด กลับมาตอนเย็นนะ`,`Tours leave in the evening. The lava looks best after dark. Come back this evening.`))) return;
  if(!await pay(10000,t('ทัวร์ภูเขาไฟ Yasur','Mount Yasur tour'))) return;
  await say(S1(null,`รถกระบะพาข้ามทุ่งเถ้าสีดำ แล้วเดินขึ้นไปที่ขอบปล่อง...`,`A truck crosses the black ash plain, then you climb to the crater rim...`),S1('guide',`ถึงแล้ว ฟังเสียงมันหายใจสิ`,`We're here. Listen to it breathe.`),S1(null,`ถ่ายรูปได้ 3 ครั้ง กด A ตอนลาวาพุ่งขึ้นสูงสุด!`,`You have 3 shots. Press A when the lava reaches its peak!`));
  const best=await scenePlay(res=>VolcanoScene(res));
  G.photo=best?best.s:0; try{ if(best&&best.c) G.photoData=best.c.toDataURL('image/png'); }catch(e){}
  const stars=['☆☆☆','★☆☆','★★☆','★★★'][G.photo];
  await say(S1(null,G.photo>=3?`ภาพที่ดีที่สุด ${stars} ลาวาพุ่งเต็มเฟรม! สุดยอด`:G.photo>=1?`ภาพที่ดีที่สุด ${stars} ได้ลาวามาด้วย!`:`ภาพที่ดีที่สุด ${stars} ...ได้แต่ควัน แต่ความทรงจำชัดเจน`,G.photo>=3?`Best shot ${stars}. Lava fills the frame! Amazing.`:G.photo>=1?`Best shot ${stars}. You caught the lava!`:`Best shot ${stars}. Just smoke... but the memory is clear.`));
  getStamp('yasur'); memory(t(`ยืนดูลาวาที่ขอบปล่อง Yasur ${stars}`,`Watched lava from Yasur's rim ${stars}`));
  await say(S1('guide',`คนโบราณบอกว่าไฟของ Yasur สอนให้เราเคารพสิ่งที่ยิ่งใหญ่กว่าตัวเรา`,`The old people say Yasur's fire teaches us to respect what is greater than ourselves.`),
    S1('guide',`เมื่อก่อนมีกะลาสีชื่อ Kalo มานั่งฟังเรื่องนี้กับพ่อผม เขาวาดมันลงบนทรายด้วย`,`Long ago a sailor named Kalo sat and heard this story with my father. He drew it in the sand.`),
    S1('guide',`ผู้เฒ่าฝากนี่มาให้ บอกว่าคุณยาย Pita จะรู้ว่าต้องทำยังไง`,`The elders asked me to give you this. They said Grandma Pita would know what to do.`));
  getPiece('fire'); passTime(1);
}

/* ---------------- Espiritu Santo ---------------- */
async function talkSantoMama(){ await say(S1('woman2',`Santo คือเกาะที่ใหญ่ที่สุดในวานูอาตู Luganville ก็เป็นเมืองใหญ่อันดับสองรองจาก Port Vila`,`Santo is the biggest island in Vanuatu, and Luganville is the second largest town after Port Vila.`),S1('woman2',`ช็อกโกแลตกับกาแฟจากที่นี่ Nambawan! แปลว่าที่หนึ่ง สุดยอดไปเลย`,`The chocolate and coffee from here are nambawan! That means number one, the best.`)); learnWord('nambawan'); }
async function santoStore(){
  const c=await choose([{label:t('ช็อกโกแลต Santo · 600 VT','Santo chocolate · 600 VT')},{label:t('เสื้อลายดอก · 2,000 VT','Island shirt · 2,000 VT')},{label:t('ดูเฉยๆ','Just browsing')}],{title:t('ร้านค้า Luganville','Luganville store')});
  if(c===0&&G.money>=600){ spend(600); await say(S1('store',`ช็อกโกแลตจากโกโก้ที่ปลูกบน Santo เองนะ`,`Chocolate made from cocoa grown right here on Santo.`)); memory(t('ชิมช็อกโกแลตจากโกโก้ Santo','Tasted Santo-grown chocolate')); }
  else if(c===1&&G.money>=2000){ spend(2000); await say(S1('store',`เหมาะกับคุณมาก! ใส่ไปเที่ยวได้ทุกเกาะ`,`Looks great on you! Wear it on every island.`)); memory(t('ซื้อเสื้อลายดอกที่ Luganville','Bought an island shirt in Luganville')); }
  else if(c===0||c===1) await say(S1(null,`เงินไม่พอ`,`Not enough money.`));
}
async function blueHole(){
  if(G.stamps.bluehole){ await say(S1('rose',`น้ำยังใสเหมือนเดิมนะ ว่ายให้สนุก`,`The water is as clear as ever. Enjoy the swim.`)); return; }
  await say(S1('rose',`ยินดีต้อนรับสู่ Blue Hole ของครอบครัวเรา`,`Welcome to our family's Blue Hole.`),S1('rose',`นี่คือตาน้ำจืดที่ผุดขึ้นจากใต้ดิน ใสจนเห็นก้นลึกหลายเมตร ค่าเข้าจะช่วยดูแลที่ดินตามประเพณีนะ`,`It's a freshwater spring rising from underground, clear enough to see metres down. The entry fee helps us look after the customary land.`));
  if(!await needSlot([0,1],S1('rose',`ค่ำแล้ว น้ำมืดเกินไป พรุ่งนี้มาใหม่นะ`,`It's dark now and the water is too black. Come back tomorrow.`))) return;
  if(!await pay(1500,t('Blue Hole · ค่าเข้า','Blue Hole · entry'))) return;
  await say(S1('rose',`ลองโหนเชือกแล้วกระโดดสิ! ปล่อยมือตอนเหวี่ยงไปข้างหน้าจะไปได้ไกล`,`Try the rope swing! Let go on the forward swing to fly far.`));
  const sc=await scenePlay(res=>SwingScene(res));
  await say(S1(null,sc>=3?`ตูม! พุ่งไปกลางบ่อเลย น้ำเย็นสดชื่นสุดๆ`:`จ๋อม! น้ำเย็นเฉียบ สีฟ้าสดจนเหมือนอยู่ในความฝัน`,sc>=3?`SPLASH! Right into the middle. The water is wonderfully cold.`:`Plop! Icy water, so blue it feels like a dream.`));
  getStamp('bluehole'); memory(t('โหนเชือกลง Blue Hole','Rope-swung into a Blue Hole')); passTime(1);
  await say(S1('rose',`ยายของฉันเล่าว่าน้ำใต้ดินเดินทางไกลมาก แต่สุดท้ายก็หาทางกลับสู่ทะเลได้เสมอ`,`My grandmother said underground water travels very far, but it always finds its way back to the sea.`),
    S1('rose',`เธอบอกว่ามีกะลาสีชื่อ Kalo มาฟังเรื่องนี้ แล้ววาดเกลียวน้ำลงบนทราย ...เอาไปเถอะ`,`She said a sailor named Kalo heard this story and drew a spiral of water in the sand... Take it.`));
  getPiece('water');
}
async function coolidge(){
  if(G.stamps.coolidge){ await say(S1('jimmy',`The Lady ยังรออยู่ที่เดิมนะ ฮ่าๆ`,`The Lady is still waiting down there, haha.`)); return; }
  await say(S1('jimmy',`SS President Coolidge เดิมเป็นเรือโดยสารหรู ถูกใช้ขนทหารในสงครามโลกครั้งที่ 2`,`The SS President Coolidge was a luxury liner turned troopship in World War II.`),
    S1('jimmy',`ปี 1942 ชนทุ่นระเบิดของฝ่ายเดียวกันตอนเข้าท่า ทหารกว่า 5,000 คนขึ้นฝั่งได้ เสียชีวิตเพียง 2 คน`,`In 1942 it hit friendly mines entering the harbour. Over 5,000 men got ashore. Only two died.`),
    S1('jimmy',`นักดำน้ำทั่วโลกมาตามหา "The Lady" รูปปั้นหญิงสาวในห้องโถงของเรือ ไปหาด้วยกันมั้ย?`,`Divers come from all over the world to find "The Lady", a statue in the ship's grand hall. Want to look for her?`));
  if(!await needSlot([0,1],S1('jimmy',`ดำน้ำได้เฉพาะตอนกลางวัน พรุ่งนี้เช้ามานะ`,`We only dive in daylight. Come back tomorrow morning.`))) return;
  if(!await pay(9000,t('ดำน้ำซากเรือ Coolidge','Coolidge wreck dive'))) return;
  await say(S1(null,`ว่ายลงไปหา The Lady ที่ช่องเปิดของซากเรือ ก่อนลมหมด!`,`Swim down to The Lady at the opening in the wreck before your air runs out!`));
  await scenePlay(res=>SwimScene(res,'wreck'));
  await say(S1('jimmy',`เจอแล้ว! ปะการังปกคลุมเรือทั้งลำ กลายเป็นบ้านของปลานับพัน`,`Found her! Coral covers the whole ship now. It's home to thousands of fish.`));
  getStamp('coolidge'); memory(t('ดำน้ำหา The Lady ในซากเรือ Coolidge','Found The Lady in the Coolidge wreck')); passTime(1);
}
async function champagne(){
  if(G.stamps.champagne){ await say(S1(null,`ทรายขาวยังนุ่มเหมือนแป้ง`,`The white sand is still soft as flour.`)); return; }
  if(!await needSlot([0,1,2],S1(null,``,``))) return;
  await say(S1(null,`หาดทรายขาวละเอียด น้ำใสเป็นสีฟ้าอ่อน บางช่วงมีฟองเล็กๆ ผุดขึ้นจากทราย คนเลยเรียกว่า Champagne Beach`,`Fine white sand and pale blue water. Tiny bubbles sometimes rise from the sand, so people call it Champagne Beach.`));
  getStamp('champagne'); memory(t('นอนเล่นที่ Champagne Beach','Lazed on Champagne Beach')); passTime(1);
}
async function mdp(){ await say(S1(null,`Million Dollar Point: หลังสงคราม กองทัพสหรัฐฯ ทิ้งรถและเครื่องจักรจำนวนมหาศาลลงทะเลตรงนี้`,`Million Dollar Point: after the war, the US military dumped huge amounts of vehicles and machinery into the sea right here.`),S1(null,`ตอนนี้กลายเป็นแนวปะการังที่ปลาอาศัยอยู่ จากเศษสงครามกลายเป็นบ้าน`,`Now it's a reef full of fish. War scrap turned into a home.`)); if(!G.flags.mdp){ G.flags.mdp=1; memory(t('ยืนดู Million Dollar Point','Visited Million Dollar Point')); } }

/* ---------------- Pentecost ---------------- */
async function talkPikinini(){ await say(S1('kid2',`Pikinini! พวกเราคือ Pikinini!`,`Pikinini! We're pikinini!`),S1('kid2',`"Pikinini" แปลว่าเด็ก วันนี้พี่ Moses จะกระโดดครั้งแรก ตื่นเต้นสุดๆ!`,`"Pikinini" means child. Today big brother Moses does his first dive. So exciting!`)); learnWord('pikinini'); }
async function yamGarden(){
  if(G.stamps.yam){ await say(S1('farmer',`มันเทศที่ปลูกไว้เริ่มแตกยอดแล้วนะ`,`The yams you planted are already sprouting.`)); return; }
  await say(S1('farmer',`มันเทศสำคัญมากสำหรับเกาะนี้ พิธี Nagol ก็จัดเพื่ออวยพรให้มันเทศปีนี้งอกงาม`,`Yams matter so much on this island. The Nagol is held to bless this year's yam harvest.`));
  if(!await needSlot([0,1],S1('farmer',`มืดแล้ว พรุ่งนี้มาช่วยปลูกนะ`,`It's dark. Come help plant tomorrow.`))) return;
  if(!await pay(0,t('ช่วยปลูกมันเทศ','Help plant yams'))) return;
  await fadeTo(1,300); await wait(300); await fadeTo(0,300);
  await say(S1(null,`ขุดดิน วางหัวมัน กลบดิน ...มือเปื้อนดินแต่ใจฟู`,`Dig, place the yam, cover it up... muddy hands, happy heart.`),S1('farmer',`Tankyu tumas! เอามันเทศหัวนี้ไปฝากคุณยายด้วยนะ`,`Tankyu tumas! Take this yam home for your grandma.`));
  getStamp('yam'); memory(t('ช่วยปลูกมันเทศที่ Pentecost','Planted yams on Pentecost')); passTime(1);
}
async function talkMoses(){
  if(G.stamps.nagol){ await say(S1('moses',`ผมทำได้! ขอบคุณที่ให้กำลังใจนะ Tata!`,`I did it! Thanks for cheering me on. Tata!`),S1('moses',`"Tata" แปลว่าบ๊ายบาย`,`"Tata" means bye.`)); learnWord('tata'); return; }
  if(G.flags.moses){ await say(S1('moses',`ไปบอกพ่อว่าผมพร้อมแล้ว`,`Go tell my father I'm ready.`)); return; }
  await say(S1('moses',`วันนี้ผมต้องกระโดดจากหอเป็นครั้งแรก ...ผมกลัว`,`Today I dive from the tower for the first time... I'm scared.`),S1('moses',`ถ้าเถาวัลย์ยาวเกินไป หัวจะกระแทกพื้น ถ้าสั้นไปก็จะเหวี่ยงกลับไปชนหอ`,`If the vine is too long, my head hits the ground. Too short, and I swing back into the tower.`));
  const c=await choose([{label:t('เชื่อมั่นในพ่อกับเถาวัลย์','Trust your father and the vines')},{label:t('กลัวได้ ไม่ผิดหรอก','It\'s okay to be scared')},{label:t('เราเองก็กลัวความสูงเหมือนกัน','I\'m scared of heights too')}],{cancel:false,title:t('ให้กำลังใจ Moses','Encourage Moses')});
  await say([S1('moses',`จริงด้วย พ่อเลือกเถาวัลย์เองกับมือ`,`You're right. My father picked every vine himself.`),S1('moses',`...ใช่ คนกล้าก็กลัวเป็น แต่ก็ยังกระโดด`,`...Yes. Brave people get scared too, and still jump.`),S1('moses',`ฮ่าๆ งั้นเรากลัวด้วยกัน แต่ผมจะกระโดดให้ดู!`,`Ha! Then let's be scared together. Watch me jump!`)][c]);
  G.flags.moses=true;
}
async function talkBule(){
  if(G.stamps.nagol){ await say(S1('bule',`Moses เป็นผู้ชายเต็มตัวแล้ว ขอบคุณนะ`,`Moses is a man now. Thank you.`)); return; }
  await say(S1('bule',`ยินดีต้อนรับสู่ Pentecost มาตรงฤดู Nagol พอดีเลย`,`Welcome to Pentecost. You've arrived right in the Nagol season.`),
    S1('bule',`ผู้ชายในหมู่บ้านสร้างหอไม้สูงหลายสิบเมตร แล้วกระโดดลงมาโดยมีเถาวัลย์ผูกข้อเท้าไว้`,`The men build a wooden tower tens of metres high, then dive off with vines tied to their ankles.`),
    S1('bule',`ยิ่งศีรษะเฉียดดินใกล้เท่าไหร่ มันเทศปีนี้ก็ยิ่งงอกงาม`,`The closer the head brushes the earth, the better this year's yams will grow.`));
  if(!G.flags.moses){ await say(S1('bule',`วันนี้ลูกชายข้า Moses จะกระโดดครั้งแรก แต่เขากลัว ...ช่วยไปคุยกับเขาหน่อยสิ`,`Today my son Moses makes his first dive, but he's afraid... Could you talk to him?`)); return; }
  if(!await needSlot([0,1],S1('bule',`พิธีจัดตอนกลางวัน พรุ่งนี้เช้ามาใหม่นะ`,`The dive happens in daylight. Come back tomorrow morning.`))) return;
  if(!await pay(6000,t('ชมพิธี Nagol','Watch the Nagol'),t('ค่าชมช่วยหมู่บ้าน · ใช้เวลา 1 ช่วง','Supports the village · takes one part of the day'))) return;
  await say(S1('bule',`ก่อนอื่น ช่วยข้ามัดเถาวัลย์ให้แน่นหน่อย 3 ปม`,`First, help me tie the vines tight. Three knots.`));
  const k=await scenePlay(res=>KnotScene(res));
  await say(S1('bule',k>=3?`แน่นหนาดีมาก! Moses ปลอดภัยแน่นอน`:`พอใช้ได้ ข้าจะมัดเสริมเอง`,k>=3?`Perfectly tight! Moses will be safe.`:`Good enough. I'll add a few knots myself.`),S1(null,`Moses ปีนขึ้นไปบนแท่น ชาวบ้านร้องเพลงและกระทืบเท้า...`,`Moses climbs to the platform. The villagers sing and stamp their feet...`));
  await scenePlay(res=>NagolScene(res));
  await say(S1('bule',`ตำนานเล่าว่าภรรยาคนหนึ่งหนีสามีขึ้นต้นไม้ แล้วผูกเถาวัลย์ที่ข้อเท้าก่อนกระโดด เธอรอด แต่สามีที่กระโดดตามไม่ได้ผูก`,`Legend says a wife fled her husband up a tree and tied vines to her ankles before jumping. She lived. Her husband jumped after her without them.`),
    S1('bule',`ตั้งแต่นั้นผู้ชายจึงฝึกกระโดดให้ชำนาญ ...กะลาสี Kalo ก็เคยมาดูพิธีนี้ เขาวาดเถาวัลย์ไว้บนทราย`,`Since then the men practise the dive. The sailor Kalo once watched this too, and drew the vine in the sand.`));
  getStamp('nagol'); getPiece('vine'); memory(t('ชม Moses กระโดด Nagol ครั้งแรก','Watched Moses\'s first Nagol dive')); passTime(1);
}

/* ---------------- Ambrym ---------------- */
async function talkYumi(){ await say(S1('woman',`บนเกาะนี้ ทุกงานพิธีเราทำด้วยกัน Yumi! แปลว่าพวกเราทุกคน`,`On this island, we do every ceremony together. Yumi! It means all of us.`)); learnWord('yumi'); }
async function tamtam(){
  if(G.stamps.tamtam){ await say(S1('willie',`จังหวะของเธอยังก้องอยู่ในหุบเขานะ`,`Your rhythm still echoes through the valley.`)); return; }
  await say(S1('willie',`Tamtam คือกลองไม้แกะสลักจากท่อนไม้ใหญ่ ใบหน้าบนกลองคือบรรพบุรุษ`,`A tamtam is a slit drum carved from a great log. The faces on it are our ancestors.`),S1('willie',`เมื่อก่อนใช้ตีส่งสัญญาณข้ามหุบเขา แต่ละจังหวะมีความหมาย อยากลองตีมั้ย?`,`Long ago we beat them to send messages across valleys. Each rhythm has a meaning. Want to try?`));
  if(!await needSlot([0,1,2],S1('willie',``,``))) return;
  if(!await pay(2000,t('เรียนตีกลอง Tamtam','Tamtam drumming lesson'))) return;
  const r=await scenePlay(res=>DrumScene(res));
  await say(S1('willie',r>=.8?`ยอดเยี่ยม! บรรพบุรุษคงได้ยินแน่`:r>=.5?`ดีมาก จังหวะเริ่มเข้าที่แล้ว`:`ไม่เป็นไร มือใหม่ทุกคนก็เป็นแบบนี้ Smol smol`,r>=.8?`Superb! The ancestors surely heard that.`:r>=.5?`Very good. You're finding the rhythm.`:`No worries, every beginner sounds like that. Smol smol.`));
  getStamp('tamtam'); memory(t(`ตีกลอง Tamtam ได้ ${Math.round(r*100)}%`,`Played the tamtam (${Math.round(r*100)}%)`)); passTime(1);
  await say(S1('willie',`ตอนข้ายังเด็ก มีกะลาสีชื่อ Kalo มาขอฟังเสียงกลอง เขาบอกว่าเสียงกลองคือหัวใจของเกาะ`,`When I was young, a sailor named Kalo asked to hear the drums. He said their sound was the island's heartbeat.`),S1('willie',`นี่คือลายกลองที่เขาวาดไว้ เอาไปให้ภรรยาเขาเถอะ`,`This is the drum pattern he drew. Take it to his wife.`));
  getPiece('drum');
}
async function romDance(){
  if(G.stamps.rom){ await say(S1('romchief',`หน้ากากของพวกเราจะถูกเก็บไว้เป็นความลับ ขอบคุณที่มาชมนะ`,`Our masks are kept secret. Thank you for watching.`)); return; }
  await say(S1('romchief',`ระบำ Rom ผู้เต้นจะสวมหน้ากากทรงกรวยสีสดกับชุดใบตองแห้ง`,`In the Rom dance, dancers wear bright cone-shaped masks and costumes of dried banana leaves.`),S1('romchief',`การทำหน้ากากต้องได้รับสิทธิ์ตามประเพณี ไม่ใช่ใครก็ทำได้`,`The right to make a mask must be earned through custom. Not just anyone may make one.`));
  if(!await needSlot([0,1],S1('romchief',`ระบำจัดตอนกลางวัน พรุ่งนี้มานะ`,`The dance is held in daylight. Come back tomorrow.`))) return;
  if(!await pay(4000,t('ชมระบำ Rom','Watch the Rom dance'))) return;
  await say(S1(null,`(กด A เพื่อจบการชมได้)`,`(Press A to finish watching.)`));
  await scenePlay(res=>DanceScene(res,'rom'));
  getStamp('rom'); memory(t('ชมระบำหน้ากาก Rom ที่ Ambrym','Watched the masked Rom dance on Ambrym')); passTime(1);
}
async function ambVolcano(){
  if(G.stamps.ambvolc){ await say(S1('guide2',`ภูเขาไฟวันนี้ยังส่งควันทักทายอยู่นะ`,`The volcanoes are still waving their smoke at us today.`)); return; }
  await say(S1('guide2',`Ambrym มีภูเขาไฟคู่ Marum กับ Benbow หลายปีก่อนเคยมีทะเลสาบลาวาเดือดอยู่ในปล่องด้วย`,`Ambrym has twin volcanoes, Marum and Benbow. Some years ago there were bubbling lava lakes in their craters.`),S1('guide2',`เส้นทางเดินข้ามทุ่งเถ้าไกลมาก ต้องออกแต่เช้า`,`The trail across the ash plain is long, so we must leave early.`));
  if(!await needSlot([0],S1('guide2',`สายไปแล้ว เมฆจะปิดยอด มาใหม่พรุ่งนี้เช้านะ`,`Too late. Clouds will cover the summit. Come back tomorrow morning.`))) return;
  if(!await pay(7000,t('เดินป่าชมภูเขาไฟคู่','Twin volcano trek'),t('ใช้เวลา 2 ช่วงของวัน','Takes two parts of the day'))) return;
  await scenePlay(res=>VolcViewScene(res));
  await say(S1(null,`ยืนบนทุ่งเถ้าสีดำ มองควันสองสายพวยพุ่งขึ้นฟ้า รู้สึกตัวเล็กนิดเดียว`,`Standing on the black ash plain, watching two plumes rise into the sky, you feel very small.`));
  getStamp('ambvolc'); memory(t('เดินข้ามทุ่งเถ้าไปดูภูเขาไฟคู่','Trekked to Ambrym\'s twin volcanoes')); passTime(2);
}

/* ---------------- Malekula ---------------- */
async function talkSchief(){ await say(S1('schief',`Malekula เป็นเกาะใหญ่อันดับสองของประเทศ บนเกาะเดียวพูดกันหลายสิบภาษา`,`Malekula is the country's second biggest island. Dozens of languages are spoken on it.`),S1('schief',`หมู่บ้านข้างๆ ห่างไปแค่ชั่วโมงเดียว ก็พูดคนละภาษากับเราแล้ว`,`The next village is an hour's walk away, and they speak a different language from us.`)); }
async function talkNini(){ await say(S1('nini',`จะรีบไปไหนล่ะ ที่นี่เราใช้ชีวิตแบบ Smol smol ค่อยๆ ไปทีละนิด`,`What's the hurry? Here we live smol smol: little by little.`)); learnWord('smolsmol'); }
async function canoeTrip(){
  if(G.stamps.canoe){ await say(S1('leiwia',`เต่าพวกนั้นคงจำเราได้แล้วนะ`,`I bet those turtles remember us now.`)); return; }
  await say(S1('leiwia',`Halo! ฉันชื่อ Leiwia พาเที่ยวหมู่เกาะ Maskelyne ด้วยเรือแคนูมีทุ่น ไปดูเต่าทะเลกันมั้ย?`,`Halo! I'm Leiwia. Want to paddle an outrigger canoe to the Maskelyne Islands and see sea turtles?`));
  if(!await needSlot([0,1],S1('leiwia',`มืดแล้ว เต่ากลับไปนอนแล้ว พรุ่งนี้มานะ`,`It's dark, the turtles are asleep. Come tomorrow.`))) return;
  if(!await pay(3000,t('พายเรือแคนูดูเต่า','Turtle canoe trip'))) return;
  await say(S1('leiwia',`พายสลับซ้ายขวานะ ซ้าย ขวา ซ้าย ขวา!`,`Paddle left and right in turn. Left, right, left, right!`));
  const tt=await scenePlay(res=>CanoeScene(res));
  await say(S1('leiwia',tt<16?`เร็วมาก! เต่าโผล่มาทักทายเลย`:`ถึงแล้ว! ดูสิ เต่าโผล่หัวขึ้นมาหายใจ`,tt<16?`So fast! The turtles came up to say hello.`:`We made it! Look, a turtle is coming up for air.`));
  getStamp('canoe'); memory(t('พายแคนูไปดูเต่าที่ Maskelyne','Paddled to see turtles in the Maskelynes')); passTime(1);
  await say(S1('leiwia',`ยายของฉันบอกว่าเต่าว่ายไปไกลแค่ไหน ก็จะกลับมาวางไข่ที่หาดที่มันเกิดเสมอ`,`My granny says no matter how far a turtle swims, it always returns to lay eggs on the beach where it was born.`),
    S1('leiwia',`ยายเคยวาดเต่าตัวนี้ให้กะลาสีชื่อ Kalo ดู ...ฝากไปให้คุณยาย Pita ด้วยนะ`,`She once drew this turtle for a sailor named Kalo... Please take it to Grandma Pita.`));
  getPiece('turtle');
}
async function clamGarden(){
  if(G.stamps.clam){ await say(S1(null,`หอยมือเสือยังอ้าปากรับแดดอยู่`,`The giant clams are still basking in the sun.`)); return; }
  await say(S1(null,`ชาวบ้านช่วยกันอนุรักษ์หอยมือเสือยักษ์ในเขตทะเลของหมู่บ้าน`,`The villagers protect giant clams in their marine area.`));
  if(!await needSlot([0,1],S1(null,`มืดเกินไปที่จะดำน้ำตื้นแล้ว`,`It's too dark to snorkel now.`))) return;
  if(!await pay(2000,t('ดำน้ำตื้นสวนหอยมือเสือ','Snorkel the giant clam garden'))) return;
  await fadeTo(1,300); await wait(300); await fadeTo(0,300);
  await say(S1(null,`หอยมือเสือตัวใหญ่กว่าอ่างล้างหน้า เนื้อสีม่วงฟ้าแวววาว พอเงาผ่านก็ค่อยๆ หุบปากช้าๆ`,`Clams bigger than a washbasin, with shimmering purple and blue lips that slowly close as your shadow passes.`));
  getStamp('clam'); memory(t('ดำน้ำดูหอยมือเสือยักษ์','Snorkelled with giant clams')); passTime(1);
}

/* ---------------- island arrivals ---------------- */
const ARRIVE={
  tanna:[S1(null,`อากาศมีกลิ่นกำมะถันจางๆ เสียงครืนดังมาจากทางตะวันออก ...นั่นคือ Yasur`,`The air smells faintly of sulphur. A low rumble rolls in from the east... That's Yasur.`),S1('luna',`[ข้อความ] อย่าเข้าใกล้ปากปล่องเกินไปนะ! ถ่ายรูปมาฝากด้วย`,`[Message] Don't get too close to the crater! Send me a photo.`)],
  santo:[S1(null,`Espiritu Santo เกาะที่ใหญ่ที่สุดของวานูอาตู ทะเลใสจนเห็นปลาจากบนฝั่ง`,`Espiritu Santo, Vanuatu's biggest island. The sea is so clear you can see fish from the shore.`),S1(null,`ช่วงสงครามโลกครั้งที่ 2 ที่นี่เคยเป็นฐานทัพใหญ่ของสหรัฐฯ`,`During World War II, this was a huge US military base.`),S1('luna',`[ข้อความ] ไปถึง Santo แล้วเหรอ! เราบินมาเยี่ยมญาติพอดี ไปเจอกันที่ Champagne Beach นะ`,`[Message] You're on Santo? I just flew in to visit my cousins. Meet me at Champagne Beach!`)],
  pentecost:[S1(null,`Pentecost เกาะยาวเรียวเขียวชอุ่ม ได้ยินเสียงตอกไม้ดังมาจากเนินเขา`,`Pentecost: long, narrow and green. You hear hammering from the hillside.`),S1('luna',`[ข้อความ] ห้ามขึ้นไปกระโดดเองนะ ฮ่าๆ แค่ไปดูก็พอ`,`[Message] Don't you dare climb that tower yourself, haha. Just watch.`)],
  ambrym:[S1(null,`Ambrym เกาะแห่งภูเขาไฟคู่ หาดทรายที่นี่เป็นสีดำเพราะเถ้าภูเขาไฟ`,`Ambrym, island of twin volcanoes. The beaches are black with volcanic ash.`),S1(null,`ผู้คนเรียกที่นี่ว่าเกาะแห่งเวทมนตร์ เพราะมีเรื่องเล่าลึกลับมากมาย`,`People call it the island of magic, for all its mysterious stories.`),S1('luna',`[ข้อความ] ฟังเสียงกลอง Tamtam ให้ได้นะ คุณตาชอบมาก`,`[Message] You have to hear the tamtam drums. Grandpa loved them.`)],
  malekula:[S1(null,`Malekula เกาะใหญ่อันดับสอง ป่าโกงกางทอดยาวไปตามชายฝั่ง`,`Malekula, the second biggest island. Mangroves line the coast.`),S1(null,`ทางใต้มีหมู่เกาะ Maskelyne ที่ชาวบ้านช่วยกันดูแลแนวปะการัง`,`To the south lie the Maskelyne Islands, where villagers look after the reefs together.`),S1('luna',`[ข้อความ] ถ้าเจอเต่าฝากบอกว่า Luna คิดถึงนะ`,`[Message] If you see the turtles, tell them Luna says hi.`)],
};
async function arriveIsland(id){
  if(G.flags['seen_'+id]) return; G.flags['seen_'+id]=1;
  G.chapter++; await banner(t(`บทที่ ${G.chapter} · ${ISLANDS[id].chap.th}`,`Chapter ${G.chapter} · ${ISLANDS[id].chap.en}`),2200);
  if(id==='santo') G.flags.lunaSanto=true;
  if(ARRIVE[id]) await say(ARRIVE[id]);
  if(id==='santo'&&!G.flags.lunaTalk) repopulate();
  save();
}
