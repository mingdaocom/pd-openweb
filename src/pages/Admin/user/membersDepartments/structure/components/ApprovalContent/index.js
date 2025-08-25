import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { antNotification, Dialog, LoadDiv } from 'ming-ui';
import userAjax from 'src/api/user';
import { checkCertification } from 'src/components/checkCertification';
import { refuseUserJoinFunc } from '../refuseUserJoinDia';
import UserTable from '../userList/userTable';

const TabWrap = styled.div`
  display: flex;
  border-bottom: 1px solid #eaeaea;
  .item {
    width: 42px;
    text-align: center;
    padding: 10px 0;
    margin-right: 30px;
    &.active {
      border-bottom: 2px solid #1677ff;
    }
  }
`;

const tabs = [
  { tab: _l('待审核'), type: 3 },
  { tab: _l('已拒绝'), type: 2 },
];

export default function ApprovalContent(props) {
  const {
    projectId,
    isLoading,
    userStatus,
    selectedAccountIds,
    loadApprovalUsers = () => {},
    updateUserStatus = () => {},
    updateSelectedAccountIds = () => {},
  } = props;

  // 批准加入
  const approve = () => {
    if (_.isEmpty(selectedAccountIds)) return;
    Dialog.confirm({
      title: _l('批准用户加入'),
      description: (
        <div className="Gray">
          {_l('您共勾选了')}
          <span className="ThemeColor"> {selectedAccountIds.length} </span>
          {_l('个用户')}
        </div>
      ),
      okText: _l('批准'),
      onOk: () => {
        userAjax
          .agreeUsersJoin({
            accountIds: selectedAccountIds,
            projectId,
          })
          .then(res => {
            if (res.actionResult === 1) {
              alert(_l('批准成功'));
              loadApprovalUsers(projectId, 1);
              updateSelectedAccountIds([]);
            } else if (res.actionResult === 4) {
              antNotification['error']({
                className: 'approvalErr',
                key: 'approvalErr',
                duration: 5,
                message: _l('批量批准用户加入失败'),
                description: (
                  <div>
                    <div>{_l('您操作的成员批量批准用户加入失败')}</div>
                    <div>{_l('失败原因：用户数超限')}</div>
                  </div>
                ),
              });
            } else {
              alert(_l('批准加入失败'), 2);
            }
          });
      },
    });
  };

  // 批量拒绝
  const refuse = () => {
    if (_.isEmpty(selectedAccountIds)) return;
    refuseUserJoinFunc({
      projectId,
      accountIds: selectedAccountIds,
      callback: () => {
        updateSelectedAccountIds([]);
        loadApprovalUsers(projectId, 1);
      },
    });
  };

  return (
    <Fragment>
      <TabWrap>
        {tabs.map(item => (
          <div
            className={cx('item Hand', { active: item.type === userStatus })}
            onClick={() => {
              updateSelectedAccountIds([]);
              updateUserStatus(item.type);
              loadApprovalUsers(projectId, 1);
            }}
          >
            {item.tab}
          </div>
        ))}
      </TabWrap>
      <div className="actList flexRow pLeft0 mTop20">
        <div
          className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })}
          onClick={() => !_.isEmpty(selectedAccountIds) && checkCertification({ projectId, checkSuccess: approve })}
        >
          {_l('批准加入')}
        </div>
        {userStatus === 3 && (
          <div className={cx('actBtn', { disabledBtn: _.isEmpty(selectedAccountIds) })} onClick={refuse}>
            {_l('拒绝')}
          </div>
        )}
      </div>
      {isLoading ? (
        <div>
          <LoadDiv />
        </div>
      ) : (
        <UserTable projectId={projectId} />
      )}
    </Fragment>
  );
}
