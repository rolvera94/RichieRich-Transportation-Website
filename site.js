const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Reveal-on-scroll (also triggers the timeline and the Texas map) */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add(e.target.classList.contains('rv') ? 'in' : 'on');
    io.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rv, #timeline, #txMap').forEach(el => io.observe(el));

/* Header: transparent over the hero, solid once you scroll */
const hdr = document.getElementById('hdr');
const menuBtn = document.getElementById('menuBtn');
const setHeader = () => hdr.classList.toggle('solid', window.scrollY > 30);
setHeader();

/* Mobile menu */
const closeMenu = () => {
  hdr.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Open menu');
};
menuBtn.addEventListener('click', () => {
  const open = hdr.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !hdr.classList.contains('open') || document.querySelector('dialog[open]')) return;
  closeMenu();
  menuBtn.focus();
  e.preventDefault();
});
window.addEventListener('resize', () => { if (window.innerWidth > 1120) closeMenu(); });

/* Scroll motion: hero parallax + fleet zoom */
const heroImg = document.getElementById('heroImg');
const fleetImg = document.getElementById('fleetImg');
let ticking = false;
const onScroll = () => {
  setHeader();
  if (reduceMotion || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY, vh = window.innerHeight;
    if (y < vh * 1.2) heroImg.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
    const r = fleetImg.parentElement.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      fleetImg.style.setProperty('--z', (1.14 - 0.14 * p).toFixed(3));
    }
    ticking = false;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* "Get a quote" on a service card pre-selects that service in the form */
document.querySelectorAll('[data-service]').forEach(a => {
  a.addEventListener('click', () => {
    const sel = document.getElementById('q-svc');
    if (sel) sel.value = a.dataset.service;
  });
});

/* Driver application dialog */
const applyDialog = document.getElementById('applyDialog');
document.querySelectorAll('[data-open-apply]').forEach(b => b.addEventListener('click', () => applyDialog.showModal()));
document.querySelectorAll('[data-close-apply]').forEach(b => b.addEventListener('click', () => applyDialog.close()));
applyDialog.addEventListener('click', e => { if (e.target === applyDialog) applyDialog.close(); });

/* =====================================================================
   FORMS — powered by FormSubmit (free, unlimited, attachments up to 10 MB).
   ---------------------------------------------------------------------
   Both forms post to FormSubmit, which emails Richard's inbox and sends
   the visitor back here with ?sent=quote or ?sent=apply. The form
   "action" URLs use FormSubmit's private alias, so the delivery address
   isn't in the site. To change inboxes, see HANDOFF.md §1.
   ===================================================================== */
const MAX_BYTES = 10 * 1024 * 1024;
const fmtSize = b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

// Shrink phone photos before sending so they fit the 10 MB limit.
async function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 400 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.8));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (err) {
    return file;
  }
}

