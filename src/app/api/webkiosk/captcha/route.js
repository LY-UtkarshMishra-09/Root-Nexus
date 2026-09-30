import { NextResponse } from 'next/server';
import { generateLocalName } from '@/utils/jiitPortalApi';

const API_BASE_URL = 'https://webportal.jiit.ac.in:6011/StudentPortalAPI';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/token/getcaptcha`, {
      method: 'GET',
      headers: {
        'LocalName': generateLocalName(),
      },
      signal: AbortSignal.timeout(6000),
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
      captcha: {
        hidden: captcha.hidden,
        image: `data:image/jpeg;base64,${captcha.image}`,
      },
    });
  } catch (err) {
    console.error('[Webportal Captcha Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: `Could not retrieve captcha from webportal: ${err.message}`,
      },
      { status: 502 }
    );
  }
}
