// Mattdlvx static demo frontend — play credits only, data stored in this browser.
const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
let me = null, config = null;
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function api(path, body) {
  // Static demo: no server. All data lives in this browser (see local-api.js).
  await new Promise(r => setTimeout(r, 60));
  return window.localApi(path, body);
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.add('hidden'), 2800); }
function setUser(u) {
  me = u;
  if (!u) return;
  $('#balance').textContent = fmt(u.balance);
  $('#bellDot').classList.toggle('hidden', !u.availableBonuses);
}
function openModal(html) { $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); $('#modalCard').innerHTML = ''; }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.dataset.close !== undefined) closeModal(); });

// ---------- Illustrations (original SVGs) ----------
const CAR_SVG = `<svg class="car" viewBox="0 0 400 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a40"/><stop offset=".55" stop-color="#16161a"/><stop offset="1" stop-color="#050506"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b6470"/><stop offset="1" stop-color="#15181d"/></linearGradient>
<radialGradient id="rim"><stop offset="0" stop-color="#555"/><stop offset=".7" stop-color="#1c1c1c"/><stop offset="1" stop-color="#000"/></radialGradient></defs>
<ellipse cx="210" cy="152" rx="190" ry="12" fill="#000" opacity=".45"/>
<path d="M18 118 C20 100 40 92 80 86 L140 78 C170 56 205 46 248 46 C290 46 330 60 360 76 L384 82 C396 88 400 100 398 116 L396 132 L20 136 Z" fill="url(#body)"/>
<path d="M158 78 C182 60 210 53 248 53 C280 53 310 62 336 76 Z" fill="url(#glass)"/>
<path d="M240 54 L243 77" stroke="#0b0b0d" stroke-width="4"/>
<path d="M40 96 C80 90 140 86 200 86 C270 86 330 90 388 98" stroke="#55565e" stroke-width="1.5" fill="none" opacity=".7"/>
<ellipse cx="44" cy="100" rx="18" ry="8" fill="#e8eef8" opacity=".95"/><ellipse cx="44" cy="100" rx="10" ry="4" fill="#fff"/>
<path d="M370 84 L392 88 L392 96 L372 94 Z" fill="#c22b2b"/>
<circle cx="100" cy="132" r="28" fill="#0a0a0a"/><circle cx="100" cy="132" r="19" fill="url(#rim)"/><circle cx="100" cy="132" r="5" fill="#c9a24a"/>
<circle cx="318" cy="132" r="28" fill="#0a0a0a"/><circle cx="318" cy="132" r="19" fill="url(#rim)"/><circle cx="318" cy="132" r="5" fill="#c9a24a"/>
<g stroke="#3a3a3a" stroke-width="2.5"><path d="M100 115 V149 M83 132 H117 M88 120 L112 144 M112 120 L88 144"/><path d="M318 115 V149 M301 132 H335 M306 120 L330 144 M330 120 L306 144"/></g>
</svg>`;
const GIFT_SVG = `<svg class="gift" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs><linearGradient id="box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2f36"/><stop offset="1" stop-color="#0f1114"/></linearGradient>
<linearGradient id="rib" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f2f0"/><stop offset=".5" stop-color="#bdbdb8"/><stop offset="1" stop-color="#8d8d88"/></linearGradient></defs>
<rect x="30" y="100" width="160" height="110" rx="6" fill="url(#box)"/>
<rect x="22" y="88" width="176" height="26" rx="5" fill="#23272d"/>
<rect x="96" y="88" width="28" height="122" fill="url(#rib)"/>
<path d="M110 92 C70 40 20 30 18 62 C16 92 70 96 110 92 Z" fill="url(#rib)"/>
<path d="M110 92 C150 40 200 30 202 62 C204 92 150 96 110 92 Z" fill="url(#rib)"/>
<path d="M110 92 C80 70 50 62 34 66" stroke="#8d8d88" stroke-width="3" fill="none"/><path d="M110 92 C140 70 170 62 186 66" stroke="#8d8d88" stroke-width="3" fill="none"/>
<path d="M104 96 C90 120 74 140 60 150 L72 154 L80 142 C92 128 102 112 108 98 Z" fill="url(#rib)"/>
<path d="M116 96 C130 120 146 140 160 150 L148 154 L140 142 C128 128 118 112 112 98 Z" fill="url(#rib)"/>
<ellipse cx="110" cy="92" rx="16" ry="11" fill="#d9d9d4"/>
</svg>`;

