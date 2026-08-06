import React, { useState } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Dialog, Icon, MenuItem } from 'ming-ui';
import appManagement from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import { pageSizeForPortal } from 'src/pages/Role/PortalCon/tabCon/config';
import PortalBar from 'src/pages/Role/PortalCon/tabCon/portalComponent/PortalBar';
import { WrapPop } from './style';

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
    return Dialog.confirm({
      title: <span className="Red">{_l('注销%0个成员', selectedIds.length || 1)}</span>,
      buttonType: 'danger',
      okText: _l('注销'),
      description: _l('被注销的成员不能通过外部门户的链接登录到此应用内。'),
      onOk: () => deleteRows(selectedIds),
    });
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
          <div className="flex-shrink-0">
            <span
              className={cx('changeRole InlineBlock mLeft10', disabledActions.changeRole ? 'disabledAction' : 'Hand')}
              onClick={() => !disabledActions.changeRole && setChangeRoleDialog(true)}
            >
              {_l('更改角色')}
              {actionCounts.changeRole > 0 && `(${actionCounts.changeRole})`}
            </span>
            <span className={cx('download InlineBlock Hand mLeft10')} onClick={() => down()}>
              {_l('导出')}
            </span>
            {(window.platformENV.isOverseas || window.platformENV.isLocal) &&
              !!list.find(o => safeParse(o.portal_status, 'array')[0] === '5') && (
                <span
                  className={cx('download InlineBlock mLeft10', disabledActions.activate ? 'disabledAction' : 'Hand')}
                  onClick={() => !disabledActions.activate && updateActivationStatus(statusGroups.unActivated)}
                >
                  {_l('激活')}
                  {actionCounts.activate > 0 && `(${actionCounts.activate})`}
                </span>
              )}
            <span
              className={cx('download InlineBlock mLeft10', disabledActions.enable ? 'disabledAction' : 'Hand')}
              onClick={() => {
                if (disabledActions.enable) {
                  return;
                }

                Dialog.confirm({
                  title: <span className="">{_l('启用%0个用户', actionCounts.enable || 1)}</span>,
                  buttonType: '',
                  okText: _l('启用%15005'),
                  description: _l('启用只对“停用”状态的用户生效；用户被启用后可以通过外部门户链接登录此应用'),
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
            </span>
            <span
              className={cx('download InlineBlock mLeft10', disabledActions.reinvite ? 'disabledAction' : 'Hand')}
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
            </span>
            <span
              className={cx(
                'download InlineBlock mLeft10',
                disabledActions.cancelInviteAndRemove ? 'disabledAction' : 'Hand',
              )}
              onClick={() => {
                if (disabledActions.cancelInviteAndRemove) {
                  return;
                }

                Dialog.confirm({
                  title: <span className="Red">{_l('确认取消邀请该用户吗')}</span>,
                  buttonType: 'danger',
                  okText: _l('确定'),
                  onOk: () => cancelInvitationRows(statusGroups.unActivated),
                });
              }}
            >
              {_l('取消邀请并移除')}
              {actionCounts.cancelInviteAndRemove > 0 && `(${actionCounts.cancelInviteAndRemove})`}
            </span>
            <span
              className={cx('del InlineBlock mLeft10', disabledActions.stop ? 'disabledAction' : 'Hand')}
              onClick={() => {
                if (disabledActions.stop) {
                  return;
                }

                Dialog.confirm({
                  title: <span className="Red">{_l('停用%0个用户', actionCounts.stop || 1)}</span>,
                  buttonType: 'danger',
                  okText: _l('停用'),
                  description: _l('停用只对“正常”状态的用户生效；用户被停用后将不能通过外部门户链接登录此应用'),
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
            </span>
            <span className={cx('del InlineBlock Hand mLeft10')} onClick={deleteRowsDialog}>
              {_l('注销')}
            </span>
          </div>
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
                      <div
                        className="toRole Hand mRight14 TxtTop Bold"
                        onClick={() => setQuickTag({ roleId: roleId, tab: 'roleSet' })}
                      >
                        {_l('编辑角色')}
                      </div>
                    )}
                    <div className="addUser InlineBlock Hand Bold">
                      <span className="lAdd" onClick={() => setAddUserByTelDialog(true)}>
                        {_l('邀请用户')}
                      </span>
                      |
                      <Trigger
                        popupVisible={popupVisible}
                        action={['click']}
                        onPopupVisibleChange={popupVisible => setPopupVisible(popupVisible)}
                        popup={
                          <WrapPop className="Hand InlineBlock mTop6 uploadUser">
                            <MenuItem
                              onClick={() => {
                                setAddUserDialog(true);
                                setPopupVisible(false);
                              }}
                            >
                              <Icon className="Font18 TxtMiddle mRight6" type="new_excel" />
                              <span className=""> {_l('从Excel导入数据')}</span>
                            </MenuItem>
                          </WrapPop>
                        }
                        popupAlign={{ points: ['tr', 'br'], offset: [8, 0] }}
                      >
                        <span className="rAdd hand" onClick={() => setPopupVisible(!popupVisible)}>
                          <Icon className="TxtMiddle mLeft6 " type="arrow-down" />
                        </span>
                      </Trigger>
                    </div>
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
