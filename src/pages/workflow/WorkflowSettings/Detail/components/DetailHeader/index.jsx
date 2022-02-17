import React from 'react';
import { string, func, shape, number } from 'prop-types';
import cx from 'classnames';
import { Support } from 'ming-ui';
import NodeNameInput from '../NodeNameInput';
import { SUPPORT_HREF } from '../../../enum';

// 获取当前打开节点的详细类型
const getNodeTypeForSupportHref = ({ actionId, appType, selectNodeType }) => {
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

export default function DetailHeader({ data, icon, bg, updateSource, closeDetail }) {
  const { name } = data;
  const type = getNodeTypeForSupportHref(data);
  const href = SUPPORT_HREF[type];

  return (
    <div className={cx('workflowDetailHeader flexRow', bg)}>
      <i className={cx('Font24', icon)} />
      <NodeNameInput name={name} updateSource={updateSource} />
      {href && <Support href={href} type={1} className="workflowDetailHeaderSupport mLeft10" />}
      <i className="icon-delete Font18 mLeft10" onClick={closeDetail} />
    </div>
  );
}

DetailHeader.propTypes = {
  data: shape({ name: string, appType: number, selectNodeType: number, actionId: string }),
  icon: string,
  bg: string,
  updateSource: func,
  closeDetail: func,
};
