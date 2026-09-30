import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { login, api, get, update, publish, request, origin } from './api.mjs';
const checks=[];
const workflowSlug='workflow-demo-'+Date.now();
function check(name,condition){assert.ok(condition,name);checks.push(name);console.log('PASS',name);}
async function html(path){const r=await request(path,{auth:false});return {status:r.status,headers:r.headers,text:await r.text()};}
const countCards=t=>(t.match(/class="property-card"/g)||[]).length;
await login();
const properties=(await api('content/properties?limit=100')).items.filter(p=>p.slug!=='workflow-demonstration');
check('30 fictional properties seeded',properties.length===30);
for(const [collection,count] of [['branches',2],['agents',4],['areas',3],['articles',3]])check(`${count} ${collection} seeded`,(await api(`content/${collection}?limit=100`)).items.length===count);
const routes=['/','/sales','/lettings','/selling','/letting','/valuation','/areas','/branches','/about','/contact','/advice','/privacy','/cookies',...properties.map(p=>'/properties/'+p.slug),'/areas/alderwick','/areas/mereford','/areas/bracken-hill','/branches/alderwick-office','/branches/mereford-office','/advice/preparing-your-home','/advice/finding-your-neighbourhood','/advice/rental-viewing-notes'];
for(const route of routes){const r=await html(route);assert.equal(r.status,200,route);assert.ok(r.headers.get('x-robots-tag')?.includes('noindex'),route);assert.ok(r.text.includes('FICTIONAL DEMO'),route);}
check(`${routes.length} public routes render with noindex and fictional notice`,true);
check('Unknown page returns HTTP 404',(await html('/not-a-real-page')).status===404);
check('Unknown property returns HTTP 404',(await html('/properties/not-a-real-property')).status===404);
check('robots.txt blocks all crawling',(await html('/robots.txt')).text.includes('Disallow: /'));
check('Sales first page has nine cards',countCards((await html('/sales')).text)===9);
check('Sales third page has two cards',countCards((await html('/sales?page=3')).text)===2);
check('Lettings has separate ten-property catalogue',countCards((await html('/lettings?page=2')).text)===1);
const expected=properties.filter(p=>p.data.market==='sale'&&p.data.location==='Alderwick'&&p.data.price>=400000&&p.data.price<=900000&&p.data.bedrooms>=2&&p.data.property_type==='Detached');
const filtered=await html('/sales?location=Alderwick&min=400000&max=900000&beds=2&type=Detached&sort=price_asc');
check('Combined location/price/bedrooms/type filters',countCards(filtered.text)===expected.length&&expected.every(p=>filtered.text.includes(p.slug)));
check('Search empty state',countCards((await html('/sales?location=nowhere')).text)===0);
const asc=(await html('/sales?sort=price_asc')).text;const sorted=properties.filter(p=>p.data.market==='sale').sort((a,b)=>a.data.price-b.data.price);
check('Ascending price order',asc.indexOf(`/properties/${sorted[0].slug}`)<asc.indexOf(`/properties/${sorted[8].slug}`));
const detail=await html('/properties/the-old-rectory');check('Related branch, agent and area are rendered',['Eleanor Hart','Alderwick branch','/areas/alderwick'].every(x=>detail.text.includes(x)));
for(const prop of properties){const current=(await get('properties',prop.id)).item;for(const field of ['floorplan','brochure','epc']){assert.ok(current.data[field]?.id,field);const url=current.data[field].url || `/_emdash/api/media/file/${current.data[field].meta.storageKey}`;assert.equal((await html(url)).status,200,url);}}
check('All 30 properties have readable CMS floorplan, brochure and EPC attachments',true);
// Create a new draft and exercise the real HTTP lifecycle, leaving it trashed afterwards.
const sampleData={...properties[0].data};delete sampleData.video_link;
const created=await api('content/properties',{method:'POST',body:{slug:workflowSlug,status:'draft',data:{...sampleData,title:'Workflow Demonstration',reference:'TEST-WORKFLOW',availability:'Available'}}});
const id=created.item.id;
try{
 check('New property draft is not public',(await html(`/properties/${workflowSlug}`)).status===404);
 const preview=await api(`content/properties/${id}/preview-url`,{method:'POST',body:{expiresIn:'5m'}});
 const previewUrl=new URL(preview.url,origin);
 const rendered=await html(previewUrl.pathname+previewUrl.search);
 check('Signed preview renders unpublished property',rendered.status===200&&rendered.text.includes('Workflow Demonstration'));
 check('Unsigned preview remains inaccessible',(await html(`/properties/${workflowSlug}`)).status===404);
 await publish('properties',id);
 check('Publishing exposes the property',(await html(`/properties/${workflowSlug}`)).status===200);
 const baseline=(await get('properties',id)).item.liveRevisionId;
 await update('properties',id,{title:'Workflow Edited Draft'});
 check('Unpublished edits do not leak',(await html(`/properties/${workflowSlug}`)).text.includes('<h1')&&!(await html(`/properties/${workflowSlug}`)).text.includes('Workflow Edited Draft'));
 await publish('properties',id);
 check('Published edit appears',(await html(`/properties/${workflowSlug}`)).text.includes('Workflow Edited Draft'));
 await update('properties',id,{availability:'Sold'});await publish('properties',id);
 const sold=(await get('properties',id)).item;
 check('Sold availability is independent of published status',sold.status==='published'&&sold.data.availability==='Sold'&&(await html(`/properties/${workflowSlug}`)).text.includes('Sold'));
 await api(`revisions/${baseline}/restore`,{method:'POST',body:{}});await publish('properties',id);
 const restored=(await get('properties',id)).item;
 check('Restoring and publishing an earlier revision works',restored.data.title==='Workflow Demonstration'&&restored.data.availability==='Available');
}finally{await api(`content/properties/${id}`,{method:'DELETE'});}
const shared=await get('site_content','global');const original=shared.item.data.shared_cta_heading;
try{await update('site_content',shared.item.id,{shared_cta_heading:'Shared content verification'});await publish('site_content',shared.item.id);check('Shared content update reaches homepage and selling page',(await html('/')).text.includes('Shared content verification')&&(await html('/selling')).text.includes('Shared content verification'));}finally{await update('site_content',shared.item.id,{shared_cta_heading:original});await publish('site_content',shared.item.id);}
const plugin='plugins/northfield-enquiries/';
async function submit(data,headers={}){const r=await fetch(origin+'/_emdash/api/'+plugin+'submit',{method:'POST',headers:{origin,'X-Northfield-Form':'1',...headers},body:new URLSearchParams(data)});return {status:r.status,value:await r.json()};}
const valid={kind:'viewing',property:properties.find(p=>p.slug==='the-old-rectory').id,name:'Automated Demo Visitor',email:'test@example.test',phone:'01632 960999',message:'Fictional automated verification enquiry. No real appointment.',consent:'yes'};
check('Invalid email rejected',!(await submit({...valid,email:'invalid'})).value.data?.ok);
check('Missing consent rejected',!(await submit({...valid,consent:''})).value.data?.ok);
check('Cross-origin submission rejected',!(await submit(valid,{origin:'https://elsewhere.example'})).value.data?.ok);
check('Draft/nonexistent property rejected',!(await submit({...valid,property:'00000000000000000000000000'})).value.data?.ok);
check('Sold listing cannot receive viewing enquiry',!(await submit({...valid,property:properties.find(p=>p.data.availability==='Sold').id})).value.data?.ok);
check('Valid viewing enquiry is accepted',(await submit(valid)).value.data?.ok===true);
check('Valid valuation enquiry is accepted',(await submit({...valid,kind:'valuation',property:'',address:'1 Fictional Test Lane',intention:'selling'})).value.data?.ok===true);
const inbox=await api(plugin+'list');const saved=inbox.items.find(x=>x.data.name===valid.name&&x.data.kind==='viewing');
check('Enquiry persists privately with property, assignment and test email capture',saved?.data.property===valid.property&&saved?.data.assignedTo&&saved?.data.status==='New'&&saved?.data.notification.to==='enquiries@northfield.example');
let version=await api(plugin+'version?id='+saved.id);
check('Editor assignment/status can be updated',(await api(plugin+'update',{method:'POST',body:{id:saved.id,revision:version.revision,status:'In progress',assignedTo:inbox.agents[1].id}})).ok);
check('Stale enquiry updates are rejected',!(await api(plugin+'update',{method:'POST',body:{id:saved.id,revision:version.revision,status:'Closed',assignedTo:inbox.agents[0].id}})).ok);
for(const route of ['list','version?id='+saved.id]){const r=await request('/_emdash/api/'+plugin+route,{auth:false});check(`Anonymous access blocked: ${route.split('?')[0]}`,r.status===401||r.status===403);}
const publicContent=await request('/_emdash/api/content/enquiries',{auth:false});check('No public enquiry collection',publicContent.status>=400);
// Temporary role fixture: only the official development account is changed, restored in finally.
const setRole=role=>execFileSync('sqlite3',['data.db',`UPDATE users SET role=${role} WHERE email='dev@emdash.local';`]);
try{
 for(const [role,label,allowed] of [[10,'Subscriber',false],[20,'Contributor',false],[30,'Author',false],[40,'Editor',true]]){
  setRole(role);const r=await request('/_emdash/api/'+plugin+'list');check(`${label} enquiry permission`,allowed?r.status===200:r.status===403);
  if(role===20){const r=await request(`/_emdash/api/content/properties/${valid.property}/publish`,{method:'POST',body:{}});check('Contributor cannot publish',r.status===403);}
  if(role===40){const r=await request('/_emdash/api/admin/users');check('Editor cannot manage users',r.status===403);}
 }
}finally{setRole(50);}
check('Development admin role restored',(await request('/_emdash/api/admin/users')).status===200);
await mkdir('docs',{recursive:true});await writeFile('docs/verification.json',JSON.stringify({checkedAt:new Date().toISOString(),baseUrl:origin,checks,passed:checks.length},null,2));console.log(`\n${checks.length} checks passed.`);
