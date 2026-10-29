// Mattdlvx static demo "backend": everything runs in this browser and is stored in localStorage.
// DEMO ONLY: passwords are salted SHA-256 hashed client-side, which is NOT real security.
// Play credits have no cash value. No real money, payments or payouts exist anywhere.
(function () {
  const START_BALANCE = 10000, MIN_BET = 1, MAX_BET = 5000, DAILY_DEPOSIT_LIMIT = 5000;
  const WELCOME_BONUS = 2500, DAILY_BONUS = 500, DAY = 24 * 3600 * 1000;
  const TIERS = [{ name: 'Bronze', min: 0 }, { name: 'Silver', min: 5000 }, { name: 'Gold', min: 25000 }, { name: 'Platinum', min: 100000 }, { name: 'Diamond', min: 500000 }];
  const USERS_KEY = 'mattdlvx_users_v1', SESSION_KEY = 'mattdlvx_session_v1';
  const round2 = (n) => Math.round(n * 100) / 100;
  const rnd = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 2 ** 32; };
  const err = (msg, status = 400) => Object.assign(new Error(msg), { status });

  const load = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch { return {}; } };
  const save = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  async function hashPw(salt, pw) { return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pw))); }
  function newSalt() { const a = new Uint8Array(16); crypto.getRandomValues(a); return hex(a); }

  function vipInfo(w) {
    let i = 0; while (i + 1 < TIERS.length && w >= TIERS[i + 1].min) i++;
    const cur = TIERS[i], next = TIERS[i + 1];
    return { tier: cur.name, level: i + 1, next: next ? next.name : null, nextAt: next ? next.min : null, progress: next ? Math.min(1, (w - cur.min) / (next.min - cur.min)) : 1, totalWagered: round2(w) };
  }
  const depositedLast24h = (u) => u.txns.filter(t => t.type === 'deposit' && t.created_at > Date.now() - DAY).reduce((a, t) => a + t.amount, 0);
  function bonusList(u) {
    const lastDaily = u.bonusClaims.daily || 0, welcomeClaimed = !!u.bonusClaims.welcome, readyAt = lastDaily + DAY;
    return [
      { id: 'welcome', title: 'Welcome Bonus', amount: WELCOME_BONUS, description: 'One-time play-credit gift for new players', available: !welcomeClaimed, claimed: welcomeClaimed },
      { id: 'daily', title: 'Daily Bonus', amount: DAILY_BONUS, description: 'Free play credits every 24 hours', available: Date.now() >= readyAt, availableAt: readyAt },
    ];
  }
  function publicUser(u) {
    const wagered = u.bets.reduce((a, b) => a + b.amount, 0), won = u.bets.reduce((a, b) => a + b.payout, 0);
    return {
      id: u.id, username: u.username, balance: round2(u.balance), createdAt: u.created_at, vip: vipInfo(u.total_wagered),
      availableBonuses: bonusList(u).filter(b => b.available).length,
      depositRemaining: round2(Math.max(0, DAILY_DEPOSIT_LIMIT - depositedLast24h(u))),
      stats: { bets: u.bets.length, wagered: round2(wagered), won: round2(won), biggestWin: round2(Math.max(0, ...u.bets.map(b => b.payout))) },
    };
  }
  function addTxn(u, type, amount, note, status) {
    u.txns.push({ id: u.txns.length + 1, type, amount: round2(amount), balance_after: round2(u.balance), note, status: status || 'Completed', created_at: Date.now() });
  }
  function current(users) {
    const key = localStorage.getItem(SESSION_KEY);
    const u = key && users[key];
    if (!u) throw err('Not logged in', 401);
    return u;
  }

  // ----- Games (same rules & payout tables as the server version) -----
  const SLOT_SYMBOLS = [{ s: '🍒', w: 30, pay3: 4 }, { s: '🍋', w: 25, pay3: 8 }, { s: '🔔', w: 18, pay3: 15 }, { s: '⭐', w: 12, pay3: 30 }, { s: '💎', w: 7, pay3: 75 }, { s: '7️⃣', w: 3, pay3: 200 }];
  const SLOT_TOTAL = SLOT_SYMBOLS.reduce((a, b) => a + b.w, 0);
  const slotSpin = () => { let r = rnd() * SLOT_TOTAL; for (const x of SLOT_SYMBOLS) if ((r -= x.w) < 0) return x; return SLOT_SYMBOLS[0]; };
  const PLINKO_ROWS = 12;
  const PLINKO_MULTS = {
    low: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  };
  const GAMES = {
    dice(b) {
      const target = Number(b.target), dir = b.direction === 'under' ? 'under' : 'over';
      if (!Number.isFinite(target) || target < 2 || target > 98) throw err('Target must be between 2 and 98');
      const roll = round2(rnd() * 100), chance = dir === 'over' ? 100 - target : target, mult = round2(99 / chance);
      const win = dir === 'over' ? roll > target : roll < target;
      return { multiplier: win ? mult : 0, details: { roll, target, direction: dir, chance: round2(chance), payoutMultiplier: mult, win } };
    },
    slots() {
      const r = [slotSpin(), slotSpin(), slotSpin()]; let m = 0;
      if (r[0].s === r[1].s && r[1].s === r[2].s) m = r[0].pay3;
      else if (r[0].s === r[1].s || r[1].s === r[2].s || r[0].s === r[2].s) m = 1;
      return { multiplier: m, details: { reels: r.map(x => x.s), win: m > 0 } };
    },
    plinko(b) {
      const risk = PLINKO_MULTS[b.risk] ? b.risk : 'medium'; const path = []; let slot = 0;
      for (let i = 0; i < PLINKO_ROWS; i++) { const right = rnd() < 0.5 ? 1 : 0; path.push(right); slot += right; }
      const m = PLINKO_MULTS[risk][slot];
      return { multiplier: m, details: { risk, path, slot, multipliers: PLINKO_MULTS[risk], win: m >= 1 } };
    },
    crash(b) {
      const cashout = Number(b.cashout);
      if (!Number.isFinite(cashout) || cashout < 1.01 || cashout > 1000) throw err('Auto cash-out must be between 1.01x and 1000x');
      const crashAt = Math.max(1, Math.floor((0.99 / (1 - rnd())) * 100) / 100), win = crashAt >= cashout;
      return { multiplier: win ? round2(cashout) : 0, details: { crashAt: Math.min(crashAt, 10000), cashout: round2(cashout), win } };
    },
  };

  async function handle(path, body) {
    const users = load();
    const post = body !== undefined;
    if (path === '/games/config') return { minBet: MIN_BET, maxBet: MAX_BET, plinko: { rows: PLINKO_ROWS, multipliers: PLINKO_MULTS }, slots: SLOT_SYMBOLS.map(({ s, pay3 }) => ({ s, pay3 })) };
    if (path === '/signup' && post) {
      const { username, password } = body;
      if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) throw err('Username must be 3-20 letters, numbers or _');
      if (typeof password !== 'string' || password.length < 6 || password.length > 100) throw err('Password must be at least 6 characters');
      const key = username.toLowerCase();
      if (users[key]) throw err('Username taken on this device', 409);
      const salt = newSalt();
      const u = { id: Object.keys(users).length + 1, username, salt, hash: await hashPw(salt, password), balance: START_BALANCE, total_wagered: 0, created_at: Date.now(), bets: [], txns: [], bonusClaims: {} };
      addTxn(u, 'signup', START_BALANCE, 'Starting play credits');
      users[key] = u; save(users); localStorage.setItem(SESSION_KEY, key);
      return { user: publicUser(u) };
    }
    if (path === '/login' && post) {
      const key = String(body.username || '').toLowerCase(), u = users[key];
      if (!u || (await hashPw(u.salt, String(body.password || ''))) !== u.hash) throw err('Invalid username or password', 401);
      localStorage.setItem(SESSION_KEY, key); return { user: publicUser(u) };
    }
    if (path === '/logout') { localStorage.removeItem(SESSION_KEY); return { ok: true }; }

    const u = current(users);
    const done = (extra = {}) => { save(users); return { ...extra, user: publicUser(u) }; };
    if (path === '/me') return { user: publicUser(u) };
    if (path === '/deposit' && post) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw err('Invalid amount');
      const remaining = DAILY_DEPOSIT_LIMIT - depositedLast24h(u);
      if (amount > remaining) throw err(`Daily free top-up limit reached. You can add ${round2(Math.max(0, remaining))} more credits in the next 24h.`);
      u.balance = round2(u.balance + amount); addTxn(u, 'deposit', amount, 'Free play-credit top-up');
      return done();
    }
    if (path === '/withdraw' && post) {
      const amount = round2(Number(body.amount));
      if (!Number.isFinite(amount) || amount < 1) throw err('Minimum withdrawal is 1 credit');
      if (amount > u.balance) throw err('Amount is more than your balance');
      u.balance = round2(u.balance - amount);
      addTxn(u, 'withdrawal', -amount, 'Withdrawal (play credits)', 'Completed (demo)');
      return done();
    }
    if (path === '/bonuses') return { bonuses: bonusList(u) };
    let m = path.match(/^\/bonuses\/(\w+)\/claim$/);
    if (m && post) {
      const b = bonusList(u).find(x => x.id === m[1]);
      if (!b) throw err('Unknown bonus', 404);
      if (!b.available) throw err('Bonus not available yet');
      u.balance = round2(u.balance + b.amount); u.bonusClaims[b.id] = Date.now(); addTxn(u, 'bonus', b.amount, b.title);
      return done({ bonuses: bonusList(u) });
    }
    if (path === '/transactions') return { transactions: [...u.txns].reverse().slice(0, 200) };
    if (path === '/bets') return { bets: [...u.bets].reverse().slice(0, 200) };
    if (path === '/notifications') {
      const items = bonusList(u).filter(b => b.available).map(b => ({ text: `${b.title}: ${b.amount} play credits ready to claim` }));
      const v = vipInfo(u.total_wagered); if (v.next) items.push({ text: `Wager ${round2(v.nextAt - v.totalWagered)} more credits to reach ${v.next}` });
      return { notifications: items };
    }
    m = path.match(/^\/games\/(\w+)\/bet$/);
    if (m && post) {
      const game = m[1]; if (!GAMES[game]) throw err('Unknown game', 404);
      const amount = round2(Number(body.amount));
      if (!Number.isFinite(amount) || amount < MIN_BET) throw err(`Minimum bet is ${MIN_BET}`);
      if (amount > MAX_BET) throw err(`Maximum bet is ${MAX_BET}`);
      if (u.balance < amount) throw err('Insufficient balance');
      const o = GAMES[game](body), payout = round2(amount * o.multiplier), now = Date.now();
      u.balance = round2(u.balance - amount); u.total_wagered += amount;
      const betId = u.bets.length + 1;
      addTxn(u, 'bet', -amount, `${game} bet #${betId}`);
      u.bets.push({ id: betId, game, amount, multiplier: o.multiplier, payout, details: o.details, created_at: now });
      if (payout > 0) { u.balance = round2(u.balance + payout); addTxn(u, 'win', payout, `${game} payout ${o.multiplier}x`); }
      return done({ betId, payout, profit: round2(payout - amount), game, amount, multiplier: o.multiplier, details: o.details });
    }
    throw err('Not found', 404);
  }
  window.localApi = (path, body) => handle(path, body);
})();
