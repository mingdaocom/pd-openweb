import { TinyColor } from '@ctrl/tinycolor';
import { browserIsMobile } from 'src/utils/platform/browser/device';

/**
 * 返回移动端跟随系统、桌面端浅色的默认主题模式。
 */
export const getDefaultThemeMode = () => {
  return browserIsMobile() ? 'system' : 'light';
};

/**
 * 向页面注入应用主色、悬停色与高亮色 CSS 变量。
 */
export function setAppThemeColor(color) {
  const parsedColor = new TinyColor(color);

  if (!parsedColor.isValid) return false;

  const normalizedColor = parsedColor.toHexString();
  const style = document.getElementById('app-theme-color-style') || document.createElement('style');
  style.id = 'app-theme-color-style';
  style.textContent = `:root { --app-primary-color: ${normalizedColor}; --app-primary-hover-color: ${new TinyColor(
    normalizedColor,
  )
    .darken(5)
    .toString()};  --app-highlight-color: ${new TinyColor(normalizedColor).setAlpha(0.2).toRgbString()}}`;

  if (!style.parentNode) document.head.appendChild(style);
  return true;
}

/**
 * 根据显式设置或系统偏好切换页面及移动端主题标记。
 */
export const setBodyThemeMode = value => {
  const isMobile = browserIsMobile();

  const theme =
    value === 'light' || value === 'dark'
      ? value
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // 设置 ant mobile 主题
  if (isMobile) {
    document.documentElement.setAttribute('data-prefers-color-scheme', theme);
  }
};
