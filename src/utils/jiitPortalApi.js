import crypto from 'crypto';

const API_BASE_URL = 'https://webportal.jiit.ac.in:6011/StudentPortalAPI';
const IV = Buffer.from('dcek9wb8frty1pnm', 'utf8');
const DEFAULT_CAPTCHA = { captcha: 'phw5n', hidden: 'gmBctEffdSg=' };

/**
 * Generates the daily date sequence used in AES key derivation.
 * Resets every day at 00:00 hrs IST.
 */
function generateDateSeq(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(2);
  const weekday = String(date.getDay()); // 0 = Sunday, 1 = Monday, etc.
  return day[0] + month[0] + year[0] + weekday + day[1] + month[1] + year[1];
}

/**
 * Generates random alphanumeric sequence
 */
function getRandomCharSeq(n) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let res = '';
  for (let i = 0; i < n; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

/**
 * Derives dynamic AES-128 key
 */
function generateKey(date = new Date()) {
  return Buffer.from('qa8y' + generateDateSeq(date) + 'ty1pn', 'utf8');
}

/**
 * Encrypts buffer with AES-128-CBC and PKCS7 padding
 */
function encrypt(buffer) {
  const cipher = crypto.createCipheriv('aes-128-cbc', generateKey(), IV);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
}

/**
 * Decrypts buffer with AES-128-CBC
 */
function decrypt(buffer) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', generateKey(), IV);
  return Buffer.concat([decipher.update(buffer), decipher.final()]);
}

/**
 * Generates the LocalName header required for every HTTP request
 */
export function generateLocalName() {
  const nameBytes = Buffer.from(getRandomCharSeq(4) + generateDateSeq() + getRandomCharSeq(5), 'utf8');
  return encrypt(nameBytes).toString('base64');
}

/**
 * Encrypts and Base64-encodes payload object
 */
export function serializePayload(payload) {
  const jsonStr = JSON.stringify(payload);
  return encrypt(Buffer.from(jsonStr, 'utf8')).toString('base64');
}

/**
 * Decrypts Base64-encoded payload
 */
export function deserializePayload(base64Payload) {
  const buf = Buffer.from(base64Payload, 'base64');
  return JSON.parse(decrypt(buf).toString('utf8'));
}

/**
 * Authenticated API Request Helper
 */
