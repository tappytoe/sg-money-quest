/* Money Quest SG – game logic */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- Saved progress ---------- */
const SAVE_KEY = 'moneyquest-sg-v1';
const fresh = () => ({ stars: 0, level: 1, sound: true, badges: [], seen: [], stats: { exact: 0, cashier: 0 } });
let state = fresh();
try {
  const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
  if (saved) state = { ...state, ...saved, stats: { ...state.stats, ...(saved.stats || {}) } };
} catch (e) { /* ignore broken save */ }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } updateHUD(); }
function updateHUD() { $('#starCount').textContent = `⭐ ${state.stars}`; $('#soundBtn').textContent = state.sound ? '🔊' : '🔇'; }

/* ---------- Game data ---------- */
const LEVELS = {
  1: { name: 'Starter',  grade: 'P1–P2', max: 1000,  cents: 10, set: [1000, 500, 200, 100, 50, 20, 10] },
  2: { name: 'Explorer', grade: 'P3–P4', max: 5000,  cents: 5,  set: [5000, 1000, 500, 200, 100, 50, 20, 10, 5] },
  3: { name: 'Master',   grade: 'P5–P6', max: 20000, cents: 5,  set: [10000, 5000, 1000, 500, 200, 100, 50, 20, 10, 5] }
};
const L = () => LEVELS[state.level];

const ITEMS = [
  { n: 'Banana', e: '🍌', p: 50 }, { n: 'Pencil', e: '✏️', p: 60 }, { n: 'Apple', e: '🍎', p: 80 },
  { n: 'Ruler', e: '📏', p: 90 }, { n: 'Ice Cream', e: '🍦', p: 120 }, { n: 'Roti Prata', e: '🥞', p: 140 },
  { n: 'Curry Puff', e: '🥟', p: 150 }, { n: 'Milo', e: '🥤', p: 160 }, { n: 'Kaya Toast', e: '🍞', p: 180 },
  { n: 'Notebook', e: '📒', p: 230 }, { n: 'Ice Kacang', e: '🍧', p: 320 }, { n: 'Bubble Tea', e: '🧋', p: 390 },
  { n: 'Chicken Rice', e: '🍗', p: 450 }, { n: 'Laksa', e: '🍜', p: 580 }, { n: 'Kite', e: '🪁', p: 735 },
  { n: 'Satay (10 sticks)', e: '🍢', p: 800 }, { n: 'Lunch Box', e: '🍱', p: 965 }, { n: 'Storybook', e: '📚', p: 1290 },
  { n: 'Football', e: '⚽', p: 1995 }, { n: 'Teddy Bear', e: '🧸', p: 2480 }, { n: 'Backpack', e: '🎒', p: 3295 },
  { n: 'Toy Robot', e: '🤖', p: 3650 }, { n: 'Board Game', e: '🎲', p: 4270 }, { n: 'Watch', e: '⌚', p: 5435 },
  { n: 'Headphones', e: '🎧', p: 6890 }, { n: 'Shoes', e: '👟', p: 7545 }, { n: 'Scooter', e: '🛴', p: 8900 }
];

const TIPS = [
  '100 cents make 1 dollar. So $1.00 = 100¢.',
  'Write cents with two digits: $3.05 means 3 dollars and 5 cents.',
  'Count money from the biggest note down to the smallest coin.',
  'To check your change, count on from the price up to the amount you paid.',
  'Save first, spend later! Put some money in your piggy bank before buying treats.',
  'A need is something you must have. A want is nice to have.',
  'Compare prices before you buy — the same thing may cost less somewhere else.',
  'Singapore no longer makes 1-cent coins, so cash prices usually go up in 5¢ steps.',
  'Keep your money safe in a wallet, and never show lots of cash in public.'
];

const BADGES = [
  { id: 'first-buy', icon: '🛍️', name: 'First Purchase', desc: 'Buy your first item' },
  { id: 'exact5',    icon: '🎯', name: 'Exact Payer',    desc: 'Pay the exact amount 5 times' },
  { id: 'counter',   icon: '🔢', name: 'Super Counter',  desc: 'Get 5 out of 5 first try in Count the Cash' },
  { id: 'cashier',   icon: '🧾', name: 'Cashier Pro',    desc: 'Give correct change 10 times' },
  { id: 'saver',     icon: '🐷', name: 'Super Saver',    desc: 'Reach a savings goal' },
  { id: 'wise',      icon: '🧠', name: 'Wise Spender',   desc: 'Sort 8+ needs and wants correctly in one game' },
  { id: 'museum',    icon: '🏛️', name: 'Money Expert',   desc: 'See every note and coin in the Money Museum' },
  { id: 'star100',   icon: '🌟', name: 'Star Collector', desc: 'Collect 100 stars' }
];

const EVENTS = {
  want: [
    { e: '🧋', n: 'Bubble tea with friends', p: 390 }, { e: '🎮', n: 'A new game app', p: 595 },
    { e: '🍦', n: 'Ice cream from the uncle', p: 220 }, { e: '🃏', n: 'Trading cards', p: 450 },
    { e: '🍿', n: 'Movie snacks', p: 680 }, { e: '🕹️', n: 'Claw machine tries', p: 300 }
  ],
  need: [
    { e: '✏️', n: 'New pencils for school', p: 180 }, { e: '🚌', n: 'Top up your bus card', p: 500 },
    { e: '📒', n: 'A workbook for class', p: 350 }, { e: '🩹', n: 'Plasters for a scraped knee', p: 240 }
  ],
  bonus: [
    { e: '🧧', n: 'Grandma gives you a red packet!', p: 800 }, { e: '🧹', n: 'You helped with the chores!', p: 300 },
    { e: '🏆', n: 'A prize for working hard in school!', p: 500 }, { e: '♻️', n: 'You sold old toys at a garage sale!', p: 400 }
  ],
  calm: [{ e: '☀️', n: 'A quiet week. Nothing tempting to buy!', p: 0 }]
};

