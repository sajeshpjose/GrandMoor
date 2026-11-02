// Pallet storage pricing. Single source of truth: the quote email and PDF are built from this.
// Prices are CAD per pallet per month. The tier rate applies to every pallet in the quote.

const TIERS = [
  { min: 1, max: 10, rate: 28 },
  { min: 11, max: 30, rate: 26 },
  { min: 31, max: 60, rate: 24 },
  { min: 61, max: 200, rate: 22 },
  { min: 201, max: 500, rate: 20 },
  { min: 501, max: 1000, rate: 18 },
  { min: 1001, max: Infinity, rate: 16 }
];

const OVERSIZE_SURCHARGE = 0.25;
const VALID_DAYS = 14;
const MAX_PALLETS = 100000;
const MAX_ORDERS = 1000000;

const REGULAR_PALLET = '48" x 40" pallet, up to 60" tall (including the pallet) and up to 2,000 lb';

const OTHER_SERVICES = 'We also offer Container Destuffing, Pick and Pack, Final Mile Delivery, and Amazon / Marketplace Fulfillment. Pricing depends on your number of orders, number of SKUs and item weight. Call +1 888 505 6667, email info@grandmoor.com or fill in our qualifier form at grandmoor.ca/qualify for details.';

const round2 = (n) => Math.round(n * 100) / 100;

function tierFor(pallets) {
  return TIERS.find((t) => pallets >= t.min && pallets <= t.max);
}

function toInt(v) {
  const s = String(v == null ? '' : v).trim();
  return /^\d+$/.test(s) ? parseInt(s, 10) : NaN;
}

// Validates raw form input and returns { error } or { quote }.
function buildQuote(input) {
  const pallets = toInt(input.pallets);
  if (!(pallets >= 1 && pallets <= MAX_PALLETS)) return { error: 'Enter the number of pallets (1 or more).' };

  const size = String(input.size || '');
  let oversized;
  if (size === 'regular') oversized = 0;
  else if (size === 'oversized') oversized = pallets;
  else if (size === 'mixed') {
    oversized = toInt(input.oversized);
    if (!(oversized >= 1 && oversized < pallets)) {
      return { error: 'For a mix, enter how many of your pallets are oversized (at least 1, fewer than the total).' };
    }
  } else return { error: 'Choose regular, oversized or mixed pallets.' };

  const inbound = toInt(input.inbound);
  const outbound = toInt(input.outbound);
  if (!(inbound >= 0 && inbound <= MAX_ORDERS) || !(outbound >= 0 && outbound <= MAX_ORDERS)) {
    return { error: 'Enter your expected monthly inbound and outbound orders (0 or more).' };
  }

  const tier = tierFor(pallets);
  const regular = pallets - oversized;
  const regularRate = tier.rate;
  const oversizedRate = round2(tier.rate * (1 + OVERSIZE_SURCHARGE));
  const monthly = round2(regular * regularRate + oversized * oversizedRate);

  return {
    quote: { pallets, size, regular, oversized, inbound, outbound, tier, regularRate, oversizedRate, monthly }
  };
}

const money = (n) => '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tierLabel = (t) => (t.max === Infinity ? 'Above 1,000' : t.min.toLocaleString('en-CA') + ' - ' + t.max.toLocaleString('en-CA'));

module.exports = { TIERS, OVERSIZE_SURCHARGE, VALID_DAYS, REGULAR_PALLET, OTHER_SERVICES, buildQuote, money, tierLabel };
