import path from 'node:path';
export const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderMarkdown(markdown,file,documents){
 const toc=[],ids=new Map();
 function link(url){
  if(/^https?:\/\//.test(url))return url;
  if(url.startsWith('#'))return url;
  const normalized=path.posix.normalize(path.posix.join(path.posix.dirname(file),url));
  const found=documents.find(d=>d.file===normalized);
  return found?`/read/${found.slug}/`:`https://github.com/danecohn/Commonweal/blob/main/${normalized}`;
 }
 function inline(s){return escape(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,t,u)=>`<a href="${escape(link(u))}">${t}</a>`).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/`([^`]+)`/g,'<code>$1</code>');}
 const lines=markdown.replace(/^---\n[\s\S]*?\n---\n/,'').split('\n');let html='',para=[],list=null,code=null,quote=[];
 const flush=()=>{if(para.length){html+=`<p>${inline(para.join(' '))}</p>`;para=[];}if(list){html+=`<${list.tag}>${list.items.map(x=>`<li>${inline(x)}</li>`).join('')}</${list.tag}>`;list=null;}if(quote.length){html+=`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`;quote=[];}};
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(line.trim().startsWith('```')){flush();if(code!==null){html+=`<pre><code>${escape(code.join('\n'))}</code></pre>`;code=null;}else code=[];continue;}
  if(code!==null){code.push(line);continue;}
  if(!line.trim()){flush();continue;}
  if(/^---+$/.test(line)){flush();html+='<hr>';continue;}
  const heading=/^(#{1,6}) (.+)$/.exec(line);
  if(heading){flush();if(heading[1].length===1)continue;let id=heading[2].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');const count=ids.get(id)||0;ids.set(id,count+1);if(count)id+='-'+count;const level=heading[1].length;toc.push({level,id,title:heading[2]});html+=`<h${level} id="${id}">${inline(heading[2])}</h${level}>`;continue;}
  if(line.startsWith('|')&&lines[i+1]?.match(/^\|[\s:|-]+\|$/)){
   flush();const cells=s=>s.split('|').slice(1,-1).map(x=>x.trim());
   const head=cells(line);i+=2;const rows=[];while(lines[i]?.startsWith('|')){rows.push(cells(lines[i]));i++;}i--;
   html+=`<div class="table-scroll"><table><thead><tr>${head.map(x=>`<th>${inline(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${inline(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;continue;
  }
  if(line.startsWith('>')){if(para.length||list)flush();quote.push(line.replace(/^> ?/,''));continue;}
  const item=/^\s*(?:([-*]) |(\d+)\. )(.+)$/.exec(line);
  if(item){if(para.length||quote.length)flush();const tag=item[2]?'ol':'ul';if(list&&list.tag!==tag)flush();list??={tag,items:[]};list.items.push(item[3]);continue;}
  if(list&&/^\s+/.test(line)){list.items[list.items.length-1]+=' '+line.trim();continue;}
  if(list||quote.length)flush();para.push(line.trim());
 }
 flush();return {html,toc};
}
