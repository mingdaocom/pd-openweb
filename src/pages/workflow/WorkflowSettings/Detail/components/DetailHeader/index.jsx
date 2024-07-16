import React, { Fragment } from 'react';
import cx from 'classnames';
import { Support, Dialog } from 'ming-ui';
import NodeNameInput from '../NodeNameInput';
import { SUPPORT_HREF } from '../../../enum';
import _ from 'lodash';

// 获取当前打开节点的详细类型
const getNodeTypeForSupportHref = ({ actionId, appType }, selectNodeType) => {
  if (_.includes([6, 7], selectNodeType)) {
    if (actionId === '1' || appType === 102) {
      return `${String(selectNodeType)}-${actionId}-${String(appType)}`;
    }
    return `${String(selectNodeType)}-${actionId}`;
  }
  if (selectNodeType === 0) {
    return `${String(selectNodeType)}-${String(appType)}`;
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
}) {
  const { name } = data;
  const type = getNodeTypeForSupportHref(data, selectNodeType);
  const href = SUPPORT_HREF[type];

  if (isIntegration) {
    return (
      <div className="workflowDetailHeader flexRow">
        <span className="icon-backspace Font26 mRight10 Gray ThemeHoverColor3 pointer" onClick={closeDetail} />
        <div className="flex Font20 Gray bold">{customNodeName || name}</div>
      </div>
    );
  }

  return (
    <div className={cx('workflowDetailHeader flexRow', bg)}>
      {removeNodeName ? (
        <div className="flex" />
      ) : (
        <Fragment>
          <i className={cx('Font24', icon)} />
          <NodeNameInput name={name} updateSource={updateSource} />
        </Fragment>
      )}
      {href && <Support href={href} type={1} className="workflowDetailHeaderSupport mLeft10" />}
      <i className="icon-delete Font18 mLeft10" onClick={closeDetail} />
    </div>
  );
}
