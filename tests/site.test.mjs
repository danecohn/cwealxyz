import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
process.env.NODE_ENV='test';
const {server}=await import('../server.mjs');
let base;
before(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;});
after(()=>new Promise(resolve=>server.close(resolve)));
async function walk(dir){let out=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
const files=await walk('dist');
test('all 25 pages, their internal links, assets, and fragment destinations exist',async()=>{
 const pages=files.filter(x=>x.endsWith('.html')&&!x.endsWith('404.html'));assert.equal(pages.length,25);
 for(const p of pages){
  const html=await readFile(p,'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,p+' needs one h1');
  for(const [,raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const href=raw.replace(/&amp;/g,'&');if(!href.startsWith('/')&&!href.startsWith('#'))continue;
   const url=new URL(href,'https://cweal.xyz/'+p.replace(/^dist\//,''));
   let target=href.startsWith('#')?p:path.join('dist',decodeURIComponent(url.pathname));
   let info=await stat(target).catch(()=>null);assert.ok(info,`${p}: missing ${href}`);
   if(info.isDirectory())target=path.join(target,'index.html');
   if(url.hash){const content=await readFile(target,'utf8');assert.ok(content.includes(`id="${url.hash.slice(1)}"`),`${p}: missing anchor ${href}`);}
  }
 }
});
test('server serves assets with correct types and security headers',async()=>{
 for(const [url,mime] of [['/','text/html'],['/style.css','text/css'],['/app.js','text/javascript'],['/assets/logo/commonweal-mark-512.png','image/png'],['/assets/font/Guild-Regular.woff','font/woff']]){
  const res=await fetch(base+url);assert.equal(res.status,200,url);assert.ok(res.headers.get('content-type').startsWith(mime));assert.equal(res.headers.get('x-content-type-options'),'nosniff');assert.ok((await res.arrayBuffer()).byteLength>0);
 }
});
test('all pages return HTML and nonexistent routes return a real 404',async()=>{
 for(const p of files.filter(x=>x.endsWith('/index.html'))){const r=await fetch(base+'/'+p.replace(/^dist\//,'').replace(/index.html$/,''));assert.equal(r.status,200,p);}
 const r=await fetch(base+'/a-page-that-does-not-exist/');assert.equal(r.status,404);assert.match(await r.text(),/Let’s find/);
});
test('audio supports seeking, HEAD, and invalid range handling',async()=>{
 const file='/assets/music/mp3/01-keystone.mp3';
 const r=await fetch(base+file,{headers:{Range:'bytes=0-99'}});assert.equal(r.status,206);assert.equal(r.headers.get('content-length'),'100');assert.equal((await r.arrayBuffer()).byteLength,100);
 const suffix=await fetch(base+file,{headers:{Range:'bytes=-100'}});assert.equal(suffix.status,206);assert.equal((await suffix.arrayBuffer()).byteLength,100);
 const head=await fetch(base+file,{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.text()).length,0);
 assert.equal((await fetch(base+file,{headers:{Range:'bytes=999999999999-'}})).status,416);
 assert.equal((await fetch(base+file,{headers:{Range:'bytes=abc'}})).status,416);
});
test('search covers all published documents and audio files are present',async()=>{
 const data=JSON.parse(await readFile('dist/search-index.json','utf8'));assert.equal(data.length,18);assert.ok(data.find(x=>x.slug==='manifesto').text.includes('Part XII'));
 const album=JSON.parse(await readFile('dist/assets/music/album.json','utf8'));assert.equal(album.tracks.length,8);for(const track of album.tracks)assert.ok((await stat('dist/assets/music/'+track.mp3)).size>1000);
});
test('healthcheck, caching, redirects, and method restrictions work',async()=>{
 assert.deepEqual(await (await fetch(base+'/health')).json(),{status:'ok',service:'commonweal-hub'});
 assert.equal((await fetch(base+'/commons',{redirect:'manual'})).status,308);
 assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
 const r=await fetch(base+'/style.css');assert.equal((await fetch(base+'/style.css',{headers:{'If-None-Match':r.headers.get('etag')}})).status,304);
});
