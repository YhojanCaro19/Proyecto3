CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (name, email) VALUES
    ('Ana Torres', 'ana.torres@example.com'),
    ('Carlos Pérez', 'carlos.perez@example.com'),
    ('Laura Gómez', 'laura.gomez@example.com')
ON CONFLICT (email) DO NOTHING;
