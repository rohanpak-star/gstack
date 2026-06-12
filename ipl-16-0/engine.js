// 16-0 game engine: pool building, XI validation, team rating, match sim.
// Pure functions, no DOM — loaded by the browser (globals) and by bun tests (module).

(function (root, factory) {
  if (typeof module !== 'undefined') {
    const data = require('./data.js');
    module.exports = factory(data);
  } else {
    // data.js declares top-level consts, visible here as bare identifiers
    root.Engine = factory({ FRANCHISES, BOSS_TEAMS, PLAYERS, ERAS, DIFFICULTIES });
  }
})(typeof self !== 'undefined' ? self : this, function (data) {
  const { FRANCHISES, BOSS_TEAMS, PLAYERS } = data;

  const XI_SIZE = 11;
  const MAX_OVERSEAS = 4;
  const LEAGUE_MATCHES = 14;
  const TOTAL_MATCHES = 16; // 14-game league season + Qualifier 1 + Final

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gauss(rng) {
    // Box-Muller
    const u = Math.max(rng(), 1e-9);
    const v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Fisher-Yates, returns a new array. rng() must return [0, 1).
  function shuffle(arr, rng) {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function overall(p) {
    if (p.role === 'BOWL') return p.bowl;
    if (p.role === 'AR') {
      const hi = Math.max(p.bat, p.bowl);
      const lo = Math.min(p.bat, p.bowl);
      return Math.min(99, Math.round(hi * 0.7 + lo * 0.3) + 3);
    }
    return p.bat; // BAT, WK
  }

  function getPool(franchiseId, eraStart) {
    return PLAYERS
      .filter(p => p.teams.includes(franchiseId) && p.to >= eraStart)
      .map(p => ({ ...p, ovr: overall(p) }))
      .sort((a, b) => b.ovr - a.ovr);
  }

  // Legal XI from a pool, or null if impossible. Greedy seed, then hill-climb
  // single swaps to maximize team rating. Used for autofill and for deciding
  // whether a franchise is spinnable under an era filter.
  function autoXI(pool) {
    let xi = greedyXI(pool);
    if (!xi) return null;
    let best = teamStats(xi).rating;
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < xi.length; i++) {
        for (const p of pool) {
          if (xi.includes(p)) continue;
          const cand = xi.slice();
          cand[i] = p;
          if (validateXI(cand).length) continue;
          const r = teamStats(cand).rating;
          if (r > best + 1e-9) {
            xi = cand;
            best = r;
            improved = true;
          }
        }
      }
    }
    return xi;
  }

  function greedyXI(pool) {
    const sorted = [...pool].sort((a, b) => b.ovr - a.ovr);
    const wks = sorted.filter(p => p.role === 'WK');
    for (const wk of wks) {
      const xi = [wk];
      let os = wk.os;
      for (const p of sorted) {
        if (xi.length >= XI_SIZE) break;
        if (xi.includes(p)) continue;
        if (p.os && os >= MAX_OVERSEAS) continue;
        // keep room: remaining domestic players must be able to fill the XI
        const domLeft = sorted.filter(q => !q.os && !xi.includes(q) && q !== p).length;
        const slotsAfter = XI_SIZE - xi.length - 1;
        const osAfter = os + (p.os ? 1 : 0);
        if (slotsAfter > domLeft + (MAX_OVERSEAS - osAfter)) continue;
        xi.push(p);
        if (p.os) os++;
      }
      if (xi.length === XI_SIZE) return xi;
    }
    return null;
  }

  function validateXI(xi) {
    const errors = [];
    if (xi.length !== XI_SIZE) errors.push(`Need ${XI_SIZE} players (have ${xi.length})`);
    const os = xi.filter(p => p.os).length;
    if (os > MAX_OVERSEAS) errors.push(`Max ${MAX_OVERSEAS} overseas (have ${os})`);
    if (!xi.some(p => p.role === 'WK')) errors.push('Need a wicketkeeper');
    return errors;
  }

  function teamStats(xi) {
    const bats = xi.map(p => p.bat).sort((a, b) => b - a);
    const bowls = xi.map(p => p.bowl).sort((a, b) => b - a);
    let bat = avg(bats.slice(0, 7));
    let bowl = avg(bowls.slice(0, 5));
    const warnings = [];
    const bowlOptions = xi.filter(p => p.bowl >= 55).length;
    if (bowlOptions < 5) {
      bowl -= (5 - bowlOptions) * 7;
      warnings.push(`Only ${bowlOptions} real bowling options — bowling rating docked`);
    }
    const batDepth = xi.filter(p => p.bat >= 60).length;
    if (batDepth < 6) {
      bat -= (6 - batDepth) * 5;
      warnings.push(`Only ${batDepth} capable batters — batting rating docked`);
    }
    return {
      bat: Math.round(bat * 10) / 10,
      bowl: Math.round(bowl * 10) / 10,
      rating: Math.round(((bat + bowl) / 2) * 10) / 10,
      warnings,
    };
  }

  function avg(xs) {
    return xs.reduce((s, x) => s + x, 0) / xs.length;
  }

  function spinnableFranchises(eraStart) {
    return FRANCHISES.filter(f => f.to >= eraStart && autoXI(getPool(f.id, eraStart)) !== null);
  }

  // 16-match "perfect season": 14 league fixtures drawn from the 17
  // franchises (3 sit out each run — that's where the replay variety comes
  // from), each home or away, then Qualifier 1 and the Final against the two
  // boss teams. Drawing your own franchise gives a "ghost" mirror match
  // against its all-time XI.
  function buildSchedule(yourFranchiseId, rng) {
    const pool = shuffle(FRANCHISES, rng);
    const league = pool.slice(0, LEAGUE_MATCHES).map(t => ({
      opp: t,
      leg: rng() < 0.5 ? 'home' : 'away',
      mirror: t.id === yourFranchiseId,
      stage: 'League',
    }));
    const playoffs = BOSS_TEAMS.map((t, i) => ({
      opp: t,
      leg: 'neutral',
      mirror: false,
      stage: i === 0 ? 'Qualifier 1' : 'Final',
    }));
    return [...league, ...playoffs];
  }

  function simMatch(stats, game, diffMult, rng) {
    // -2 is the "it's your story" edge; keeps weak-franchise runs alive without
    // making boss games free. Slope 1.2 so one bad day stays survivable.
    const opp = game.opp.strength * diffMult - 2 + (game.mirror ? 2 : 0);
    const yourScore = Math.round(166 + 1.2 * (stats.bat - opp) + gauss(rng) * 14);
    const oppScore = Math.round(166 + 1.2 * (opp - stats.bowl) + gauss(rng) * 14);
    const you = clamp(yourScore, 60, 280);
    const them = clamp(oppScore, 60, 280);
    let win;
    if (you === them) win = rng() < 0.5; // super over
    else win = you > them;
    const superOver = you === them;
    return {
      win,
      superOver,
      yourScore: you,
      oppScore: them,
      yourWkts: 3 + Math.floor(rng() * 7),
      oppWkts: 3 + Math.floor(rng() * 7),
      margin: Math.abs(you - them),
    };
  }

  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  function potm(xi, result, rng) {
    // weighted pick: batters more likely after big totals, bowlers after low-scoring defenses
    const battingGame = result.yourScore >= 180;
    const weights = xi.map(p => Math.max(battingGame ? p.bat : p.bowl, 41) - 40);
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rng() * total;
    for (let i = 0; i < xi.length; i++) {
      r -= weights[i];
      if (r <= 0) return xi[i];
    }
    return xi[0];
  }

  return {
    XI_SIZE, MAX_OVERSEAS, LEAGUE_MATCHES, TOTAL_MATCHES,
    mulberry32, shuffle, overall, getPool, autoXI, validateXI, teamStats,
    spinnableFranchises, buildSchedule, simMatch, potm,
  };
});
