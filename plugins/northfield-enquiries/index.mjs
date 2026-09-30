import { definePlugin, definePluginRoute } from 'emdash';
import { createHmac, randomUUID } from 'node:crypto';

const id = 'northfield-enquiries';
export const enquiriesPlugin = () => ({ id, version:'1.0.0', format:'native', entrypoint:'@northfield/enquiries', adminEntry:'@northfield/enquiries/admin' });
const fail = code => ({ ok:false, code });
const text = (value,max) => typeof value==='string' ? value.trim().slice(0,max+1) : '';
export function validateSubmission(input) {
  const value = Object.fromEntries(['kind','property','name','email','phone','address','message','consent','website','intention'].map(k=>[k, typeof input?.get==='function'?input.get(k):Array.isArray(input?.entries)?input.entries.find(e=>e.name===k&&e.kind==='text')?.value:input?.[k]]));
  const data={kind:text(value.kind,20),property:text(value.property,40),name:text(value.name,100),email:text(value.email,254),phone:text(value.phone,30),address:text(value.address,300),message:text(value.message,3000),intention:text(value.intention,20)};
  if(value.website)return {spam:true};
  if(!['viewing','valuation','contact'].includes(data.kind)||data.name.length<2||data.name.length>100||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)||data.email.length>254||data.phone.length>30||data.address.length>300||data.message.length<10||data.message.length>3000||value.consent!=='yes'||(data.kind==='viewing'&&!/^[A-Z0-9]{26}$/.test(data.property))||(data.kind==='valuation'&&(data.address.length<8||!['selling','letting'].includes(data.intention))))return null;
  return data;
}
export function createPlugin() {
 return definePlugin({id,version:'1.0.0',capabilities:['content:read'],storage:{enquiries:{indexes:['createdAt','status']},rate_limits:{indexes:['expiresAt']}},admin:{entry:'@northfield/enquiries/admin',pages:[{path:'/inbox',label:'Private enquiries',icon:'mail'}]},routes:{
  submit:definePluginRoute({public:true,methods:['POST'],request:{body:'form-data',maxBytes:12000,headers:['origin','x-northfield-form']},handler:async ctx=>{
    const expected=new URL(ctx.request.url).origin;
    if(ctx.request.headers.get('origin')!==expected||ctx.request.headers.get('x-northfield-form')!=='1')return fail('ORIGIN_REJECTED');
    const data=validateSubmission(ctx.input);
    if(!data)return fail('INVALID_INPUT');
    if(data.spam)return {ok:true};
    // HMAC pseudonymises the address; the rate-limit table stores no raw IP.
    // Without a trusted proxy IP, fail conservatively to a shared site-wide bucket.
    const secret=process.env.EMDASH_ENCRYPTION_KEY;
    if(!secret)return fail('NOT_CONFIGURED');
    const key=createHmac('sha256',secret).update(ctx.requestMeta?.ip||'local-shared').digest('hex');
    const bucket=`${Math.floor(Date.now()/600000)}:${key}`;
    await ctx.storage.rate_limits.compareAndSet(bucket,null,{count:0,expiresAt:Date.now()+1200000});
    const allowed=await ctx.storage.rate_limits.updateIf(bucket,{where:{count:{lt:15}},delta:{count:{inc:1}}});
    if(!allowed.applied)return fail('RATE_LIMITED');
    const old=await ctx.storage.rate_limits.query({where:{expiresAt:{lt:Date.now()}},limit:100});
    if(old.items.length)await ctx.storage.rate_limits.deleteMany(old.items.map(x=>x.id));
    let property=null;
    if(data.kind==='viewing'){
      property=await ctx.content.get('properties',data.property);
      if(!property||property.status!=='published'||['Sold','Let'].includes(property.data.availability))return fail('PROPERTY_UNAVAILABLE');
    }
    const agents=await ctx.content.list('agents',{limit:100,where:{status:'published'}});
    const assignedTo=agents.items[0]?.id||'';
    const enquiryId=randomUUID();
    await ctx.storage.enquiries.put(enquiryId,{...data,property:data.kind==='viewing'?data.property:'',propertyTitle:property?.data.title||'',assignedTo,status:'New',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),consentVersion:'demo-2026-09',notification:{to:'enquiries@northfield.example',subject:`Northfield demo: ${data.kind} enquiry`,delivery:'captured-locally',body:`Test enquiry ${enquiryId}. Open the private inbox to review.`}});
    return {ok:true}; // Never echo personal data or expose an enquiry lookup token.
  }}),
  list:{methods:['GET'],permission:'content:edit_any',handler:async ctx=>{const result=await ctx.storage.enquiries.query({limit:100,orderBy:{createdAt:'desc'}});const items=await Promise.all(result.items.map(async item=>{const current=await ctx.storage.enquiries.getVersioned(item.id);return current?{...item,data:current.value,revision:current.revision}:null;}));return {ok:true,...result,items:items.filter(Boolean),agents:(await ctx.content.list('agents',{limit:100,where:{status:'published'}})).items.map(a=>({id:a.id,name:a.data.title}))};}},
  update:{methods:['POST'],permission:'content:edit_any',handler:async ctx=>{
    const input=ctx.input;
    if(!input||typeof input.id!=='string'||typeof input.revision!=='string'||typeof input.assignedTo!=='string'||input.assignedTo.length>40||!['New','In progress','Closed'].includes(input.status))return fail('INVALID_INPUT');
    const current=await ctx.storage.enquiries.getVersioned(input.id);
    if(!current)return fail('NOT_FOUND');
    if(input.assignedTo){const agent=await ctx.content.get('agents',input.assignedTo);if(!agent||agent.status!=='published')return fail('INVALID_ASSIGNEE');}
    const result=await ctx.storage.enquiries.compareAndSet(input.id,input.revision,{...current.value,status:input.status,assignedTo:input.assignedTo||'',updatedAt:new Date().toISOString(),updatedBy:ctx.user?.id||'api'});
    return {ok:result.applied,code:result.applied?'UPDATED':'CONFLICT'};
  }},
  version:{methods:['GET'],permission:'content:edit_any',handler:async ctx=>{const key=ctx.input?.id;if(typeof key!=='string')return fail('INVALID_INPUT');const result=await ctx.storage.enquiries.getVersioned(key);return result?{ok:true,...result}:fail('NOT_FOUND');}},
  delete:{methods:['POST'],permission:'content:edit_any',handler:async ctx=>{const input=ctx.input;if(typeof input?.id!=='string'||typeof input?.revision!=='string')return fail('INVALID_INPUT');return {ok:(await ctx.storage.enquiries.compareAndDelete(input.id,input.revision)).applied};}}
 }});
}
