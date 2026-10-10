import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse} from 'parse5';
const root=new URL('../',import.meta.url);
for(const locale of ['es','zh-Hans','zh-Hant']) {
  test(`${locale}: complete source dictionary`,()=>{
    const sources=JSON.parse(readFileSync(new URL('src/i18n/source-strings.json',root)));
    const dictionary=JSON.parse(readFileSync(new URL(`src/i18n/${locale}.json`,root)));
    // Empty translations are valid for English articles omitted in Chinese.
    for(const source of sources) assert.ok(typeof dictionary[source]==='string',`Missing: ${source}`);
  });
  test(`${locale}: translated routes preserve links and metadata`,()=>{
    const html=readFileSync(new URL(`dist/${locale}/index.html`,root),'utf8');
    assert.ok(html.includes(`lang="${locale}"`));
    assert.ok(html.includes(`href="/${locale}/issues/cost/"`));
    assert.ok(html.includes('hreflang="en"'));
    assert.ok(!html.includes('translation-notice'));
    const form=readFileSync(new URL(`dist/${locale}/get-involved/index.html`,root),'utf8');
    assert.ok(form.includes('docs.google.com/forms/'));
    assert.ok(form.includes('lang="en"'));
    const policies=readFileSync(new URL(`dist/${locale}/privacy/index.html`,root),'utf8');
    assert.ok(policies.includes('oakgoodgov@gmail.com'));
    const links=[];
    function walk(node) { if(node.tagName==='a' && node.attrs.some(a=>a.name==='data-language-link')) links.push(node.attrs.find(a=>a.name==='href').value); for(const child of node.childNodes || []) walk(child); }
    walk(parse(policies));
    assert.deepEqual(links,['/privacy/','/es/privacy/','/zh-Hans/privacy/','/zh-Hant/privacy/']);
  });
}
