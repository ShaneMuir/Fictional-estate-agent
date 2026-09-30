export const origin=process.env.NORTHFIELD_URL||'http://127.0.0.1:4321';
let cookie='';
export async function login(){const response=await fetch(origin+'/_emdash/api/auth/dev-bypass');if(!response.ok)throw new Error('Local development authentication failed');await response.text();cookie=response.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');}
export async function request(path,{method='GET',body,auth=true,headers={}}={}){return fetch(origin+path,{method,headers:{...(auth?{cookie,'X-EmDash-Request':'1'}:{}),...(body?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});}
export async function api(path,options){const response=await request('/_emdash/api/'+path,options);const result=await response.json();if(!response.ok||!result.success)throw new Error(`${path}: ${response.status} ${JSON.stringify(result.error)}`);return result.data;}
export async function get(collection,id){return api(`content/${collection}/${id}`);}
export async function update(collection,id,data){const current=await get(collection,id);return api(`content/${collection}/${id}`,{method:'PUT',body:{data,_rev:current._rev}});}
export async function publish(collection,id){const current=await get(collection,id);return api(`content/${collection}/${id}/publish`,{method:'POST',body:{_rev:current._rev}});}
export async function upload(path){const {readFile}=await import('node:fs/promises');const {EmDashClient}=await import('emdash/client');const client=new EmDashClient({baseUrl:origin,devBypass:true});return client.mediaUpload(await readFile(path),path.split('/').pop(),{contentType:'application/pdf'});}
