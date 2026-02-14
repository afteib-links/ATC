const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '2mb' }));

const MAPS_PATH = path.join(__dirname, 'maps.js');

function readMapsFile() {
  const src = fs.readFileSync(MAPS_PATH, 'utf8');
  const m = src.match(/window\.MAPS\s*=\s*(\[[\s\S]*?\]);?/);
  if (!m) throw new Error('maps.js: could not parse window.MAPS');
  return JSON.parse(m[1]);
}

function writeMapsFile(maps) {
  const out = '// maps.js\nwindow.MAPS = ' + JSON.stringify(maps, null, 2) + ';\n';
  fs.writeFileSync(MAPS_PATH, out, 'utf8');
}

app.get('/api/maps', (req, res) => {
  try {
    const maps = readMapsFile();
    res.json({ ok: true, maps });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Accept either full replacement: { maps: [...] }
// or single update: { id: "floor_1", map: { ... } }
app.post('/api/maps', (req, res) => {
  try {
    const body = req.body;
    if (body.maps) {
      writeMapsFile(body.maps);
      return res.json({ ok: true });
    }
    if (body.id && body.map) {
      const maps = readMapsFile();
      const idx = maps.findIndex(m => m.id === body.id);
      if (idx === -1) return res.status(404).json({ ok: false, error: 'map id not found' });
      maps[idx] = body.map;
      writeMapsFile(maps);
      return res.json({ ok: true });
    }
    res.status(400).json({ ok: false, error: 'invalid payload' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// static files (served after API routes to avoid accidental override)
app.use(express.static(path.join(__dirname)));

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ ok: false, error: 'server error' });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));
