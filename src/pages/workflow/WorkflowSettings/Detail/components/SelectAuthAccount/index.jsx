import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Modal, Select } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import oauth2 from '../../../../api/oauth2';
import CustomTextarea from '../CustomTextarea';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const Member = styled.span`
  align-items: center;
  display: inline-flex;
  height: 26px;
  vertical-align: top;
  margin-right: 10px;
  background: var(--color-background-secondary);
  border-radius: 26px;
  padding-right: 10px;
  position: relative;
  img {
    width: 26px;
    height: 26px;
    border-radius: 50%;
  }
`;

const AccountSelect = styled(Select)`
  min-width: 0;
  width: 100%;
`;

const Message = styled.div`
  top: 1px;
  bottom: 1px;
  left: 1px;
  right: 37px;
  z-index: 1;
  border-radius: 4px 0 0 4px;
  background: var(--color-background-primary);
`;

/**
 * fromType 1：工作流  2：字段
 */
export default props => {
  const {
    className,
    connectId,
    apiId,
    required = false,
    fromType = 1,
    authId,
    authIdAccounts = [],
    authIdKeywords = '',
    onChange = () => {},
    hasMore = true,
  } = props;
  const [list, setList] = useState([]);
  const [users, setUsers] = useState(authIdAccounts);
  const [showDialog, setShowDialog] = useState(false);
  const [cacheKeywords, setCacheKeywords] = useState(authIdKeywords);

  useEffect(() => {
    oauth2.getMyTokenList({ id: connectId, apiId }, { isIntegration: true }).then(res => {
      setList(res.map(o => ({ text: o.name, value: o.id })));
    });
  }, [connectId, apiId]);

  return (
    <div className={className}>
      <div className="Font13">
        {_l('选择账户')}
        {required && (
          <span className="mLeft5" style={{ color: 'var(--color-error)' }}>
            *
          </span>
        )}
      </div>
      <div className="flexRow mTop10 relative">
        <AccountSelect
          className="flex"
          options={list}
          fieldNames={SELECT_FIELD_NAMES}
          value={authId || undefined}
          showSearch
          optionFilterProp="text"
          labelRender={
            authId && list.length && !list.find(o => o.value === authId)
              ? () => {
                  return <span style={{ color: 'var(--color-error)' }}>{_l('账户已删除')}</span>;
                }
              : null
          }
          notFoundContent={_l('请先在集成中心添加账户')}
          onChange={onChange}
        />

        {hasMore && (
          <div
            className={cx('actionControlMore', { colorPrimary: fromType !== 2 })}
            onClick={() => {
              setUsers(authIdAccounts);
              setCacheKeywords(authIdKeywords);
              setShowDialog(true);
            }}
          >
            <i className="icon-lookup" />
          </div>
        )}

        {!!authIdAccounts.length && (
          <Message className="Absolute flexRow pLeft12 pRight12 alignItemsCenter">
            <i className="icon-lookup Font18 mRight10" />
            <span className="flex">{_l('查询账户')}</span>
            <i
              className="icon-cancel Font16 textSecondary hoverColorPrimary pointer"
              onClick={() => onChange({ authIdAccounts: [], authIdKeywords: '' })}
            />
          </Message>
        )}
      </div>

      {showDialog && (
        <Modal
          className="workflowDialogBox"
          open
          width={600}
          title={
            <>
              <div>{_l('查询账户')}</div>
              <div className="Font13 Normal textSecondary mTop8">{_l('查询用户在连接下创建的授权账户名称')}</div>
            </>
          }
          onOk={() => {
            if (!users.length || !(cacheKeywords || '').trim()) {
              alert(_l('用户和账户名称不能为空'), 2);
              return;
            }

            onChange({ authIdAccounts: users, authIdKeywords: cacheKeywords, authId: '' });
            setShowDialog(false);
          }}
          onCancel={() => {
            setShowDialog(false);
            setUsers(authIdAccounts);
            setCacheKeywords(authIdKeywords);
          }}
        >
          <div className="Font14 bold">{_l('用户')}</div>
          <div className="mTop10 flexRow alignItemsCenter">
            {users.map((user, index) => {
              return (
                <Member key={index}>
                  <img src={user.avatar} />
                  <span className="ellipsis mLeft8" style={{ maxWidth: 300 }}>
                    {user.roleName}
                  </span>
                </Member>
              );
            })}

            <UserSelectPopover
              offset={{ top: 10, left: 0 }}
              projectId={props.companyId}
              unique
              filterAll
              filterFriend
              filterOthers
              filterOtherProject
              filterAccountIds={users.length ? [users[0].roleId] : []}
              onSelect={selectedUsers => {
                setUsers(
                  selectedUsers.map(o => ({
                    avatar: o.avatar,
                    roleId: o.accountId,
                    roleName: o.fullname,
                    roleTypeId: 0,
                    type: 1,
                  })),
                );
              }}
            >
              <i
                className={cx(
                  'Font26 textSecondary hoverColorPrimary pointer',
                  users.length ? 'icon-task-folder-charge' : 'icon-task-add-member-circle',
                )}
              />
            </UserSelectPopover>
          </div>

          <div className="Font14 bold mTop20">{_l('账户名称')}</div>

          {fromType === 1 && (
            <CustomTextarea
              projectId={props.companyId}
              processId={props.processId}
              relationId={props.relationId}
              selectNodeId={props.selectNodeId}
              type={2}
              height={0}
              content={cacheKeywords}
              formulaMap={props.formulaMap}
              onChange={(err, value) => setCacheKeywords(value)}
              updateSource={onChange}
            />
          )}

          {fromType === 2 &&
            props.renderApiAuth({ content: cacheKeywords, onChange: value => setCacheKeywords(value) })}
        </Modal>
      )}
    </div>
  );
};
