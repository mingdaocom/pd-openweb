import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';

class PermissionList extends React.Component {
  renderSubPermissions(permissions) {
    const len = permissions.length;
    const renderSinglePermission = ({ isChild, noBorder, permissionName, description, permissionId, isTypeAdmin }) => {
      if (isTypeAdmin) return null;
      return (
        <tr
          className={classNames({
            childPermission: isChild,
            permission: !isChild,
            noBorder,
          })}
          key={permissionId}
        >
          <td className="pLeft25 Font13">{_l(permissionName)}</td>
          <td className="Gray_9e" colSpan="2">
            {_l(description)}
          </td>
        </tr>
      );
    };
    return _.map(permissions, (permission, index) => {
      return renderSinglePermission({
        ...permission,
        isChild: index > 0,
        noBorder: len > 1 && index !== len - 1,
      });
    });
  }

  renderPermissions() {
    const { permissionTypes } = this.props;
    return (
      <React.Fragment>
        {_.map(permissionTypes, (permissionType, index) => {
          const subPermissions = _.groupBy(permissionType.subPermissions, ({ permissionId }) => String(permissionId).slice(0, 3));
          return (
            <React.Fragment key={permissionType.typeId}>
              <tr>
                <td className="pLeft25">
                  <span className="Font18">{_l(permissionType.typeName)}</span>
                </td>
                <td>
                  <span className="Gray_9e Font13">{_l(permissionType.typeDescription)}</span>
                </td>
                {permissionType.isAdmin ? (
                  <td className="TxtRight Gray_9e Font13">
                    <span>{_l('拥有%0所有权限', _l(permissionType.typeName))}</span>
                  </td>
                ) : null}
              </tr>
              {_.map(_.keys(subPermissions), id => {
                return this.renderSubPermissions(subPermissions[id]);
              })}
              <tr>
                <td className="placeholder" colSpan="3" />
              </tr>
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }

  render() {
    const { permissionTypes } = this.props;
    return (
      <div className="permissionTable">
        <table className="w100">
          <thead>
            <tr>
              <th className="permissionTitle pLeft25">{_l('权限')}</th>
              <th className="permissionDescription">{_l('描述')}</th>
              <th className="permissionPlaceholder" />
            </tr>
          </thead>
          <tbody>
            {permissionTypes.length ? (
              this.renderPermissions()
            ) : (
              <tr>
                <td colSpan="3" className="listEmpty">
                  <div className="mTop20">{_l('暂无权限详情')}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default PermissionList;
