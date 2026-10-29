# Mattdlvx — static play-money casino demo

A fully static (HTML/CSS/JS, no server) demo of the Mattdlvx casino dashboard. **Play credits only — no real money, no payments, no payouts. Credits have no cash value.**

- Sign up / log in / log out stored in this browser's `localStorage`. Passwords are salted and hashed with SHA-256 (Web Crypto) client-side — fine for a demo, **not** real security. Accounts don't sync between devices or browsers.
- Dashboard: big play-credit balance, new accounts start with 500,000 play credits (CRD), Deposit (free credits, 250,000 per 24h), Withdraw (removes play credits only and logs "Withdrawal (play credits) — Completed (demo)"; never asks for payment details), VIP Loyalty card (tier by total wagered), Bonuses (welcome 125,000 once, daily 25,000), games carousel, notifications.
- Games run in the browser with `crypto.getRandomValues`: Plinko (12 rows, low/medium/high risk), Slots (3 reels), Dice (over/under), Crash (auto cash-out). Min bet 1, max 250,000, can't exceed balance.
- History (bets + transactions) and Profile pages; everything persists per user in localStorage.

## Run locally
Any static server, e.g. `python3 -m http.server 8080` then open http://localhost:8080 (Web Crypto needs http(s)/localhost, not `file://`).

Hosted free on GitHub Pages.
