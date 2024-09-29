import React, { Fragment, useState } from 'react';
import { Icon, Dialog, UserHead } from 'ming-ui';
import { Dropdown, Menu, Checkbox } from 'antd';
import { Popup, ActionSheet, Button, Dialog as MobileDialog } from 'antd-mobile';
import SelectUser from 'mobile/components/SelectUser';
import cx from 'classnames';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';
import { dialogSelectUser } from 'ming-ui/functions';

const isMobile = browserIsMobile();

const MenuItem = Menu.Item;

const WrapCon = styled.div`
  &.hoverBtnWrap .btn {
    &.pass:hover {
      background-color: rgba(76, 175, 80, 0.23);
    }
    &.handle:hover,
    &.revoke:hover,
    &.urge:hover {
      background-color: #ececec;
    }
    &.overrule:hover {
      background-color: rgba(244, 67, 54, 0.23);
    }
    &.return:hover {
      background-color: rgba(255, 152, 45, 0.23);
    }
  }
  .btn {
    color: #333;
    font-weight: bold;
    flex: 1;
    height: 32px;
    min-width: 0;
    padding: 0 10px;
    background: #f7f7f7;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    transition: 0.2s;
    &.pass {
      .icon {
        color: rgba(76, 175, 80, 1);
      }
      background-color: rgba(76, 175, 80, 0.13);
    }
    &.revoke {
      color: rgba(244, 67, 54, 1);
    }
    &.overrule {
      .icon {
        color: rgba(244, 67, 54, 1);
      }
      background-color: rgba(244, 67, 54, 0.13);
    }
    &.return, &.taskRevoke {
      .icon {
        color: rgba(255, 152, 45, 1);
      }
      background-color: rgba(255, 152, 45, 0.13);
    }
    &.reset {
      .icon {
        color: #0096ef;
      }
      background-color: #e2f2fd;
    }
    &.urgeDisable {
      opacity: 0.6;
    }
    &:last-child {
      margin-right: 0;
    }
  }
  .mobileMore {
    padding: 0;
    width: 30px;
    flex: inherit;
  }
`;

