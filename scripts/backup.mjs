import { databasePath, uploadsDirectory } from '../config/storage.mjs';
import { mkdir, cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative, join } from 'node:path';
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const destination=resolve('backups',stamp);
await mkdir(destination,{recursive:true,mode:0o700});
execFileSync('sqlite3',[databasePath,`.backup '${join(destination,'data.db').replaceAll("'","''")}'`]);
await cp(uploadsDirectory,join(destination,'uploads'),{recursive:true});
const files={};
async function walk(dir){for(const f of await readdir(dir,{withFileTypes:true})){const p=join(dir,f.name);if(f.isDirectory())await walk(p);else files[relative(destination,p)]=createHash('sha256').update(await readFile(p)).digest('hex');}}
await walk(destination);
await writeFile(join(destination,'manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),emdashVersion:'1.0.1',notes:'Database and uploads. Encryption keys must be backed up separately. Quiesce media writes for a consistent coordinated backup.',files},null,2));
const integrity=execFileSync('sqlite3',[join(destination,'data.db'),'PRAGMA integrity_check;'],{encoding:'utf8'}).trim();
if(integrity!=='ok')throw new Error('Backup integrity check failed');
console.log(destination);
