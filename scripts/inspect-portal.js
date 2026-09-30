process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function searchPwdLoginServices() {
  const url = 'https://webportal.jiit.ac.in:6011/studentportal/main.b245565e3c2f3033.js';
  const js = await fetch(url).then(r => r.text());

  const idx = js.indexOf('.pwdloginsevices(');
  console.log('Index of .pwdloginsevices(:', idx);
  if (idx !== -1) {
    console.log(js.slice(Math.max(0, idx - 400), idx + 800));
  }
}
searchPwdLoginServices().catch(console.error);
