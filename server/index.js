import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const baseUrl = `http://localhost:${port}`;
// const baseUrl = `https://shortener-link2.onrender.com`;

app.use(cors());
app.use(express.json());

const sqlite = sqlite3.verbose();
const db = new sqlite.Database('./database.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      originalUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.post('/api/shorten', (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) {
    return res.status(400).json({ error: 'URL requerida' });
  }

  const code = nanoid(6);
  const stmt = db.prepare("INSERT INTO links (code, originalUrl) VALUES (?, ?)");

  stmt.run(code, originalUrl, function (err) {
    if (err) {
      console.error("Error al guardar en DB:", err);
      return res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }
    res.json({ shortUrl: `${baseUrl}/${code}` });
  });

  stmt.finalize();
});

const frontendBuildPath = path.join(__dirname, '../client/dist');

app.use(express.static(frontendBuildPath));

app.get('/:code', (req, res, next) => {
  const { code } = req.params;

  db.get("SELECT originalUrl FROM links WHERE code = ?", [code], (err, row) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Error en la base de datos");
    }

    if (row?.originalUrl) {
      res.redirect(row.originalUrl);
    } else {
      res.redirect('/');
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor de Node.js (API y Frontend) corriendo en ${baseUrl}`);
});