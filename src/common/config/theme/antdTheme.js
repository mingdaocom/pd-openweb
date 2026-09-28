import { GLOBAL_FEEDBACK_Z_INDEX, PresetColors, theme } from 'ming-ui/antd-components';

const { darkAlgorithm, defaultAlgorithm } = theme;

export const HAP_PREFIX_CLS = 'hap';
export const BUTTON_PADDING_INLINE = 16;
export const BUTTON_ICON_SIZES = {
  small: 14,
  default: 16,
  large: 18,
};

const HAP_FONT_FAMILY =
  "'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif";

const BUTTON_SHADOW_TOKENS = PresetColors.reduce(
  (tokens, color) => ({
    ...tokens,
    [`${color}ShadowColor`]: 'none',
  }),
  {
    defaultShadow: 'none',
    primaryShadow: 'none',
    dangerShadow: 'none',
  },
);

const BORDERLESS_CONTROL_FOCUS_TOKENS = {
  lineWidthFocus: 0,
};

const getRootStyle = () => {
  if (typeof window === 'undefined' || !window.getComputedStyle) {
    return null;
  }

  return window.getComputedStyle(document.documentElement);
};

const getCssVar = (style, name) => {
  if (!style) {
    return undefined;
  }

  const inlineValue =
    typeof document === 'undefined' ? '' : document.documentElement.style.getPropertyValue(name).trim();
  const value = style.getPropertyValue(name).trim() || inlineValue;

  return value || undefined;
};

const compactObject = obj =>
  Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }

    return acc;
  }, {});

const getThemeVars = style => {
  const color = name => getCssVar(style, name);

  return {
    primary: color('--color-primary'),
    primaryLight: color('--color-primary-light'),
    primaryDark: color('--color-primary-dark'),
    primaryFocus: color('--color-primary-focus'),
    primaryFocusOuter: color('--color-primary-focus-outer'),
    primaryTransparent: color('--color-primary-transparent'),
    primaryTransparentLight: color('--color-primary-transparent-light'),
    appTransparent: color('--color-app-transparent'),
    backgroundPrimary: color('--color-background-primary'),
    backgroundSecondary: color('--color-background-secondary'),
    backgroundTertiary: color('--color-background-tertiary'),
    backgroundDisabled: color('--color-background-disabled'),
    backgroundCard: color('--color-background-card'),
    backgroundTooltip: color('--color-background-tooltip'),
    backgroundSegmentedSelected: color('--color-background-segmented-selected'),
    backgroundHover: color('--color-background-hover'),
    backgroundOverlay: color('--color-background-overlay'),
    backgroundInput: color('--color-background-input'),
    backgroundInverse: color('--color-background-inverse'),
    textPrimary: color('--color-text-primary'),
    textSecondary: color('--color-text-secondary'),
    textTertiary: color('--color-text-tertiary'),
    textTitle: color('--color-text-title'),
    textPlaceholder: color('--color-text-placeholder'),
    textDisabled: color('--color-text-disabled'),
    textInverse: color('--color-text-inverse'),
    borderPrimary: color('--color-border-primary'),
    borderSecondary: color('--color-border-secondary'),
    borderTertiary: color('--color-border-tertiary'),
    borderHover: color('--color-border-hover'),
    success: color('--color-success'),
    successBg: color('--color-success-bg'),
    successBorder: color('--color-success-border'),
    warning: color('--color-warning'),
    warningBg: color('--color-warning-bg'),
    warningBorder: color('--color-warning-border'),
    error: color('--color-error'),
    errorBg: color('--color-error-bg'),
    errorBorder: color('--color-error-border'),
    info: color('--color-info'),
    infoBg: color('--color-info-bg'),
    infoBorder: color('--color-info-border'),
    link: color('--color-link'),
    linkHover: color('--color-link-hover'),
    shadowSm: color('--shadow-sm'),
    shadowMd: color('--shadow-md'),
    shadowLg: color('--shadow-lg'),
    shadowXl: color('--shadow-xl'),
    white: color('--color-white'),
  };
};

