function getBtoa(): (input: string) => string {
  const fn = (globalThis as {btoa?: (input: string) => string}).btoa;
  if (!fn) {
    throw new Error('btoa is not available');
  }
  return fn;
}

function getAtob(): (input: string) => string {
  const fn = (globalThis as {atob?: (input: string) => string}).atob;
  if (!fn) {
    throw new Error('atob is not available');
  }
  return fn;
}

export function utf8ToBase64(input: string): string {
  return getBtoa()(unescape(encodeURIComponent(input)));
}

export function base64ToUtf8(input: string): string {
  return decodeURIComponent(escape(getAtob()(input)));
}
