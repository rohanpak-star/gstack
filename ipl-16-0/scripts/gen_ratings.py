#!/usr/bin/env python3
"""
Cricsheet ball-by-ball -> era-adjusted 1-99 ratings for ipl-16-0/data.js.

Usage:
    1. Download the IPL ball-by-ball JSON zip from https://cricsheet.org/downloads/
       (file is "ipl_json.zip") and unzip it into a folder, e.g. ./cricsheet_ipl/
       Each match becomes a file like "335982.json".
    2. python3 ipl-16-0/scripts/gen_ratings.py ./cricsheet_ipl/

Output is a report, NOT a direct rewrite of data.js:
  - PLAYER RATINGS: name -> {bat, bowl} computed from career-wide,
    era-indexed, shrunk, z-mapped stats (methodology steps 1-4).
  - STINT RATINGS: name -> {team_id: {from, to, bat, bowl}} using each
    player's existing stint windows from data.js, shrunk toward their
    career score (step 5). data.js doesn't store per-stint ratings yet --
    this is informational, for a future schema bump.
  - FRANCHISE STRENGTH: franchise id -> suggested `strength` from Elo
    (step 6).
  - MISSING PLAYERS: names that appear in Cricsheet with >= MIN_BALLS but
    aren't in data.js at all (candidates for #12).

Review the report and hand-merge into data.js -- role, overseas flag, and
from/to/teams are NOT inferred here (Cricsheet has no clean "role" field).
"""

import sys
import os
import json
import subprocess
import statistics
from collections import defaultdict

DATA_JS = os.path.join(os.path.dirname(__file__), '..', 'data.js')


def load_data_js():
    """data.js is a CommonJS module (UMD); shell out to node to get
    PLAYERS/FRANCHISES as JSON since Python can't import .js directly."""
    js = f"const d = require('{DATA_JS}'); console.log(JSON.stringify({{PLAYERS: d.PLAYERS, FRANCHISES: d.FRANCHISES}}));"
    out = subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

MIN_BALLS = 250          # qualification threshold for the z-score pool
SHRINK_K_BAT = 250        # Bayesian shrinkage constant, batting (balls faced)
SHRINK_K_BOWL = 300       # Bayesian shrinkage constant, bowling (balls bowled)
SHRINK_K_STINT = 150       # stint -> career shrinkage constant

# Cricsheet team names (across all the renames/rebrands) -> our franchise ids.
TEAM_ALIASES = {
    'Chennai Super Kings': 'csk',
    'Mumbai Indians': 'mi',
    'Kolkata Knight Riders': 'kkr',
    'Gujarat Titans': 'gt',
    'Royal Challengers Bangalore': 'rcb',
    'Royal Challengers Bengaluru': 'rcb',
    'Sunrisers Hyderabad': 'srh',
    'Rajasthan Royals': 'rr',
    'Delhi Capitals': 'dcap',
    'Lucknow Super Giants': 'lsg',
    'Punjab Kings': 'pbks',
    'Kings XI Punjab': 'kxip',
    'Delhi Daredevils': 'dd',
    'Rising Pune Supergiant': 'rps',
    'Rising Pune Supergiants': 'rps',
    'Deccan Chargers': 'dch',
    'Gujarat Lions': 'gl',
    'Pune Warriors': 'pwi',
    'Pune Warriors India': 'pwi',
    'Kochi Tuskers Kerala': 'ktk',
}


def normalize_season(season_str):
    """'2020/21' -> 2020, '2009' -> 2009."""
    return int(str(season_str)[:4])


def is_legal(delivery):
    extras = delivery.get('extras', {})
    return 'wides' not in extras and 'noballs' not in extras


def bowler_runs(delivery):
    total = delivery['runs']['total']
    extras = delivery.get('runs', {}).get('extras', 0)
    by_legbye = delivery.get('extras', {}).get('byes', 0) + delivery.get('extras', {}).get('legbyes', 0)
    return total - by_legbye


def wicket_credit(wicket):
    return wicket.get('kind') not in ('run out', 'retired hurt', 'retired not out', 'obstructing the field', 'timed out')


