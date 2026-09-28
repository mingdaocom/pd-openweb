import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import { useAddUserFeedback } from 'src/pages/Admin/user/membersDepartments/structure/components/AddUserFeedback';
import { INVITE_FAILED_REASON } from './enum';

const UserItemWrap = styled.div`
  height: 28px;
  background: var(--color-background-secondary);
  border-radius: 20px;
  display: inline-block;
  padding-right: 2px;
  margin-right: 10px;
  margin-bottom: 8px;
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    vertical-align: top;
  }
  .fullname {
    display: inline-block;
    line-height: 28px;
    max-width: 95px;
    margin: 0 10px 0 8px;
  }
`;

function UserItem(props) {
  const { accountId, avatar, fullname } = props;
  return (
    <UserItemWrap key={accountId}>
      <img src={avatar} alt="头像" className="avatar" />
      <span className="fullname overflow_ellipsis">{fullname}</span>
    </UserItemWrap>
  );
}

function InviteFailedDialog(props) {
  const { open: openAddUserFeedback, holder: addUserFeedbackHolder } = useAddUserFeedback();
  const { visible, projectId, inviteTotal, result = {}, onClose = () => {} } = props;
  const {
    existAccountInfos = [],
    limitAccountInfos = [],
    forbidAccountInfos = [],
    failedAccountInfos = [],
  } = _.get(result, 'results[0]') || {};
  const [removedAccountInfos, setRemovedAccountInfos] = useState(_.get(result, 'results[0].removedAccountInfos') || []);
  const failedTotal =
    existAccountInfos.length +
    removedAccountInfos.length +
    limitAccountInfos.length +
    forbidAccountInfos.length +
    failedAccountInfos.length;

  const renderReason = (accountInfos, failedType) => {
    if (!accountInfos.length) return null;

    return (
      <div className="mBottom16">
        <div className="mBottom12 bold">{INVITE_FAILED_REASON[failedType]}</div>
        <div className="users">
          {accountInfos.map(user => {
            if (failedType === 'removed') {
              return (
                <div className="flexRow">
                  <UserItem {...user} key={user.accountId} />
                  <span
                    className="mLeft20 LineHeight28 Hand colorPrimary Hover_51"
                    onClick={() =>
                      openAddUserFeedback({
                        projectId,
                        actionResult: 5,
                        currentUser: user,
                        refreshData: () => {
                          if (removedAccountInfos.length === 1 && failedTotal === 1) {
                            onClose();
                          }

                          setRemovedAccountInfos(removedAccountInfos.filter(v => v.accountId !== user.accountId));
                        },
                      })
                    }
                  >
                    {_l('恢复')}
                  </span>
                </div>
              );
            }

            return <UserItem {...user} key={user.accountId} />;
          })}
        </div>
      </div>
    );
  };

  if (!failedTotal) {
    alert(_l('邀请成功'));
    return null;
  }

  return (
    <Modal
      open={visible}
      mask={{ closable: true }}
      keyboard
      title={
        <React.Fragment>
          <div>{_l('%0 个成员邀请失败', failedTotal)}</div>
          <div className="Font13 Normal textSecondary mTop8">
            {_l('本次共邀请%0个成员，有%1个成员邀请失败', inviteTotal, failedTotal)}
          </div>
        </React.Fragment>
      }
      footer={null}
      onCancel={onClose}
    >
      {addUserFeedbackHolder}
      {renderReason(removedAccountInfos, 'removed')}
      {renderReason(existAccountInfos, 'exist')}
      {renderReason(limitAccountInfos, 'limit')}
      {renderReason(forbidAccountInfos, 'forbid')}
      {renderReason(failedAccountInfos, 'failed')}
    </Modal>
  );
}

export function useInviteFailedDialog() {
  return useFunctionWrapComponent(InviteFailedDialog);
}