const getAliasTokens = themeVars =>
  compactObject({
    colorPrimary: themeVars.primary,
    colorPrimaryHover: themeVars.primaryLight || themeVars.primaryFocus,
    colorPrimaryActive: themeVars.primaryDark,
    colorPrimaryBg: themeVars.primaryTransparentLight,
    colorPrimaryBgHover: themeVars.primaryTransparent,
    colorPrimaryBorder: themeVars.primaryFocusOuter,
    colorPrimaryBorderHover: themeVars.primaryLight || themeVars.primaryFocus,
    colorSuccess: themeVars.success,
    colorSuccessBg: themeVars.successBg,
    colorSuccessBorder: themeVars.successBorder,
    colorWarning: themeVars.warning,
    colorWarningBg: themeVars.warningBg,
    colorWarningBorder: themeVars.warningBorder,
    colorError: themeVars.error,
    colorErrorBg: themeVars.errorBg,
    colorErrorBorder: themeVars.errorBorder,
    colorInfo: themeVars.info,
    colorInfoBg: themeVars.infoBg,
    colorInfoBorder: themeVars.infoBorder,
    colorLink: themeVars.link,
    colorLinkHover: themeVars.linkHover,
    colorBgBase: themeVars.backgroundPrimary,
    colorBgLayout: themeVars.backgroundSecondary,
    colorBgContainer: themeVars.backgroundPrimary,
    colorBgElevated: themeVars.backgroundCard,
    colorBgSpotlight: themeVars.backgroundInverse,
    colorBgMask: themeVars.backgroundOverlay,
    colorBgContainerDisabled: themeVars.backgroundDisabled,
    colorBgTextHover: themeVars.backgroundHover,
    colorBgTextActive: themeVars.primaryTransparent,
    colorFill: themeVars.backgroundTertiary,
    colorFillAlter: themeVars.backgroundSecondary,
    colorFillContent: themeVars.backgroundTertiary,
    colorFillContentHover: themeVars.backgroundHover,
    colorFillSecondary: themeVars.backgroundTertiary,
    colorFillTertiary: themeVars.backgroundSecondary,
    colorFillQuaternary: themeVars.backgroundInput,
    colorText: themeVars.textPrimary,
    colorTextBase: themeVars.textPrimary,
    colorTextHeading: themeVars.textTitle || themeVars.textPrimary,
    colorTextDescription: themeVars.textSecondary,
    colorTextLabel: themeVars.textSecondary,
    colorTextSecondary: themeVars.textSecondary,
    colorTextTertiary: themeVars.textTertiary,
    colorTextQuaternary: themeVars.textPlaceholder,
    colorTextPlaceholder: themeVars.textPlaceholder,
    colorTextDisabled: themeVars.textDisabled,
    colorTextLightSolid: themeVars.textInverse,
    colorBorder: themeVars.borderPrimary,
    colorBorderDisabled: themeVars.backgroundDisabled,
    colorBorderSecondary: themeVars.borderSecondary,
    colorSplit: themeVars.borderSecondary,
    colorIcon: themeVars.textTertiary,
    colorIconHover: themeVars.textPrimary,
    controlItemBgHover: themeVars.backgroundHover,
    controlItemBgActive: themeVars.primaryTransparent,
    controlItemBgActiveHover: themeVars.primaryTransparent,
    controlItemBgActiveDisabled: themeVars.backgroundDisabled,
    controlOutline: themeVars.primaryFocusOuter,
    boxShadow: themeVars.shadowLg,
    boxShadowSecondary: themeVars.shadowMd,
    boxShadowTertiary: themeVars.shadowSm,
    fontFamily: HAP_FONT_FAMILY,
    fontSize: 13,
    fontSizeIcon: 13,
    lineHeight: 1.5,
    borderRadius: 4,
    controlHeight: 36,
  });

