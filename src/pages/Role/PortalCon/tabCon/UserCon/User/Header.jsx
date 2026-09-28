import React, { useState } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Button, Dropdown, Modal, Space } from 'ming-ui/antd-components';
import appManagement from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import { pageSizeForPortal } from 'src/pages/Role/PortalCon/tabCon/config';
import PortalBar from 'src/pages/Role/PortalCon/tabCon/portalComponent/PortalBar';

const ACTION_BUTTON_STYLE = { height: 32 };

export default function (props) {
  const {
    showControls = [],
    portal = {},
    getCount,
    getList,
    setSelectedIds,
    selectedIds,
    setChangeRoleDialog,
    updateActivationStatus,
    updateListByStatus,
    setAddUserByTelDialog,
    setAddUserDialog,
    roleId,
    canEditApp,
    getUserList,
    appId,
    setQuickTag,
  } = props;

  const { list, pageIndex, keyWords, baseInfo = {}, fastFilters = [], filters, count } = portal;

  const [popupVisible, setPopupVisible] = useState(false);

  const selectedList = list.filter(item => selectedIds.includes(item.rowid));
  const statusGroups = selectedList.reduce(
    (acc, item) => {
      const status = safeParse(item.portal_status, 'array')[0];

      if (status === '5') {
        acc.unActivated.push(item.rowid);
      } else if (status === '4') {
        acc.disabled.push(item.rowid);
      } else if (status === '1') {
        acc.enabled.push(item.rowid);
      } else {
        acc.other.push(item.rowid);
      }

      return acc;
    },
    { unActivated: [], disabled: [], enabled: [], other: [] },
  );

  const actionCounts = {
    changeRole: selectedList.length - statusGroups.unActivated.length,
    activate: statusGroups.unActivated.length,
    enable: statusGroups.disabled.length,
    stop: statusGroups.enabled.length,
    reinvite: statusGroups.unActivated.length,
    cancelInviteAndRemove: statusGroups.unActivated.length,
  };
  const disabledActions = {
    changeRole: actionCounts.changeRole <= 0,
    activate: actionCounts.activate <= 0,
    enable: actionCounts.enable <= 0,
    stop: actionCounts.stop <= 0,
    reinvite: actionCounts.reinvite <= 0,
    cancelInviteAndRemove: actionCounts.cancelInviteAndRemove <= 0,
  };

  //批量删除用户
  const deleteRows = rowIds => {
    externalPortalAjax.removeUsers({ appId, rowIds }).then(() => {
      setSelectedIds([]); //清除选择
      getCount(appId); //重新获取总计数
      getList(); //重新获取当前页面数据
    });
  };

  //批量取消邀请并移除
  const cancelInvitationRows = rowIds => {
    externalPortalAjax.cancelInvitation({ appId, rowIds }).then(() => {
      setSelectedIds([]); //清除选择
      getCount(appId); //重新获取总计数
      getList(); //重新获取当前页面数据
    });
  };

  const deleteRowsDialog = () => {
    return Modal.confirm({
      title: <span className="Red textError">{_l('注销%0个成员', selectedIds.length || 1)}</span>,
      okButtonProps: {
        danger: true,
      },
      okText: _l('注销'),
      content: _l('被注销的成员不能通过外部门户的链接登录到此应用内。'),
      onOk: () => deleteRows(selectedIds),
    }).destroy;
  };

  //导出
  const down = isAll => {
    const { worksheetId, appId, projectId } = baseInfo;
    appManagement.getToken({ worksheetId, viewId: '' }).then(token => {
      const args = {
        token,
        accountId: md.global.Account.accountId,
        worksheetId,
        appId,
        projectId,
        exportControlsId: showControls.map(o => o.controlId).filter(o => !!o),
        filterControls: filters,
        keywords: keyWords,
        rowIds: isAll ? [] : selectedIds,
        fastFilters,
        pageIndex,
        pageSize: pageSizeForPortal,
        excludeRowIds: [],
      };
      window
        .mdyAPI('', '', args, {
          ajaxOptions: {
            url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/ExprotExPortal`,
          },
          customParseResponse: true,
        })
        .then(() => {
          setSelectedIds([]); //清除选择
        });
    });
  };

  return (
    <>
      <div className="topAct justifyContentLeft">
        <div className={cx('title flexRow alignItemsCenter flex')}>
          <span className={cx('Font17 Bold pLeft20 mLeft20 WordBreak overflow_ellipsis mRight20')} title={props.title}>
            {props.title}
          </span>
          {count > 0 && (
            <span className="textTertiary TxtMiddle mRight8 overflow_ellipsis breakAll flex-shrink-0">
              {_l('%0名人员', count)}
            </span>
          )}
        </div>
        {selectedIds.length > 0 && (
          <Space className="flex-shrink-0" size={10}>
            <Button
              color="primary"
              variant="filled"
              style={ACTION_BUTTON_STYLE}
              disabled={disabledActions.changeRole}
              onClick={() => !disabledActions.changeRole && setChangeRoleDialog(true)}
            >
              {_l('更改角色')}
              {actionCounts.changeRole > 0 && `(${actionCounts.changeRole})`}
            </Button>
            <Button color="primary" variant="filled" style={ACTION_BUTTON_STYLE} onClick={() => down()}>
              {_l('导出')}
            </Button>
            {(window.platformENV.isOverseas || window.platformENV.isLocal) &&
              !!list.find(o => safeParse(o.portal_status, 'array')[0] === '5') && (
                <Button
                  color="primary"
                  variant="filled"
                  style={ACTION_BUTTON_STYLE}
                  disabled={disabledActions.activate}
                  onClick={() => !disabledActions.activate && updateActivationStatus(statusGroups.unActivated)}
                >
                  {_l('激活')}
                  {actionCounts.activate > 0 && `(${actionCounts.activate})`}
                </Button>
              )}
            <Button
              color="primary"
              variant="filled"
              style={ACTION_BUTTON_STYLE}
              disabled={disabledActions.enable}
              onClick={() => {
                if (disabledActions.enable) {
                  return;
                }

                Modal.confirm({
                  title: _l('启用%0个用户', actionCounts.enable || 1),
                  okText: _l('启用%15005'),
                  content: _l('启用只对“停用”状态的用户生效；用户被启用后可以通过外部门户链接登录此应用'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 1,
                      rowIds: statusGroups.disabled,
                      cb: () => {
                        setSelectedIds([]); //清除选择
                      },
                    });
                  },
                });
              }}
            >
              {_l('启用%15005')}
              {actionCounts.enable > 0 && `(${actionCounts.enable})`}
            </Button>
            <Button
              color="primary"
              variant="filled"
              style={ACTION_BUTTON_STYLE}
              disabled={disabledActions.reinvite}
              onClick={() => {
                if (disabledActions.reinvite) {
                  return;
                }

                externalPortalAjax.reinviteExAccount({ appId, rowIds: statusGroups.unActivated }).then(res => {
                  res ? alert(_l('重新邀请成功')) : alert(_l('重新邀请失败，请稍后再试'), 2);
                });
              }}
            >
              {_l('重新邀请')}
              {actionCounts.reinvite > 0 && `(${actionCounts.reinvite})`}
            </Button>
            <Button
              color="primary"
              variant="filled"
              style={ACTION_BUTTON_STYLE}
              disabled={disabledActions.cancelInviteAndRemove}
              onClick={() => {
                if (disabledActions.cancelInviteAndRemove) {
                  return;
                }

                Modal.confirm({
                  title: <span className="textError">{_l('确认取消邀请该用户吗')}</span>,
                  okButtonProps: {
                    danger: true,
                  },
                  okText: _l('确定'),
                  onOk: () => cancelInvitationRows(statusGroups.unActivated),
                });
              }}
            >
              {_l('取消邀请并移除')}
              {actionCounts.cancelInviteAndRemove > 0 && `(${actionCounts.cancelInviteAndRemove})`}
            </Button>
            <Button
              color="danger"
              variant="filled"
              style={ACTION_BUTTON_STYLE}
              disabled={disabledActions.stop}
              onClick={() => {
                if (disabledActions.stop) {
                  return;
                }

                Modal.confirm({
                  title: <span className="textError">{_l('停用%0个用户', actionCounts.stop || 1)}</span>,
                  okButtonProps: {
                    danger: true,
                  },
                  okText: _l('停用'),
                  content: _l('停用只对“正常”状态的用户生效；用户被停用后将不能通过外部门户链接登录此应用'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 4,
                      rowIds: statusGroups.enabled,
                      cb: () => {
                        setSelectedIds([]); //清除选择
                      },
                    });
                  },
                });
              }}
            >
              {_l('停用')}
              {actionCounts.stop > 0 && `(${actionCounts.stop})`}
            </Button>
            <Button color="danger" variant="filled" style={ACTION_BUTTON_STYLE} onClick={deleteRowsDialog}>
              {_l('注销')}
            </Button>
          </Space>
        )}
        {selectedIds.length <= 0 && (
          <div className="InlineFlex flex-shrink-0">
            <PortalBar
              keys={['search', 'refresh', 'columns', 'filter', 'down']}
              down={down}
              appId={appId}
              comp={() => {
                return (
                  <React.Fragment>
                    {roleId !== 'all' && canEditApp && (
                      <Button
                        style={{ height: 32 }}
                        className="mRight14"
                        onClick={() => setQuickTag({ roleId: roleId, tab: 'roleSet' })}
                      >
                        {_l('编辑角色')}
                      </Button>
                    )}
                    <Space.Compact>
                      <Button
                        type="primary"
                        style={{ height: 32 }}
                        className="Bold"
                        onClick={() => setAddUserByTelDialog(true)}
                      >
                        {_l('邀请用户')}
                      </Button>
                      <Dropdown
                        open={popupVisible}
                        trigger={['click']}
                        placement="bottomRight"
                        onOpenChange={setPopupVisible}
                        menu={{
                          items: [
                            {
                              key: 'import',
                              icon: <Icon className="Font18" type="new_excel" />,
                              label: _l('从Excel导入数据'),
                              onClick: () => {
                                setAddUserDialog(true);
                                setPopupVisible(false);
                              },
                            },
                          ],
                        }}
                      >
                        <Button
                          type="primary"
                          style={{ height: 32 }}
                          icon={<Icon type="arrow-down" />}
                          aria-label={_l('更多邀请方式')}
                        />
                      </Dropdown>
                    </Space.Compact>
                  </React.Fragment>
                );
              }}
              refresh={() => getUserList()}
            />
          </div>
        )}
      </div>
    </>
  );
}
