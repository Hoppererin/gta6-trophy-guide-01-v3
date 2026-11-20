// Leonida Platinum — GTA VI trophy guide & tracker.
// Tracker with saved progress (localStorage), export/import, kind + status filters,
// search, spoiler setting, count trackers, roadmap, missables and sources tabs.
// All trophy data lives in data/trophies.json; this file only renders it.

const SAVE_KEY = 'leonida-platinum-save-v1';
const DATA_URL = 'data/trophies.json';

const KIND_GROUPS = [
  { key: 'all', label: 'All', kinds: null },
  { key: 'story', label: 'Story', kinds: ['story'] },
  { key: 'missable', label: 'Missable', kinds: ['missable'] },
  { key: 'collectibles', label: 'Collectibles', kinds: ['collectibles'] },
  { key: 'activities', label: 'Activities', kinds: ['activities'] },
  { key: 'side', label: 'Side quests', kinds: ['side'] },
  { key: 'crimefeats', label: 'Crime & feats', kinds: ['crime', 'feats'] },
  { key: 'money', label: 'Money', kinds: ['money'] },
  { key: 'completion', label: 'Completion', kinds: ['completion'] },
  { key: 'platinum', label: 'Platinum', kinds: ['platinum'] },
  { key: 'online', label: 'Online', kinds: ['online'] },
];

const KIND_LABELS = {
  platinum: 'Platinum', story: 'Story', completion: '100% completion', activities: 'Activities',
  side: 'Side quest', missable: 'Missable', collectibles: 'Collectible', crime: 'Crime',
  feats: 'One-off feat', money: 'Money', online: 'Online',
};

const ROADMAP_STAGES = [
  {
    n: 1, title: 'Before you start — set up for one clean run', time: '15 minutes',
    text: 'Turn cheats off and leave them off: PowerPyx reports that any cheat disables trophies and saving. Keep a manual save at the start and end of each chapter (15 manual slots) because there is no mission replay. Turn the spoiler toggle on if you want story trophies hidden until you earn them.',
    trophies: [],
  },
  {
    n: 2, title: 'Chapter 1 — learn Leonida, grab the one missable', time: 'Story, ~10 hours',
    text: 'Play the opening mission Gone Fishing, then the rest of Chapter 1. Do the Chapter 1 meditation at Jason’s house before the chapter ends — it is the only moment in the game that might be missable (see Positive Mental Attitude). Scan vehicles with WAiNK from the start: you need 200 of them for 100%.',
    trophies: [2, 3, 28],
  },
  {
    n: 3, title: 'Chapters 2–3 — Vice City opens', time: 'Story, ~25 hours',
    text: 'Finish Chapters 2 and 3, including the named missions Breakfast Run and The Cartel Heist. After Coffee Break in Chapter 2 you can play as both characters and roam together, which opens the partner trophies. Chapter 3 unlocks the Key Cloner, the Dye Pack Jammer, Yasmani’s jewelry jobs and the fences — and starts the Andy, Kenton, Billy, Randy and Tyrone strands.',
    trophies: [4, 5, 8, 9],
  },
  {
    n: 4, title: 'Chapters 4–5 — the endgame story', time: 'Story, ~25 hours',
    text: 'Finish Chapters 4 and 5, including Child’s Play, Headliners, VCIA Takedown, Operation Savage Glory and the final mission. Take the Chapter 4 optional mission That’s Where The Money Is… when it appears: it unlocks the bank-vault robberies. After the credits, free-roam continues and the 100% checklist appears.',
    trophies: [6, 7, 10, 11, 12, 13],
  },
  {
    n: 5, title: 'Side characters — finish every strand', time: '~10 hours',
    text: 'Clear the optional questlines: Andy (Lucia only), Kenton’s 7 shipwrecks, Billy’s 5 jobs, Randy’s 16 cars, Tyrone’s labs (Jason only), Bret’s hunts (Jason only) and 8 Strangers & Freaks strands. None of them can be missed — every quest giver is still there after the story.',
    trophies: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    n: 6, title: 'Activities — races, ranges, stunts, challenges', time: '~20 hours',
    text: 'Gold all 42 Shooting Range challenges, win a Top Fun drone race at all 14 locations, win 20 different races, land 250 stunts, beat Cal at fishing, finish one arcade game, try all 9 activity types and reach 50 of the 80 challenges. The ranges, drone races and 70 challenges are all needed again for 100%, so do them properly now.',
    trophies: [15, 16, 17, 18, 19, 20, 21, 32],
  },
  {
    n: 7, title: 'Crime — robberies with your partner', time: '~15 hours',
    text: 'Rob 5 bank vaults (8 for 100%), an armored truck, a jewelry store without being seen, 3 shops back-to-back with your partner, one illegal operation for each of the 9 gangs, and the one-off feats: a 4-star escape with your partner, 5 enemies in one Combat Focus, a stolen plane out of VCIA and a stolen Rhino tank.',
    trophies: [33, 34, 36, 37, 38, 39, 40, 41, 43],
  },
  {
    n: 8, title: 'Collect & explore — Leonida 100%', time: '~30 hours',
    text: 'Finish the collections: 3 card sets, 100 WAiNK scans, 100 vehicles discovered, the last meditation spots, all 52 areas explored, 8 garages bought, 10 vehicles registered to Scooter Bros, $250,000 laundered and $100,000 spent. Most of this has been building passively since Chapter 1.',
    trophies: [28, 30, 31, 35, 42, 52, 53, 54, 55],
  },
  {
    n: 9, title: 'Cleanup — 100% and the one-offs, then Platinum', time: '~10 hours',
    text: 'Open Progress, Stats, 100% Completion and clear whatever is left — the checklist is only about 60% of the game, so the last stretch is short. Then mop up the one-off feats: the Ocean Beach cocktail, the showroom Banshee, the bowling alley valuables, maximum strength for both characters, 500 profile actions, the UFO easter egg and the bike kicks. A Long Road pops at 100%, and the Platinum pops with the last trophy.',
    trophies: [1, 14, 44, 45, 46, 47, 48, 49, 50, 51],
  },
];

