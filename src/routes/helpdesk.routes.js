const {Router}=require('express'); const C=require('../controllers/helpdesk.controller'); const r=Router();
r.get('/users',C.users); r.post('/users',C.createUser);
r.get('/skills',C.skills); r.post('/skills',C.createSkill);
r.get('/agents',C.agents); r.post('/agents',C.createAgent); r.post('/agents/skills',C.addSkill);
r.get('/tickets',C.tickets); r.post('/tickets',C.createTicket); r.post('/tickets/:id/auto-assign',C.autoAssign);
module.exports=r;
