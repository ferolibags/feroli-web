// Utilidades compartidas por /api/factura y /api/pedido (no es una ruta).
export const ORDEN_RE = /^[a-z0-9-]+\.\d{1,2}(_[a-z0-9-]+\.\d{1,2})*$/;

// Lee el catálogo desde js/productos.js (única fuente de verdad).
export async function catalogo(origin) {
  const src = await (await fetch(`${origin}/js/productos.js`)).text();
  const out = {};
  src.split(/\n\s*\{\s*\n\s*id: '/).slice(1).forEach((blk) => {
    const id = blk.slice(0, blk.indexOf("'"));
    const nombre = (blk.match(/nombre: '([^']+)'/) || [])[1];
    const precio = (blk.match(/precio: (null|\d+)/) || [])[1];
    const foto = (blk.match(/fotos: \['([^']+)'/) || [])[1];
    if (id && nombre) out[id] = { id, nombre, precio: precio === 'null' ? null : Number(precio), foto };
  });
  return out;
}

export function leerPedido(params, cat) {
  const raw = (params.get('i') || '').toLowerCase();
  if (!ORDEN_RE.test(raw)) return [];
  return raw.split('_').map((s) => {
    const [id, q] = s.split('.');
    return cat[id] ? { ...cat[id], qty: Math.max(1, Math.min(20, Number(q) || 1)) } : null;
  }).filter(Boolean).slice(0, 8);
}

export const precio = (n) => (n == null ? 'Por confirmar' : '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
export const numero = (params) => (params.get('n') || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16) || 'FER';
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
