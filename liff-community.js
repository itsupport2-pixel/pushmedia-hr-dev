'use strict';
/* แอปพนักงาน (liff.html) · Community — โพสต์ภายในองค์กร (1 พ.ย. 2569 · Figma หน้า 16 ส่วน B · หลังบ้าน app-cf/src/community.js)
 * ไฟล์นี้โหลดหลัง liff-nav.js (ห่อ drawer / onEnter / V.home ที่ประกาศไว้ก่อน) และก่อน liff-leave.js (เรียก start())
 * หน้า: cb (รายการ) · cbp:<id> (อ่านโพสต์ + ตอบ) · cbnew (สร้างโพสต์แบบ Facebook ไม่มีหัวข้อ) · การ์ดบนหน้าหลัก · เมนูขวา
 * กติกาผู้ใช้: เจ้าของแก้ข้อความได้ ลบไม่ได้ · ลบได้เฉพาะ admin (ทำในหลังบ้าน) */
P.chat='<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>';P.img='<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>';
S.cb={b:null,f:{cat:"",filter:"all"},L:null,P:{},reply:null,ups:[],dirty:false};
TITLE.cb="Community";TITLE.cbp="Community";TITLE.cbnew="สร้างโพสต์";NOTAB.push("cbp","cbnew");
const CB_BASE=API.replace(/\/api$/,"");
const cbImg=id=>CB_BASE+"/cb/img/"+encodeURIComponent(id);
const cbCat=id=>((S.cb.b&&S.cb.b.cats)||[]).find(c=>c.id===id)||{name:"ทั่วไป",color:"#5F5F5F"};
const cbChip=id=>{const c=cbCat(id);return `<span class="cbc" style="--c:${esc(c.color||"#5F5F5F")}">${esc(c.name)}</span>`};
const cbWho=p=>p&&(p.nick||String(p.name||"").split(" ")[0])||"ไม่ทราบชื่อ";
/* รูปโปรไฟล์: รูปในระบบ (/photo/:id) · ไม่มี = ตัวอักษรแรก */
const cbAv=(p,s)=>`<span class="cbav" style="width:${s}px;height:${s}px;font-size:${Math.round(s/2.4)}px">${esc(cbWho(p).slice(0,1))}${p&&p.id&&p.id!=="admin"?`<img src="${CB_BASE}/photo/${encodeURIComponent(p.id)}" alt="" loading="lazy" onerror="this.remove()">`:""}</span>`;
const cbAgo=t=>{const s=(Date.now()-t)/1000,d=new Date(t);if(s<60)return "เมื่อสักครู่";if(s<3600)return Math.floor(s/60)+" นาที";if(s<86400)return Math.floor(s/3600)+" ชม.";if(s<172800)return "เมื่อวาน";return d.getDate()+" "+TH_S[d.getMonth()]};
const cbText=s=>esc(s).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g,"<br>");
function cbBootLoad(force){if(S.cb.bp&&!force)return S.cb.bp;S.cb.bp=api("cbBoot").then(b=>{S.cb.b=b;return b}).catch(e=>{S.cb.bp=null;throw e});return S.cb.bp}
function cbLoad(more){const f=S.cb.f,q={cat:f.cat,filter:f.filter};if(more&&S.cb.L)q.cursor=S.cb.L.next;S.cb.loading=1;
  return api("cbList",q).then(r=>{S.cb.loading=0;S.cb.dirty=false;if(more&&S.cb.L){S.cb.L.items=S.cb.L.items.concat(r.items);S.cb.L.next=r.next}else S.cb.L=r;if(cur()==="cb")repaint()}).catch(e=>{S.cb.loading=0;toast(e.message)})}
function cbOpen(id){S.cb.reply=null;S.cb.ups=[];return api("cbGet",{id}).then(d=>{S.cb.P[id]=d;if(cur()==="cbp:"+id)repaint()}).catch(e=>{toast(e.message);if(cur()==="cbp:"+id)back()})}

/* ── การ์ดบนหน้าหลัก: ปักหมุด + ล่าสุด (ใต้งานวันนี้) ── */
function cbHomeCard(){const b=S.cb.b;if(!b)return "";
  return `<div class="card cbhome"><button class="cbhh" data-act="go:cb"><b>Community</b>${b.unread?`<span class="cbnew">${b.unread} ใหม่</span>`:""}<span style="flex:1"></span><span class="cap">ดูทั้งหมด ›</span></button>${b.latest.length?b.latest.slice(0,4).map(p=>`<button class="cbhr" data-cbo="${esc(p.id)}">${p.pinned?"📌 ":""}${cbChip(p.cat)}<span class="cbht${p.unread?" un":""}">${esc(p.body.split("\n")[0])}</span></button>`).join(""):`<span class="cap" style="padding:4px 16px 12px">ยังไม่มีโพสต์ · กดเพื่อเริ่มโพสต์แรก</span>`}</div>`}
