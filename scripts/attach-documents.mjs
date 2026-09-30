import { login,api,upload,update,publish } from './api.mjs';
await login();
const media={};
for(const kind of ['floorplan','brochure','epc']){
  const result=await api('media?limit=100');
  const item=result.items?.find(m=>m.filename===`demo-${kind}.pdf`) || await upload(`output/pdf/demo-${kind}.pdf`);
  media[kind]={provider:'local',id:item.id,filename:item.filename,mimeType:item.mimeType,url:item.url||`/_emdash/api/media/file/${item.storageKey}`,meta:{storageKey:item.storageKey}};
}
const properties=(await api('content/properties?limit=100')).items;
for(const p of properties){
 await update('properties',p.id,{floorplan:media.floorplan,floorplans:[],brochure:media.brochure,epc:media.epc});
 await publish('properties',p.id);
}
console.log(`Attached and published sample PDFs on ${properties.length} properties.`);
