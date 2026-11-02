import openapiTS,{astToString} from 'openapi-typescript';
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const source=process.env.OPENAPI_SOURCE;
const url=source?pathToFileURL(resolve(source)):new URL('https://api.0xbot.org/openapi.json');
const ast=await openapiTS(url);
await mkdir('src/api',{recursive:true});
await writeFile('src/api/schema.d.ts',astToString(ast));

