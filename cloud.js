function straightAngle(img) {
  try {
    const W = 160, H = Math.max(1, Math.round((W * img.naturalHeight) / img.naturalWidth));
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data;
    const pts = [];
    for (let y = 0; y < H; y += 2)
      for (let x = 0; x < W; x += 2)
        if (d[(y * W + x) * 4 + 3] > 128) pts.push(x - W / 2, y - H / 2);
    let best = 0, bestArea = Infinity;
    for (let a = -30; a <= 30; a += 0.5) {
      const cos = Math.cos((a * Math.PI) / 180), sin = Math.sin((a * Math.PI) / 180);
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i] * cos - pts[i + 1] * sin, y = pts[i] * sin + pts[i + 1] * cos;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      const area = (x1 - x0) * (y1 - y0);
      if (area < bestArea - 0.01) { bestArea = area; best = a; }
    }
    return best;
  } catch (err) { return 0; }
}

function visibleBox(img) {
  try {
    const W = 200, H = Math.max(1, Math.round((W * img.naturalHeight) / img.naturalWidth));
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data;
    let x0 = W, x1 = -1, y0 = H, y1 = -1;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        if (d[(y * W + x) * 4 + 3] > 200) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
    if (x1 < 0) return null;
    return {
      fw: (x1 - x0 + 1) / W, fh: (y1 - y0 + 1) / H,
      cx: (x0 + x1 + 1) / 2 / W - 0.5, cy: (y0 + y1 + 1) / 2 / H - 0.5,
    };
  } catch (err) { return null; }
}