const GAMES = [
  { id: 'plinko', name: 'PLINKO', tag: 'Drop & win', emoji: '🔴' },
  { id: 'slots', name: 'SLOTS', tag: '3-reel classic', emoji: '🎰' },
  { id: 'dice', name: 'DICE', tag: 'Over / under', emoji: '🎲' },
  { id: 'crash', name: 'CRASH', tag: 'Cash out in time', emoji: '🚀' },
];
const tileHTML = (g) => `<a class="tile t-${g.id}" href="#/game/${g.id}"><span class="emoji">${g.emoji}</span><small>${g.tag.toUpperCase()}</small>${g.name}</a>`;

// ---------- Views ----------
function authView() {
  let mode = 'signup';
  app.innerHTML = `<div class="auth">
    <h1>Matt<span>dlvx</span></h1>
    <p class="sub">A play-money casino demo. New players get 10,000 free credits.<br>Credits have no cash value. Accounts are stored only in this browser.</p>
    <div class="panel">
      <div class="tabs"><button data-m="signup" class="on">Sign up</button><button data-m="login">Log in</button></div>
      <form id="authForm">
        <label>Username</label><input name="username" autocomplete="username" required minlength="3" maxlength="20">
        <label>Password</label><input name="password" type="password" autocomplete="new-password" required minlength="6">
        <button class="btn btn-green play-btn" id="authSubmit">Create account</button>
        <div class="err" id="authErr"></div>
      </form>
    </div>
    <p class="legal">Demo only — no real-money gambling, no deposits or withdrawals of real funds.</p></div>`;
  app.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    mode = b.dataset.m; app.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    $('#authSubmit').textContent = mode === 'signup' ? 'Create account' : 'Log in';
  });
  $('#authForm').onsubmit = async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    try { const d = await api('/' + mode, { username: f.get('username'), password: f.get('password') }); setUser(d.user); location.hash = '#/'; route(); }
    catch (err) { $('#authErr').textContent = err.message; }
  };
}

function homeView() {
  const v = me.vip;
  app.innerHTML = `
  <section class="balance-card">
    <div><span class="muted">Play-credit balance (DEMO)</span><div class="big-bal">${fmt(me.balance)} <small>CRD</small></div></div>
    <div class="bal-actions"><button class="btn btn-green" id="homeDeposit">Deposit</button><button class="btn btn-light" id="homeWithdraw">Withdraw</button></div>
  </section>
  <section class="card vip">
    <h3>VIP Loyalty Program</h3>
    <p>Unlock first-class rewards, exclusive perks &amp; more</p>
    <div class="vip-progress">
      <span class="tier-badge">${v.tier.toUpperCase()} · LVL ${v.level}</span>
      <div class="bar"><i style="width:${(v.progress * 100).toFixed(1)}%"></i></div>
      <div class="small">${v.next ? `${fmt(v.totalWagered)} / ${fmt(v.nextAt)} wagered to ${v.next}` : 'Top tier reached!'}</div>
    </div>
    ${CAR_SVG}
  </section>
  <section class="card bonus" id="bonusCard" style="cursor:pointer">
    <h3>Bonuses</h3>
    <div class="bonus-count"><span class="ring"></span>${me.availableBonuses} available bonus${me.availableBonuses === 1 ? '' : 'es'}</div>
    ${GIFT_SVG}
  </section>
  <div class="section-head"><div class="arrows"><button id="cl">‹</button><button id="cr">›</button></div><a href="#/games">All games ›</a></div>
  <div class="carousel" id="carousel">${GAMES.map(tileHTML).join('')}</div>
  <p class="legal">Mattdlvx uses play credits only. Nothing here can be bought, cashed out or exchanged for money.</p>`;
  $('#bonusCard').onclick = openBonuses;
  $('#homeDeposit').onclick = openDeposit;
  $('#homeWithdraw').onclick = openWithdraw;
  const c = $('#carousel');
  $('#cl').onclick = () => c.scrollBy({ left: -150, behavior: 'smooth' });
  $('#cr').onclick = () => c.scrollBy({ left: 150, behavior: 'smooth' });
}

function gamesView() {
  app.innerHTML = `<h2>All games</h2><div class="grid">${GAMES.map(tileHTML).join('')}</div>`;
}

