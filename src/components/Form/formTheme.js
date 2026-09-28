// 根据实际 DOM 层级解析变量，使 Modal 弹层回退到全局禁用态主题。
const DISABLED_CONTROL_THEME = {
  colorBgContainerDisabled: 'var(--form-control-disabled-bg, var(--color-background-disabled))',
  colorBorderDisabled: 'var(--form-control-disabled-border, var(--color-background-disabled))',
  colorTextDisabled: 'var(--form-control-disabled-text, var(--color-text-disabled))',
};

export const FORM_THEME = {
  components: {
    Input: DISABLED_CONTROL_THEME,
    Select: DISABLED_CONTROL_THEME,
    DatePicker: DISABLED_CONTROL_THEME,
  },
};
