// Shipping rules. Used by the cart page (display) and the Worker (what Stripe charges).
export const SHIPPING = {
  flatCents: 800, // orders under $50
  freeAtCents: 5000, // subtotal of $50 and up ships free
  remoteSurchargeCents: 500, // Alaska / Hawaii
  remoteSurchargeOnFree: true, // AK/HI still pay the $5 when the order ships free
};

export const REGIONS = {
  US48: 'Continental US (48 states + DC)',
  AK: 'Alaska',
  HI: 'Hawaii',
};

export function shippingCents(subtotalCents, region) {
  if (!(region in REGIONS)) throw new Error('bad region');
  const free = subtotalCents >= SHIPPING.freeAtCents;
  let cents = free ? 0 : SHIPPING.flatCents;
  if (region !== 'US48' && (!free || SHIPPING.remoteSurchargeOnFree)) {
    cents += SHIPPING.remoteSurchargeCents;
  }
  return cents;
}
