// Free, offline sanity tests for the 16-0 sim engine + dataset.
import { describe, test, expect } from 'bun:test';

const Engine = require('./engine.js');
const { FRANCHISES, BOSS_TEAMS, PLAYERS, ERAS } = require('./data.js');

const franchiseIds = new Set(FRANCHISES.map(f => f.id));

describe('dataset integrity', () => {
  test('every player references real franchises only', () => {
    for (const p of PLAYERS) {
      expect(p.teams.length).toBeGreaterThan(0);
      for (const t of p.teams) {
        expect(franchiseIds.has(t.id)).toBe(true);
      }
    }
  });

  test('player stints are chronological, non-overlapping, and within career span', () => {
    for (const p of PLAYERS) {
      for (const t of p.teams) {
        expect(t.to).toBeGreaterThanOrEqual(t.from);
        expect(t.from).toBeGreaterThanOrEqual(p.from);
        expect(t.to).toBeLessThanOrEqual(p.to);
      }
      for (let i = 1; i < p.teams.length; i++) {
        expect(p.teams[i].from).toBeGreaterThan(p.teams[i - 1].to);
      }
    }
  });

  test('no duplicate player names', () => {
    const names = PLAYERS.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test('ratings and spans are sane', () => {
    for (const p of PLAYERS) {
      expect(p.bat).toBeGreaterThanOrEqual(0);
      expect(p.bat).toBeLessThanOrEqual(99);
      expect(p.bowl).toBeGreaterThanOrEqual(0);
      expect(p.bowl).toBeLessThanOrEqual(99);
      expect(p.from).toBeGreaterThanOrEqual(2008);
      expect(p.to).toBeGreaterThanOrEqual(p.from);
      expect(['WK', 'BAT', 'AR', 'BOWL']).toContain(p.role);
    }
  });

  test("player stints overlap each franchise's lifespan", () => {
    for (const p of PLAYERS) {
      for (const t of p.teams) {
        const f = FRANCHISES.find(x => x.id === t.id);
        expect(t.from <= f.to && t.to >= f.from).toBe(true);
      }
    }
  });
});

describe('spinnable pools', () => {
  for (const era of ERAS) {
    test(`era ${era.label}: every spinnable franchise can field a legal XI`, () => {
      const spinnable = Engine.spinnableFranchises(era.start);
      expect(spinnable.length).toBeGreaterThanOrEqual(8);
      for (const f of spinnable) {
        const xi = Engine.autoXI(Engine.getPool(f.id, era.start));
        expect(xi).not.toBeNull();
        expect(Engine.validateXI(xi)).toEqual([]);
      }
    });
  }

  test('defunct franchises are excluded in 2020+ era', () => {
    const ids = Engine.spinnableFranchises(2020).map(f => f.id);
    expect(ids).not.toContain('ktk');
    expect(ids).not.toContain('dch');
    expect(ids).not.toContain('dd');
  });

  test('all 17 franchises spinnable all-time', () => {
    expect(Engine.spinnableFranchises(2008).length).toBe(17);
  });
});

describe('schedule', () => {
  test('16 matches: 14 distinct league fixtures + Qualifier 1 + Final', () => {
    const rng = Engine.mulberry32(42);
    const sched = Engine.buildSchedule('csk', rng);
    expect(sched.length).toBe(16);

    const league = sched.slice(0, 14);
    const playoffs = sched.slice(14);

    const ids = league.map(g => g.opp.id);
    expect(new Set(ids).size).toBe(14); // no repeats, 3 franchises sit out
    for (const g of league) {
      expect(g.opp.boss).toBeFalsy();
      expect(['home', 'away']).toContain(g.leg);
      expect(g.stage).toBe('League');
    }

    expect(playoffs.map(g => g.opp.id)).toEqual(BOSS_TEAMS.map(t => t.id));
    expect(playoffs[0].stage).toBe('Qualifier 1');
    expect(playoffs[1].stage).toBe('Final');
  });

  test('fixed seed reproduces an exact schedule (locks in shuffle determinism for ?seed=)', () => {
    const sched = Engine.buildSchedule('csk', Engine.mulberry32(42));
    expect(sched.map(g => [g.opp.id, g.leg, g.stage, g.mirror])).toEqual([
      ['gl', 'away', 'League', false],
      ['rcb', 'away', 'League', false],
      ['csk', 'home', 'League', true],
      ['dch', 'home', 'League', false],
      ['lsg', 'away', 'League', false],
      ['srh', 'home', 'League', false],
      ['mi', 'away', 'League', false],
      ['ktk', 'home', 'League', false],
      ['pwi', 'home', 'League', false],
      ['dd', 'home', 'League', false],
      ['gt', 'home', 'League', false],
      ['rr', 'away', 'League', false],
      ['kkr', 'away', 'League', false],
      ['pbks', 'home', 'League', false],
      ['legends', 'neutral', 'Qualifier 1', false],
      ['world', 'neutral', 'Final', false],
    ]);
  });

  test('drawing your own franchise creates a mirror match', () => {
    // try seeds until csk lands in the 14 league fixtures
    for (let seed = 0; seed < 50; seed++) {
      const sched = Engine.buildSchedule('csk', Engine.mulberry32(seed));
      const mine = sched.slice(0, 14).find(g => g.opp.id === 'csk');
      if (mine) {
        expect(mine.mirror).toBe(true);
        expect(sched.filter(g => g.mirror).length).toBe(1);
        return;
      }
    }
    throw new Error('csk never appeared in 50 schedules — RNG distribution looks broken');
  });
});

describe('sim balance', () => {
  function winRate(rating, oppStrength, mult, n = 4000) {
    const rng = Engine.mulberry32(7);
    const stats = { bat: rating, bowl: rating, rating };
    const game = { opp: { strength: oppStrength }, mirror: false };
    let w = 0;
    for (let i = 0; i < n; i++) {
      if (Engine.simMatch(stats, game, mult, rng).win) w++;
    }
    return w / n;
  }

  test('elite team beats mid-table opponents almost always on normal', () => {
    expect(winRate(90, 75, 1.0)).toBeGreaterThan(0.97);
  });

  test('boss games are tense but winnable for elite teams', () => {
    const r = winRate(90, 85, 1.0);
    expect(r).toBeGreaterThan(0.65);
    expect(r).toBeLessThan(0.95);
  });

  test('weak XIs cannot cruise past boss teams', () => {
    expect(winRate(78, 85, 1.0)).toBeLessThan(0.5);
  });

  test('full 16-0 run is rare but achievable for a maxed-out draft', () => {
    const rng = Engine.mulberry32(123);
    let perfect = 0;
    const runs = 2000;
    const xi = Engine.autoXI(Engine.getPool('mi', 2008));
    const stats = Engine.teamStats(xi);
    for (let i = 0; i < runs; i++) {
      const sched = Engine.buildSchedule('mi', rng);
      let alive = true;
      for (const g of sched) {
        if (!Engine.simMatch(stats, g, 1.0, rng).win) { alive = false; break; }
      }
      if (alive) perfect++;
    }
    const rate = perfect / runs;
    expect(rate).toBeGreaterThan(0.05);
    expect(rate).toBeLessThan(0.7);
  });
});

describe('team rating', () => {
  test('best MI draft rates in the high 80s', () => {
    const xi = Engine.autoXI(Engine.getPool('mi', 2008));
    const s = Engine.teamStats(xi);
    expect(s.rating).toBeGreaterThan(82);
    expect(s.rating).toBeLessThan(95);
  });

  test('Kochi Tuskers draft is properly painful', () => {
    const mi = Engine.teamStats(Engine.autoXI(Engine.getPool('mi', 2008)));
    const ktk = Engine.teamStats(Engine.autoXI(Engine.getPool('ktk', 2008)));
    expect(ktk.rating).toBeLessThan(mi.rating - 4);
  });

  test('overseas-stacked XI is rejected', () => {
    const pool = Engine.getPool('rcb', 2008);
    const os = pool.filter(p => p.os).slice(0, 5);
    const ind = pool.filter(p => !p.os).slice(0, 6);
    const errors = Engine.validateXI([...os, ...ind]);
    expect(errors.some(e => e.includes('overseas'))).toBe(true);
  });
});
