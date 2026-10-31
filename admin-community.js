/* หลังบ้าน (admin.html) · Community — โพสต์ภายในองค์กร (1 พ.ย. 2569 · Figma หน้า 16 · หลังบ้าน app-cf/src/community.js)
 * กติกาผู้ใช้: โพสต์แบบ Facebook ไม่มีหัวข้อ · กระดานเดียวทุกบริษัท · เจ้าของแก้ได้ ลบไม่ได้ · ลบได้เฉพาะ admin · ปักหมุด/ล็อก/ย้ายหมวด = HR + admin
 * ทุกไฟล์ admin-*.js ใช้ชื่อร่วมกัน (global) และต้องโหลดตามลำดับใน admin.html (ไฟล์นี้อยู่ก่อน admin-org.js) */
'use strict';
var CB_UNREAD_DAYS=14;
function cbCat(id){var c=((A.cbB&&A.cbB.cats)||[]).filter(function(x){return x.id===id})[0];return c||{id:id,name:'ทั่วไป',color:'#5F5F5F'}}
function cbChip(id){var c=cbCat(id);return '<span class="cb-cat" style="--c:'+esc(c.color||'#5F5F5F')+'">'+esc(c.name)+'</span>'}
function cbWho(p){return p&&(p.nick||String(p.name||'').split(' ')[0])||'ไม่ทราบชื่อ'}
function cbAv(p,s){var n=String(p&&p.name||'?').split(' ');return av({id:p&&p.id||'',first_name:n[0]||'?',last_name:n[1]||''},s)}
function cbImg(id){return API.replace(/\/api$/,'')+'/cb/img/'+encodeURIComponent(id)}
/* เวลาแบบสั้น: เมื่อสักครู่ · 15 นาที · 2 ชม. · เมื่อวาน · 3 พ.ย. */
function cbAgo(t){var s=(Date.now()-t)/1000,d=new Date(t);if(s<60)return 'เมื่อสักครู่';if(s<3600)return Math.floor(s/60)+' นาที';if(s<86400)return Math.floor(s/3600)+' ชม.';if(s<172800)return 'เมื่อวาน';return d.getDate()+' '+DPS[d.getMonth()]+(d.getFullYear()!==new Date().getFullYear()?' '+String(d.getFullYear()+543).slice(-2):'')}
/* ข้อความ: ขึ้นบรรทัด + ลิงก์กดได้ (ไม่รับ HTML) */
function cbText(s){return esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g,'<br>')}
function cbBoot(force){if(A.cbBP&&!force)return A.cbBP;A.cbFail=0;A.cbBP=aCall('cbBoot').then(function(b){A.cbB=b;cbBadge(b.unread);return b}).catch(function(e){A.cbBP=null;A.cbFail=Date.now();throw e});return A.cbBP}
function cbBadge(n){A.cbUn=n||0;var a=$('.side a[data-nav="cb"]');if(!a)return;var c=a.querySelector('.cnt');if(!A.cbUn){if(c)c.remove();return}if(!c){c=document.createElement('span');c.className='cnt';a.appendChild(c)}c.textContent=A.cbUn}

/* ───────── รายการโพสต์ ───────── */
function vCb(){if(A.cbId)return vCbPost();var f=A.cbF||(A.cbF={cat:'',filter:'all',q:''}),cats=(A.cbB&&A.cbB.cats)||[];
  var chip=function(id,l){return '<button class="chip" data-cbcat="'+id+'" aria-pressed="'+(f.cat===id)+'">'+esc(l)+'</button>'};
  return '<div class="ph"><div><h1>Community</h1><div class="sub">พูดคุย สอบถาม แจ้งปัญหา · ทุกคนในบริษัทเห็นและช่วยกันตอบได้</div></div><span class="sp"></span>'+
   '<input type="search" id="cb-q" class="amp-in" placeholder="ค้นหาโพสต์ หรือข้อความในความคิดเห็น" value="'+esc(f.q)+'" aria-label="ค้นหา" style="min-width:260px">'+
   (A.cbB&&A.cbB.me.ro?'':'<button class="btn pri" id="cb-new">+ สร้างโพสต์</button>')+'</div>'+
   '<div class="cb-bar"><div class="chips">'+chip('','ทั้งหมด')+cats.map(function(c){return chip(c.id,c.name)}).join('')+'</div><span class="sp"></span>'+
   '<div class="segt">'+[['all','ล่าสุด'],['noreply','ยังไม่มีคนตอบ'],['mine','ของฉัน']].map(function(x){return '<button data-cbflt="'+x[0]+'" aria-pressed="'+(f.filter===x[0])+'">'+x[1]+'</button>'}).join('')+'</div></div>'+
   '<div class="cb-g"><section class="card cb-list" id="cb-list"><div class="loading"><span class="spin"></span></div></section><aside class="cb-side">'+
   '<section class="card cb-rule"><b>กติกาการใช้งาน</b><span>• ใช้ชื่อจริง · สุภาพ ไม่พาดพิงบุคคลภายนอก</span><span>• ห้ามโพสต์ข้อมูลส่วนตัว เลขบัญชี เงินเดือน</span><span>• แก้ข้อความของตัวเองได้ · ลบได้เฉพาะ admin</span></section></aside></div>'}
