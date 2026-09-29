/* FEROLI — interacciones */
(function () {
  const CFG = window.FEROLI_CONFIG || {};
  const PRODUCTOS = window.PRODUCTOS || [];
  const byId = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p]));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 820px)').matches;

  /* ---------- utilidades ---------- */
  const precio = (n) => (n == null ? 'Precio por confirmar' : '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  const waLink = (t) => `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(t)}`;
  const waPieza = (p) => waLink(`Hola FEROLI, quiero conocer la pieza ${p.nombre}${p.precio == null ? '' : ` (${precio(p.precio)})`}`);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fileName = (src) => src.split('/').pop();
  const inColl = (key) => PRODUCTOS.filter((p) => p.colecciones && p.colecciones[key]).sort((a, b) => a.colecciones[key] - b.colecciones[key]);
  const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#wa-icon"/></svg>';

  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = CFG.whatsappContacto || waLink('Hola FEROLI, quiero conocer la colección ORIGEN');
    a.target = '_blank'; a.rel = 'noopener';
  });
  document.querySelectorAll('[data-ig]').forEach((a) => { a.href = CFG.instagram || '#'; });

  /* =========================================================
     1. CARRUSEL INTERACTIVO
     data-mode="zoom": hover resalta → clic agranda → clic enfoca → clic vuelve
     data-mode="open": hover resalta → clic abre la página de producto
     ========================================================= */
  document.querySelectorAll('[data-stage]').forEach((stage) => {
    const key = stage.dataset.stage;
    const mode = stage.dataset.mode;
    const track = stage.querySelector('.stage__track');
    const caption = stage.querySelector('.stage__caption');
    const items = inColl(key);
    track.innerHTML = items.map((p) => `
      <button class="stage__item" data-id="${p.id}" aria-label="${esc(p.nombre)}, ${precio(p.precio)}">
        <img src="${p.fotos[0]}" alt="${esc(p.nombre)}" loading="lazy" draggable="false">
      </button>`).join('');
    const els = [...track.children];
    stage.style.setProperty('--n', els.length);
    let selected = null;
    let focus = false;

    const center = () => {
      if (!focus || !selected || isMobile()) { track.style.transform = ''; return; }
      const target = els.indexOf(selected);
      const W = stage.clientWidth;
      const wSel = W * 0.56, wOther = W * 0.28;
      const start = Math.max(0, (W - (wSel + (els.length - 1) * wOther)) / 2);
      const left = start + target * wOther;
      track.style.transform = `translate3d(${(W / 2 - (left + wSel / 2)).toFixed(1)}px,0,0)`;
    };
    const render = () => {
      els.forEach((el) => el.classList.toggle('is-selected', el === selected));
      stage.classList.toggle('has-selected', !!selected);
      stage.classList.toggle('is-focus', focus);
      if (caption) {
        if (selected) {
          const p = byId[selected.dataset.id];
          caption.innerHTML = `<span class="n">${esc(p.nombre)}</span><span class="p">${precio(p.precio)}</span>
            <a class="u-line" href="#pieza-${p.id}" data-open="${p.id}">Conocer la pieza ↗</a>
            <button class="u-line" data-add="${p.id}">Agregar al carrito +</button>`;
        }
      }
      center();
    };

    els.forEach((el) => {
      el.addEventListener('pointerenter', () => { el.classList.add('is-hover'); stage.classList.add('has-hover'); });
      el.addEventListener('pointerleave', () => { el.classList.remove('is-hover'); stage.classList.remove('has-hover'); });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mode === 'open') { openProduct(el.dataset.id); return; }
        if (selected !== el) { selected = el; focus = focus ? true : false; }
        else if (!focus) { focus = true; }
        else { selected = null; focus = false; }
        render();
      });
    });
    if (mode === 'zoom') {
      document.addEventListener('click', (e) => { if (selected && !stage.contains(e.target)) { selected = null; focus = false; render(); } });
      document.addEventListener('keydown', (e) => {
        if (!selected || !document.getElementById('pdp').hidden) return;
        if (e.key === 'Escape') { selected = null; focus = false; render(); }
        const i = els.indexOf(selected);
        if (e.key === 'ArrowRight' && i < els.length - 1) { selected = els[i + 1]; render(); }
        if (e.key === 'ArrowLeft' && i > 0) { selected = els[i - 1]; render(); }
      });
      window.addEventListener('resize', center);
    }
  });

  /* =========================================================
     2. TARJETAS: modelo → bolso en hover, botón de WhatsApp
     ========================================================= */
  function cardHTML(p, i) {
    return `
      <article class="card reveal" style="--i:${i % 3}">
        <a class="card__media" href="#pieza-${p.id}" data-open="${p.id}" aria-label="Ver ${esc(p.nombre)}">
          <img class="l-a" src="${p.modelo || p.fotos[0]}" alt="${esc(p.nombre)} llevado por una modelo" loading="lazy" data-fallback="${p.fotos[0]}">
          <img class="l-b is-bag" src="${p.fotos[0]}" alt="" aria-hidden="true" loading="lazy" data-alt="${p.fotos[1]}">
        </a>
        <div class="card__row"><h3 class="card__name">${esc(p.nombre)}</h3><p class="card__price">${precio(p.precio)}</p></div>
        <button class="pill" data-add="${p.id}">Agregar al carrito</button>
      </article>`;
  }
  function allCardHTML(p) {
    const b = p.modelo || p.fotos[1] || p.fotos[0];
    return `
      <article class="card">
        <a class="card__media" href="#pieza-${p.id}" data-open="${p.id}" aria-label="Ver ${esc(p.nombre)}">
          <img class="l-a is-bag" src="${p.fotos[0]}" alt="${esc(p.nombre)}" loading="lazy">
          <img class="l-b" src="${b}" alt="" aria-hidden="true" loading="lazy" onerror="this.src='${p.fotos[1] || p.fotos[0]}'">
        </a>
        <div class="card__row"><h3 class="card__name">${esc(p.nombre)}</h3><p class="card__price">${precio(p.precio)}</p></div>
        <button class="pill" data-add="${p.id}">Agregar al carrito</button>
      </article>`;
  }
  function bindCards(root) {
    // sin foto de modelo: tarjeta = bolso, hover = detalle
    root.querySelectorAll('img.l-a').forEach((img) => {
      img.addEventListener('error', () => {
        const b = img.nextElementSibling;
        img.src = img.dataset.fallback; img.classList.add('is-bag');
        b.src = b.dataset.alt; b.classList.remove('is-bag');
      }, { once: true });
    });
  }

  document.querySelectorAll('[data-cards]').forEach((wrap) => {
    const track = wrap.querySelector('.cards__track');
    track.innerHTML = inColl(wrap.dataset.cards).map(cardHTML).join('');
    bindCards(track);
    const prev = wrap.querySelector('.cards__nav--prev');
    const next = wrap.querySelector('.cards__nav--next');
    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : 300);
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    const sync = () => {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
    };
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    setTimeout(sync, 200);
  });

  /* =========================================================
     3. DÍA: grilla que abre la página de producto
     ========================================================= */
  document.querySelectorAll('[data-coleccion]').forEach((grid) => {
    grid.innerHTML = inColl(grid.dataset.coleccion).map((p, i) => `
      <a class="piece reveal" style="--i:${i}" href="#pieza-${p.id}" data-open="${p.id}">
        <div class="piece__media">
          <div class="media media--a" data-label="${esc(p.nombre)}" data-ph="${fileName(p.fotos[0])}"><img src="${p.fotos[0]}" alt="${esc(p.nombre)}" loading="lazy"></div>
          <div class="media media--b" data-label="${esc(p.nombre)} · detalle" data-ph="${fileName(p.fotos[1])}" aria-hidden="true"><img src="${p.fotos[1]}" alt="" loading="lazy"></div>
        </div>
        <div class="piece__info">
          <h3 class="piece__name">${esc(p.nombre)}</h3>
          <p class="piece__price">${precio(p.precio)}</p>
          <span class="piece__cta u-line">Conocer la pieza <span class="arrow" aria-hidden="true">→</span></span>
        </div>
      </a>`).join('');
  });

  document.querySelectorAll('[data-price]').forEach((el) => { el.textContent = precio(byId[el.dataset.price].precio); });

  /* placeholders mientras cargan / si faltan */
  document.querySelectorAll('.media img').forEach((img) => {
    const box = img.closest('.media');
    const ok = () => box.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) ok();
    else {
      img.addEventListener('load', ok, { once: true });
      img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true });
    }
  });

  /* =========================================================
     CARRITO → pedido por WhatsApp
     ========================================================= */
  const Cart = (() => {
    const KEY = 'feroli-carrito';
    const el = document.getElementById('cart');
    const scrim = document.querySelector('.cart-scrim');
    const list = el.querySelector('.cart__list');
    const toast = document.querySelector('.toast');
    let items = [];
    try { items = JSON.parse(localStorage.getItem(KEY) || '[]').filter((i) => byId[i.id]); } catch (e) { items = []; }
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };
    const count = () => items.reduce((n, i) => n + i.qty, 0);
    const total = () => items.reduce((n, i) => n + i.qty * (byId[i.id].precio || 0), 0);
    let toastT;
    const say = (msg) => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2200); };

    function render(bump) {
      const n = count();
      document.querySelectorAll('[data-cart-count]').forEach((c) => {
        c.textContent = n;
        if (bump && c.classList.contains('nav__count')) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
      });
      document.querySelectorAll('[data-cart-total]').forEach((t) => { t.textContent = precio(total()); });
      el.classList.toggle('is-empty', n === 0);
      list.innerHTML = items.map((i) => {
        const p = byId[i.id];
        return `<div class="cart-item" data-id="${p.id}">
          <img src="${p.fotos[0]}" alt="${esc(p.nombre)}">
          <div>
            <p class="cart-item__name">${esc(p.nombre)}</p>
            <p class="cart-item__price">${precio(p.precio)}</p>${p.entrega ? `<p class="cart-item__stock">${esc(p.entrega)}</p>` : ''}
            <div class="qty"><button data-qty="-1" aria-label="Quitar una">−</button><span>${i.qty}</span><button data-qty="1" aria-label="Agregar una">+</button></div>
          </div>
          <div class="cart-item__side"><button class="cart-item__rm" data-rm>Quitar</button><p class="cart-item__sum">${p.precio == null ? 'Por confirmar' : precio(p.precio * i.qty)}</p></div>
        </div>`;
      }).join('');
    }
    function open() {
      scrim.hidden = false; el.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('is-open'); el.classList.add('is-open'); }));
    }
    function close() {
      scrim.classList.remove('is-open'); el.classList.remove('is-open');
      if (pdp.hidden) document.body.classList.remove('is-locked');
      setTimeout(() => { if (!el.classList.contains('is-open')) { el.hidden = true; scrim.hidden = true; } }, 700);
    }
    function add(id, btn) {
      const p = byId[id]; if (!p) return;
      const it = items.find((i) => i.id === id);
      if (it) it.qty += 1; else items.push({ id, qty: 1 });
      persist(); render(true);
      say(`${p.nombre} está en tu carrito`);
      if (btn && btn.classList.contains('pill')) {
        const txt = btn.textContent; btn.classList.add('is-added'); btn.textContent = 'Agregado ✓';
        setTimeout(() => { btn.classList.remove('is-added'); btn.textContent = txt; }, 1600);
      }
    }
    list.addEventListener('click', (e) => {
      const row = e.target.closest('.cart-item'); if (!row) return;
      const it = items.find((i) => i.id === row.dataset.id);
      const q = e.target.closest('[data-qty]');
      if (q) { it.qty += Number(q.dataset.qty); if (it.qty < 1) items = items.filter((i) => i !== it); }
      if (e.target.closest('[data-rm]')) items = items.filter((i) => i !== it);
      persist(); render();
    });
    document.querySelectorAll('[data-cart-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setMenu && setMenu(false); open(); }));
    document.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', () => close()));
    el.querySelector('[data-checkout]').addEventListener('click', () => {
      if (!items.length) return;
      const base = (CFG.sitio || new URL('.', location.href).href).replace(/\/$/, '');
      const lines = items.map((i) => `• ${byId[i.id].nombre} x ${i.qty} — ${byId[i.id].precio == null ? 'precio por confirmar' : precio(byId[i.id].precio * i.qty)}`);
      // número de pedido + fecha: la misma info que imprime la factura (/api/factura)
      const now = new Date();
      const num = 'FER-' + now.getTime().toString(36).slice(-5).toUpperCase();
      const fecha = [now.getDate(), now.getMonth() + 1].map((x) => String(x).padStart(2, '0')).join('.') + '.' + now.getFullYear();
      const qs = new URLSearchParams({ i: items.map((i) => `${i.id}.${i.qty}`).join('_'), n: num, d: fecha });
      // WhatsApp muestra la factura como imagen de vista previa de este enlace
      const link = `${base}/api/pedido?${qs}`;
      const msg = `Hola FEROLI, quiero hacer este pedido de ORIGEN.\n\nPedido No. ${num}\n${lines.join('\n')}\n\nTotal: ${precio(total())}${items.some((i) => byId[i.id].precio == null) ? ' (+ piezas con precio por confirmar)' : ''}\n\n¿Alguna de estas piezas está disponible para entrega inmediata?\n\nMi factura:\n${link}`;
      const a = document.createElement('a');
      a.href = waLink(msg); a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
    });
    render();
    return { add, open, close, isOpen: () => el.classList.contains('is-open') };
  })();

  /* =========================================================
     4. PÁGINA DE PRODUCTO (#pieza-id)
     ========================================================= */
  const pdp = document.getElementById('pdp');
  const COLL_NAME = { destacados: 'ORIGEN // Destacados', dia: 'ORIGEN // Día 002', noche: 'ORIGEN // Noche 003' };
  let lastFocus = null;

  /* carrusel de fotos */
  const gTrack = pdp.querySelector('.gal__track');
  const gThumbs = pdp.querySelector('.gal__thumbs');
  const galIndex = () => Math.round(gTrack.scrollLeft / Math.max(1, gTrack.clientWidth));
  const galGo = (i) => {
    const n = gTrack.children.length;
    i = (i + n) % n;
    gTrack.scrollTo({ left: i * gTrack.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };
  function galSync() {
    const i = galIndex();
    pdp.querySelector('.gal__now').textContent = String(i + 1).padStart(2, '0');
    gThumbs.querySelectorAll('.gal__thumb').forEach((t, k) => t.classList.toggle('is-on', k === i));
    [...gTrack.children].forEach((f, k) => f.classList.toggle('is-on', k === i));
  }
  let gT;
  gTrack.addEventListener('scroll', () => { cancelAnimationFrame(gT); gT = requestAnimationFrame(galSync); }, { passive: true });
  pdp.querySelectorAll('[data-gal]').forEach((b) => b.addEventListener('click', () => galGo(galIndex() + Number(b.dataset.gal))));
  gThumbs.addEventListener('click', (e) => { const t = e.target.closest('[data-go]'); if (t) galGo(Number(t.dataset.go)); });
  gTrack.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); galGo(galIndex() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); galGo(galIndex() - 1); }
  });

  function fillProduct(p) {
    const colls = Object.keys(p.colecciones || {});
    pdp.querySelector('.pdp__coll').innerHTML = esc(COLL_NAME[colls[colls.length - 1]] || 'ORIGEN').replace('//', '<span class="sep">//</span>');
    pdp.querySelector('.pdp__name').textContent = p.nombre;
    pdp.querySelector('.pdp__price').textContent = precio(p.precio);
    const stock = pdp.querySelector('.pdp__stock');
    stock.innerHTML = (p.entrega ? `<p class="stock ${/inmediata/i.test(p.entrega) ? 'is-now' : ''}"><span class="dot"></span>${esc(p.entrega)}</p>` : '') + (p.color ? `<p class="stock stock--color">${esc(p.color)}</p>` : '');
    stock.hidden = !stock.innerHTML;
    pdp.querySelector('.pdp__cta').dataset.add = p.id;
    pdp.querySelector('.pdp__wa').href = waPieza(p);
    const specs = pdp.querySelector('.pdp__specs');
    specs.innerHTML = p.medidas && p.medidas.length ? `
      <p class="eyebrow">Medidas</p>
      <dl class="specs">${p.medidas.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '';
    specs.hidden = !specs.innerHTML;
    const labels = ['Vista completa', 'Detalle de cuentas y placa', 'Con modelo', 'Otra vista', 'Otra vista'];
    const fotos = p.fotos.slice(0, 5);
    gTrack.innerHTML = fotos.map((src, i) => `
      <figure class="gal__slide"><img src="${src}" alt="${esc(p.nombre)}, ${labels[i].toLowerCase()}" class="${i > 0 || /\.jpe?g$/.test(src) ? 'is-photo' : ''}" draggable="false"></figure>`).join('');
    gThumbs.innerHTML = fotos.map((src, i) => `
      <button class="gal__thumb" data-go="${i}" aria-label="${labels[i]}"><img src="${src}" alt="" class="${i > 0 || /\.jpe?g$/.test(src) ? 'is-photo' : ''}"></button>`).join('');
    gTrack.querySelectorAll('figure').forEach((f) => f.querySelector('img').addEventListener('error', () => f.classList.add('is-missing'), { once: true }));
    pdp.querySelector('.gal__all').textContent = String(fotos.length).padStart(2, '0');
    gTrack.scrollLeft = 0; galSync();
    const rel = PRODUCTOS.filter((x) => x.id !== p.id && x.fotos[0].endsWith('.webp')).slice(0, 3);
    pdp.querySelector('.pdp__related').innerHTML = rel.map((x) => `
      <button data-open="${x.id}"><img src="${x.fotos[0]}" alt="" loading="lazy"><span>${esc(x.nombre)}</span></button>`).join('');
  }

  function openProduct(id, fromHash) {
    const p = byId[id];
    if (!p) return;
    fillProduct(p);
    if (pdp.hidden) {
      lastFocus = document.activeElement;
      pdp.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => requestAnimationFrame(() => pdp.classList.add('is-open')));
    }
    pdp.scrollTop = 0;
    pdp.querySelector('.pdp__back').focus({ preventScroll: true });
    if (!fromHash && location.hash !== `#pieza-${id}`) history.pushState(null, '', `#pieza-${id}`);
  }
  function closeProduct(fromHash) {
    if (pdp.hidden) return;
    pdp.classList.remove('is-open');
    if (document.getElementById('all').hidden) document.body.classList.remove('is-locked');
    setTimeout(() => { pdp.hidden = true; }, 450);
    if (!fromHash && location.hash.startsWith('#pieza-')) history.pushState(null, '', location.pathname + location.search);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  window.openProduct = openProduct;

  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); e.stopPropagation(); Cart.add(add.dataset.add, add); return; }
    const t = e.target.closest('[data-open]');
    if (t) { e.preventDefault(); openProduct(t.dataset.open); return; }
    if (e.target.closest('[data-close]')) { e.preventDefault(); closeProduct(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (Cart.isOpen()) Cart.close(); else closeProduct(); } });
  const fromHash = () => {
    const m = location.hash.match(/^#pieza-([a-z0-9-]+)$/);
    if (m) openProduct(m[1], true); else closeProduct(true);
  };
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('popstate', fromHash);
  fromHash();

  /* =========================================================
     5. TICKER DE VALORES (una línea)
     ========================================================= */
  const PALABRAS = ['Elegancia', 'Confianza', 'Autenticidad'];
  const PALABRA_FOTO = { Elegancia: 'img/productos/bianca-1.webp', Confianza: 'img/productos/nox-1.webp', Autenticidad: 'img/productos/coral-baguette-1.webp' };
  const marquees = [];
  document.querySelectorAll('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    const group = document.createElement('div');
    group.className = 'marquee__group';
    for (let r = 0; r < 2; r++) PALABRAS.forEach((w) => group.insertAdjacentHTML('beforeend', `<span class="marquee__item" data-img="${PALABRA_FOTO[w]}">${w}</span><span class="marquee__arrow" aria-hidden="true">↗</span>`));
    track.appendChild(group);
    const fill = () => {
      while (track.children.length > 1) track.lastChild.remove();
      const need = Math.ceil((window.innerWidth * 2) / group.offsetWidth) + 1;
      for (let i = 0; i < need; i++) { const c = group.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
    };
    fill();
    marquees.push({ track, group, fill, x: 0, k: 1, dir: m.dataset.dir === 'right' ? 1 : -1, speed: Number(m.dataset.speed) || 40 });
  });
  let rT;
  window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => marquees.forEach((q) => q.fill()), 200); });

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- toda la colección ---------- */
  const allEl = document.getElementById('all');
  const allGrid = allEl.querySelector('.all__grid');
  const ALL_SECC = [['dia', 'Día', 'ORIGEN // 002'], ['noche', 'Noche', 'ORIGEN // 003'], ['especial', 'Edición especial', 'Pieza limitada']];
  allGrid.innerHTML = ALL_SECC.map(([key, titulo, sub]) => {
    const ps = inColl(key).filter((p) => p.visible !== false);
    if (!ps.length) return '';
    return `<section class="all__sec" id="todas-${key}">
      <div class="all__sechead"><h3 class="all__sectitle">${titulo}</h3><p class="eyebrow">${esc(sub).replace('//', '<span class="sep">//</span>')} · ${String(ps.length).padStart(2, '0')}</p></div>
      <div class="all__cards">${ps.map(allCardHTML).join('')}</div>
    </section>`;
  }).join('');
  bindCards(allGrid);
  allEl.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const t = document.getElementById(a.dataset.jump);
    if (t) allEl.scrollTo({ top: t.offsetTop - 80, behavior: reduce ? 'auto' : 'smooth' });
  }));
  const openAll = () => {
    allEl.hidden = false; document.body.classList.add('is-locked');
    requestAnimationFrame(() => requestAnimationFrame(() => allEl.classList.add('is-open')));
    allEl.scrollTop = 0; allEl.querySelector('[data-all-close]').focus({ preventScroll: true });
  };
  const closeAll = () => {
    allEl.classList.remove('is-open');
    if (pdp.hidden) document.body.classList.remove('is-locked');
    setTimeout(() => { allEl.hidden = true; }, 450);
  };
  document.querySelectorAll('[data-all]').forEach((b) => b.addEventListener('click', openAll));
  allEl.querySelectorAll('[data-all-close]').forEach((b) => b.addEventListener('click', closeAll));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !allEl.hidden && pdp.hidden) closeAll(); });

  /* ---------- menú ---------- */
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
  };
  toggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- cursor "Conocer" + vista previa de valores ---------- */
  const cursor = document.querySelector('.cursor');
  const peek = document.querySelector('.peek');
  const peekImg = peek.querySelector('img');
  let mx = -200, my = -200, cx = mx, cy = my, px = mx, py = my, lastY = window.scrollY, valuesHover = false;
  window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('.card__media, .piece__media');
    cursor.classList.toggle('is-on', !!t);
    cursor.classList.toggle('is-light', !!(t && t.closest('.block--noche')));
  });
  const values = document.querySelector('.values');
  values.addEventListener('pointerenter', () => { valuesHover = true; });
  values.addEventListener('pointerleave', () => { valuesHover = false; peek.classList.remove('is-on'); });
  values.addEventListener('pointerover', (e) => {
    const item = e.target.closest('.marquee__item');
    if (!item) { peek.classList.remove('is-on'); return; }
    if (peekImg.getAttribute('src') !== item.dataset.img) peekImg.src = item.dataset.img;
    peek.classList.add('is-on');
  });

  /* ---------- loop: nav, parallax, marquee, cursor ---------- */
  const parallax = [...document.querySelectorAll('[data-parallax]')];
  const drift = [...document.querySelectorAll('[data-drift]')];
  const driftY = [...document.querySelectorAll('[data-drift-y]')];
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(64, now - last) / 1000;
    last = now;
    const vh = window.innerHeight;
    const y = window.scrollY;

    nav.classList.toggle('is-solid', y > hero.offsetHeight - nav.offsetHeight - 10);
    if (Math.abs(y - lastY) > 6) { nav.classList.toggle('is-hidden', y > lastY && y > vh * 0.9 && menu.hidden); lastY = y; }

    cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
    cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    px += (mx - px) * 0.12; py += (my - py) * 0.12;
    peek.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;

    if (!reduce) {
      parallax.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        const max = el.offsetHeight - r.height;
        const s = Number(el.dataset.parallax) || 0.1;
        el.style.transform = `translate3d(0, ${(-max / 2 + p * max / 2 * Math.min(1, s * 6)).toFixed(1)}px, 0)`;
      });
      drift.forEach((el) => {
        const r = el.parentElement.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.transform = `translate3d(${((r.top + r.height / 2 - vh / 2) * Number(el.dataset.drift)).toFixed(1)}px, 0, 0)`;
      });
      driftY.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.transform = `translate3d(0, ${((r.top - vh) * Number(el.dataset.driftY)).toFixed(1)}px, 0)`;
      });
    }

    marquees.forEach((q) => {
      const w = q.group.offsetWidth;
      if (!w) return;
      q.k += ((valuesHover ? 0.2 : 1) - q.k) * Math.min(1, dt * 4);
      q.x += q.dir * q.speed * dt * q.k * (reduce ? 0.25 : 1);
      if (q.x <= -w) q.x += w;
      if (q.x > 0) q.x -= w;
      q.track.style.transform = `translate3d(${q.x.toFixed(2)}px, 0, 0)`;
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
