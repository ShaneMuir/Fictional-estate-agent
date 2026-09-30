import { readFile, cp, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve,join } from 'node:path';
const source=resolve(process.argv[2]||'');if(!process.argv[2])throw new Error('Pass a backup directory.');
const manifest=JSON.parse(await readFile(join(source,'manifest.json'),'utf8'));
for(const [file,digest] of Object.entries(manifest.files)){const actual=createHash('sha256').update(await readFile(join(source,file))).digest('hex');if(actual!==digest)throw new Error(`Checksum mismatch: ${file}`);}
const target=resolve('backups','restore-check-'+Date.now());await mkdir(target,{recursive:true,mode:0o700});await cp(source,target,{recursive:true});
const result=execFileSync('sqlite3',[join(target,'data.db'),'PRAGMA integrity_check; SELECT COUNT(*) FROM ec_properties WHERE status="published" AND deleted_at IS NULL;'],{encoding:'utf8'}).trim();
if(result!=='ok\n30')throw new Error(`Unexpected restored database state: ${result}`);
console.log(JSON.stringify({restoredTo:target,integrity:'ok',publishedProperties:30,verifiedFiles:Object.keys(manifest.files).length}));
