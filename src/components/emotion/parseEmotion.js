import twemoji from 'twemoji';
import { EMOTION_GROUP_IDS, emotionParseGroups, getEmotionAliases, getEmotionImageSrc } from './data';
import './emotion.less';

export const TWEMOJI_OPTIONS = {
  base: '/staticfiles/images/emotion/twemoji/',
  className: 'emotion-twemoji',
  size: 72,
};

const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PARSE_RULES = emotionParseGroups.flatMap(group =>
  group.content.flatMap(item =>
    getEmotionAliases(item).map(alias => ({
      group,
      item,
      pattern: new RegExp(`\\[${escapeRegExp(alias)}\\]`, 'gi'),
    })),
  ),
);

export function transformHtmlText(html, transform) {
  let result = '';
  let text = '';
  let inTag = false;
  let quote = '';

  const flushText = () => {
    result += transform(text);
    text = '';
  };

  for (const character of String(html || '')) {
    if (!inTag && character === '<') {
      flushText();
      inTag = true;
      result += character;
      continue;
    }

    if (inTag) {
      result += character;

      if (quote) {
        if (character === quote) quote = '';
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === '>') {
        inTag = false;
      }
    } else {
      text += character;
    }
  }

  flushText();
  return result;
}

/** 将经典表情标记和 Unicode emoji 转换为消息展示所需的图片 HTML。 */
export default function parseEmotion(value) {
  const result = transformHtmlText(value, text => {
    let parsedText = text;

    PARSE_RULES.forEach(({ group, item, pattern }) => {
      pattern.lastIndex = 0;
      if (!pattern.test(parsedText)) return;

      pattern.lastIndex = 0;
      const src = getEmotionImageSrc(group, item, { animated: group.id === EMOTION_GROUP_IDS.BEAR });
      const height = group.size ? ` height="${group.size}"` : '';

      parsedText = parsedText.replace(pattern, `<img src="${src}" class="${group.itemClassName}"${height} />`);
    });

    return parsedText;
  });

  return transformHtmlText(result, text => twemoji.parse(text, TWEMOJI_OPTIONS));
}
