import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import HistoryStatus from './HistoryStatus';
import { FLOW_FAIL_REASON, FLOW_STATUS, STATUS2COLOR } from './config';
import { resetInstance, endInstance } from '../../api/instanceVersion';
import { getProcessPublish } from '../../api/process';

export default ({
  status,
  title,
  id,
  instanceLog = { cause: 40005, nodeName: '', causeMsg: '' },
  createDate,
  onClick,
  index,
  updateSource,
  disabled,
}) => {
  const { cause, nodeName, causeMsg } = instanceLog;
  const { color } = STATUS2COLOR[FLOW_STATUS[status].status];
  const displayedDate = moment(createDate);
  const [isRetry, setRetry] = useState(false);
  const [versionDate, setVersion] = useState('');
  const [currentWorkflowId, setWorkflowId] = useState('');
  const showRetry = (status === 3 && _.includes([20001, 20002], cause)) || (status === 4 && cause !== 7777);
  const showSuspend = status === 1;

  return (
    <li className="historyListItem" onClick={() => onClick(id)}>
      {isRetry && <div className="workflowRetryLoading" />}
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
      <div className="retry">
        {(showRetry || showSuspend) && !disabled && (
          <span
            data-tip={showRetry ? _l('重试') : _l('中止')}
            onClick={e => {
              e.stopPropagation();
              if (isRetry) return;

              setRetry(true);

              (showRetry ? resetInstance : endInstance)({ instanceId: id }).then(res => {
                updateSource(Object.assign(res, { id }), index);
                setRetry(false);
              });
            }}
          >
            <Icon className="Font16 pointer ThemeHoverColor3 Block Gray_9e" icon={showRetry ? 'replay' : 'delete'} />
          </span>
        )}
      </div>
      <div className="version">
        <span
          data-tip={versionDate && typeof versionDate === 'string' ? _l('版本：%0', versionDate) : _l('加载中')}
          onMouseOver={() => {
            if (versionDate) return;

            setVersion(true);

            getProcessPublish({ instanceId: id }).then(res => {
              setVersion(moment(res.lastPublishDate).format('YYYY-MM-DD HH:mm'));
              setWorkflowId(res.id);
            });
          }}
          onClick={e => {
            e.stopPropagation();

            if (!currentWorkflowId) return;

            window.open(`/workflowedit/${currentWorkflowId}`);
          }}
        >
          <Icon className="Font16 ThemeHoverColor3 Block Gray_9e" icon="info_outline" />
        </span>
      </div>
    </li>
  );
};