async function openBonuses() {
  const { bonuses } = await api('/bonuses');
  openModal(`<h2>Bonuses</h2>${bonuses.map(b => `<div class="bonus-item"><div><b>${esc(b.title)} · ${fmt(b.amount)} credits</b><span>${esc(b.description)}${!b.available && b.availableAt ? ` · next in ${Math.ceil((b.availableAt - Date.now()) / 3600e3)}h` : ''}${b.claimed ? ' · claimed' : ''}</span></div>
    <button class="btn btn-green" data-claim="${b.id}" ${b.available ? '' : 'disabled'}>${b.available ? 'Claim' : 'Claimed'}</button></div>`).join('')}
    <button class="btn" data-close style="width:100%;margin-top:6px">Close</button>`);
  $('#modalCard').querySelectorAll('[data-claim]').forEach(btn => btn.onclick = async () => {
    try { const d = await api(`/bonuses/${btn.dataset.claim}/claim`, {}); setUser(d.user); toast('Bonus claimed! 🎁'); closeModal(); route(); }
    catch (e) { toast(e.message); }
  });
}

function openDeposit() {
  openModal(`<h2>Add play credits</h2>
    <p class="muted">Free demo top-up — no payment, no real money. Limit: 5,000 credits per 24 hours. Remaining today: <b>${fmt(me.depositRemaining)}</b></p>
    <div class="quick" style="margin-top:14px">${[500, 1000, 2500, 5000].map(a => `<button data-amt="${a}">+${a}</button>`).join('')}</div>
    <label>Amount</label><input id="depAmt" type="number" min="1" value="1000">
    <button class="btn btn-green play-btn" id="depGo">Add credits</button><div class="err" id="depErr"></div>
    <button class="btn" data-close style="width:100%;margin-top:6px">Cancel</button>`);
  $('#modalCard').querySelectorAll('[data-amt]').forEach(b => b.onclick = () => $('#depAmt').value = b.dataset.amt);
  $('#depGo').onclick = async () => {
    try { const d = await api('/deposit', { amount: Number($('#depAmt').value) }); setUser(d.user); toast(`+${fmt($('#depAmt').value)} play credits added`); closeModal(); route(); }
    catch (e) { $('#depErr').textContent = e.message; }
  };
}

function openWithdraw() {
  openModal(`<h2>Withdraw play credits</h2>
    <p class="muted">This only removes play credits from your demo balance. <b>Play credits have no cash value</b> — nothing is paid out and no payment details are ever needed.</p>
    <p style="margin-top:10px">Available: <b>${fmt(me.balance)} CRD</b></p>
    <label>Amount (credits, min 1)</label><input id="wdAmt" type="number" min="1" step="1" value="${Math.min(100, Math.floor(me.balance))}">
    <button class="btn btn-light play-btn" id="wdGo">Withdraw credits</button><div class="err" id="wdErr"></div>
    <button class="btn" data-close style="width:100%;margin-top:6px">Cancel</button>`);
  $('#wdGo').onclick = async () => {
    const amt = Number($('#wdAmt').value);
    if (!Number.isFinite(amt) || amt < 1) return $('#wdErr').textContent = 'Minimum withdrawal is 1 credit';
    if (amt > me.balance) return $('#wdErr').textContent = 'Amount is more than your balance';
    try { const d = await api('/withdraw', { amount: amt }); setUser(d.user); toast(`Withdrew ${fmt(amt)} play credits — Completed (demo)`); closeModal(); route(); }
    catch (e) { $('#wdErr').textContent = e.message; }
  };
}

function betControls(extra = '') {
  return `<label>Bet amount (credits)</label><input id="betAmt" type="number" min="${config.minBet}" max="${config.maxBet}" step="1" value="10">
  <div class="quick"><button data-q="half">½</button><button data-q="double">2×</button><button data-q="min">Min</button><button data-q="max">Max</button></div>${extra}`;
}
function wireQuick() {
  app.querySelectorAll('[data-q]').forEach(b => b.onclick = () => {
    const i = $('#betAmt'); let v = Number(i.value) || config.minBet;
    v = { half: v / 2, double: v * 2, min: config.minBet, max: Math.min(config.maxBet, me.balance) }[b.dataset.q];
    i.value = Math.max(config.minBet, Math.floor(v * 100) / 100);
  });
}
async function placeBet(game, extra) {
  const amount = Number($('#betAmt').value);
  return api(`/games/${game}/bet`, { amount, ...extra });
}
function showResult(d) {
  const r = $('#result');
  r.className = 'result ' + (d.profit >= 0 && d.payout > 0 ? 'win' : 'lose');
  r.textContent = d.payout > 0 ? `${d.multiplier}× — won ${fmt(d.payout)} (${d.profit >= 0 ? '+' : ''}${fmt(d.profit)})` : `No win — lost ${fmt(d.amount)}`;
  setUser(d.user);
}
function lockBtn(on) { const b = $('#playBtn'); if (b) b.disabled = on; }

