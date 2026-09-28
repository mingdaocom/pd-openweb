import _ from 'lodash';

/** 将 CSS 颜色变量解析为实际颜色值，普通颜色保持原值。 */
export const getColorValue = (color = '') => {
  if (_.isString(color) && color.includes('var(')) {
    const match = color.match(/var\((--[^)]+)\)/);

    if (match) {
      return getComputedStyle(document.body).getPropertyValue(match[1]);
    }
  }

  return color;
};

/**
 * 将十六进制颜色与透明度组合为 rgba 颜色字符串。
 */
export const getRgbaByColor = (color, alpha) => {
  color = getColorValue(color);
  const sColorChange = [];

  for (let i = 1; i < 7; i += 2) {
    sColorChange.push(parseInt(`0x${color.slice(i, i + 2)}`));
  }

  return `rgba(${sColorChange.join(',')},${alpha})`;
};