const UpdateUserWrap = styled.div`
  .original {
    padding-right: 10px;
    border-right: 1px solid #dddddd;
  }
  .accountWrap {
    padding: 5px;
    margin-bottom: 5px;
    border-radius: 3px;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

function UpdateUserDialog(props) {
  const { visible, projectId, data } = props;
  const { onCancel, onOK } = props;
  const currentWorkItems = data.currentWorkItems || [];
  const [selectAccountIds, setSelectAccountIds] = useState(
    currentWorkItems.map(data => data.workItemAccount.accountId),
  );
  const [newAccounts, setNewAccounts] = useState([]);

  const handleAddAccount = () => {
    dialogSelectUser({
      showMoreInvite: false,
      overlayClosable: false,
      SelectUserSettings: {
        projectId,
        selectedAccountIds: currentWorkItems.map(data => data.workItemAccount.accountId),
        callback: users => {
          setNewAccounts(users);
        },
      },
    });
  };

  return (
    <Dialog
      visible={visible}
      width={640}
      title={_l('调整负责人')}
      description={_l('移除尚未进行操作的负责人，添加新的成员；您的操作仅对当前流程的本次运行生效')}
      onCancel={onCancel}
      onOk={() => {
        const ids = selectAccountIds.concat(newAccounts.map(data => data.accountId));
        onOK(ids);
      }}
    >
      <UpdateUserWrap className="flexRow">
        <div className="flex original">
          {!!currentWorkItems.length && (
            <div
              className="flexRow valignWrapper pointer pLeft5 pRight5 mBottom5"
              onClick={() => {
                if (selectAccountIds.length === currentWorkItems.length) {
                  setSelectAccountIds([]);
                } else {
                  setSelectAccountIds(currentWorkItems.map(data => data.workItemAccount.accountId));
                }
              }}
            >
              <Checkbox className="flexRow bold" checked={selectAccountIds.length === currentWorkItems.length} />
              <div className="bold mLeft15">{`${_l('原负责人')}${
                selectAccountIds.length ? `(${selectAccountIds.length})` : ''
              }`}</div>
            </div>
          )}
          {currentWorkItems.map(data => (
            <div
              key={data.workItemAccount.accountId}
              className="accountWrap flexRow valignWrapper pointer"
              onClick={() => {
                if (selectAccountIds.includes(data.workItemAccount.accountId)) {
                  setSelectAccountIds(selectAccountIds.filter(id => id !== data.workItemAccount.accountId));
                } else {
                  setSelectAccountIds(selectAccountIds.concat(data.workItemAccount.accountId));
                }
              }}
            >
              <Checkbox className="flexRow" checked={selectAccountIds.includes(data.workItemAccount.accountId)} />
              <div className="flexRow valignWrapper mLeft15">
                <UserHead
                  size={28}
                  user={{ userHead: data.workItemAccount.avatar, accountId: data.workItemAccount.accountId }}
                />
                <div className="mLeft12">{data.workItemAccount.fullName}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex mLeft15">
          <div className="bold mBottom5">{`${_l('新增负责人')}${
            newAccounts.length ? `(${newAccounts.length})` : ''
          }`}</div>
          {newAccounts.map(data => (
            <div className="accountWrap flexRow valignWrapper" key={data.accountId}>
              <UserHead size={28} user={{ userHead: data.avatar, accountId: data.accountId }} />
              <div className="mLeft10 flex">{data.fullname}</div>
              <Icon
                icon="close"
                className="Gray_75 Font16 pointer"
                onClick={() => {
                  setNewAccounts(newAccounts.filter(a => a.accountId !== data.accountId));
                }}
              />
            </div>
          ))}
          <div className="valignWrapper Gray_bd mTop10 pointer pAll5" onClick={handleAddAccount}>
            <div className="addWrap valignWrapper">
              <Icon className="Font28" icon="task-add-member-circle" />
            </div>
            <div className="mLeft10">{_l('添加负责人')}</div>
          </div>
        </div>
      </UpdateUserWrap>
    </Dialog>
  );
}

const MobileUpdateUserWrap = styled.div`
  .header {
    padding: 24px 16px 16px;
    background-color: #f8f8f8;
  }
  .content {
    padding: 24px 16px 16px;
    background-color: #fff;
    .original {
      border-bottom: 1px solid #f5f5f5;
    }
    .flexWrap {
      flex-wrap: wrap;
    }
    .accountItem {
      width: 50%;
      margin-bottom: 10px;
    }
    .accountWrap {
      border-radius: 16px;
      padding-right: 10px;
      background-color: #f5f5f5;
      position: relative;
      img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 6px;
      }
      .delete {
        position: absolute;
        right: -3px;
        top: -5px;
        font-size: 18px;
      }
    }
  }
  .btnsWrapper {
    padding: 7px 10px;
    background-color: #fff;
  }
