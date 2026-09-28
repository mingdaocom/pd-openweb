import { pathCompletion } from 'src/utils/platform/navigation/path';

export const completeAdminLogLinks = html => {
  if (!html) return html;

  return html.replace(/(\shref\s*=\s*)(["'])(\/(?!\/)[^"']*)\2/gi, (match, prefix, quote, url) => {
    return `${prefix}${quote}${pathCompletion(url, { hasDomain: false })}${quote}`;
  });
};
