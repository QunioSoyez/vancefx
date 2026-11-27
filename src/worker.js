// VanceFX Worker: serves the static site (dist/) and creates Stripe Checkout Sessions.
import { MAX_QTY, getProduct } from './data/products.js';
import { REGIONS, shippingCents } from './data/shipping.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/checkout') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      return createCheckout(request, env, url);
    }

    // Anything else: static files from dist/ (404 page if missing).
    return env.ASSETS.fetch(request);
  },
};

async function createCheckout(request, env, url) {
  // Only accept calls from our own pages.
  const origin = request.headers.get('Origin');
  if (origin !== url.origin) return json({ error: 'Bad origin' }, 403);

  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Checkout is not configured yet.' }, 500);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const region = String(body?.region || '');
  if (!(region in REGIONS)) return json({ error: 'Pick where we are shipping to.' }, 400);

  // Rebuild the order from the catalog. Only ids and quantities come from the browser.
  const lines = [];
  for (const item of Array.isArray(body?.items) ? body.items : []) {
    const product = getProduct(String(item?.id));
    const qty = Number(item?.qty);
    if (!product || !product.available) continue;
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return json({ error: `Quantity must be 1 to ${MAX_QTY}.` }, 400);
    }
    lines.push({ product, qty });
  }
  if (lines.length === 0) return json({ error: 'Your cart is empty.' }, 400);

  const subtotal = lines.reduce((sum, l) => sum + l.product.priceCents * l.qty, 0);
  const shipping = shippingCents(subtotal, region);

  const f = new URLSearchParams();
  f.set('mode', 'payment');
  f.set('success_url', `${url.origin}/thanks?session_id={CHECKOUT_SESSION_ID}`);
  f.set('cancel_url', `${url.origin}/cart`);
  f.set('shipping_address_collection[allowed_countries][0]', 'US');
  f.set('billing_address_collection', 'auto');
  f.set('metadata[ship_region]', region);

  lines.forEach((l, i) => {
    f.set(`line_items[${i}][quantity]`, String(l.qty));
    f.set(`line_items[${i}][price_data][currency]`, 'usd');
    f.set(`line_items[${i}][price_data][unit_amount]`, String(l.product.priceCents));
    f.set(`line_items[${i}][price_data][product_data][name]`, l.product.name);
    f.set(`line_items[${i}][price_data][product_data][images][0]`, `${url.origin}${l.product.image}`);
    f.set(`line_items[${i}][price_data][product_data][metadata][sku]`, l.product.id);
  });

  const shipName =
    shipping === 0 ? 'Free shipping' : region === 'US48' ? 'Standard shipping' : `Standard shipping (${REGIONS[region]})`;
  f.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
  f.set('shipping_options[0][shipping_rate_data][display_name]', shipName);
  f.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', String(shipping));
  f.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd');

  if (env.STRIPE_TAX === 'on') f.set('automatic_tax[enabled]', 'true');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: f,
  });
  const session = await res.json();
  if (!res.ok) {
    console.error('Stripe error', session?.error?.message);
    return json({ error: 'Could not start checkout. Please try again.' }, 502);
  }
  return json({ url: session.url });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

