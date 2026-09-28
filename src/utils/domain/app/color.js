/**
 * 根据应用主题色计算应用图标的背景色、前景色和浅色应用项前景色。
 */
export function getAppIconColors(app = {}, fallbackIconColor = 'var(--color-primary)') {
  const iconColor = app.iconColor || fallbackIconColor;
  const navColor = app.navColor || iconColor;
  const isBlackBackground = navColor === '#1b2025';
  const isLightBackground = [app.lightColor, '#ffffff', '#f5f6f7'].includes(navColor);
  const backgroundColor = isLightBackground ? app.lightColor : navColor;

  return {
    backgroundColor,
    iconColor: isBlackBackground || isLightBackground ? iconColor : 'var(--color-white)',
    itemIconColor: isBlackBackground || isLightBackground ? iconColor : backgroundColor,
  };
}