function bCb(){if(A.cbId)return bCbPost();var f=A.cbF;
  cbBoot().then(function(){if(A.view!=='cb'||A.cbId)return;if(!$('#cb-list .cb-row')&&$('.cb-bar .chips').children.length<3)render()}).catch(function(){});
  var load=function(more){var q={cat:f.cat,filter:f.filter,q:f.q};if(more)q.cursor=A.cbL.next;if(!more)$('#cb-list').innerHTML='<div class="loading"><span class="spin"></span></div>';
    aCall('cbList',q).then(function(r){if(more){A.cbL.items=A.cbL.items.concat(r.items);A.cbL.next=r.next}else A.cbL=r;drawCbList()}).catch(function(e){if($('#cb-list'))$('#cb-list').innerHTML='<div class="alert" style="margin:16px">'+esc(e.message)+'</div>'})};
  A.cbLoad=load;
  $$('[data-cbcat]').forEach(function(b){b.onclick=function(){f.cat=b.dataset.cbcat;$$('[data-cbcat]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});load()}});
  $$('[data-cbflt]').forEach(function(b){b.onclick=function(){f.filter=b.dataset.cbflt;$$('[data-cbflt]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});load()}});
  var qt;$('#cb-q').oninput=function(){var v=this.value;clearTimeout(qt);qt=setTimeout(function(){f.q=v.trim();load()},300)};
  if($('#cb-new'))$('#cb-new').onclick=function(){cbCompose()};
  load()}
function drawCbList(){var L=A.cbL,el=$('#cb-list');if(!el)return;
  if(!L.items.length){el.innerHTML='<div class="cb-empty">'+(A.cbF.q?'ไม่พบโพสต์ที่ตรงกับ “'+esc(A.cbF.q)+'”':'ยังไม่มีโพสต์ · เริ่มโพสต์แรกได้เลย')+'</div>';return}
  el.innerHTML=L.items.map(function(p){return '<button class="cb-row'+(p.pinned?' pin':'')+'" data-cbopen="'+p.id+'">'+cbAv(p.author,36)+'<span class="cb-mid"><span class="cb-top">'+(p.pinned?'<span class="cb-pin" title="ปักหมุด">📌</span>':'')+cbChip(p.cat)+
    (p.solved?'<span class="cb-sol">✓ มีคำตอบแล้ว</span>':'')+(p.locked?'<span class="cb-lock">ล็อกแล้ว</span>':'')+'</span><span class="cb-txt">'+esc(p.body)+'</span>'+(p.imgs.length?'<span class="cb-thumbs">'+p.imgs.slice(0,3).map(function(i){return '<img src="'+cbImg(i)+'" alt="" loading="lazy">'}).join('')+(p.imgs.length>3?'<i>+'+(p.imgs.length-3)+'</i>':'')+'</span>':'')+
    '<span class="cb-meta">'+esc(cbWho(p.author))+(p.author.pos?' · '+esc(p.author.pos):'')+' · '+cbAgo(p.created_at)+(p.edited?' · แก้ไขแล้ว':'')+'</span></span><span class="cb-r"><span class="cb-n">💬 '+p.replies+'</span>'+(p.last_by?'<span class="cb-last">ล่าสุด '+cbAgo(p.last_at)+' · '+esc(cbWho(p.last_by))+'</span>':'')+(p.unread?'<i class="cb-dot" title="มีความเคลื่อนไหวใหม่"></i>':'')+'</span></button>'}).join('')+
   (L.next?'<button class="cb-more" id="cb-more">แสดงเพิ่ม</button>':'');
  loadPhotos();
  $$('[data-cbopen]').forEach(function(b){b.onclick=function(){A.cbId=b.dataset.cbopen;A.cbP=null;fxArm('cb');render();scrollTo(0,0)}});
  if($('#cb-more'))$('#cb-more').onclick=function(){this.disabled=true;A.cbLoad(true)}}

/* ───────── อ่านโพสต์ + ความคิดเห็น ───────── */
function vCbPost(){return '<div class="ph"><div><div class="crumb"><a href="#" id="cb-back">Community</a> ›</div><h1 id="cb-h">โพสต์</h1></div><span class="sp"></span><span id="cb-act"></span></div><div class="cb-g"><div id="cb-post"><div class="loading"><span class="spin"></span></div></div><aside class="cb-side" id="cb-pside"></aside></div>'}
function bCbPost(){$('#cb-back').onclick=function(e){e.preventDefault();A.cbId=null;A.cbP=null;render();cbBoot(true)};
  cbBoot().catch(function(){});
  aCall('cbGet',{id:A.cbId}).then(function(d){A.cbP=d;A.cbReply=null;drawCbPost();cbBoot(true)}).catch(function(e){if($('#cb-post'))$('#cb-post').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})}
function cbImgs(ids){return ids&&ids.length?'<div class="cb-imgs n'+Math.min(ids.length,4)+'">'+ids.map(function(i){return '<a href="'+cbImg(i)+'" target="_blank" rel="noopener"><img src="'+cbImg(i)+'" alt="รูปแนบ" loading="lazy"></a>'}).join('')+'</div>':''}
function cbComment(c,d){if(c.deleted)return '<div class="cb-c del" id="c-'+c.id+'"><span class="cb-delx">ความคิดเห็นนี้ถูก admin ลบ</span></div>';
  var me=A.cbB&&A.cbB.me||{},best=d.post.solved_id===c.id;
  return '<div class="cb-c'+(best?' best':'')+'" id="c-'+c.id+'">'+(best?'<div class="cb-bestl">✓ คำตอบที่เจ้าของโพสต์เลือก</div>':'')+'<div class="cb-cr">'+cbAv(c.author,32)+'<div class="cb-cb"><div class="cb-bub"><b>'+esc(cbWho(c.author))+'</b>'+(c.author.pos?'<span class="faint"> '+esc(c.author.pos)+'</span>':'')+'<div class="cb-ct" data-cbbody="'+c.id+'">'+cbText(c.body)+'</div>'+cbImgs(c.imgs)+'</div>'+
    '<div class="cb-ca"><span class="faint">'+cbAgo(c.created_at)+(c.edited?' · แก้ไขแล้ว':'')+'</span>'+(d.can.comment?'<button class="lnk" data-cbrep="'+c.id+'">ตอบกลับ</button>':'')+(c.mine?'<button class="lnk" data-cbedc="'+c.id+'">แก้ไข</button>':'')+
    (d.can.solve&&!c.parent?'<button class="lnk" data-cbsol="'+(best?'':c.id)+'">'+(best?'ยกเลิกคำตอบที่เลือก':'เลือกเป็นคำตอบ')+'</button>':'')+(d.can.del?'<button class="lnk bad" data-cbdel="comment|'+c.id+'">ลบ</button>':'')+'</div></div></div></div>'}
function drawCbPost(){var d=A.cbP,p=d.post,el=$('#cb-post');if(!el)return;
  $('#cb-h').textContent=p.deleted?'โพสต์ที่ถูกลบ':'โพสต์ของ '+cbWho(p.author);
  var tops=d.comments.filter(function(c){return !c.parent}),kids={};d.comments.forEach(function(c){if(c.parent)(kids[c.parent]=kids[c.parent]||[]).push(c)});
  var rep=A.cbReply&&d.comments.filter(function(c){return c.id===A.cbReply})[0];
  el.innerHTML='<section class="card cb-p">'+(p.deleted?'<div class="cb-delx">โพสต์นี้ถูก admin ลบ (admin ยังเห็นในหน้านี้)</div>':'')+'<div class="cb-ph">'+cbAv(p.author,42)+'<div style="flex:1;min-width:0"><b>'+esc(p.author.name||'')+(p.author.nick?' ('+esc(p.author.nick)+')':'')+'</b><div class="faint">'+esc(p.author.pos||'')+(p.author.pos?' · ':'')+cbAgo(p.created_at)+(p.edited?' · แก้ไขแล้ว':'')+'</div></div>'+
    (p.pinned?'<span class="cb-pin">📌 ปักหมุดถึง '+esc(dTxt(dIso(new Date(p.pin_until))))+'</span>':'')+cbChip(p.cat)+(p.solved_id?'<span class="cb-sol">✓ มีคำตอบแล้ว</span>':'')+(p.locked?'<span class="cb-lock">ล็อกแล้ว</span>':'')+'</div>'+
    '<div class="cb-body" data-cbbody="post">'+cbText(p.body)+'</div>'+cbImgs(p.imgs)+'<div class="cb-pa"><span class="faint">'+p.replies+' ความคิดเห็น</span>'+(d.can.edit?'<button class="lnk" id="cb-edp">แก้ไขข้อความ</button>':'')+'</div></section>'+
   '<section class="card cb-cs"><h3>ความคิดเห็น ('+p.replies+')</h3>'+(tops.length?tops.map(function(c){return cbComment(c,d)+((kids[c.id]||[]).length?'<div class="cb-kids">'+kids[c.id].map(function(k){return cbComment(k,d)}).join('')+'</div>':'')}).join(''):'<div class="faint" style="padding:6px 0 4px">ยังไม่มีความคิดเห็น</div>')+
   (d.can.comment?'<div class="cb-box">'+(rep?'<div class="cb-repto">↳ กำลังตอบ '+esc(cbWho(rep.author))+' <button class="lnk" id="cb-repx">ยกเลิก</button></div>':'')+'<textarea id="cb-ct" rows="2" placeholder="เขียนความคิดเห็น…" maxlength="2000"></textarea><div class="cb-ups" id="cb-cups"></div>'+
     '<div class="cb-boxa"><label class="btn sm">🖼 แนบรูป<input type="file" accept="image/*" multiple id="cb-cf" class="vh"></label><span class="sp"></span><button class="btn pri" id="cb-send">ส่ง</button></div></div>':(p.locked?'<div class="faint" style="padding-top:8px">🔒 โพสต์นี้ถูกล็อก ตอบเพิ่มไม่ได้</div>':''))+'</section>';
  // ปุ่มด้านบน + เมนูผู้ดูแล
  var me=A.cbB&&A.cbB.me||{};
  $('#cb-act').innerHTML=d.can.mod&&!p.deleted?'<button class="btn" data-cbm="'+(p.pinned?'unpin':'pin')+'">'+(p.pinned?'ถอนหมุด':'📌 ปักหมุด')+'</button> <button class="btn" data-cbm="'+(p.locked?'unlock':'lock')+'">'+(p.locked?'ปลดล็อก':'🔒 ล็อก')+'</button> <button class="btn" data-cbm="move">ย้ายหมวด</button>'+(d.can.del?' <button class="btn bad" data-cbdel="post|'+p.id+'">ลบโพสต์</button>':''):'';
  $('#cb-pside').innerHTML='<section class="card cb-rule"><b>'+(d.can.edit?'เจ้าของโพสต์ทำได้':'ทุกคนทำได้')+'</b>'+(d.can.edit?'<span>• แก้ไขข้อความ (ขึ้นป้าย "แก้ไขแล้ว")</span><span>• เลือกคำตอบที่ถูกต้อง</span><span>• ลบไม่ได้ — แจ้ง admin ให้ลบ</span>':'<span>• ตอบกลับ / ตอบความคิดเห็น</span><span>• แนบรูปได้ 4 รูป</span><span>• พบเนื้อหาไม่เหมาะสม แจ้ง HR / admin</span>')+'</section>'+
    (me.mod?'<section class="card cb-rule"><b>ผู้ดูแล</b><span>• ปักหมุด · ล็อก · ย้ายหมวด = HR + admin</span><span>• ลบ = admin เท่านั้น (เก็บข้อมูลไว้ + Audit Log)</span></section>':'');
  loadPhotos();cbBindPost()}
function cbBindPost(){var d=A.cbP,p=d.post,ups=[];
  var reload=function(){return aCall('cbGet',{id:p.id}).then(function(x){A.cbP=x;drawCbPost()})};
  $$('[data-cbrep]').forEach(function(b){b.onclick=function(){A.cbReply=b.dataset.cbrep;drawCbPost();var t=$('#cb-ct');if(t){var c=d.comments.filter(function(x){return x.id===A.cbReply})[0];t.value='@'+cbWho(c.author)+' ';t.focus()}}});
  if($('#cb-repx'))$('#cb-repx').onclick=function(){A.cbReply=null;drawCbPost()};
  if($('#cb-cf'))$('#cb-cf').onchange=function(){cbUploadFiles(this,ups,$('#cb-cups'))};
  if($('#cb-send'))$('#cb-send').onclick=function(){var b=this,t=$('#cb-ct').value;if(!t.trim())return toast('พิมพ์ความคิดเห็นก่อน',1);if(ups.some(function(u){return !u.id}))return toast('รอรูปอัปโหลดเสร็จก่อน',1);busy(b,1);
    aCall('cbComment',{post_id:p.id,parent_id:A.cbReply||'',body:t,imgs:ups.map(function(u){return u.id})}).then(function(){A.cbReply=null;return reload()}).catch(function(e){busy(b,0);toast(e.message,1)})};
  if($('#cb-edp'))$('#cb-edp').onclick=function(){cbEdit('post',p.id,p.body,reload)};
  $$('[data-cbedc]').forEach(function(b){b.onclick=function(){var c=d.comments.filter(function(x){return x.id===b.dataset.cbedc})[0];cbEdit('comment',c.id,c.body,reload)}});
  $$('[data-cbsol]').forEach(function(b){b.onclick=function(){busy(b,1);aCall('cbSolve',{post_id:p.id,comment_id:b.dataset.cbsol}).then(reload).catch(function(e){busy(b,0);toast(e.message,1)})}});
  $$('[data-cbdel]').forEach(function(b){b.onclick=function(){var x=b.dataset.cbdel.split('|');
    ask({title:x[0]==='post'?'ลบโพสต์นี้?':'ลบความคิดเห็นนี้?',desc:'ซ่อนจากทุกคนทันที · ข้อมูลยังเก็บไว้ในระบบและบันทึกใน Audit Log',tone:'bad',icon:'del',buttons:[{k:'no',label:'ยกเลิก'},{k:'ok',label:'ลบ',tone:'bad'}]}).then(function(k){if(k!=='ok')return;
      aCall('cbDelete',{kind:x[0],id:x[1]}).then(function(){toast('ลบแล้ว');if(x[0]==='post'){A.cbId=null;A.cbP=null;render();cbBoot(true)}else reload()}).catch(function(e){toast(e.message,1)})})}});
  $$('[data-cbm]').forEach(function(b){b.onclick=function(){var a=b.dataset.cbm;
    if(a==='pin'){var def=dAdd(dIso(new Date()),7);drawer('ปักหมุดโพสต์','<label class="f"><span>ปักหมุดถึงวันที่</span><input type="date" id="cb-pin" value="'+def+'" min="'+dAdd(dIso(new Date()),1)+'"></label><div class="faint" style="font-size:12.5px">โพสต์ขึ้นบนสุดของรายการจนถึงวันนั้น (สูงสุด 1 ปี)</div>','<button class="btn pri" id="cb-pinok">ปักหมุด</button>');
      $('#cb-pinok').onclick=function(){var v=$('#cb-pin').value;if(!v)return;aCall('cbMod',{id:p.id,action:'pin',until:dObj(v).getTime()+86399000}).then(function(){closeD();toast('ปักหมุดแล้ว');reload()}).catch(function(e){toast(e.message,1)})};return}
    if(a==='move'){drawer('ย้ายหมวด','<label class="f"><span>หมวด</span><select id="cb-mv">'+A.cbB.cats.map(function(c){return '<option value="'+c.id+'"'+(c.id===p.cat?' selected':'')+'>'+esc(c.name)+'</option>'}).join('')+'</select></label>','<button class="btn pri" id="cb-mvok">ย้าย</button>');
      $('#cb-mvok').onclick=function(){aCall('cbMod',{id:p.id,action:'move',cat:$('#cb-mv').value}).then(function(){closeD();toast('ย้ายแล้ว');reload()}).catch(function(e){toast(e.message,1)})};return}
    busy(b,1);aCall('cbMod',{id:p.id,action:a}).then(function(){toast('บันทึกแล้ว');reload()}).catch(function(e){busy(b,0);toast(e.message,1)})}})}
function cbEdit(kind,id,body,done){drawer(kind==='post'?'แก้ไขโพสต์':'แก้ไขความคิดเห็น','<label class="f"><span>ข้อความ</span><textarea id="cb-edt" rows="8" maxlength="'+(kind==='post'?5000:2000)+'">'+esc(body)+'</textarea></label><div class="faint" style="font-size:12.5px">ทุกคนจะเห็นป้าย "แก้ไขแล้ว" · ระบบเก็บข้อความเดิมไว้</div>','<button class="btn pri" id="cb-edok">บันทึก</button>');
  $('#cb-edok').onclick=function(){var b=this;busy(b,1);aCall('cbEdit',{kind:kind,id:id,body:$('#cb-edt').value}).then(function(){closeD();toast('แก้ไขแล้ว');done()}).catch(function(e){busy(b,0);toast(e.message,1)})}}

/* ───────── รูป: ย่อในเครื่อง (≤ 1280px · JPEG) แล้วอัปโหลดทีละรูป ───────── */
function cbShrink(file){return new Promise(function(ok,no){var u=URL.createObjectURL(file),img=new Image();img.onload=function(){var k=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);   // พื้นขาว: PNG โปร่งใส (ภาพหน้าจอ) แปลงเป็น JPEG แล้วไม่กลายเป็นสีดำ
  
  var q=.82,d=c.toDataURL('image/jpeg',q);while(d.length>390000&&q>.4){q-=.1;d=c.toDataURL('image/jpeg',q)}ok(d)};img.onerror=function(){URL.revokeObjectURL(u);no(new Error('เปิดรูปไม่ได้'))};img.src=u})}
function cbUploadFiles(inp,ups,box){var files=Array.prototype.slice.call(inp.files||[]);inp.value='';
  if(ups.length+files.length>4){toast('แนบรูปได้ไม่เกิน 4 รูป',1);files=files.slice(0,4-ups.length)}
  var draw=function(){box.innerHTML=ups.map(function(u,i){return '<span class="cb-up'+(u.id?'':' ld')+'"><img src="'+u.src+'" alt=""><button type="button" data-cbrm="'+i+'" aria-label="เอารูปออก">×</button></span>'}).join('');
    $$('[data-cbrm]',box).forEach(function(b){b.onclick=function(){ups.splice(+b.dataset.cbrm,1);draw()}})};
  files.forEach(function(f){var u={src:'',id:''};ups.push(u);cbShrink(f).then(function(d){u.src=d;draw();return aCall('cbUpload',{data:d})}).then(function(r){u.id=r.id;draw()}).catch(function(e){ups.splice(ups.indexOf(u),1);draw();toast(e.message,1)})});draw()}

/* ───────── สร้างโพสต์ (แบบ Facebook · ไม่มีหัวข้อ) ───────── */
function cbCompose(){var b=A.cbB||{cats:[],me:{}},me=A.d.me,cats=b.cats.filter(function(c){return c.post_perm!=='mod'||b.me.mod}),ups=[],cat=(A.cbF&&A.cbF.cat&&cats.some(function(c){return c.id===A.cbF.cat}))?A.cbF.cat:(cats.filter(function(c){return c.id==='c_talk'})[0]||cats[0]||{}).id;
  var w=document.createElement('div');w.className='cbm-w';w.innerHTML='<div class="cbm" role="dialog" aria-modal="true" aria-labelledby="cbm-t"><div class="cbm-h"><span></span><h3 id="cbm-t">สร้างโพสต์</h3><button class="cbm-x" aria-label="ปิด">×</button></div><div class="cbm-b">'+
    '<div class="cbm-who">'+av(me.id==='admin'?{id:'admin',first_name:'ผู้ดูแล',last_name:'ระบบ'}:{id:me.id,first_name:String(me.name||'').split(' ')[0],last_name:String(me.name||'').split(' ')[1]||''},44)+'<div><b>'+esc(me.name||'ผู้ดูแลระบบ')+'</b><div class="cbm-pills"><span class="cbm-pill">👥 ทุกคนในบริษัท</span><label class="cbm-pill">🗂 <select id="cbm-cat" aria-label="หมวด">'+cats.map(function(c){return '<option value="'+c.id+'"'+(c.id===cat?' selected':'')+'>'+esc(c.name)+'</option>'}).join('')+'</select></label></div></div></div>'+
    '<textarea id="cbm-txt" rows="5" maxlength="5000" placeholder="คุณคิดอะไรอยู่ '+esc(String(me.nickname||me.name||'').split(' ')[0])+'"></textarea><div class="cb-ups" id="cbm-ups"></div>'+
    '<div class="cbm-add"><b>เพิ่มลงในโพสต์ของคุณ</b><label class="cbm-ic" title="รูปภาพ (สูงสุด 4)">🖼<input type="file" accept="image/*" multiple id="cbm-f" class="vh"></label></div>'+
    (b.me.mod?'<div class="cbm-mod"><span class="faint">เฉพาะผู้ดูแล</span><label class="cbm-chk"><input type="checkbox" id="cbm-pin"> ปักหมุดถึง <input type="date" id="cbm-pind" value="'+dAdd(dIso(new Date()),7)+'" min="'+dAdd(dIso(new Date()),1)+'"></label></div>':'')+
    '<button class="btn pri cbm-go" id="cbm-go" disabled>โพสต์</button></div></div>';
  document.body.appendChild(w);var t=$('#cbm-txt'),go=$('#cbm-go'),close=function(){w.remove();document.removeEventListener('keydown',kd)},kd=function(e){if(e.key==='Escape')close()};
  document.addEventListener('keydown',kd);w.querySelector('.cbm-x').onclick=close;w.onclick=function(e){if(e.target===w&&!t.value.trim())close()};
  var upd=function(){go.disabled=!t.value.trim()};t.oninput=upd;t.focus();
  $('#cbm-f').onchange=function(){cbUploadFiles(this,ups,$('#cbm-ups'))};
  go.onclick=function(){if(ups.some(function(u){return !u.id}))return toast('รอรูปอัปโหลดเสร็จก่อน',1);var a={cat:$('#cbm-cat').value,body:t.value,imgs:ups.map(function(u){return u.id})};
    if($('#cbm-pin')&&$('#cbm-pin').checked)a.pin_until=dObj($('#cbm-pind').value).getTime()+86399000;busy(go,1);
    aCall('cbPost',a).then(function(r){close();toast('โพสต์แล้ว');A.cbId=r.id;A.cbP=null;if(A.view!=='cb')A.view='cb';render();scrollTo(0,0)}).catch(function(e){busy(go,0);toast(e.message,1)})}}

/* ───────── การ์ด Community บน Dashboard (ปักหมุด + ล่าสุด 5) ───────── */
function cbDashCard(){var b=A.cbB;if(!b)return '';return '<section class="card cb-dash"><div class="cb-dh"><b>Community</b>'+(b.unread?'<span class="cb-new">'+b.unread+' ใหม่</span>':'')+'<span class="sp"></span><button class="lnk" data-go="cb">ดูทั้งหมด →</button></div>'+
  (b.latest.length?b.latest.map(function(p){return '<button class="cb-dr" data-cbgo="'+p.id+'">'+(p.pinned?'📌 ':'')+cbChip(p.cat)+'<span class="cb-dt">'+esc(p.body.split('\n')[0])+'</span><span class="faint">💬 '+p.replies+'</span>'+(p.unread?'<i class="cb-dot"></i>':'')+'</button>'}).join(''):'<div class="faint" style="padding:10px 18px 14px">ยังไม่มีโพสต์</div>')+'</section>'}
