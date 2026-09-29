// Enlace del pedido que se envía por WhatsApp. Devuelve metadatos con la factura como
// imagen de vista previa y lleva a la persona a /pedido.html con el detalle.
// GET /api/pedido?i=aura.1_nox.2&n=FER-XXXX&d=29.09.2026
import { catalogo, leerPedido, precio, numero, esc } from './_lib.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const cat = await catalogo(url.origin);
  const items = leerPedido(url.searchParams, cat);
  const n = numero(url.searchParams);
  const total = items.reduce((s, i) => s + (i.precio || 0) * i.qty, 0);
  const qs = url.searchParams.toString();
  const img = `${url.origin}/api/factura?${qs}`;
  const destino = `/pedido.html#${items.map((i) => `${i.id}.${i.qty}`).join('_')}`;
  const titulo = `Pedido No. ${n} · FEROLI`;
  const desc = `${items.map((i) => `${i.nombre} ×${i.qty}`).join(', ')} — Total ${precio(total)}`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${esc(titulo)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta property="og:type" content="website"><meta property="og:site_name" content="FEROLI">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(img)}"><meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1080"><meta property="og:image:height" content="1350">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${esc(destino)}">
</head><body style="background:#F6F1E9"><script>location.replace(${JSON.stringify(destino)})</script></body></html>`;
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}
