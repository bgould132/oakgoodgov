export const locales = ['en', 'es', 'zh-Hans', 'zh-Hant'] as const;
export const labels = { en: 'English', es: 'Español', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文' };
export function localePath(path: string) {
  const match = path.match(/^\/(es|zh-Hans|zh-Hant)(\/.*)?$/);
  return { locale: match?.[1] || 'en', path: match?.[2] || (match ? '/' : path) };
}
export function localizedPath(path: string, locale: string) { return locale === 'en' ? path : `/${locale}${path}`; }
