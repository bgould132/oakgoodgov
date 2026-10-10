import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {parse} from 'parse5';
const strings = new Set();
function visit(node) {
  if (['script','style','noscript'].includes(node.tagName)) return;
  if ((node.attrs || []).some(attr => attr.name === 'data-language-link')) return;
  if (node.nodeName === '#text' && /[A-Za-z]/.test(node.value.trim())) strings.add(node.value.trim());
  for (const attr of node.attrs || []) if (['alt','aria-label','title','content'].includes(attr.name) && /[A-Za-z]/.test(attr.value) && !/^(https?:|#|website|noindex|width=)/.test(attr.value)) strings.add(attr.value);
  for (const child of node.childNodes || []) visit(child);
}
function scan(dir) { for (const item of readdirSync(dir,{withFileTypes:true})) { const p=join(dir,item.name); if(item.isDirectory() && !['_astro','documents','es','zh-Hans','zh-Hant'].includes(item.name)) scan(p); else if(item.isFile() && item.name.endsWith('.html')) visit(parse(readFileSync(p,'utf8'))); } }
scan('dist');
writeFileSync('src/i18n/source-strings.json', JSON.stringify([...strings].sort(),null,2)+'\n');
