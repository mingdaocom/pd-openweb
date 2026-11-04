import React from 'react';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'ming-ui/antd-components';
import { antdConfigProviderProps } from 'src/common/config/theme/antdConfig';
import { getAntdStyleProviderProps } from 'src/common/config/theme/antdStyle';
import { getAntdThemeConfig, getCurrentAntdThemeMode } from 'src/common/config/theme/antdTheme';

export const getCurrentAntdThemeConfig = () =>
  getAntdThemeConfig(getCurrentAntdThemeMode(typeof window === 'undefined' ? undefined : window.themeMode));

export default function AntdConfigProvider({ children }) {
  return (
    <StyleProvider {...getAntdStyleProviderProps()}>
      <ConfigProvider {...antdConfigProviderProps} theme={getCurrentAntdThemeConfig()}>
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
