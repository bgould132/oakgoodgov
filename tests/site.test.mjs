import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'dist');
const settings = JSON.parse(readFileSync(resolve(root, 'src/content/site.json'), 'utf8'));
const walk = directory => readdirSync(directory).flatMap(name => {
  const path = join(directory, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
assert.ok(existsSync(dist), 'Run npm run build before npm test');
const pages = walk(dist).filter(path => path.endsWith('.html'));

test('build includes English and three translated versions', () => {
  assert.equal(pages.length, 60);
  for (const path of ['index.html', 'about/index.html', 'donate/index.html', 'endorsements/index.html', 'get-involved/index.html', 'measure/index.html', 'sources/index.html', 'issues/power/index.html', 'issues/representation/index.html', 'issues/accountability/index.html', 'issues/cost/index.html', 'model-city-charter/index.html', 'privacy/index.html', 'terms/index.html', '404.html']) {
    assert.ok(existsSync(resolve(dist, path)), path);
  }
});

for (const page of pages) {
  const name = relative(dist, page);
  const html = readFileSync(page, 'utf8');
  test(`${name}: landmarks, metadata, and draft protection`, () => {
    assert.equal((html.match(/<h1\b/g) || []).length, 1, 'one main heading');
    const locale = name.match(/^(es|zh-Hans|zh-Hant)\//)?.[1] || 'en';
    assert.ok(html.includes(`<html lang="${locale}">`));
    assert.match(html, /<main id="main"/);
    assert.match(html, /name="description" content="[^"]+"/);
    if (settings.draft) assert.match(html, /name="robots" content="noindex, nofollow"/);
  });
  test(`${name}: internal links and files resolve`, () => {
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(raw.replaceAll('&amp;', '&'), 'https://draft.example/' + name.replace('index.html', ''));
      if (url.origin !== 'https://draft.example') continue;
      let target = resolve(dist, '.' + decodeURIComponent(url.pathname));
      if (url.pathname.endsWith('/')) target = join(target, 'index.html');
      assert.ok(existsSync(target), `${raw} resolves`);
      if (url.hash && target.endsWith('.html')) {
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(readFileSync(target, 'utf8').includes(`id="${id}"`), `${raw} anchor exists`);
      }
    }
  });
}

test('hero is responsive and eager, not lazy-loaded', () => {
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  const image = html.match(/<img[^>]*class="hero-photo"[^>]*>/)?.[0] ?? html.match(/<img[^>]*fetchpriority="high"[^>]*>/)?.[0];
  assert.ok(image);
  assert.match(image, /srcset=/);
  assert.match(image, /loading="eager"/);
  assert.match(image, /fetchpriority="high"/);
  assert.match(image, /width="\d+"/);
  assert.match(image, /height="\d+"/);
});

test('donations are honest and no private research is published', () => {
  if (settings.donationUrl) assert.match(settings.donationUrl, /^https:\/\//);
  else assert.match(readFileSync(join(dist, 'donate/index.html'), 'utf8'), /Donations are not open yet/);
  assert.ok(!existsSync(join(dist, 'references')));
  assert.ok(!existsSync(join(dist, 'user-materials')));
});

test('primary source downloads are actual PDFs', () => {
  for (const file of ['measure-ee-adopted-text.pdf', 'auditor-financial-analysis.pdf', 'working-group-report.pdf']) {
    assert.equal(readFileSync(join(dist, 'documents', file)).subarray(0, 5).toString(), '%PDF-');
  }
});

test('full organization identity and quiet draft protection', () => {
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.match(html, /Oakland Residents for Good Government/);
  assert.doesNotMatch(html, /WORKING DRAFT|draft-bar/);
});

test('signup uses a separate HTTPS form or an honest inactive state', () => {
  const html = readFileSync(join(dist, 'get-involved/index.html'), 'utf8');
  if (settings.signupUrl) {
    assert.match(settings.signupUrl, /^https:\/\//);
    assert.match(html, /<iframe[^>]+title="Oakland Residents for Good Government signup form"/);
    assert.match(html, /embedded=true/);
    assert.match(html, /Open the form directly/);
  } else assert.match(html, /Signup form coming shortly/);
  assert.doesNotMatch(html, /<form\b|<input\b/);
});

test('endorsements include ballot signers and added endorsers', () => {
  const people = JSON.parse(readFileSync(resolve(root, 'src/content/endorsements.json'), 'utf8'));
  assert.equal(people.signers.length, 10);
  assert.equal(people.signers.filter(person => person.page !== undefined).length, 9);
  const html = readFileSync(join(dist, 'endorsements/index.html'), 'utf8');
  for (const person of people.signers) {
    assert.ok(html.includes(person.name));
    if (person.page !== undefined) assert.ok([30,31].includes(person.page));
  }
  assert.match(html, /Titles for identification purposes only/);
  assert.equal((html.match(/class="endorser-photo"/g) || []).length, 6);
});
