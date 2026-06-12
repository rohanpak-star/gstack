# 16–0 · The IPL Perfect Season

Draft your XI from a randomly-spun IPL franchise, then play a **perfect IPL
season**: 14 league fixtures drawn from the 17 franchises in IPL history
(including Deccan Chargers, Kochi Tuskers Kerala and Pune Warriors — 3 sit out
each run), Qualifier 1, and the Final against an all-star boss team. That's 16
matches. Lose one and your season is over.

Inspired by [16-0game.vercel.app](https://16-0game.vercel.app).

## Run it

It's a static site — no build step, no dependencies:

```bash
cd ipl-16-0
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
- **Sim** 16 matches: 14 league fixtures (random home/away draw against 14 of the
  17 franchises — if your own franchise is drawn, it's a "ghost" match against
  its all-time XI, +2 buff to them), then Qualifier 1 and the Final against the
  two boss teams.
- **Difficulty**: Easy (3 re-spins, softer opponents) / Normal (1) / Hard (0,
  juiced opponents). **Blind draft** hides all ratings.
- **Share your run**: every result gets a Wordle-style W/L grid and a seed code
  (`?seed=XXXX`) that reproduces the same spin + schedule.

With a perfectly drafted all-time Mumbai Indians XI, a 16–0 run is about a 1-in-3
shot on Normal. Most franchises are far worse. That's the point.

## Files

- `data.js` — 17 franchises, 2 boss teams, ~190 players with ratings (vibes-based, fight me)
- `engine.js` — pure game logic: pools, XI validation, team rating, match sim (shared browser/bun)
- `app.js` — UI controller
- `engine.test.js` — free offline sanity tests (`bun test ipl-16-0/engine.test.js`)
