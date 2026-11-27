// Shipping rules. Used by the cart page (display) and the Worker (what Stripe charges).
export const SHIPPING = {
  flatCents: 800, // orders up to $50
  freeOverCents: 5000, // subtotal strictly over $50 ships free
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
  const free = subtotalCents > SHIPPING.freeOverCents;
  let cents = free ? 0 : SHIPPING.flatCents;
  if (region !== 'US48' && (!free || SHIPPING.remoteSurchargeOnFree)) {
    cents += SHIPPING.remoteSurchargeCents;
  }
  return cents;
}
