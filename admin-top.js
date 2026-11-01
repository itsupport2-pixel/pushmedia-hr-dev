/* ── รายงาน › Top 10 + วิเคราะห์พฤติกรรม (1 พ.ย. 2569 ผู้ใช้ขอ: "รายชื่อ Top 10 การลา ขาด แก้ไขเวลา ของทั้งบริษัทในแต่ละเดือน" + "หน้าวิเคราะห์การเปลี่ยนแปลงพฤติกรรมของพนักงาน")
 * ใช้ข้อมูลชุดเดียวกับ Dashboard ผู้บริหาร (execDashboard: รายคนรายเดือน 6 เดือนถึงเดือนที่เลือก) → ไม่ต้องแก้หลังบ้าน
 * ขอบเขต = "ลงเวลา" ของผู้ใช้ (HR/admin/ผู้บริหาร = ทั้งบริษัท) · ค่าเริ่มต้น = เดือนที่แล้ว (เดือนจบแล้ว เทียบได้เต็มที่)
 * นับเป็น "วัน": ลา = วันที่ระบบลงเวลาสรุปว่าลา · ขาด = วันทำงานที่ไม่มีบันทึกเวลา · แก้ไขเวลา = วันที่มีรายการ HR ลงแทน/แก้เวลา (Time Adjust) */
var TP_K=[['lv','การลา','วัน'],['abs','ขาดงาน','วัน'],['adj','แก้ไขเวลา','วัน']];
function tpPrev(){var d=new Date();d.setDate(1);d.setMonth(d.getMonth()-1);return dIso(d).slice(0,7)}
function tpHead(tab,title,sub){var cur=dIso(new Date()).slice(0,7);A.tpYm=A.tpYm||tpPrev();var ms=[];
  for(var k=0;k<12;k++){var d=new Date(+cur.slice(0,4),+cur.slice(5,7)-1-k,1);ms.push(d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2))}
  return '<div class="ph"><div><h1>'+title+'</h1><div class="sub">'+sub+' · ขอบเขต: '+esc(scopeTxt('att'))+'</div></div><span class="sp"></span>'+
   '<label class="xd-l">เดือน<select id="tp-ym">'+ms.map(function(m){return '<option value="'+m+'"'+(m===A.tpYm?' selected':'')+'>'+xdYmTxt(m)+(m===cur?' (ถึงวันนี้)':'')+'</option>'}).join('')+'</select></label><button class="btn" id="tp-rl">โหลดใหม่</button></div>'+
   rpTabs(tab)+'<div id="tp-body"><div class="loading"><span class="spin"></span>กำลังรวมข้อมูล 6 เดือน…</div></div>'}
function vTop(){return tpHead('top','Top 10 รายเดือน','อันดับพนักงานที่ลา ขาดงาน และแก้ไขเวลามากที่สุดในเดือน · เท่ากันเรียงตามยอด 6 เดือน')}
function vBh(){return tpHead('bh','วิเคราะห์พฤติกรรม','เทียบเดือนที่เลือกกับค่าเฉลี่ย 3 เดือนก่อนหน้าของพนักงานแต่ละคน')}
function tpBind(draw){var load=function(){$('#tp-body').innerHTML='<div class="loading"><span class="spin"></span>กำลังรวมข้อมูล 6 เดือน…</div>';
    aCall('execDashboard',A.tpYm).then(function(d){A.tp=d;draw()}).catch(function(e){if($('#tp-body'))$('#tp-body').innerHTML='<div class="alert">'+esc(e.message)+'</div>'})};
  $('#tp-ym').onchange=function(){A.tpYm=this.value;load()};$('#tp-rl').onclick=function(){fxArm('rep');load()};
  if(A.tp&&A.tp.ym===A.tpYm)draw();else load()}
function bTop(){tpBind(drawTop)}
function bBh(){tpBind(drawBh)}
/* แผนก (ปุ่มเลือก) · ใช้ร่วมกันทั้ง 2 แท็บ */
function tpPs(){var d=A.tp,dep=A.tpDep||'all';return dep==='all'?d.people:d.people.filter(function(p){return p.dept===dep})}
function tpChips(){var d=A.tp,dep=A.tpDep||'all',used=d.depts.filter(function(x){return d.people.some(function(p){return p.dept===x.id})});
  if(dep!=='all'&&!used.some(function(x){return x.id===dep}))A.tpDep=dep='all';
  var chip=function(id,l){return '<button class="xd-chip" data-tpd="'+id+'" aria-pressed="'+(dep===id)+'">'+(id==='all'?'':'<i style="background:'+xdColor(id)+'"></i>')+esc(l)+'</button>'};
  return '<div class="xd-chips"><span class="faint">ดูข้อมูลของ</span>'+chip('all','ทั้งบริษัท')+used.map(function(x){return chip(x.id,x.name)}).join('')+'</div>'}
