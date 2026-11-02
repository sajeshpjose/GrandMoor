// Builds the branded GrandMoor rate sheet PDF (Letter, one page) with pdf-lib.

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const logoBase64 = require('./logo-data');
const { VALID_DAYS, REGULAR_PALLET, OTHER_SERVICES, money } = require('./rates');

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const NAVY = hex('#16232b');
const ORANGE = hex('#ff5b04');
const PEACH = hex('#ffba95');
const CREAM = hex('#edebe4');
const GREY = hex('#5d676d');
const WHITE = rgb(1, 1, 1);

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;

const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric' });

async function buildRateSheetPdf({ quote, contact, issued = new Date() }) {
  const pdf = await PDFDocument.create();
  pdf.setTitle('GrandMoor Warehousing Rate Sheet');
  pdf.setAuthor('GrandMoor Warehousing & Logistics');
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const logo = await pdf.embedPng(Buffer.from(logoBase64, 'base64'));

  // Standard fonts only encode WinAnsi: swap anything else for '?' rather than throwing.
  const safe = (font, s) => {
    let out = '';
    for (const ch of String(s)) {
      try { font.encodeText(ch); out += ch; } catch (e) { out += '?'; }
    }
    return out;
  };
  const text = (s, x, y, { font = regular, size = 10, color = NAVY } = {}) =>
    page.drawText(safe(font, s), { x, y, font, size, color });
  const width = (s, font, size) => font.widthOfTextAtSize(safe(font, s), size);
  const textRight = (s, xRight, y, opts = {}) =>
    text(s, xRight - width(s, opts.font || regular, opts.size || 10), y, opts);
  const wrap = (s, font, size, maxW) => {
    const lines = [];
    let line = '';
    for (const word of safe(font, s).split(/\s+/)) {
      const next = line ? line + ' ' + word : word;
      if (font.widthOfTextAtSize(next, size) > maxW && line) { lines.push(line); line = word; } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };
  const rect = (x, y, w, h, color) => page.drawRectangle({ x, y, width: w, height: h, color });

  const validUntil = new Date(issued.getTime() + VALID_DAYS * 24 * 60 * 60 * 1000);
  const { pallets, regular: nRegular, oversized: nOversized, tier } = quote;

  // Header
  const logoW = 190;
  const logoH = (logo.height / logo.width) * logoW;
  page.drawImage(logo, { x: MARGIN, y: PAGE_H - MARGIN - logoH, width: logoW, height: logoH });
  textRight('RATE SHEET', PAGE_W - MARGIN, PAGE_H - MARGIN - 18, { font: bold, size: 22 });
  textRight('Pallet Storage', PAGE_W - MARGIN, PAGE_H - MARGIN - 34, { size: 11, color: ORANGE, font: bold });
  let y = PAGE_H - MARGIN - logoH - 14;
  rect(MARGIN, y, PAGE_W - MARGIN * 2, 3, ORANGE);

  // Prepared for / validity
  y -= 28;
  text('PREPARED FOR', MARGIN, y, { font: bold, size: 8, color: GREY });
  text('ISSUED', 330, y, { font: bold, size: 8, color: GREY });
  text('VALID UNTIL', 450, y, { font: bold, size: 8, color: GREY });
  y -= 16;
  text(contact.company, MARGIN, y, { font: bold, size: 13 });
  text(dateFmt.format(issued), 330, y, { font: bold, size: 10.5 });
  text(dateFmt.format(validUntil), 450, y, { font: bold, size: 10.5, color: ORANGE });
  y -= 14;
  text(contact.name, MARGIN, y, { size: 10 });
  text(`${VALID_DAYS} days from issue`, 450, y, { size: 8.5, color: GREY });

  // Estimate box
  y -= 22;
  const boxH = 112;
  rect(MARGIN, y - boxH, PAGE_W - MARGIN * 2, boxH, NAVY);
  text('YOUR MONTHLY STORAGE ESTIMATE', MARGIN + 18, y - 24, { font: bold, size: 8.5, color: PEACH });
  text(money(quote.monthly), MARGIN + 18, y - 62, { font: bold, size: 32, color: WHITE });
  text('per month, CAD, before taxes', MARGIN + 18, y - 80, { size: 9, color: PEACH });
  const rows = [];
  if (nRegular) rows.push([`${nRegular.toLocaleString('en-CA')} regular pallet${nRegular === 1 ? '' : 's'}`, `${money(quote.regularRate)} each`]);
  if (nOversized) rows.push([`${nOversized.toLocaleString('en-CA')} oversized pallet${nOversized === 1 ? '' : 's'}`, `${money(quote.oversizedRate)} each`]);
  rows.push([`Expected orders per month`, `${quote.inbound.toLocaleString('en-CA')} in / ${quote.outbound.toLocaleString('en-CA')} out`]);
  let ry = y - 30;
  for (const [label, val] of rows) {
    text(label, 330, ry, { size: 9.5, color: WHITE });
    textRight(val, PAGE_W - MARGIN - 18, ry, { font: bold, size: 9.5, color: WHITE });
    ry -= 17;
  }
  text(`${pallets.toLocaleString('en-CA')} pallet${pallets === 1 ? '' : 's'} in total`, 330, y - boxH + 14, { size: 8.5, color: PEACH });

  // Terms
  y -= boxH + 34;
  text('WHAT THIS RATE SHEET ASSUMES', MARGIN, y, { font: bold, size: 8.5, color: GREY });
  y -= 6;
  const notes = [
    `Minimum volume: this rate assumes at least ${tier.min.toLocaleString('en-CA')} pallet${tier.min === 1 ? '' : 's'} in storage. A different stored volume may change your rate.`,
    `Regular size means a ${REGULAR_PALLET}. Anything larger or heavier is oversized.`,
    `Rates are per pallet per month, in Canadian dollars, and are valid for ${VALID_DAYS} days from the issue date (until ${dateFmt.format(validUntil)}). Taxes are extra.`,
    `The storage rate does not include receiving, handling or fulfillment charges. See other services below.`
  ];
  for (const n of notes) {
    const lines = wrap(n, regular, 9, PAGE_W - MARGIN * 2 - 14);
    y -= 14;
    page.drawCircle({ x: MARGIN + 3, y: y + 3, size: 1.8, color: ORANGE });
    for (const [i, l] of lines.entries()) {
      text(l, MARGIN + 14, y - i * 12, { size: 9 });
    }
    y -= (lines.length - 1) * 12;
  }

  // Other services
  y -= 20;
  const svcLines = wrap(OTHER_SERVICES, regular, 9, PAGE_W - MARGIN * 2 - 28);
  const svcH = 34 + svcLines.length * 12;
  rect(MARGIN, y - svcH + 12, PAGE_W - MARGIN * 2, svcH, CREAM);
  rect(MARGIN, y - svcH + 12, 3, svcH, ORANGE);
  text('OTHER SERVICES', MARGIN + 14, y - 4, { font: bold, size: 8.5, color: GREY });
  svcLines.forEach((l, i) => text(l, MARGIN + 14, y - 20 - i * 12, { size: 9 }));

  // Footer
  rect(0, 0, PAGE_W, 62, NAVY);
  text('Got any questions? Email info@grandmoor.com or call +1 888 505 6667.', MARGIN, 38, { font: bold, size: 9.5, color: WHITE });
  text('GrandMoor Warehousing & Logistics  |  3500 Ridgeway Drive, Mississauga, ON L5L 0A2  |  grandmoor.ca', MARGIN, 22, { size: 8, color: PEACH });

  return Buffer.from(await pdf.save());
}

module.exports = { buildRateSheetPdf, dateFmt };
