export const encodeQueryString = (obj: Record<string, string>): string => Object.keys(obj).map((k) => `${k}=${encodeURIComponent(obj[k])}`).join('&');
