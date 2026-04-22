# Birdy Racing — RC Manual

GT12 · LMP · VTA · TT02 race manual and run log for Race Place RC, Norman OK.

## Stack
- **Backend:** Node.js + Express, flat JSON files
- **Frontend:** React + Vite + Bootstrap 5
- **Deploy:** Render (free tier + $1/mo Disk for persistence)

## Local Development

```bash
# Install root dependencies
npm install

# Install client dependencies  
cd client && npm install && cd ..

# Run both servers (Express on :3001, Vite on :5173)
npm run dev
```

Open `http://localhost:5173`

## Deploy to Render

1. Push this repo to `gbertman/birdyracing`
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect to `gbertman/birdyracing`
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add a **Disk** (under Advanced):
   - Name: `birdy-data`
   - Mount Path: `/var/data`
   - Size: 1 GB ($1/month)
6. Add environment variable:
   - `DATA_DIR` = `/var/data`
7. Deploy

The `render.yaml` in this repo configures all of this automatically if you use **Blueprint** deployment.

## Data Files

All data lives in `DATA_DIR` (default `./data` locally, `/var/data` on Render):

| File | Contents |
|------|----------|
| `runs.json` | All run log entries |
| `defaults.json` | Car setup defaults + class minimums |
| `motors.json` | Motor analyzer data + power zone data |
| `inventory.json` | Gear inventory |

Edit via the **DATA** tab in the app, or directly in the files.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/runs` | All runs |
| POST | `/api/runs` | Save new run |
| DELETE | `/api/runs/:id` | Delete one run |
| DELETE | `/api/runs` | Clear all runs |
| GET | `/api/config` | All config files |
| PUT | `/api/config` | Update config |
| GET | `/api/export` | Full data backup |

## Notes

- The sync dot in the top bar shows server status (green = ok, yellow = saving, red = error)
- Run entries can be deleted individually with the ✕ button
- Full backup available via DATA tab → Export Full Backup
- On Render free tier, service sleeps after 15 min inactivity — first load after sleep takes ~30 sec
