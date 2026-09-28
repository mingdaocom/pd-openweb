import React from 'react';
import { ConfigProvider } from 'ming-ui/antd-components';
import { antdConfigProviderProps } from 'src/common/config/theme/antdConfig';
import { getAntdThemeConfig, getCurrentAntdThemeMode } from 'src/common/config/theme/antdTheme';

export const getCurrentAntdThemeConfig = () =>
  getAntdThemeConfig(getCurrentAntdThemeMode(typeof window === 'undefined' ? undefined : window.themeMode));

export default function AntdConfigProvider({ children }) {
  return (
    <ConfigProvider {...antdConfigProviderProps} theme={getCurrentAntdThemeConfig()}>
      {children}
    </ConfigProvider>
  );
}
