// The product catalog. Used by the pages AND by the checkout Worker,
// so prices here are the prices customers are charged (the browser never sends prices).
export const PRODUCTS = [
  {
    id: 'eyeliner',
    name: 'VanceFX Eyeliner for Men',
    short: 'Eyeliner for Men',
    priceCents: 1000,
    tagline: 'Bold. Defined. Unapologetic.',
    blurb: 'Because confidence should be effortless. Upgrade your gaze.',
    image: '/img/poster-eyeliner.jpg',
    imageAlt: 'VanceFX Eyeliner for Men poster',
    available: true,
  },
  {
    id: 'mascara',
    name: 'VanceFX The Mascara for Men',
    short: 'The Mascara for Men',
    priceCents: 1000,
    tagline: 'Defined. Natural. Invisible.',
    blurb: 'Upgrade your look. Elevate your confidence. The subtle power of natural eye definition, designed specifically for men.',
    image: '/img/poster-mascara.jpg',
    imageAlt: 'VanceFX The Mascara for Men poster',
    available: true,
  },
];

export const MAX_QTY = 10; // per product, per order

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatUSD(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