let trophies = [];
let byId = new Map();
let save = loadSave();
let activeKind = 'all';
let activeStatus = 'all';
let searchText = '';
let openGuideId = null;

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    if (raw && typeof raw === 'object') {
      return {
        earned: new Set(Array.isArray(raw.earned) ? raw.earned : []),
        counts: raw.counts && typeof raw.counts === 'object' ? raw.counts : {},
        spoiler: raw.spoiler === true,
      };
    }
  } catch { /* corrupted save: start fresh */ }
  return { earned: new Set(), counts: {}, spoiler: false };
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    earned: [...save.earned],
    counts: save.counts,
    spoiler: save.spoiler,
  }));
}

function formatCount(trophy) {
  const n = save.counts[trophy.id] ?? 0;
  if (trophy.countUnit && trophy.countUnit.startsWith('dollars')) {
    return '$' + n.toLocaleString('en-US') + ' / $' + trophy.countTarget.toLocaleString('en-US');
  }
  return n + ' / ' + trophy.countTarget + ' ' + trophy.countUnit;
}

function renderHeaderProgress() {
  const total = trophies.length;
  const earned = save.earned.size;
  document.getElementById('earnedCount').textContent = earned + ' / ' + total;
  document.getElementById('progressFill').style.width = total ? (earned / total * 100) + '%' : '0%';
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1] += 1;
    if (save.earned.has(t.name)) byGrade[t.grade][0] += 1;
  }
  const order = ['platinum', 'gold', 'silver', 'bronze'];
  document.getElementById('gradeCounts').textContent = order
    .filter(g => byGrade[g])
    .map(g => g[0].toUpperCase() + g.slice(1) + ' ' + byGrade[g][0] + '/' + byGrade[g][1])
    .join(' · ');
}

function renderKindChips() {
  const box = document.getElementById('kindChips');
  box.replaceChildren();
  for (const group of KIND_GROUPS) {
    const count = group.kinds === null
      ? trophies.length
      : trophies.filter(t => group.kinds.includes(t.kind)).length;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (activeKind === group.key ? ' active' : '');
    btn.textContent = group.label + ' (' + count + ')';
    btn.addEventListener('click', () => { activeKind = group.key; renderKindChips(); renderTracker(); });
    box.append(btn);
  }
}

