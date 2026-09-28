import React from 'react';
import { CONTAINER_MAX_OFFSET, theme, ZIndexContext } from 'ming-ui/antd-components';
import FunctionWrapHolder from './FunctionWrapHolder';
import { createFunctionWrapStore } from './store';

const globalFunctionWrapStore = createFunctionWrapStore();

export function GlobalFunctionWrapHolder() {
  const { token } = theme.useToken();

  return (
    <ZIndexContext.Provider value={token.zIndexPopupBase + CONTAINER_MAX_OFFSET}>
      <FunctionWrapHolder store={globalFunctionWrapStore} />
    </ZIndexContext.Provider>
  );
}

/**
 * 使用方法
 * import functionWrap from 'ming-ui/components/FunctionWrap';
 * import DialogSelectOrgRole from './DialogSelectOrgRole';
 * // visibleName: 传入子组件的属性名 默认为 "visible"
 * // closeFnName: 关闭组件属性名 默认为 "onClose"
 * export const selectRole = props => functionWrap(DialogSelectOrgRole, { ...props, visibleName: 'orgRoleDialogVisible', closeFnName: 'onHide'  });
 */
export default function functionWrap(Comp, props = {}) {
  globalFunctionWrapStore.open(Comp, props);
}
