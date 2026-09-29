/* =========================================================
   FEROLI — datos editables
   ---------------------------------------------------------
   1. WhatsApp: código de país + número, sin + ni espacios.
   2. PRODUCTOS: edita, agrega o quita piezas.
      - precio: entero en pesos (95000 → "$95.000").
      - fotos: las 3 fotos de la página de producto.
          [0] bolso completo (recorte .webp transparente, 1020 × 1320)
          [1] detalle de cuentas y placa
          [2] tercera vista (asa, bolso puesto, etc.)
        La foto [0] es la que aparece en los carruseles interactivos.
      - modelo: foto de la modelo llevando el bolso (vertical 3:4).
        Se ve en las tarjetas; al pasar el mouse cambia a la foto del bolso.
        Si el archivo no existe todavía, la tarjeta muestra el bolso y el
        detalle en el hover.
      - colecciones: en qué bloques aparece y en qué orden.
      - medidas: filas de la tabla de medidas [['Ancho', '19 cm'], ...].
      - precio: null muestra "Precio por confirmar" hasta que pongas el valor.
   ========================================================= */

window.FEROLI_CONFIG = {
  whatsapp: '573206586406', // número oficial FEROLI (+57 320 658 6406)
  instagram: 'https://www.instagram.com/feroli.bags',
  // Dominio público del sitio (para los enlaces del pedido en WhatsApp).
  // Si cambias el dominio, reemplaza también feroli.vercel.app en p/*.html y pedido.html.
  sitio: 'https://feroli.vercel.app',
};

window.PRODUCTOS = [
  {
    id: 'aura',
    nombre: 'Bolso Aura',
    precio: 95000,
    fotos: ['img/productos/aura-1.webp', 'img/productos/aura-2.webp'],
    modelo: '',
    colecciones: { destacados: 1, dia: 2 },
  },
  {
    id: 'bianca',
    nombre: 'Bolso Bianca',
    precio: 160000,
    medidas: [['Ancho', '18 cm'], ['Alto', '13 cm (21 cm con asa)'], ['Capacidad', 'Cabe un iPhone Pro Max']],
    fotos: ['img/productos/bianca-1.webp', 'img/productos/bianca-2.webp', 'img/productos/bianca-3.jpg'],
    modelo: 'img/modelos/bianca.jpg',
    colecciones: { destacados: 2, dia: 3 },
  },
  {
    id: 'alba-marfil',
    nombre: 'Totebag Alba Marfil',
    precio: 95000,
    medidas: [['Ancho', '34 cm'], ['Alto', '22 cm'], ['Capacidad', 'Cabe un iPhone Pro Max']],
    fotos: ['img/productos/alba-marfil-1.webp', 'img/productos/alba-marfil-2.webp', 'img/productos/alba-marfil-4.jpg'],
    modelo: 'img/modelos/alba-marfil.jpg',
    colecciones: { destacados: 3, dia: 1 },
  },
  {
    id: 'nox',
    nombre: 'Bolso Nox',
    precio: 150000,
    fotos: ['img/productos/nox-1.webp', 'img/productos/nox-2.webp', 'img/productos/nox-3.jpg'],
    modelo: 'img/modelos/nox.jpg',
    colecciones: { destacados: 4, noche: 1 },
  },
  {
    id: 'boreal',
    nombre: 'Bolso Boreal',
    precio: null, // pendiente: escribe el precio, ej. 120000
    medidas: [['Ancho', '19 cm'], ['Alto', '16 cm'], ['Largo', '10 cm'], ['Forro', 'Interno de satín'], ['Capacidad', 'Cabe un iPhone Pro Max']],
    fotos: ['img/productos/aurora-1.webp', 'img/productos/aurora-2.webp'],
    modelo: '',
    colecciones: { dia: 4 },
  },
  {
    id: 'coral-baguette',
    nombre: 'Bolso Coral Baguette',
    precio: 180000,
    medidas: [['Ancho', '18 cm'], ['Alto', '10 cm (20 cm con asa)'], ['Largo', '12 cm'], ['Capacidad', 'Cabe un iPhone Pro']],
    fotos: ['img/productos/solis-1.webp', 'img/productos/solis-2.webp', 'img/productos/solis-3.jpg'],
    modelo: 'img/modelos/solis.jpg',
    colecciones: { noche: 2 },
  },
  {
    id: 'solis',
    nombre: 'Bolso Solis',
    precio: 98000, // confirmar
    fotos: ['img/productos/coral-baguette-1.webp', 'img/productos/coral-baguette-2.webp', 'img/productos/coral-baguette-3.jpg'],
    modelo: 'img/editorial/dia-002.jpg',
    colecciones: { noche: 3 },
  },
  {
    id: 'terra',
    nombre: 'Bolso Terra',
    precio: 110000,
    medidas: [['Ancho', '19 cm'], ['Alto', '15 cm'], ['Largo', '6 cm'], ['Capacidad', 'Cabe un iPhone Pro Max']],
    fotos: ['img/productos/terra-1.webp', 'img/productos/terra-2.webp'],
    modelo: '',
    colecciones: { noche: 4 },
  },
  {
    id: 'ambar',
    nombre: 'Bolso Ámbar',
    precio: null, // pendiente
    fotos: ['img/productos/ambar-1.webp', 'img/productos/ambar-2.webp', 'img/productos/ambar-5.jpg', 'img/productos/ambar-3.jpg', 'img/productos/ambar-4.jpg'],
    modelo: 'img/modelos/ambar.jpg',
    colecciones: { noche: 5 },
  },
  {
    id: 'valentine',
    nombre: 'Bolso Valentine',
    precio: null, // pendiente
    especial: true,
    fotos: ['img/productos/valentine-1.webp', 'img/productos/valentine-3.jpg', 'img/productos/valentine-4.jpg', 'img/productos/valentine-5.jpg', 'img/productos/valentine-6.jpg'],
    modelo: 'img/modelos/valentine.jpg',
    colecciones: { especial: 1 },
  },
];