const getCommonComponentTokens = themeVars =>
  compactObject({
    colorPrimary: themeVars.primary,
    colorPrimaryHover: themeVars.primaryLight || themeVars.primaryFocus,
    colorPrimaryActive: themeVars.primaryDark,
    colorBgContainer: themeVars.backgroundPrimary,
    colorBgElevated: themeVars.backgroundCard,
    colorBgContainerDisabled: themeVars.backgroundDisabled,
    colorText: themeVars.textPrimary,
    colorTextHeading: themeVars.textTitle || themeVars.textPrimary,
    colorTextDescription: themeVars.textSecondary,
    colorTextSecondary: themeVars.textSecondary,
    colorTextTertiary: themeVars.textTertiary,
    colorTextQuaternary: themeVars.textTertiary,
    colorTextPlaceholder: themeVars.textPlaceholder,
    colorTextDisabled: themeVars.textDisabled,
    colorTextLightSolid: themeVars.textInverse,
    colorBorder: themeVars.borderPrimary,
    colorBorderSecondary: themeVars.borderSecondary,
    colorSplit: themeVars.borderSecondary,
    colorIcon: themeVars.textTertiary,
    colorIconHover: themeVars.textPrimary,
    controlItemBgHover: themeVars.backgroundHover,
    controlItemBgActive: themeVars.primaryTransparent,
    controlItemBgActiveHover: themeVars.primaryTransparent,
    controlOutline: themeVars.primaryFocusOuter,
    boxShadow: themeVars.shadowLg,
    boxShadowSecondary: themeVars.shadowMd,
  });

const getInputComponentTokens = themeVars =>
  compactObject({
    colorBgContainer: themeVars.backgroundInput,
    colorBgContainerDisabled: themeVars.backgroundDisabled,
    colorBorder: themeVars.borderPrimary,
    colorText: themeVars.textPrimary,
    colorTextPlaceholder: themeVars.textPlaceholder,
    colorTextDisabled: themeVars.textDisabled,
    fontSizeIcon: 16,
    addonBg: themeVars.backgroundPrimary,
    activeBg: themeVars.backgroundInput,
    hoverBg: themeVars.backgroundInput,
    activeBorderColor: themeVars.primary,
    hoverBorderColor: themeVars.primaryFocus,
    activeShadow: 'none',
  });

