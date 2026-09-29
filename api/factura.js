// Imagen de la factura del pedido (PNG 1080×1350) para la vista previa de WhatsApp.
// GET /api/factura?i=aura.1_nox.2&n=FER-XXXX&d=29.09.2026
import { ImageResponse } from '@vercel/og';
import { catalogo, leerPedido, precio, numero } from './_lib.js';

export const config = { runtime: 'edge' };

const MARFIL = '#F6F1E9', PAPEL = '#FBF8F2', VINO = '#3D1012', TINTA = '#2A1715', T60 = '#7A6A63', DORADO = '#B8975A', LINEA = 'rgba(61,16,18,0.18)';
const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.flat().filter((c) => c !== null && c !== false) } });
const img = (src, style) => ({ type: 'img', props: { src, style } });

export default async function handler(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const [cat, font] = await Promise.all([
    catalogo(origin),
    fetch(`${origin}/fonts/qwenzy.otf`).then((r) => r.arrayBuffer()),
  ]);
  const items = leerPedido(url.searchParams, cat);
  const n = numero(url.searchParams);
  const fecha = (url.searchParams.get('d') || '').replace(/[^0-9./-]/g, '').slice(0, 10);
  const total = items.reduce((s, i) => s + (i.precio || 0) * i.qty, 0);
  const piezas = items.reduce((s, i) => s + i.qty, 0);
  const pendiente = items.some((i) => i.precio == null);
  const rowH = items.length > 5 ? 118 : 150;
  const thumb = (foto) => `${origin}/img/thumbs/${foto.split('/').pop().replace(/-1\.webp$/, '')}.png`;
  const label = { fontSize: 20, letterSpacing: 5, color: T60 };

  const el = h('div', { width: 1080, height: 1350, background: MARFIL, padding: 48, fontFamily: 'Qwenzy' },
    h('div', { flex: 1, flexDirection: 'column', background: PAPEL, border: `2px solid ${VINO}`, padding: '64px 72px 56px', position: 'relative' },
      // marco interior fino
      h('div', { position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, border: `1px solid ${LINEA}` }),
      // encabezado
      h('div', { justifyContent: 'space-between', alignItems: 'flex-end' },
        h('div', { flexDirection: 'column' },
          img(`${origin}/img/brand/feroli-logo.svg`, { width: 360, height: 83 }),
          h('div', { ...label, marginTop: 14 }, 'ORIGEN   /   HECHO A MANO EN COLOMBIA'),
        ),
        h('div', { flexDirection: 'column', alignItems: 'flex-end' },
          h('div', label, 'PEDIDO'),
          h('div', { fontSize: 40, color: VINO, marginTop: 6 }, `No. ${n}`),
          fecha ? h('div', { ...label, marginTop: 6 }, fecha) : null,
        ),
      ),
      h('div', { height: 2, background: VINO, marginTop: 36 }),
      h('div', { height: 1, background: VINO, marginTop: 5, opacity: 0.5 }),
      // columnas
      h('div', { ...label, fontSize: 18, marginTop: 26, marginBottom: 6, justifyContent: 'space-between' },
        h('div', {}, 'PIEZA'), h('div', {}, 'SUBTOTAL')),
      // ítems
      h('div', { flexDirection: 'column', flex: 1 },
        items.map((i, k) => h('div', { height: rowH, alignItems: 'center', borderBottom: `1px solid ${LINEA}` },
          h('div', { width: rowH - 24, height: rowH - 24, background: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 28 },
            img(thumb(i.foto), { width: rowH - 36, height: rowH - 36, objectFit: 'contain' })),
          h('div', { flexDirection: 'column', flex: 1 },
            h('div', { fontSize: 18, color: DORADO, letterSpacing: 3 }, String(k + 1).padStart(2, '0')),
            h('div', { fontSize: items.length > 5 ? 34 : 40, color: VINO, marginTop: 4 }, i.nombre),
            h('div', { fontSize: 22, color: T60, marginTop: 6 }, `${precio(i.precio)}   x ${i.qty}`),
          ),
          h('div', { fontSize: 34, color: TINTA }, i.precio == null ? 'Por confirmar' : precio(i.precio * i.qty)),
        )),
      ),
      // total
      h('div', { marginTop: 30, justifyContent: 'space-between', alignItems: 'flex-end' },
        h('div', { flexDirection: 'column' },
          h('div', label, `${piezas} ${piezas === 1 ? 'PIEZA' : 'PIEZAS'}`),
          pendiente ? h('div', { fontSize: 20, color: T60, marginTop: 8 }, '+ piezas con precio por confirmar') : null,
        ),
        h('div', { flexDirection: 'column', alignItems: 'flex-end' },
          h('div', label, 'TOTAL'),
          h('div', { fontSize: 88, color: VINO, lineHeight: 1, marginTop: 8 }, precio(total)),
        ),
      ),
      h('div', { height: 1, background: LINEA, marginTop: 34 }),
      // pie
      h('div', { marginTop: 22, justifyContent: 'space-between', alignItems: 'center' },
        h('div', { fontSize: 30, color: VINO }, 'Hecho con intención.'),
        h('div', { ...label, fontSize: 18 }, '@FEROLI.BAGS   /   +57 320 658 6406'),
      ),
      // sello
      h('div', { position: 'absolute', bottom: 330, right: 80, width: 150, height: 150, borderRadius: 75, border: `2px solid ${DORADO}`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: 'rotate(-12deg)', opacity: 0.85 },
        h('div', { position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderRadius: 67, border: `1px solid ${DORADO}` }),
        h('div', { fontSize: 16, color: DORADO, letterSpacing: 4 }, 'ORIGEN'),
        h('div', { fontSize: 38, color: DORADO, marginTop: 2 }, '2026'),
        h('div', { fontSize: 14, color: DORADO, letterSpacing: 3, marginTop: 2 }, 'COLOMBIA'),
      ),
    ),
  );

  return new ImageResponse(el, {
    width: 1080, height: 1350,
    fonts: [{ name: 'Qwenzy', data: font, weight: 400, style: 'normal' }],
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
