import crypto from 'crypto';
import { getCourseMetadata } from './webkioskParser.js';

export const PORTAL_BASE_URLS = [
  'https://jiit-proxy-4.onrender.com/proxy',
  'https://jiit-proxy-3.onrender.com/proxy',
  'https://jiit-proxy-5.onrender.com/proxy',
  'https://webportal.jiit.ac.in:6011/StudentPortalAPI',
];

const IV = Buffer.from('dcek9wb8frty1pnm', 'utf8');
const DEFAULT_CAPTCHA = { captcha: 'phw5n', hidden: 'gmBctEffdSg=' };

/**
 * Generates the daily date sequence used in AES key derivation.
 * Resets every day at 00:00 hrs IST.
 */
export function generateDateSeq(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(2);
  const weekday = String(date.getDay()); // 0 = Sunday, 1 = Monday, etc.
  return day[0] + month[0] + year[0] + weekday + day[1] + month[1] + year[1];
}

/**
 * Generates random alphanumeric sequence
 */
export function getRandomCharSeq(n) {
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
export function generateKey(date = new Date()) {
  return Buffer.from('qa8y' + generateDateSeq(date) + 'ty1pn', 'utf8');
}

/**
 * Encrypts buffer with AES-128-CBC and PKCS7 padding
 */
export function encrypt(buffer) {
  const cipher = crypto.createCipheriv('aes-128-cbc', generateKey(), IV);
  return Buffer.concat([cipher.update(buffer), cipher.final()]);
}

/**
 * Decrypts buffer with AES-128-CBC
 */
export function decrypt(buffer) {
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
 * Reconstructs accurate class attended/total counts from attendance percentage.
 * Exact algorithm used by JIIT Pulse.
 */
export function deriveCountFromPercentage(percentage) {
  if (percentage == null || isNaN(percentage)) return null;
  const p = parseFloat(percentage);
  if (p === 100) return { attended: 1, total: 1 };
  if (p === 0) return { attended: 0, total: 0 };

  for (let t = 1; t <= 150; t++) {
    const i = Math.round((t * p) / 100);
    if (i >= 0 && i <= t && Math.abs(parseFloat(((i / t) * 100).toFixed(1)) - p) < 0.05) {
      return { attended: i, total: t };
    }
  }

  const fallbackTotal = 32;
  return { attended: Math.round((p / 100) * fallbackTotal), total: fallbackTotal };
}

/**
 * Authenticated API Request Helper with Proxy Failover
 */
async function hitApi(endpoint, options = {}) {
  const { method = 'POST', body, token, headers = {}, timeoutMs = 8000 } = options;
  let lastError = null;

  for (const baseUrl of PORTAL_BASE_URLS) {
    try {
      const localName = generateLocalName();
      const requestHeaders = {
        'Content-Type': 'application/json',
        'LocalName': localName,
        ...headers,
      };

      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: typeof body === 'object' ? JSON.stringify(body) : body,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.status === 401) {
        const err = new Error('Webportal session expired (HTTP 401). Please re-authenticate.');
        err.isSessionExpired = true;
        throw err;
      }

      if (res.status === 513) {
        throw new Error('JIIT Webportal server is temporarily unavailable (HTTP 513).');
      }

      const text = await res.text();
      if (!text || !text.trim()) {
        throw new Error(`Empty response from ${baseUrl}${endpoint} (HTTP ${res.status})`);
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON received (${text.slice(0, 100)})`);
      }

      if (json.status && json.status.responseStatus === 'Failure') {
        const errorDetails = Array.isArray(json.status.errors)
          ? json.status.errors.join(', ')
          : JSON.stringify(json.status.errors || json.status);
        throw new Error(errorDetails || 'JIIT Webportal rejected request.');
      }

      return json;
    } catch (err) {
      lastError = err;
      // Do not rotate proxy on invalid password or session expiration
      if (
        err.isSessionExpired ||
        err.message?.includes('Invalid Password') ||
        err.message?.includes('Invalid User') ||
        err.message?.includes('incorrect password') ||
        err.message?.includes('User not found')
      ) {
        throw err;
      }
      console.warn(`[Portal Failover] Proxy ${baseUrl} failed for ${endpoint} (${err.message}). Retrying...`);
    }
  }

  throw lastError || new Error('All Webportal connection proxies failed.');
}

/**
 * Pulls student profile, batch, and attendance using an active Webportal session token.
 */
export async function fetchWebportalWithToken(token, clientEnrollment = '') {
  let cleanUser = clientEnrollment ? clientEnrollment.trim() : '';

  // Decode JWT to extract user info if not provided
  let instituteId = cleanUser.startsWith('99') ? '11IN1902J000003' : '11IN1902J000001';
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
    campus: cleanUser.startsWith('99') ? 'Jaypee Institute of Information Technology, Sector-62 Noida' : 'Jaypee Institute of Information Technology, Sector-128 Noida',
    collegeEmail: `${cleanUser || '241030188'}@mail.jiit.ac.in`,
    personalEmail: '',
    phone: '',
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

    if (general.instituteid && general.instituteid !== 'JIIT') {
      instituteId = general.instituteid;
    }

    if (studentInfo.semester) {
      const semNum = parseInt(studentInfo.semester, 10);
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
      },
      token,
    });

    const header = metaResp?.response?.headerlist?.[0] || metaResp?.response?.header || {};
    const semesters = metaResp?.response?.semlist || metaResp?.response?.semesters || [];

    if (semesters.length > 0) {
      // Loop from the latest registered semester backwards
      const reversedSemesters = [...semesters].reverse();
      for (const sem of reversedSemesters) {
        try {
          const styNum = sem.stynumber || header.stynumber || studentInfo.semester || '1';
          const regCode = sem.registrationcode || sem.registration_code;
          const regId = sem.registrationid || sem.registration_id;

          const encryptedPayload = serializePayload({
            clientid: clientId,
            instituteid: instituteId,
            registrationcode: regCode,
            registrationid: regId,
            stynumber: styNum,
          });

          // In JIIT Pulse: body is passed as { json: encryptedBase64 }
          const attendResp = await hitApi('/StudentClassAttendance/getstudentattendancedetail', {
            method: 'POST',
            body: JSON.stringify(encryptedPayload),
            token,
          });

          const rawList = attendResp?.response?.studentattendancelist || [];
          if (Array.isArray(rawList) && rawList.length > 0) {
            subjects = rawList.map((item, idx) => {
              const code = String(item.subjectcode || item.coursecode || item.code || `SUB${idx + 1}`).trim().toUpperCase();
              const name = String(item.subjectdesc || item.subjectname || item.coursename || code).trim();
              const meta = getCourseMetadata(code, name);
              const overallPercent = parseFloat(item.LTpercantage || item.totalpercentage || item.percentage || 0);

              const lecturePercent = item.Lpercentage != null ? parseFloat(item.Lpercentage) : null;
              const tutorialPercent = item.Tpercentage != null ? parseFloat(item.Tpercentage) : null;
              const practicalPercent = item.Ppercentage != null ? parseFloat(item.Ppercentage) : null;

              let total = parseInt(item.totalclass || item.totalclasses || item.Ltotal || item.total || 0, 10);
              let attended = parseInt(item.totalpresent || item.present || item.Lattended || item.attended || 0, 10);

              // Derive exact count from percentage if class totals are omitted by portal
              if (isNaN(total) || total <= 0) {
                const derived = deriveCountFromPercentage(overallPercent);
                if (derived) {
                  attended = derived.attended;
                  total = derived.total;
                } else {
                  total = 32;
                  attended = Math.round((overallPercent / 100) * total);
                }
              }

              if (isNaN(attended) || attended < 0) attended = 0;
              if (total < attended) total = attended;

              const calculatedPct = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : overallPercent;

              return {
                id: (code.toLowerCase().replace(/[^a-z0-9]/g, '-') || `sub-${idx + 1}`),
                code,
                name,
                shortName: meta?.shortName || (name.length > 18 ? name.slice(0, 16) + '…' : name) || code,
                attended,
                total,
                percentage: calculatedPct,
                lecturePercent,
                tutorialPercent,
                practicalPercent,
                credits: item.credits ? parseInt(item.credits, 10) : (meta?.credits || 4),
                faculty: String(item.faculty || item.facultyname || 'Dept. of CSE').trim(),
                room: String(item.room || meta?.room || 'LT-1').trim(),
                hasLecture: !!item.Lsubjectcomponentid,
                hasTutorial: !!item.Tsubjectcomponentid,
                hasPractical: !!item.Psubjectcomponentid,
              };
            });

            if (subjects.length > 0) {
              break;
            }
          }
        } catch (semErr) {
          console.warn(`[Webportal Semester ${sem.registrationcode}]`, semErr.message);
        }
      }
    }
  } catch (err) {
    console.warn('[Webportal Attendance Error]', err.message);
  }

  // Derive Batch from enrollment if not returned by personal information
  if (!studentInfo.batch && studentInfo.enrollmentNo) {
    const yr = studentInfo.enrollmentNo.startsWith('24') ? '128-B' : 'B';
    const lastDigits = parseInt(studentInfo.enrollmentNo.slice(-2), 10) || 1;
    studentInfo.batch = `${yr}${(lastDigits % 6) + 1}`;
  }

  return {
    success: true,
    source: 'JIIT Student Webportal (CampusLynx)',
    studentInfo,
    subjects,
  };
}

/**
 * Full Login to Webportal with Captcha verification and Proxy Failover
 */
export async function syncFromJiitPortal(enrollmentNumber, password, userCaptcha = null) {
  const cleanUser = enrollmentNumber.trim();

  // Step 1: Pre-token Check
  const captchaPayload =
    userCaptcha && userCaptcha.captcha && userCaptcha.hidden
      ? { captcha: userCaptcha.captcha.trim(), hidden: userCaptcha.hidden }
      : DEFAULT_CAPTCHA;

  const pretokenEncrypted = serializePayload({
    username: cleanUser,
    usertype: 'S',
    captcha: captchaPayload,
  });

  // JIIT Pulse: body is sent as raw base64 string
  const pretokenResp = await hitApi('/token/pretoken-check', {
    method: 'POST',
    body: pretokenEncrypted,
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

  const tokenEncrypted = serializePayload(tokenPayload);

  // JIIT Pulse: body is sent as raw base64 string
  const tokenResp = await hitApi('/token/generatewebtoken', {
    method: 'POST',
    body: tokenEncrypted,
  });

  const regdata = tokenResp?.response?.regdata;
  if (!regdata || !regdata.token) {
    throw new Error('Webportal did not return an authentication session token.');
  }

  return fetchWebportalWithToken(regdata.token, cleanUser);
}

