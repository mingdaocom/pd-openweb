import React, { Fragment } from 'react';
import cx from 'classnames';
import { Support, SvgIcon } from 'ming-ui';
import NodeNameInput from '../NodeNameInput';
import { APP_TYPE, NODE_TYPE, SUPPORT_HREF } from '../../../enum';
import _ from 'lodash';

// 获取当前打开节点的详细类型
const getNodeTypeForSupportHref = ({ actionId, appType }, selectNodeType) => {
  if (selectNodeType === NODE_TYPE.FIRST) {
    return `${String(selectNodeType)}-${String(appType)}`;
  }

  if (_.includes([NODE_TYPE.ACTION, NODE_TYPE.SEARCH], selectNodeType)) {
    if (actionId === '1' || appType === 102) {
      return `${String(selectNodeType)}-${actionId}-${String(appType)}`;
    }
    return `${String(selectNodeType)}-${actionId}`;
  }

  if (selectNodeType === NODE_TYPE.AIGC) {
    return `${String(selectNodeType)}-${String(actionId)}`;
  }

  return String(selectNodeType);
};

export default function DetailHeader({
  data,
  icon,
  bg,
  updateSource,
  closeDetail,
  selectNodeType,
  isIntegration,
  removeNodeName,
  customNodeName,
  isPlugin,
}) {
  const { name, appType, app = {} } = data;
  const type = getNodeTypeForSupportHref(data, selectNodeType);
  const href = SUPPORT_HREF[type];
  let disabled = false;

  if (isIntegration) {
    return (
      <div className="workflowDetailHeader flexRow">
        <span className="icon-backspace Font26 mRight10 Gray ThemeHoverColor3 pointer" onClick={closeDetail} />
        <div className="flex Font20 Gray bold">{customNodeName || name}</div>
      </div>
    );
  }

  // 插件 输入 输出异化
  if (isPlugin && _.includes([NODE_TYPE.FIRST, NODE_TYPE.PBC], selectNodeType)) {
    bg = 'BGBlue';
    customNodeName = selectNodeType === NODE_TYPE.FIRST ? _l('输入参数') : _l('输出参数');
    disabled = true;
  }

  return (
    <div
      className={cx('workflowDetailHeader flexRow', bg)}
      style={appType === APP_TYPE.PLUGIN ? { background: app.iconColor || '#2196f3' } : {}}
    >
      {removeNodeName ? (
        <div className="flex" />
      ) : (
        <Fragment>
          {appType === APP_TYPE.PLUGIN && app.iconName ? (
            <SvgIcon url={app.iconName} fill="#fff" size={24} />
          ) : (
            <i className={cx('Font24', icon)} />
          )}

          <NodeNameInput name={customNodeName || name} disabled={disabled} updateSource={updateSource} />
        </Fragment>
      )}
      {href && <Support href={href} type={1} className="workflowDetailHeaderSupport mLeft10" />}
      <i className="icon-delete Font18 mLeft10" onClick={closeDetail} />
    </div>
  );
}
