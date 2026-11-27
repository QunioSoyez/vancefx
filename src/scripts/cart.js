// Browser cart, saved in localStorage. Only product ids + quantities + region are stored.
import { PRODUCTS, MAX_QTY, getProduct } from '../data/products.js';

const KEY = 'vancefx-cart';

export function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const items = {};
    for (const [id, qty] of Object.entries(raw.items || {})) {
      const p = getProduct(id);
      const n = Math.min(MAX_QTY, Math.max(0, parseInt(qty, 10) || 0));
      if (p && p.available && n > 0) items[id] = n;
    }
    return { items, region: raw.region || 'US48' };
  } catch {
    return { items: {}, region: 'US48' };
  }
}

export function saveCart(cart) {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* storage blocked */ }
  updateCartCount(cart);
}

export function clearCart() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  updateCartCount({ items: {} });
}

export function addToCart(id, qty = 1) {
  const cart = loadCart();
  cart.items[id] = Math.min(MAX_QTY, (cart.items[id] || 0) + qty);
  saveCart(cart);
  return cart;
}

export function setQty(id, qty) {
  const cart = loadCart();
  if (qty <= 0) delete cart.items[id];
  else cart.items[id] = Math.min(MAX_QTY, qty);
  saveCart(cart);
  return cart;
}

export function cartLines(cart) {
  return PRODUCTS.filter((p) => cart.items[p.id]).map((p) => ({ product: p, qty: cart.items[p.id] }));
}

export function updateCartCount(cart = loadCart()) {
  const count = Object.values(cart.items || {}).reduce((a, b) => a + b, 0);
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.dataset.empty = String(count === 0);
  });
}

export function toast(msg) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}
