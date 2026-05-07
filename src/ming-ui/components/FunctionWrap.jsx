import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';

/**
 * 使用方法
 * import functionWrap from 'ming-ui/components/FunctionWrap';
 * import DialogSelectOrgRole from './DialogSelectOrgRole';
 * // visibleName: 传入子组件的属性名 默认为 "visible"
 * // closeFnName: 关闭组件属性名 默认为 "onClose"
 * export const selectRole = props => functionWrap(DialogSelectOrgRole, { ...props, visibleName: 'orgRoleDialogVisible', closeFnName: 'onHide'  });
 */

export default function (Comp, props = {}) {
  const div = document.createElement('div');
  let destroyed = false;

  document.body.appendChild(div);

  const root = createRoot(div);

  const handlePopState = () => !window.isMingDaoApp && destroy();

  function destroy() {
    if (destroyed) return;
    destroyed = true;

    window.removeEventListener('popstate', handlePopState);
    root.unmount();

    if (div && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  window.addEventListener('popstate', handlePopState);

  root.render(
    <Comp
      {...(props.visibleName ? { [props.visibleName]: true } : { visible: true })}
      {...props}
      onClose={(...args) => {
        destroy();
        if (_.isFunction(props.onClose)) {
          props.onClose(...args);
        }
      }}
      onCancel={() => {
        destroy();
        if (_.isFunction(props.onCancel)) {
          props.onCancel();
        }
      }}
      {...(props.closeFnName
        ? {
            [props.closeFnName]: () => {
              destroy();
              if (_.isFunction(props[props.closeFnName])) {
                props[props.closeFnName]();
              }
            },
          }
        : {})}
    />,
  );
}
