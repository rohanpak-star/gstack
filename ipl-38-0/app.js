// 38-0 UI controller. All game logic lives in engine.js.
/* global Engine, FRANCHISES, BOSS_TEAMS, ERAS, DIFFICULTIES */

const G = {
  difficulty: DIFFICULTIES[1],
  era: ERAS[0],
  blind: false,
  respinsLeft: 0,
  franchise: null,
  pool: [],
  xi: [],
  stats: null,
  schedule: [],
  results: [],
  played: 0,
  wins: 0,
  alive: true,
  seed: null,
  rng: null,
};

const $ = id => document.getElementById(id);

function seedFromCode(code) {
  const n = parseInt(code, 36);
  return Number.isFinite(n) && n > 0 ? n >>> 0 : null;
}

function seedToCode(seed) {
  return seed.toString(36).toUpperCase();
}

function pickStartSeed() {
  const url = new URL(location.href);
  const fromUrl = seedFromCode(url.searchParams.get('seed') || '');
  return fromUrl || ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
}

function showScreen(name) {
  for (const s of document.querySelectorAll('.screen')) s.classList.add('hidden');
  $('screen-' + name).classList.remove('hidden');
}

// ---------- config ----------
function renderConfig() {
  const dRow = $('opt-difficulty');
  dRow.innerHTML = '';
  for (const d of DIFFICULTIES) {
    const b = document.createElement('button');
    b.className = 'opt' + (G.difficulty.id === d.id ? ' active' : '');
    b.innerHTML = `${d.label}<small>${d.blurb}</small>`;
    b.onclick = () => { G.difficulty = d; renderConfig(); };
    dRow.appendChild(b);
  }
  const eRow = $('opt-era');
  eRow.innerHTML = '';
  for (const e of ERAS) {
    const b = document.createElement('button');
    b.className = 'opt' + (G.era.id === e.id ? ' active' : '');
    b.textContent = e.label;
    b.onclick = () => { G.era = e; renderConfig(); };
    eRow.appendChild(b);
  }
  const bRow = $('opt-blind');
  bRow.innerHTML = '';
  for (const [val, label, sub] of [[false, 'Show ratings', 'see overalls while drafting'], [true, 'Blind draft', 'trust your gut']]) {
    const b = document.createElement('button');
    b.className = 'opt' + (G.blind === val ? ' active' : '');
    b.innerHTML = `${label}<small>${sub}</small>`;
    b.onclick = () => { G.blind = val; renderConfig(); };
    bRow.appendChild(b);
  }
  renderLeaderboard();
}

// ---------- spin ----------
function spin() {
  const options = Engine.spinnableFranchises(G.era.start);
  const pick = options[Math.floor(G.rng() * options.length)];
  G.franchise = pick;
  G.pool = Engine.getPool(pick.id, G.era.start);

  const wheel = $('spin-wheel');
  const reel = [...options].sort(() => G.rng() - 0.5);
  let i = 0;
  wheel.style.background = '';
  const iv = setInterval(() => {
    const f = reel[i % reel.length];
    wheel.textContent = f.short;
    wheel.style.background = f.color;
    wheel.style.color = f.text;
    i++;
  }, 90);
  setTimeout(() => {
    clearInterval(iv);
    wheel.textContent = pick.short;
    wheel.style.background = pick.color;
    wheel.style.color = pick.text;
    $('spin-result').innerHTML =
      `<div class="f-name">${pick.name}</div>
       <div class="f-meta">${pick.from}–${Math.min(pick.to, 2026)} · ${G.pool.length} players in your draft pool</div>`;
    $('btn-to-draft').disabled = false;
  }, 1400);

  $('btn-to-draft').disabled = true;
  $('btn-respin').textContent = `Re-spin (${G.respinsLeft} left)`;
  $('btn-respin').disabled = G.respinsLeft <= 0;
  showScreen('spin');
}

// ---------- draft ----------
function renderDraft() {
  $('draft-title').textContent = `${G.franchise.name} draft pool · ${G.era.label}`;
  const grid = $('draft-pool');
  grid.innerHTML = '';
  for (const p of G.pool) {
    const card = document.createElement('div');
    card.className = 'pcard' + (G.xi.includes(p) ? ' picked' : '');
    const teams = p.teams.length > 1 ? ` · ${p.teams.length} teams` : '';
    card.innerHTML =
      `${G.blind ? '' : `<span class="p-ovr">${p.ovr}</span>`}
       <div class="p-name">${p.name}</div>
       <div class="p-meta">
         <span class="chip role-${p.role}">${p.role}</span>${p.os ? '<span class="chip os">OS</span>' : ''}
         ${p.from}–${p.to}${teams}
       </div>`;
    card.onclick = () => { pickPlayer(p); };
    grid.appendChild(card);
  }
  renderXI();
}

