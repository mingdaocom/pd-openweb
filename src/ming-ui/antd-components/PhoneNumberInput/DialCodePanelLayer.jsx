import React, { useLayoutEffect } from 'react';
import { useZIndex } from 'antd/es/_util/hooks/useZIndex';
import { theme, ZIndexContext } from 'ming-ui/antd-components';

function PanelLayer({ onZIndexChange, children }) {
  const [zIndex, contextZIndex] = useZIndex('SelectLike');

  useLayoutEffect(() => {
    onZIndexChange(zIndex);
  }, [onZIndexChange, zIndex]);

  return <ZIndexContext.Provider value={contextZIndex}>{children}</ZIndexContext.Provider>;
}

export default function DialCodePanelLayer({ parentZIndex, ...props }) {
  const { token } = theme.useToken();

  return (
    <ZIndexContext.Provider value={Math.max(token.zIndexPopupBase, parentZIndex)}>
      <PanelLayer {...props} />
    </ZIndexContext.Provider>
  );
}
