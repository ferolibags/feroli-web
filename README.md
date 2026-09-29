# FEROLI — ORIGEN

Sitio estático (HTML/CSS/JS, sin build) listo para Vercel.

## Editar rápido
- **WhatsApp e Instagram:** `js/productos.js` → `FEROLI_CONFIG.whatsapp` (número oficial `573206586406`) e `instagram`.
- **Productos:** `js/productos.js` → arreglo `PRODUCTOS` (nombre, precio, fotos, modelo, colecciones).

## Carrito y pedido por WhatsApp
"Finalizar pedido por WhatsApp" abre el chat con la lista de piezas, el total y **un solo enlace**:
- Una pieza → `p/[pieza].html`: WhatsApp muestra una tarjeta con la foto del bolso, nombre y precio (`img/og/[pieza].jpg`).
- Varias piezas → `pedido.html#...`: tarjeta con la colección y, al abrirla, el pedido completo con fotos y total.

Las tarjetas solo aparecen con el sitio publicado. El dominio está como `https://feroli.vercel.app`:
si usas otro, cámbialo en `js/productos.js` (`sitio`) y busca/reemplaza `feroli.vercel.app` en `p/*.html`, `pedido.html` e `index.html`.

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

Pendiente: precios de Boreal, Ámbar y Valentine; medidas de Aura, Nox, Solis, Ámbar y Valentine (campo `medidas` en `js/productos.js`).

## Desplegar
- Vercel: "Add New → Project", importa la carpeta (o `vercel` desde la terminal). Sin build command; output = raíz.
- Local: `python3 -m http.server` y abre `http://localhost:8000`.