function pickPlayer(p) {
  if (G.xi.includes(p) || G.xi.length >= Engine.XI_SIZE) return;
  if (p.os && G.xi.filter(q => q.os).length >= Engine.MAX_OVERSEAS) {
    flashErrors(['Overseas slots full (4)']);
    return;
  }
  G.xi.push(p);
  renderDraft();
}

function dropPlayer(p) {
  G.xi = G.xi.filter(q => q !== p);
  renderDraft();
}

function renderXI() {
  $('xi-count').textContent = `(${G.xi.length}/${Engine.XI_SIZE})`;
  const box = $('draft-xi');
  box.innerHTML = '';
  for (const p of G.xi) {
    const row = document.createElement('div');
    row.className = 'xi-row';
    row.innerHTML =
      `<span><span class="chip role-${p.role}">${p.role}</span>${p.name}${p.os ? ' <span class="chip os">OS</span>' : ''}</span>`;
    const x = document.createElement('button');
    x.textContent = '✕';
    x.onclick = () => dropPlayer(p);
    row.appendChild(x);
    box.appendChild(row);
  }
  const statsBox = $('xi-stats');
  if (G.xi.length === Engine.XI_SIZE && !G.blind) {
    const s = Engine.teamStats(G.xi);
    statsBox.innerHTML =
      `<div class="stat-line"><span>Batting</span><b>${s.bat}</b></div>
       <div class="stat-line"><span>Bowling</span><b>${s.bowl}</b></div>
       <div class="stat-line"><span>Team rating</span><b>${s.rating}</b></div>` +
      s.warnings.map(w => `<div class="warn">⚠ ${w}</div>`).join('');
  } else {
    statsBox.innerHTML = '';
  }
  $('xi-errors').textContent = '';
}

function flashErrors(errors) {
  $('xi-errors').textContent = errors.join(' · ');
}

// ---------- season ----------
function startSeason() {
  const errors = Engine.validateXI(G.xi);
  if (errors.length) { flashErrors(errors); return; }
  G.stats = Engine.teamStats(G.xi);
  G.schedule = Engine.buildSchedule(G.franchise.id, G.rng);
  G.played = 0;
  G.wins = 0;
  G.results = [];
  G.alive = true;
  $('match-log').innerHTML = '';
  updateSeasonHead();
  showScreen('season');
}

function updateSeasonHead() {
  const losses = G.played - G.wins;
  $('season-record').textContent = `${G.wins}–${losses} · match ${Math.min(G.played + 1, Engine.TOTAL_MATCHES)} of ${Engine.TOTAL_MATCHES}`;
  const done = !G.alive || G.played >= Engine.TOTAL_MATCHES;
  $('btn-sim-next').disabled = done;
  $('btn-sim-all').disabled = done;
}

function simNext() {
  if (!G.alive || G.played >= Engine.TOTAL_MATCHES) return;
  const game = G.schedule[G.played];
  const r = Engine.simMatch(G.stats, game, G.difficulty.mult, G.rng);
  G.played++;
  G.results.push(r.win);
  if (r.win) G.wins++;
  else G.alive = false;

  const row = document.createElement('div');
  row.className = 'match-row' + (r.win ? '' : ' loss') + (game.opp.boss ? ' boss' : '');
  const star = Engine.potm(G.xi, r, G.rng);
  const oppName = game.mirror ? `${game.opp.short} All-Time XI 👻` : game.opp.short + (game.opp.boss ? ' ★' : '');
  const how = r.superOver
    ? 'super over!'
    : r.win ? `won by ${r.margin} runs` : `lost by ${r.margin} runs`;
  row.innerHTML =
    `<span class="m-num">#${G.played}</span>
     <span class="m-result ${r.win ? 'w' : 'l'}">${r.win ? 'W' : 'L'}</span>
     <span class="m-opp">${oppName} (${game.leg})</span>
     <span class="m-score">${r.yourScore}/${r.yourWkts} vs ${r.oppScore}/${r.oppWkts} · ${how}</span>
     <span class="m-potm">${r.win ? '⭐ ' + star.name : ''}</span>`;
  $('match-log').prepend(row);
  updateSeasonHead();

  if (!G.alive) return endSeason(false, game.opp);
  if (G.played >= Engine.TOTAL_MATCHES) return endSeason(true, null);
}

function simAll() {
  const tick = () => {
    if (!G.alive || G.played >= Engine.TOTAL_MATCHES) return;
    simNext();
    if (G.alive && G.played < Engine.TOTAL_MATCHES) setTimeout(tick, 120);
  };
  tick();
}

