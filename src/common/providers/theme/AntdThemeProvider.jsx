import React, { useEffect, useState } from 'react';
import { App, ConfigProvider } from 'ming-ui/antd-components';
import { GlobalFunctionWrapHolder } from 'ming-ui/components/FunctionWrap';
import { antdConfigProviderProps } from 'src/common/config/theme/antdConfig';
import { getAntdThemeConfig, getCurrentAntdThemeMode, HAP_PREFIX_CLS } from 'src/common/config/theme/antdTheme';
import { emitter } from 'src/utils/platform/browser/dom';

const getThemeMode = mode => getCurrentAntdThemeMode(mode);

ConfigProvider.config({
  prefixCls: HAP_PREFIX_CLS,
});

export default function AntdThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() =>
    getThemeMode(typeof window === 'undefined' ? undefined : window.themeMode),
  );
  const themeConfig = getAntdThemeConfig(themeMode);

  useEffect(() => {
    ConfigProvider.config({
      prefixCls: HAP_PREFIX_CLS,
      holderRender: holderChildren => (
        <ConfigProvider {...antdConfigProviderProps} theme={themeConfig}>
          {holderChildren}
        </ConfigProvider>
      ),
    });
  }, [themeConfig]);

  useEffect(() => {
    const syncThemeMode = mode => {
      const nextMode = getThemeMode(mode);
      setThemeMode(prevMode => (prevMode === nextMode ? prevMode : nextMode));
    };

    emitter.on('CHANGE_THEME_MODE', syncThemeMode);

    const observer =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            syncThemeMode();
          });

    if (observer) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }

    syncThemeMode(typeof window === 'undefined' ? undefined : window.themeMode);

    return () => {
      emitter.off('CHANGE_THEME_MODE', syncThemeMode);
      observer && observer.disconnect();
    };
  }, []);

  return (
    <ConfigProvider {...antdConfigProviderProps} theme={themeConfig}>
      <App rootClassName="h100">
        {children}
        <GlobalFunctionWrapHolder />
      </App>
    </ConfigProvider>
  );
}
