import { Resend } from 'resend';

// ─── Lazy initialization ──────────────────────────
// Constructed on first use so dotenv has loaded by then.
let _resend = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) return null;
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_ADDRESS = process.env.RESEND_FROM || 'onboarding@resend.dev';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'Wanderlist';

// ─── Centralized sender ───────────────────────────
async function sendEmail({ to, subject, html, text }) {
  const client = getResend();
  if (!client) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping email');
    return { skipped: true };
  }

  const from = `${process.env.RESEND_FROM_NAME || 'Wanderlist'} <${process.env.RESEND_FROM || 'onboarding@resend.dev'}>`;

  try {
    const result = await client.emails.send({
      from,
      to,
      subject,
      html,
      text: text || htmlToPlainText(html),
    });

    if (result.error) {
      console.error('📧 Resend error:', result.error);
      return { ok: false, error: result.error };
    }

    console.log(`✅ Email sent to ${to}: "${subject}" (id: ${result.data?.id})`);
    return { ok: true, id: result.data?.id };
  } catch (err) {
    console.error('📧 Email send failed:', err.message);
    return { ok: false, error: err.message };
  }
}

function htmlToPlainText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Shared template wrapper ──────────────────────
function wrapTemplate({ heading, body, ctaText, ctaUrl, footer }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,61,46,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0F3D2E 0%,#1B5E3F 100%);padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                🌿 Wanderlist
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:48px 40px 32px;">
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;color:#0F3D2E;margin:0 0 24px;line-height:1.2;letter-spacing:-0.5px;">
                ${heading}
              </h1>
              <div style="font-size:15px;line-height:1.7;color:#1a1a1a;">
                ${body}
              </div>
              ${
                ctaText && ctaUrl
                  ? `
              <div style="margin-top:32px;">
                <a href="${ctaUrl}" style="display:inline-block;background:#1B5E3F;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;font-size:14px;">
                  ${ctaText}
                </a>
              </div>`
                  : ''
              }
            </td>
          </tr>

          <tr>
            <td style="background:#F4F5F7;padding:24px 40px;text-align:center;border-top:1px solid #E4E7EA;">
              <div style="font-size:12px;color:#5F6B71;line-height:1.6;">
                ${footer || 'Wanderlist — Travel itineraries crafted by real travelers.'}
                <br/>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color:#1B5E3F;text-decoration:none;">wanderlist.io</a>
              </div>
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

// ════════════════════════════════════════════════════
//  TEMPLATE 1 — Welcome email
// ════════════════════════════════════════════════════
export async function sendWelcomeEmail({ to, name }) {
  const html = wrapTemplate({
    heading: `Welcome, ${name?.split(' ')[0] || 'traveler'} 🌿`,
    body: `
      <p style="margin:0 0 16px;">You just joined a marketplace built for travelers who care about doing trips right.</p>
      <p style="margin:0 0 16px;">Here's what you can do now:</p>
      <ul style="padding-left:20px;margin:0 0 16px;">
        <li style="margin-bottom:8px;"><strong>Explore</strong> hundreds of day-by-day itineraries from real travelers</li>
        <li style="margin-bottom:8px;"><strong>Buy</strong> a plan once and own it forever</li>
        <li style="margin-bottom:8px;"><strong>Create</strong> your own and earn 85% of every sale</li>
      </ul>
      <p style="margin:0;">No fluff, no SEO content — just honest plans from people who've actually been there.</p>
    `,
    ctaText: 'Explore the marketplace →',
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/browse`,
    footer: `You're receiving this because you signed up at Wanderlist.<br/>If this wasn't you, just ignore this email.`,
  });

  return sendEmail({
    to,
    subject: '🌿 Welcome to Wanderlist',
    html,
  });
}

// ════════════════════════════════════════════════════
//  TEMPLATE 2 — Purchase receipt
// ════════════════════════════════════════════════════
export async function sendPurchaseReceiptEmail({
  to,
  buyerName,
  itineraryTitle,
  itinerarySlug,
  amount,
  orderId,
}) {
  const html = wrapTemplate({
    heading: 'Your plan is ready ✓',
    body: `
      <p style="margin:0 0 24px;">Hi ${buyerName?.split(' ')[0] || 'there'} — your purchase is confirmed and your itinerary is now in your library.</p>

      <div style="background:#D4E9D8;border-radius:12px;padding:20px;margin:0 0 24px;">
        <div style="font-size:11px;font-weight:700;color:#0F3D2E;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">You purchased</div>
        <div style="font-family:Georgia,serif;font-size:22px;color:#0F3D2E;margin-bottom:12px;line-height:1.2;">${itineraryTitle}</div>
        <div style="font-size:13px;color:#1B5E3F;">
          Amount: <strong>$${amount}</strong><br/>
          Order ID: <code style="font-size:12px;">${orderId}</code>
        </div>
      </div>

      <p style="margin:0 0 16px;">You now have lifetime access to this plan. Open it any time from your trips dashboard.</p>
    `,
    ctaText: 'Open your plan →',
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/itinerary/${itinerarySlug}`,
    footer: `This is your receipt — keep it for your records.<br/>Need help? Reply to this email.`,
  });

  return sendEmail({
    to,
    subject: `🌿 Receipt: ${itineraryTitle}`,
    html,
  });
}

// ════════════════════════════════════════════════════
//  TEMPLATE 3 — Creator sale notification
// ════════════════════════════════════════════════════
export async function sendCreatorSaleEmail({
  to,
  creatorName,
  itineraryTitle,
  buyerName,
  earnings,
}) {
  const html = wrapTemplate({
    heading: 'You just made a sale 💸',
    body: `
      <p style="margin:0 0 24px;">${creatorName?.split(' ')[0] || 'Hi'}, one of your itineraries was just purchased.</p>

      <div style="background:#D4E9D8;border-radius:12px;padding:20px;margin:0 0 24px;">
        <div style="font-size:11px;font-weight:700;color:#0F3D2E;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Sale details</div>
        <div style="font-family:Georgia,serif;font-size:22px;color:#0F3D2E;margin-bottom:12px;line-height:1.2;">${itineraryTitle}</div>
        <div style="font-size:13px;color:#1B5E3F;">
          You earned: <strong>$${earnings}</strong> (85% share)<br/>
          Buyer: ${buyerName || 'A traveler'}
        </div>
      </div>

      <p style="margin:0;">Keep creating. Every sale is someone's trip getting better because of you.</p>
    `,
    ctaText: 'See your listings →',
    ctaUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/my-listings`,
    footer: `You're earning passive income from work you already did. That's the goal.`,
  });

  return sendEmail({
    to,
    subject: `💸 New sale: ${itineraryTitle}`,
    html,
  });
}