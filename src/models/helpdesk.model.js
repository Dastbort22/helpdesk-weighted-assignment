const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const Model = {
  async users(){ const {rows}=await pool.query('SELECT id,name,email,role,created_at FROM users ORDER BY id'); return rows; },
  async createUser({name,email,password,role='requester'}){ const hash=await bcrypt.hash(password,10); const {rows}=await pool.query('INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role', [name,email,hash,role]); return rows[0]; },
  async skills(){ const {rows}=await pool.query('SELECT * FROM skills ORDER BY id'); return rows; },
  async createSkill(name){ const {rows}=await pool.query('INSERT INTO skills(name) VALUES($1) ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING *',[name]); return rows[0]; },
  async agents(){ const {rows}=await pool.query(`SELECT a.id,u.name,u.email,a.available,a.max_tickets,a.sla_compliance,COUNT(t.id)::int active_tickets FROM agents a JOIN users u ON u.id=a.user_id LEFT JOIN tickets t ON t.assigned_agent_id=a.id AND t.status IN ('open','in_progress') GROUP BY a.id,u.name,u.email ORDER BY a.id`); return rows; },
  async createAgent({user_id,max_tickets=10}){ const {rows}=await pool.query('INSERT INTO agents(user_id,max_tickets) VALUES($1,$2) RETURNING *',[user_id,max_tickets]); return rows[0]; },
  async addAgentSkill({agent_id,skill_id,level}){ const {rows}=await pool.query('INSERT INTO agent_skills(agent_id,skill_id,level) VALUES($1,$2,$3) ON CONFLICT(agent_id,skill_id) DO UPDATE SET level=EXCLUDED.level RETURNING *',[agent_id,skill_id,level]); return rows[0]; },
  async createTicket({title,description,priority='medium',requester_id,required_skill_id}){ const {rows}=await pool.query('INSERT INTO tickets(title,description,priority,requester_id,required_skill_id) VALUES($1,$2,$3,$4,$5) RETURNING *',[title,description,priority,requester_id,required_skill_id]); return rows[0]; },
  async tickets(){ const {rows}=await pool.query(`SELECT t.*,u.name requester,s.name required_skill,ag.id agent_id,au.name agent_name FROM tickets t LEFT JOIN users u ON u.id=t.requester_id LEFT JOIN skills s ON s.id=t.required_skill_id LEFT JOIN agents ag ON ag.id=t.assigned_agent_id LEFT JOIN users au ON au.id=ag.user_id ORDER BY t.id DESC`); return rows; },
  async ticket(id){ const {rows}=await pool.query(`SELECT t.*,s.name required_skill FROM tickets t LEFT JOIN skills s ON s.id=t.required_skill_id WHERE t.id=$1`,[id]); return rows[0]; },
  async candidates(skillId){ const {rows}=await pool.query(`SELECT a.id,a.available,a.max_tickets,a.sla_compliance,COALESCE(x.active_tickets,0)::int active_tickets,COALESCE(ags.level,0)::int skill_level FROM agents a LEFT JOIN agent_skills ags ON ags.agent_id=a.id AND ags.skill_id=$1 LEFT JOIN (SELECT assigned_agent_id,COUNT(*) active_tickets FROM tickets WHERE status IN ('open','in_progress') GROUP BY assigned_agent_id) x ON x.assigned_agent_id=a.id WHERE a.available=true ORDER BY a.id`,[skillId]); return rows; },
  async assign(ticketId,agentId,score,dueAt){ const client=await pool.connect(); try{await client.query('BEGIN'); await client.query('UPDATE tickets SET assigned_agent_id=$1,due_at=$2,status=\'in_progress\' WHERE id=$3',[agentId,dueAt,ticketId]); const {rows}=await client.query('INSERT INTO assignments(ticket_id,agent_id,score) VALUES($1,$2,$3) RETURNING *',[ticketId,agentId,score]); await client.query('COMMIT'); return rows[0];}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}},
  async sla(priority){ const {rows}=await pool.query('SELECT hours FROM slas WHERE priority=$1',[priority]); return rows[0]?.hours || 8; }
};
module.exports=Model;
