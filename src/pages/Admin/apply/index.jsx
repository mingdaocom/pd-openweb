import React, { Fragment } from 'react';
import Config from '../config';
import { LoadDiv } from 'ming-ui';
import RoleList from '../roleAuth/roleList';
import roleController from 'src/api/projectSetting';
import withoutPermission from 'src/pages/worksheet/assets/withoutPermission.png';

import '../roleAuth/common/style.less';

export default class ApplyRole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      canApply: true,
      loading: true,
    };
  }
  componentDidMount() {
    this.applyRole();
  }
  applyRole = () => {
    roleController
      .getAllowApplyManageRole({
        projectId: Config.projectId,
      })
      .then(res => {
        if (!res) {
          this.setState({ canApply: false });
        }
        this.setState({ loading: false });
      });
  };

  render() {
    return (
      <div className="roleAuthContainer">
        {this.state.loading ? (
          <LoadDiv />
        ) : !this.state.canApply ? (
          <div className="noPermission">
            <img className="img" src={withoutPermission} />
            <div className="Gray_75 Font17 mTop30">{_l('无权限，请联系管理员')}</div>
          </div>
        ) : (
          <Fragment>
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
              <RoleList isApply projectId={Config.projectId} />
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