def process_dir(path):
    """Returns per-(player, season, team) batting and bowling stat dicts,
    plus chronological match list for Elo."""
    bat = defaultdict(lambda: {'runs': 0, 'balls': 0, 'outs': 0})
    bowl = defaultdict(lambda: {'runs': 0, 'balls': 0, 'wkts': 0})
    matches = []

    for fname in sorted(os.listdir(path)):
        if not fname.endswith('.json'):
            continue
        with open(os.path.join(path, fname)) as f:
            m = json.load(f)
        info = m.get('info', {})
        if 'season' not in info or 'teams' not in info:
            continue
        season = normalize_season(info['season'])
        teams = info['teams']
        outcome = info.get('outcome', {})
        winner = outcome.get('winner')
        matches.append({'date': info.get('dates', [''])[0], 'teams': teams, 'winner': winner})

        for inning in m.get('innings', []):
            batting_team = inning['team']
            bowling_team = next((t for t in teams if t != batting_team), None)
            for over in inning.get('overs', []):
                for d in over.get('deliveries', []):
                    batter = d['batter']
                    bowler = d['bowler']
                    legal = is_legal(d)

                    bk = (batter, season, batting_team)
                    bat[bk]['runs'] += d['runs']['batter']
                    if legal:
                        bat[bk]['balls'] += 1

                    wk = (bowler, season, bowling_team)
                    bowl[wk]['runs'] += bowler_runs(d)
                    if legal:
                        bowl[wk]['balls'] += 1

                    for w in d.get('wickets', []):
                        out_bk = (w['player_out'], season, batting_team)
                        bat[out_bk]['outs'] += 1
                        if wicket_credit(w):
                            bowl[wk]['wkts'] += 1

    return bat, bowl, matches


def league_season_baselines(bat, bowl):
    """season -> {sr, avg, econ, bpw} league-wide averages."""
    seasons = defaultdict(lambda: {'runs': 0, 'balls': 0, 'outs': 0, 'wkts': 0})
    for (_, season, _), s in bat.items():
        seasons[season]['runs'] += s['runs']
        seasons[season]['balls'] += s['balls']
        seasons[season]['outs'] += s['outs']
    for (_, season, _), s in bowl.items():
        seasons[season]['wkts'] += s['wkts']

    out = {}
    for season, s in seasons.items():
        sr = 100 * s['runs'] / s['balls'] if s['balls'] else 0
        avg = s['runs'] / s['outs'] if s['outs'] else s['runs']
        econ = 6 * s['runs'] / s['balls'] if s['balls'] else 0
        bpw = s['balls'] / s['wkts'] if s['wkts'] else s['balls']
        out[season] = {'sr': sr, 'avg': avg, 'econ': econ, 'bpw': bpw}
    return out


def career_indexed(bat, bowl, baselines):
    """Aggregate per-player career batting/bowling composite (steps 1-2),
    keyed by player name. Also returns per (player, team) splits for the
    per-stint pass."""
    bat_career = defaultdict(lambda: {'runs': 0, 'balls': 0, 'outs': 0, 'srplus_w': 0, 'avgplus_w': 0})
    bowl_career = defaultdict(lambda: {'runs': 0, 'balls': 0, 'wkts': 0, 'econplus_w': 0, 'wktplus_w': 0})
    bat_by_team = defaultdict(lambda: defaultdict(lambda: {'runs': 0, 'balls': 0, 'outs': 0, 'srplus_w': 0, 'avgplus_w': 0}))
    bowl_by_team = defaultdict(lambda: defaultdict(lambda: {'runs': 0, 'balls': 0, 'wkts': 0, 'econplus_w': 0, 'wktplus_w': 0}))

    for (name, season, team), s in bat.items():
        if s['balls'] == 0:
            continue
        bl = baselines[season]
        sr = 100 * s['runs'] / s['balls']
        avg = s['runs'] / s['outs'] if s['outs'] else s['runs']
        srplus = 100 * sr / bl['sr'] if bl['sr'] else 100
        avgplus = 100 * avg / bl['avg'] if bl['avg'] else 100
        c = bat_career[name]
        c['runs'] += s['runs']; c['balls'] += s['balls']; c['outs'] += s['outs']
        c['srplus_w'] += srplus * s['balls']
        c['avgplus_w'] += avgplus * s['balls']
        team_id = TEAM_ALIASES.get(team)
        if team_id:
            t = bat_by_team[name][team_id]
            t['runs'] += s['runs']; t['balls'] += s['balls']; t['outs'] += s['outs']
            t['srplus_w'] += srplus * s['balls']
            t['avgplus_w'] += avgplus * s['balls']

    for (name, season, team), s in bowl.items():
        if s['balls'] == 0:
            continue
        bl = baselines[season]
        econ = 6 * s['runs'] / s['balls']
        bpw = s['balls'] / s['wkts'] if s['wkts'] else s['balls']
        econplus = 100 * bl['econ'] / econ if econ else 100
        wktplus = 100 * bl['bpw'] / bpw if bpw else 100
        c = bowl_career[name]
        c['runs'] += s['runs']; c['balls'] += s['balls']; c['wkts'] += s['wkts']
        c['econplus_w'] += econplus * s['balls']
        c['wktplus_w'] += wktplus * s['balls']
        team_id = TEAM_ALIASES.get(team)
        if team_id:
            t = bowl_by_team[name][team_id]
            t['runs'] += s['runs']; t['balls'] += s['balls']; t['wkts'] += s['wkts']
            t['econplus_w'] += econplus * s['balls']
            t['wktplus_w'] += wktplus * s['balls']

    return bat_career, bowl_career, bat_by_team, bowl_by_team


