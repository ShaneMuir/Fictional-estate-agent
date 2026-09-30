import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Set this to Cloudways' confirmed persistent directory at build and runtime.
export const dataDirectory = resolve(process.env.NORTHFIELD_DATA_DIR || '.');
export const databasePath = join(dataDirectory, 'data.db');
export const databaseUrl = pathToFileURL(databasePath).href;
export const uploadsDirectory = join(dataDirectory, 'uploads');
