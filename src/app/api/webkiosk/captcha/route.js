import { NextResponse } from 'next/server';
import { generateLocalName, PORTAL_BASE_URLS } from '@/utils/jiitPortalApi';

export async function GET() {
  let lastErr = null;

  for (const baseUrl of PORTAL_BASE_URLS) {
    try {
      const res = await fetch(`${baseUrl}/token/getcaptcha`, {
        method: 'GET',
        headers: {
          'LocalName': generateLocalName(),
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        throw new Error(`Webportal returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const captcha = data?.response?.captcha;

      if (!captcha || !captcha.hidden || !captcha.image) {
        throw new Error('Webportal did not return a valid captcha object');
      }

      return NextResponse.json({
        success: true,
        source: baseUrl,
        captcha: {
          hidden: captcha.hidden,
          image: `data:image/jpeg;base64,${captcha.image}`,
        },
      });
    } catch (err) {
      lastErr = err;
      console.warn(`[Captcha Failover] Failed on ${baseUrl}: ${err.message}. Trying next...`);
    }
  }

  console.error('[Webportal Captcha Error]', lastErr);
  return NextResponse.json(
    {
      success: false,
      error: `Could not retrieve captcha from webportal: ${lastErr?.message || 'All endpoints failed'}`,
    },
    { status: 502 }
  );
}

