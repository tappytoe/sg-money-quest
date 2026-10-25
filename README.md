# Money Quest SG 🇸🇬💰

A fun, browser-based game that helps primary school students learn to use Singapore money: counting dollars and cents, paying for things, working out change, saving, and spending wisely.

## Game modes
- **Money Museum** – meet every note and coin, hear its name, and see other ways to make the same value.
- **Count the Cash** – add up a pile of notes and coins, with hints that show running totals.
- **Hawker Shopping** – pay for food and toys from your wallet, then work out your change.
- **Be the Cashier** – give customers the correct change, with bonus stars for using the fewest pieces.
- **Piggy Bank Planner** – save pocket money for 8 weeks to reach a goal while handling treats, needs and bonuses.
- **Needs or Wants?** – sort everyday items and learn why.

Three levels: Starter (P1–P2), Explorer (P3–P4) and Master (P5–P6, with harder sums and a timer).
Stars, badges and settings are saved in the browser's localStorage.

## Run locally
Open `index.html` in a browser, or run a local server:
```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Tests

Requires Node.js 20 or later:

```bash
node --check js/money.js
node --check js/game.js
node tests/money.test.js
```

## Deploy to GitHub Pages

The repository's GitHub Actions workflow generates the site, runs syntax checks and money-logic tests, and deploys the site to GitHub Pages on pushes to `main`. Enable GitHub Pages in the repository settings if it has not been enabled already.

## Notes

- All money is simulated play money; no real payments or financial accounts are involved.
- Progress is stored locally in the current browser and is not synced between devices.