// Drag-and-drop / tap-to-choose attachment box.
function setupDrop(field) {
  const zone = field.querySelector('[data-drop]');
  const input = field.querySelector('.drop-input');
  const list = field.querySelector('.drop-list');
  const err = field.querySelector('.drop-err');
  const maxFiles = Number(zone.dataset.maxFiles) || 5;
  const accept = input.accept.split(',').map(s => s.trim().toLowerCase());
  const state = { files: [], pending: [] };
  const okType = f => accept.some(a => a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : f.name.toLowerCase().endsWith(a));
  const total = () => state.files.reduce((s, f) => s + f.size, 0);
  const showErr = msg => { err.textContent = msg; err.hidden = !msg; };

  function render() {
    list.innerHTML = '';
    state.files.forEach((f, i) => {
      const li = document.createElement('li');
      let th;
      if (f.type.startsWith('image/')) {
        th = document.createElement('img');
        th.alt = '';
        th.src = URL.createObjectURL(f);
        th.onload = () => URL.revokeObjectURL(th.src);
      } else {
        th = document.createElement('span');
        th.textContent = (f.name.split('.').pop() || 'file').slice(0, 4).toUpperCase();
      }
      th.className = 'th';
      const nm = document.createElement('span');
      nm.className = 'nm';
      nm.textContent = f.name;
      const sz = document.createElement('span');
      sz.className = 'sz';
      sz.textContent = fmtSize(f.size);
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.textContent = '×';
      rm.setAttribute('aria-label', 'Remove ' + f.name);
      rm.addEventListener('click', () => { state.files.splice(i, 1); showErr(''); render(); });
      li.append(th, nm, sz, rm);
      list.appendChild(li);
    });
  }

  async function add(fileList) {
    showErr('');
    const incoming = Array.from(fileList);
    const job = (async () => {
      for (const raw of incoming) {
        if (!okType(raw)) { showErr('"' + raw.name + '" isn\'t a supported file type.'); continue; }
        if (state.files.length >= maxFiles) { showErr('You can attach up to ' + maxFiles + ' files.'); break; }
        const f = await shrinkImage(raw);
        // Other selections may finish compressing while this file is awaiting decoding.
        if (state.files.length >= maxFiles) { showErr('You can attach up to ' + maxFiles + ' files.'); break; }
        if (total() + f.size > MAX_BYTES) { showErr('"' + f.name + '" would go over the 10 MB total. Try a smaller file.'); continue; }
        state.files.push(f);
        render();
      }
    })();
    state.pending.push(job);
    await job;
    state.pending = state.pending.filter(j => j !== job);
  }

  input.addEventListener('change', () => { add(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(t => zone.addEventListener(t, e => { e.preventDefault(); zone.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(t => zone.addEventListener(t, () => zone.classList.remove('over')));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files.length) add(e.dataTransfer.files);
  });
  return state;
}

// A file dropped beside a box shouldn't open in the browser tab.
['dragover', 'drop'].forEach(t => window.addEventListener(t, e => e.preventDefault()));

document.querySelectorAll('form[data-fs]').forEach(form => {
  const zone = form.querySelector('[data-drop]');
  const drop = zone ? setupDrop(zone.closest('.field')) : { files: [], pending: [] };
  const btn = form.querySelector('button[type="submit"]');
  btn.dataset.label = btn.innerHTML;
  const ok = form.querySelector('.form-ok');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (window.FS_PREVIEW) {
      ok.textContent = 'Preview only: on the live site this form is sent, attachments included.';
      ok.hidden = false;
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Sending…';
    await Promise.all(drop.pending);
    // FormSubmit reliably takes one file per input, so give each file its own.
    form.querySelectorAll('input[data-attach]').forEach(i => i.remove());
    drop.files.forEach((f, i) => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.name = 'attachment' + (i + 1);
      inp.hidden = true;
      inp.dataset.attach = '';
      const dt = new DataTransfer();
      dt.items.add(f);
      inp.files = dt.files;
      form.appendChild(inp);
    });
    const next = form.querySelector('[data-next]');
    if (next && /^https?:$/.test(location.protocol)) next.value = location.origin + location.pathname + '?sent=' + next.dataset.next;
    HTMLFormElement.prototype.submit.call(form);
  });
});

// Phone numbers format themselves as you type: (555) 000-0000
function formatPhone(value) {
  let d = value.replace(/\D/g, '');
  if (d.length > 10 && d[0] === '1') d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return '(' + d;
  if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
  return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
}
document.querySelectorAll('input[type="tel"]').forEach(inp => {
  inp.addEventListener('beforeinput', e => {
    const forward = e.inputType === 'deleteContentForward';
    const backward = e.inputType === 'deleteContentBackward';
    const caret = inp.selectionStart;
    if ((!forward && !backward) || !e.cancelable || caret !== inp.selectionEnd) return;
    let digit = forward ? caret : caret - 1;
    if (digit < 0 || digit >= inp.value.length || /\d/.test(inp.value[digit])) return;
    while (digit >= 0 && digit < inp.value.length && !/\d/.test(inp.value[digit])) digit += forward ? 1 : -1;
    if (digit < 0 || digit >= inp.value.length) return;
    // Delete the adjacent digit together with the punctuation, including on mobile keyboards.
    e.preventDefault();
    inp.setRangeText('', forward ? caret : digit, forward ? digit + 1 : caret, 'start');
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  inp.addEventListener('input', () => {
    const raw = inp.value;
    const digits = raw.replace(/\D/g, '');
    const prefix = digits.length > 10 && digits[0] === '1' ? 1 : 0;
    const start = Math.max(0, raw.slice(0, inp.selectionStart).replace(/\D/g, '').length - prefix);
    const end = Math.max(0, raw.slice(0, inp.selectionEnd).replace(/\D/g, '').length - prefix);
    const direction = inp.selectionDirection;
    const formatted = formatPhone(raw);
    if (formatted === raw) return;
    inp.value = formatted;
    const position = count => {
      if (count === 0) return 0;
      let seen = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i]) && ++seen === count) return i + 1;
      }
      return formatted.length;
    };
    inp.setSelectionRange(position(start), position(end), direction);
  });
});

// Coming back from Back after sending: re-enable the buttons.
window.addEventListener('pageshow', e => {
  if (!e.persisted) return;
  document.querySelectorAll('form[data-fs] button[type="submit"]').forEach(b => { b.disabled = false; b.innerHTML = b.dataset.label; });
});

// Back from FormSubmit (?sent=quote|apply): show the confirmation, tidy the URL.
(function () {
  const sent = new URLSearchParams(location.search).get('sent');
  if (!sent) return;
  const el = document.getElementById(sent === 'apply' ? 'apply-done' : 'form-success');
  if (el) el.hidden = false;
  history.replaceState(null, '', location.pathname + location.hash);
})();

/* Auto-updating copyright year */
document.getElementById('year').textContent = new Date().getFullYear();
