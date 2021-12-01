import { notification, NotificationContent } from 'ming-ui/components/Notification';
import React from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { emitter } from 'worksheet/util';
import cx from 'classnames';
import './index.less';
import workflowHistory from './workflowHistory';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import process from 'src/pages/workflow/api/process';

const STATUS = {
  0: { id: 'closed', text: _l('流程未启用'), theme: 'error', icon: 'Import-failure' },
  1: { id: 'pending', text: _l('正在执行...'), theme: '', icon: 'loading_button' },
  2: { id: 'success', text: _l('操作成功'), theme: 'success', icon: 'Import-success' },
  3: { id: 'stop', text: _l('执行失败'), theme: 'error', icon: 'Import-failure' },
  4: { id: 'failure', text: _l('操作失败'), theme: 'error', icon: 'Import-failure' },
};
const TYPES = {
  3: _l('填写...'),
  4: _l('审批...'),
};

const Notice = styled.div`
  max-width: 100%;
  display: flex;
  font-size: 13px;
  color: #757575;
  .title {
    margin-right: 4px;
  }
  .icon {
    font-size: 20px;
  }
  .success {
    color: #4caf50;
  }
  .failure,
  .closed {
    color: #f44336;
  }
  .person {
    margin: 0 6px;
  }
  .statusText {
    display: flex;
    flex-wrap: wrap;
    margin: 0 4px 0 6px;
    overflow: hidden;
    color: #333;
    font-size: 14px;
    font-weight: bold;
  }
  .batchUpdateTitle {
    max-width: 170px;
  }
`;

const NoticeHeader = ({ storeId, type, finished, total, title, status = 1, executeType }) => {
  const isPending = executeType === 2 && finished === 0;

  if (storeId) {
    return (
      <Notice>
        {!isPending && (
          <div className={cx('iconWrap')}>
            {finished === total ? <i className={'icon icon-Import-success'}></i> : <LoadDiv size="small" />}
          </div>
        )}
        <div className="statusText">
          {_l('批量操作 “')}
          <div className="title batchUpdateTitle  overflow_ellipsis" title={title}>
            {title}
          </div>
          {_l('”')}
        </div>
      </Notice>
    );
  }
  const { id, icon } = STATUS[status];
  const isOperate = _.includes([3, 4], type);
  return (
    <Notice>
      {!isPending && (
        <div className={cx('iconWrap', { rotate: id === 'pending' && !isOperate })}>
          <i className={`icon icon-${isOperate ? 'interrupt_button' : icon} ${id}`}></i>
        </div>
      )}

      <div className="statusText">
        <div className="title overflow_ellipsis" title={title}>
          {title}
        </div>
      </div>
    </Notice>
  );
};

const NoticeContentWrap = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 4px 0 0 24px;
  color: #757575;
`;
const BatchNoticeContent = ({ finished, total, failed, executeType }) => {
  return (
    <NoticeContentWrap>
      {finished === total ? (
        <div>
          {_l('执行完成! ')}
          {failed > 0 && <span>{_l('%0条失败', failed)}</span>}
        </div>
      ) : (
        <div>
          {executeType === 2 && finished === 0
            ? _l(
                '您的流程已进入队列，这可能需要一段时间。现在您可以进行其他操作，执行完成后将会通知您... %0/%1',
                finished,
                total,
              )
            : _l('正在执行... %0/%1', finished, total)}
        </div>
      )}
    </NoticeContentWrap>
  );
};
const SingleNoticeContent = ({ cause, causeMsg, type, status = 1, executeType, finished }) => {
  const getHint = () => {
    const { text } = STATUS[status];
    if ([3, 4].includes(status)) {
      return FLOW_FAIL_REASON[cause] || causeMsg || text;
    }
    return executeType === 2 && finished === 0 && status !== 2
      ? _l('您的流程已进入队列，这可能需要一段时间。现在您可以进行其他操作，执行完成后将会通知您')
      : text;
  };
  const isOperate = _.includes([3, 4], type);
  return (
    <NoticeContentWrap>
      <div>{isOperate ? _l('正在等待%0', TYPES[type]) : getHint()}</div>
    </NoticeContentWrap>
  );
};

export default function initWorksheetSocket() {
  const { socket } = window.IM || {};
  let complete = {};

  if (!socket) return;
  socket.on('workflow', data => {
    const { status, type, worksheetId, rowId, storeId, total, finished, title, executeType } = data;
    if (status === 2 || (type === 4 && status === 1)) {
      emitter.emit('RELOAD_RECORDINFO', {
        worksheetId,
        recordId: rowId.indexOf('_') > 0 ? (rowId.match(/(.+?)_/) || '')[1] : rowId,
        closeWhenNotViewData: true,
      });
    }
    if (storeId) {
      if (total === finished && !complete[storeId]) {
        complete[storeId] = data;
      }
      const props = {
        themeColor: finished > 0 && complete[storeId] ? 'success' : '',
        header: complete[storeId] ? <NoticeHeader {...complete[storeId]} /> : <NoticeHeader {...data} />,
        content: complete[storeId] ? <BatchNoticeContent {...complete[storeId]} /> : <BatchNoticeContent {...data} />,
        footer:
          executeType === 2 && finished === 0 ? null : (
            <div className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => workflowHistory({ title, storeId })}>
              {_l('查看详情')}
            </div>
          ),
        showClose: true,
        onClose: () => {
          notification.close(`batchUpdateWorkflowNotice${storeId}`);
          process.closeStorePush({ storeId });
        },
      };
      notification.open({
        content: <NotificationContent className="workflowNoticeContentWrap" {...props} />,
        key: `batchUpdateWorkflowNotice${storeId}`,
        duration: null,
        maxCount: 3,
      });
    } else {
      const { id } = STATUS[status];
      const props = {
        themeColor: STATUS[String(status)].theme,
        header: <NoticeHeader {...data} />,
        content: <SingleNoticeContent {...data} />,
        showClose: true,
        onClose: () => notification.close('workflow'),
      };
      notification.open({
        content: <NotificationContent className="workflowNoticeContentWrap" {...props} />,
        key: 'workflow',
        duration: id === 'pending' ? 10 : 3,
        maxCount: 3,
      });
    }
  });
}
