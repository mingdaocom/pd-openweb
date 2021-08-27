import React from 'react';
import './index.less';
import cx from 'classnames';
import { getIcons } from '../../../utils';

export default ({ flowNodeType, appType, actionId, nodeName, controlName, className, onClick = () => {}, isSourceApp }) => {
  const errorClass = !nodeName || !controlName ? 'error' : '';

  if (isSourceApp) {
    return (
      <div className="flowDetailTagBox">
        <div
          className={cx('flowDetailMemberNodeName ellipsis bold', errorClass)}
          style={{ paddingLeft: 13, paddingRight: 13, borderRadius: 26, borderRightWidth: 1 }}
          title={controlName || ''}
        >
          {controlName || '- -'}
        </div>
      </div>
    );
  }

  return (
    <div className={cx('flowDetailTagBox', className)} onClick={onClick}>
      <div className={cx('flowDetailMemberNodeName ellipsis bold', errorClass)} title={nodeName || _l('节点删除')}>
        <i className={cx('Font14 mRight5', getIcons(parseInt(flowNodeType), parseInt(appType), actionId), { Gray_9e: !!nodeName && !!controlName })} />
        {nodeName || _l('节点删除')}
      </div>
      <div className={cx('flowDetailMemberArrow1', errorClass)} />
      <div className={cx('flowDetailMemberArrow2', errorClass)} />
      <div className={cx('flowDetailMemberFieldName ellipsis bold', errorClass)} title={controlName}>{controlName || '- -'}</div>
    </div>
  );
};