function tpBindCommon(draw){$$('[data-tpd]').forEach(function(b){b.onclick=function(){A.tpDep=b.dataset.tpd;draw()}});
  $$('#tp-body [data-tpp]').forEach(function(b){b.onclick=function(){tpPerson(b.dataset.tpp)}})}
function tpN(v){return v%1?(+v).toFixed(1):String(v)}
function tpNm(p){return '<b>'+esc(p.name)+'</b>'+(p.nickname?' ('+esc(p.nickname)+')':'')+'<small><i class="xd-dot" style="background:'+xdColor(p.dept)+'"></i>'+esc(org('departments',p.dept)||'—')+'</small>'}
/* แท่งเล็ก 6 เดือน (เดือนที่เลือกสีเข้ม) */
function tpBars(vals,mx){mx=Math.max(mx||0,1);return '<span class="tp-bs" aria-hidden="true">'+vals.map(function(v,i){return '<i style="height:'+Math.max(2,Math.round(v/mx*22))+'px"'+(i===vals.length-1?' class="on"':'')+'></i>'}).join('')+'</span>'}
function tpMo(p,m){return p.mo[m]||{exp:0,pres:0,abs:0,lv:0,late:0,off:0,adj:0,inSum:0}}

/* ── Top 10 ── */
function drawTop(){var d=A.tp;if(!d||!$('#tp-body'))return;var ym=d.ym,i=d.months.indexOf(ym),pm=i>0?d.months[i-1]:null,ps=tpPs(),h=tpChips();
  var lvT={};d.leave_month.forEach(function(z){var o=lvT[z[0]]=lvT[z[0]]||{};o[z[1]]=(o[z[1]]||0)+z[2]});
  h+='<div class="tp-g3">'+TP_K.map(function(k){var f=k[0];
    var rows=ps.map(function(p){var v=tpMo(p,ym)[f],s6=d.months.reduce(function(s,m){return s+tpMo(p,m)[f]},0);return {p:p,v:v,s6:s6,pv:pm?tpMo(p,pm)[f]:null,ser:d.months.map(function(m){return tpMo(p,m)[f]})}})
      .filter(function(x){return x.v>0}).sort(function(a,b){return b.v-a.v||b.s6-a.s6||(a.p.name<b.p.name?-1:1)});
    var all=A['tpAll_'+f],show=all?rows:rows.slice(0,10),tot=rows.reduce(function(s,x){return s+x.v},0),mx=Math.max.apply(0,show.map(function(x){return Math.max.apply(0,x.ser)}).concat([1]));
    return '<section class="card xd-c"><div class="xd-lh"><h3>Top 10 '+k[1]+'</h3><span class="faint">'+rows.length+' คน · รวม '+tpN(tot)+' '+k[2]+'</span></div><div class="faint xd-cs">'+xdYmTxt(ym)+' · เทียบเดือนก่อน · แท่ง = 6 เดือน</div>'+
     (show.length?show.map(function(x,j){var dv=x.pv==null?'':x.pv===0?'<span class="badge b-warn">ใหม่</span>':x.v===x.pv?'<span class="faint">เท่าเดิม</span>':'<span class="'+(x.v>x.pv?'xd-dn':'xd-up')+'">'+(x.v>x.pv?'▲':'▼')+' '+tpN(Math.abs(x.v-x.pv))+'</span>';
       var lt=f==='lv'&&lvT[x.p.id]?'<small class="tp-lt">'+Object.keys(lvT[x.p.id]).map(function(t){return esc(t)+' '+tpN(lvT[x.p.id][t])}).join(' · ')+'</small>':'';
       return '<button class="tp-r" data-tpp="'+esc(x.p.id)+'"><span class="xd-n">'+(j+1)+'</span><span class="xd-nm">'+tpNm(x.p)+lt+'</span>'+tpBars(x.ser,mx)+'<span class="xd-v"><b>'+tpN(x.v)+'</b><small>'+k[2]+'</small></span><span class="tp-dv">'+dv+'</span></button>'}).join('')
      :'<div class="faint" style="padding:10px 0">ไม่มีพนักงาน'+k[1]+'ในเดือนนี้</div>')+
     (rows.length>10?'<button class="lnk" data-tpa="'+f+'">'+(all?'ย่อเหลือ 10 อันดับ':'ดูทั้งหมด '+rows.length+' คน')+'</button>':'')+'</section>'}).join('')+'</div>';
  if(ym===dIso(new Date()).slice(0,7))h='<div class="faint" style="margin:-4px 0 10px">เดือนนี้ยังไม่จบ · นับถึง '+esc(dTxt(d.end))+'</div>'+h;
  h+='<div class="faint" style="font-size:12.5px">กดชื่อเพื่อดูรายละเอียด 6 เดือน · ลา = วันที่ระบบสรุปว่าลา (ครึ่งวันนับ 1 วัน) · ขาดงาน = วันทำงานที่ไม่มีบันทึกเวลาและไม่ได้ลา · แก้ไขเวลา = วันที่มี HR ลงเวลาแทน/แก้เวลา</div>';
  $('#tp-body').innerHTML=h;tpBindCommon(drawTop);
  $$('[data-tpa]').forEach(function(b){b.onclick=function(){var k='tpAll_'+b.dataset.tpa;A[k]=!A[k];drawTop()}})}

