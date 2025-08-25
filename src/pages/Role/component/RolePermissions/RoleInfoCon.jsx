import React from 'react';
import styled from 'styled-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { sysRoleList, sysRoleType } from 'src/pages/Role/config.js';
import { WrapTableCon } from 'src/pages/Role/style';
import { WrapFooter } from 'src/pages/Role/style.jsx';
import RoleSet from '../RoleSet';

const WrapSys = styled.div`
   {
    padding: 25px 48px 30px;
    max-width: 1250px;
    .nameInput {
      width: 300px;
      line-height: 36px;
      background: #f8f8f8;
      border-radius: 3px 3px 3px 3px;
      padding: 0 13px;
      font-weight: 400;
    }
    .desC {
      line-height: 36px;
      background: #f8f8f8;
      border-radius: 3px 3px 3px 3px;
      padding: 0 13px;
      font-weight: 400;
    }
    .desRole {
      line-height: 25px;
      background: #fef9e4;
      border-radius: 3px 3px 3px 3px;
      padding: 6px 13px;
      font-weight: 400;
    }
    .toUser {
      color: #5a5a5a;
      &:hover {
        color: #1677ff;
      }
    }
  }
`;
export default class Con extends React.Component {
  render() {
    const {
      appId,
      editCallback,
      isForPortal,
      showRoleSet,
      projectId,
      setQuickTag,
      roleId,
      roleList,
      loading,
      canEditUser,
    } = this.props;
    const data = roleList.find(o => o.roleId === roleId) || {};
    const sysTr = sysRoleList.find(o => o.roleType === data.roleType) || {};
    return (
      <WrapTableCon className="flex overflowHidden flexColumn Relative">
        {sysRoleType.includes(data.roleType) && !isForPortal ? (
          <WrapSys className={'settingForm flex flexColumn'}>
            <div className="flex">
              <div className="roleTitle Bold Font17">{_l('系统角色')}</div>
              <div className="flexRow alignItemsCenter mTop30">
                <div className="Font14 bold flex">{_l('角色名称')}</div>
              </div>
              <div className="mTop8">
                <div className={'nameInput'}>{sysTr.name}</div>
              </div>
              <div className="Font14 mTop25 bold">{_l('描述')}</div>
              <div className="mTop8">
                <div className="w100 desC">{sysTr.des}</div>
              </div>
              <div className="Font14 mTop25 bold">{_l('权限')}</div>
              <div className="mTop8">
                <div className="desRole">{sysTr.info()}</div>
              </div>
            </div>
            {canEditUser && (
              <WrapFooter className={'footer flexRow alignItemsCenter'}>
                <div
                  className="toUser Hand Bold"
                  onClick={() => {
                    setQuickTag({ roleId: roleId || roleList[0].roleId, tab: 'user' });
                  }}
                >
                  {_l('管理用户')}
                </div>
              </WrapFooter>
            )}
          </WrapSys>
        ) : loading ? (
          <LoadDiv />
        ) : (
          <RoleSet
            {...this.props}
            setQuickTag={setQuickTag}
            projectId={projectId}
            roleId={roleId}
            appId={appId}
            isForPortal={isForPortal}
            onFormat={() => {
              this.props.onChange({
                roleList: roleList.filter(o => !!o.roleId),
              });
            }}
            editCallback={(id, isConfirm) => {
              let list = roleList.map(o => {
                if (!o.roleId) {
                  return {
                    ...o,
                    roleId: id,
                  };
                } else {
                  return o;
                }
              });
              editCallback();
              if (isConfirm) {
                this.props.onChange({
                  roleList: list,
                });
              } else {
                this.props.onChange({
                  roleList: list,
                  roleId: id,
                });
              }
            }}
            onDelRole={() => {
              let list = roleList.filter(o => !!o.roleId);
              this.props.onChange({
                roleList: list,
                roleId: (list[0] || {}).roleId,
              });
            }}
            showRoleSet={showRoleSet}
          />
        )}
      </WrapTableCon>
    );
  }
}
