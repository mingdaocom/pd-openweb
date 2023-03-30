import React from 'react';
import withClickAway from 'ming-ui/decorators/withClickAway';

@withClickAway
class MoreActionDia extends React.Component {
  render() {
    if (!this.props.showMoreAction) {
      return '';
    }
    return (
      <ul className="moreActionDia">
        <li onClick={() => this.props.addUser()}>{_l('添加成员')}</li>
        <li onClick={() => this.props.addDept()}>{_l('添加部门')}</li>
        <li onClick={() => this.props.addOrgRoles()}>{_l('组织角色')}</li>
      </ul>
    );
  }
}

export default MoreActionDia;
