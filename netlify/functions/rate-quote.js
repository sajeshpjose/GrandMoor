// Rate calculator endpoint: verifies the Cloudflare Turnstile token, prices the quote,
// records the lead through the Netlify "contact" form (team email + ShipDash CRM), returns the
// lead summary so the page can send it on to Zoho CRM via n8n, and emails
// the visitor a branded PDF rate sheet via Resend.
// Requires TURNSTILE_SECRET_KEY and RESEND_API_KEY. Optional: RATE_FROM_EMAIL, RATE_REPLY_TO.

const { buildQuote, money, tierLabel, VALID_DAYS } = require('../lib/rates');
const { buildRateSheetPdf, dateFmt } = require('../lib/pdf');

const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_URL = 'https://api.resend.com/emails';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (s, max) => String(s == null ? '' : s).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

function describePallets(q) {
  if (q.size === 'regular') return `${q.pallets} regular pallets`;
  if (q.size === 'oversized') return `${q.pallets} oversized pallets`;
  return `${q.pallets} pallets (${q.regular} regular, ${q.oversized} oversized)`;
}

function emailBodies({ quote, contact, validUntil, replyTo }) {
  const first = contact.name.split(' ')[0];
  const items = [];
  if (quote.regular) items.push(['Pallet storage, regular size', quote.regular, quote.regularRate]);
  if (quote.oversized) items.push(['Pallet storage, oversized', quote.oversized, quote.oversizedRate]);
  const summary = `${describePallets(quote)} at ${money(quote.monthly)} per month`;
  const text = [
    `Hi ${first},`,
    '',
    `Thanks for using the GrandMoor rate calculator. Your rate sheet is attached.`,
    '',
    `Your estimate: ${summary}, before taxes.`,
    '',
    `The rate sheet assumes at least ${quote.tier.min} pallet${quote.tier.min === 1 ? '' : 's'} in storage and is valid for ${VALID_DAYS} days, until ${validUntil}.`,
    '',
    `We also offer Container Destuffing, Pick and Pack, Final Mile Delivery, and Amazon / Marketplace Fulfillment. Pricing depends on your number of orders, number of SKUs and item weight. Call +1 888 505 6667, email info@grandmoor.com or fill in our qualifier form at https://grandmoor.ca/qualify for details.`,
    '',
    `Got any questions? Please email info@grandmoor.com (or just reply to this email) or call +1 888 505 6667.`,
    '',
    'GrandMoor Warehousing & Logistics',
    '3500 Ridgeway Drive, Mississauga, ON L5L 0A2'
  ].join('\n');

  const html = `<!doctype html><html><body style="margin:0;background:#edebe4;font-family:Helvetica,Arial,sans-serif;color:#16232b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff">
<tr><td style="background:#16232b;padding:20px 28px;border-bottom:4px solid #ff5b04">
<span style="font-family:Georgia,serif;font-size:24px;color:#ffffff">GrandMoor</span>
<span style="font-size:11px;letter-spacing:1.5px;color:#ffba95;margin-left:8px">WAREHOUSING &amp; LOGISTICS</span></td></tr>
<tr><td style="padding:28px">
<p style="margin:0 0 16px;font-size:16px">Hi ${esc(first)},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6">Thanks for using the GrandMoor rate calculator. Your rate sheet is attached as a PDF.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse">
<tr style="color:#5d676d;font-size:11px;letter-spacing:1px"><td style="padding:0 0 6px;border-bottom:2px solid #16232b">DESCRIPTION</td><td align="right" style="padding:0 0 6px;border-bottom:2px solid #16232b">PALLETS</td><td align="right" style="padding:0 0 6px;border-bottom:2px solid #16232b">RATE / MONTH</td><td align="right" style="padding:0 0 6px;border-bottom:2px solid #16232b">AMOUNT</td></tr>
${items.map((i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #d6d3c9">${i[0]}</td><td align="right" style="border-bottom:1px solid #d6d3c9">${i[1]}</td><td align="right" style="border-bottom:1px solid #d6d3c9">${esc(money(i[2]))}</td><td align="right" style="border-bottom:1px solid #d6d3c9">${esc(money(i[1] * i[2]))}</td></tr>`).join('')}
<tr><td colspan="3" style="padding:14px 0 0;font-weight:bold">Monthly storage estimate</td><td align="right" style="padding:14px 0 0;font-weight:bold;font-size:16px">${esc(money(quote.monthly))}</td></tr>
<tr><td colspan="4" align="right" style="font-size:12px;color:#5d676d;padding-top:2px">CAD, per month, before taxes</td></tr></table>
<p style="margin:20px 0 0;font-size:14px;line-height:1.6">This rate sheet assumes at least <strong>${quote.tier.min} pallet${quote.tier.min === 1 ? '' : 's'}</strong> in storage and is valid for <strong>${VALID_DAYS} days</strong>, until <strong>${esc(validUntil)}</strong>.</p>
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;background:#edebe4;padding:14px 16px;border-left:3px solid #ff5b04"><strong>Other services.</strong> We also offer Container Destuffing, Pick and Pack, Final Mile Delivery, and Amazon / Marketplace Fulfillment. Pricing depends on your number of orders, number of SKUs and item weight. Call <a href="tel:+18885056667" style="color:#ff5b04">+1 888 505 6667</a>, email <a href="mailto:info@grandmoor.com" style="color:#ff5b04">info@grandmoor.com</a> or fill in our <a href="https://grandmoor.ca/qualify" style="color:#ff5b04">qualifier form</a> for details.</p>
<p style="margin:16px 0 0;font-size:14px;line-height:1.6">Got any questions? Please email <a href="mailto:info@grandmoor.com" style="color:#ff5b04">info@grandmoor.com</a> (or just reply to this email) or call <a href="tel:+18885056667" style="color:#ff5b04">+1 888 505 6667</a>.</p>
</td></tr>
<tr><td style="padding:16px 28px;background:#edebe4;font-size:12px;color:#5d676d">GrandMoor Warehousing &amp; Logistics<br>3500 Ridgeway Drive, Mississauga, ON L5L 0A2</td></tr>
</table></td></tr></table></body></html>`;
  return { text, html };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!secret || !resendKey) return json(500, { error: 'Rate sheets are not configured yet' });

  let fields;
  try { fields = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Bad request' }); }

  // Honeypot: bots fill it in, people never see it. Pretend success so bots move on.
  if (fields.website) return json(200, { ok: true });

  if (!fields.token) return json(400, { error: 'Please complete the verification check.' });
  const verify = await fetch(TURNSTILE_URL, {
    method: 'POST',
    body: new URLSearchParams({
      secret,
      response: String(fields.token),
      remoteip: event.headers['x-nf-client-connection-ip'] || ''
    })
  }).then((r) => r.json()).catch(() => null);
  if (!verify || !verify.success) return json(403, { error: 'Verification failed. Please try again.' });

  const contact = {
    name: clean(fields.name, 100),
    company: clean(fields.company, 120),
    email: clean(fields.email, 160),
    phone: clean(fields.phone, 40)
  };
  if (!contact.name || !contact.company) return json(400, { error: 'Please enter your name and company.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) return json(400, { error: 'Please enter a valid email address.' });
  if (contact.phone.replace(/\D/g, '').length < 10) return json(400, { error: 'Please enter a valid phone number.' });

  const built = buildQuote(fields);
  if (built.error) return json(400, { error: built.error });
  const quote = built.quote;

  const issued = new Date();
  const validUntil = dateFmt.format(new Date(issued.getTime() + VALID_DAYS * 24 * 60 * 60 * 1000));

  // Lead first, so the enquiry is captured even if the email step fails.
  const siteUrl = process.env.URL || 'https://grandmoor.ca';
  const attr = fields.attribution && typeof fields.attribution === 'object' ? fields.attribution : {};
  const source = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'referrer']
    .filter((k) => attr[k]).map((k) => `${k}: ${clean(attr[k], 200)}`).join(', ');
  const leadMessage = [
    'Rate calculator request',
    `Pallets: ${describePallets(quote)}`,
    `Quoted: ${money(quote.regularRate)} regular${quote.oversized ? `, ${money(quote.oversizedRate)} oversized` : ''} per pallet per month (tier ${tierLabel(quote.tier)})`,
    `Estimated monthly storage: ${money(quote.monthly)}`,
    `Rate sheet valid until ${validUntil}`,
    source ? `Source: ${source}` : ''
  ].filter(Boolean).join('\n');
  const leadPost = fetch(siteUrl + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      'form-name': 'contact',
      name: contact.name,
      company: contact.company,
      email: contact.email,
      phone: contact.phone,
      service: 'pallet-storage',
      message: leadMessage
    }).toString()
  }).then((r) => r.status < 400).catch(() => false);

  let pdf;
  try { pdf = await buildRateSheetPdf({ quote, contact, issued }); } catch (e) {
    console.error('PDF build failed', e);
    return json(500, { error: 'Could not build your rate sheet. Please call us on +1 888 505 6667.' });
  }

  const replyTo = process.env.RATE_REPLY_TO || 'info@grandmoor.com';
  const { text, html } = emailBodies({ quote, contact, validUntil, replyTo });
  const fileName = 'GrandMoor-Rate-Sheet-' + contact.company.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '.pdf';
  const mail = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RATE_FROM_EMAIL || 'GrandMoor <rates@grandmoor.ca>',
      to: [contact.email],
      reply_to: replyTo,
      subject: 'Your GrandMoor pallet storage rate sheet',
      text,
      html,
      attachments: [{ filename: fileName, content: pdf.toString('base64') }]
    })
  }).catch(() => null);

  await leadPost;
  if (!mail || mail.status >= 400) {
    console.error('Resend failed', mail && mail.status, mail && (await mail.text().catch(() => '')));
    return json(502, { error: "We couldn't email your rate sheet. Our team has your details and will send it shortly.", lead: leadMessage });
  }

  return json(200, {
    ok: true,
    summary: describePallets(quote),
    validUntil,
    // The page forwards this to Zoho CRM (via the n8n spam filter), like the other site forms.
    lead: leadMessage
  });
};
