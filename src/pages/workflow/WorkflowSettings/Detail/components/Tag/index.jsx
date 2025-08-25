import React from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import { getIcons } from '../../../utils';
import './index.less';

export default ({
  flowNodeType,
  appType,
  actionId,
  nodeName,
  controlId,
  controlName,
  className,
  onClick = () => {},
  isSourceApp,
  actualityValue = '',
}) => {
  const errorClass = !nodeName || !controlName ? 'error' : '';

  if (isSourceApp) {
    return (
      <Tooltip title={controlName || !controlId ? null : `ID：${controlId}`}>
        <div className="flowDetailTagBox">
          <div
            className={cx('flowDetailMemberNodeName ellipsis bold', errorClass)}
            style={{ paddingLeft: 13, paddingRight: 13, borderRadius: 26, borderRightWidth: 1 }}
            title={controlName || ''}
          >
            {controlName || '- -'}
          </div>
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={controlName || !controlId ? null : `ID：${controlId}`}>
      <div className={cx('flowDetailTagBox', className)} onClick={onClick}>
        <div className={cx('flowDetailMemberNodeName ellipsis bold', errorClass)} title={nodeName || _l('节点删除')}>
          <i
            className={cx('Font14 mRight5', getIcons(parseInt(flowNodeType), parseInt(appType), actionId), {
              Gray_75: !!nodeName && !!controlName,
            })}
          />
          {nodeName || _l('节点删除')}
        </div>
        <div className={cx('flowDetailMemberArrow1', errorClass)} />
        <div className={cx('flowDetailMemberArrow2', errorClass)} />
        <div className={cx('flowDetailMemberFieldName ellipsis bold', errorClass)} title={controlName}>
          {controlName || '- -'}
          {actualityValue && ` = ${actualityValue}`}
        </div>
      </div>
    </Tooltip>
  );
};
