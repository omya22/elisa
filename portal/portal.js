/* Elísa Viðars – learner portal (prototype with dummy data).
   Routes (hash): #/innskra · #/kodi · #/ · #/n/<course> · #/f/<course>/<lecture>
   Progress and the "session" live in localStorage so the demo remembers what you did. */
(() => {
  const D = window.PORTAL_DATA;
  const app = document.getElementById('app');
  const DEMO_CODE = '123456';
  const KEY = 'ev-portal-v1';
  const LOGO = '../assets/logo.svg', LOGO_CREAM = '../assets/logo-cream.svg';

  /* ---------- storage ---------- */
  const fresh = () => ({ email: null, pending: null, progress: JSON.parse(JSON.stringify(D.seedProgress)) });
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); }
  if (!S.progress) S.progress = fresh().progress;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  /* ---------- helpers ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const course = id => D.courses.find(c => c.id === id);
  const prog = id => (S.progress[id] = S.progress[id] || { started: null, done: [], pos: {}, watched: {} });
  const mins = s => Math.max(1, Math.round(s / 60)) + ' mín';
  const total = s => { const m = Math.round(s / 60), h = Math.floor(m / 60); return h ? `${h} klst ${m % 60} mín` : `${m} mín`; };
  const clock = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const kb = b => b > 1e6 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.round(b / 1024) + ' KB';
  const MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'maí', 'jún.', 'júl.', 'ágú.', 'sep.', 'okt.', 'nóv.', 'des.'];
  const date = iso => { const d = new Date(iso); return `${d.getDate()}. ${MONTHS[d.getMonth()]}`; };

  function stats(c) {
    const p = prog(c.id), req = c.lectures.filter(l => !l.optional);
    const doneReq = req.filter(l => p.done.includes(l.id)).length;
    const next = c.lectures.find(l => !p.done.includes(l.id) && !locked(c, l)) || null;
    return {
      required: req.length, done: doneReq,
      pct: req.length ? Math.round(doneReq / req.length * 100) : 0,
      started: !!p.started, completed: req.length > 0 && doneReq === req.length,
      next, duration: c.lectures.reduce((a, l) => a + l.duration, 0)
    };
  }
  // Server-decided in the real API; here: "in order" courses lock a lecture until the previous required one is done
  function locked(c, l) {
    if (c.unlock !== 'order') return null;
    const p = prog(c.id), i = c.lectures.indexOf(l);
    for (let j = i - 1; j >= 0; j--) {
      const prev = c.lectures[j];
      if (prev.optional) continue;
      return p.done.includes(prev.id) ? null : { reason: 'prerequisite', after: prev.title };
    }
    return null;
  }
  const lockText = k => k.reason === 'time' ? `Opnast ${date(k.at)}` : `Kláraðu „${k.after}“ fyrst`;

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2600);
  }
  const go = h => { if (location.hash === h) render(); else location.hash = h; };

  /* ---------- icons ---------- */
  const I = {
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    out: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    done: '<svg class="ic" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#546234"/><path d="M7 12.3l3.2 3.2L17 8.7" fill="none" stroke="#fffaf5" stroke-width="1.8"/></svg>',
    play: '<svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#546234" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="10.3"/><path d="M10 8.3v7.4l5.8-3.7z" fill="#546234" stroke="none"/></svg>',
    current: '<svg class="ic" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#c1c07d"/><path d="M10 8.3v7.4l5.8-3.7z" fill="#546234"/></svg>',
    lock: '<svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8c9470" stroke-width="1.4" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    file: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#546234" stroke-width="1.6" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
    link: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#546234" stroke-width="1.6" aria-hidden="true"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>',
    mail: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#546234" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>',
    clock: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#546234" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 3h5"/></svg>',
    alert: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>',
    bigplay: '<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#546234"/></svg>',
    pause: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="#546234"/></svg>',
    full: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    chev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
  };

  /* ---------- shared chrome ---------- */
  const header = (back) => back ? `
    <header class="top top--center">
      <a class="top__back" href="${back.href}" aria-label="Til baka: ${esc(back.label)}">← <span class="top__full">${esc(back.label)}</span><span class="top__short">Til baka</span></a>
      <a class="top__logo" href="#/"><img src="${LOGO}" alt="Elísa Viðars – námskeiðin mín" width="138" height="24"></a>
      <nav class="top__nav" aria-label="Aðgangur"><button class="top__out" type="button" data-logout>Útskrá</button></nav>
    </header>` : `
    <header class="top">
      <a class="top__logo" href="#/"><img src="${LOGO}" alt="Elísa Viðars – námskeiðin mín" width="138" height="24"></a>
      <nav class="top__nav" aria-label="Aðgangur">
        <a class="top__link" href="#/" aria-current="page">Námskeiðin mín</a>
        <button class="top__out" type="button" data-logout>Útskrá</button>
      </nav>
    </header>`;
  const fileRow = a => a.kind === 'link'
    ? `<a class="file" href="${esc(a.url)}"><span class="file__ic">${I.link}</span><span class="file__name">${esc(a.title)}</span><span class="file__meta">↗</span></a>`
    : `<button class="file" type="button" data-file="${esc(a.title)}"><span class="file__ic">${I.file}</span><span class="file__name">${esc(a.title)}</span><span class="file__meta">${kb(a.size)}</span></button>`;

  /* ---------- views: login ---------- */
  function vLogin() {
    return `
    <div class="auth">
      <div class="auth__photo"><a class="auth__logo" href="../"><img src="${LOGO}" alt="Elísa Viðars – forsíða" width="138" height="24"></a></div>
      <main class="auth__side">
        <a class="auth__top" href="../">Til baka á vefinn ${I.out}</a>
        <form class="auth__form" id="f-email" novalidate>
          <div class="stack-12">
            <span class="eyebrow">Námskeiðin mín</span>
            <h1 tabindex="-1">Velkomin aftur</h1>
            <p class="lead">Sláðu inn netfangið sem þú keyptir námskeiðið með. Við sendum þér 6 stafa kóða.</p>
          </div>
          <div class="field">
            <label for="email">Netfang</label>
            <input id="email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="nafn@dæmi.is" value="${esc(S.pending?.email || '')}" required>
            <p class="field__err" id="email-err" hidden></p>
          </div>
          <button class="btn btn--dark" type="submit">Senda kóða ${I.arrow}</button>
          <p class="muted small">Ekkert lykilorð. Fyrsta innskráning býr til aðganginn þinn.</p>
        </form>
        <a class="auth__store" href="${D.storeUrl}">Ekki komin(n) með námskeið?<span>Skoða námskeiðin ${I.arrow}</span></a>
      </main>
    </div>`;
  }
  function bLogin() {
    const f = document.getElementById('f-email'), inp = f.email, err = document.getElementById('email-err');
    const showErr = m => { err.textContent = m; err.hidden = !m; inp.setAttribute('aria-invalid', m ? 'true' : 'false'); if (m) inp.setAttribute('aria-describedby', 'email-err'); };
    inp.addEventListener('blur', () => { if (inp.value && !inp.checkValidity()) showErr('Þetta lítur ekki út eins og netfang.'); });
    inp.addEventListener('input', () => showErr(''));
    f.addEventListener('submit', e => {
      e.preventDefault();
      const v = inp.value.trim();
      if (!v || !inp.checkValidity()) { showErr(v ? 'Þetta lítur ekki út eins og netfang.' : 'Sláðu inn netfangið þitt.'); inp.focus(); return; }
      const btn = f.querySelector('button'); btn.disabled = true; btn.innerHTML = 'Sendi kóða…';
      setTimeout(() => { S.pending = { email: v, sentAt: Date.now() }; save(); go('#/kodi'); }, 700);
    });
  }

  function vCode() {
    const p = S.pending;
    return `
    <div class="auth">
      <div class="auth__photo"><a class="auth__logo" href="../"><img src="${LOGO}" alt="Elísa Viðars – forsíða" width="138" height="24"></a></div>
      <main class="auth__side">
        <a class="auth__top auth__top--left" href="#/innskra">← Til baka</a>
        <form class="auth__form" id="f-code" novalidate>
          <div class="stack-12" id="code-head">
            <span class="badge-ic">${I.mail}</span>
            <h1 tabindex="-1">Athugaðu póstinn</h1>
            <p class="lead">Við sendum 6 stafa kóða á <strong>${esc(p.email)}</strong>. Hann gildir í 10 mínútur.</p>
            <a class="small strong" href="#/innskra">Breyta netfangi</a>
          </div>
          <fieldset class="code">
            <legend>Kóði</legend>
            <div class="code__boxes">${[1, 2, 3, 4, 5, 6].map(i => `<input class="code__box" inputmode="numeric" autocomplete="${i === 1 ? 'one-time-code' : 'off'}" maxlength="1" aria-label="Tala ${i}">`).join('')}</div>
            <p class="code__err" id="code-err" role="alert" hidden></p>
          </fieldset>
          <button class="btn btn--dark" type="submit" id="code-submit">Skrá inn</button>
          <div class="code__help muted small">
            <span>Fékkstu ekki kóðann? Athugaðu ruslpóstinn.</span>
            <button class="linkbtn" type="button" id="resend" disabled>Senda nýjan eftir 0:60</button>
          </div>
        </form>
      </main>
    </div>`;
  }
  function bCode() {
    const boxes = [...document.querySelectorAll('.code__box')], f = document.getElementById('f-code');
    const err = document.getElementById('code-err'), resend = document.getElementById('resend'), submit = document.getElementById('code-submit');
    const val = () => boxes.map(b => b.value).join('');
    const setErr = m => { err.innerHTML = m ? I.alert + `<span>${m}</span>` : ''; err.hidden = !m; boxes.forEach(b => b.classList.toggle('is-bad', !!m)); };
    const fill = s => { s.replace(/\D/g, '').slice(0, 6).split('').forEach((d, i) => (boxes[i].value = d)); };
    boxes[0].focus();
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => {
        if (b.value.length > 1) fill(b.value); else b.value = b.value.replace(/\D/g, '');
        setErr('');
        const n = boxes.findIndex(x => !x.value); (n === -1 ? boxes[5] : boxes[n]).focus();
        if (val().length === 6) check();
      });
      b.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !b.value && i) { boxes[i - 1].value = ''; boxes[i - 1].focus(); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && i) boxes[i - 1].focus();
        if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
      });
      b.addEventListener('paste', e => { e.preventDefault(); fill((e.clipboardData || window.clipboardData).getData('text')); setErr(''); if (val().length === 6) check(); else boxes[Math.min(5, val().length)].focus(); });
    });
    function check() {
      const code = val();
      if (code.length < 6) { setErr('Sláðu inn allar 6 tölurnar.'); return; }
      if (Date.now() - S.pending.sentAt > 10 * 60 * 1000) { go('#/utrunninn'); return; }
      submit.disabled = true; submit.textContent = 'Skrái inn…';
      setTimeout(() => {
        if (code === DEMO_CODE) { S.email = S.pending.email; S.pending = null; save(); go('#/'); }
        else { submit.disabled = false; submit.textContent = 'Skrá inn'; setErr('Kóðinn passar ekki. Athugaðu nýjasta póstinn og reyndu aftur.'); boxes.forEach(x => (x.value = '')); boxes[0].focus(); }
      }, 600);
    }
    f.addEventListener('submit', e => { e.preventDefault(); check(); });
    let left = 60;
    const tick = () => {
      if (!document.body.contains(resend)) return clearInterval(timer);
      left--; if (left <= 0) { resend.disabled = false; resend.textContent = 'Senda nýjan kóða'; clearInterval(timer); } else resend.textContent = `Senda nýjan eftir 0:${String(left).padStart(2, '0')}`;
    };
    const timer = setInterval(tick, 1000);
    resend.addEventListener('click', () => { S.pending.sentAt = Date.now(); save(); toast('Nýr kóði sendur'); render(); });
  }

  function vExpired() {
    return `
    <div class="auth">
      <div class="auth__photo"><a class="auth__logo" href="../"><img src="${LOGO}" alt="Elísa Viðars – forsíða" width="138" height="24"></a></div>
      <main class="auth__side">
        <a class="auth__top auth__top--left" href="#/innskra">← Til baka</a>
        <div class="auth__form">
          <div class="stack-12">
            <span class="badge-ic badge-ic--sand">${I.clock}</span>
            <h1 tabindex="-1">Kóðinn er útrunninn</h1>
            <p class="lead">Kóðar gilda í 10 mínútur. Við sendum nýjan á <strong>${esc(S.pending?.email || '')}</strong>.</p>
          </div>
          <button class="btn btn--dark" type="button" id="resend2">Senda nýjan kóða ${I.arrow}</button>
          <a class="small strong" href="#/innskra">Nota annað netfang</a>
        </div>
      </main>
    </div>`;
  }
  function bExpired() { document.getElementById('resend2').addEventListener('click', () => { S.pending.sentAt = Date.now(); save(); go('#/kodi'); }); }

  /* ---------- views: course list ---------- */
  function card(c) {
    const st = stats(c);
    const cover = c.image ? `<img class="card__img" src="${c.image}" alt="" loading="lazy">` : `<div class="card__img card__img--none"><img src="${LOGO_CREAM}" alt=""></div>`;
    let label, body, cta;
    if (st.completed) {
      label = `<span class="eyebrow eyebrow--ic">${I.done.replace('class="ic" width="24" height="24"', 'width="14" height="14"')}Lokið</span>`;
      body = `<span class="muted small mt-auto">${st.done} af ${st.required} lokið</span>`;
      cta = `<span class="btn btn--line">Skoða aftur</span>`;
    } else if (st.started) {
      label = `<span class="eyebrow">Í gangi</span>`;
      body = `<div class="mt-auto stack-8"><div class="bar"><i style="width:${st.pct}%"></i></div><span class="muted small">${st.done} af ${st.required} lokið</span></div>`;
      cta = `<span class="btn btn--dark">Halda áfram ${I.arrow}</span>`;
    } else {
      label = `<span class="eyebrow">Nýtt</span>`;
      body = `<span class="muted small mt-auto">${c.lectures.length} fyrirlestrar · ${total(st.duration)}</span>`;
      cta = `<span class="btn btn--light">Byrja námskeiðið</span>`;
    }
    return `<a class="card" href="#/n/${c.id}">${cover}<div class="card__body"><div class="row-wrap">${label}${c.archived ? '<span class="tag">Ekki lengur til sölu</span>' : ''}</div><h2 class="card__title">${esc(c.name)}</h2>${body}${cta}</div></a>`;
  }
  function vCourses() {
    const order = c => { const s = stats(c); return s.completed ? 2 : s.started ? 0 : 1; };
    const list = [...D.courses].sort((a, b) => order(a) - order(b));
    const name = (S.email || '').split('@')[0];
    return `${header()}
    <main class="wrap page">
      <div class="page__head">
        <div class="stack-8"><span class="hello">Hæ ${esc(name)}</span><h1 tabindex="-1">Námskeiðin mín</h1></div>
        <span class="muted">${list.length} námskeið</span>
      </div>
      ${list.length ? `<div class="cards">${list.map(card).join('')}</div>` : `
      <div class="empty"><img src="../assets/melon.jpg" alt=""><div class="empty__body"><h2>Hér birtast námskeiðin þín</h2><p>Þú ert skráð(ur) inn sem <strong>${esc(S.email)}</strong>. Ef þú keyptir með öðru netfangi skaltu skrá þig inn með því.</p><a class="btn btn--dark" href="${D.storeUrl}">Skoða námskeiðin ${I.arrow}</a><button class="btn btn--light" type="button" data-logout>Skrá inn með öðru netfangi</button></div></div>`}
    </main>`;
  }

  /* ---------- views: course page ---------- */
  function row(c, l, st) {
    const p = prog(c.id), k = locked(c, l), done = p.done.includes(l.id), isNext = st.started && st.next && st.next.id === l.id;
    const opt = l.optional ? '<span class="tag tag--olive">Aukaefni</span>' : '';
    if (k) return `<button class="lec is-locked" type="button" data-locked="${esc(lockText(k))}">${I.lock}<span class="lec__t">${esc(l.title)}${opt}<span class="lec__sub">${esc(lockText(k))}</span></span><span class="lec__d">${mins(l.duration)}</span></button>`;
    const pos = p.pos[l.id];
    const sub = isNext ? `<span class="lec__sub">Næst${pos ? ` · ${clock(pos)} af ${clock(l.duration)}` : ''}</span>` : '';
    return `<a class="lec${done ? ' is-done' : ''}${isNext ? ' is-next' : ''}" href="#/f/${c.id}/${l.id}">${done ? I.done : isNext ? I.current : I.play}<span class="lec__t">${esc(l.title)}${opt}${sub}</span><span class="lec__d">${mins(l.duration)}</span></a>`;
  }
  function curriculum(c, st) {
    const p = prog(c.id);
    const loose = c.lectures.filter(l => !l.section);
    let h = loose.map(l => row(c, l, st)).join('');
    c.sections.forEach((s, i) => {
      const ls = c.lectures.filter(l => l.section === s.id), req = ls.filter(l => !l.optional);
      h += `<div class="sec"><h3>Kafli ${i + 1} · ${esc(s.title)}</h3><span>${req.filter(l => p.done.includes(l.id)).length}/${req.length}</span></div>` + ls.map(l => row(c, l, st)).join('');
    });
    return h;
  }
  function vCourse(c) {
    if (!c) return vNotFound();
    const st = stats(c), p = prog(c.id);
    const cover = c.image ? `<img class="hero__img" src="${c.image}" alt="">` : `<div class="hero__img hero__img--none"><img src="${LOGO_CREAM}" alt=""></div>`;
    const segs = c.lectures.filter(l => !l.optional).map(l => `<i${p.done.includes(l.id) ? ' class="on"' : ''}></i>`).join('');
    let band;
    if (!c.lectures.length) band = `<section class="band band--sand wrap-edge"><p class="lead">Efnið kemur bráðum.</p></section>`;
    else if (st.completed) band = `<section class="band band--light wrap-edge" aria-label="Framvinda">
        <div class="band__info"><span class="band__eyebrow">Framvinda</span><div class="band__row"><span class="band__big">${I.done.replace('width="24" height="24"', 'width="40" height="40"')}Þú hefur lokið námskeiðinu</span></div><span class="small">${st.done} af ${st.required} lokið${p.completed ? ' · ' + date(p.completed) : ''}</span></div>
        <div class="band__act"><button class="btn btn--dark" type="button" data-restart>Byrja upp á nýtt</button></div></section>`;
    else if (st.started) band = `<section class="band band--dark wrap-edge" aria-label="Framvinda">
        <div class="band__info"><span class="band__eyebrow">Framvinda</span>
          <div class="band__row"><span class="band__big"><b>${st.done} af ${st.required}</b><span>fyrirlestrum lokið</span></span><span class="band__pct">${st.pct}%</span></div>
          <div class="segs" style="grid-template-columns:repeat(${st.required},minmax(0,1fr))">${segs}</div></div>
        <div class="band__act">${st.next ? `<a class="resume" href="#/f/${c.id}/${st.next.id}"><span class="resume__t"><span class="resume__h">Halda áfram ${I.arrow}</span><span class="resume__sub">${esc(st.next.title)}${p.pos[st.next.id] ? ` · frá ${clock(p.pos[st.next.id])} af ${clock(st.next.duration)}` : ''}</span></span><img class="resume__img" src="${st.next.poster}" alt=""></a>` : ''}
          <button class="linkbtn linkbtn--light band__restart" type="button" data-restart>Byrja upp á nýtt</button></div></section>`;
    else band = `<section class="band band--dark wrap-edge">
        <div class="band__info"><span class="band__eyebrow">Byrjaðu hér</span><p class="band__lead">${esc(c.description)}</p></div>
        <div class="band__act"><button class="btn btn--cream" type="button" data-start>Byrja námskeiðið ${I.arrow}</button></div></section>`;
    return `${header({ href: '#/', label: 'Námskeiðin mín' })}
    <section class="hero wrap-edge">
      <div class="hero__text">
        ${c.archived ? '<div class="row-wrap"><span class="tag">Ekki lengur til sölu</span></div>' : ''}
        <h1 tabindex="-1">${esc(c.name)}</h1>
        <div class="meta"><span>${c.lectures.length} fyrirlestrar</span><span>${total(st.duration)}</span></div>
      </div>
      ${cover}
    </section>
    ${band}
    <div class="course wrap-edge">
      <main class="course__main">
        <h2 class="h2">Efni námskeiðsins</h2>
        <div class="lecs">${c.lectures.length ? curriculum(c, st) : '<p class="muted">Efnið kemur bráðum.</p>'}</div>
      </main>
      <aside class="course__side">
        ${c.attachments.length ? `<section><h2 class="h3">Gögn</h2><div class="files">${c.attachments.map(fileRow).join('')}</div></section>` : ''}
        <section class="about"><h2 class="h3">Um námskeiðið</h2><p class="about__text" id="about">${esc(c.longDescription)}</p>${c.longDescription.length > 140 ? '<button class="linkbtn" type="button" data-more aria-controls="about" aria-expanded="false">Lesa meira</button>' : ''}</section>
      </aside>
    </div>
    <dialog class="sheet" id="restart-dlg" aria-labelledby="restart-t">
      <h2 id="restart-t">Byrja upp á nýtt?</h2>
      <p>Allar „lokið“-merkingar hreinsast og myndbönd byrja frá upphafi. Þú heldur aðganginum.</p>
      <div class="sheet__btns"><button class="btn btn--dark" type="button" data-restart-yes>Já, byrja upp á nýtt</button><button class="btn btn--light" type="button" data-restart-no>Hætta við</button></div>
    </dialog>`;
  }
  function bCourse(c) {
    if (!c) return;
    const p = prog(c.id), dlg = document.getElementById('restart-dlg');
    app.querySelector('[data-start]')?.addEventListener('click', () => {
      p.started = new Date().toISOString(); save();
      const st = stats(c); go(st.next ? `#/f/${c.id}/${st.next.id}` : `#/n/${c.id}`);
    });
    app.querySelectorAll('[data-restart]').forEach(b => b.addEventListener('click', () => dlg.showModal()));
    app.querySelector('[data-restart-no]').addEventListener('click', () => dlg.close());
    app.querySelector('[data-restart-yes]').addEventListener('click', () => {
      S.progress[c.id] = { started: new Date().toISOString(), done: [], pos: {}, watched: {} }; save(); dlg.close(); toast('Námskeiðið byrjar upp á nýtt'); render();
    });
    app.querySelectorAll('[data-locked]').forEach(b => b.addEventListener('click', () => toast(b.dataset.locked)));
    const more = app.querySelector('[data-more]');
    if (more) { const t = document.getElementById('about'); t.classList.add('is-clamped'); more.addEventListener('click', () => { const open = t.classList.toggle('is-clamped'); more.textContent = open ? 'Lesa meira' : 'Sýna minna'; more.setAttribute('aria-expanded', String(!open)); }); }
  }

  /* ---------- views: lecture page ---------- */
  let player = null;
  function vLecture(c, l) {
    if (!c || !l) return vNotFound();
    const k = locked(c, l);
    if (k) { setTimeout(() => toast(lockText(k)), 50); location.replace(`#/n/${c.id}`); return ''; }
    const p = prog(c.id), i = c.lectures.indexOf(l), done = p.done.includes(l.id);
    const prev = c.lectures[i - 1] || null, next = c.lectures[i + 1] || null, nextLock = next && locked(c, next);
    const sec = l.section ? c.sections.findIndex(s => s.id === l.section) : -1;
    const pos = p.pos[l.id] || 0, rule = c.completion_rule;
    const watched = Math.min(100, Math.round(((p.watched || {})[l.id] || 0) / l.duration * 100));
    const markBtn = rule === 'video_watched' ? '' : `<button class="btn ${done ? 'btn--light is-on' : 'btn--light'}" type="button" data-mark aria-pressed="${done}">${done ? I.done.replace('width="24" height="24"', 'width="18" height="18"') + ' Lokið' : '<span class="ring"></span> Merkja sem lokið'}</button>`;
    const nextBtn = !next ? `<a class="btn btn--dark" href="#/n/${c.id}">Aftur á námskeiðið</a>`
      : nextLock ? `<button class="btn btn--off" type="button" disabled><span>${I.lock.replace('width="24" height="24"', 'width="14" height="14"')} Næsti fyrirlestur</span><small>${l.optional ? esc(lockText(nextLock)) : 'Kláraðu þennan fyrirlestur fyrst'}</small></button>`
      : `<a class="btn btn--dark" href="#/f/${c.id}/${next.id}">Næsti fyrirlestur ${I.arrow}</a>`;
    const side = c.lectures.map(x => {
      const xk = locked(c, x), xd = p.done.includes(x.id), cur = x.id === l.id;
      const ic = xk ? I.lock : xd ? I.done : I.play;
      return xk ? `<span class="slec is-locked">${ic}<span>${esc(x.title)}</span><small>${mins(x.duration)}</small></span>`
        : `<a class="slec${cur ? ' is-cur' : ''}${xd ? ' is-done' : ''}" href="#/f/${c.id}/${x.id}"${cur ? ' aria-current="page"' : ''}>${ic}<span>${esc(x.title)}</span><small>${mins(x.duration)}</small></a>`;
    }).join('');
    return `${header({ href: `#/n/${c.id}`, label: c.name })}
    <div class="wrap lecture">
      <main class="lecture__main">
        <div class="player" id="player" data-dur="${l.duration}">
          <img class="player__poster" src="${l.poster}" alt="">
          <button class="player__big" type="button" data-play aria-label="Spila myndband">${I.bigplay}</button>
          <span class="player__demo">Prufumyndband · spilast 10× hraðar</span>
          <div class="player__bar">
            <button class="player__pp" type="button" data-play aria-label="Spila">▶</button>
            <span data-cur>${clock(pos)}</span>
            <div class="player__track" data-seek role="slider" tabindex="0" aria-label="Staða í myndbandi" aria-valuemin="0" aria-valuemax="${l.duration}" aria-valuenow="${Math.floor(pos)}"><i style="width:${pos / l.duration * 100}%"></i></div>
            <span>${clock(l.duration)}</span>
            <button class="player__fs" type="button" data-fs aria-label="Fylla skjáinn">${I.full}</button>
          </div>
        </div>
        <div class="lecture__head">
          <div class="stack-8">
            <span class="muted small">Fyrirlestur ${i + 1} af ${c.lectures.length}${sec >= 0 ? ` · Kafli ${sec + 1}` : ''}${l.optional ? ' · Aukaefni' : ''}</span>
            <h1 tabindex="-1">${esc(l.title)}</h1>
          </div>
        </div>
        <div class="prose">
          <p>Í þessum fyrirlestri förum við yfir ${esc(l.title.toLowerCase())}. Horfðu á myndbandið og notaðu svo gögnin hér fyrir neðan til að prófa þig áfram heima.</p>
          <p class="muted">Þetta er prufutexti. Í alvöru útgáfunni kemur texti fyrirlestursins frá Upp.</p>
        </div>
        ${l.attachments ? `<section><h2 class="h3">Gögn með fyrirlestrinum</h2><div class="files">${l.attachments.map(fileRow).join('')}</div></section>` : ''}
        ${prev ? `<a class="small strong prev" href="#/f/${c.id}/${prev.id}">← Fyrri: ${esc(prev.title)}</a>` : ''}
      </main>
      <aside class="lecture__side" aria-label="Efni námskeiðsins">
        <div class="side__head"><span>${stats(c).done} af ${stats(c).required} lokið</span><div class="bar"><i style="width:${stats(c).pct}%"></i></div></div>
        <div class="side__list">${side}</div>
      </aside>
    </div>
    <footer class="actions">
      ${rule === 'video_watched' ? `<div class="auto"><div class="auto__row"><span>Lýkur sjálfkrafa þegar þú hefur horft á myndbandið</span><strong data-wp>${done ? 100 : watched}%</strong></div><div class="bar"><i data-wbar style="width:${done ? 100 : watched}%"></i></div></div>` : ''}
      <div class="actions__btns${rule === 'video_watched' ? ' actions__btns--one' : ''}">${markBtn}${nextBtn}</div>
    </footer>`;
  }
  function bLecture(c, l) {
    if (!c || !l || !document.getElementById('player')) return;
    const p = prog(c.id); p.watched = p.watched || {};
    if (!p.started) { p.started = new Date().toISOString(); save(); }
    const el = document.getElementById('player'), dur = l.duration;
    const track = el.querySelector('[data-seek]'), fill = track.querySelector('i'), cur = el.querySelector('[data-cur]'), pp = el.querySelector('.player__pp');
    let pos = p.pos[l.id] || 0, playing = false, timer = null, sinceSave = 0;
    const draw = () => { fill.style.width = (pos / dur * 100) + '%'; cur.textContent = clock(pos); track.setAttribute('aria-valuenow', Math.floor(pos)); };
    const persist = () => { p.pos[l.id] = pos >= dur - 1 ? 0 : Math.floor(pos); save(); };
    const complete = (auto) => {
      if (p.done.includes(l.id)) return;
      p.done.push(l.id);
      const st = stats(c); if (st.completed && !p.completed) p.completed = new Date().toISOString();
      save(); toast(st.completed ? 'Lokið ✓ · Þú hefur lokið námskeiðinu' : 'Lokið ✓'); if (auto) setTimeout(render, 400); else render();
    };
    const set = v => {
      playing = v; el.classList.toggle('is-playing', v);
      el.querySelectorAll('[data-play]').forEach(b => b.setAttribute('aria-label', v ? 'Gera hlé' : 'Spila'));
      el.querySelector('.player__big').innerHTML = v ? I.pause : I.bigplay; pp.textContent = v ? '❚❚' : '▶';
      clearInterval(timer);
      if (v) timer = setInterval(() => {
        if (!document.body.contains(el)) return clearInterval(timer);
        pos = Math.min(dur, pos + 2.5); p.watched[l.id] = Math.min(dur, (p.watched[l.id] || 0) + 2.5); draw();
        const wp = document.querySelector('[data-wp]'); if (wp) { const w = Math.min(100, Math.round(p.watched[l.id] / dur * 100)); wp.textContent = w + '%'; document.querySelector('[data-wbar]').style.width = w + '%'; }
        if ((sinceSave += 0.25) >= 1.5) { sinceSave = 0; persist(); }   // "heartbeat"
        if (c.completion_rule !== 'manual' && p.watched[l.id] >= dur * 0.9) { persist(); if (!p.done.includes(l.id)) { set(false); complete(true); return; } }
        if (pos >= dur) { set(false); persist(); }
      }, 250);
      else persist();
    };
    el.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => set(!playing)));
    const seekTo = x => { const r = track.getBoundingClientRect(); pos = Math.max(0, Math.min(dur, (x - r.left) / r.width * dur)); draw(); persist(); };
    track.addEventListener('click', e => seekTo(e.clientX));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { pos = Math.min(dur, pos + 10); draw(); persist(); } if (e.key === 'ArrowLeft') { pos = Math.max(0, pos - 10); draw(); persist(); } });
    el.querySelector('[data-fs]').addEventListener('click', () => { try { document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen(); } catch (e) {} });
    app.querySelector('[data-mark]')?.addEventListener('click', () => {
      if (p.done.includes(l.id)) { p.done = p.done.filter(x => x !== l.id); delete p.completed; save(); toast('Merking tekin af'); render(); }
      else complete(false);
    });
    player = { stop: () => { clearInterval(timer); if (playing) persist(); } };
  }

  function vNotFound() {
    return `${header({ href: '#/', label: 'Námskeiðin mín' })}<main class="wrap page"><h1 tabindex="-1">Fannst ekki</h1><p class="lead">Þetta námskeið er ekki lengur aðgengilegt. Hafðu samband við ${esc(D.organization)}.</p><a class="btn btn--dark btn--auto" href="#/">Námskeiðin mín</a></main>`;
  }

  /* ---------- router ---------- */
  function render() {
    if (player) { player.stop(); player = null; }
    const h = location.hash.replace(/^#\/?/, ''), parts = h.split('/');
    const authed = !!S.email;
    let view = '', bind = () => {};
    if (!authed) {
      if (parts[0] === 'kodi' && S.pending) { view = vCode(); bind = bCode; }
      else if (parts[0] === 'utrunninn' && S.pending) { view = vExpired(); bind = bExpired; }
      else { if (parts[0] !== 'innskra') return location.replace('#/innskra'); view = vLogin(); bind = bLogin; }
      document.body.classList.add('is-auth');
    } else {
      document.body.classList.remove('is-auth');
      if (['innskra', 'kodi', 'utrunninn'].includes(parts[0])) return location.replace('#/');
      if (parts[0] === 'n') { const c = course(parts[1]); view = vCourse(c); bind = () => bCourse(c); }
      else if (parts[0] === 'f') { const c = course(parts[1]), l = c && c.lectures.find(x => x.id === parts[2]); view = vLecture(c, l); bind = () => bLecture(c, l); }
      else { view = vCourses(); }
    }
    if (!view) return;
    app.innerHTML = view;
    app.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', () => { S.email = null; S.pending = null; save(); go('#/innskra'); }));
    app.querySelectorAll('[data-file]').forEach(b => b.addEventListener('click', () => toast(`${b.dataset.file} – prufugögn, ekkert að sækja`)));
    bind();
    window.scrollTo(0, 0);
    const h1 = app.querySelector('h1'); if (h1 && !app.querySelector('.code__box')) h1.focus({ preventScroll: true });
    document.title = (h1 ? h1.textContent + ' – ' : '') + 'Elísa Viðars';
  }
  addEventListener('hashchange', render);
  render();
})();