function trophyMatches(trophy) {
  if (activeKind !== 'all') {
    const group = KIND_GROUPS.find(g => g.key === activeKind);
    if (group && group.kinds && !group.kinds.includes(trophy.kind)) return false;
  }
  if (activeStatus === 'earned' && !save.earned.has(trophy.name)) return false;
  if (activeStatus === 'remaining' && save.earned.has(trophy.name)) return false;
  if (searchText) {
    const hay = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide + ' ' + trophy.steps.join(' ')).toLowerCase();
    if (!hay.includes(searchText)) return false;
  }
  return true;
}

function buildTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'trophy-card' + (save.earned.has(trophy.name) ? ' earned' : '') + (trophy.missable ? ' missable-card' : '');
  card.id = 'trophy-' + trophy.id;
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'earn-box';
  box.checked = save.earned.has(trophy.name);
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
  box.addEventListener('change', () => toggleTrophyEarned(trophy, box.checked));
  head.append(box);
  const main = document.createElement('div');
  main.className = 'trophy-main';
  const spoilerHidden = save.spoiler && trophy.kind === 'story' && !save.earned.has(trophy.name);
  const nameEl = document.createElement('h3');
  nameEl.className = 'trophy-name';
  if (spoilerHidden) {
    nameEl.textContent = 'Hidden story trophy';
    const tag = document.createElement('span');
    tag.className = 'hidden-tag';
    tag.textContent = 'SPOILER HIDDEN';
    nameEl.append(tag);
  } else {
    nameEl.textContent = trophy.name;
    if (trophy.hidden) {
      const tag = document.createElement('span');
      tag.className = 'hidden-tag';
      tag.textContent = 'HIDDEN ON PSN';
      nameEl.append(tag);
    }
  }
  main.append(nameEl);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = spoilerHidden
    ? 'Earn this trophy in the game to reveal its name and description. (Spoiler setting is on.)'
    : trophy.description;
  main.append(desc);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const grade = document.createElement('span');
  grade.className = 'grade grade-' + trophy.grade;
  grade.textContent = trophy.grade;
  meta.append(grade);
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  meta.append(kind);
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = '⚠ POSSIBLY MISSABLE';
    meta.append(flag);
  }
  const stage = document.createElement('span');
  stage.className = 'stage-tag';
  stage.textContent = 'Roadmap stage ' + trophy.stage;
  meta.append(stage);
  if (trophy.countTarget) {
    const countBox = document.createElement('span');
    countBox.className = 'count-box';
    const label = document.createElement('span');
    label.className = 'count-label';
    label.textContent = 'Progress';
    const minus = document.createElement('button');
    minus.type = 'button';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Decrease count for ' + trophy.name);
    minus.addEventListener('click', () => setTrophyCount(trophy, (save.counts[trophy.id] ?? 0) - 1));
    const value = document.createElement('span');
    value.className = 'count-value';
    value.textContent = formatCount(trophy);
    const plus = document.createElement('button');
    plus.type = 'button';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Increase count for ' + trophy.name);
    plus.addEventListener('click', () => setTrophyCount(trophy, (save.counts[trophy.id] ?? 0) + 1));
    countBox.append(label, minus, value, plus);
    meta.append(countBox);
  }
  main.append(meta);
  if (!spoilerHidden) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guide-btn';
    btn.textContent = openGuideId === trophy.id ? 'Hide guide ▲' : 'Read the guide ▼';
    btn.addEventListener('click', () => openTrophyGuide(trophy.id));
    meta.append(btn);
    if (openGuideId === trophy.id) main.append(buildGuidePanel(trophy));
  }
  head.append(main);
  card.append(head);
  return card;
}

function buildGuidePanel(trophy) {
  const panel = document.createElement('div');
  panel.className = 'guide-panel';
  const h = document.createElement('h4');
  h.textContent = 'How to get it';
  panel.append(h);
  const text = document.createElement('p');
  text.className = 'guide-text';
  text.textContent = trophy.guide;
  panel.append(text);
  const list = document.createElement('ol');
  for (const step of trophy.steps) {
    const li = document.createElement('li');
    li.textContent = step;
    list.append(li);
  }
  panel.append(list);
  const sources = document.createElement('div');
  sources.className = 'sources';
  const strong = document.createElement('strong');
  strong.textContent = 'Sources (' + trophy.sources.length + '): ';
  sources.append(strong);
  const ul = document.createElement('ul');
  for (const s of trophy.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a, document.createTextNode(' — ' + s.date));
    ul.append(li);
  }
  sources.append(ul);
  panel.append(sources);
  return panel;
}