def composite_bat(c):
    if c['balls'] == 0:
        return None
    srplus = c['srplus_w'] / c['balls']
    avgplus = c['avgplus_w'] / c['balls']
    return 0.65 * srplus + 0.35 * avgplus


def composite_bowl(c):
    if c['balls'] == 0:
        return None
    econplus = c['econplus_w'] / c['balls']
    wktplus = c['wktplus_w'] / c['balls']
    return 0.60 * econplus + 0.40 * wktplus


def shrink(score, n, k):
    """Bayesian shrinkage toward the league-neutral 100."""
    return (n * score + k * 100) / (n + k)


def shrink_to(score, n, k, target):
    return (n * score + k * target) / (n + k)


def score_to_rating(score, mean, stdev):
    z = (score - mean) / stdev
    return max(30, min(99, round(72 + 10 * z)))


def zmap(values_by_name, balls_by_name, min_balls, k):
    """Shrink each player's composite toward 100, z-score across the
    qualified pool, map to 72 + 10z clipped to [30, 99]. Returns the
    ratings plus (mean, stdev) so other composites can be mapped onto the
    same scale (e.g. per-stint composites)."""
    shrunk = {}
    for name, score in values_by_name.items():
        n = balls_by_name[name]
        shrunk[name] = shrink(score, n, k)

    qualified = [shrunk[name] for name, n in balls_by_name.items() if n >= min_balls]
    mean = statistics.mean(qualified)
    stdev = statistics.pstdev(qualified) or 1

    ratings = {name: score_to_rating(score, mean, stdev) for name, score in shrunk.items()}
    return ratings, mean, stdev


def run_elo(matches):
    """k=20, start 1500. Returns franchise_id -> {season: avg_elo}."""
    elo = defaultdict(lambda: 1500.0)
    season_sum = defaultdict(lambda: defaultdict(lambda: [0.0, 0]))  # team -> season -> [sum, count]

    for m in matches:
        teams = [TEAM_ALIASES.get(t) for t in m['teams']]
        if None in teams or not m['winner']:
            continue
        a, b = teams
        winner = TEAM_ALIASES.get(m['winner'])
        if winner not in (a, b):
            continue
        season = normalize_season(m.get('date', '2008')[:4]) if m.get('date') else None
        ea = 1 / (1 + 10 ** ((elo[b] - elo[a]) / 400))
        sa = 1 if winner == a else 0
        delta = 20 * (sa - ea)
        elo[a] += delta
        elo[b] -= delta
        if season:
            for t in (a, b):
                rec = season_sum[t][season]
                rec[0] += elo[t]; rec[1] += 1
    return season_sum


