import React from 'react';
import cx from 'classnames';
import HistoryStatus from './HistoryStatus';
import { FLOW_FAIL_REASON, FLOW_STATUS, STATUS2COLOR } from './config';

export default ({ status, title, id, instanceLog = { cause: 40005, nodeName: '', causeMsg: '' }, createDate, onClick }) => {
  const { cause, nodeName, causeMsg } = instanceLog;
  const { color } = STATUS2COLOR[FLOW_STATUS[status].status];
  const displayedDate = moment(createDate);
  return (
    <li className="historyListItem" onClick={() => onClick(id)}>
      <div className={cx('status', status)}>
        <div className="iconWrap">
          <HistoryStatus statusCode={status} />
        </div>
      </div>
      <div className="triggerData flex overflow_ellipsis Font14 ">{title}</div>
      <div
        className="cause flex overflow_ellipsis"
        style={{ color }}
        title={
          cause
            ? cause === 40007
              ? FLOW_FAIL_REASON[cause]
              : `${_l('节点: ')} ${nodeName}, ${FLOW_FAIL_REASON[cause] || causeMsg}`
            : ''
        }
      >
        {cause
          ? cause === 40007
            ? FLOW_FAIL_REASON[cause]
            : `${_l('节点: ')} ${nodeName}, ${FLOW_FAIL_REASON[cause] || causeMsg}`
          : ''}
      </div>
      <div className="triggerTime Gray_75">
        {displayedDate.isValid() ? displayedDate.format('YYYY-MM-DD HH:mm:ss') : ''}
      </div>
    </li>
  );
};
