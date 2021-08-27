import React from 'react';
import Config from '../config';

import RoleList from '../roleAuth/roleList';

import '../roleAuth/common/style.less';

export default class ApplyRole extends React.Component {
  render() {
    return (
      <div className="roleAuthContainer">
        <div className="roleAuthHeader">
          <div className="detailTitle">
            {/* <Icon
              icon="backspace"
              className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
              onClick={() => navigateTo('/admin/rolelist/' + projectId)}></Icon> */}
            <span className="Font17 Bold">{_l('申请角色权限')}</span>
          </div>
        </div>
        <div className="roleAuthContent">
          <RoleList isApply projectId={Config.projectId}/>
        </div>
      </div>
    );
  }
}