const getComponentTokens = themeVars => {
  const common = getCommonComponentTokens(themeVars);
  const input = getInputComponentTokens(themeVars);
  const noActiveShadow = compactObject({
    activeShadow: 'none',
    activeOutlineColor: 'transparent',
  });
  const menuItemColor = themeVars.textPrimary;
  const menuItemHoverColor = themeVars.textPrimary;
  const menuItemSelectedColor = themeVars.primary;
  const menuItemDisabledColor = themeVars.textDisabled;
  const menuItemBg = themeVars.backgroundCard;
  const menuItemHoverBg = themeVars.backgroundHover;
  const menuItemSelectedBg = themeVars.primaryTransparent;
  const menuPopupBg = themeVars.backgroundCard;

  return {
    Button: compactObject({
      ...common,
      ...BUTTON_SHADOW_TOKENS,
      fontWeight: 700,
      contentFontSizeSM: 12,
      controlHeightSM: 28,
      onlyIconSize: BUTTON_ICON_SIZES.default,
      onlyIconSizeSM: BUTTON_ICON_SIZES.small,
      onlyIconSizeLG: BUTTON_ICON_SIZES.large,
      paddingInline: BUTTON_PADDING_INLINE,
      defaultColor: themeVars.textSecondary,
      textTextColor: themeVars.textSecondary,
      textHoverBg: themeVars.backgroundHover,
      colorBgContainerDisabled: themeVars.backgroundDisabled,
      colorBorderDisabled: themeVars.backgroundDisabled,
    }),
    Checkbox: compactObject({
      ...common,
      colorBgContainer: themeVars.backgroundInput,
      borderRadiusSM: 4,
    }),
    Collapse: compactObject({
      ...common,
      headerBg: themeVars.backgroundSecondary,
      contentBg: themeVars.backgroundCard,
      borderlessContentBg: 'transparent',
    }),
    DatePicker: compactObject({
      ...common,
      ...input,
      ...noActiveShadow,
      ...BORDERLESS_CONTROL_FOCUS_TOKENS,
      padding: 10,
      paddingXXS: 1,
      cellWidth: 35,
      colorBgContainer: themeVars.backgroundCard,
      colorBgElevated: themeVars.backgroundCard,
      cellHoverBg: themeVars.backgroundHover,
      cellActiveWithRangeBg: themeVars.primaryTransparent,
      cellHoverWithRangeBg: themeVars.primaryTransparentLight,
      cellRangeBorderColor: themeVars.primaryDark,
      multipleItemBg: themeVars.backgroundSecondary,
      multipleItemBorderColor: themeVars.borderSecondary,
      multipleSelectorBgDisabled: themeVars.backgroundDisabled,
      multipleItemColorDisabled: themeVars.textDisabled,
      multipleItemBorderColorDisabled: themeVars.borderSecondary,
      boxShadowSecondary: themeVars.shadowLg,
    }),
    Divider: compactObject({
      ...common,
      colorSplit: themeVars.borderSecondary,
    }),
    Drawer: compactObject({
      ...common,
      colorBgElevated: themeVars.backgroundCard,
      colorBgMask: themeVars.backgroundOverlay,
      fontSizeLG: 17,
      fontWeightStrong: 600,
      boxShadowDrawerLeft: themeVars.shadowXl,
      boxShadowDrawerRight: themeVars.shadowXl,
      boxShadowDrawerUp: themeVars.shadowXl,
      boxShadowDrawerDown: themeVars.shadowXl,
    }),
    Dropdown: compactObject({
      ...common,
      colorText: menuItemColor,
      colorTextDisabled: menuItemDisabledColor,
      colorTextDescription: themeVars.textSecondary,
      colorBgElevated: menuPopupBg,
      colorPrimary: menuItemSelectedColor,
      colorSplit: themeVars.borderSecondary,
      colorIcon: themeVars.textTertiary,
      controlItemBgHover: menuItemHoverBg,
      controlItemBgActive: menuItemSelectedBg,
      controlItemBgActiveHover: menuItemSelectedBg,
      boxShadowSecondary: themeVars.shadowLg,
      marginXS: 0,
      paddingXXS: '5px 0',
      borderRadiusSM: 0,
      paddingBlock: 7.5,
      controlPaddingHorizontal: 15,
      fontSizeSM: 16,
    }),
    Input: compactObject({
      ...input,
      ...BORDERLESS_CONTROL_FOCUS_TOKENS,
    }),
    InputNumber: compactObject({
      ...input,
      ...BORDERLESS_CONTROL_FOCUS_TOKENS,
      handleBg: themeVars.backgroundInput,
      handleActiveBg: themeVars.backgroundHover,
      handleHoverColor: themeVars.primary,
      handleBorderColor: themeVars.borderPrimary,
      filledHandleBg: themeVars.backgroundSecondary,
    }),
    Menu: compactObject({
      ...common,
      activeBarBorderWidth: 0,
      itemBorderRadius: 0,
      itemHeight: 36,
      itemMarginBlock: 0,
      itemMarginInline: 0,
      itemColor: menuItemColor,
      itemHoverColor: menuItemHoverColor,
      itemSelectedColor: menuItemSelectedColor,
      itemDisabledColor: menuItemDisabledColor,
      itemBg: menuItemBg,
      itemHoverBg: menuItemHoverBg,
      itemActiveBg: menuItemHoverBg,
      itemSelectedBg: menuItemSelectedBg,
      subMenuItemBg: menuPopupBg,
      popupBg: menuPopupBg,
      groupTitleColor: themeVars.textSecondary,
      horizontalItemHoverColor: menuItemSelectedColor,
      horizontalItemSelectedColor: menuItemSelectedColor,
      horizontalItemHoverBg: 'transparent',
      horizontalItemSelectedBg: 'transparent',
      darkItemColor: menuItemColor,
      darkItemHoverColor: menuItemHoverColor,
      darkItemSelectedColor: themeVars.textInverse,
      darkItemDisabledColor: menuItemDisabledColor,
      darkItemBg: menuItemBg,
      darkPopupBg: menuPopupBg,
      darkSubMenuItemBg: menuPopupBg,
      darkItemHoverBg: menuItemHoverBg,
      darkItemSelectedBg: themeVars.primary,
      darkGroupTitleColor: themeVars.textSecondary,
    }),
    Message: compactObject({
      ...common,
      contentBg: themeVars.backgroundCard,
      zIndexPopup: GLOBAL_FEEDBACK_Z_INDEX,
    }),
    Mentions: compactObject({
      ...BORDERLESS_CONTROL_FOCUS_TOKENS,
    }),
    Modal: compactObject({
      ...common,
      borderRadiusLG: 8,
      colorBgMask: 'rgba(0, 0, 0, .7)',
      contentBg: themeVars.backgroundCard,
      headerBg: themeVars.backgroundCard,
      footerBg: themeVars.backgroundCard,
      colorTextHeading: themeVars.textPrimary,
      titleColor: themeVars.textPrimary,
      titleFontSize: 17,
      headerMarginBottom: 20,
      footerMarginTop: 20,
      confirmBtnsMarginTop: 20,
      controlHeight: 32,
    }),
    Notification: compactObject({
      ...common,
      zIndexPopup: GLOBAL_FEEDBACK_Z_INDEX,
      borderRadiusLG: 8,
      colorText: themeVars.textTitle || themeVars.textPrimary,
      fontSize: 13,
      fontSizeLG: 16,
      lineHeightLG: 1.5,
      paddingMD: 18,
      paddingContentHorizontalLG: 24,
      width: 440,
      colorBgElevated: themeVars.backgroundCard,
      colorSuccessBg: themeVars.successBg,
      colorErrorBg: themeVars.errorBg,
      colorInfoBg: themeVars.infoBg,
      colorWarningBg: themeVars.warningBg,
    }),
    Skeleton: compactObject({
      ...common,
      gradientFromColor: themeVars.backgroundTertiary,
      gradientToColor: themeVars.backgroundSecondary,
    }),
    Pagination: compactObject({
      ...common,
      ...input,
      itemBg: themeVars.backgroundPrimary,
      itemActiveBg: themeVars.backgroundPrimary,
      itemLinkBg: themeVars.backgroundPrimary,
      itemInputBg: themeVars.backgroundInput,
      itemActiveColor: themeVars.primary,
      itemActiveColorHover: themeVars.primaryLight || themeVars.primaryFocus,
      itemActiveBgDisabled: themeVars.backgroundDisabled,
      itemActiveColorDisabled: themeVars.textDisabled,
    }),
    Popover: compactObject({
      ...common,
      colorBgElevated: themeVars.backgroundCard,
      dropShadowPopover: 'none',
      innerPadding: 18,
    }),
    Radio: compactObject({
      ...common,
      colorBgContainer: themeVars.backgroundInput,
      dotSize: 6,
      radioSize: 18,
      buttonBg: themeVars.backgroundInput,
      buttonCheckedBg: themeVars.backgroundInput,
      buttonColor: themeVars.textPrimary,
      buttonCheckedBgDisabled: themeVars.backgroundDisabled,
      buttonCheckedColorDisabled: themeVars.textDisabled,
      buttonSolidCheckedColor: themeVars.textInverse,
      buttonSolidCheckedBg: themeVars.primary,
      buttonSolidCheckedHoverBg: themeVars.primaryLight || themeVars.primaryFocus,
      buttonSolidCheckedActiveBg: themeVars.primaryDark,
      dotColorDisabled: themeVars.textDisabled,
    }),
    Select: compactObject({
      ...common,
      ...noActiveShadow,
      ...BORDERLESS_CONTROL_FOCUS_TOKENS,
      colorTextPlaceholder: themeVars.textPlaceholder,
      colorBgContainer: themeVars.backgroundInput,
      colorBgElevated: themeVars.backgroundCard,
      selectorBg: themeVars.backgroundInput,
      clearBg: themeVars.backgroundSecondary,
      optionSelectedColor: themeVars.textPrimary,
      optionSelectedBg: themeVars.primaryTransparent,
      optionSelectedFontWeight: 'inherit',
      optionActiveBg: themeVars.backgroundHover,
      multipleItemBg: themeVars.backgroundTertiary,
      multipleItemBorderColor: themeVars.borderSecondary,
      multipleSelectorBgDisabled: themeVars.backgroundDisabled,
      multipleItemColorDisabled: themeVars.textDisabled,
      multipleItemBorderColorDisabled: themeVars.borderSecondary,
      hoverBorderColor: themeVars.primaryFocus,
      activeBorderColor: themeVars.primary,
      boxShadowSecondary: themeVars.shadowLg,
      paddingXXS: 5,
      borderRadiusSM: 4,
      fontSizeSM: 12,
    }),
    Slider: compactObject({
      ...common,
      railBg: themeVars.backgroundTertiary,
      railHoverBg: themeVars.backgroundHover,
      trackBg: themeVars.primaryFocusOuter,
      trackHoverBg: themeVars.primaryFocusOuter,
      handleColor: themeVars.primaryFocusOuter,
      handleActiveColor: themeVars.primary,
      handleActiveOutlineColor: themeVars.primaryFocusOuter,
      handleColorDisabled: themeVars.textDisabled,
      dotBorderColor: themeVars.borderSecondary,
      dotActiveBorderColor: themeVars.primaryFocusOuter,
      trackBgDisabled: themeVars.backgroundDisabled,
    }),
    Switch: compactObject({
      ...common,
      colorTextQuaternary: themeVars.textPlaceholder,
      colorTextLightSolid: themeVars.white || themeVars.textInverse,
      handleBg: themeVars.white,
    }),
    Table: compactObject({
      ...common,
      colorBgContainer: themeVars.backgroundPrimary,
      headerBg: themeVars.backgroundSecondary,
      headerColor: themeVars.textPrimary,
      headerSortActiveBg: themeVars.backgroundTertiary,
      headerSortHoverBg: themeVars.backgroundHover,
      bodySortBg: themeVars.backgroundSecondary,
      rowHoverBg: themeVars.backgroundHover,
      rowSelectedBg: themeVars.appTransparent,
      rowSelectedHoverBg: themeVars.appTransparent,
      rowExpandedBg: themeVars.backgroundSecondary,
      borderColor: themeVars.borderSecondary,
      footerBg: themeVars.backgroundSecondary,
      footerColor: themeVars.textPrimary,
      headerSplitColor: themeVars.borderSecondary,
      fixedHeaderSortActiveBg: themeVars.backgroundTertiary,
      headerFilterHoverBg: themeVars.backgroundHover,
      filterDropdownMenuBg: themeVars.backgroundCard,
      filterDropdownBg: themeVars.backgroundCard,
      expandIconBg: themeVars.backgroundPrimary,
    }),
    Tabs: compactObject({
      ...common,
      itemColor: themeVars.textPrimary,
      itemActiveColor: themeVars.primary,
      itemHoverColor: themeVars.primaryFocus,
      itemSelectedColor: themeVars.primary,
      itemDisabledColor: themeVars.textDisabled,
      inkBarColor: themeVars.primary,
      cardBg: themeVars.backgroundSecondary,
    }),
    Tag: compactObject({
      ...common,
      defaultBg: themeVars.backgroundTertiary,
      defaultColor: themeVars.textPrimary,
      colorBorder: themeVars.borderPrimary,
    }),
    Tooltip: compactObject({
      ...common,
      colorBgSpotlight: themeVars.backgroundTooltip,
      colorTextLightSolid: themeVars.textInverse,
    }),
    Tree: compactObject({
      ...common,
      colorBgContainer: themeVars.backgroundPrimary,
      nodeHoverBg: themeVars.backgroundHover,
      nodeHoverColor: themeVars.textPrimary,
      nodeSelectedBg: themeVars.primaryTransparent,
      nodeSelectedColor: themeVars.textPrimary,
      colorBgTextHover: 'transparent',
      directoryNodeSelectedBg: themeVars.primary,
      directoryNodeSelectedColor: themeVars.textInverse,
    }),
    Segmented: compactObject({
      ...common,
      trackBg: themeVars.backgroundTertiary,
      itemSelectedBg: themeVars.backgroundSegmentedSelected,
      borderRadiusXS: 4,
      trackPadding: 4,
      controlPaddingHorizontal: 15,
      itemHoverColor: themeVars.primary,
      itemSelectedColor: themeVars.primary,
    }),
  };
};

export const getCurrentAntdThemeMode = mode => {
  if (mode === 'dark' || mode === 'light') {
    return mode;
  }

  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};

export const getAntdThemeConfig = mode => {
  const themeMode = getCurrentAntdThemeMode(mode);
  const style = getRootStyle();
  const themeVars = getThemeVars(style);

  return {
    cssVar: {
      prefix: HAP_PREFIX_CLS,
    },
    hashed: true,
    algorithm: themeMode === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token: getAliasTokens(themeVars),
    components: getComponentTokens(themeVars),
  };
};
