function initSongs(screenId, songs, opts = {}) {
  const screen = document.getElementById(screenId);
  const dir = opts.dir || 'assets/songs/';
  const n = songs.length;
  const PLAY_SPEED = 0.14;
  const STARS = { dx: -13, dy: 141, ref: 290 };
  const uriOf = (s) => {
    const m = s.link.match(/track\/([A-Za-z0-9]+)/);
    return m ? 'spotify:track:' + m[1] : '';
  };

  screen.classList.remove('placeholder');
  screen.innerHTML = `
    <div class="s-box" data-nodrag>
      <a class="s-title" target="_blank" rel="noopener"></a>
      <p class="s-artist"></p>
      <button class="s-play" aria-label="play">
        <svg class="i-play" viewBox="0 0 24 24"><path d="M9 6.5v11l9-5.5z"/></svg>
        <svg class="i-pause" viewBox="0 0 24 24"><path d="M8.5 6.5h2.6v11H8.5zM12.9 6.5h2.6v11h-2.6z"/></svg>
      </button>
    </div>
    <div class="s-stage"></div>
    <div class="s-hint"><span class="s-hint-icon">\u21bb</span><span class="h-d">spin the record</span><span class="h-m">spin the record</span></div>
    <div class="s-embed" data-nodrag><div></div></div>`;

  const $ = (s) => screen.querySelector(s);
  const titleEl = $('.s-title'), artistEl = $('.s-artist'), playBtn = $('.s-play');
  const stage = $('.s-stage'), hint = $('.s-hint'), embedHost = $('.s-embed div');
  const isPlayingUI = () => playBtn.classList.contains('playing');

  const loadImg = (src) => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('missing image: ' + src));
    i.src = src;
  });

  function alphaBox(img, thr = 200) {
    const W = img.naturalWidth, H = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, W, H).data;
    let x0 = W, x1 = -1, y0 = H, y1 = -1;
    for (let y = 0; y < H; y++) {
      const row = y * W * 4;
      for (let x = 0; x < W; x++) {
        if (d[row + x * 4 + 3] > thr) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    return x1 < 0 ? null : { x0, y0, x1: x1 + 1, y1: y1 + 1 };
  }

  const geo = new Map();
  let starsImg = null;
  function prepare(song) {
    if (geo.has(song.file)) return geo.get(song.file);
    const p = (async () => {
      if (!starsImg) starsImg = await loadImg(dir + 'stars.png').catch(() => null);
      const [rec, cd] = await Promise.all([loadImg(dir + song.file + '.png'), loadImg(dir + song.file + '-cd.png')]);
      const W = rec.naturalWidth, H = rec.naturalHeight;
      const rb = alphaBox(rec), cb = alphaBox(cd);
      if (!rb || !cb) throw new Error('could not measure ' + song.file);
      const bw = cb.x1 - cb.x0, bh = cb.y1 - cb.y0;
      let x0, y0;
      if (cd.naturalWidth === W && cd.naturalHeight === H) { x0 = cb.x0; y0 = cb.y0; }
      else { x0 = rb.x1 - bw; y0 = (rb.y0 + rb.y1) / 2 - bh / 2; }
      x0 += opts.cdDx || 0; y0 += opts.cdDy || 0;
      const R = bh / 2, Cx = x0 + bw - R, Cy = y0 + bh / 2;

      const D = Math.round(2 * R);
      const cv = document.createElement('canvas');
      cv.width = D; cv.height = D;
      const ctx = cv.getContext('2d');
      ctx.save(); ctx.translate(bw, 0); ctx.scale(-1, 1);
      ctx.drawImage(cd, cb.x0, cb.y0, bw, bh, 0, 0, bw, D);
      ctx.restore();
      ctx.drawImage(cd, cb.x0, cb.y0, bw, bh, D - bw, 0, bw, D);
      const url = await new Promise((res) => cv.toBlob((b) => res(URL.createObjectURL(b)), 'image/png'));
      console.info('[songs]', song.file, { size: [W, H], disc: { cx: Math.round(Cx), cy: Math.round(Cy), r: Math.round(R) } });
      return { W, H, x0, y0, bw, bh, Cx, Cy, R, url };
    })();
    p.catch((err) => console.warn('[songs]', err.message));
    geo.set(song.file, p);
    return p;
  }

  const pc = (v, t) => (v / t) * 100 + '%';
  const spinners = [];

  function makeRec(song) {
    const el = document.createElement('div');
    el.className = 'rec';
    el.tabIndex = 0;
    el.dataset.draggable = '';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'spin the record to change song');
    const img = new Image();
    img.className = 'rec-img';
    img.src = dir + song.file + '.png';
    img.alt = song.title + ' \u2013 ' + song.by;
    img.draggable = false;
    el.append(img);
    const s = { el, wrap: null, angle: 0, omega: 0, held: false, leaving: false };
    spinners.push(s);

    prepare(song).then((g) => {
      if (!el.isConnected && !s.leaving) { }
      const clip = document.createElement('div');
      clip.className = 'rec-clip';
      Object.assign(clip.style, { left: pc(g.x0, g.W), top: pc(g.y0, g.H), width: pc(g.bw, g.W), height: pc(g.bh, g.H) });
      const wrap = document.createElement('div');
      wrap.className = 'rec-wrap';
      Object.assign(wrap.style, {
        left: pc(g.Cx - g.R - g.x0, g.bw), top: pc(g.Cy - g.R - g.y0, g.bh),
        width: pc(2 * g.R, g.bw), height: pc(2 * g.R, g.bh),
        transform: `rotate(${s.angle}deg)`,
      });
      const disc = new Image();
      disc.src = g.url; disc.alt = ''; disc.draggable = false;
      wrap.append(disc); clip.append(wrap); el.append(clip);
      if (starsImg) {
        const st = new Image();
        st.className = 'rec-stars';
        st.src = starsImg.src; st.alt = ''; st.draggable = false;
        const k = g.R / STARS.ref;
        Object.assign(st.style, {
          left: pc(g.Cx + STARS.dx * k, g.W), top: pc(g.Cy + STARS.dy * k, g.H),
          width: pc(starsImg.naturalWidth * k, g.W), height: 'auto',
        });
        el.append(st);
        requestAnimationFrame(() => (st.style.opacity = 1));
      }
      s.wrap = wrap;
    }).catch(() => {});
    return s;
  }

  let raf = 0, lastT = 0, visible = false;
  function tick(now) {
    const dt = Math.min(50, now - (lastT || now));
    lastT = now;
    for (const s of spinners) {
      if (!s.held) {
        const target = s.leaving ? 0 : isPlayingUI() ? PLAY_SPEED : 0;
        const tau = s.leaving ? 1400 : 650;
        s.omega += (target - s.omega) * (1 - Math.exp(-dt / tau));
        s.angle += s.omega * dt;
      }
      if (s.wrap) s.wrap.style.transform = `rotate(${s.angle}deg)`;
    }
    raf = visible ? requestAnimationFrame(tick) : 0;
    if (!visible) lastT = 0;
  }
  const startLoop = () => { if (!raf) raf = requestAnimationFrame(tick); };

  /* ---------- meta + slide animations ---------- */
  function setMeta(s, animate) {
    const apply = () => { titleEl.textContent = s.title; titleEl.href = s.link; artistEl.textContent = s.by; };
    if (!animate) { apply(); return; }
    const outs = [titleEl, artistEl].map((e) =>
      e.animate([{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(5px)' }], { duration: 220, fill: 'forwards' }));
    outs[0].finished.then(() => {
      apply();
      [titleEl, artistEl].forEach((e) => {
        e.getAnimations().forEach((an) => an.cancel());
        e.animate([{ opacity: 0, filter: 'blur(5px)' }, { opacity: 1, filter: 'blur(0px)' }], { duration: 380, easing: 'ease-out' });
      });
    });
  }
  function exitRec(s, dir) {
    s.leaving = true;
    s.omega = dir * 0.8;
    const an = s.el.animate([
      { transform: 'translateX(0) rotate(0deg)', opacity: 1, filter: 'blur(0px)' },
      { transform: `translateX(${-dir * 58}vw) rotate(${-dir * 5}deg)`, opacity: 0, filter: 'blur(8px)' },
    ], { duration: 800, easing: 'cubic-bezier(.55, 0, .85, .45)', fill: 'forwards' });
    an.finished.then(() => { s.el.remove(); spinners.splice(spinners.indexOf(s), 1); });
  }
  function enterRec(s, dir) {
    s.omega = dir * 0.7;
    s.el.animate([
      { transform: `translateX(${dir * 58}vw) rotate(${dir * 5}deg)`, opacity: 0, filter: 'blur(8px)' },
      { opacity: 1, filter: 'blur(2px)', offset: 0.4 },
      { transform: 'translateX(0) rotate(0deg)', opacity: 1, filter: 'blur(0px)' },
    ], { duration: 1100, delay: 120, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
  }

  let idx = 0, cur = makeRec(songs[0]), busy = false, used = false, g = null;
  cur.el.style.opacity = 0;
  stage.append(cur.el);
  setMeta(songs[0], false);

  function go(dir) {
    if (busy) return;
    busy = true;
    idx = (idx + dir + n) % n;
    const old = cur;
    const hadFocus = document.activeElement === old.el;
    cur = makeRec(songs[idx]);
    stage.append(cur.el);
    if (hadFocus) cur.el.focus({ preventScroll: true });
    exitRec(old, dir);
    enterRec(cur, dir);
    setMeta(songs[idx], true);
    loadAudio();
    if (!used) { used = true; hint.classList.add('gone'); }
    setTimeout(() => (busy = false), 900);
  }

  const ang = (e) => (Math.atan2(e.clientY - g.cy, e.clientX - g.cx) * 180) / Math.PI;

  stage.addEventListener('pointerdown', (e) => {
    const r = e.target.closest('.rec');
    if (!r || r !== cur.el || busy) return;
    r.getAnimations().forEach((an) => an.cancel());
    const b = (cur.wrap || r).getBoundingClientRect();
    g = { s: cur, id: e.pointerId, cx: b.left + b.width / 2, cy: b.top + b.height / 2, last: null, total: 0, vel: 0, t: performance.now() };
    if (Math.hypot(e.clientX - g.cx, e.clientY - g.cy) >= 24) g.last = ang(e);
    r.setPointerCapture(e.pointerId);
    r.classList.add('held');
    cur.held = true;
    cur.omega = 0;
    startLoop();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!g || e.pointerId !== g.id) return;
    if (Math.hypot(e.clientX - g.cx, e.clientY - g.cy) < 24) return;
    const a = ang(e);
    if (g.last === null) { g.last = a; return; }
    let d = a - g.last;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    g.last = a;
    const now = performance.now(), dt = Math.max(1, now - g.t);
    g.t = now;
    g.total += d;
    g.vel = 0.7 * g.vel + 0.3 * (d / dt);
    g.s.angle += d;
    g.s.omega = g.vel;
    if (Math.abs(g.total) >= 100) release();
  });
  function release() {
    if (!g) return;
    const { s, id, total, vel, t } = g;
    g = null;
    try { s.el.releasePointerCapture(id); } catch (err) { /* already released */ }
    s.el.classList.remove('held');
    s.held = false;
    const fresh = performance.now() - t < 120;
    const flick = fresh && Math.abs(vel) > 0.35 && Math.abs(total) > 15;
    if (Math.abs(total) >= 100 || flick) go(total >= 0 ? 1 : -1);
    else s.omega = fresh ? vel : 0;
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('keydown', (e) => {
    if (e.target.closest('.rec') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(1); }
  });

  let ctrl = null, started = false, want = false, playing = false, ended = false, progressed = false;
  const setBtn = (on) => {
    playBtn.classList.toggle('playing', on);
    playBtn.setAttribute('aria-label', on ? 'pause' : 'play');
  };

  function loadAudio() {
    if (!ctrl) return;
    want = want || playing;
    ended = false; progressed = false;
    setBtn(want);
    ctrl.loadUri(uriOf(songs[idx]));
  }

  function startSpotify() {
    if (started) return;
    started = true;
    window.onSpotifyIframeApiReady = (API) => {
      API.createController(embedHost, { uri: uriOf(songs[idx]), width: '100%', height: 80 }, (c) => {
        ctrl = c;
        c.addListener('ready', () => {
          if (want) { want = false; c.play(); }
        });
        c.addListener('playback_update', (e) => {
          const d = e.data || {};
          playing = !d.isPaused;
          if (playing && d.position > 1000) progressed = true;
          ended = !!d.isPaused && ((d.duration > 0 && d.position >= d.duration - 500) || (progressed && d.position === 0));
          if (!want) setBtn(playing);
        });
      });
    };
    const s = document.createElement('script');
    s.src = 'https://open.spotify.com/embed/iframe-api/v1';
    s.async = true;
    s.onerror = () => screen.classList.add('no-audio');
    document.body.append(s);
  }

  playBtn.addEventListener('click', () => {
    startSpotify();
    if (!ctrl) { want = !want; setBtn(want); return; }
    if (ended) { want = true; ended = false; progressed = false; setBtn(true); ctrl.loadUri(uriOf(songs[idx])); return; }
    if (want) { want = false; setBtn(false); return; }
    setBtn(!playing);
    ctrl.togglePlay();
  });


  let first = true;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) startLoop();
    if (visible && first) {
      first = false;
      enterRec(cur, 1);
      cur.el.style.opacity = '';
      startSpotify();
      songs.slice(1).forEach((s, i) => setTimeout(() => prepare(s).catch(() => {}), 600 + i * 350));
    }
  }, { threshold: 0.5 }).observe(screen);

  const nudge = setInterval(() => {
    if (used) { clearInterval(nudge); return; }
    if (!visible || busy || g || first) return;
    cur.omega = 0.3;
  }, 5000);
}
