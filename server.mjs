import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat,readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff':'font/woff','.ttf':'font/ttf','.mp3':'audio/mpeg','.md':'text/markdown; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
export const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'");
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
  if(pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(req.method==='HEAD'?undefined:JSON.stringify({status:'ok',service:'commonweal-hub'}));}
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
  try{
    let info=await stat(file);
    if(info.isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(308,{'Location':pathname+'/'});return res.end();}
      file=path.join(file,'index.html');info=await stat(file);
    }
    const type=types[path.extname(file)]||'application/octet-stream';
    res.setHeader('Content-Type',type);res.setHeader('Accept-Ranges','bytes');
    res.setHeader('Cache-Control',type.startsWith('text/html')?'no-cache':'public, max-age=3600');
    const etag=`"${info.size}-${Math.floor(info.mtimeMs)}"`;res.setHeader('ETag',etag);
    if(req.headers['if-none-match']===etag){res.writeHead(304);return res.end();}
    let start=0,end=info.size-1,status=200;
    if(req.headers.range){
      const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
      if(!m[1])start=Math.max(0,info.size-Number(m[2]));
      else {start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
      if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
      status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);
    }
    res.writeHead(status,{'Content-Length':end-start+1});
    if(req.method==='HEAD')return res.end();
    createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
  }catch{
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    res.end(req.method==='HEAD'?undefined:await readFile(path.join(root,'404.html')));
  }
});
if(process.env.NODE_ENV!=='test')server.listen(Number(process.env.PORT)||8080,'0.0.0.0',()=>console.log(`Commonweal is ready at http://localhost:${process.env.PORT||8080}`));