function renderTracker() {
  renderHeaderProgress();
  const list = document.getElementById('trophyList');
  list.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  document.getElementById('filterNote').textContent =
    'Showing ' + shown.length + ' of ' + trophies.length + ' trophies'
    + (activeKind !== 'all' ? ' — ' + KIND_GROUPS.find(g => g.key === activeKind).label : '')
    + (activeStatus !== 'all' ? ' — ' + activeStatus : '')
    + (searchText ? ' — matching “' + searchText + '”' : '')
    + '.';
  if (shown.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty-note';
    p.textContent = activeKind === 'online'
      ? 'There are no online trophies in GTA VI — all 55 are offline, single-player (PowerPyx, 19 Nov 2026).'
      : 'No trophies match this filter.';
    list.append(p);
    return;
  }
  for (const t of shown) list.append(buildTrophyCard(t));
}

function toggleTrophyEarned(trophy, earned) {
  if (earned) save.earned.add(trophy.name);
  else save.earned.delete(trophy.name);
  saveProgress();
  renderTracker();
}

function setTrophyCount(trophy, next) {
  const clamped = Math.max(0, Math.min(trophy.countTarget, next));
  save.counts[trophy.id] = clamped;
  saveProgress();
  renderTracker();
}

function scrollCardIntoView(id) {
  const el = document.getElementById('trophy-' + id);
  if (!el) return;
  const head = document.getElementById('stickyHead');
  const toolbar = document.querySelector('.toolbar');
  const offset = (head ? head.offsetHeight : 0) + (toolbar ? toolbar.offsetHeight : 0) + 8;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' });
}

function openTrophyGuide(id) {
  openGuideId = openGuideId === id ? null : id;
  renderTracker();
  if (openGuideId !== null) scrollCardIntoView(openGuideId);
}

function renderRoadmap() {
  const box = document.getElementById('roadmapStages');
  box.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const div = document.createElement('div');
    div.className = 'stage';
    const time = document.createElement('p');
    time.className = 'stage-time';
    time.textContent = 'Stage ' + stage.n + ' · ' + stage.time;
    div.append(time);
    const h = document.createElement('h3');
    h.textContent = stage.title;
    div.append(h);
    const p = document.createElement('p');
    p.textContent = stage.text;
    div.append(p);
    if (stage.trophies.length) {
      const chips = document.createElement('div');
      chips.className = 'stage-trophies';
      for (const id of stage.trophies) {
        const t = byId.get(id);
        const chip = document.createElement('span');
        chip.className = 'stage-trophy';
        chip.textContent = t.name + ' ';
        const g = document.createElement('span');
        g.className = 'g';
        g.textContent = '(' + t.grade + ')';
        chip.append(g);
        chips.append(chip);
      }
      div.append(chips);
    }
    box.append(div);
  }
}

function renderMissables() {
  const summary = document.getElementById('missableSummary');
  summary.replaceChildren();
  const warn = document.createElement('div');
  warn.className = 'warn-card';
  const h = document.createElement('h3');
  h.textContent = '⚠ 1 trophy is possibly missable: Positive Mental Attitude';
  warn.append(h);
  const p1 = document.createElement('p');
  p1.textContent = 'Meditate at every spot across Leonida. The first meditation, at Jason’s house in Chapter 1, is only offered in Chapter 1: after the mission Down to Earth, in the morning, talk to Lucia in the kitchen, follow her to the balcony and choose Accept. It never comes back. It is not yet confirmed whether that session counts toward the trophy — PowerPyx earned the trophy after doing it, so do it anyway.';
  warn.append(p1);
  const p2 = document.createElement('p');
  p2.textContent = 'Everything else can be finished after the story in free-roam. Two warnings that are not trophy misses: there is no mission replay, so keep a manual save at the start and end of each chapter; and any cheat disables trophies and saving, so leave cheats off until the Platinum pops.';
  warn.append(p2);
  summary.append(warn);
  const rows = document.getElementById('missableRows');
  rows.replaceChildren();
  for (const t of trophies) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = t.name;
    const grade = document.createElement('td');
    grade.textContent = t.grade;
    const miss = document.createElement('td');
    miss.textContent = t.missable ? 'Possibly' : 'No';
    miss.className = t.missable ? 'missable-yes' : 'missable-no';
    const why = document.createElement('td');
    why.textContent = t.missableNote;
    tr.append(name, grade, miss, why);
    rows.append(tr);
  }
}

