# 38–0 · The IPL Perfect Season

Draft your XI from a randomly-spun IPL franchise, then face **every franchise in
IPL history — all 17 of them, including Deccan Chargers, Kochi Tuskers Kerala and
Pune Warriors — home and away**, plus two all-star boss teams. That's 38 matches.
Lose one and your season is over.

Inspired by [16-0game.vercel.app](https://16-0game.vercel.app).

## Run it

It's a static site — no build step, no dependencies:

```bash
cd ipl-38-0
python3 -m http.server 8338   # or: bunx serve
# open http://localhost:8338
```

(Opening `index.html` directly via `file://` also works.)

## How it works

- **Spin** assigns you one of 17 franchises. Your draft pool is every player in
  the database who ever played for that franchise (filtered by your chosen era).
  Spin Kochi Tuskers and weep — or burn a re-spin.
- **Draft** 11 players: max 4 overseas, at least 1 wicketkeeper. Too few bowling
  options or batting depth docks your team rating.
- **Sim** 38 matches. Two of them are against your own franchise's All-Time XI
  (your ghosts get a +2 buff). The finale is always a boss team.
- **Difficulty**: Easy (3 re-spins, softer opponents) / Normal (1) / Hard (0,
  juiced opponents). **Blind draft** hides all ratings.

With a perfectly drafted all-time Mumbai Indians XI, a 38–0 run is about a 1-in-3
shot on Normal. Most franchises are far worse. That's the point.

## Files

- `data.js` — 17 franchises, 2 boss teams, ~190 players with ratings (vibes-based, fight me)
- `engine.js` — pure game logic: pools, XI validation, team rating, match sim (shared browser/bun)
- `app.js` — UI controller
- `engine.test.js` — free offline sanity tests (`bun test ipl-38-0/engine.test.js`)