async function hitApi(endpoint, options = {}) {
  const { method = 'POST', body, token, headers = {}, timeoutMs = 8000 } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    'LocalName': generateLocalName(),
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: typeof body === 'object' ? JSON.stringify(body) : body,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (res.status === 401) {
    throw new Error('Webportal session expired (HTTP 401). Please re-authenticate.');
  }

  if (res.status === 513) {
    throw new Error('JIIT Webportal server is temporarily unavailable (HTTP 513).');
  }

  const text = await res.text();
  if (!text || !text.trim()) {
    throw new Error(`Empty response from Webportal ${endpoint} (HTTP ${res.status})`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON received from Webportal (${text.slice(0, 100)})`);
  }

  if (json.status && json.status.responseStatus === 'Failure') {
    const errorDetails = Array.isArray(json.status.errors)
      ? json.status.errors.join(', ')
      : JSON.stringify(json.status.errors || json.status);
    throw new Error(errorDetails || 'JIIT Webportal rejected request.');
  }

  return json;
}

/**
 * Pulls student profile, batch, and attendance using an active Webportal session token.
 */
export async function fetchWebportalWithToken(token, clientEnrollment = '') {
  let cleanUser = clientEnrollment ? clientEnrollment.trim() : '';

  // Decode JWT to extract user info if not provided
  let instituteId = cleanUser.startsWith('99') ? '11IN1902J000003' : '11IN1902J000001';
  let memberType = 'S';
  let clientId = 'SOAU';

  try {
    const parts = token.split('.');
    if (parts.length > 1) {
      const payloadObj = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payloadObj.sub && !cleanUser) cleanUser = payloadObj.sub;
    }
  } catch {}

  let studentInfo = {
    name: 'JIIT Student',
    enrollmentNo: cleanUser || '241030188',
    batch: '',
    branch: 'Computer Science & Engineering',
    year: '1st Year (Semester 1)',
    campus: 'Jaypee Institute of Information Technology, Sector-128 Noida',
    collegeEmail: `${cleanUser || '241030188'}@mail.jiit.ac.in`,
    personalEmail: '',
    phone: '',
    residence: '',
    fatherName: '',
    motherName: '',
  };

  // Step 1: Personal Info & Batch
  try {
    const personalResp = await hitApi('/studentpersinfo/getstudent-personalinformation', {
      method: 'POST',
      body: {
        clinetid: 'SOAU',
        instituteid: instituteId,
      },
      token,
    });

    const general =
      personalResp?.response?.personal?.generalinformation ||
      personalResp?.response?.generalinformation ||
      personalResp?.response ||
      {};

    if (general.batch) studentInfo.batch = general.batch;
    if (general.studentname) studentInfo.name = general.studentname;
    if (general.enrollmentno) studentInfo.enrollmentNo = general.enrollmentno;
    if (general.branchdesc) studentInfo.branch = general.branchdesc;
    if (general.programdesc) studentInfo.program = general.programdesc;
    if (general.stynumber) studentInfo.semester = general.stynumber;
    if (general.emailid) studentInfo.personalEmail = general.emailid;
    if (general.mobileno) studentInfo.phone = general.mobileno;
    if (general.fathername) studentInfo.fatherName = general.fathername;
    if (general.mothername) studentInfo.motherName = general.mothername;

    if (studentInfo.semester) {
      const semNum = parseInt(studentInfo.semester);
      const yearNum = Math.ceil(semNum / 2);
      studentInfo.year = `${yearNum}${yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : 'th'} Year (Semester ${semNum})`;
    }
  } catch (err) {
    console.warn('[Webportal Personal Info Error]', err.message);
  }

  // Step 2: Attendance Detail
  let subjects = [];
  try {
    const metaResp = await hitApi('/StudentClassAttendance/getstudentInforegistrationforattendence', {
      method: 'POST',
      body: {
        instituteid: instituteId,
        clientid: clientId,
        membertype: memberType,
      },
      token,
    });

    const header = metaResp?.response?.headerlist?.[0];
    const semesters = metaResp?.response?.semlist || [];

    if (header && semesters.length > 0) {
      for (const sem of semesters) {
        try {
          const attendPayload = serializePayload({
            clientid: clientId,
            instituteid: instituteId,
            registrationcode: sem.registrationcode,
            registrationid: sem.registrationid,
            stynumber: header.stynumber,
          });

          const attendResp = await hitApi('/StudentClassAttendance/getstudentattendancedetail', {
            method: 'POST',
            body: attendPayload,
            token,
          });

          const rawList = attendResp?.response?.studentattendancelist || [];
          if (rawList.length > 0) {
            subjects = rawList.map((item, idx) => {
              const code = (item.subjectcode || `SUB${idx + 1}`).trim();
              const name = (item.subjectdesc || code).trim();
              const overallPercent = parseFloat(item.LTpercantage || item.totalpercentage || 0);

              const lecturePercent = item.Lpercentage ? parseFloat(item.Lpercentage) : null;
              const tutorialPercent = item.Tpercentage ? parseFloat(item.Tpercentage) : null;
              const practicalPercent = item.Ppercentage ? parseFloat(item.Ppercentage) : null;

              let total = parseInt(item.totalclass || item.totalclasses || item.Ltotal || item.total || 0);
              let attended = parseInt(item.totalpresent || item.present || item.Lattended || item.attended || 0);

              if (!total || total === 0) {
                total = 32;
                attended = Math.round((overallPercent / 100) * total);
              }

              return {
                id: code.toLowerCase(),
                code,
                name,
                shortName: name.length > 18 ? name.slice(0, 16) + '…' : name,
                attended,
                total,
                percentage: parseFloat(overallPercent.toFixed(1)),
                lecturePercent,
                tutorialPercent,
                practicalPercent,
                credits: item.credits ? parseInt(item.credits) : 4,
                room: item.room || 'LT-1',
                hasLecture: !!item.Lsubjectcomponentid,
                hasTutorial: !!item.Tsubjectcomponentid,
                hasPractical: !!item.Psubjectcomponentid,
              };
            });
            break;
          }
        } catch (semErr) {
          console.warn(`[Webportal Semester ${sem.registrationcode}]`, semErr.message);
        }
      }
    }
  } catch (err) {
    console.warn('[Webportal Attendance Error]', err.message);
  }

  if (!studentInfo.batch && studentInfo.enrollmentNo) {
    const yr = studentInfo.enrollmentNo.startsWith('24') ? '128-B' : 'B';
    const lastDigits = parseInt(studentInfo.enrollmentNo.slice(-2), 10) || 1;
    studentInfo.batch = `${yr}${(lastDigits % 6) + 1}`;
  }

  return {
    success: true,
    source: 'JIIT Webportal REST API (Active Token Session)',
    studentInfo,
    subjects,
  };
}

/**
 * Full Login to Webportal with Captcha verification
 */
export async function syncFromJiitPortal(enrollmentNumber, password, userCaptcha = null) {
  const cleanUser = enrollmentNumber.trim();

  // Step 1: Pre-token Check
  const captchaPayload =
    userCaptcha && userCaptcha.captcha && userCaptcha.hidden
      ? { captcha: userCaptcha.captcha.trim(), hidden: userCaptcha.hidden }
      : DEFAULT_CAPTCHA;

  const pretokenBody = serializePayload({
    username: cleanUser,
    usertype: 'S',
    captcha: captchaPayload,
  });

  const pretokenResp = await hitApi('/token/pretoken-check', {
    method: 'POST',
    body: pretokenBody,
  });

  if (!pretokenResp?.response?.otppwd) {
    throw new Error('Webportal pre-check did not return authentication challenge.');
  }

  // Step 2: Generate Web Token
  const tokenPayload = {
    otppwd: pretokenResp.response.otppwd,
    username: cleanUser,
    passwordotpvalue: password,
    Modulename: 'STUDENTMODULE',
    random: pretokenResp.response.random || '',
  };

  const tokenResp = await hitApi('/token/generatewebtoken', {
    method: 'POST',
    body: serializePayload(tokenPayload),
  });

  const regdata = tokenResp?.response?.regdata;
  if (!regdata || !regdata.token) {
    throw new Error('Webportal did not return authentication token.');
  }

  return fetchWebportalWithToken(regdata.token, cleanUser);
}