V.home=(f=>()=>{const h=f();if(!S.today||!S.cb.b)return h;const i=h.indexOf('<div class="tiles">');return i<0?h+cbHomeCard():h.slice(0,i)+cbHomeCard()+h.slice(i)})(V.home);

/* ── รายการโพสต์ ── */
V.cb=()=>{const b=S.cb.b,L=S.cb.L,f=S.cb.f;if((!L||S.cb.dirty)&&!S.cb.loading)setTimeout(()=>cbLoad(),0);if(!b&&!S.cb.bp)cbBootLoad().then(()=>{if(cur()==="cb")repaint()}).catch(e=>toast(e.message));
  const cats=b?b.cats:[];
  return band("Community")+`<div class="pad cbpad"><div class="cbchips">${[["","ทั้งหมด"]].concat(cats.map(c=>[c.id,c.name])).map(x=>`<button data-cbcat="${x[0]}" aria-pressed="${f.cat===x[0]}">${esc(x[1])}</button>`).join("")}</div>
  <div class="cbseg">${[["all","ล่าสุด"],["noreply","ยังไม่มีคนตอบ"],["mine","ของฉัน"]].map(x=>`<button data-cbflt="${x[0]}" aria-pressed="${f.filter===x[0]}">${x[1]}</button>`).join("")}</div>
  ${!L?`<div class="skel" style="height:110px"></div><div class="skel" style="height:110px"></div>`:!L.items.length?`<div class="empty">${f.filter==="mine"?"ยังไม่มีโพสต์ของคุณ":"ยังไม่มีโพสต์ · เริ่มโพสต์แรกได้เลย"}</div>`:L.items.map(p=>`<button class="card cbcard" data-cbo="${esc(p.id)}"><span class="cbtop">${p.pinned?"📌":""}${cbChip(p.cat)}${p.solved?'<span class="cbsol">✓ มีคำตอบ</span>':""}${p.locked?'<span class="cap">🔒</span>':""}</span>
    <span class="cbtx">${esc(p.body)}</span>${p.imgs.length?`<span class="cbth">${p.imgs.slice(0,3).map(i=>`<img src="${cbImg(i)}" alt="" loading="lazy">`).join("")}</span>`:""}
    <span class="cbbot">${cbAv(p.author,22)}<span class="cap" style="flex:1;min-width:0">${esc(cbWho(p.author))} · ${cbAgo(p.created_at)}${p.last_by?" · ล่าสุด "+esc(cbWho(p.last_by)):""}</span><span class="cbn">💬 ${p.replies}</span>${p.unread?'<i class="cbdot"></i>':""}</span></button>`).join("")+(L.next?`<button class="btn" data-cbmore>แสดงเพิ่ม</button>`:"")}</div>
  ${b&&!b.me.ro?`<button class="cbfab" data-act="go:cbnew">＋ สร้างโพสต์</button>`:""}`};

/* ── อ่านโพสต์ + ความคิดเห็น (ช่องตอบติดล่างจอ) ── */
const cbImgs=ids=>ids&&ids.length?`<div class="cbimgs n${Math.min(ids.length,4)}">${ids.map(i=>`<a href="${cbImg(i)}" target="_blank" rel="noopener"><img src="${cbImg(i)}" alt="รูปแนบ" loading="lazy"></a>`).join("")}</div>`:"";
function cbCm(c,d){if(c.deleted)return `<div class="cbdel">ความคิดเห็นนี้ถูก admin ลบ</div>`;const best=d.post.solved_id===c.id;
  return `<div class="cbcm${best?" best":""}">${best?'<div class="cbbest">✓ คำตอบที่เลือก</div>':""}<div class="cbcr">${cbAv(c.author,30)}<div class="cbcb"><div class="cbbub"><b>${esc(cbWho(c.author))}</b>${c.author.pos?` <span class="cap">${esc(c.author.pos)}</span>`:""}<div>${cbText(c.body)}</div>${cbImgs(c.imgs)}</div>
    <div class="cbca"><span class="cap">${cbAgo(c.created_at)}${c.edited?" · แก้ไขแล้ว":""}</span>${d.can.comment?`<button data-cbrep="${esc(c.id)}">ตอบกลับ</button>`:""}${c.mine?`<button data-cbed="comment:${esc(c.id)}">แก้ไข</button>`:""}${d.can.solve&&!c.parent?`<button data-cbsol="${best?"":esc(c.id)}">${best?"ยกเลิกคำตอบ":"เลือกเป็นคำตอบ"}</button>`:""}</div></div></div></div>`}