`;

function MobileUpdateUserDialog(props) {
  const { visible, projectId, data } = props;
  const { onCancel, onOK } = props;
  const currentWorkItems = data.currentWorkItems || [];
  const [selectAccountIds, setSelectAccountIds] = useState(
    currentWorkItems.map(data => data.workItemAccount.accountId),
  );
  const [newAccounts, setNewAccounts] = useState([]);
  const [selectUserVisible, setSelectUserVisible] = useState(false);

  return (
    <Fragment>
      <Popup className="mobileModal full" onClose={onCancel} visible={visible}>
        <MobileUpdateUserWrap className="flexColumn h100 leftAlign">
          <div className="header">
            <div className="Font17 Gray bold mBottom6">{_l('调整负责人')}</div>
            <div className="Font12 Gray_75">
              {_l('移除尚未进行操作的负责人，将其替换为新的成员；您的操作仅对当前流程的本次运行生效')}
            </div>
          </div>
          <div className="flex content">
            <div className="original pBottom10">
              <div className="valignWrapper mBottom15">
                <div className="flex Font15 Gray bold">{_l('原负责人')}</div>
                <div
                  style={{ fontWeight: 500 }}
                  className="ThemeColor Font13"
                  onClick={() => {
                    if (selectAccountIds.length === currentWorkItems.length) {
                      setSelectAccountIds([]);
                    } else {
                      setSelectAccountIds(currentWorkItems.map(data => data.workItemAccount.accountId));
                    }
                  }}
                >
                  {selectAccountIds.length === currentWorkItems.length ? _l('取消全选') : _l('全选')}
                </div>
              </div>
              <div className="flexRow flexWrap">
                {currentWorkItems.map(data => (
                  <div
                    key={data.workItemAccount.accountId}
                    className="accountItem valignWrapper"
                    onClick={() => {
                      if (selectAccountIds.includes(data.workItemAccount.accountId)) {
                        setSelectAccountIds(selectAccountIds.filter(id => id !== data.workItemAccount.accountId));
                      } else {
                        setSelectAccountIds(selectAccountIds.concat(data.workItemAccount.accountId));
                      }
                    }}
                  >
                    {selectAccountIds.includes(data.workItemAccount.accountId) ? (
                      <Icon className="Font24 ThemeColor" icon="check_circle" />
                    ) : (
                      <Icon className="Font24 Gray_75" icon="not_checked" />
                    )}
                    <div className="mLeft5 valignWrapper accountWrap">
                      <img src={data.workItemAccount.avatar} />
                      <span className="Font13 breakAll flex ellipsis">{data.workItemAccount.fullName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mTop10">
              <div className="flex Font15 Gray bold mBottom15">{_l('新增负责人')}</div>
              <div className="flexRow flexWrap">
                {newAccounts.map(data => (
                  <div className="valignWrapper accountWrap mRight10 mBottom10" key={data.accountId}>
                    <img src={data.avatar} />
                    <span className="Font13">{data.fullname}</span>
                    <Icon
                      icon="remove_circle"
                      className="delete Gray_bd"
                      onClick={() => {
                        setNewAccounts(newAccounts.filter(a => a.accountId !== data.accountId));
                      }}
                    />
                  </div>
                ))}
                <div className="justifyContentCenter valignWrapper Gray_bd" onClick={() => setSelectUserVisible(true)}>
                  <Icon className="Font26" icon="task-add-member-circle" />
                </div>
              </div>
            </div>
          </div>
          <div className="btnsWrapper flexRow">
            <Button className="flex mLeft6 mRight6 Font13 bold Gray_75" onClick={onCancel}>
              {_l('取消')}
            </Button>
            <Button
              className="flex mLeft6 mRight6 Font13 bold"
              color="primary"
              onClick={() => {
                const ids = selectAccountIds.concat(newAccounts.map(data => data.accountId));
                onOK(ids);
              }}
            >
              {_l('确定')}
            </Button>
          </div>
        </MobileUpdateUserWrap>
      </Popup>
      {selectUserVisible && (
        <SelectUser
          projectId={projectId}
          visible={selectUserVisible}
          filterAccountIds={currentWorkItems.map(data => data.workItemAccount.accountId)}
          type="user"
          userType={1}
          onClose={() => setSelectUserVisible(false)}
          onSave={users => {
            setNewAccounts(users);
          }}
        />
      )}
    </Fragment>
  );
}

export function TaskRevokeAction(props) {
  const { className, onClick } = props;
  return (
    <WrapCon className={cx('flexRow valignWrapper approveBtnWrapper', className, { hoverBtnWrap: !isMobile })}>
        <div className="btn taskRevoke" onClick={() => { onClick() }}>
          <Icon icon="rotate" className="Font17 mRight3" />
          {_l('撤回')}
        </div>
    </WrapCon>
  );
}

export default function WorkflowAction(props) {
  const { className, isBranch, hasMore, isCharge, projectId, data, currentWorkflow } = props;
  const { onAction, onRevoke, onUrge, onSkip, onUpdateWorkAccounts, onEndInstance, onViewExecDialog, onReset } = props;
  const { workId, status, allowRevoke, allowUrge, flowNode, workItem } = data;
  const { type, batch, btnMap = {}, callBackType } = flowNode || {};
  const allowBatch = type === 4 && batch;
  const allowApproval = allowBatch && workItem;
  const allOverrule = btnMap[5] && batch && workItem;
  const allowCallBack = callBackType !== -1 && !allOverrule && batch && workItem;
  const { backFlowNodes = [] } = currentWorkflow;
  const [updateUserDialogVisible, setUpdateUserDialogVisible] = useState(false);
  const urgeDisable = window[`urgeDisable-workId-${workId}`] || data.urgeDisable || false;
  const allowReset = status === 6;

  const handleSkip = () => {
    const description =
      type === 4 ? _l('当前节点未进行操作的成员将设为通过') : _l('当前节点未进行操作的成员将设为提交');
    if (isMobile) {
      MobileDialog.confirm({
        title: _l('确认跳过当前节点 ?'),
        content: description,
        onConfirm: () => onSkip(data)
      });
    } else {
      Dialog.confirm({
        title: _l('确认跳过当前节点 ?'),
        description,
        onOk: () => onSkip(data),
      });
    }
  };

  const handleEndInstance = () => {
    if (isMobile) {
      MobileDialog.confirm({
        title: _l('确认中止此条流程 ?'),
        confirmText: <span className="Red">{_l('确认')}</span>,
        onConfirm: () => onEndInstance(data)
      });
    } else {
      Dialog.confirm({
        title: _l('确认中止此条流程 ?'),
        onOk: () => onEndInstance(data),
      });
    }
  };

  const handleUrge = () => {
    if (!urgeDisable) {
      onUrge(data);
    }
  };

  const renderDropdownOverlay = ({ width }) => {
    return (
      <Menu style={{ width, borderRadius: 4 }}>
        <MenuItem
          key="urge"
          icon={<Icon icon="access_alarm" className="Font17 Gray_75 pRight5" />}
          className="pLeft15 pRight15"
          style={{ height: 36, opacity: urgeDisable ? 0.6 : 1 }}
          onClick={handleUrge}
        >
          {urgeDisable ? _l('已催') : _l('催办')}
        </MenuItem>
        <MenuItem
          key="skip"
          icon={<Icon icon="calendar-task" className="Font17 Gray_75 pRight5" />}
          className="pLeft15 pRight15"
          style={{ height: 36 }}
          onClick={handleSkip}
        >
          {_l('跳过当前节点')}
        </MenuItem>
        <MenuItem
          key="user"
          icon={<Icon icon="ic-adjust-department" className="Font17 Gray_75 pRight5" />}
          className="pLeft15 pRight15"
          style={{ height: 36 }}
          onClick={() => setUpdateUserDialogVisible(true)}
        >
          {_l('调整当前节点负责人')}
        </MenuItem>
        {!!backFlowNodes.length && (
          <MenuItem
            key="repeal"
            icon={<Icon icon="repeal-o" className="Font17 Gray_75 pRight5" />}
            className="pLeft15 pRight15"
            style={{ height: 36 }}
            onClick={() => onAction(data, 'return')}
          >
            {_l('退回')}
          </MenuItem>
        )}
        <MenuItem
          key="end"
          className="deleteItem"
          style={{ height: 36, color: '#F44336' }}
          icon={<Icon icon="close" className="Font17 pRight5" />}
          className="pLeft15 pRight15"
          onClick={handleEndInstance}
        >
          {_l('中止')}
        </MenuItem>
      </Menu>
    );
  };

  const handleMobileMoreAction = () => {
    let actionHandler = null;
    const BUTTONS = [
      { name: urgeDisable ? _l('已催') : _l('催办'), icon: 'access_alarm', fn: handleUrge },
      { name: _l('跳过当前节点'), icon: 'calendar-task', fn: handleSkip },
      { name: _l('调整当前节点负责人'), icon: 'ic-adjust-department', fn: () => setUpdateUserDialogVisible(true) },
      backFlowNodes.length ? { name: _l('退回'), icon: 'repeal-o', fn: () => onAction(data, 'return') } : null,
      { name: _l('中止'), icon: 'close', className: 'Red', fn: handleEndInstance },
    ].filter(_ => _);
    actionHandler = ActionSheet.show({
      actions: BUTTONS.map(item => {
        return {
          key: item.icon,
          text: (
            <div className={cx('flexRow valignWrapper w100', item.className)} onClick={item.fn}>
              <Icon className={cx('mRight10 Font18', item.className || 'Gray_75')} icon={item.icon} />
              <span className="Bold">{item.name}</span>
            </div>
          )
        }
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('操作')}</span>
          <div className="closeIcon" onClick={() => actionHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        actionHandler.close();
      }
    });
  };

  const renderUpdateUserDialog = () => {
    const DialogCon = isMobile ? MobileUpdateUserDialog : UpdateUserDialog;
    return (
      <DialogCon
        data={{
          ...data,
          currentWorkItems: (data.currentWorkItems || []).filter(c => c.operationType === 0),
        }}
        projectId={projectId}
        visible={updateUserDialogVisible}
        onCancel={() => setUpdateUserDialogVisible(false)}
        onOK={ids => {
          onUpdateWorkAccounts(data, ids);
        }}
      />
    );
  };

  if (!(allowApproval || workItem || allowRevoke || allowUrge || allowReset)) {
    if (isCharge) {
      const content = (
        <WrapCon
          onClick={isMobile ? handleMobileMoreAction : () => {}}
          className={cx('flexRow valignWrapper approveBtnWrapper', className, { hoverBtnWrap: !isMobile })}
        >
          <div className="btn handle">
            <span className="ellipsis">{_l('管理员操作')}</span>
          </div>
        </WrapCon>
      );
      return (
        <Fragment>
          {isMobile ? (
            content
          ) : (
            <Dropdown trigger={['click']} placement="top" overlay={renderDropdownOverlay({ width: '100%' })}>
              {content}
            </Dropdown>
          )}
          {renderUpdateUserDialog()}
        </Fragment>
      );
    } else {
      return null;
    }
  }

  return (
    <WrapCon className={cx('flexRow valignWrapper approveBtnWrapper', className, { hoverBtnWrap: !isMobile })}>
      <Fragment>
        {allowApproval && (
          <div className="btn pass" onClick={() => onAction(data, 'pass')}>
            <Icon icon="done" className="Font17 mRight3" />
            <span className="ellipsis">{btnMap[4] || _l('通过')}</span>
          </div>
        )}
        {allOverrule && (
          <div className="btn overrule" onClick={() => onAction(data, 'overrule')}>
            <Icon icon="clear" className="Font17 mRight3" />
            <span className="ellipsis">{btnMap[5] || _l('否决')}</span>
          </div>
        )}
      </Fragment>
      {allowCallBack && (
        <div className="btn return" onClick={() => onAction(data, 'return')}>
          <Icon icon="repeal-o" className="Font17 mRight3" />
          <span className="ellipsis">{btnMap[17] || _l('退回')}</span>
        </div>
      )}
      {workItem && (type === 3 || type === 0) && !allowReset && (
        <div className="btn handle" onClick={() => onViewExecDialog(data)}>
          <span className="ellipsis">{_l('前往填写')}</span>
        </div>
      )}
      {allowReset && (
        <div className="btn reset" onClick={() => onReset(data)}>
          <Icon icon="refresh1" className="Font17 mRight3"/>
          <span className="ellipsis">{_l('重新发起')}</span>
        </div>
      )}
      {workItem && type === 4 && (
        <div className="btn handle" onClick={() => onViewExecDialog(data)}>
          <span className="ellipsis">{_l('前往办理')}</span>
        </div>
      )}
      {((allowRevoke && allowApproval) || workItem ? false : allowRevoke) && !isBranch && (
        <div className="btn revoke" onClick={() => { onRevoke(data) }}>
          {_l('撤回')}
        </div>
      )}
      {((allowUrge && allowApproval) || workItem ? false : allowUrge) && (
        <div className={cx('btn urge', { urgeDisable })} onClick={handleUrge}>
          {urgeDisable ? _l('已催') : _l('催办')}
        </div>
      )}
      {hasMore &&
        isCharge &&
        !allowReset &&
        (isMobile ? (
          <div className="btn mobileMore" onClick={handleMobileMoreAction}>
            <Icon className="Font20 Gray_75" icon="arrow-up-border" />
          </div>
        ) : (
          <Dropdown trigger={['click']} placement="topRight" overlay={renderDropdownOverlay({ width: 200 })}>
            <Icon className="Font20 pointer Gray_75" icon="task-point-more" />
          </Dropdown>
        ))}
      {renderUpdateUserDialog()}
    </WrapCon>
  );
}
