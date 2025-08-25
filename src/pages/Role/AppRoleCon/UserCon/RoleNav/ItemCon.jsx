import React from 'react';
import cx from 'classnames';
import { Dialog, Icon, Tooltip } from 'ming-ui';
import { ICON_ROLE_TYPE, sysRoleType } from 'src/pages/Role/config.js';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import { navigateTo } from 'src/router/navigateTo';

export default class ItemCon extends React.Component {
  render() {
    const {
      setRoleId,
      SetAppRolePagingModel,
      setSelectedIds,
      isOwner,
      appId,
      canEditApp,
      selectDebugRole = [],
    } = this.props;
    const { data, roleId } = this.props;

    let optList = [];
    //离开自己所在的角色
    if (data.isMyRole && !(isOwner && data.roleType === APP_ROLE_TYPE.ADMIN_ROLE) && !selectDebugRole.length) {
      //拥有者不能离开管理员角色
      optList = [
        ...optList,
        {
          value: 0,
          text: _l('离开'),
        },
      ];
    }
    //编辑自己有权限的自定义角色
    if (canEditApp) {
      if (!sysRoleType.includes(data.roleType)) {
        optList = [
          ...optList,
          {
            value: 1,
            text: _l('编辑角色'),
            showLine: data.isMyRole,
          },
          {
            value: 2,
            type: 'err',
            text: _l('删除'),
          },
        ];
      } else {
        optList = [
          ...optList,
          {
            value: 1,
            text: _l('查看角色'),
          },
        ];
      }
    }
    return (
      <li
        className={cx('flexRow alignItemsCenter navRoleLi', {
          cur: roleId === data.roleId,
          Relative: roleId !== data.roleId,
        })}
        onClick={() => {
          this.props.setQuickTag({ roleId: data.roleId, tab: 'user' });
          this.props.onChange({
            roleId: data.roleId,
          });
          navigateTo(`/app/${appId}/role`);
          setRoleId(data.roleId);
          SetAppRolePagingModel(null);
          setSelectedIds([]);
        }}
      >
        <span
          className="flex flexRow alignItemsCenter TxtMiddle Font14 overflow_ellipsis breakAll InlineBlock"
          title={data.name}
        >
          {roleId !== data.roleId && data.isMyRole && <span className="isMyRole mRight3 InlineBlock TxtMiddle" />}
          {ICON_ROLE_TYPE[data.roleType] && <Icon icon={ICON_ROLE_TYPE[data.roleType]} className="Font16 mRight6" />}
          {data.name}
        </span>

        {optList.length > 0 ? (
          <div className="optionNs Relative">
            <DropOption
              dataList={optList}
              showHeader={() => {
                if (!data.isMyRole || sysRoleType.includes(data.roleType)) {
                  return null;
                }
                return (
                  <div className="Gray_75 Font12" style={{ padding: '6px 16px' }}>
                    {_l('我所在的角色')}
                  </div>
                );
              }}
              onAction={it => {
                if (it.value === 0) {
                  Dialog.confirm({
                    title: <span className="Red">{_l('你确认离开此角色吗？')}</span>,
                    buttonType: 'danger',
                    description: _l('离开所有角色后你将不能访问此应用'),
                    onOk: () => {
                      this.props.exitRole(data.roleId);
                    },
                  });
                } else if (it.value === 1) {
                  this.props.setQuickTag({ roleId: data.roleId, tab: 'roleSet' });
                } else if (it.value === 2) {
                  this.props.delDialog(this.props.roleList.find(it => it.roleId === data.roleId));
                }
              }}
            />
            {data.totalCount > 0 && <span className="num">{data.totalCount}</span>}
          </div>
        ) : (
          data.totalCount > 0 && <span className="num">{data.totalCount}</span>
        )}
        {!!data.description && (
          <Tooltip text={<span>{data.description}</span>} popupPlacement="top" autoCloseDelay={0}>
            <i className="icon-info_outline Font16 Gray_9e mLeft7" />
          </Tooltip>
        )}
      </li>
    );
  }
}
