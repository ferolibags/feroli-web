# FEROLI — ORIGEN

Sitio estático (HTML/CSS/JS, sin build) listo para Vercel.

## Editar rápido
- **WhatsApp e Instagram:** `js/productos.js` → `FEROLI_CONFIG.whatsapp` (número oficial `573206586406`) e `instagram`.
- **Productos:** `js/productos.js` → arreglo `PRODUCTOS` (nombre, precio, fotos, modelo, colecciones).

## Carrito y factura por WhatsApp
"Finalizar pedido por WhatsApp" abre el chat con el número de pedido, las piezas, el total y un enlace
`/api/pedido?...`. WhatsApp muestra ese enlace con la **factura FEROLI como imagen** (1080 × 1350),
generada por `api/factura.js` con Qwenzy, el logo, las fotos de cada bolso (`img/thumbs/`) y el total.
Al tocarla, la clienta ve el pedido en `pedido.html`.

- Requiere desplegar en Vercel (usa `@vercel/og`, declarado en `package.json`; Vercel lo instala solo).
- Los precios y nombres se leen de `js/productos.js`: no hay que tocar nada más al cambiarlos.
- Si agregas un bolso nuevo, crea su miniatura PNG en `img/thumbs/` con el mismo nombre que su foto `-1.webp`.
- `sitio` en `js/productos.js` debe ser el dominio real (hoy `https://feroli-web.vercel.app`).

## Tipografías
- Qwenzy (oficial, `fonts/qwenzy.woff2`): titulares, nombres de pieza, ticker.
- Inter (Google Fonts): navegación, precios, textos y botones.

## Fotos
| Carpeta | Archivos | Uso |
| --- | --- | --- |
| `img/productos/` | `[pieza]-1.webp` bolso recortado (1020 × 1320) | carruseles, Día, carrito, página de producto |
| `img/productos/` | `[pieza]-2.webp` detalle, `[pieza]-3.jpg` foto con modelo | página de producto |
| `img/modelos/` | `[pieza].jpg` modelo con el bolso | tarjetas (modelo → bolso en hover) |
| `img/editorial/` | `hero.jpg`, `dia-002.jpg`, `filosofia.jpg`, `cierre.jpg` | hero, Día, Filosofía, cierre |

Pendiente: medidas de Aura, Nox, Solis, Ámbar y Valentine; tiempo de entrega de Bianca, Coral Baguette y Terra (campos `medidas` y `entrega` en `js/productos.js`).

## Desplegar
- Vercel: "Add New → Project", importa la carpeta (o `vercel` desde la terminal). Sin build command; output = raíz.
- Local: `python3 -m http.server` y abre `http://localhost:8000`.