/* ── วิเคราะห์พฤติกรรม ──
 * ฐาน = ค่าเฉลี่ย 3 เดือนก่อนหน้าที่มีข้อมูล (อย่างน้อย 1 เดือน) · คนที่ไม่มีเดือนก่อนหน้า (พนักงานใหม่) ไม่นำมาเทียบ
 * สัญญาณ: ขาด ≥ +2 วัน · ลา ≥ +2 วัน · สาย ≥ +3 ครั้ง · แก้เวลา ≥ +2 วัน · อัตรามาทำงาน ±10 จุด · เข้างานช้าลง/เร็วขึ้น ≥ 15 นาที
 *        + ขาด/ลาวันจันทร์หรือวันศุกร์ (≥ 2 ครั้ง และ ≥ 2/3 ของทั้งหมด) + ขาดหรือสายเพิ่มขึ้นต่อเนื่อง 3 เดือน */
var BH_T={abs:2,lv:2,late:3,adj:2,rate:10,inT:15};
function bhOf(p,d){var ym=d.ymB||d.ym,i=d.months.indexOf(ym),c=tpMo(p,ym);if(!c.exp&&!c.lv)return null;
  var bm=d.months.slice(Math.max(0,i-3),i).filter(function(m){var x=tpMo(p,m);return x.exp||x.lv});
  var avg=function(f){return bm.length?bm.reduce(function(s,m){return s+f(tpMo(p,m))},0)/bm.length:null};
  var rt=function(x){return x.exp?x.pres/x.exp*100:null},it=function(x){return x.pres>=5&&x.inSum?x.inSum/x.pres:null};
  var b={abs:avg(function(x){return x.abs}),lv:avg(function(x){return x.lv}),late:avg(function(x){return x.late}),adj:avg(function(x){return x.adj})},
    rv=bm.map(function(m){return rt(tpMo(p,m))}).filter(function(v){return v!=null}),iv=bm.map(function(m){return it(tpMo(p,m))}).filter(function(v){return v!=null});
  b.rate=rv.length?rv.reduce(function(s,v){return s+v},0)/rv.length:null;b.inT=iv.length?iv.reduce(function(s,v){return s+v},0)/iv.length:null;
  var cur={abs:c.abs,lv:c.lv,late:c.late,adj:c.adj,rate:c.exp>=5?rt(c):null,inT:it(c)},bad=[],good=[],pat=[],sc=0;
  if(bm.length){
    [['abs','ขาดงาน','วัน',3],['lv','ลา','วัน',1],['late','มาสาย','ครั้ง',1],['adj','แก้ไขเวลา','วัน',1]].forEach(function(k){var df=cur[k[0]]-b[k[0]];
      if(df>=BH_T[k[0]]){bad.push(k[1]+'เพิ่ม '+tpN(+b[k[0]].toFixed(1))+' → '+tpN(cur[k[0]])+' '+k[2]);sc+=df*k[3]}
      else if(-df>=BH_T[k[0]]){good.push(k[1]+'ลดลง '+tpN(+b[k[0]].toFixed(1))+' → '+tpN(cur[k[0]])+' '+k[2])}});
    if(cur.rate!=null&&b.rate!=null){var dr=cur.rate-b.rate;if(dr<=-BH_T.rate){bad.push('อัตรามาทำงาน '+b.rate.toFixed(0)+'% → '+cur.rate.toFixed(0)+'%');sc+=-dr/5}else if(dr>=BH_T.rate)good.push('อัตรามาทำงาน '+b.rate.toFixed(0)+'% → '+cur.rate.toFixed(0)+'%')}
    if(cur.inT!=null&&b.inT!=null){var di=cur.inT-b.inT,hm=function(m){m=Math.round(m);return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)};
      if(di>=BH_T.inT){bad.push('เข้างานเฉลี่ยช้าลง '+hm(b.inT)+' → '+hm(cur.inT));sc+=di/15}else if(-di>=BH_T.inT)good.push('เข้างานเฉลี่ยเร็วขึ้น '+hm(b.inT)+' → '+hm(cur.inT))}
    if(b.abs>=1&&!cur.abs&&c.exp>=5&&good.every(function(x){return x.indexOf('ขาดงาน')<0}))good.push('ไม่ขาดงานเลยเดือนนี้ (เดิมเฉลี่ย '+tpN(+b.abs.toFixed(1))+' วัน)')}
  if(ym===d.ym){var mf=0,al=0;Object.keys(p.days).forEach(function(s){var x=p.days[s];if(x[0]!=='a'&&x[0]!=='l')return;al++;var w=dObj(s).getDay();if(w===1||w===5)mf++});
    if(mf>=2&&mf/al>=2/3){pat.push('ขาด/ลาวันจันทร์หรือวันศุกร์ '+mf+' จาก '+al+' ครั้ง');sc+=mf}}
  var t3=d.months.slice(Math.max(0,i-2),i+1);if(t3.length===3)[['abs','ขาดงาน'],['late','มาสาย']].forEach(function(k){var v=t3.map(function(m){return tpMo(p,m)[k[0]]});
    if(v[0]<v[1]&&v[1]<v[2]&&v[2]>=2){pat.push(k[1]+'เพิ่มต่อเนื่อง 3 เดือน ('+v.join(' → ')+')');sc+=2}});
  return {p:p,base:bm.length,b:b,cur:cur,bad:bad,good:good,pat:pat,sc:sc+bad.length+pat.length}}
