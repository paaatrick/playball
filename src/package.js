import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const packagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../package.json');

export default JSON.parse(await fs.readFile(packagePath));
