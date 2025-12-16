import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Checkbox, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import instanceVersion from '../../../api/instanceVersion';
import process from '../../../api/process';
import { FLOW_FAIL_REASON, FLOW_STATUS, STATUS2COLOR } from '../config';
import HistoryStatus from './HistoryStatus';

export default ({
  status,
  title,
  id,
  instanceLog = { cause: 40005, nodeName: '', causeMsg: '' },
  debugEvents = [],
  createDate,
  onClick,
  index,
  updateSource,
  batchIds,
  onUpdateBatchIds,
  isPlugin,
  instanceType,
  isChatbot,
}) => {
  const isDelete = instanceType === -1;
  const { cause, nodeName, causeMsg } = instanceLog;
  const { color } = STATUS2COLOR[FLOW_STATUS[isDelete ? -1 : status].status];
  const displayedDate = moment(createDate);
  const [isRetry, setRetry] = useState(false);
  const [versionDate, setVersion] = useState('');
  const [currentWorkflowId, setWorkflowId] = useState('');
  const showRetry = _.includes([3, 4], status) && !_.includes([6666, 7777], cause);
  const showSuspend = status === 1;

  return (
    <li className="historyListItem" onClick={() => !isDelete && onClick(id)}>
      {isRetry && <div className="workflowRetryLoading" />}
      <div className="batch">
        {status === 2 || cause === 7777 || isDelete ? null : (
          <Checkbox
            checked={!!batchIds.find(o => o.id === id)}
            onClick={(checked, value, e) => {
              e.stopPropagation();
              onUpdateBatchIds(
                !checked ? batchIds.concat({ id, status, cause, instanceType }) : batchIds.filter(o => o.id !== id),
              );
            }}
          />
        )}
      </div>
      <div className="triggerData flex overflow_ellipsis Font14">{title || (isChatbot ? _l('发送文件') : '')}</div>
      <div className={cx('status', status)}>
        <div className="iconWrap">
          <HistoryStatus isList statusCode={isDelete ? -1 : status} />
        </div>
      </div>
      <div
        className="cause flex overflow_ellipsis"
        style={{ color }}
        title={
          cause
            ? cause === 40007
              ? FLOW_FAIL_REASON[cause]
              : !nodeName
                ? FLOW_FAIL_REASON[cause] || causeMsg
                : `${_l('节点:')} ${nodeName}, ${
                    cause === 7777 ? _l('过期自动中止') : FLOW_FAIL_REASON[cause] || causeMsg
                  }`
            : ''
        }
      >
        {cause
          ? cause === 40007
            ? FLOW_FAIL_REASON[cause]
            : !nodeName
              ? FLOW_FAIL_REASON[cause] || causeMsg
              : `${_l('节点:')} ${nodeName}, ${
                  cause === 7777 ? _l('过期自动中止') : FLOW_FAIL_REASON[cause] || causeMsg
                }`
          : ''}

        {isDelete && _l('已删除')}
      </div>
      <div className="triggerTime Gray_75">
        {displayedDate.isValid() ? displayedDate.format('YYYY-MM-DD HH:mm:ss') : ''}
      </div>

      <div className="retry">
        {(isDelete || showRetry || showSuspend) && (
          <Tooltip title={isDelete ? _l('恢复') : showRetry ? _l('重试') : _l('中止')}>
            <span
              onClick={e => {
                e.stopPropagation();
                if (isRetry) return;

                setRetry(true);

                (isDelete || showRetry ? instanceVersion.resetInstance : instanceVersion.endInstance)({
                  instanceId: id,
                })
                  .then(res => {
                    onUpdateBatchIds(
                      batchIds.map(o => {
                        if (o.id === id) {
                          o.status = res.status;
                          o.cause = res.instanceLog.cause;
                        }

                        return o;
                      }),
                    );
                    updateSource(Object.assign(res, { id }), index);
                    setRetry(false);
                  })
                  .catch(() => {
                    setRetry(false);
                  });
              }}
            >
              <Icon
                className="Font16 pointer ThemeHoverColor3 Block Gray_75"
                icon={isDelete || showRetry ? 'rotate' : 'delete'}
              />
            </span>
          </Tooltip>
        )}
      </div>
      <div className="version">
        <Tooltip
          placement="bottomLeft"
          title={
            _.includes(debugEvents, -1)
              ? _l('编辑版测试')
              : versionDate && typeof versionDate === 'string'
                ? _l('版本：%0', versionDate)
                : _l('加载中')
          }
        >
          <span
            onMouseOver={() => {
              if (versionDate || _.includes(debugEvents, -1)) return;

              setVersion(true);

              process.getProcessPublish({ instanceId: id }).then(res => {
                setVersion(moment(res.lastPublishDate).format('YYYY-MM-DD HH:mm'));
                setWorkflowId(res.id);
              });
            }}
            onClick={e => {
              e.stopPropagation();

              if (!currentWorkflowId) return;

              window.open(`${isPlugin ? '/workflowplugin' : '/workflowedit'}/${currentWorkflowId}`);
            }}
          >
            <Icon className="Font16 ThemeHoverColor3 Block Gray_75" icon="info_outline" />
          </span>
        </Tooltip>
      </div>
    </li>
  );
};
