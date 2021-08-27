import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'ming-ui/components/Checkbox';

function CalendarPrivate(props) {
  const { isPrivate, createUser, changePrivacy } = props;
  const isCreateUser = createUser === md.global.Account.accountId;
  return (
    <div className="Gray_9 calendarPrivate">
      <Checkbox className="Font12 InlineBlock" disabled={!isCreateUser} checked={isPrivate} onClick={changePrivacy}>
        {isCreateUser ? <span>{_l('私密日程 (仅成员可见)')}</span> : <span data-tip={_l('仅日程发起人可修改')}>{_l('私密日程 (仅成员可见)')}</span>}
      </Checkbox>
      <span className="tip-top mLeft10 privateTip" data-tip={_l('日程内容默认公开给所有同事，勾选私密日程，将仅对参与人员公开。')}>
        <i className="icon-help Font16 tip-top" />
      </span>
    </div>
  );
}

CalendarPrivate.propTypes = {
  isPrivate: PropTypes.bool,
  createUser: PropTypes.shape({
    accountId: PropTypes.string,
  }),
  changePrivacy: PropTypes.func,
};

export default CalendarPrivate;
