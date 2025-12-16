import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
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

  const { list, pageIndex, keyWords, baseInfo = {}, fastFilters = [], filters } = portal;

  const [popupVisible, setPopupVisible] = useState(false);
  //批量删除用户
  const deleteRows = () => {
    externalPortalAjax.removeUsers({ appId, rowIds: selectedIds }).then(() => {
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
      onOk: () => deleteRows(),
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
        </div>
        {selectedIds.length > 0 && (
          <div className="flex-shrink-0">
            <span className="changeRole InlineBlock Hand" onClick={() => setChangeRoleDialog(true)}>
              {_l('更改角色')}
            </span>
            <span className={cx('download InlineBlock Hand mLeft10')} onClick={() => down()}>
              {_l('导出')}
            </span>
            {md.global.Config.IsLocal && !!list.find(o => safeParse(o.portal_status, 'array')[0] === '5') && (
              <span
                className={cx('download InlineBlock Hand mLeft10')}
                onClick={() => updateActivationStatus(selectedIds)}
              >
                {_l('激活')}
              </span>
            )}
            <span
              className={cx('download InlineBlock Hand mLeft10')}
              onClick={() => {
                let NoList = list.filter(o => safeParse(o.portal_status, 'array')[0] === '5').map(o => o.rowid);
                if (_.intersection(NoList, selectedIds).length > 0) {
                  return alert(_l('未激活的用户不能启用'), 2);
                }
                Dialog.confirm({
                  title: <span className="">{_l('启用%0个用户', selectedIds.length || 1)}</span>,
                  buttonType: '',
                  okText: _l('启用%15005'),
                  description: _l('启用只对“停用”状态的用户生效；用户被启用后可以通过外部门户链接登录此应用'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 1,
                      rowIds: selectedIds,
                      cb: () => {
                        setSelectedIds([]); //清除选择
                      },
                    });
                  },
                });
              }}
            >
              {_l('启用%15005')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft10')}
              onClick={() => {
                let NoList = list.filter(o => safeParse(o.portal_status, 'array')[0] === '5').map(o => o.rowid);
                if (_.intersection(NoList, selectedIds).length > 0) {
                  return alert(_l('未激活的用户不能停用'), 2);
                }
                Dialog.confirm({
                  title: <span className="Red">{_l('停用%0个用户', selectedIds.length || 1)}</span>,
                  buttonType: 'danger',
                  okText: _l('停用'),
                  description: _l('停用只对“正常”状态的用户生效；用户被停用后将不能通过外部门户链接登录此应用'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 4,
                      rowIds: selectedIds,
                      cb: () => {
                        setSelectedIds([]); //清除选择
                      },
                    });
                  },
                });
              }}
            >
              {_l('停用')}
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
