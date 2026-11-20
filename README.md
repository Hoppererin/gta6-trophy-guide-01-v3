# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Hoppererin/gta6-trophy-guide-01-v3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Hoppererin/gta6-trophy-guide-01-v3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

The complete offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — every trophy with its official name, description and grade, a step-by-step guide in our own words, and the sources behind every fact.

## What it is

- **Tracker** — a checklist of all 55 trophies. Tick one when you earn it; progress is saved in your browser (localStorage) and can be exported to a file and imported back.
- **Count trackers** — 29 trophies carry a live counter (e.g. 12/42 Shooting Range golds, 0/100 WAiNK scans, $0 / $250,000 laundered) with − / + steppers.
- **Filters** — by kind (Story, Missable, Collectibles, Activities, Side quests, Crime & feats, Money, Completion, Platinum, Online), by earned / remaining, and by search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the Platinum** — 9 stages in order, from the one clean setup run through the story, side strands, activities, robberies, collections and the 100% cleanup. About 200 hours, one playthrough (PowerPyx, 19 Nov 2026).
- **Missables** — the one possibly missable trophy (Positive Mental Attitude, Chapter 1) flagged with exactly when it can be missed, and the other 54 explicitly marked not missable with the reason.
- **Cited guidance** — 233 steps across the 55 trophies, backed by 137 citations to 8 dated guides. Where no guide has confirmed a method yet (Bad Luck, I Guess), the guide says so plainly instead of inventing one.

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap (19 Nov 2026)
- PushSquare — GTA 6 Trophy Guide & Roadmap (18 Nov 2026)
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap (19 Nov 2026)
- EGamers — GTA 6 Trophy List (18 Nov 2026)
- PlanetGTA6 — GTA 6 Trophies (18 Nov 2026; official list as reported from Exophase, cross-checked with PSNProfiles and TrueAchievements)
- GamesFuze — GTA 6 Trophy List (19 Nov 2026)
- GTASpotter — GTA VI trophies and achievements (19 Nov 2026)
- Vice City Hustle — GTA 6 Trophy List (18 Nov 2026)

The trophy names, descriptions and grades are the official PlayStation 5 list as PlayStation publishes it. All guide text is written for this entry, in our own words, and cites its sources — nothing is copied.

## Layout

```
app/
  index.html            — the guide: header + progress, tabs, toolbar, trophy list
  app.js                — tracker, filters, spoiler setting, export/import, roadmap, missables, sources
  style.css             — the guide's own look (warm paper, ink text, Vice City pink + teal)
  data/trophies.json    — the 55 official trophies with guides, steps, sources, counts, stages
main.ts                 — hands the guide in: copies app/ + screenshots/ to /output, writes dossier.json
vendor/makefun-frontend.ts — the make.fun dossier library (unchanged)
screenshots/           — 4 renders of the app: tracker + guide, roadmap, missables, collectibles
```

## How to run it

No build step, no network. Serve `app/` with any static server and open it in desktop Chrome:

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080/
```

Or from the repository root:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# the built guide is in out/app, with out/dossier.json
```

## Fan disclaimer

Fan-made guide. Not affiliated with, endorsed by, or connected to Rockstar Games, Take-Two Interactive, or PlayStation. Grand Theft Auto and GTA are trademarks of Take-Two Interactive. No Rockstar logo, artwork, box art or game screenshot is used anywhere in this guide.

Entered on [make.fun](https://make.fun/r/dhj53q2r).
