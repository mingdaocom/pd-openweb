import React from 'react';
import _ from 'lodash';
import { Button, Modal } from 'ming-ui/antd-components';

export default function recurCalendarUpdate(
  { operatorTitle, recurTitle, recurCalendarUpdateFun, danger = false },
  { isChildCalendar, isRecurChange, originRecur },
  { directRun, isEdit, callback } = {},
) {
  var directAll;
  var page = location.href.substr(location.href.lastIndexOf('/'));
  var locationUrl = page.substr(page.indexOf('_') + 1).split('_');
  if (originRecur && page.indexOf('detail') > 0 && locationUrl.length < 2) {
    directAll = true; // 只能修改全部 详情页 重复日程 不带recuTime
  }

  if (originRecur && !isChildCalendar && !directAll) {
    // 重复日程 非子日程 的 单个日程
    let modal;

    const handleSelect = isAllCalendar => {
      modal.destroy();
      recurCalendarUpdateFun(isAllCalendar);
    };

    modal = Modal.confirm({
      wrapClassName: 'repeatCalendarOperator',
      width: 410,
      title: recurTitle,
      content: (
        <div className="repeatCalendarOperatorMain mTop10 textTertiary">
          <div className="repeatCalendarOperatorModel mBottom10">
            <Button
              danger={danger}
              className="mRight10"
              disabled={isRecurChange && isEdit}
              onClick={() => handleSelect(false)}
            >
              {_l('仅此日程')}
            </Button>
            {isRecurChange && isEdit
              ? _l('日程重复性修改，不支持此操作')
              : _l('此操作仅更改单个日程，其他日程不受影响')}
          </div>
          <div className="repeatCalendarOperatorModel">
            <Button danger={danger} className="mRight10" onClick={() => handleSelect(true)}>
              {_l('所有日程')}
            </Button>
            {_l('此操作会更改后续所有的日程')}
          </div>
        </div>
      ),
      footer: null,
      onCancel: () => {
        if (_.isFunction(callback)) {
          // 拖拽时取消
          callback();
        }
      },
    });
  } else if (directRun) {
    // fullCalendar 拖拽
    recurCalendarUpdateFun(!isChildCalendar);
  } else {
    Modal.confirm({
      wrapClassName: 'repeatCalendarOperator',
      width: 420,
      title: operatorTitle,
      content: <div></div>,
      okButtonProps: { danger },
      onOk: () => {
        recurCalendarUpdateFun(!isChildCalendar);
      },
      onCancel: () => {
        if (_.isFunction(callback)) {
          callback();
        }
      },
    });
  }
}
