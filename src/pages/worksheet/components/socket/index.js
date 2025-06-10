import _ from 'lodash';
import { mdNotification } from 'ming-ui/functions';
import process from 'src/pages/workflow/api/process';
import { FLOW_FAIL_REASON } from 'src/pages/workflow/WorkflowSettings/History/config';
import { emitter } from 'src/utils/common';
import { equalToLocalPushUniqueId, getDataFromLocalPushUniqueId } from 'src/utils/common';
import workflowHistory from './workflowHistory';
import './index.less';

const STATUS = {
  0: { id: 'closed', text: _l('流程未启用'), action: 'error', promptType: 2 },
  1: { id: 'pending', text: _l('正在执行...'), action: 'info', promptType: 5 },
  2: { id: 'success', text: _l('操作成功'), action: 'success', promptType: 1 },
  3: { id: 'stop', text: _l('执行失败'), action: 'error', promptType: 3 },
  4: { id: 'failure', text: _l('操作失败'), action: 'error', promptType: 2 },
};
const TYPES = {
  3: _l('填写...'),
  4: _l('审批...'),
};

const getBatchNoticeDescription = ({ finished, total, failed, executeType }) => {
  if (finished === total) {
    return `${_l('执行完成!')}\n${failed > 0 ? _l('%0条失败', failed) : ''}`;
  } else {
    return executeType === 2 && finished === 0
      ? _l(
          '您的流程已进入队列，这可能需要一段时间。现在您可以进行其他操作，执行完成后将会通知您... %0/%1',
          finished,
          total,
        )
      : _l('正在执行... %0/%1', finished, total);
  }
};

const getSingleNoticeDescription = ({ cause, causeMsg, type, status = 1, executeType, finished }) => {
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
  return isOperate ? _l('正在等待%0', TYPES[type]) : getHint();
};

export default function initWorksheetSocket() {
  const { socket } = window.IM || {};
  let complete = {};

  if (!socket) return;
  socket.on('workflow', data => {
    const {
      pushUniqueId,
      status,
      type,
      worksheetId,
      rowId = '',
      storeId,
      total,
      finished,
      title,
      executeType,
      close,
    } = data;

    const recordId = rowId.indexOf('_') > 0 ? (rowId.match(/(.+?)_/) || '')[1] : rowId;

    if (!equalToLocalPushUniqueId(pushUniqueId)) {
      return;
    }

    if (status === 2 || ((type === 4 || type === 3) && status === 1)) {
      emitter.emit('RELOAD_RECORD_INFO', {
        worksheetId,
        recordId,
        closeWhenNotViewData: true,
      });
      if (window.customWidgetViewIsActive) {
        emitter.emit('POST_MESSAGE_TO_CUSTOM_WIDGET', {
          action: 'reload-record-info',
          value: {
            recordId,
            worksheetId,
          },
        });
      }
    }

    if (close) {
      destroyAlert('workflow');
      return;
    }

    if (storeId) {
      if (total === finished && !complete[storeId]) {
        complete[storeId] = data;
      }
      const noticeTitle = storeId ? _l('批量操作 ”%0“', title) : title;
      const description = getBatchNoticeDescription(complete[storeId] || data);
      let btnList = [];
      if (!(executeType === 2 && finished === 0)) {
        btnList = [
          {
            text: _l('查看详情'),
            onClick: () => workflowHistory({ title, storeId }),
          },
        ];
      }
      const onClose = () => {
        mdNotification.close(`batchUpdateWorkflowNotice${storeId}`);
        process.closeStorePush({ storeId });
      };
      mdNotification[finished > 0 && complete[storeId] ? 'success' : 'info']({
        title: noticeTitle,
        description,
        btnList,
        onClose,
        key: `batchUpdateWorkflowNotice${storeId}`,
        duration: 5,
        maxCount: 3,
      });
    } else {
      const { id, promptType } = STATUS[status];
      let description = getSingleNoticeDescription(data);
      const isOperate = _.includes([3, 4], data.type);
      const triggerData = getDataFromLocalPushUniqueId();
      const { enableTip, tipText } = triggerData;
      emitter.emit('RECORD_WORKFLOW_UPDATE', {
        worksheetId,
        recordId,
        status,
        isSuccess: status === 2,
        ...triggerData,
      });
      if (status === 2 && enableTip === false) {
        return;
      }
      if (status === 2 && enableTip && tipText) {
        description = tipText;
      }
      alert({
        msg: description,
        type: isOperate ? 4 : promptType,
        timeout: 1000,
        key: 'workflow',
      });
    }
  });
}