function slotsView() {
  app.innerHTML = `<h2>🎰 Slots</h2><div class="panel">
    <div class="reels"><div class="reel">🍒</div><div class="reel">💎</div><div class="reel">7️⃣</div></div>
    <p class="muted" style="text-align:center">3 of a kind: ${config.slots.map(s => `${s.s} ${s.pay3}×`).join(' · ')}<br>Any pair returns your bet (1×)</p>
    <div class="result" id="result"></div></div>
    <div class="panel">${betControls()}<button class="btn btn-green play-btn" id="playBtn">Spin</button></div>`;
  wireQuick();
  $('#playBtn').onclick = async () => {
    lockBtn(true); const reels = app.querySelectorAll('.reel');
    const syms = config.slots.map(s => s.s);
    reels.forEach(r => r.classList.add('spin'));
    const iv = setInterval(() => reels.forEach(r => { if (r.classList.contains('spin')) r.textContent = syms[Math.floor(Math.random() * syms.length)]; }), 70);
    try {
      const d = await placeBet('slots');
      for (let i = 0; i < 3; i++) { await sleep(350); reels[i].classList.remove('spin'); reels[i].textContent = d.details.reels[i]; }
      showResult(d);
    } catch (e) { reels.forEach(r => r.classList.remove('spin')); toast(e.message); }
    clearInterval(iv); lockBtn(false);
  };
}

function diceView() {
  app.innerHTML = `<h2>🎲 Dice</h2><div class="panel">
    <div class="dice-big" id="roll">50.00</div>
    <div class="dice-bar" id="dbar" style="--t:50%"><span class="dice-marker" id="dmark" style="left:50%">?</span></div>
    <div class="row"><div><label>Win chance</label><input id="chance" readonly></div><div><label>Payout</label><input id="payout" readonly></div></div>
    <div class="result" id="result"></div></div>
    <div class="panel">${betControls(`
      <label>Target: <b id="tv">50</b></label><input id="target" type="range" min="2" max="98" value="50" style="padding:0">
      <label>Direction</label><select id="dir"><option value="over">Roll over</option><option value="under">Roll under</option></select>`)}
      <button class="btn btn-green play-btn" id="playBtn">Roll</button></div>`;
  wireQuick();
  const upd = () => {
    const t = Number($('#target').value), dir = $('#dir').value; const ch = dir === 'over' ? 100 - t : t;
    $('#tv').textContent = t; $('#chance').value = ch.toFixed(2) + '%'; $('#payout').value = (99 / ch).toFixed(2) + '×';
    const bar = $('#dbar'); bar.style.setProperty('--t', t + '%'); bar.classList.toggle('under', dir === 'under');
  };
  $('#target').oninput = upd; $('#dir').onchange = upd; upd();
  $('#playBtn').onclick = async () => {
    lockBtn(true);
    try {
      const d = await placeBet('dice', { target: Number($('#target').value), direction: $('#dir').value });
      $('#dmark').style.left = d.details.roll + '%'; $('#dmark').textContent = d.details.roll.toFixed(2);
      $('#roll').textContent = d.details.roll.toFixed(2); $('#roll').className = 'dice-big ' + (d.details.win ? 'win' : 'lose');
      showResult(d);
    } catch (e) { toast(e.message); }
    lockBtn(false);
  };
}

