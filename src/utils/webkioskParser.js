import * as cheerio from 'cheerio';

/**
 * Extracts and maps standard JIIT course short names and credits
 */
export function getCourseMetadata(code, fullName = '') {
  const normalizedCode = (code || '').toUpperCase().trim();
  const lowerName = (fullName || '').toLowerCase();

  if (normalizedCode.includes('CS111') || lowerName.includes('software development fundamentals')) {
    return { shortName: 'SDF-1', credits: 4, room: 'LT-1' };
  }
  if (normalizedCode.includes('MA111') || lowerName.includes('mathematics')) {
    return { shortName: 'Maths-1', credits: 4, room: 'LT-2' };
  }
  if (normalizedCode.includes('PH111') || (lowerName.includes('physics') && !lowerName.includes('lab'))) {
    return { shortName: 'Physics', credits: 4, room: 'LT-1' };
  }
  if (normalizedCode.includes('ME111') || lowerName.includes('workshop')) {
    return { shortName: 'Workshop', credits: 2, room: 'Mechanical Workshop' };
  }
  if (normalizedCode.includes('HS111') || lowerName.includes('communication') || lowerName.includes('english')) {
    return { shortName: 'Soft Skills', credits: 2, room: 'G-12' };
  }
  if (normalizedCode.includes('CS171') || (lowerName.includes('sdf') && lowerName.includes('lab'))) {
    return { shortName: 'SDF Lab', credits: 2, room: 'Computer Lab 2 (Abb-III)' };
  }
  if (normalizedCode.includes('PH171') || (lowerName.includes('physics') && lowerName.includes('lab'))) {
    return { shortName: 'Physics Lab', credits: 1, room: 'TS-1 Physics Lab' };
  }

  // Generic fallback
  const words = fullName.split(/\s+/).filter((w) => w.length > 2);
  const firstLetters = words.map((w) => w[0].toUpperCase()).join('');
  return { shortName: firstLetters || code, credits: 3, room: 'LT-1' };
}

/**
 * Parses raw HTML string from JIIT Webkiosk attendance inquiry page or timetable page
 * @param {string} html Raw HTML source
 * @returns {Object} Extracted student profile (batch, name, etc.) and subjects list
 */
export function parseWebkioskHtml(html) {
  if (!html || typeof html !== 'string') {
    return { studentName: '', batch: '', enrollmentNumber: '', branch: '', subjects: [] };
  }

  const $ = cheerio.load(html);
  const subjects = [];

  // Extract Student Info from headers, greetings, or meta tables
  let studentName = '';
  let batch = '';
  let enrollmentNumber = '';
  let branch = '';

  const fullText = $.text();

  // Try extracting Name
  const nameMatch = fullText.match(/(?:Welcome\s*[:,-]?\s*|Name\s*[:,-]?\s*)([A-Z\s]{3,35})(?:\s*\(|\s*Enroll|\s*Batch|\s*Branch|\s*Logout)/i);
  if (nameMatch) {
    studentName = nameMatch[1].trim();
  }

  // Try extracting Enrollment Number
  const enrollMatch = fullText.match(/(?:Enrollment\s*(?:No|Number)?\s*[:,-]?\s*|\b)([0-9]{9,10})\b/i);
  if (enrollMatch) {
    enrollmentNumber = enrollMatch[1].trim();
  }

  // Try extracting Batch (e.g. 128-B3, B4, B3, F4, etc.)
  const batchMatch = fullText.match(/(?:Batch\s*[:,-]?\s*|\bBatch\s+)([0-9]{3}-[A-Z0-9]{1,4}|[A-Z][0-9]{1,3})\b/i);
  if (batchMatch) {
    batch = batchMatch[1].trim().toUpperCase();
  } else {
    // Check if table cells contain batch patterns like "128-B3" or "B3"
    $('td, th, span, div').each((_, el) => {
      const txt = $(el).text().trim();
      const cellBatch = txt.match(/\b(128-B[1-9]|B[1-9]|F[1-9]|CSE-128-B[1-9])\b/i);
      if (cellBatch && !batch) {
        batch = cellBatch[1].toUpperCase();
      }
    });
  }

  // If batch still not found, derive standard Sector-128 batch from enrollment if available
  if (!batch && enrollmentNumber && enrollmentNumber.length >= 8) {
    const yr = enrollmentNumber.startsWith('24') ? '128-B' : 'B';
    const lastDigits = parseInt(enrollmentNumber.slice(-2), 10) || 1;
    batch = `${yr}${(lastDigits % 6) + 1}`;
  }

  // Parse Attendance Table Rows
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 3) return;

    const rowText = $(row).text().replace(/\s+/g, ' ').trim();
    if (
      rowText.toLowerCase().includes('subject name') ||
      rowText.toLowerCase().includes('subject code') ||
      rowText.toLowerCase().includes('course code')
    ) {
      return;
    }

    let subjectRaw = '';
    let attended = 0;
    let total = 0;
    let percentage = 0;

    const cellTexts = [];
    cells.each((_, c) => cellTexts.push($(c).text().replace(/\s+/g, ' ').trim()));

    for (let i = 0; i < cellTexts.length; i++) {
      const text = cellTexts[i];
      const codeMatch = text.match(/([0-9]{2}[A-Z0-9]{2,8})/i);
      if (codeMatch && !subjectRaw) {
        subjectRaw = text;
      }
    }

    let foundPct = false;
    let foundAttended = false;
    let foundTotal = false;

    for (let i = cellTexts.length - 1; i >= 0; i--) {
      const val = cellTexts[i].replace('%', '').trim();
      const num = parseFloat(val);

      if (!isNaN(num)) {
        if (!foundPct && (cellTexts[i].includes('%') || (num <= 100 && num >= 0 && (num % 1 !== 0 || i === cellTexts.length - 1)))) {
          percentage = num;
          foundPct = true;
          continue;
        }
        if (!foundAttended) {
          attended = parseInt(val, 10);
          foundAttended = true;
          continue;
        }
        if (!foundTotal) {
          total = parseInt(val, 10);
          foundTotal = true;
          continue;
        }
      }
    }

    if (subjectRaw && (total > 0 || attended > 0 || percentage > 0)) {
      if (total < attended && total > 0) {
        const temp = total;
        total = attended;
        attended = temp;
      }

      if (percentage === 0 && total > 0) {
        percentage = parseFloat(((attended / total) * 100).toFixed(1));
      }

      let code = '';
      let name = subjectRaw;

      const codeMatch = subjectRaw.match(/([0-9]{2}[A-Z0-9]{5,10})/i);
      if (codeMatch) {
        code = codeMatch[1].toUpperCase();
        name = subjectRaw.replace(codeMatch[0], '').replace(/^[\s\-–—:]+/, '').trim();
      } else {
        code = subjectRaw.slice(0, 10).toUpperCase();
      }

      const meta = getCourseMetadata(code, name);
      const id = code.toLowerCase().replace(/[^a-z0-9]/g, '-');

      subjects.push({
        id: id || `sub-${subjects.length + 1}`,
        code: code || `24B11CS${100 + subjects.length}`,
        name: name || subjectRaw,
        shortName: meta.shortName,
        attended: Math.max(0, attended),
        total: Math.max(attended, total),
        percentage: percentage || (total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0),
        credits: meta.credits,
        room: meta.room,
      });
    }
  });

  return {
    studentName: studentName || 'JIIT Student',
    enrollmentNumber: enrollmentNumber || '',
    batch: batch || '128-B3',
    branch: branch || 'Computer Science & Engineering',
    subjects,
  };
}