function renderSources() {
  const box = document.getElementById('sourcesBody');
  box.replaceChildren();
  const seen = new Map();
  for (const t of trophies) for (const s of t.sources) {
    if (!seen.has(s.url)) seen.set(s.url, s);
  }
  const intro = document.createElement('p');
  intro.className = 'lede';
  intro.textContent = 'Every trophy in this guide cites its sources by name, link and date. The methods come from the guides below, rewritten in our own words — nothing is copied. The trophy names, descriptions and grades are the official list as PlayStation publishes it, as reported on 18 Nov 2026 and cross-checked across the lists below.';
  box.append(intro);
  const table = document.createElement('table');
  table.className = 'source-table';
  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['Source', 'Date', 'What it backs']) {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.append(th);
  }
  thead.append(headRow);
  table.append(thead);
  const tbody = document.createElement('tbody');
  const roles = {
    'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/': 'Full roadmap and per-trophy methods — the main method source for all 55 trophies.',
    'https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap': 'Roadmap, story order and 100% checklist location.',
    'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/': 'Platinum roadmap and per-trophy requirements.',
    'https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/': 'The 55-name list (18 Nov 2026) and the missable-trophy reporting.',
    'https://www.planetgta6.com/en/gta-6-trophies/': 'The official list as reported from Exophase, cross-checked with PSNProfiles and TrueAchievements; the visible/hidden split.',
    'https://gamesfuze.com/gta-6-wiki/achievements/': 'Full 55-trophy list and roadmap steps.',
    'https://gtaspotter.com/en/guides/gta-6-trophies-and-achievements/': 'Full list, roadmap and the 80 challenges.',
    'https://www.vicecityhustle.com/guides/gta-6-trophy-list-all-55-trophies': 'Full list and the Chapter 1 meditation warning.',
  };
  for (const s of [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    name.append(a);
    const date = document.createElement('td');
    date.textContent = s.date;
    const role = document.createElement('td');
    role.textContent = roles[s.url] ?? 'Per-trophy methods and requirements.';
    tr.append(name, date, role);
    tbody.append(tr);
  }
  table.append(tbody);
  box.append(table);
  const listNote = document.createElement('div');
  listNote.className = 'note-card';
  const lh = document.createElement('h3');
  lh.textContent = 'Where the official list comes from';
  listNote.append(lh);
  const lp = document.createElement('p');
  lp.textContent = 'The 55 names, descriptions and grades are the official PlayStation 5 list as reported on 18 Nov 2026 by PlanetGTA6, taken from Exophase and cross-checked with PSNProfiles and TrueAchievements; the same names and grades appear in the lists at PowerPyx, PushSquare, KeenGamer, EGamers, GamesFuze, GTASpotter and Vice City Hustle. 28 of the 55 are hidden on PlayStation until earned.';
  listNote.append(lp);
  box.append(listNote);
  const honest = document.createElement('div');
  honest.className = 'note-card';
  const hh = document.createElement('h3');
  hh.textContent = 'What is still unconfirmed — stated honestly';
  honest.append(hh);
  const hul = document.createElement('ul');
  for (const line of [
    'Bad Luck, I Guess: no published guide has a verified method yet (PowerPyx, 19 Nov 2026). The guide gives the leading lead and says so, instead of inventing a method.',
    'Fair Game: PowerPyx notes it is still unconfirmed which exact animal pops the trophy — the guide tells you to work Bret’s whole strand.',
    'Positive Mental Attitude: it is unconfirmed whether the Chapter 1 meditation counts toward the trophy. The guide tells you to do it anyway.',
    'Counts such as 42 Shooting Range challenges, 14 drone race locations and 52 areas come from the trophy descriptions and the guides above; where a count is the game’s own tracked number it is shown as a target in the tracker.',
  ]) {
    const li = document.createElement('li');
    li.textContent = line;
    hul.append(li);
  }
  honest.append(hul);
  box.append(honest);
  const about = document.createElement('div');
  about.className = 'note-card';
  const ah = document.createElement('h3');
  ah.textContent = 'About this guide';
  about.append(ah);
  const ap = document.createElement('p');
  ap.textContent = 'Leonida Platinum is a fan-made guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI. It is not affiliated with, endorsed by, or connected to Rockstar Games, Take-Two Interactive, or PlayStation. It runs entirely offline from its own files: no network requests, no accounts, no tracking. Your progress lives only in this browser and in the file you export.';
  about.append(ap);
  box.append(about);
}

