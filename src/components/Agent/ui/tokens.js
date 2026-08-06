// 颜色全部走项目主题变量（src/common/mdcss/themes/theme-default.less / theme-dark.less），
// 让 [data-theme='dark'] 下自动切换。新增颜色请在主题层补充变量，避免在组件中硬编码。
export const colors = {
  brand: 'var(--color-mingo)',
  brandHover: 'var(--color-mingo-dark)',
  brandSoft: 'var(--color-mingo-transparent)',
  brandSoftLight: 'var(--color-mingo-transparent-light)',
  background: 'var(--color-background-primary)',
  backgroundMuted: 'var(--color-background-secondary)',
  backgroundHover: 'var(--color-background-hover)',
  backgroundSection: 'var(--color-background-tertiary)',
  backgroundCard: 'var(--color-background-card)',
  border: 'var(--color-border-secondary)',
  borderStrong: 'var(--color-border-primary)',
  borderHover: 'var(--color-border-hover)',
  text: 'var(--color-text-primary)',
  textMuted: 'var(--color-text-secondary)',
  textSubtle: 'var(--color-text-tertiary)',
  textPlaceholder: 'var(--color-text-placeholder)',
  textDisabled: 'var(--color-text-disabled)',
  textInverse: 'var(--color-text-inverse)',
  success: 'var(--color-success)',
  successSoft: 'var(--color-success-bg)',
  error: 'var(--color-error)',
  errorSoft: 'var(--color-error-bg)',
  warning: 'var(--color-warning)',
  warningSoft: 'var(--color-warning-bg)',
  info: 'var(--color-info)',
  infoSoft: 'var(--color-info-bg)',
};
export const radii = {
  soft: '4px',
  userBubble: '5px',
  item: '6px',
  card: '8px',
  input: '10px',
  pill: '999px',
};
export const shadows = {
  floating: 'var(--shadow-lg)',
  subtle: 'var(--shadow-sm)',
};
export const spacing = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  xxl: '16px',
  section: '20px',
  block: '24px',
};
export const typography = {
  fontFamily: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
  monoFamily: "'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', monospace",
};
export const transitions = {
  hover: '0.2s ease',
  height: '0.1s ease',
  expand: '0.2s ease',
};
