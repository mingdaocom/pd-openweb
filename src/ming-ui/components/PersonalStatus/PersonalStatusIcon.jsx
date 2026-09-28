import React from 'react';
import twemoji from 'twemoji';
import filterXss from 'xss';

const LEGACY_EMOTION_IMAGE_PATTERN = /^\/staticfiles\/images\/emotion\/[\w./-]+$/;
const TWEMOJI_OPTIONS = {
  base: '/staticfiles/images/emotion/twemoji/',
  className: 'emotion-twemoji',
  size: 72,
};

export const isLegacyEmotionImageUrl = value => LEGACY_EMOTION_IMAGE_PATTERN.test(String(value || ''));

export const getPersonalStatusIconHtml = icon => {
  const safeIcon = filterXss(String(icon || ''), {
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
    whiteList: {},
  });

  return twemoji.parse(safeIcon, TWEMOJI_OPTIONS);
};

export default function PersonalStatusIcon({ className, icon }) {
  if (isLegacyEmotionImageUrl(icon)) {
    return <img alt="" className={className} src={icon} />;
  }

  return <span className={className} dangerouslySetInnerHTML={{ __html: getPersonalStatusIconHtml(icon) }} />;
}