function initCloud(screenId, items, opts = {}) {
  const screen = document.getElementById(screenId);
  const portrait = window.matchMedia('(orientation: portrait)');
  const dir = opts.dir || '';
  const pfpDir = opts.pfpDir || 'assets/pfp/';
  const isBooks = opts.kind === 'books';
  const OPEN = () => {
    const o = portrait.matches ? { x: 50, y: 30, w: 56 } : { x: 40, y: 50, w: 36 };
    if (isBooks) o.w = portrait.matches ? 48 : 30; /* covers are tall, so a bit narrower */
    return o;
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const layoutOf = (item) => (portrait.matches ? item.mobile : item.desktop);
  let zTop = 10, current = null, drag = null, dealt = false;

  screen.classList.remove('placeholder');
  screen.innerHTML = `
    <div class="field"></div>
    <div class="scrim" data-nodrag></div>
    <div class="panel-wrap">
      <div class="panel" role="dialog" aria-modal="true" data-nodrag>
        <button class="close" aria-label="close">x</button>
        <h2 class="p-title"></h2>
        <p class="p-by"></p>
        <hr>
        <div class="p-note">
          <img class="p-pfp" alt="">
          <p><strong>sangwon says —</strong><span class="p-text"></span></p>
        </div>
        <p class="p-tags"></p>
        <hr>
        <a class="pill" target="_blank" rel="noopener"></a>
      </div>
    </div>`;
  const field = screen.querySelector('.field');
  const scrim = screen.querySelector('.scrim');
  const panel = screen.querySelector('.panel');
  const $ = (s) => panel.querySelector(s);
  panel.classList.toggle('book-panel', isBooks);

  const paint = (c, s = c.state) => {
    c.style.setProperty('--x', s.x);
    c.style.setProperty('--y', s.y);
    c.style.setProperty('--r', s.r);
    c.style.setProperty('--w', s.w);
  };

  const cards = items.map((item) => {
    const c = new Image();
    c.className = isBooks ? 'seal book pre' : 'seal stacked';
    c.src = dir + item.file + '.png';
    c.alt = item.title;
    c.draggable = false;
    c.decoding = 'async';
    c.tabIndex = 0;
    c.dataset.draggable = '';
    c.onerror = () => console.warn('missing image:', c.src);
    c.onload = () => {
      c.fix = item.fix ?? straightAngle(c);
      if (isBooks) c.vis = visibleBox(c);
    };
    c.item = item;
    c.state = { ...layoutOf(item) };
    if (isBooks) {
      paint(c);
      c.addEventListener('animationend', () => { c.classList.remove('fall'); c.style.animationDelay = ''; });
    } else {
      paint(c, { x: 50, y: 50, r: rand(-25, 25), w: c.state.w });
    }
    field.append(c);
    return c;
  });

  const clearDelays = (ms) => setTimeout(() => cards.forEach((c) => (c.style.transitionDelay = '')), ms);
  function deal() {
    dealt = true;
    if (isBooks) {
      cards.forEach((c, i) => {
        c.style.animationDelay = i * 90 + rand(0, 140) + 'ms';
        c.classList.add('fall');
        c.classList.remove('pre');
      });
      return;
    }
    cards.forEach((c, i) => {
      c.style.transitionDelay = i * 70 + 'ms';
      c.classList.remove('stacked');
      paint(c);
    });
    clearDelays(cards.length * 70 + 1200);
  }
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !dealt) deal(); }, { threshold: 0.5 }).observe(screen);

  portrait.addEventListener('change', () => {
    close();
    cards.forEach((c) => { c.state = { ...layoutOf(c.item) }; if (dealt) paint(c); });
  });

  field.addEventListener('pointerover', (e) => {
    const c = e.target.closest('.seal');
    if (c && !current && e.pointerType === 'mouse') c.style.zIndex = ++zTop;
  });

  field.addEventListener('pointerdown', (e) => {
    const c = e.target.closest('.seal');
    if (!c || current || c.classList.contains('pre') || c.classList.contains('fall')) return;
    cancelAnimationFrame(c.glide);
    clearTimeout(c.dropT);
    c.classList.remove('drop');
    c.setPointerCapture(e.pointerId);
    drag = {
      c, sx: e.clientX, sy: e.clientY, ox: c.state.x, oy: c.state.y,
      moved: false, r: screen.getBoundingClientRect(),
      vx: 0, vy: 0, t: performance.now(),
    };
    c.style.zIndex = ++zTop;
    c.classList.add('dragging');
    c.baseR = c.state.r;      
    c.state.r = c.fix || 0;   
    paint(c);
  });
  field.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    const { c } = drag, px = c.state.x, py = c.state.y, now = performance.now(), dt = Math.max(1, now - drag.t);
    c.state.x = clamp(drag.ox + (dx / drag.r.width) * 100, 3, 97);
    c.state.y = clamp(drag.oy + (dy / drag.r.height) * 100, 3, 97);
    drag.vx = 0.6 * drag.vx + 0.4 * ((c.state.x - px) / dt); /* speed in % per ms */
    drag.vy = 0.6 * drag.vy + 0.4 * ((c.state.y - py) / dt);
    drag.t = now;
    paint(c);
  });
  const endDrag = (cancelled) => {
    if (!drag) return;
    const { c, moved, vx, vy, t } = drag;
    drag = null;
    c.classList.remove('dragging');
    c.state.r = c.baseR; /* back to its own tilt */
    if (!moved && !cancelled) { open(c); return; }

    c.classList.add('drop');
    paint(c);
    c.dropT = setTimeout(() => c.classList.remove('drop'), 800);

    const fresh = performance.now() - t < 80;
    const sp = Math.hypot(vx, vy);
    if (fresh && sp > 0.004) {
      const k = Math.min(1, 0.12 / sp);
      let gx = vx * k, gy = vy * k, last = performance.now();
      const t0 = last;
      const step = (now) => {
        const dt = Math.min(32, now - last); last = now;
        c.state.x = clamp(c.state.x + gx * dt, 3, 97);
        c.state.y = clamp(c.state.y + gy * dt, 3, 97);
        gx *= Math.pow(0.94, dt / 16); gy *= Math.pow(0.94, dt / 16);
        paint(c);
        if (Math.hypot(gx, gy) > 0.003 && now - t0 < 700 && !current) c.glide = requestAnimationFrame(step);
      };
      c.glide = requestAnimationFrame(step);
    }
  };
  field.addEventListener('pointerup', () => endDrag(false));
  field.addEventListener('pointercancel', () => endDrag(true));
  field.addEventListener('keydown', (e) => {
    const c = e.target.closest('.seal');
    if (c && e.key === 'Enter') open(c);
  });

  function bookOpenState(c) {
    const v = c.vis, sr = screen.getBoundingClientRect();
    const vmin = Math.min(sr.width, sr.height) / 100;
    const asp = c.naturalWidth / c.naturalHeight;
    const tall = portrait.matches;
    const maxW = tall ? 50 : 34, maxH = tall ? 62 : 46;   
    const w = Math.min(maxW / v.fw, (maxH * asp) / v.fh);  
    const imgW = w * vmin, imgH = imgW / asp, visW = imgW * v.fw;
    let cx, cy;                                            
    if (tall) { cx = sr.width * 0.5; cy = sr.height * 0.30; }
    else {
      const panelLeft = sr.width * 0.4 + 22 * vmin;        
      cx = panelLeft - (opts.openGap ?? 4) * vmin - visW / 2;
      cy = sr.height * 0.5;
    }
    cy += ((opts.openDy || 0) / 100) * sr.height;
    return { x: ((cx - v.cx * imgW) / sr.width) * 100, y: ((cy - v.cy * imgH) / sr.height) * 100, r: c.fix || 0, w };
  }


  function open(card) {
    current = card;
    card.prev = { ...card.state };
    const o = OPEN();
    card.state = isBooks && card.vis ? bookOpenState(card) : { x: o.x, y: o.y, r: card.fix || 0, w: o.w };
    card.style.zIndex = 9001;
    card.classList.add('open');
    paint(card);

    if (!isBooks) {
      cards.forEach((c) => {
        if (c === card) return;
        c.style.transitionDelay = rand(0, 150) + 'ms';
        c.state = {
          ...c.state,
          x: clamp(c.state.x + rand(-5, 5), 4, 96),
          y: clamp(c.state.y + rand(-5, 5), 4, 96),
          r: c.state.r + rand(-8, 8),
        };
        paint(c);
      });
      clearDelays(400);
    }

    const it = card.item;
    $('.p-title').textContent = it.title;
    $('.p-by').textContent = 'by ' + it.by;
    if (isBooks) {
      $('.p-tags').textContent = (it.tags || []).join(' · ');
    } else {
      $('.p-text').textContent = it.note;
      $('.p-pfp').src = pfpDir + it.pfp + '.png';
    }
    const a = $('.pill');
    a.href = it.link;
    a.textContent = opts.linkLabel || 'open';

    field.classList.add('has-open');
    document.body.classList.add('viewer-open');
    scrim.classList.add('show');
    panel.classList.add('show');
  }

  function close() {
    if (!current) return;
    const card = current;
    current = null;
    card.state = card.prev;
    card.classList.remove('open');
    paint(card);
    field.classList.remove('has-open');
    document.body.classList.remove('viewer-open');
    scrim.classList.remove('show');
    panel.classList.remove('show');
    setTimeout(() => { if (current !== card) card.style.zIndex = ++zTop; }, 900);
  }
  scrim.addEventListener('click', close);
  $('.close').addEventListener('click', close);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  panel.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = panel.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    panel.style.setProperty('--mx', px * 100 + '%');
    panel.style.setProperty('--my', py * 100 + '%');
    panel.style.setProperty('--rx', (0.5 - py) * 6 + 'deg');
    panel.style.setProperty('--ry', (px - 0.5) * 8 + 'deg');
  });
  panel.addEventListener('pointerleave', () => {
    panel.style.setProperty('--rx', '0deg');
    panel.style.setProperty('--ry', '0deg');
  });
}