V.cbp=id=>{const d=S.cb.P[id];if(!d)return band("Community")+`<div class="pad"><div class="skel" style="height:200px"></div><div class="skel" style="height:120px"></div></div>`;
  const p=d.post,tops=d.comments.filter(c=>!c.parent),kids={};d.comments.forEach(c=>{if(c.parent)(kids[c.parent]=kids[c.parent]||[]).push(c)});
  const rep=S.cb.reply&&d.comments.find(c=>c.id===S.cb.reply),ed=S.cb.edit;
  return band(cbCat(p.cat).name)+`<div class="pad cbpad" style="padding-bottom:${d.can.comment?150:24}px"><div class="card cbpost"><div class="cbph">${cbAv(p.author,38)}<span style="flex:1;min-width:0"><b>${esc(cbWho(p.author))}</b><span class="cap" style="display:block">${esc(p.author.pos||"")}${p.author.pos?" · ":""}${cbAgo(p.created_at)}${p.edited?" · แก้ไขแล้ว":""}</span></span>${p.solved_id?'<span class="cbsol">✓ มีคำตอบ</span>':""}</div>
    ${p.pinned?'<span class="cap">📌 ปักหมุด</span>':""}${ed==="post"?`<textarea class="cbedt" id="cbedt" maxlength="5000">${esc(p.body)}</textarea><div class="cbrow2"><button class="btn" data-cbedx>ยกเลิก</button><button class="btn pri" data-cbeds="post:${esc(p.id)}">บันทึก</button></div>`:`<div class="cbbody">${cbText(p.body)}</div>`}${cbImgs(p.imgs)}
    <div class="cbpa"><span class="cap">${p.replies} ความคิดเห็น</span>${d.can.edit&&ed!=="post"?`<button data-cbed="post:${esc(p.id)}">แก้ไขข้อความ</button>`:""}</div></div>
    <b class="cbh2">ความคิดเห็น (${p.replies})</b>${tops.length?tops.map(c=>cbCm(c,d)+((kids[c.id]||[]).length?`<div class="cbkids">${kids[c.id].map(k=>cbCm(k,d)).join("")}</div>`:"")).join(""):`<span class="cap">ยังไม่มีความคิดเห็น · เป็นคนแรกที่ตอบ</span>`}
    ${p.locked?'<span class="cap">🔒 โพสต์นี้ถูกล็อก ตอบเพิ่มไม่ได้</span>':""}</div>
  ${d.can.comment?`<div class="cbbar">${rep?`<div class="cbrepto">↳ กำลังตอบ ${esc(cbWho(rep.author))}<button data-cbrepx aria-label="ยกเลิกการตอบ">×</button></div>`:""}<div class="cbups" id="cbups">${cbUps()}</div><div class="cbbr"><label class="cbic" aria-label="แนบรูป">${ic("img")}<input type="file" accept="image/*" multiple data-cbfile class="vh"></label><textarea id="cbct" rows="1" maxlength="2000" placeholder="${rep?"ตอบกลับ "+esc(cbWho(rep.author))+"…":"เขียนความคิดเห็น…"}"></textarea><button class="cbsend" data-cbsend="${esc(p.id)}" aria-label="ส่ง">➤</button></div></div>`:""}`};

