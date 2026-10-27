/* Push Media HR · ค่าระบบทดสอบ (DEV) · หน้าเว็บ https://itsupport2-pixel.github.io/pushmedia-hr-dev/
 * หลังบ้าน = Worker pushmedia-hr-api-dev + D1 pushmedia-hr-dev (สำเนาที่ปิดบังข้อมูลส่วนตัว) · ไม่กระทบระบบจริง
 * LINE: ใช้ช่อง Developing (2012151622) เท่านั้น · ตั้ง Endpoint ของช่องนี้เป็นหน้าเว็บ dev */
(function () {
  var LIFF_DEV = '2012151622-Z47Zaz4B';
  // ทดลองทางสำรอง: ช่อง LINE Login (LIFF ธรรมดา) · ใส่ LIFF ID แล้วเปิด …/pushmedia-hr-dev/liff.html?ch=login (Endpoint ของ LIFF ต้องมี ?ch=login)
  var LIFF_LOGIN_DEV = '2012235420-6f857ZDw';   // ช่อง LINE Login 2012235420 · LIFF "Push Media Center (ทดสอบ)"
  var q = new URLSearchParams(location.search), st = decodeURIComponent(q.get('liff.state') || ''), useLogin = q.get('ch') === 'login' || q.get('liffClientId') === '2012235420' || /[?&]ch=login\b/.test(st);
  try { if (useLogin) sessionStorage.setItem('pmhr_ch', 'login'); else useLogin = sessionStorage.getItem('pmhr_ch') === 'login'; } catch (e) {}
  if (useLogin) LIFF_DEV = LIFF_LOGIN_DEV;   // ยังไม่ใส่ LIFF ID ของช่องสำรอง → หน้าแอปขึ้น "ยังไม่ได้ตั้งค่า LIFF ID" (ไม่แอบใช้ช่อง MINI App)
  var GOOGLE_CLIENT_ID = '902459045498-tnh7v08k557koh0flhds23hs5mg69r4h.apps.googleusercontent.com';
  window.HR_CONFIG = { api: 'https://pushmedia-hr-api-dev.itsupport2-3a4.workers.dev', liffId: LIFF_DEV, channel: useLogin ? 'login' : 'dev', backend: 'cf', googleClientId: GOOGLE_CLIENT_ID, env: 'dev',
    backup: 'https://script.google.com/macros/s/AKfycbyi-htjhk6Y17o51CDP6u3RpK4lmtilVEtQjHWEs7XC1MQml69jXL5bQPhWHyqtrYNc/exec' };   // ระบบสำรองการลงเวลา (รายการจาก dev ติดป้าย env=dev · ไม่นำเข้าระบบจริง)
})();
