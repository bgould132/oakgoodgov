import {defineMiddleware} from 'astro:middleware';
import {parse, serialize} from 'parse5';
import {localePath, localizedPath} from './i18n/locales';
import es from './i18n/es.json';
import hans from './i18n/zh-Hans.json';
import hant from './i18n/zh-Hant.json';
const dictionaries: Record<string,Record<string,string>> = {'es':es,'zh-Hans':hans,'zh-Hant':hant};
const notices: Record<string,{review:string,english:string,form:string,language:string}> = {
  es:{review:'Traducción preliminar pendiente de revisión. Consulte el texto original en inglés.',english:' (en inglés)',form:'El formulario de inscripción está disponible actualmente en inglés.',language:'Idioma'},
  'zh-Hans':{review:'译文为草稿，尚待审核。请参阅英文原文。',english:'（英文）',form:'报名表目前仅提供英文版本。',language:'语言'},
  'zh-Hant':{review:'譯文為草稿，尚待審核。請參閱英文原文。',english:'（英文）',form:'報名表目前僅提供英文版本。',language:'語言'},
};
export const onRequest = defineMiddleware(async (context,next) => {
  const response = await next();
  const {locale} = localePath(context.url.pathname);
  if(locale === 'en' || !response.headers.get('content-type')?.includes('text/html')) return response;
  const dictionary = dictionaries[locale];
  const notice = notices[locale];
  const document = parse(await response.text());
  const missing = new Set<string>();
  function translated(value:string) {
    const key = value.trim();
    if(dictionary[key] !== undefined) return value.replace(key,dictionary[key]);
    if(/[A-Za-z]/.test(key) && !/^(https?:|#|website|noindex|width=)/.test(key)) missing.add(key);
    return value;
  }
  function text(value:string,parent:any) {return {nodeName:'#text',value,parentNode:parent};}
  function visit(node:any,english=false) {
    if(['script','style','noscript'].includes(node.tagName)) return;
    const attrs=node.attrs || [];
    const languageLink=attrs.some((a:any)=>a.name==='data-language-link');
    const get=(name:string)=>attrs.find((a:any)=>a.name===name);
    if(node.tagName==='html') get('lang').value=locale;
    if(languageLink) return;
    if(node.nodeName==='#text') {if(!english) node.value=translated(node.value); return;}
    for(const attr of attrs) {
      if(['alt','aria-label','title','content','data-open-label','data-close-label'].includes(attr.name)) attr.value=attr.value==='Language'?notice.language:translated(attr.value);
      if(attr.name==='href' && node.tagName==='a' && attr.value.startsWith('/') && !attr.value.startsWith('//') && !/^\/(documents|_astro)\//.test(attr.value)) attr.value=localizedPath(attr.value,locale);
    }
    for(const child of [...(node.childNodes || [])]) visit(child,english);
    if(node.tagName==='a' && /\/documents\/.+\.pdf/.test(get('href')?.value || '')) node.childNodes.push(text(notice.english,node));
    if(node.tagName==='iframe') {
      attrs.push({name:'lang',value:'en'});
      const p:any={nodeName:'p',tagName:'p',attrs:[{name:'class',value:'note'}],namespaceURI:'http://www.w3.org/1999/xhtml',childNodes:[],parentNode:node.parentNode};
      p.childNodes=[text(notice.form,p)]; const siblings=node.parentNode.childNodes; siblings.splice(siblings.indexOf(node),0,p);
    }
  }
  visit(document);
  if(missing.size) {
    const message=`[i18n ${locale}] Missing ${missing.size} strings: ${[...missing].join(' | ')}`;
    if(import.meta.env.PROD && import.meta.env.I18N_ALLOW_MISSING !== '1') throw new Error(message);
    console.warn(message);
  }
  const headers=new Headers(response.headers); headers.delete('content-length'); headers.set('Content-Language',locale);
  return new Response(serialize(document),{status:response.status,headers});
});