const PIGGY = {
  1: { allow: 300,  weeks: 8, scale: .6,  round: 10, goals: [{ n: 'Sticker Album', e: '📔', p: 1500 }, { n: 'Kite', e: '🪁', p: 1800 }, { n: 'Toy Car', e: '🚗', p: 2000 }] },
  2: { allow: 800,  weeks: 8, scale: 1,   round: 5,  goals: [{ n: 'Backpack', e: '🎒', p: 3295 }, { n: 'Board Game', e: '🎲', p: 4270 }, { n: 'Football Boots', e: '👟', p: 4550 }] },
  3: { allow: 1500, weeks: 8, scale: 1.6, round: 5,  goals: [{ n: 'Headphones', e: '🎧', p: 6890 }, { n: 'Scooter', e: '🛴', p: 8900 }, { n: 'Bicycle', e: '🚲', p: 10990 }] }
};

const NEEDS_WANTS = [
  { e: '🍚', n: 'Rice for family meals', need: true, why: 'Food keeps us healthy and alive.' },
  { e: '👟', n: 'School shoes (old pair is torn)', need: true, why: 'You need shoes to go to school safely.' },
  { e: '🪥', n: 'Toothbrush', need: true, why: 'Keeping clean keeps us healthy.' },
  { e: '📚', n: 'Textbook for class', need: true, why: 'You need it to learn in school.' },
  { e: '🚌', n: 'Bus fare to school', need: true, why: 'You need a way to get to school.' },
  { e: '💊', n: 'Medicine when you are sick', need: true, why: 'Medicine helps us get well.' },
  { e: '💧', n: 'Drinking water', need: true, why: 'Everyone needs water every day.' },
  { e: '☂️', n: 'Umbrella for rainy days', need: true, why: 'It keeps you dry — Singapore has lots of rain!' },
  { e: '🥦', n: 'Vegetables', need: true, why: 'Healthy food helps you grow.' },
  { e: '👕', n: 'School uniform', need: true, why: 'Students must wear it to school.' },
  { e: '🎮', n: 'New video game', need: false, why: 'Fun, but you can live without it.' },
  { e: '🧋', n: 'Bubble tea', need: false, why: 'A treat — water is what you really need.' },
  { e: '🚗', n: 'Another toy car', need: false, why: 'Nice to have, but not necessary.' },
  { e: '🍬', n: 'Candy', need: false, why: 'Yummy, but not needed (and bad for teeth!).' },
  { e: '📱', n: 'Fancy phone case', need: false, why: 'Looks cool, but it is a want.' },
  { e: '🎢', n: 'Theme park ticket', need: false, why: 'A fun day out, but not a need.' },
  { e: '🧸', n: 'Giant teddy bear', need: false, why: 'Cuddly, but you do not need it.' },
  { e: '🍦', n: 'Ice cream', need: false, why: 'A treat for special days.' },
  { e: '🃏', n: 'Trading cards', need: false, why: 'Collecting is fun, but it is a want.' },
  { e: '👑', n: 'Toy crown', need: false, why: 'Just for fun!' }
];

/* ---------- Sound, speech & effects ---------- */
let actx = null;
function tone(freq, dur = 0.12, type = 'sine', delay = 0, vol = 0.15) {
  if (!state.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch (e) { /* no audio */ }
}
const sfx = {
  coin() { tone(1320, .08, 'triangle'); tone(1760, .12, 'triangle', .06); },
  note() { tone(320, .1, 'sawtooth', 0, .04); tone(480, .08, 'sawtooth', .05, .03); },
  good() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .15, 'triangle', i * .09)); },
  bad() { tone(220, .22, 'square', 0, .05); tone(180, .3, 'square', .15, .05); },
  click() { tone(660, .05, 'square', 0, .04); }
};
function speak(text) {
  if (!state.sound || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'en-SG'; u.rate = .95;
  speechSynthesis.speak(u);
}
function toast(msg, kind = '') {
  const t = $('#toast'); t.textContent = msg; t.className = 'show ' + kind;
  clearTimeout(t._h); t._h = setTimeout(() => { t.className = ''; }, 2400);
}
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#confetti'), x = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const colors = ['#e0525c', '#4cae6a', '#3f8fd6', '#f0a33a', '#9a6ad1', '#ffd23f'];
  const ps = Array.from({ length: 120 }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5,
    vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, r: 5 + Math.random() * 6,
    col: pick(colors), a: Math.random() * 6
  }));
  let f = 0;
  (function loop() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.a += .1;
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.col;
      x.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .6); x.restore();
    });
    if (++f < 170) requestAnimationFrame(loop); else x.clearRect(0, 0, c.width, c.height);
  })();
}

/* ---------- Rewards ---------- */
function addStars(n) {
  state.stars += n; save();
  const el = $('#starCount'); el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  if (state.stars >= 100) award('star100');
}
function award(id) {
  if (state.badges.includes(id)) return;
  state.badges.push(id); save();
  const b = BADGES.find(x => x.id === id);
  setTimeout(() => { toast(`🏅 New badge: ${b.icon} ${b.name}!`, 'gold'); confetti(); sfx.good(); }, 700);
}

