const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ─── DATA DIRECTORY ──────────────────────────────────────────────────────────
// On Render with Disk mounted at /data, use that path.
// Locally falls back to ./data relative to project root.
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const filePath = (name) => path.join(DATA_DIR, name);

const readJSON = (name, fallback = null) => {
    const fp = filePath(name);
    if (!fs.existsSync(fp)) return fallback;
    try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch { return fallback; }
};

const hasData = (obj) => obj && typeof obj === 'object' && Object.keys(obj).length > 0;

const writeJSON = (name, data) => {
    fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
};

// ─── RUNS ─────────────────────────────────────────────────────────────────────

// GET all runs
app.get('/api/runs', (req, res) => {
    try {
        res.json(readJSON('runs.json', []));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST new run (prepends to array — newest first)
app.post('/api/runs', (req, res) => {
    try {
        const run = { ...req.body, id: req.body.id || Date.now() };
        const runs = readJSON('runs.json', []);
        // Deduplicate by id
        const updated = [run, ...runs.filter(r => r.id !== run.id)];
        writeJSON('runs.json', updated);
        res.json({ ok: true, count: updated.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE a single run by id
app.delete('/api/runs/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const runs = readJSON('runs.json', []).filter(r => r.id !== id);
        writeJSON('runs.json', runs);
        res.json({ ok: true, count: runs.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE all runs
app.delete('/api/runs', (req, res) => {
    try {
        writeJSON('runs.json', []);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── CONFIG ───────────────────────────────────────────────────────────────────

// GET all config (defaults + motors + inventory)
app.get('/api/config', (req, res) => {
    try {
        const defaults = readJSON('defaults.json', null);
        const motors = readJSON('motors.json', null);
        const inventory = readJSON('inventory.json', null);
        res.json({
            defaults: hasData(defaults) ? defaults : null,
            motors: hasData(motors) ? motors : null,
            inventory: hasData(inventory) ? inventory : null,
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PUT config — partial update, send only what changed
app.put('/api/config', (req, res) => {
    try {
        const { defaults, motors, inventory } = req.body;
        if (defaults) writeJSON('defaults.json', defaults);
        if (motors) writeJSON('motors.json', motors);
        if (inventory) writeJSON('inventory.json', inventory);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── EXPORT / IMPORT ─────────────────────────────────────────────────────────

// GET full data export bundle
app.get('/api/export', (req, res) => {
    try {
        res.json({
            version: 1,
            exported: new Date().toISOString(),
            runs: readJSON('runs.json', []),
            defaults: readJSON('defaults.json', {}),
            motors: readJSON('motors.json', {}),
            inventory: readJSON('inventory.json', {}),
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ─── STATIC CLIENT ───────────────────────────────────────────────────────────
const CLIENT_DIST = path.join(__dirname, 'client', 'dist');

if (fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST));
    app.get('*', (req, res) => {
        res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    });
} else {
    app.get('/', (req, res) => res.send('Build client first: cd client && npm run build'));
}

// ─── START ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Birdy Racing server running on port ${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
});