function endSeason(perfect, killer) {
  setTimeout(() => {
    const losses = G.played - G.wins;
    if (perfect) {
      $('result-title').textContent = '🏆 38–0. IMMORTAL.';
      $('result-detail').textContent =
        `${G.franchise.name} · ${G.difficulty.label} · ${G.era.label} · team rating ${G.stats.rating}. Every franchise in IPL history, swept home and away.`;
    } else {
      $('result-title').textContent = `${G.wins}–${losses}`;
      $('result-detail').textContent =
        `Undone by ${killer.name} in match ${G.played}. ${G.franchise.name} · ${G.difficulty.label} · ${G.era.label} · team rating ${G.stats.rating}.`;
    }
    $('result-share').textContent = buildShareCard();
    $('btn-copy-result').textContent = 'Copy result';
    $('btn-copy-result').disabled = false;
    showScreen('result');
  }, 700);
}

// Wordle-style grid: 🟩 win, 🟥 loss, ⬜ not reached (only on a loss).
// Seed code reproduces the spin + 38-game schedule for this run (not draft
// picks) — paste it into ?seed= to face the same gauntlet.
function buildShareCard() {
  const losses = G.played - G.wins;
  const squares = G.results.map(w => (w ? '🟩' : '🟥'));
  while (squares.length < Engine.TOTAL_MATCHES) squares.push('⬜');
  const rows = [];
  for (let i = 0; i < squares.length; i += 19) rows.push(squares.slice(i, i + 19).join(''));
  const headline = G.wins === Engine.TOTAL_MATCHES ? '38-0 — IMMORTAL' : `${G.wins}-${losses}`;
  return [
    `38-0 IPL: ${headline} with ${G.franchise.short} (${G.difficulty.label}, ${G.era.label})`,
    ...rows,
    `seed ${seedToCode(G.seed)} · ipl-38-0`,
  ].join('\n');
}

// ---------- leaderboard ----------
const LB_KEY = 'ipl380_leaderboard';

function loadLB() {
  try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; }
  catch { return []; }
}

function saveRun() {
  const lb = loadLB();
  lb.push({
    franchise: G.franchise.short,
    diff: G.difficulty.label,
    era: G.era.label,
    wins: G.wins,
    losses: G.played - G.wins,
    rating: G.stats.rating,
    date: new Date().toISOString().slice(0, 10),
  });
  lb.sort((a, b) => b.wins - a.wins || (a.diff === 'Hard' ? -1 : 1));
  localStorage.setItem(LB_KEY, JSON.stringify(lb.slice(0, 10)));
  $('btn-save-run').disabled = true;
  $('btn-save-run').textContent = 'Saved ✓';
}

function renderLeaderboard() {
  const lb = loadLB();
  const ol = $('leaderboard');
  ol.innerHTML = lb.length ? '' : '<li class="lb-meta">No runs yet. Go be perfect.</li>';
  for (const r of lb) {
    const li = document.createElement('li');
    li.innerHTML = `<b>${r.wins}–${r.losses}</b> with ${r.franchise}
      <span class="lb-meta">· ${r.diff} · ${r.era} · rated ${r.rating} · ${r.date}</span>`;
    ol.appendChild(li);
  }
}

// ---------- wiring ----------
$('btn-start').onclick = () => {
  G.respinsLeft = G.difficulty.respins;
  G.xi = [];
  G.seed = pickStartSeed();
  G.rng = Engine.mulberry32(G.seed);
  // seed is consumed for this run only; clear it from the URL so re-runs don't reuse it
  if (new URL(location.href).searchParams.has('seed')) {
    history.replaceState(null, '', location.pathname);
  }
  spin();
};
$('btn-respin').onclick = () => {
  if (G.respinsLeft <= 0) return;
  G.respinsLeft--;
  G.xi = [];
  spin();
};
$('btn-to-draft').onclick = () => { renderDraft(); showScreen('draft'); };
$('btn-autofill').onclick = () => {
  if (G.blind) { flashErrors(['No auto-fill in blind mode — gut only']); return; }
  const xi = Engine.autoXI(G.pool);
  if (xi) { G.xi = G.pool.filter(p => xi.some(q => q.name === p.name)); renderDraft(); }
};
$('btn-lock-xi').onclick = startSeason;
$('btn-sim-next').onclick = simNext;
$('btn-sim-all').onclick = simAll;
$('btn-again').onclick = () => {
  $('btn-save-run').disabled = false;
  $('btn-save-run').textContent = 'Save run to leaderboard';
  renderConfig();
  showScreen('config');
};
$('btn-save-run').onclick = saveRun;
$('btn-copy-result').onclick = async () => {
  const text = $('result-share').textContent;
  try {
    await navigator.clipboard.writeText(text);
    $('btn-copy-result').textContent = 'Copied ✓';
  } catch {
    // clipboard API unavailable (e.g. insecure context) — fall back to selection
    const range = document.createRange();
    range.selectNodeContents($('result-share'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    $('btn-copy-result').textContent = 'Selected — press Ctrl/Cmd+C';
  }
};

renderConfig();
showScreen('config');