/* ---------- UI helpers ---------- */
let timers = [];
function stopTimers() { timers.forEach(clearInterval); timers = []; }
function go(screen) {
  stopTimers();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  screen();
  window.scrollTo({ top: 0 });
}
function screenHead(icon, title, sub) {
  return `<div class="screen-head"><span class="screen-icon">${icon}</span><div><h2>${title}</h2><p>${sub}</p></div><span class="lvl-chip">${L().grade}</span></div>`;
}
function feedback(msg, kind = '') { const el = $('#fb'); if (el) { el.innerHTML = msg; el.className = 'fb ' + kind; } }
function amountBox(label) {
  return `<label for="ans" class="q">${label}</label>
  <div class="input-row"><span class="dollar">$</span><input id="ans" inputmode="decimal" autocomplete="off" placeholder="0.00"><button class="btn" id="check">Check ✔️</button></div>`;
}
function onCheck(fn) {
  const run = () => fn(parseMoney($('#ans').value));
  $('#check').onclick = run;
  $('#ans').addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  if (matchMedia('(hover: hover)').matches) $('#ans').focus();
}
function lock() { ['#check', '#ans', '#hintBtn'].forEach(s => { const e = $(s); if (e) e.disabled = true; }); }
function showNext(fn, label = 'Next ➡️') {
  const row = document.createElement('div');
  row.className = 'row';
  row.innerHTML = `<button class="btn" id="nextBtn">${label}</button>`;
  $('#fb').after(row);
  const b = $('#nextBtn'); b.onclick = () => { sfx.click(); fn(); }; b.focus();
}
function countOnHTML(price, paid) {
  const pieces = breakdown(paid - price).reverse();
  let cur = price;
  const steps = pieces.map(v => { cur += v; return `<span class="arrow">+ ${moneyHTML(v, { scale: .45 })} →</span><span class="step-amt">${fmt(cur)}</span>`; }).join('');
  return `<div class="count-on"><p>🧮 <b>Count on</b> from the price to what was paid:</p>
    <div class="steps"><span class="step-amt">${fmt(price)}</span>${steps}</div>
    <p>Change = ${fmt(paid)} − ${fmt(price)} = <b>${fmt(paid - price)}</b></p></div>`;
}
function endScreen(icon, title, msg, replay, celebrate = true) {
  stopTimers();
  app.innerHTML = `<section class="panel center"><div class="big-emoji">${icon}</div><h2>${title}</h2><p>${msg}</p>
    <div class="row"><button class="btn" id="again">Play again 🔁</button><button class="btn alt" id="toHome">Home 🏠</button></div></section>`;
  if (celebrate) { confetti(); sfx.good(); }
  $('#again').onclick = () => go(replay);
  $('#toHome').onclick = () => go(home);
  window.scrollTo({ top: 0 });
}

/* ---------- Home ---------- */
function home() {
  app.innerHTML = `
  <section class="hero">
    <div class="hero-art">${moneyHTML(1000, { scale: .75, cls: 'float' })}${moneyHTML(100, { cls: 'float b' })}${moneyHTML(50, { cls: 'float c' })}</div>
    <h2>Learn Singapore money the fun way!</h2>
    <p>Count, shop, give change and save up for your dream toy.</p>
    <div class="level-pick" role="radiogroup" aria-label="Choose level">
      ${Object.entries(LEVELS).map(([k, l]) => `<button class="lvl ${+k === state.level ? 'on' : ''}" data-l="${k}" role="radio" aria-checked="${+k === state.level}"><b>${l.name}</b><small>${l.grade}</small></button>`).join('')}
    </div>
  </section>
  <section class="mode-grid">
    ${MODES.map(m => `<button class="mode" data-m="${m.id}" style="--c:${m.c}"><span class="mi">${m.icon}</span><b>${m.title}</b><small>${m.desc}</small></button>`).join('')}
  </section>
  <section class="panel"><h3>💡 Money tip</h3><p>${pick(TIPS)}</p></section>`;
  $$('.lvl').forEach(b => b.onclick = () => { state.level = +b.dataset.l; save(); sfx.click(); home(); });
  $$('.mode').forEach(b => b.onclick = () => { sfx.click(); go(MODES.find(m => m.id === b.dataset.m).fn); });
}