def franchise_strength(season_sum):
    out = {}
    for fid, seasons in season_sum.items():
        peak = max((s / c for s, c in seasons.values() if c), default=1500)
        strength = round((peak - 1500) / 12 + 77)
        out[fid] = max(68, min(84, strength))
    return out


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1]

    print(f'Loading matches from {path} ...', file=sys.stderr)
    bat, bowl, matches = process_dir(path)
    baselines = league_season_baselines(bat, bowl)
    bat_career, bowl_career, bat_by_team, bowl_by_team = career_indexed(bat, bowl, baselines)

    bat_scores = {n: composite_bat(c) for n, c in bat_career.items()}
    bat_scores = {n: s for n, s in bat_scores.items() if s is not None}
    bat_balls = {n: c['balls'] for n, c in bat_career.items()}
    bat_ratings, bat_mean, bat_stdev = zmap(bat_scores, bat_balls, MIN_BALLS, SHRINK_K_BAT)

    bowl_scores = {n: composite_bowl(c) for n, c in bowl_career.items()}
    bowl_scores = {n: s for n, s in bowl_scores.items() if s is not None}
    bowl_balls = {n: c['balls'] for n, c in bowl_career.items()}
    bowl_ratings, bowl_mean, bowl_stdev = zmap(bowl_scores, bowl_balls, MIN_BALLS, SHRINK_K_BOWL)

    # --- existing data.js for name/team/stint cross-reference ---
    data = load_data_js()
    PLAYERS, FRANCHISES = data['PLAYERS'], data['FRANCHISES']
    known_names = {p['name'] for p in PLAYERS}

    print('=== PLAYER RATINGS (career, era-indexed, shrunk, z-mapped) ===')
    for p in PLAYERS:
        new_bat = bat_ratings.get(p['name'])
        new_bowl = bowl_ratings.get(p['name'])
        if new_bat is None and new_bowl is None:
            continue
        print(f"{p['name']}: bat {p['bat']} -> {new_bat if new_bat is not None else '(no data)'}, "
              f"bowl {p['bowl']} -> {new_bowl if new_bowl is not None else '(no data)'}")

    print('\n=== STINT RATINGS (per-team, shrunk toward career) ===')
    for p in PLAYERS:
        career_bat_raw = bat_scores.get(p['name'])
        career_bowl_raw = bowl_scores.get(p['name'])
        for stint in p['teams']:
            tid = stint['id']
            bc = bat_by_team.get(p['name'], {}).get(tid)
            bw = bowl_by_team.get(p['name'], {}).get(tid)
            parts = []
            if bc and bc['balls'] and career_bat_raw is not None:
                stint_raw = composite_bat(bc)
                shrunk = shrink_to(stint_raw, bc['balls'], SHRINK_K_STINT, career_bat_raw)
                parts.append(f"bat~{score_to_rating(shrunk, bat_mean, bat_stdev)}")
            if bw and bw['balls'] and career_bowl_raw is not None:
                stint_raw = composite_bowl(bw)
                shrunk = shrink_to(stint_raw, bw['balls'], SHRINK_K_STINT, career_bowl_raw)
                parts.append(f"bowl~{score_to_rating(shrunk, bowl_mean, bowl_stdev)}")
            if parts:
                print(f"{p['name']} @ {tid} ({stint['from']}-{stint['to']}): {', '.join(parts)}")

    print('\n=== FRANCHISE STRENGTH (from Elo) ===')
    season_sum = run_elo(matches)
    strengths = franchise_strength(season_sum)
    for f in FRANCHISES:
        new = strengths.get(f['id'])
        if new is not None:
            print(f"{f['id']}: strength {f['strength']} -> {new}")

    print(f'\n=== MISSING PLAYERS (>= {MIN_BALLS} balls, not in data.js) ===')
    all_names = set(bat_balls) | set(bowl_balls)
    for name in sorted(all_names):
        if name in known_names:
            continue
        balls = bat_balls.get(name, 0) + bowl_balls.get(name, 0)
        if balls >= MIN_BALLS:
            print(f"{name}: {balls} balls "
                  f"(bat {bat_ratings.get(name, '-')}, bowl {bowl_ratings.get(name, '-')})")


if __name__ == '__main__':
    main()