function drawBh(){var d=A.tp;if(!d||!$('#tp-body'))return;var ym=d.ym,i=d.months.indexOf(ym),ps=tpPs(),h=tpChips();
  if(ym===dIso(new Date()).slice(0,7))h+='<div class="alert" style="background:var(--warn-s);color:var(--warn)">เดือนนี้ยังไม่จบ (นับถึง '+esc(dTxt(d.end))+') · จำนวนวันจะน้อยกว่าเดือนก่อน ๆ ผลเทียบอาจดูดีกว่าความจริง · แนะนำเลือกเดือนที่จบแล้ว</div>';
  var R=ps.map(function(p){return bhOf(p,d)}).filter(Boolean);if(!R.length){$('#tp-body').innerHTML=h+'<section class="card"><div class="rp-empty">ยังไม่มีข้อมูลลงเวลาของเดือนนี้ (ระบบสรุปวันที่จบแล้วเท่านั้น)</div></section>';tpBindCommon(drawBh);return}
  var cmp=R.filter(function(x){return x.base}),nw=R.length-cmp.length;
  var worse=R.filter(function(x){return x.bad.length||x.pat.length}).sort(function(a,b){return b.sc-a.sc}),better=cmp.filter(function(x){return x.good.length&&!x.bad.length}).sort(function(a,b){return b.good.length-a.good.length});
  // ภาพรวม: เดือนนี้ vs เฉลี่ย 3 เดือน (ของกลุ่มที่เลือก)
  var bm=d.months.slice(Math.max(0,i-3),i),a=xdAgg(ps,ym),avg=function(f){var v=bm.map(function(m){return f(xdAgg(ps,m))}).filter(function(x){return x!=null});return v.length?v.reduce(function(s,x){return s+x},0)/v.length:null};
  var row=function(l,f,unit,lowGood,dp){var cu=f(a),bv=avg(f);return '<tr><td>'+l+'</td><td class="num"><b>'+(cu==null?'—':cu.toFixed(dp)+unit)+'</b></td><td class="num">'+(bv==null?'—':bv.toFixed(dp)+unit)+'</td><td class="num">'+xdDelta(cu,bv,unit===' %'?' จุด':'',lowGood,dp)+'</td><td>'+xdSpark(d.months.map(function(m){return f(xdAgg(ps,m))}),'#141414',110,26)+'</td></tr>'};
  h+='<div class="tp-g4">'+
   '<section class="card xd-k"><div class="xd-kh"><span>ควรติดตาม</span></div><div class="xd-kv" style="color:var(--bad)">'+worse.length+'</div><div class="xd-ks faint">คน · แย่ลงหรือมีรูปแบบน่าสังเกต</div></section>'+
   '<section class="card xd-k"><div class="xd-kh"><span>ดีขึ้น</span></div><div class="xd-kv" style="color:var(--ok)">'+better.length+'</div><div class="xd-ks faint">คน · ไม่มีด้านที่แย่ลง</div></section>'+
   '<section class="card xd-k"><div class="xd-kh"><span>คงที่</span></div><div class="xd-kv">'+Math.max(0,cmp.length-better.length-worse.filter(function(x){return x.base}).length)+'</div><div class="xd-ks faint">คน · ไม่เปลี่ยนเกินเกณฑ์</div></section>'+
   '<section class="card xd-k"><div class="xd-kh"><span>ยังเทียบไม่ได้</span></div><div class="xd-kv">'+nw+'</div><div class="xd-ks faint">คน · ไม่มีข้อมูลเดือนก่อน (เช่น เพิ่งเริ่มงาน)</div></section></div>';
  h+='<section class="card xd-c"><h3>ภาพรวม'+(A.tpDep&&A.tpDep!=='all'?'แผนก':'บริษัท')+' · '+xdYmTxt(ym)+' เทียบเฉลี่ย 3 เดือนก่อน</h3><div class="faint xd-cs">ต่อคน = วัน ÷ จำนวนพนักงานที่มีข้อมูล · มาสาย = เกิน 15 นาที (% ของวันที่มา)</div><div class="tw"><table class="xd-t"><thead><tr><th>ตัวชี้วัด</th><th class="num">เดือนนี้</th><th class="num">เฉลี่ย 3 เดือน</th><th class="num">เปลี่ยน</th><th>6 เดือน</th></tr></thead><tbody>'+
   row('อัตรามาทำงาน',function(x){return x.rate},' %',0,1)+row('ขาดงาน (วัน/คน)',function(x){return x.n?x.abs/x.n:null},'',1,2)+row('ลา (วัน/คน)',function(x){return x.n?x.lv/x.n:null},'',1,2)+
   row('มาสาย',function(x){return x.lateP},' %',1,1)+row('แก้ไขเวลา (วัน/คน)',function(x){return x.n?x.adj/x.n:null},'',1,2)+row('ทำงานนอกพื้นที่',function(x){return x.offP},' %',0,1)+'</tbody></table></div></section>';
  var card=function(x,kind){var chips=(kind==='bad'?x.bad.map(function(t){return '<span class="badge b-bad">'+esc(t)+'</span>'}).concat(x.pat.map(function(t){return '<span class="badge b-warn">'+esc(t)+'</span>'})):x.good.map(function(t){return '<span class="badge b-ok">'+esc(t)+'</span>'})).join('');
    return '<button class="tp-r bh" data-tpp="'+esc(x.p.id)+'"><span class="xd-nm">'+tpNm(x.p)+'<span class="bh-cs">'+chips+'</span></span>'+(x.base?'':'<span class="faint" style="font-size:12px">ไม่มีเดือนก่อน</span>')+'</button>'};
  var lim=function(arr,k,kind){var all=A[k],s=all?arr:arr.slice(0,10);return (s.length?s.map(function(x){return card(x,kind)}).join(''):'<div class="faint" style="padding:10px 0">'+(kind==='bad'?'ไม่มีพนักงานที่พฤติกรรมเปลี่ยนเกินเกณฑ์':'ยังไม่มี')+'</div>')+(arr.length>10?'<button class="lnk" data-bha="'+k+'">'+(all?'ย่อรายชื่อ':'ดูทั้งหมด '+arr.length+' คน')+'</button>':'')};
  h+='<div class="xd-g2"><section class="card xd-c"><h3>พฤติกรรมที่ควรติดตาม</h3><div class="faint xd-cs">เรียงจากเปลี่ยนมากสุด · แดง = แย่ลงจากค่าเฉลี่ยของตัวเอง · ส้ม = รูปแบบที่น่าสังเกต</div>'+lim(worse,'bhAllW','bad')+'</section>'+
   '<section class="card xd-c"><h3>พฤติกรรมที่ดีขึ้น</h3><div class="faint xd-cs">ดีขึ้นจากค่าเฉลี่ย 3 เดือนก่อนของตัวเอง และไม่มีด้านที่แย่ลง</div>'+lim(better,'bhAllG','good')+'</section></div>';
  h+='<div class="faint" style="font-size:12.5px">เกณฑ์: ขาด/ลา/แก้ไขเวลา เปลี่ยน ≥ 2 วัน · มาสาย ≥ 3 ครั้ง · อัตรามาทำงาน ≥ 10 จุด (เดือนที่ต้องมา ≥ 5 วัน) · เวลาเข้างานเฉลี่ย ≥ 15 นาที · ใช้ประกอบการพูดคุยกับพนักงาน ไม่ใช่ข้อสรุป</div>';
  $('#tp-body').innerHTML=h;tpBindCommon(drawBh);
  $$('[data-bha]').forEach(function(b){b.onclick=function(){A[b.dataset.bha]=!A[b.dataset.bha];drawBh()}})}