function switchTab(name) {
  for (const btn of document.querySelectorAll('.tab')) {
    btn.classList.toggle('active', btn.dataset.tab === name);
  }
  for (const panel of document.querySelectorAll('.tab-panel')) {
    panel.classList.toggle('hidden', panel.id !== 'tab-' + name);
  }
  if (history.replaceState) history.replaceState(null, '', '#tab=' + name);
}

function applyHashState() {
  const hash = new URLSearchParams(location.hash.slice(1));
  const tab = hash.get('tab');
  if (tab && document.getElementById('tab-' + tab)) switchTab(tab);
  const kind = hash.get('kind');
  if (kind && KIND_GROUPS.some(g => g.key === kind)) { activeKind = kind; renderKindChips(); }
  const guide = Number(hash.get('guide'));
  if (guide && byId.has(guide)) {
    openGuideId = guide;
    renderTracker();
    scrollCardIntoView(guide);
  } else if (openGuideId !== null) {
    openGuideId = null;
    renderTracker();
  }
  measureStickyHead();
}

window.addEventListener('hashchange', applyHashState);

function exportProgress() {
  const payload = {
    app: 'leonida-platinum-gta6-trophies',
    exportedAt: new Date().toISOString(),
    earned: [...save.earned],
    counts: save.counts,
    spoiler: save.spoiler,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const names = new Set(trophies.map(t => t.name));
      save.earned = new Set((data.earned ?? []).filter(n => names.has(n)));
      const counts = {};
      for (const [id, n] of Object.entries(data.counts ?? {})) {
        const t = byId.get(Number(id));
        if (t && t.countTarget) counts[id] = Math.max(0, Math.min(t.countTarget, Number(n) || 0));
      }
      save.counts = counts;
      if (typeof data.spoiler === 'boolean') {
        save.spoiler = data.spoiler;
        document.getElementById('spoilerToggle').checked = save.spoiler;
      }
      saveProgress();
      renderTracker();
    } catch {
      alert('That file is not a Leonida Platinum progress export.');
    }
  };
  reader.readAsText(file);
}

async function loadTrophies() {
  const doc = await (await fetch(DATA_URL)).json();
  trophies = doc.trophies;
  byId = new Map(trophies.map(t => [t.id, t]));
}

function wireControls() {
  for (const btn of document.querySelectorAll('.tab')) {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  }
  document.getElementById('search').addEventListener('input', e => {
    searchText = e.target.value.trim().toLowerCase();
    renderTracker();
  });
  document.getElementById('statusFilter').addEventListener('change', e => {
    activeStatus = e.target.value;
    renderTracker();
  });
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = save.spoiler;
  spoiler.addEventListener('change', () => {
    save.spoiler = spoiler.checked;
    saveProgress();
    renderTracker();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importInput').addEventListener('change', e => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
}

function measureStickyHead() {
  const head = document.getElementById('stickyHead');
  if (head) document.documentElement.style.setProperty('--sticky-top', head.offsetHeight + 'px');
}

await loadTrophies();
wireControls();
renderKindChips();
renderRoadmap();
renderMissables();
renderSources();
renderTracker();
applyHashState();
measureStickyHead();
window.addEventListener('resize', measureStickyHead);
