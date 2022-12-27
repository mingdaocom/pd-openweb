import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Checkbox from 'ming-ui/components/Checkbox';
import Switch from 'ming-ui/components/Switch';
import _ from 'lodash';

class PermissionList extends React.Component {
  static propTypes = {
    permissions: PropTypes.shape({
      permissionTypes: PropTypes.arrayOf(PropTypes.object),
    }),
    updateSelectedAuth: PropTypes.func,
  };

  static defaultProps = {
    updateSelectedAuth: () => {},
    selectedPermissions: {},
  };

  renderSubPermissions(permissions) {
    const len = permissions.length;
    const { selectedPermissions, updateSelectedAuth } = this.props;
    const renderSinglePermission = payload => {
      const { isChild, noBorder, ...permission } = payload;
      const { permissionName, description, permissionId, typeId } = permission;
      const isDisabled = !!selectedPermissions[typeId * 100];
      const isChecked = !!selectedPermissions[permissionId];
      const clickHandler = checked => {
        if (checked === false) {
          const { parentId } = permission;
          const parentPermission = _.find(permissions, p => p.permissionId === parentId) || {};
          // 子权限管理处理，子权限依赖母权限，eg. 审批表单删除权限勾选后，默认勾上统计权限
          if (parentPermission.isTypeAdmin === false) {
            updateSelectedAuth(true, parentPermission);
          }
        } else {
          const _child = _.find(selectedPermissions, p => p.parentId === permissionId);
          if (_child) {
            alert(_l('存在子权限依赖该权限'), 3);
            return false;
          }
        }
        updateSelectedAuth(!checked, permission);
      };
      return (
        <tr
          className={classNames({
            childPermission: isChild,
            permission: !isChild,
            noBorder,
          })}
          key={permissionId}
        >
          <td
            className={classNames('Font13 pLeft25', {
              pLeft45: isChild,
            })}
          >
            {_l(permissionName)}
          </td>
          <td className="Gray_9e">{_l(description)}</td>
          <td>
            <Checkbox className="InlineBlock TxtMiddle" checked={isChecked} disabled={isDisabled} onClick={clickHandler} />
          </td>
        </tr>
      );
    };
    return _.map(permissions, (permission, index) => {
      if (permission.isTypeAdmin) return null;
      return renderSinglePermission({
        ...permission,
        isChild: index > 0,
        noBorder: len > 1 && index !== len - 1,
      });
    });
  }

  renderPermissions() {
    const {
      permissions: { permissionTypes },
      selectedPermissions,
      updateSelectedAuth,
    } = this.props;
    return (
      <React.Fragment>
        {_.map(permissionTypes, (permissionType, index) => {
          // 不处理`角色管理`的权限
          if (permissionType.typeId === 1) return null;

          const subPermissions = _.groupBy(permissionType.subPermissions, ({ permissionId }) => String(permissionId).slice(0, 3));
          const adminPermission = _.find(permissionType.subPermissions, ({ isTypeAdmin }) => isTypeAdmin);
          return (
            <React.Fragment key={permissionType.typeId}>
              <tr>
                <td className="pLeft25">
                  <span className="Font15">{_l(permissionType.typeName)}</span>
                </td>
                <td {...(adminPermission ? {} : { colSpan: 2 })}>
                  <span className="Gray_9e Font13">
                    {permissionType.typeId === 9
                      ? _l('人事管理需要用到账户管理员的部分权限，将默认勾选账户管理员权限')
                      : _l(permissionType.typeDescription)}
                  </span>
                </td>

                {adminPermission ? (
                  <td className="TxtRight Gray_9e Font13">
                    <span data-tip={_l('拥有%0的所有权限', _l(permissionType.typeName))} className="tip-top TxtMiddle Gray_9e mRight5">
                      <span className="icon-task-setting_promet Font16" />
                    </span>
                    <span className="Gray_9e Font13 TxtMiddle">{_l('授权为%0管理员', _l(permissionType.typeName))}</span>
                    <Switch
                      className="mLeft20 TxtMiddle"
                      checked={!!selectedPermissions[adminPermission.permissionId]}
                      onClick={checked => {
                        updateSelectedAuth(!checked, adminPermission);

                        if (adminPermission.permissionId === 900 && !checked) {
                          updateSelectedAuth(true, _.find(permissionTypes, item => item.typeId === 2).subPermissions[0]);
                        }
                      }}
                    />
                  </td>
                ) : null}
              </tr>
              {_.map(_.keys(subPermissions), id => {
                return this.renderSubPermissions(subPermissions[id]);
              })}
              {index !== permissionTypes.length - 1 ? (
                <tr>
                  <td className="placeholder" colSpan="3" />
                </tr>
              ) : null}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    const { permissionTypes } = this.props.permissions;
    const { updateSelectedAuth, grantPermission, selectedPermissions } = this.props;
    return (
      <React.Fragment>
        <div className="clearfix mBottom15 mTop25">
          <span className="Font15">{_l('分配权限')}</span>
          <div className="Right Gray_9">
            <span data-tip={_l('开启后该角色成员能在企业账户角色权限配置菜单添加他人拥有相同权限')} className="tip-top TxtMiddle Gray_9e mRight5">
              <span className="icon-task-setting_promet Font16" />
            </span>
            <span className="TxtMiddle">{_l('允许角色成员授予他人拥有相同权限')}</span>
            <Switch
              checked={!!selectedPermissions[grantPermission.permissionId]}
              className="InlineBlock TxtMiddle mLeft20"
              onClick={checked => {
                updateSelectedAuth(!checked, grantPermission);
              }}
            />
          </div>
        </div>
        <table className="permissionList">
          <thead className="Gray_9e">
            <tr>
              <th>{_l('权限')}</th>
              <th>{_l('描述')}</th>
              <th className="pRight12">{_l('是否开启权限')}</th>
            </tr>
          </thead>
          <tbody>{permissionTypes && permissionTypes.length ? this.renderPermissions() : null}</tbody>
        </table>
        {permissionTypes && permissionTypes.length === 0 ? <div className="mTop20 mBottom20">{_l('暂无权限详情')}</div> : null}
      </React.Fragment>
    );
  }
}

export default PermissionList;