/* รายละเอียดรายคน 6 เดือน (ทั้ง 2 แท็บ) */
function tpPerson(id){var d=A.tp,p=d&&d.people.filter(function(x){return x.id===id})[0];if(!p)return;var r=bhOf(p,d);
  var hm=function(m){m=Math.round(m);return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)};
  var tb='<div class="tw"><table class="xd-t tp-dt"><thead><tr><th>เดือน</th><th class="num">มา/ต้องมา</th><th class="num">ขาด</th><th class="num">ลา</th><th class="num">สาย</th><th class="num">แก้เวลา</th><th class="num">นอกพื้นที่</th><th class="num">เข้าเฉลี่ย</th></tr></thead><tbody>'+
   d.months.map(function(m){var x=tpMo(p,m),on=m===d.ym;return '<tr'+(on?' class="xd-tot"':'')+'><td>'+xdYmTxt(m)+'</td><td class="num">'+(x.exp?x.pres+'/'+x.exp:'—')+'</td><td class="num">'+(x.abs?'<b style="color:var(--bad)">'+x.abs+'</b>':0)+'</td><td class="num">'+tpN(x.lv)+'</td><td class="num">'+x.late+'</td><td class="num">'+x.adj+'</td><td class="num">'+x.off+'</td><td class="num">'+(x.pres&&x.inSum?hm(x.inSum/x.pres):'—')+'</td></tr>'}).join('')+'</tbody></table></div>';
  var lt=d.leave_month.filter(function(z){return z[0]===id}),lts={};lt.forEach(function(z){lts[z[1]]=(lts[z[1]]||0)+z[2]});
  var ch=r?r.bad.map(function(t){return '<span class="badge b-bad">'+esc(t)+'</span>'}).concat(r.pat.map(function(t){return '<span class="badge b-warn">'+esc(t)+'</span>'}),r.good.map(function(t){return '<span class="badge b-ok">'+esc(t)+'</span>'})).join(''):'';
  drawer(p.name+(p.nickname?' ('+p.nickname+')':''),'<div class="faint" style="margin-bottom:10px">'+esc(p.code)+' · '+esc(org('departments',p.dept)||'—')+'</div>'+
   '<h4 style="margin:0 0 6px">'+xdYmTxt(d.ym)+' เทียบเฉลี่ย 3 เดือนก่อน</h4><div class="bh-cs" style="margin-bottom:14px">'+(ch||'<span class="faint">ไม่เปลี่ยนเกินเกณฑ์'+(r&&!r.base?' · ไม่มีข้อมูลเดือนก่อน':'')+'</span>')+'</div>'+
   (Object.keys(lts).length?'<div style="margin-bottom:14px"><b>การลาที่อนุมัติเดือนนี้:</b> '+Object.keys(lts).map(function(t){return esc(t)+' '+tpN(lts[t])+' วัน'}).join(' · ')+'</div>':'')+
   '<h4 style="margin:0 0 6px">6 เดือนล่าสุด</h4>'+tb+'<div class="faint" style="font-size:12px;margin-top:8px">หน่วย: วัน (สาย/แก้เวลา/นอกพื้นที่ = จำนวนวัน) · สาย = เกิน 15 นาที</div>',
   '<button class="btn" data-go2="rmx">ดู Matrix ลงเวลา</button>');
  var g=$('[data-go2="rmx"]');if(g)g.onclick=function(){closeD();A.attTab='mx';go('att')}}
