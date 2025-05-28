import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Conexión e inicialización de la base de datos
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

// Crear enlace acortado
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
    res.json({ shortUrl: `http://localhost:${port}/${code}` });
  });

  stmt.finalize();
});

// Redirigir desde código acortado
app.get('/:code', (req, res) => {
  const { code } = req.params;
  db.get("SELECT originalUrl FROM links WHERE code = ?", [code], (err, row) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Error en la base de datos");
    }

    if (row?.originalUrl) {
      res.redirect(row.originalUrl);
    } else {
      const indexPath = path.join(__dirname, 'dist', 'index.html');
      res.status(404).sendFile(indexPath, (sendErr) => {
        if (sendErr) {
          console.error("Error enviando index.html:", sendErr);
          res.status(500).send("Error interno del servidor");
        }
      });
    }
  });
});

// Servir frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Arrancar servidor
app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});
