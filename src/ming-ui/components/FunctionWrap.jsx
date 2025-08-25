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

  document.body.appendChild(div);

  const root = createRoot(div);

  function destroy() {
    root.unmount();
    if (div && div.parentNode === document.body) {
      document.body.removeChild(div);
    }
    window.removeEventListener('popstate', () => !window.isMingDaoApp && destroy());
  }

  window.addEventListener('popstate', () => !window.isMingDaoApp && destroy());

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
