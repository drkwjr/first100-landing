const EXTERNAL_URL_RE = /^[a-z][a-z\d+\-.]*:/i;

export function withBase(path: string): string {
  if (!path || path.startsWith('#') || EXTERNAL_URL_RE.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base === '/' ? '' : base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}` || '/';
}
