import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog, Dropdown } from 'ming-ui';
import { quickSelectUser } from 'ming-ui/functions';
import oauth2 from '../../../../api/oauth2';
import CustomTextarea from '../CustomTextarea';

const Member = styled.span`
  align-items: center;
  display: inline-flex;
  height: 26px;
  vertical-align: top;
  margin-right: 10px;
  background: #f7f7f7;
  border-radius: 26px;
  padding-right: 10px;
  position: relative;
  img {
    width: 26px;
    height: 26px;
    border-radius: 50%;
  }
`;

const DropdownBox = styled(Dropdown)`
  min-width: 0;
  width: 100%;
  .Dropdown--border {
    border-radius: 4px 0 0 4px !important;
  }
  .value {
    display: inline-flex;
    align-items: center;
  }
  .ming.Menu {
    width: 100%;
  }
`;

const Message = styled.div`
  top: 1px;
  bottom: 1px;
  left: 1px;
  right: 37px;
  border-radius: 4px 0 0 4px;
  background: #fff;
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

  useEffect(() => {
    if (showDialog) {
      setUsers(authIdAccounts);
      setCacheKeywords(authIdKeywords);
    }
  }, [showDialog]);

  const selectUser = event => {
    quickSelectUser(event.target, {
      offset: {
        top: 10,
        left: 0,
      },
      projectId: props.companyId,
      unique: true,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      filterAccountIds: users.length ? [users[0].roleId] : [],
      onSelect: users => {
        setUsers(
          users.map(o => {
            return {
              avatar: o.avatar,
              roleId: o.accountId,
              roleName: o.fullname,
              roleTypeId: 0,
              type: 1,
            };
          }),
        );
      },
    });
  };

  return (
    <div className={className}>
      <div className="Font13">
        {_l('选择账户')}
        {required && (
          <span className="mLeft5" style={{ color: '#f44336' }}>
            *
          </span>
        )}
      </div>
      <div className="flexRow mTop10 relative">
        <DropdownBox
          className="flex"
          data={list}
          value={authId || undefined}
          openSearch
          renderTitle={
            authId && list.length && !list.find(o => o.value === authId)
              ? () => {
                  return <span style={{ color: '#f44336' }}>{_l('账户已删除')}</span>;
                }
              : null
          }
          border
          noData={_l('请先在集成中心添加账户')}
          onChange={onChange}
        />

        {hasMore && (
          <div className={cx('actionControlMore', { ThemeColor3: fromType !== 2 })} onClick={() => setShowDialog(true)}>
            <i className="icon-lookup" />
          </div>
        )}

        {!!authIdAccounts.length && (
          <Message className="Absolute flexRow pLeft12 pRight12 alignItemsCenter">
            <i className="icon-lookup Font18 mRight10" />
            <span className="flex">{_l('查询账户')}</span>
            <i
              className="icon-cancel Font16 Gray_75 ThemeHoverColor3 pointer"
              onClick={() => onChange({ authIdAccounts: [], authIdKeywords: '' })}
            />
          </Message>
        )}
      </div>

      {showDialog && (
        <Dialog
          className="workflowDialogBox"
          visible
          width={600}
          title={_l('查询账户')}
          description={_l('查询用户在连接下创建的授权账户名称')}
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

            <i
              className={cx(
                'Font26 Gray_75 ThemeHoverColor3 pointer',
                users.length ? 'icon-task-folder-charge' : 'icon-task-add-member-circle',
              )}
              onClick={selectUser}
            />
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
        </Dialog>
      )}
    </div>
  );
};