/* ---------- Money Museum ---------- */
function museum() {
  const gal = type => DENOMS.filter(d => d.type === type).map(d => moneyHTML(d.v, { button: true })).join('');
  app.innerHTML = `${screenHead('🏛️', 'Money Museum', 'Tap a note or coin to learn about it.')}
  <section class="panel">
    <h3>Notes 💵</h3><div class="gallery">${gal('note')}</div>
    <h3>Coins 🪙</h3><div class="gallery">${gal('coin')}</div>
    <p class="muted" id="seen">Seen ${state.seen.length} of ${DENOMS.length}</p>
  </section>
  <section class="panel" id="detail"><p class="muted">👆 Pick any note or coin above.</p></section>
  <section class="panel"><h3>📏 Dollars and cents</h3>
    <p><b>100 cents = 1 dollar.</b> So 35¢ can also be written as <b>$0.35</b>, and $2.50 means 2 dollars and 50 cents.</p>
    <p>Always write cents with two digits: <b>$3.05</b> is 3 dollars and 5 cents, but <b>$3.50</b> is 3 dollars and 50 cents.</p>
  </section>`;
  $$('.gallery .money').forEach(b => b.onclick = () => showDetail(+b.dataset.v));
}
function showDetail(v) {
  const d = denom(v);
  sfx[d.type](); speak(`This is ${d.name}.`);
  if (!state.seen.includes(v)) {
    state.seen.push(v); save();
    if (state.seen.length === DENOMS.length) award('museum');
  }
  $('#seen').textContent = `Seen ${state.seen.length} of ${DENOMS.length}`;
  const smaller = DENOMS.filter(s => s.v < v);
  const mix = breakdown(v, smaller.map(s => s.v));
  const same = smaller.filter(s => v % s.v === 0).slice(0, 3);
  const mixLine = mix.length && !mix.every(x => x === mix[0])
    ? `<li>${mix.map(x => moneyHTML(x, { scale: .45 })).join(' + ')}</li>` : '';
  $('#detail').innerHTML = `
    <div class="detail-art">${moneyHTML(v, { scale: d.type === 'note' ? 1.7 : 1.8 })}</div>
    <h3>${d.label} · ${d.name}</h3>
    <p>This ${d.type} is worth <b>${fmt(v)}</b>, which is <b>${v} cents</b>.</p>
    ${smaller.length ? `<h4>Ways to make ${d.label}</h4><ul class="eq">${mixLine}${same.map(s => `<li>${v / s.v} × ${moneyHTML(s.v, { scale: .45 })}</li>`).join('')}</ul>`
      : '<p>🐣 This is the smallest coin we use today!</p>'}`;
  $('#detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---------- Count the Cash ---------- */
function countGame() {
  const g = { round: 0, total: 5, score: 0, perfect: 0 };
  next();
  function next() {
    if (g.round === g.total) {
      if (g.perfect === g.total) award('counter');
      return endScreen('🔢', 'Counting complete!', `You got <b>${g.perfect}</b> of ${g.total} right on the first try and earned <b>${g.score} ⭐</b>.`, countGame);
    }
    g.round++; g.tries = 0; g.hint = false;
    const lv = L(), n = rand(3, 4) + state.level * 2, pieces = [];
    let budget = lv.max;
    for (let k = 0; k < n; k++) {
      const opts = lv.set.filter(v => v <= budget);
      if (!opts.length) break;
      const v = pick(opts); pieces.push(v); budget -= v;
    }
    if (state.level === 1) pieces.sort((a, b) => b - a); else shuffle(pieces);
    const amt = sum(pieces);
    let run = 0;
    app.innerHTML = `${screenHead('🔢', 'Count the Cash', `Round ${g.round} of ${g.total} · ${g.score} ⭐`)}
      <section class="panel"><div class="pile">${pieces.map((v, i) => { run += v; return `<div class="pile-item" style="animation-delay:${i * 80}ms">${moneyHTML(v, { scale: .85 })}<span class="run" hidden>${fmt(run)}</span></div>`; }).join('')}</div></section>
      <section class="panel center">${amountBox('How much money is there altogether?')}
        <button class="btn ghost" id="hintBtn">💡 Hint</button><div id="fb" class="fb"></div></section>`;
    $('#hintBtn').onclick = () => {
      g.hint = true; $$('.run').forEach(r => { r.hidden = false; }); $('#hintBtn').disabled = true;
      feedback(state.level === 1 ? 'Count on from the first one — the running total is under each.' : 'Tip: sort notes first, then coins. Running totals are shown under each one.', 'warn');
    };
    onCheck(val => {
      if (val == null) return feedback('Type an amount like 12.50', 'warn');
      if (val === amt) {
        const s = (g.hint || g.tries) ? 1 : 2;
        if (s === 2) g.perfect++;
        g.score += s; addStars(s); sfx.good();
        feedback(`Correct! ${fmt(amt)} is ${words(amt)}. +${s} ⭐`, 'good'); lock(); showNext(next);
      } else {
        g.tries++; sfx.bad();
        if (g.tries >= 2) {
          $$('.run').forEach(r => { r.hidden = false; });
          feedback(`Not quite. The answer is ${fmt(amt)} — follow the running totals to see how.`, 'bad'); lock(); showNext(next);
        } else feedback(val > amt ? 'Too much! Count again carefully. 🔍' : 'Too little! Did you miss something? 🔍', 'bad');
      }
    });
  }
}

/* ---------- Hawker Shopping ---------- */
function makeWallet(price) {
  const set = L().set, pieces = [];
  breakdown(price, set).forEach(v => {
    const smaller = set.filter(s => s < v && s >= v / 5);
    const split = breakdown(v, smaller);
    if (v >= 100 && Math.random() < .5 && smaller.length && sum(split) === v) pieces.push(...split);
    else pieces.push(v);
  });
  const extras = set.filter(v => v <= Math.max(500, price));
  for (let k = rand(2, 3); k > 0; k--) pieces.push(pick(extras));
  const big = set.filter(v => v > price).sort((a, b) => a - b)[0];
  if (big && Math.random() < .6) pieces.push(big);
  return pieces.sort((a, b) => b - a);
}
function shopGame() {
  const g = { round: 0, total: 5, score: 0 };
  next();
  function next() {
    if (g.round === g.total) return endScreen('🛍️', 'Shopping done!', `You earned <b>${g.score} ⭐</b> at the hawker centre. Shiok!`, shopGame);
    g.round++;
    const lv = L();
    const pool = ITEMS.filter(x => x.p % lv.cents === 0 && x.p <= (state.level === 3 ? 10000 : lv.max));
    g.items = state.level === 3 ? shuffle([...pool]).slice(0, 2) : [pick(pool)];
    g.price = sum(g.items.map(x => x.p));
    g.wallet = makeWallet(g.price).map((v, i) => ({ i, v, pay: false }));
    render();
  }
  function render() {
    const paidNow = sum(g.wallet.filter(w => w.pay).map(w => w.v));
    const pieces = pay => g.wallet.filter(w => w.pay === pay).map(w => moneyHTML(w.v, { button: true, id: w.i, scale: .75 })).join('');
    app.innerHTML = `${screenHead('🛒', 'Hawker Shopping', `Purchase ${g.round} of ${g.total} · ${g.score} ⭐`)}
    <section class="panel">
      <div class="items">${g.items.map(x => `<div class="item-card"><div class="emoji">${x.e}</div><b>${x.n}</b><span class="price">${fmt(x.p)}</span></div>`).join('')}</div>
      <p class="total-line">Total to pay: <b>${state.level === 3 ? '❓ Work it out!' : fmt(g.price)}</b></p>
    </section>
    <section class="panel">
      <h3>👛 Your wallet <small>tap to pay</small></h3>
      <div class="tray" id="wallet">${pieces(false) || '<p class="muted">Empty!</p>'}</div>
      <h3>🧾 Paying: <span class="paid">${fmt(paidNow)}</span> <small>tap to take back</small></h3>
      <div class="tray pay" id="paytray">${pieces(true) || '<p class="muted">Tap money in your wallet to pay.</p>'}</div>
      <div class="row"><button class="btn" id="payBtn" ${paidNow ? '' : 'disabled'}>Pay 💳</button></div>
      <div class="fb" id="fb"></div>
    </section>`;
    $$('#wallet .money, #paytray .money').forEach(b => b.onclick = () => {
      const w = g.wallet[+b.dataset.i]; w.pay = !w.pay; sfx[denom(w.v).type](); render();
    });
    $('#payBtn').onclick = pay;
  }
  function pay() {
    const tray = g.wallet.filter(w => w.pay).map(w => w.v), paid = sum(tray);
    if (paid < g.price) {
      sfx.bad();
      return feedback(state.level === 3 ? 'Not enough! Add up both prices and try again.' : `Not enough! You need ${fmt(g.price - paid)} more.`, 'bad');
    }
    const spare = tray.find(v => paid - v >= g.price);
    let s, msg;
    if (paid === g.price) {
      s = 3; msg = 'Exact amount — perfect! 🎯';
      state.stats.exact++; save(); if (state.stats.exact >= 5) award('exact5');
    } else if (!spare) { s = 2; msg = 'Well paid! 👍'; }
    else { s = 1; msg = `Paid! But you didn't need to give the ${denom(spare).label} — keep it in your wallet next time.`; }
    award('first-buy'); g.score += s; addStars(s); sfx.good();
    if (paid === g.price) {
      $('#payBtn').remove();
      $$('#wallet .money, #paytray .money').forEach(b => { b.disabled = true; });
      feedback(`${msg} +${s} ⭐ No change needed.`, 'good');
      return showNext(next);
    }
    changePhase(paid, `${msg} +${s} ⭐`);
  }
  function changePhase(paid, msg) {
    const change = paid - g.price;
    let tries = 0;
    app.innerHTML = `${screenHead('🛒', 'Hawker Shopping', `Purchase ${g.round} of ${g.total} · ${g.score} ⭐`)}
    <section class="panel center"><p class="fb good">${msg}</p>
      ${g.items.length > 1 ? `<p>Total: ${g.items.map(x => fmt(x.p)).join(' + ')} = <b>${fmt(g.price)}</b></p>` : ''}
      <p>You paid <b>${fmt(paid)}</b> for <b>${fmt(g.price)}</b>.</p>
      ${amountBox('How much change should the uncle give you?')}
      <div id="fb" class="fb"></div></section>`;
    onCheck(v => {
      if (v == null) return feedback('Type an amount like 1.50', 'warn');
      if (v === change) {
        g.score++; addStars(1); sfx.coin();
        feedback(`Correct! Your change is ${fmt(change)}. +1 ⭐<div class="tray center-tray">${breakdown(change).map(x => moneyHTML(x, { scale: .7 })).join('')}</div>`, 'good');
        lock(); return showNext(next);
      }
      tries++; sfx.bad();
      if (tries >= 2) { feedback(`The change is <b>${fmt(change)}</b>.${countOnHTML(g.price, paid)}`, 'bad'); lock(); showNext(next); }
      else feedback(`Not quite. Try ${fmt(paid)} − ${fmt(g.price)}, or count on from ${fmt(g.price)}!`, 'bad');
    });
  }
}

/* ---------- Be the Cashier ---------- */
function cashierGame() {
  const g = { round: 0, total: 5, score: 0 };
  const FACES = ['👵', '👴', '👩', '👨', '👧', '👦', '🧑‍🎓', '👩‍🍳', '🧔', '👱‍♀️'];
  const LIMIT = 45;
  next();
  function next() {
    stopTimers();
    if (g.round === g.total) return endScreen('🧾', 'Shift over!', `Great work at the counter! You earned <b>${g.score} ⭐</b>.`, cashierGame);
    g.round++;
    const lv = L();
    const it = pick(ITEMS.filter(x => x.p < lv.max && x.p % lv.cents === 0));
    const opts = new Set([100, 500, 1000, 5000, 10000].filter(m => m <= lv.max).map(m => Math.floor(it.p / m) * m + m));
    if (state.level > 1 && it.p % 100) opts.add(Math.floor(it.p / 1000) * 1000 + 1000 + it.p % 100);
    Object.assign(g, { it, price: it.p, paid: pick([...opts]), given: [], tries: 0, done: false, face: pick(FACES), time: LIMIT });
    g.change = g.paid - g.price;
    render();
    if (state.level === 3) timers.push(setInterval(tick, 1000));
  }
  function tick() {
    if (g.done) return;
    g.time--;
    const bar = $('#pbar');
    if (bar) { bar.style.width = (g.time / LIMIT * 100) + '%'; bar.style.background = g.time < 15 ? 'var(--bad)' : g.time < 30 ? 'var(--gold)' : 'var(--good)'; }
    if (g.time <= 0) finish(false, '⏰ The customer got tired of waiting!');
  }
  function render() {
    const lv = L(), given = sum(g.given);
    const till = DENOMS.map(d => d.v).filter(v => v < g.paid && lv.set.includes(v));
    app.innerHTML = `${screenHead('🧾', 'Be the Cashier', `Customer ${g.round} of ${g.total} · ${g.score} ⭐`)}
    <section class="panel">
      <div class="customer"><span class="cust">${g.face}</span><div class="bubble">Hi! One <b>${g.it.e} ${g.it.n}</b>, please. That's <b>${fmt(g.price)}</b>, right? Here's <b>${fmt(g.paid)}</b>.</div></div>
      <div class="tray">${breakdown(g.paid, lv.set).map(v => moneyHTML(v, { scale: .7 })).join('')}</div>
      ${state.level === 3 ? `<div class="patience" aria-label="Customer patience"><div id="pbar" style="width:${g.time / LIMIT * 100}%"></div></div>` : ''}
    </section>
    <section class="panel">
      <h3>🗄️ Cash register <small>tap to take out change</small></h3>
      <div class="till">${till.map(v => moneyHTML(v, { button: true, scale: .7 })).join('')}</div>
      <h3>🤲 Change${state.level < 3 ? `: <span class="paid">${fmt(given)}</span>` : ''} <small>tap to put back</small></h3>
      <div class="tray pay" id="given">${g.given.map((v, i) => moneyHTML(v, { button: true, id: i, scale: .7 })).join('') || '<p class="muted">No change yet.</p>'}</div>
      <div class="row" id="actions"><button class="btn ghost" id="clr">Clear</button><button class="btn" id="give" ${g.given.length ? '' : 'disabled'}>Give change 🤝</button></div>
      <div class="fb" id="fb"></div>
    </section>`;
    $$('.till .money').forEach(b => b.onclick = () => {
      if (g.done) return;
      const v = +b.dataset.v; g.given.push(v); g.given.sort((a, c) => c - a); sfx[denom(v).type](); render();
    });
    $$('#given .money').forEach(b => b.onclick = () => { if (g.done) return; g.given.splice(+b.dataset.i, 1); sfx.click(); render(); });
    $('#clr').onclick = () => { if (g.done) return; g.given = []; render(); };
    $('#give').onclick = give;
  }
  function give() {
    if (g.done) return;
    const diff = sum(g.given) - g.change;
    if (diff === 0) return finish(true);
    g.tries++; sfx.bad();
    if (g.tries >= 3) return finish(false, 'Hmm, not quite.');
    feedback(state.level === 3
      ? (diff > 0 ? 'Too much change! 😮' : 'Not enough change! 🤔')
      : `${diff > 0 ? 'Too much' : 'Not enough'} — you are ${fmt(Math.abs(diff))} ${diff > 0 ? 'over' : 'short'}.`, 'bad');
  }
  function finish(ok, why = '') {
    g.done = true; stopTimers();
    let msg;
    if (ok) {
      let s = 2;
      msg = `Correct! ${fmt(g.paid)} − ${fmt(g.price)} = <b>${fmt(g.change)}</b>.`;
      if (g.given.length === breakdown(g.change).length) { s++; msg += ' Fewest pieces bonus ⚡'; }
      if (state.level === 3 && g.time >= 25) { s++; msg += ' Speedy service 🚀'; }
      msg += ` +${s} ⭐`;
      g.score += s; addStars(s); sfx.good();
      state.stats.cashier++; save(); if (state.stats.cashier >= 10) award('cashier');
    } else {
      sfx.bad();
      msg = `${why} The change should be <b>${fmt(g.change)}</b>.${countOnHTML(g.price, g.paid)}`;
    }
    const actions = $('#actions'); if (actions) actions.remove();
    feedback(msg, ok ? 'good' : 'bad');
    showNext(next);
  }
}

/* ---------- Piggy Bank Planner ---------- */
function piggyGame() {
  const cfg = PIGGY[state.level];
  const s = { week: 0, wallet: 0, piggy: 0, treats: 0, goal: null };
  const head = () => screenHead('🐷', 'Piggy Bank Planner', s.goal ? `Week ${s.week} of ${cfg.weeks}` : 'Save up for something special');
  const piggyBar = () => {
    const pct = Math.min(100, Math.round(s.piggy / s.goal.p * 100));
    return `<section class="panel piggy"><div class="pig">🐷</div><div class="grow">
      <p><b>${s.goal.e} ${s.goal.n}</b> — saved <b>${fmt(s.piggy)}</b> of ${fmt(s.goal.p)}</p>
      <div class="bar"><div style="width:${pct}%"></div></div>
      <small>${pct}% · ${fmt(Math.max(0, s.goal.p - s.piggy))} to go</small></div></section>`;
  };
  chooseGoal();

  function chooseGoal() {
    const total = cfg.allow * cfg.weeks;
    app.innerHTML = `${head()}
    <section class="panel"><h3>🎯 What do you want to save for?</h3>
      <div class="goal-grid">${cfg.goals.map((gl, i) => `<button class="goal" data-i="${i}"><span class="emoji">${gl.e}</span><b>${gl.n}</b><span class="price">${fmt(gl.p)}</span></button>`).join('')}</div>
      <p>You get <b>${fmt(cfg.allow)}</b> pocket money every week for <b>${cfg.weeks} weeks</b>. Watch out for treats that tempt you!</p>
    </section>
    <section class="panel center"><h3>🧠 Bonus question</h3>
      ${amountBox(`If you saved ALL your pocket money, how much would you have after ${cfg.weeks} weeks?`)}
      <div id="fb" class="fb"></div></section>`;
    $$('.goal').forEach(b => b.onclick = () => { s.goal = cfg.goals[+b.dataset.i]; sfx.click(); weekStart(); });
    onCheck(v => {
      if (v == null) return feedback('Type an amount like 24.00', 'warn');
      lock();
      if (v === total) { sfx.good(); addStars(1); feedback(`Yes! ${cfg.weeks} × ${fmt(cfg.allow)} = ${fmt(total)}. +1 ⭐ Now pick your goal!`, 'good'); }
      else { sfx.bad(); feedback(`It's ${cfg.weeks} × ${fmt(cfg.allow)} = ${fmt(total)}. Now pick your goal!`, 'bad'); }
    });
  }

  function weekStart() {
    s.week++;
    s.wallet += cfg.allow;
    const r = Math.random();
    const t = r < .5 ? 'want' : r < .7 ? 'need' : r < .9 ? 'bonus' : 'calm';
    const base = pick(EVENTS[t]);
    const p = base.p ? Math.max(cfg.round, Math.round(base.p * cfg.scale / cfg.round) * cfg.round) : 0;
    const canBuy = s.wallet >= p;
    const text = {
      want: `${base.n} costs <b>${fmt(p)}</b>. Do you want it?`,
      need: `${base.n}: <b>${fmt(p)}</b>. This is a <b>need</b>, so you must pay.`,
      bonus: `${base.n} You get <b>${fmt(p)}</b>!`,
      calm: base.n
    }[t];
    const buttons = {
      want: `<button class="btn" id="buy" ${canBuy ? '' : 'disabled'}>Buy it (${fmt(p)})</button><button class="btn alt" id="skip">Skip and save 💪</button>${canBuy ? '' : '<span class="muted">Not enough in your wallet!</span>'}`,
      need: `<button class="btn" id="paybtn">Pay ${fmt(p)}</button>`,
      bonus: `<button class="btn" id="yay">Yay! Collect 🎉</button>`,
      calm: `<button class="btn" id="ok">OK 👍</button>`
    }[t];
    app.innerHTML = `${head()}${piggyBar()}
    <section class="panel">
      <p>📅 <b>Week ${s.week}</b> — you received <b>${fmt(cfg.allow)}</b> pocket money. 👛 Wallet: <b>${fmt(s.wallet)}</b></p>
      <div class="event-card ${t}"><span class="emoji">${base.e}</span><p>${text}</p></div>
      <div class="row">${buttons}</div>
    </section>`;
    sfx.coin();
    const on = (id, fn) => { const b = $('#' + id); if (b) b.onclick = () => { sfx.click(); fn(); }; };
    on('buy', () => { s.wallet -= p; s.treats += p; toast(`Enjoy your treat! ${base.e}`); savePhase(); });
    on('skip', () => { toast('Great self-control! 💪'); savePhase(); });
    on('paybtn', () => {
      if (s.wallet >= p) s.wallet -= p;
      else {
        const rest = p - s.wallet; s.wallet = 0; s.piggy = Math.max(0, s.piggy - rest);
        toast(`Your wallet was short, so ${fmt(rest)} came from your piggy bank.`);
      }
      savePhase();
    });
    on('yay', () => { s.wallet += p; savePhase(); });
    on('ok', savePhase);
  }

  function savePhase() {
    const left = s.goal.p - s.piggy, weeksLeft = cfg.weeks - s.week + 1;
    const per = Math.ceil(Math.max(0, left) / weeksLeft / 10) * 10;
    app.innerHTML = `${head()}${piggyBar()}
    <section class="panel">
      <h3>👛 Wallet: ${fmt(s.wallet)} <small>tap money to put it in the piggy bank</small></h3>
      <div class="tray" id="wallet">${breakdown(s.wallet).map(v => moneyHTML(v, { button: true, scale: .7 })).join('') || '<p class="muted">Your wallet is empty.</p>'}</div>
      <p class="tip">🎯 ${left > 0 ? `Save about <b>${fmt(per)}</b> each week to reach your goal on time (${fmt(left)} ÷ ${weeksLeft} week${weeksLeft > 1 ? 's' : ''}).` : 'You have enough!'} Money left in your wallet stays for next week.</p>
      <div class="row"><button class="btn alt" id="all" ${s.wallet ? '' : 'disabled'}>Save it all 🐷</button><button class="btn" id="nextW">${s.week < cfg.weeks ? 'Next week ➡️' : 'Finish 🏁'}</button></div>
    </section>`;
    $$('#wallet .money').forEach(b => b.onclick = () => deposit(+b.dataset.v));
    $('#all').onclick = () => deposit(s.wallet);
    $('#nextW').onclick = () => { sfx.click(); if (s.week < cfg.weeks) weekStart(); else finish(); };
  }

  function deposit(v) {
    s.wallet -= v; s.piggy += v; sfx.coin();
    if (s.piggy >= s.goal.p) return finish();
    savePhase();
    $('.pig').classList.add('bounce');
  }

  function finish() {
    if (s.piggy >= s.goal.p) {
      const spare = cfg.weeks - s.week, stars = 5 + spare;
      addStars(stars); award('saver');
      endScreen(s.goal.e, 'Goal reached! 🎉',
        `You saved <b>${fmt(s.piggy)}</b> and bought the <b>${s.goal.n}</b> in ${s.week} weeks${spare ? ` — ${spare} week${spare > 1 ? 's' : ''} early` : ''}! Money left over: <b>${fmt(s.piggy - s.goal.p + s.wallet)}</b>.${s.treats ? ` You also enjoyed ${fmt(s.treats)} of treats.` : ''} +${stars} ⭐`, piggyGame);
    } else {
      addStars(1);
      const tip = s.piggy + s.wallet >= s.goal.p
        ? 'You had enough money, but some was still in your wallet. Remember to put it in the piggy bank!'
        : s.treats ? `You spent ${fmt(s.treats)} on treats. Skipping a few would have helped!` : 'Try saving a little more each week.';
      endScreen('🐷', 'Almost there!', `You saved <b>${fmt(s.piggy)}</b>, but the ${s.goal.n} costs <b>${fmt(s.goal.p)}</b> — you needed <b>${fmt(s.goal.p - s.piggy)}</b> more. ${tip} +1 ⭐`, piggyGame, false);
    }
  }
}

/* ---------- Needs or Wants ---------- */
function needsGame() {
  const cards = shuffle([...NEEDS_WANTS]).slice(0, 10);
  let i = 0, score = 0;
  show();
  function show() {
    if (i === cards.length) {
      const stars = Math.ceil(score / 2);
      addStars(stars);
      if (score >= 8) award('wise');
      return endScreen('🧠', 'Sorting done!', `You sorted <b>${score} of ${cards.length}</b> correctly. +${stars} ⭐<br>Remember: pay for needs first, then save, then spend on wants.`, needsGame, score >= 6);
    }
    const c = cards[i];
    app.innerHTML = `${screenHead('🤔', 'Needs or Wants?', `Card ${i + 1} of ${cards.length} · ${score} correct`)}
    <section class="panel nw-card"><div class="emoji big">${c.e}</div><h2>${c.n}</h2><p>Is this a need or a want?</p>
      <div class="row"><button class="btn" data-a="1">Need ✅</button><button class="btn alt" data-a="0">Want 💭</button></div>
      <div id="fb" class="fb"></div></section>`;
    $$('[data-a]').forEach(b => b.onclick = () => {
      $$('[data-a]').forEach(x => { x.disabled = true; });
      const ok = (b.dataset.a === '1') === c.need;
      if (ok) { score++; sfx.good(); } else sfx.bad();
      feedback(`${ok ? 'Correct!' : 'Oops!'} It's a <b>${c.need ? 'NEED' : 'WANT'}</b>. ${c.why}`, ok ? 'good' : 'bad');
      i++; showNext(show);
    });
  }
}

/* ---------- Badges ---------- */
function badgesScreen() {
  app.innerHTML = `${screenHead('🏅', 'My Badges', `${state.badges.length} of ${BADGES.length} collected · ${state.stars} ⭐`)}
  <section class="panel"><div class="badges">${BADGES.map(b => `<div class="badge ${state.badges.includes(b.id) ? '' : 'locked'}"><div class="bi">${b.icon}</div><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}</div></section>
  <section class="panel center"><p class="muted">Progress is saved on this device only.</p><button class="btn ghost" id="reset">Reset progress</button></section>`;
  $('#reset').onclick = () => {
    if (confirm('Erase all stars and badges?')) { state = fresh(); save(); go(badgesScreen); }
  };
}

/* ---------- Modes & start ---------- */
const MODES = [
  { id: 'museum',  icon: '🏛️', title: 'Money Museum',       desc: 'Meet every Singapore note and coin', c: '#9a6ad1', fn: museum },
  { id: 'count',   icon: '🔢', title: 'Count the Cash',     desc: 'How much money is in the pile?', c: '#3f8fd6', fn: countGame },
  { id: 'shop',    icon: '🛒', title: 'Hawker Shopping',    desc: 'Pay for food and toys, then work out your change', c: '#ff6b4a', fn: shopGame },
  { id: 'cashier', icon: '🧾', title: 'Be the Cashier',     desc: 'Give customers the right change', c: '#4cae6a', fn: cashierGame },
  { id: 'piggy',   icon: '🐷', title: 'Piggy Bank Planner', desc: 'Save up for your dream item', c: '#ff9ad5', fn: piggyGame },
  { id: 'needs',   icon: '🤔', title: 'Needs or Wants?',    desc: 'Learn to spend wisely', c: '#f0a33a', fn: needsGame },
  { id: 'badges',  icon: '🏅', title: 'My Badges',          desc: 'See your stars and awards', c: '#2b2140', fn: badgesScreen }
];

$('#homeBtn').onclick = () => { sfx.click(); go(home); };
$('#soundBtn').onclick = () => { state.sound = !state.sound; save(); sfx.click(); };
updateHUD();
go(home);