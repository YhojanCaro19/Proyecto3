const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const pool = new Pool(); // Lee PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE del entorno

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Salud
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
});

// Listar todos
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar usuarios' });
  }
});

// Obtener uno
app.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar usuario' });
  }
});

// Crear
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name y email son obligatorios' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar
app.put('/users/:id', async (req, res) => {
  const { name, email } = req.body;
  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email, created_at',
      [name, email, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

app.listen(PORT, () => {
  console.log(`API de usuarios escuchando en el puerto ${PORT}`);
});