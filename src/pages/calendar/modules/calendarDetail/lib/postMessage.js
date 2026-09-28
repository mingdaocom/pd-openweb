import React, { useState } from 'react';
import _ from 'lodash';
import { Avatar, Button, Checkbox, Input, Modal } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/message';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { formatShowTime } from '../common';
import './css/postMessage.less';

function PostMessageContent({ defaultContent, members, onChange }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sendType, setSendType] = useState('message');
  const [content, setContent] = useState(defaultContent);
  const allIds = members.map(member => member.id);
  const isAllSelected = !!allIds.length && selectedIds.length === allIds.length;

  const updateValue = changes => {
    onChange({ selectedIds, sendType, content, ...changes });
  };

  const handleMemberChange = id => {
    const nextSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    setSelectedIds(nextSelectedIds);
    updateValue({ selectedIds: nextSelectedIds });
  };

  const handleSelectAll = event => {
    const nextSelectedIds = event.target.checked ? allIds : [];
    setSelectedIds(nextSelectedIds);
    updateValue({ selectedIds: nextSelectedIds });
  };

  const handleSendTypeChange = nextSendType => {
    setSendType(nextSendType);
    updateValue({ sendType: nextSendType });
  };

  const handleContentChange = event => {
    const nextContent = event.target.value;
    setContent(nextContent);
    updateValue({ content: nextContent });
  };

  return (
    <div className="postMessageReactContent">
      <div className="postMessageList">
        <ul className="clearfix pTop15">
          {members.map((member, index) => (
            <li key={member.id} onClick={() => handleMemberChange(member.id)}>
              <Checkbox
                checked={selectedIds.includes(member.id)}
                onClick={event => event.stopPropagation()}
                onChange={() => handleMemberChange(member.id)}
              />
              <Avatar className="calendarPostLabelImg" size={28} src={member.head} />
              <span className="postMessageName">
                {member.name} {index === 0 ? _l('（组织者）') : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="postOperator">
        <Checkbox
          checked={isAllSelected}
          indeterminate={selectedIds.length > 0 && !isAllSelected}
          onChange={handleSelectAll}
        >
          {_l('全选')}
        </Checkbox>
        <span className="postOperatorM">|</span>
        <Button
          type="text"
          className={sendType === 'message' ? 'colorPrimary' : ''}
          onClick={() => handleSendTypeChange('message')}
        >
          {_l('群发消息')}
        </Button>
        <Button
          type="text"
          className={sendType === 'email' ? 'colorPrimary' : ''}
          onClick={() => handleSendTypeChange('email')}
        >
          {_l('群发邮件')}
        </Button>
      </div>
      <div className="postContent">
        <Input.TextArea autoSize={{ minRows: 5, maxRows: 12 }} value={content} onChange={handleContentChange} />
        <div className="postContentMessage">{_l('非通讯录联系人的，您可以通过邮件联系他们。')}</div>
      </div>
    </div>
  );
}

export default function ({ id, recurTime, members, address, description, allDay, start, end, title }) {
  const data = _.map(members, member => ({
    ...member,
    name: member.memberName,
    id: member.accountID || '',
  })).filter(member => member.id && member.id !== md.global.Account.accountId);

  const defaultContent =
    _l('%0 邀请您参加日程：%1', md.global.Account.fullname, title.replace(/\n/g, '')) +
    '\n' +
    _l('时间：%0', formatShowTime({ allDay, start, end })) +
    '\n' +
    (address ? _l('地点：%0', address) : _l('地点：无')) +
    '\n' +
    (description ? _l('描述：%0', description) : _l('描述：无'));
  let formValue = { selectedIds: [], sendType: 'message', content: defaultContent };

  Modal.confirm({
    wrapClassName: 'postMessageDialog',
    width: 570,
    title: _l('发送日程通知'),
    content: (
      <PostMessageContent defaultContent={defaultContent} members={data} onChange={value => (formValue = value)} />
    ),
    cancelText: _l('取消'),
    okText: _l('发送'),
    onOk: () => {
      if (!formValue.selectedIds.length) {
        alert(_l('请选择发送人员'), 3);
        return false;
      }

      const method = formValue.sendType === 'email' ? 'sendEmailMessageToAccountIds' : 'sendMessageToAccountIds';
      return ajaxRequest[method]({
        calendarId: id,
        recurTime,
        accountIds: formValue.selectedIds,
        content: formValue.content,
        attachments: '',
      })
        .then(() => alert(_l('发送成功'), 1))
        .catch(_requestError => {
          alertIfNotUnauthorized(_requestError, _l('发送失败'), 3);
          return Promise.reject();
        });
    },
  });
}
