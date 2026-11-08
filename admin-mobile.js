'use strict';
/* หลังบ้านบนจอมือถือ ≤ 640px (8 พ.ย. 2569 · รอบ 2 แบบแอป) · ปรับเฉพาะการแสดงผล ไม่แตะข้อมูล/คำสั่ง/ขั้นตอนอนุมัติ
 * - ตาราง → แถวรายการกะทัดรัด (หัวแถว + ข้อมูลย่อยบรรทัดเดียว · ปุ่มอยู่มุมขวา)
 * - ตัวกรอง → ปุ่ม "ตัวกรอง (n)" เปิดแผ่นจากด้านล่าง · ปุ่มรอง (Export/นำเข้า/รีเฟรช/แก้เวลา…) → ปุ่ม "⋯" เปิดแผ่นจากด้านล่าง
 *   ย้ายปุ่ม/ช่องตัวจริงเข้าแผ่น (การกด/เลือกทำงานเหมือนเดิม) · หน้าวาดใหม่แล้วแผ่นที่เปิดอยู่จะรับตัวใหม่ต่อ
 * - ชิปหลายตัว (≥ 5) → dropdown · ตัวเลขสรุป → แถบปัดได้ */
(function(){
  var MQ=window.matchMedia('(max-width:640px)');
  var CARD={att:1,appr:1,lv:1,list:1,asset:1,msg:1,ot:1,audit:1,errlog:1,org:1};
  var DESK={set:1,pay:1,rep:1,usage:1,sched:1,srep:1,conf:1};
  var FSEL='select,.drg,[id^=ofs-],#ap-rg,#lv-rg,.dpt';
  var busy=false,tm=0,sh=null;
  var T=function(s){return window.hrLang&&hrLang()==='en'&&window.hrT?hrT(s):s};
  function view(){return (window.A&&A.view)||''}
  function vis(e){if(!e)return false;if(e.classList.contains('m-hid')||e.getClientRects().length)return true;return getComputedStyle(e).display==='contents'&&[].some.call(e.children,vis)}
  /* ---------- ตาราง → รายการ ---------- */
  function cards(){
    if(!CARD[view()]||(view()==='att'&&A.attTab==='mx'))return;
    document.querySelectorAll('.content table').forEach(function(t){
      if(t.closest('.m-sh'))return;
      var ths=[].map.call(t.querySelectorAll('thead th'),function(h){return h.textContent.trim()});if(!ths.length)return;
      t.classList.add('m-card');
      t.querySelectorAll('tbody tr').forEach(function(tr){var head=false;[].forEach.call(tr.children,function(td,i){
        var chk=td.querySelector(':scope > input[type=checkbox]')&&!td.textContent.trim();td.classList.toggle('m-x',!!chk);if(chk)return;
        if(td.colSpan>1){td.classList.add('m-full');return}
        if(!head){head=true;td.classList.add('m-h');return}
        td.setAttribute('data-l',ths[i]||'');
        var x=td.textContent.trim(),btn=td.querySelector('button,a.btn');
        td.classList.toggle('m-act',!!btn&&td.textContent.trim()===[].map.call(td.querySelectorAll('button,a.btn'),function(b){return b.textContent.trim()}).join('').trim());
        td.classList.toggle('m-e',(x===''||x==='—'||x==='-')&&!td.querySelector('button,img,input,select,a,svg'))});
        tr.classList.toggle('m-has-act',!!tr.querySelector('td.m-act'))})})}
  /* ---------- แผ่นจากด้านล่าง ---------- */
  function closeSheet(){if(!sh)return;var s=sh;sh=null;s.items.forEach(function(it){if(it.ph.parentNode){it.el.classList.add('m-hid');it.ph.parentNode.replaceChild(it.el,it.ph)}});s.ov.remove()}
  function openSheet(kind,title,els){
    closeSheet();if(!els.length)return;
    var ov=document.createElement('div');ov.className='m-sh-ov';ov.innerHTML='<div class="m-sh" role="dialog" aria-modal="true"><div class="m-sh-h"><b></b><button type="button" class="btn sm m-sh-x">'+T('เสร็จ')+'</button></div><div class="m-sh-b"></div></div>';
    ov.querySelector('b').textContent=title;var body=ov.querySelector('.m-sh-b'),items=[];
    els.forEach(function(el){var ph=document.createComment('m');el.parentNode.replaceChild(ph,el);el.classList.remove('m-hid');body.appendChild(el);items.push({el:el,ph:ph})});
    ov.addEventListener('click',function(e){if(e.target===ov||e.target.closest('.m-sh-x'))closeSheet()});
    if(kind==='more')body.addEventListener('click',function(e){var b=e.target.closest('button,a');if(b&&!b.closest('.m-sh-h'))setTimeout(closeSheet,0)});
    document.body.appendChild(ov);sh={kind:kind,ov:ov,items:items}}
  function filterEls(){var c=document.querySelector('.content');if(!c)return [];var out=[];
    c.querySelectorAll('.ph,.tools,.ast-ctl,.toolbar').forEach(function(box){box.querySelectorAll(':scope > '+FSEL.split(',').join(',:scope > ')+',:scope > .att-dt ~ select').forEach(function(e){if(out.indexOf(e)<0&&vis(e))out.push(e)})});return out}
  function moreEls(){var c=document.querySelector('.content');if(!c)return [];var out=[];
    c.querySelectorAll('.ph,.ast-hd,.ast-ctl,.tools').forEach(function(box){box.querySelectorAll(':scope > .btn:not(.pri):not(.m-ft):not(.m-mr):not([aria-pressed]):not([data-asv]):not([data-astt]), :scope > a.btn:not(.pri)').forEach(function(e){if(vis(e))out.push(e)})});return out}
  function active(){return filterEls().filter(function(e){return e.tagName==='SELECT'&&e.selectedIndex>0}).length+[].filter.call(document.querySelectorAll('.content select.m-csel'),function(s){return s.selectedIndex>0}).length}
  function bar(){
    var c=document.querySelector('.content');if(!c)return;var ph=c.querySelector(':scope > .ph');
    var f=filterEls(),m=moreEls(),b=c.querySelector(':scope > .m-bar');
    if(!f.length&&!m.length&&!(sh&&sh.items.length)){if(b)b.remove();return}
    if(!b){b=document.createElement('div');b.className='m-bar';b.innerHTML='<button type="button" class="btn m-ft"></button><button type="button" class="btn m-mr" aria-label="'+T('เพิ่มเติม')+'">⋯</button>';
      b.querySelector('.m-ft').onclick=function(){openSheet('filter',T('ตัวกรอง'),filterEls())};
      b.querySelector('.m-mr').onclick=function(){openSheet('more',T('เพิ่มเติม'),moreEls())};
      var srch=c.querySelector('.tools input#q,#ast-q,#ms-q');
      var hd=ph||c.querySelector(':scope > .ast-hd');if(hd&&hd.nextSibling)c.insertBefore(b,hd.nextSibling);else c.insertBefore(b,c.firstChild)}
    var n=active(),s=T('ตัวกรอง')+(n?' ('+n+')':''),ft=b.querySelector('.m-ft');if(ft.textContent!==s)ft.textContent=s;
    ft.hidden=!f.length&&!(sh&&sh.kind==='filter');b.querySelector('.m-mr').hidden=!m.length&&!(sh&&sh.kind==='more');
    f.concat(m).forEach(function(e){e.classList.add('m-hid')});
    var pri=ph&&ph.querySelector(':scope > .btn.pri');if(pri&&pri.parentNode!==b)b.appendChild(pri)}
  /* ชิป ≥ 5 ตัว → dropdown (กดชิปตัวจริงแทน) */
  function chips(){document.querySelectorAll('.content .toolbar,.content .chips-row,.content [data-chipbox]').forEach(function(){});
    var groups=new Map();document.querySelectorAll('.content button.chip').forEach(function(b){var p=b.parentElement;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(b)});
    groups.forEach(function(bs,p){if(bs.length<5)return;p.classList.add('m-chipbox');var s=p.querySelector(':scope > select.m-csel');
      if(!s){s=document.createElement('select');s.className='m-csel';s.setAttribute('aria-label',T('ประเภท'));s.onchange=function(){var b=bs.filter(function(x){return x.isConnected})[s.selectedIndex]||p.querySelectorAll('button.chip')[s.selectedIndex];if(b)b.click()};p.insertBefore(s,p.firstChild)}
      var html=bs.map(function(b,i){return '<option value="'+i+'"'+(b.disabled?' disabled':'')+(b.getAttribute('aria-pressed')==='true'?' selected':'')+'>'+b.textContent.trim().replace(/[<>&]/g,'')+'</option>'}).join('');if(s.innerHTML!==html)s.innerHTML=html})}
  function kstrip(){if(view()==='dash')return;var P=new Set();document.querySelectorAll('.content .kpi').forEach(function(k){var p=k.parentElement;if(p&&p.querySelectorAll(':scope > .kpi').length>=3)P.add(p)});P.forEach(function(p){p.classList.add('m-ks')})}
  function dup(){var tt=document.querySelector('.tb .tt b'),h=document.querySelector('.content .ph h1');if(tt&&h)h.classList.toggle('m-dup',h.textContent.trim()===tt.textContent.trim())}
  function note(){var c=document.querySelector('.content');if(!c)return;var d=c.querySelector(':scope > .m-dn');
    if(!DESK[view()]){if(d)d.remove();return}
    if(!d){d=document.createElement('div');d.className='m-dn';d.textContent=T('เหมาะกับจอคอม · บางตารางต้องปัดซ้าย–ขวา');c.insertBefore(d,c.firstChild)}}
  function refill(){if(!sh)return;var kind=sh.kind,live=sh.items.some(function(it){return it.ph.isConnected});if(live)return;
    // หน้าวาดใหม่ระหว่างเปิดแผ่น: ทิ้งตัวเก่า ย้ายตัวใหม่เข้าแผ่นเดิม
    var els=kind==='filter'?filterEls():moreEls(),title=sh.ov.querySelector('.m-sh-h b').textContent;sh.ov.remove();sh=null;if(els.length)openSheet(kind,title,els)}
  function run(){if(busy)return;busy=true;try{if(!MQ.matches){closeSheet()}else{dup();note();cards();kstrip();chips();refill();bar()}}catch(e){if(window.console)console.warn('m',e)}ob.takeRecords();busy=false}
  var ob=new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(run,30)});
  function start(){ob.observe(document.body,{childList:true,subtree:true});run()}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  document.addEventListener('change',function(e){if(MQ.matches&&e.target&&e.target.tagName==='SELECT')setTimeout(run,0)});
  if(MQ.addEventListener)MQ.addEventListener('change',run);
  window.pmMobileSheetClose=closeSheet;
})();
