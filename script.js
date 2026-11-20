/* ============ SCREEN NAVIGATION ============ */
const scroller = document.getElementById('screens');
const hint = document.getElementById('hint');
const SCREEN_COUNT = document.querySelectorAll('.screen').length;

const isHorizontal = () => !window.matchMedia('(orientation: portrait)').matches;
const screenSize = () => (isHorizontal() ? scroller.clientWidth : scroller.clientHeight);
const scrollPos = () => (isHorizontal() ? scroller.scrollLeft : scroller.scrollTop);
const currentIndex = () => Math.round(scrollPos() / screenSize());
const viewerOpen = () => document.body.classList.contains('viewer-open');

let lastIndex = 0, anim = null;

/* Desktop uses our own gentle animation (no bounce). Phones use native snapping. */
function goTo(index, instant = false) {
  index = Math.max(0, Math.min(SCREEN_COUNT - 1, index));
  lastIndex = index;
  const target = index * screenSize();

  if (!isHorizontal()) {
    scroller.scrollTo({ top: target, behavior: instant ? 'instant' : 'smooth' });
    return;
  }
  cancelAnimationFrame(anim);
  const from = scroller.scrollLeft;
  if (instant || from === target) { scroller.scrollLeft = target; return; }

  const dur = 800, t0 = performance.now();
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    scroller.scrollLeft = from + (target - from) * ease(t);
    if (t < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}

scroller.addEventListener('scroll', () => {
  lastIndex = currentIndex();
  if (scrollPos() > 30) hint.classList.add('gone');
}, { passive: true });

/* ---- mouse wheel: one screen per scroll ---- */
let wheelLocked = false;
scroller.addEventListener('wheel', (e) => {
  if (!isHorizontal()) return;
  e.preventDefault();
  const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (viewerOpen() || wheelLocked || Math.abs(delta) < 8) return;
  wheelLocked = true;
  goTo(currentIndex() + (delta > 0 ? 1 : -1));
  setTimeout(() => (wheelLocked = false), 850);
}, { passive: false });

/* ---- mouse: click and drag the background ---- */
let drag = null;
scroller.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || !isHorizontal() || viewerOpen()) return;
  if (e.target.closest('[data-draggable], [data-nodrag], button, a')) return;
  cancelAnimationFrame(anim);
  drag = { x: e.clientX, left: scroller.scrollLeft, index: currentIndex() };
  scroller.classList.add('dragging');
  scroller.setPointerCapture(e.pointerId);
});
scroller.addEventListener('pointermove', (e) => {
  if (drag) scroller.scrollLeft = drag.left - (e.clientX - drag.x);
});
function endDrag(e) {
  if (!drag) return;
  const moved = e.clientX - drag.x;
  const threshold = screenSize() * 0.12;
  let target = drag.index;
  if (moved < -threshold) target += 1;
  if (moved > threshold) target -= 1;
  drag = null;
  scroller.classList.remove('dragging');
  goTo(target);
}
scroller.addEventListener('pointerup', endDrag);
scroller.addEventListener('pointercancel', endDrag);

/* ---- keyboard arrows ---- */
window.addEventListener('keydown', (e) => {
  if (viewerOpen()) return;
  const next = isHorizontal() ? 'ArrowRight' : 'ArrowDown';
  const prev = isHorizontal() ? 'ArrowLeft' : 'ArrowUp';
  if (e.key === next) goTo(currentIndex() + 1);
  if (e.key === prev) goTo(currentIndex() - 1);
});

window.addEventListener('resize', () => { if (isHorizontal()) goTo(lastIndex, true); });

/* ============ SCREENS ============ */
initCloud('movies', MOVIES, { dir: 'assets/movies/', linkLabel: 'watch the trailer' });
initCloud('books', BOOKS, { dir: 'assets/books/', kind: 'books', linkLabel: 'see more' });
initSongs('songs', SONGS, { dir: 'assets/songs/' });
