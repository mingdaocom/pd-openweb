import React, { Fragment } from 'react';
import Config from '../config';
import { LoadDiv } from 'ming-ui';
import RoleList from '../organization/roleAuth/roleList';
import roleController from 'src/api/projectSetting';
import withoutPermission from 'src/pages/worksheet/assets/withoutPermission.png';
import styled from 'styled-components';

const Wrap = styled.div`
  border-radius: 4px;
  flex: 1;
  min-height: 0;
  background-color: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .roleAuthHeader {
    height: 56px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #eaeaea;
    box-sizing: border-box;
    .detailTitle {
      display: flex;
      align-items: center;
    }
    .menuTab {
      display: flex;
      height: 100%;
      li {
        height: 100%;
        display: flex;
        align-items: center;
        border-bottom: 2px solid transparent;
        margin-right: 4px;
        padding: 0 16px;
        &:hover {
          background-color: #f5f5f5;
        }
        a {
          font-weight: 600;
          color: #333 !important;
          font-size: 17px;
        }
        &.menuTab-active {
          border-bottom-color: #2196f3;
          a {
            color: #2196f3 !important;
          }
        }
      }
    }
  }
  .roleAuthContent {
    flex: 1;
    min-height: 0;
  }
  .noPermission {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img {
      width: 100px;
    }
  }
`;

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
          this.setState({ canApply: false, loading: false });
        }
        this.setState({ loading: false });
      })
      .catch(err => {
        this.setState({ loading: false, canApply: false });
      });
  };

  render() {
    return (
      <Wrap>
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
                <span className="Font17 Bold">{_l('申请角色权限')}</span>
              </div>
            </div>
            <div className="roleAuthContent pLeft24 pRight24">
              <RoleList entry="apply" projectId={Config.projectId} />
            </div>
          </Fragment>
        )}
      </Wrap>
    );
  }
}
