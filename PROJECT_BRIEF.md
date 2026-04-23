# BIRDY RACING — PROJECT BRIEF
# Paste this into Claude Code or a new Claude conversation to get up to speed

## REPO
github.com/gbertman/birdyracing

## STACK
- Backend: Node.js + Express (server.js)
- Frontend: React 18 + Vite + Bootstrap 5
- Data: Flat JSON files (no database)
- Deploy: Render Web Service + $1/mo Disk at /var/data

## PROJECT STRUCTURE
```
birdyracing/
├── server.js              # Express API server
├── package.json           # Root — runs both build and start
├── render.yaml            # Render deployment config
├── data/                  # Flat file storage (seeded, written at runtime)
│   ├── runs.json          # All run log entries []
│   ├── defaults.json      # Car setup defaults + class minimums
│   ├── motors.json        # Motor analyzer data + power zone data
│   └── inventory.json     # Gear inventory
└── client/                # React/Vite frontend
    ├── index.html
    ├── vite.config.js     # Dev proxy: /api → localhost:3001
    ├── package.json
    └── src/
        ├── main.jsx       # React entry point
        └── App.jsx        # Full single-file React app (~1800 lines)
```

## API ENDPOINTS (server.js)
```
GET    /api/runs           → return runs.json array
POST   /api/runs           → prepend new run, write runs.json
DELETE /api/runs/:id       → delete one run by id
DELETE /api/runs           → clear all runs
GET    /api/config         → return { defaults, motors, inventory }
PUT    /api/config         → write partial config update to disk
GET    /api/export         → full backup bundle { runs, defaults, motors, inventory }
```

## LOCAL DEV
```bash
npm install
cd client && npm install && cd ..
npm run dev   # runs Express on :3001 + Vite on :5173 concurrently
```
Open http://localhost:5173
Vite proxies /api/* to :3001 automatically.

## RENDER DEPLOY
- Build: npm install && npm run build
- Start: npm start
- Env var: DATA_DIR = /var/data
- Disk: mounted at /var/data (persistent, $1/mo)
- Free tier sleeps after 15 min inactivity — first load ~30 sec

## APP ARCHITECTURE (App.jsx)
Single-file React app. Key sections:

### State management (App root)
- runs, defaults, motors, inventory loaded from server on mount
- handleSaveRun / handleDeleteRun / handleClearRuns → POST/DELETE /api/runs
- handleSaveConfig → PUT /api/config then re-fetches
- syncState: "ok" | "busy" | "err" — shown as colored dot in topbar

### Pages (tab-based navigation)
1. QuickPage     — Feel→Fix cards, Tweak fix guide, Tuning order, IF/THEN
2. TheoryPage    — Pan car (droop/RH/CK25vsX12) + VTA (X4 specific)
3. MotorsPage    — Motor selector, power zone SVG chart, data table, KV comparison
4. CarsPage      — Car selector, spec cards, VTA suspension detail, rollout table
5. GearPage      — Inventory display, motor data status table, test protocol
6. DataPage      — JSON editors for defaults/motors/inventory, save to server
7. RunLogPage    — New run form with auto-fill from car selection, saved runs list

### PowerZoneChart component
SVG chart. Green zone = efficient (up to race setting), yellow = marginal, red = danger.
KV line (blue), amps line (red dashed), race setting pin (black).

### Key UI patterns
- CarBtn: colored by class (GT12=yellow, LMP=blue, VTA=green, TT02=purple)
- MinBadges: shows min RH and weight per class from defaults.classMinimums
- Sync dot in topbar: green/yellow/red for server state
- All config edits go to server — no localStorage for data persistence

## DOMAIN CONTEXT (RC racing — Race Place RC, Norman OK)

### Classes
- GT12: 1/12 pan car, 21.5T motor, 1S LiPo blinky, max 4.20v, min 730g, min RH 3mm
- LMP: 1/12 pan car, 17.5T motor, 1S LiPo blinky, max 4.20v, min 730g, min RH 3mm
- VTA: Touring car, 25.5T motor, 2S LiPo blinky, max 8.40v/6000mAh, min 1400g, min RH 5mm
- TT02: Stock Tamiya, 2S, no timing, 24T or 25T pinion only

### Cars
- CRC CK25: GT12 primary, V21-S 21.5, XR10 Pro 1S Stock, 44°, 49T
- Xray X12: LMP primary, V21 17.5 original rotor, Orca Totem 1S, 38°, 47T
- Team Qik 123: GT12/LMP test platform — neutral reference for all motor testing
- Team Qik 112: GT12 second car, G4R 21.5, no analyzer data yet
- Xray X4: VTA, Orca Team 25.5T (factory tuned — DO NOT adjust), XR10 Pro G3X blinky
- Tamiya TT02: USGT stock

### Motor hierarchy GT12
1. R1 V21-S 21.5 — PRIMARY (44°, 2580 KV, 2.2A — data confirmed)
2. Fleta ZX V2 — TEST/BACKUP (34°, 2645 KV, 2.3A — ROAR unconfirmed, do not race)
3. R1 V30 21.5 — LAST RESORT (33°, 2464 KV, 2.7A — 2S motor on 1S, inefficient)

### Motor hierarchy LMP
1. R1 V21 17.5 (original rotor, NOT V21-S) — PRIMARY (38°, 3087 KV, 2.4A — confirmed)
2. R1 V30 17.5 — LAST RESORT (33° est., 3.5A no-load — currently in X12, swap out)

### Key motor rules
- V30 on 1S: efficiency cliff hits early, high amp draw, designed for 2S touring car
- Orca 25.5T VTA: factory tuned and sealed — never adjust timing
- Do not swap rotors between motors
- All new motors tested in Qik123 vs V21-S baseline before racing
- Blitreme 21.5 and 17.5 incoming — run analyzer and verify ROAR before racing

### Tuning rules
- Droop is PRIMARY, ride height is SECONDARY
- CK25: reduce droop as grip builds
- X12: ADD droop as grip builds (opposite of CK25)
- Fix tweak before any other tuning
- IF GOOD → DO NOTHING

### VTA X4 baseline (Chris Adams setup sheet)
- Springs: 2.6F / 2.7R XRAY, 350cSt oil, 10% rebound
- ARB: 1.3mm front / 1.2mm rear
- Diff: solid front / 9K rear
- Camber: -2° front / -2° rear
- Toe: 1° out front / 2.5° in rear
- Weight: 1322g, 50/50 balance
- Body: Twister / Wing: Speciale
- Droop: TBD (measure with Xray gauges #107730 front, #107712 rear)

### ESC settings (general blinky carpet)
- Boost: OFF, Turbo: OFF (mandatory)
- Orca Totem 1S: PWM 24kHz, punch 3-4, drag brake 10-15%
- XR10 Pro 1S: blinky mode, punch 4, drag brake 10-15%

## PENDING ITEMS
- [ ] Analyzer data needed: G4R 21.5, Blitreme 21.5, Blitreme 17.5, V30 17.5
- [ ] V21 17.5 rotor health check (baseline KV 3087 at 38° — retest, flag if below 2995)
- [ ] Fleta ROAR compliance verification before any race use
- [ ] X12: swap V30 17.5 out → V21 17.5 in (blocked on timing ring repair)
- [ ] Timing ring repair: stripped aluminum — ordered replacement, using Loctite interim
- [ ] X4 droop measurement with Xray gauges before first VTA race
- [ ] Blitreme motors arriving — full analyzer protocol on arrival