function plinkoView() {
  const rows = config.plinko.rows;
  app.innerHTML = `<h2>🔴 Plinko</h2><div class="panel"><canvas id="pc" width="600" height="520"></canvas><div class="result" id="result"></div></div>
    <div class="panel">${betControls(`<label>Risk</label><select id="risk"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select>`)}
    <button class="btn btn-green play-btn" id="playBtn">Drop ball</button></div>`;
  wireQuick();
  const cv = $('#pc'), ctx = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const gap = W / (rows + 3), top = 40;
  const pegPos = (r, i) => ({ x: W / 2 + (i - r / 2) * gap, y: top + r * gap * 0.95 });
  let hi = -1;
  function draw(ball) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#cfd5e2';
    for (let r = 2; r < rows + 2; r++) for (let i = 0; i <= r; i++) { const p = pegPos(r, i); ctx.beginPath(); ctx.arc(p.x, p.y - 2 * gap * .95, 4, 0, 7); ctx.fill(); }
    const mults = config.plinko.multipliers[$('#risk').value];
    const sy = top + rows * gap * 0.95 + 18;
    mults.forEach((m, i) => {
      const x = W / 2 + (i - rows / 2) * gap; const t = Math.abs(i - rows / 2) / (rows / 2);
      ctx.fillStyle = i === hi ? '#ffffff' : `hsl(${50 - t * 50},85%,${45 + (1 - t) * 5}%)`;
      ctx.fillRect(x - gap / 2 + 2, sy, gap - 4, 30);
      ctx.fillStyle = '#111'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(m + '×', x, sy + 20);
    });
    if (ball) { ctx.fillStyle = '#ff3b5c'; ctx.beginPath(); ctx.arc(ball.x, ball.y, 9, 0, 7); ctx.fill(); }
  }
  $('#risk').onchange = () => { hi = -1; draw(); }; draw();
  $('#playBtn').onclick = async () => {
    lockBtn(true); hi = -1;
    try {
      const d = await placeBet('plinko', { risk: $('#risk').value });
      let pos = 0; const pts = [{ x: W / 2, y: top - 20 }];
      d.details.path.forEach((s, r) => { pos += s; pts.push({ x: W / 2 + (pos - (r + 1) / 2) * gap, y: top + (r + 1) * gap * 0.95 - 10 }); });
      for (let k = 1; k < pts.length; k++) {
        const a = pts[k - 1], b = pts[k];
        for (let f = 0; f <= 8; f++) { const t = f / 8; draw({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 10 }); await sleep(14); }
      }
      hi = d.details.slot; draw(pts[pts.length - 1]);
      showResult(d);
    } catch (e) { toast(e.message); }
    lockBtn(false);
  };
}

function crashView() {
  app.innerHTML = `<h2>🚀 Crash</h2><div class="panel"><div class="crash-num" id="cn">1.00×</div><p class="muted" style="text-align:center">Set an auto cash-out. If the rocket reaches it before crashing, you win bet × cash-out.</p><div class="result" id="result"></div></div>
    <div class="panel">${betControls(`<label>Auto cash-out (×)</label><input id="co" type="number" min="1.01" step="0.01" value="2.00">`)}
    <button class="btn btn-green play-btn" id="playBtn">Launch</button></div>`;
  wireQuick();
  $('#playBtn').onclick = async () => {
    lockBtn(true); const cn = $('#cn'); cn.className = 'crash-num'; $('#result').textContent = '';
    try {
      const d = await placeBet('crash', { cashout: Number($('#co').value) });
      const end = d.details.win ? d.details.cashout : d.details.crashAt;
      let m = 1; const t0 = performance.now();
      while (m < end) { m = Math.min(end, Math.exp((performance.now() - t0) / 1600)); cn.textContent = m.toFixed(2) + '×'; await sleep(30); }
      cn.textContent = d.details.win ? `Cashed out ${d.details.cashout.toFixed(2)}×` : `Crashed @ ${d.details.crashAt.toFixed(2)}×`;
      cn.classList.add(d.details.win ? 'win' : 'lose'); cn.style.fontSize = '34px';
      showResult(d);
      if (d.details.win) $('#result').textContent += ` · rocket crashed at ${d.details.crashAt.toFixed(2)}×`;
    } catch (e) { toast(e.message); }
    lockBtn(false);
  };
}

async function historyView() {
  app.innerHTML = `<h2>History</h2><div class="tabs"><button class="on" data-t="bets">Bets</button><button data-t="txns">Transactions</button></div><div class="panel" id="hist">Loading…</div>`;
  const [{ bets }, { transactions }] = await Promise.all([api('/bets'), api('/transactions')]);
  const render = (t) => {
    $('#hist').innerHTML = t === 'bets'
      ? (bets.length ? `<table><tr><th>Game</th><th class="num">Bet</th><th class="num">Mult</th><th class="num">Profit</th></tr>${bets.map(b => `<tr><td>${b.game}<div class="muted">${new Date(b.created_at).toLocaleString()}</div></td><td class="num">${fmt(b.amount)}</td><td class="num">${b.multiplier}×</td><td class="num ${b.payout - b.amount >= 0 ? 'pos' : 'neg'}">${fmt(b.payout - b.amount)}</td></tr>`).join('')}</table>` : '<p class="muted">No bets yet.</p>')
      : `<table><tr><th>Type</th><th class="num">Amount</th><th class="num">Balance</th></tr>${transactions.map(x => `<tr><td>${x.type === 'withdrawal' ? 'Withdrawal (play credits)' : x.type}<div class="muted">${esc(x.note || '')} · ${esc(x.status || 'Completed')} · ${new Date(x.created_at).toLocaleString()}</div></td><td class="num ${x.amount >= 0 ? 'pos' : 'neg'}">${x.amount >= 0 ? '+' : ''}${fmt(x.amount)}</td><td class="num">${fmt(x.balance_after)}</td></tr>`).join('')}</table>`;
  };
  app.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { app.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); render(b.dataset.t); });
  render('bets');
}

