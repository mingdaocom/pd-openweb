import React, { useState } from 'react';
import { Input, Modal, Radio, Space } from 'ming-ui/antd-components';
import calendarController from 'src/api/calendar';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const Comm = {};

function RefuseReason({ onChange }) {
  const [reasonType, setReasonType] = useState('conflict');
  const [customReason, setCustomReason] = useState('');
  const reasons = {
    conflict: _l('时间与行程冲突'),
    unnecessary: _l('不需要参加'),
    none: _l('无理由'),
  };

  const updateReason = (type, customValue = customReason) => {
    onChange(type === 'other' ? customValue.trim() : reasons[type]);
  };

  const handleTypeChange = event => {
    const nextType = event.target.value;
    setReasonType(nextType);
    updateReason(nextType);
  };

  const handleCustomReasonChange = event => {
    const value = event.target.value;
    setCustomReason(value);
    updateReason(reasonType, value);
  };

  return (
    <div className="calendarRefuseReason">
      <Radio.Group value={reasonType} onChange={handleTypeChange}>
        <Space direction="vertical">
          <Radio value="conflict">{reasons.conflict}</Radio>
          <Radio value="unnecessary">{reasons.unnecessary}</Radio>
          <Radio value="none">{reasons.none}</Radio>
          <Radio value="other">{_l('其他')}</Radio>
        </Space>
      </Radio.Group>
      {reasonType === 'other' && (
        <Input.TextArea
          autoFocus
          className="mTop12"
          rows={3}
          value={customReason}
          placeholder={_l('输入您不能参加的理由')}
          onChange={handleCustomReasonChange}
        />
      )}
    </div>
  );
}

// state:1 确认参加 or state:2 拒绝参加
Comm.inviteCalendar = {
  confirm: function (calendarId, recurTime, catID, options = {}) {
    // 存在日程ID
    if (!calendarId) {
      alert(_l('操作失败'), 3);
      return;
    }

    // 确认参加
    return Comm.confirmOrUnconfirmInviteMe(calendarId, 1, '', recurTime, catID, options);
  },
  refuse: function (calendarId, recurTime, options = {}) {
    let reason = _l('时间与行程冲突');
    return Modal.confirm({
      wrapClassName: 'inviteDirectMessages',
      width: 488,
      title: <span className="resuserTitle colorPrimary">{_l('请回复您不能参加的原因')}</span>,
      content: <RefuseReason onChange={value => (reason = value)} />,
      okText: _l('不能参加'),
      cancelText: _l('取消'),
      onCancel: options.onClose,
      onOk: () => {
        if (!reason) {
          alert(_l('请输入不能参加的理由'), 3);
          return false;
        }

        return Comm.confirmOrUnconfirmInviteMe(calendarId, 2, reason, recurTime, '', options).finally(options.onClose);
      },
    });
  },
};

// 发送请求 state:1 确认参加 or state:2 拒绝参加
Comm.confirmOrUnconfirmInviteMe = function (calendarId, status, remark, recurTime, catID, options = {}) {
  return calendarController
    .changeMember({
      calendarID: calendarId,
      recurTime: recurTime,
      catID: catID,
      newStatus: status,
      remark: remark,
    })
    .then(function (source) {
      if (source.code == 1) {
        alert(status == 2 ? _l('您已发送不能参加的原因') : _l('您已确认参加该日程'));

        if (options.onSuccess) {
          options.onSuccess();
        }
      } else if (source.code === 3) {
        alert(_l('日程已被删除'), 3);
      } else {
        alert(source.msg || _l('修改失败'), 3);
      }
    })
    .catch(function (error) {
      console.error(error);
      alertIfNotUnauthorized(error, _l('操作失败'), 3);
      return false;
    });
};

// 导出配置
export default Comm;
