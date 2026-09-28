import React from 'react';
import en_US from 'antd/es/locale/en_US';
import ja_JP from 'antd/es/locale/ja_JP';
import zh_CN from 'antd/es/locale/zh_CN';
import zh_TW from 'antd/es/locale/zh_TW';
import Icon from 'ming-ui/components/Icon';
import { BUTTON_ICON_SIZES, HAP_PREFIX_CLS } from './antdTheme';

const lang = typeof window === 'undefined' ? 'en' : window.getCurrentLang?.() || window.getDefaultLangKey?.() || 'en';
const antdLocale = { en: en_US, ja: ja_JP, 'zh-Hans': zh_CN, 'zh-Hant': zh_TW }[lang] || en_US;

const antdButtonConfig = {
  autoInsertSpace: false,
  styles: ({ props }) => ({
    icon: {
      fontSize: BUTTON_ICON_SIZES[props.size] || BUTTON_ICON_SIZES.default,
    },
  }),
};

const antdBadgeConfig = {
  styles: {
    indicator: {
      boxShadow: 'none',
    },
  },
};

const DISABLED_CONTROL_OPACITY = 0.6;
const CHECKBOX_DISABLED_MARK_COLOR_VAR = `--${HAP_PREFIX_CLS}-color-text-disabled`;
const RADIO_DISABLED_DOT_COLOR_VAR = `--${HAP_PREFIX_CLS}-radio-dot-color-disabled`;

const getDisabledChoiceStyles = ({ props }) => {
  if (!props.disabled) return {};

  return {
    root: {
      color: 'var(--color-text-primary)',
      opacity: DISABLED_CONTROL_OPACITY,
    },
    icon: {
      [CHECKBOX_DISABLED_MARK_COLOR_VAR]: 'var(--color-white)',
      [RADIO_DISABLED_DOT_COLOR_VAR]: 'var(--color-white)',
      backgroundColor: props.checked ? 'var(--color-primary)' : 'var(--color-background-primary)',
      borderColor: props.checked ? 'var(--color-primary)' : 'var(--color-border-primary)',
    },
    label: { color: 'var(--color-text-primary)' },
  };
};

const getDisabledSwitchStyles = ({ props }) =>
  props.disabled
    ? {
        root: {
          opacity: DISABLED_CONTROL_OPACITY,
          ...(props.checked ? { backgroundColor: 'var(--color-primary)' } : {}),
        },
      }
    : {};

const antdWaveConfig = { disabled: true };
const antdDropdownConfig = {
  styles: {
    itemIcon: {
      marginInlineEnd: 8,
    },
  },
};

const antdPopoverConfig = {
  styles: {
    container: {
      boxShadow: 'var(--shadow-lg)',
    },
  },
};

const antdSelectConfig = {
  styles: {
    content: {
      opacity: 1,
    },
  },
};

const antdTextAreaConfig = {
  styles: ({ props }) => (props.variant === 'borderless' ? { root: { outline: 'none' } } : {}),
};

const antdTagConfig = {
  closeIcon: <Icon icon="close" />,
  styles: {
    root: {
      fontSize: 12,
    },
  },
};

const antdPopupMaskConfig = { blur: false };
const antdPopupStyles = {
  mask: {
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  },
};

const antdModalConfig = {
  mask: antdPopupMaskConfig,
  styles: {
    ...antdPopupStyles,
    close: {
      outline: 'none',
    },
  },
};

const antdDrawerConfig = {
  mask: antdPopupMaskConfig,
  styles: {
    ...antdPopupStyles,
    header: {
      borderBottom: 'none',
    },
  },
};

export const antdConfigProviderProps = {
  prefixCls: HAP_PREFIX_CLS,
  locale: antdLocale,
  badge: antdBadgeConfig,
  button: antdButtonConfig,
  checkbox: { styles: getDisabledChoiceStyles },
  wave: antdWaveConfig,
  drawer: antdDrawerConfig,
  dropdown: antdDropdownConfig,
  modal: antdModalConfig,
  popover: antdPopoverConfig,
  radio: { styles: getDisabledChoiceStyles },
  select: antdSelectConfig,
  switch: { styles: getDisabledSwitchStyles },
  tag: antdTagConfig,
  textArea: antdTextAreaConfig,
};