function profileView() {
  const s = me.stats, v = me.vip;
  app.innerHTML = `<h2>Profile</h2><div class="panel">
    <div style="display:flex;align-items:center;gap:14px"><div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#8a6a45,#3d3125);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800">${esc(me.username[0].toUpperCase())}</div>
    <div><b style="font-size:18px">${esc(me.username)}</b><div class="muted">Member since ${new Date(me.createdAt).toLocaleDateString()}</div><span class="tier-badge" style="margin-top:6px">${v.tier.toUpperCase()} · LVL ${v.level}</span></div></div></div>
    <div class="panel stats">
      <div class="stat"><span>Balance (play credits)</span><b>${fmt(me.balance)}</b></div>
      <div class="stat"><span>Total wagered</span><b>${fmt(v.totalWagered)}</b></div>
      <div class="stat"><span>Bets placed</span><b>${s.bets}</b></div>
      <div class="stat"><span>Biggest win</span><b>${fmt(s.biggestWin)}</b></div>
      <div class="stat"><span>Total won</span><b>${fmt(s.won)}</b></div>
      <div class="stat"><span>Net result</span><b class="${s.won - s.wagered >= 0 ? 'pos' : 'neg'}">${fmt(s.won - s.wagered)}</b></div>
    </div>
    <div class="panel"><b>VIP progress</b><div class="bar" style="background:#11131a"><i style="width:${(v.progress * 100).toFixed(1)}%"></i></div><p class="muted" style="margin-top:6px">${v.next ? `${fmt(v.nextAt - v.totalWagered)} more credits wagered to reach ${v.next}` : 'Top tier reached'}</p>
    <p class="muted" style="margin-top:6px">Tiers: Bronze 0 · Silver 5k · Gold 25k · Platinum 100k · Diamond 500k</p></div>
    <button class="btn" id="logout" style="width:100%;padding:14px">Log out</button>
    <p class="legal">Play-money demo. Credits are free, have no cash value and cannot be withdrawn.</p>`;
  $('#logout').onclick = async () => { await api('/logout', {}); me = null; location.hash = '#/login'; route(); };
}

// ---------- Router ----------
async function route() {
  $('#notifPanel').classList.add('hidden');
  if (!config) config = await api('/games/config');
  if (!me) { try { setUser((await api('/me')).user); } catch { } }
  const h = location.hash.replace(/^#/, '') || '/';
  const authed = !!me;
  ['#topbar', '#bottomnav'].forEach(s => $(s).classList.toggle('hidden', !authed));
  if (!authed) return authView();
  try { setUser((await api('/me')).user); } catch { me = null; return route(); }
  const nav = h.startsWith('/game') ? 'games' : h.slice(1) || 'home';
  document.querySelectorAll('.bottomnav a').forEach(a => a.classList.toggle('on', a.dataset.r === nav));
  window.scrollTo(0, 0);
  const m = h.match(/^\/game\/(\w+)/);
  if (m) return ({ slots: slotsView, dice: diceView, plinko: plinkoView, crash: crashView }[m[1]] || gamesView)();
  if (h === '/games') return gamesView();
  if (h === '/history') return historyView();
  if (h === '/profile') return profileView();
  return homeView();
}
$('#depositBtn').onclick = openDeposit;
$('#currencyBtn').onclick = () => toast('Play credits (CRD) only — no real currencies in this demo.');
$('#bellBtn').onclick = async () => {
  const p = $('#notifPanel');
  if (!p.classList.contains('hidden')) return p.classList.add('hidden');
  const { notifications } = await api('/notifications');
  p.innerHTML = notifications.length ? notifications.map(n => `<div>${esc(n.text)}</div>`).join('') : '<div>No notifications</div>';
  p.classList.remove('hidden');
};
window.addEventListener('hashchange', route);
route();
