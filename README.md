# VanceFX

Parody storefront for VanceFX eyeliner and mascara for men. Live at https://vancefx.shop.

- **Site:** Astro (static) in `src/`, built to `dist/`.
- **Checkout:** Cloudflare Worker `src/worker.js` creates a Stripe Checkout Session at `POST /api/checkout`.
- **Hosting:** Cloudflare Worker `vancefx` with static assets; builds from GitHub on push to `main`.

## Where things are

| What | File |
| --- | --- |
| Products and prices (site AND checkout) | `src/data/products.js` |
| Shipping rules | `src/data/shipping.js` |
| Contact email, handling time, disclaimer | `src/data/site.js` |
| Pages | `src/pages/` (home, `products/[id]`, cart, faq, thanks, 404) |
| Cart (localStorage) | `src/scripts/cart.js` |
| Look and feel | `src/styles/global.css`, `src/layouts/Base.astro` |
| Images | `public/img/` |
| Worker config | `wrangler.jsonc` |

## Local dev

```
npm install
copy .dev.vars.example .dev.vars
npm run dev       # site only, http://localhost:4321 (checkout won't work)
npm run preview   # build + Worker, http://localhost:8787 (checkout works with a Stripe test key)
```

## Secrets

- `STRIPE_SECRET_KEY` - `npx wrangler secret put STRIPE_SECRET_KEY` (never in a file).
- `STRIPE_TAX` var in `wrangler.jsonc` - set to `"on"` after Stripe Tax is set up.

## Shipping rules

- $8 flat for subtotals up to $50; free when the subtotal is over $50.
- Alaska / Hawaii add $5 (also on free-shipping orders; see `remoteSurchargeOnFree`).
- The customer picks the region on the cart page. Stripe only collects US addresses but can't check the state, so check AK/HI addresses on each order.
