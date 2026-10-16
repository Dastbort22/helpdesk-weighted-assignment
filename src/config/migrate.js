const pool = require('./db');

const schema = [
  `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT 'requester', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS skills (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS agents (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE, available BOOLEAN DEFAULT TRUE, max_tickets INTEGER DEFAULT 10, sla_compliance NUMERIC(5,2) DEFAULT 100)`,
  `CREATE TABLE IF NOT EXISTS agent_skills (agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE, skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE, level INTEGER NOT NULL CHECK(level BETWEEN 1 AND 5), PRIMARY KEY(agent_id, skill_id))`,
  `CREATE TABLE IF NOT EXISTS tickets (id SERIAL PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT, priority VARCHAR(20) NOT NULL DEFAULT 'medium', status VARCHAR(20) NOT NULL DEFAULT 'open', requester_id INTEGER REFERENCES users(id), required_skill_id INTEGER REFERENCES skills(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, due_at TIMESTAMP, assigned_agent_id INTEGER REFERENCES agents(id))`,
  `CREATE TABLE IF NOT EXISTS slas (id SERIAL PRIMARY KEY, priority VARCHAR(20) UNIQUE NOT NULL, response_hours INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS assignments (id SERIAL PRIMARY KEY, ticket_id INTEGER UNIQUE REFERENCES tickets(id) ON DELETE CASCADE, agent_id INTEGER REFERENCES agents(id), score NUMERIC(8,2), assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS business_hours (id SERIAL PRIMARY KEY, weekday INTEGER UNIQUE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL, enabled BOOLEAN DEFAULT TRUE)`,
];

async function runMigrations() {
  for (const sql of schema) await pool.query(sql);
  await pool.query(`INSERT INTO slas(priority,hours) VALUES ('low',24),('medium',8),('high',4),('critical',2) ON CONFLICT (priority) DO NOTHING`);
  for (let day=1; day<=5; day++) await pool.query(`INSERT INTO business_hours(weekday,start_time,end_time) VALUES ($1,'08:00','17:00') ON CONFLICT (weekday) DO NOTHING`, [day]);
  await pool.query(`INSERT INTO skills(name) VALUES ('Soporte'),('Bases de datos'),('Redes'),('Programacion') ON CONFLICT (name) DO NOTHING`);
  console.log('Base de datos lista.');
}
module.exports = runMigrations;
