/* ระบบทดสอบ (DEV) · โหลดเป็นสคริปต์แรกของทุกหน้า (tools/deploy-dev.sh ใส่ให้)
 * 1) แยกค่าที่จำในเบราว์เซอร์ (localStorage/sessionStorage) ออกจากระบบจริงที่อยู่โดเมนเดียวกัน → ใส่คำนำหน้า "dev:"
 *    กันกรณี dev อ่าน token ของระบบจริงแล้วลบทิ้ง (ทำให้หลุดจากระบบจริง)
 * 2) แถบสีส้ม + ป้าย "DEV · ระบบทดสอบ" + [DEV] หน้าชื่อแท็บ */
(function () {
  var P = 'dev:', S = Storage.prototype;
  ['getItem', 'setItem', 'removeItem'].forEach(function (m) {
    var o = S[m];
    S[m] = function (k) { var a = Array.prototype.slice.call(arguments); a[0] = P + k; return o.apply(this, a); };
  });
  S.clear = function () {
    for (var i = this.length - 1; i >= 0; i--) { var k = S.key.call(this, i); if (k && k.indexOf(P) === 0) this.removeItem(k.slice(P.length)); }
  };
  var tag = function () { if (document.title.indexOf('[DEV]') !== 0) document.title = '[DEV] ' + document.title; };
  document.addEventListener('DOMContentLoaded', function () {
    var st = document.createElement('style');
    st.textContent = 'html{box-shadow:inset 0 4px 0 #F28C28}#dev-flag{position:fixed;left:10px;bottom:10px;z-index:2147483647;background:#F28C28;color:#fff;font:600 12px/1 system-ui,sans-serif;padding:6px 10px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);pointer-events:none}';
    document.head.appendChild(st);
    var f = document.createElement('div'); f.id = 'dev-flag'; f.textContent = 'DEV · ระบบทดสอบ'; document.body.appendChild(f);
    tag(); var t = document.querySelector('title'); if (t) new MutationObserver(tag).observe(t, { childList: true });
  });
})();
