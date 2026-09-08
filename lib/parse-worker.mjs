import {parseFiles} from './parser.mjs';
process.once('disconnect',()=>process.exit());
process.once('message',async files=>{
 try {const result=await parseFiles(files);const json=JSON.stringify(result);if(Buffer.byteLength(json)>32*1024*1024)throw Error('Parsed result exceeds 32 MB. Select fewer logs.');process.send({result},()=>process.disconnect());}
 catch(e){process.send({error:e.message},()=>process.disconnect());}
});
