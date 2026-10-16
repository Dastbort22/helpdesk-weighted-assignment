const M=require('../models/helpdesk.model');

function addBusinessHours(start,hours){ let d=new Date(start); let remaining=hours*60; while(remaining>0){ const day=d.getDay(); if(day===0||day===6){ d.setDate(d.getDate()+1); d.setHours(8,0,0,0); continue; } if(d.getHours()<8) d.setHours(8,0,0,0); if(d.getHours()>=17){ d.setDate(d.getDate()+1); d.setHours(8,0,0,0); continue; } const available=(17*60+d.getMinutes())-(d.getHours()*60+d.getMinutes()); const take=Math.min(remaining,available); d=new Date(d.getTime()+take*60000); remaining-=take; if(remaining>0){d.setDate(d.getDate()+1);d.setHours(8,0,0,0);} } return d; }

const C={
 users:async(req,res)=>{try{res.json({success:true,data:await M.users()})}catch(e){res.status(500).json({success:false,message:e.message})}},
 createUser:async(req,res)=>{try{const x=await M.createUser(req.body);res.status(201).json({success:true,data:x})}catch(e){res.status(400).json({success:false,message:e.message})}},
 skills:async(req,res)=>{try{res.json({success:true,data:await M.skills()})}catch(e){res.status(500).json({success:false,message:e.message})}},
 createSkill:async(req,res)=>{try{res.status(201).json({success:true,data:await M.createSkill(req.body.name)})}catch(e){res.status(400).json({success:false,message:e.message})}},
 agents:async(req,res)=>{try{res.json({success:true,data:await M.agents()})}catch(e){res.status(500).json({success:false,message:e.message})}},
 createAgent:async(req,res)=>{try{res.status(201).json({success:true,data:await M.createAgent(req.body)})}catch(e){res.status(400).json({success:false,message:e.message})}},
 addSkill:async(req,res)=>{try{res.status(201).json({success:true,data:await M.addAgentSkill(req.body)})}catch(e){res.status(400).json({success:false,message:e.message})}},
 tickets:async(req,res)=>{try{res.json({success:true,data:await M.tickets()})}catch(e){res.status(500).json({success:false,message:e.message})}},
 createTicket:async(req,res)=>{try{res.status(201).json({success:true,data:await M.createTicket(req.body)})}catch(e){res.status(400).json({success:false,message:e.message})}},
 autoAssign:async(req,res)=>{try{const t=await M.ticket(req.params.id);if(!t)return res.status(404).json({success:false,message:'Ticket no encontrado'});const candidates=await M.candidates(t.required_skill_id); if(!candidates.length)return res.status(409).json({success:false,message:'No hay agentes disponibles'}); const weights={skill:.5,availability:.2,load:.2,sla:.1}; const scored=candidates.map(a=>{const skill=(a.skill_level/5)*100;const availability=a.available?100:0;const load=Math.max(0,100-(a.active_tickets/a.max_tickets)*100);const sla=Number(a.sla_compliance);const score=skill*weights.skill+availability*weights.availability+load*weights.load+sla*weights.sla;return {...a,score:Number(score.toFixed(2))}}).sort((a,b)=>b.score-a.score);const winner=scored[0];const hours=await M.sla(t.priority);const due=addBusinessHours(new Date(t.created_at),hours);const assignment=await M.assign(t.id,winner.id,winner.score,due);res.json({success:true,message:'Ticket asignado automaticamente',data:{ticket_id:t.id,agent_id:winner.id,score:winner.score,due_at:due,ranking:scored,assignment}})}catch(e){res.status(500).json({success:false,message:e.message})}}
};
module.exports=C;
