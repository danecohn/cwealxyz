import {mkdir,readFile,writeFile,cp,rm} from 'node:fs/promises';
import path from 'node:path';
import {documents,levels} from '../src/content.mjs';
import {shell,home,commons,commonwealths,governance,participate,culture,privacy,notFound,reader} from '../src/templates.mjs';
import {renderMarkdown} from '../src/markdown.mjs';
const root=new URL('../',import.meta.url), out=new URL('../dist/',import.meta.url);
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await cp(new URL('public/',root),out,{recursive:true});
await cp(new URL('content/',root),new URL('sources/',out),{recursive:true});
for(const name of ['style.css','app.js'])await cp(new URL('src/'+name,root),new URL(name,out));
const album=JSON.parse(await readFile(new URL('public/assets/music/album.json',root),'utf8'));
const provenance=JSON.parse(await readFile(new URL('content/provenance.json',root),'utf8'));
const pages=[['','The system of the common good',home()],['commons','The commons',commons(documents)],['commonwealths','A nation of commonwealths',commonwealths(levels)],['governance','Power that answers to people',governance()],['participate','Help build the common good',participate()],['culture','Art, craft & common memory',culture(album)],['privacy','Privacy & accessibility',privacy()]];
const search=[];
for(const d of documents){
 const raw=await readFile(new URL('content/'+d.file,root),'utf8');
 const {html,toc}=renderMarkdown(raw,d.file,documents);
 pages.push([`read/${d.slug}`,d.title,reader(d,html,toc,provenance)]);
 search.push({...d,url:`/read/${d.slug}/`,text:raw.replace(/^---[\s\S]*?---\n/,'').replace(/[#*`>|]/g,'')});
}
for(const [route,title,body]of pages){
 const dir=new URL(route?route+'/':'',out);await mkdir(dir,{recursive:true});
 await writeFile(new URL('index.html',dir),shell(title,body,route));
}
await writeFile(new URL('search-index.json',out),JSON.stringify(search));
await writeFile(new URL('404.html',out),shell('Page not found',notFound(),'404'));
await writeFile(new URL('robots.txt',out),'User-agent: *\nAllow: /\nSitemap: https://cweal.xyz/sitemap.xml\n');
await writeFile(new URL('sitemap.xml',out),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([route])=>`<url><loc>https://cweal.xyz/${route?route+'/':''}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.length} pages, ${search.length} searchable documents, and ${album.tracks.length} tracks.`);
