import React from 'react';
import cx from 'classnames';
import { Support, Dialog } from 'ming-ui';
import NodeNameInput from '../NodeNameInput';
import { SUPPORT_HREF } from '../../../enum';

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
  processId,
  selectNodeId,
  deleteNode,
  showDelete,
}) {
  const { name } = data;
  const type = getNodeTypeForSupportHref(data, selectNodeType);
  const href = SUPPORT_HREF[type];
  const onDelete = () => {
    Dialog.confirm({
      className: 'deleteApprovalProcessDialog',
      title: <span style={{ color: '#f44336' }}>{_l('删除“发起审批流程”')}</span>,
      description: _l('同时删除审批流程内的所有节点'),
      onOk: () => {
        deleteNode(processId, selectNodeId);
      },
    });
  };

  if (isIntegration) {
    return (
      <div className="workflowDetailHeader flexRow">
        <span className="icon-backspace Font26 mRight10 Gray ThemeHoverColor3 pointer" onClick={closeDetail} />
        <div className="flex Font20 Gray bold">{name}</div>
      </div>
    );
  }

  return (
    <div className={cx('workflowDetailHeader flexRow', bg)}>
      <i className={cx('Font24', icon)} />
      <NodeNameInput name={name} updateSource={updateSource} />
      {href && <Support href={href} type={1} className="workflowDetailHeaderSupport mLeft10" />}
      {showDelete && <i className="icon-delete2 Font18 mLeft10 pointer" onClick={onDelete} />}
      <i className="icon-delete Font18 mLeft10" onClick={closeDetail} />
    </div>
  );
}
