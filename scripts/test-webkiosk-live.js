const cheerio = require('cheerio');

async function testWebkiosk() {
  const r1 = await fetch('https://webkiosk.jiit.ac.in/index.jsp');
  const h1 = await r1.text();
  const c = r1.headers.get('set-cookie');
  const sid = c.match(/JSESSIONID=([^;]+)/)[1];
  const capMatch = h1.match(/font\s+face=["']?casteller["']?[^>]*>([^<]+)</i);
  const cap = capMatch ? capMatch[1].trim() : 'ABCD';

  console.log('Captcha:', cap, 'Session:', sid);

  const p = new URLSearchParams();
  p.append('reqfrom', 'jsp');
  p.append('x', '');
  p.append('txtInst', 'Institute');
  p.append('InstCode', 'JIIT');
  p.append('txtuType', 'Member Type');
  p.append('UserType101117', 'S');
  p.append('txtCode', 'Enrollment No');
  p.append('MemberCode', '241030188');
  p.append('DOB', 'DOB');
  p.append('DATE1', '15-08-2006');
  p.append('txtPin', 'Password/Pin');
  p.append('Password101117', 'wrongpassword');
  p.append('txtcap', cap);
  p.append('BTNSubmit', 'Submit');

  const r2 = await fetch('https://webkiosk.jiit.ac.in/CommonFiles/UseValid.jsp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: 'JSESSIONID=' + sid,
      Referer: 'https://webkiosk.jiit.ac.in/index.jsp'
    },
    body: p.toString()
  });
  const h2 = await r2.text();
  const text = cheerio.load(h2).text().replace(/\s+/g, ' ').trim();
  console.log('Webkiosk response message:', text);
}

testWebkiosk().catch(console.error);
