// Resend — transactional email service
// Replace RESEND_API_KEY with your actual Resend API key

export const RESEND_API_KEY = 'YOUR_RESEND_API_KEY';
export const RESEND_FROM_EMAIL = 'Tomorrow <hello@tomorrow.app>';

const RESEND_API_URL = 'https://api.resend.com/emails/email';

/**
 * Send a letter delivery email to a recipient.
 * In production, this would be called from a backend/cloud function
 * triggered by a scheduled job (e.g., Supabase Edge Function + pg_cron).
 *
 * For Phase 1 MVP, letters are dispatched immediately on delivery date
 * via a cloud function.
 *
 * @param {object} opts
 * @param {string} opts.to - recipient email
 * @param {string} opts.senderName - sender display name
 * @param {string} opts.subject - letter subject line
 * @param {string} opts.body - plain text body (fallback)
 * @param {string} [opts.bodyHtml] - rich HTML body (preferred, used if provided)
 * @param {string} opts.letterId - Firestore letter ID
 */
export async function sendLetterEmail({ to, senderName, subject, body, bodyHtml, letterId }) {
  if (RESEND_API_KEY === 'YOUR_RESEND_API_KEY') {
    console.warn('[Resend] API key not configured. Skipping email send.');
    return { success: false, reason: 'API key not configured' };
  }

  const claimUrl = `${window.location.origin}/letter/${letterId}`;
  const tonePrefix = getTonePrefix(subject);
  const emailSubject = `${tonePrefix} A letter from ${senderName}`;

  const html = buildLetterEmailHtml({ senderName, subject, body, bodyHtml, claimUrl, emailSubject });

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject: emailSubject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('[Resend] Failed to send email:', error);
      return { success: false, reason: error };
    }

    return { success: true };
  } catch (err) {
    console.error('[Resend] Error sending email:', err);
    return { success: false, reason: err.message };
  }
}

function getTonePrefix(subject) {
  if (!subject) return '';
  const lower = subject.toLowerCase();
  if (lower.includes('[quiet]')) return '📖';
  if (lower.includes('[urgent]')) return '⚡';
  if (lower.includes('[playful]')) return '✨';
  if (lower.includes('[somber]')) return '🕯';
  return '';
}

function buildLetterEmailHtml({ senderName, subject, body, bodyHtml, claimUrl, emailSubject }) {
  // Use rich HTML body if provided, otherwise fall back to plain text with newline conversion
  const emailBody = bodyHtml
    ? bodyHtml
    : `<p style="font-family:'Georgia',serif;font-size:17px;line-height:1.8;color:#1c1917;margin-bottom:32px;">${escapeHtml(body || '').replace(/\n/g, '<br>')}</p>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${emailSubject}</title>
</head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;">
                Tomorrow
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;padding:48px 40px;border:1px solid rgba(0,0,0,0.05);">
              <!-- Stamp / wax seal visual -->
              <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;width:56px;height:56px;background:#e85d04;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;">
                  <span style="color:white;font-size:24px;">✦</span>
                </div>
              </div>

              <!-- From -->
              <p style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#a1a1aa;margin-bottom:8px;text-align:center;">
                A letter from
              </p>
              <p style="font-family:'Georgia',serif;font-size:22px;font-weight:600;color:#1c1917;margin-bottom:24px;text-align:center;">
                ${escapeHtml(senderName)}
              </p>

              <!-- Divider -->
              <div style="border-top:1px solid rgba(0,0,0,0.06);margin:24px 0;"></div>

              <!-- Subject -->
              ${subject ? `<p style="font-family:'Georgia',serif;font-size:16px;font-style:italic;color:#78716c;margin-bottom:16px;text-align:center;">${escapeHtml(subject)}</p>` : ''}

              <!-- Body -->
              ${bodyHtml
                ? `<div style="font-family:'Georgia',serif;font-size:17px;line-height:1.8;color:#1c1917;margin-bottom:32px;">${bodyHtml}</div>`
                : emailBody
              }

              <!-- CTA -->
              <div style="text-align:center;margin-top:32px;">
                <a href="${claimUrl}"
                   style="display:inline-block;background:#e85d04;color:#ffffff;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;padding:14px 32px;border-radius:6px;text-decoration:none;letter-spacing:0.01em;">
                  Open Your Letter
                </a>
              </div>

              <p style="font-family:'Inter',sans-serif;font-size:12px;color:#a1a1aa;text-align:center;margin-top:20px;line-height:1.6;">
                This letter will be available to claim for 7 days.<br>
                Once opened, it will be sealed forever.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="font-family:'Inter',sans-serif;font-size:12px;color:#a1a1aa;">
                Tomorrow — A message from the past.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
