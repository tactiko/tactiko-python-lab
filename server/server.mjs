import http from 'node:http';
import {askSavedAgent,DEFAULT_AGENT_ID} from './agent.mjs';
const port=Number(process.env.PORT||3000);
const origin=process.env.ALLOWED_ORIGIN||'https://tactiko.github.io';
const key=process.env.OPENAI_API_KEY;
const agentId=process.env.OPENAI_AGENT_ID||DEFAULT_AGENT_ID;
const client=key ? new (await import('openai')).default({apiKey:key,timeout:180000,maxRetries:0}) : null;
const rate=new Map();let daily=0,day=new Date().toISOString().slice(0,10);
const maxDaily=Number(process.env.MAX_DAILY_REQUESTS||200);
setInterval(()=>{const now=Date.now();for(const [k,v]of rate)if(v.until<now)rate.delete(k)},60000).unref();
function send(res,status,data,allowed){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...(allowed?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})});res.end(JSON.stringify(data))}
const server=http.createServer(async(req,res)=>{
 const allowed=req.headers.origin===origin;
 if(req.url==='/health'&&req.method==='GET')return send(res,200,{status:'ok',aiConfigured:Boolean(key),agentConfigured:Boolean(agentId)},allowed);
 if(req.url!=='/api/chat')return send(res,404,{error:'Not found'},allowed);
 if(!allowed)return send(res,403,{error:'Origin not allowed'},false);
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'});return res.end()}
 if(req.method!=='POST')return send(res,405,{error:'Use POST'},allowed);
 if(!key)return send(res,503,{error:'AI key has not been configured on the server.'},allowed);
 const ip=req.socket.remoteAddress||'unknown',now=Date.now();const bucket=rate.get(ip);if(bucket&&bucket.until>now&&bucket.n>=10)return send(res,429,{error:'Please wait before sending more questions.'},allowed);if(!bucket||bucket.until<=now)rate.set(ip,{n:1,until:now+60000});else bucket.n++;
 const today=new Date().toISOString().slice(0,10);if(today!==day){daily=0;day=today}if(daily>=maxDaily)return send(res,429,{error:'The tutor has reached its daily request limit.'},allowed);
 try{let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>12000)return send(res,413,{error:'Request is too large.'},allowed)}const data=JSON.parse(raw);if(typeof data.question!=='string'||!data.question.trim()||data.question.length>2000)return send(res,400,{error:'Question must contain 1–2000 characters.'},allowed);
 const history=Array.isArray(data.history)?data.history.slice(-6).filter(x=>x&&['user','assistant'].includes(x.role)&&typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,2500)})):[];
 daily++;
 const result=await askSavedAgent(client,{question:data.question,language:data.language,lesson:String(data.lesson||'Python basics').slice(0,120),history},agentId);
 send(res,200,{answer:result.answer},allowed)
 }catch{return send(res,502,{error:'The saved Python Tutor could not complete the request. Check agent project access, API billing, and server logs.'},allowed)}
});server.requestTimeout=15000;server.listen(port,()=>console.log(`Tutor server listening on port ${port}`));