/* ── สร้างโพสต์ (เต็มจอ · แบบ Facebook) ── */
V.cbnew=()=>{const b=S.cb.b,me=S.me||{};if(!b){cbBootLoad().then(()=>{if(cur()==="cbnew")repaint()});return band("สร้างโพสต์")+loadingV()}
  const cats=b.cats.filter(c=>c.post_perm!=="mod"||b.me.mod),cat=S.cb.ncat||(cats.find(c=>c.id===S.cb.f.cat)||cats.find(c=>c.id==="c_talk")||cats[0]||{}).id;S.cb.ncat=cat;
  return `<header class="band cbnh"><button data-back aria-label="ปิด">✕</button><h1>สร้างโพสต์</h1><button class="cbpost-go" data-cbpost ${S.cb.ntext?"":"disabled"}>โพสต์</button></header><div class="pad cbpad"><div class="cbwho">${cbAv({id:me.id,name:me.name,nick:me.nickname},44)}<span><b>${esc(me.name||"")}</b><span class="cbpills"><span class="cbpill">👥 ทุกคนในบริษัท</span><label class="cbpill">🗂 <select data-cbncat aria-label="หมวด">${cats.map(c=>`<option value="${c.id}" ${c.id===cat?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label></span></span></div>
  <textarea id="cbnt" class="cbnt" maxlength="5000" placeholder="คุณคิดอะไรอยู่ ${esc(me.nickname||String(me.name||"").split(" ")[0])}">${esc(S.cb.ntext||"")}</textarea><div class="cbups" id="cbups">${cbUps()}</div>
  <label class="cbadd"><b>เพิ่มลงในโพสต์ของคุณ</b><span>🖼 รูปภาพ</span><input type="file" accept="image/*" multiple data-cbfile class="vh"></label><span class="cap">โพสต์ด้วยชื่อจริง · ทุกคนในบริษัทเห็น · ห้ามใส่ข้อมูลส่วนตัว เลขบัญชี เงินเดือน</span></div>`};

/* ── รูป: ย่อในเครื่องแล้วอัปโหลดทีละรูป (สูงสุด 4) ── */
function cbUps(){return S.cb.ups.map((u,i)=>`<span class="cbup${u.id?"":" ld"}">${u.src?`<img src="${u.src}" alt="">`:""}<button data-cbrm="${i}" aria-label="เอารูปออก">×</button></span>`).join("")}
function cbPaintUps(){const b=$("#cbups");if(b)b.innerHTML=cbUps()}
function cbAddFiles(inp){let fs=[...(inp.files||[])];inp.value="";if(S.cb.ups.length+fs.length>4){toast("แนบรูปได้ไม่เกิน 4 รูป");fs=fs.slice(0,4-S.cb.ups.length)}
  fs.forEach(f=>{const u={src:"",id:""};S.cb.ups.push(u);cbPaintUps();cbShrink(f).then(d=>{u.src=d;cbPaintUps();return api("cbUpload",{data:d})}).then(r=>{u.id=r.id;cbPaintUps()}).catch(e=>{S.cb.ups.splice(S.cb.ups.indexOf(u),1);cbPaintUps();toast(e.message)})})}

/* ย่อรูป ≤ 1280px เป็น JPEG · เติมพื้นขาวก่อน (PNG โปร่งใส เช่นภาพหน้าจอ ไม่กลายเป็นสีดำ) · คุณภาพลดลงจนไม่เกิน ~390,000 ตัวอักษร */
function cbShrink(file){return new Promise((ok,no)=>{const u=URL.createObjectURL(file),img=new Image();img.onload=()=>{const k=Math.min(1,1280/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
  const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);let q=.82,d=c.toDataURL("image/jpeg",q);while(d.length>390000&&q>.4){q-=.1;d=c.toDataURL("image/jpeg",q)}ok(d)};img.onerror=()=>{URL.revokeObjectURL(u);no(new Error("เปิดรูปไม่ได้"))};img.src=u})}
/* ── การกด ── */
document.addEventListener("click",e=>{const t=e.target.closest("[data-cbo],[data-cbcat],[data-cbflt],[data-cbmore],[data-cbrep],[data-cbrepx],[data-cbsend],[data-cbpost],[data-cbrm],[data-cbed],[data-cbedx],[data-cbeds],[data-cbsol]");if(!t)return;const d=t.dataset;
  if(d.cbo){const id=d.cbo;go("cbp:"+id);cbOpen(id);return}
  if(d.cbcat!==undefined){S.cb.f.cat=d.cbcat;S.cb.L=null;repaint();cbLoad();return}
  if(d.cbflt){S.cb.f.filter=d.cbflt;S.cb.L=null;repaint();cbLoad();return}
  if(d.cbmore!==undefined){t.disabled=true;cbLoad(true);return}
  const [,pid]=cur().split(":"),P=pid&&S.cb.P[pid];
  if(d.cbrep){S.cb.reply=d.cbrep;repaint();const c=P&&P.comments.find(x=>x.id===d.cbrep),ta=$("#cbct");if(ta&&c){ta.value="@"+cbWho(c.author)+" ";ta.focus()}return}
  if(d.cbrepx!==undefined){S.cb.reply=null;repaint();return}
  if(d.cbrm){S.cb.ups.splice(+d.cbrm,1);cbPaintUps();return}
  if(d.cbed){S.cb.edit=d.cbed.startsWith("post")?"post":null;if(d.cbed.startsWith("comment:")){const c=P.comments.find(x=>x.id===d.cbed.slice(8));sheet(`<h3>แก้ไขความคิดเห็น</h3><textarea class="cbedt" id="cbedc" maxlength="2000">${esc(c.body)}</textarea><button class="btn pri" data-cbeds="comment:${esc(c.id)}">บันทึก</button>`);return}repaint();return}
  if(d.cbedx!==undefined){S.cb.edit=null;repaint();return}
  if(d.cbeds){const [k,id]=d.cbeds.split(":"),v=(k==="post"?$("#cbedt"):$("#cbedc")).value;t.disabled=true;
    api("cbEdit",{kind:k,id,body:v}).then(()=>{$("#ov").innerHTML="";S.cb.edit=null;S.cb.dirty=true;toast("แก้ไขแล้ว");return cbOpen(pid)}).catch(x=>{t.disabled=false;toast(x.message)});return}
  if(d.cbsol!==undefined){t.disabled=true;api("cbSolve",{post_id:pid,comment_id:d.cbsol}).then(()=>{S.cb.dirty=true;return cbOpen(pid)}).catch(x=>{t.disabled=false;toast(x.message)});return}
  if(d.cbsend){const ta=$("#cbct"),v=ta?ta.value:"";if(!v.trim())return toast("พิมพ์ความคิดเห็นก่อน");if(S.cb.ups.some(u=>!u.id))return toast("รอรูปอัปโหลดเสร็จก่อน");t.disabled=true;
    api("cbComment",{post_id:d.cbsend,parent_id:S.cb.reply||"",body:v,imgs:S.cb.ups.map(u=>u.id)}).then(()=>{S.cb.dirty=true;toast("ส่งแล้ว");return cbOpen(d.cbsend)}).then(()=>{const v2=liveView();if(v2)v2.scrollTop=v2.scrollHeight}).catch(x=>{t.disabled=false;toast(x.message)});return}
  if(d.cbpost!==undefined){const ta=$("#cbnt"),v=ta?ta.value:"";if(!v.trim())return;if(S.cb.ups.some(u=>!u.id))return toast("รอรูปอัปโหลดเสร็จก่อน");t.disabled=true;
    api("cbPost",{cat:S.cb.ncat,body:v,imgs:S.cb.ups.map(u=>u.id)}).then(r=>{S.cb.ntext="";S.cb.ncat="";S.cb.ups=[];S.cb.dirty=true;toast("โพสต์แล้ว");S.stack.pop();go("cbp:"+r.id);cbOpen(r.id);cbBootLoad(true)}).catch(x=>{t.disabled=false;toast(x.message)});return}
});
document.addEventListener("change",e=>{const t=e.target;if(t.hasAttribute&&t.hasAttribute("data-cbfile")){cbAddFiles(t);return}if(t.hasAttribute&&t.hasAttribute("data-cbncat"))S.cb.ncat=t.value});
document.addEventListener("input",e=>{const t=e.target;if(t.id==="cbnt"){S.cb.ntext=t.value;const b=document.querySelector("[data-cbpost]");if(b)b.disabled=!t.value.trim()}if(t.id==="cbct"){t.style.height="auto";t.style.height=Math.min(120,t.scrollHeight)+"px"}});

/* เมนูขวา: + Community · เข้าหน้าที่เกี่ยวข้อง = โหลดข้อมูล · หน้าหลัก = โหลดการ์ดครั้งแรก */
drawer=(f=>open=>{f(open);if(!open)return;const nav=document.querySelector("#ov .drawer nav");if(nav&&!nav.querySelector('[data-dgo="go:cb"]'))nav.children[1].insertAdjacentHTML("beforebegin",`<button data-dgo="go:cb">${ic("chat")}Community${S.cb.b&&S.cb.b.unread?` <span class="cbnew">${S.cb.b.unread}</span>`:""}</button>`)})(drawer);
onEnter=(f=>()=>{f();const n=cur().split(":")[0];if(n==="cbnew"&&!S.cb.ntext)S.cb.ups=[];if(n==="cb")cbBootLoad().then(()=>{if(cur()==="cb")repaint()}).catch(()=>{})})(onEnter);
boot=(f=>function(){const r=f.apply(this,arguments);setTimeout(()=>cbBootLoad().then(()=>{if(cur()==="home")repaint()}).catch(()=>{}),400);return r})(boot);
