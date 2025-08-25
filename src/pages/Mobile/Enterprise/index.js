import React, { Component, Fragment } from 'react';
import { SpinLoading } from 'antd-mobile';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, Radio } from 'ming-ui';
import account from 'src/api/account';
import common from 'src/pages/Personal/common';
import { getCurrentProject } from 'src/utils/project';
import Back from '../components/Back';

const EmptyProject = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 32px 0 24px;
  margin: 10px 15px 20px;
  border-radius: 8px;
  font-weight: 600;
  .joinNetwork,
  .createNetwork {
    padding: 0 20px;
    height: 36px;
    line-height: 36px;
    box-sizing: border-box;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    color: #fff;
    font-size: 14px;
    font-weight: 400;
  }
  .createNetwork {
    border-width: 1px;
    border-style: solid;
    &:not(:hover) {
      background: #fff !important;
    }
    &:hover {
      color: #fff !important;
    }
  }
  .ThemeColor3 {
    color: #1677ff;
  }
  .ThemeBGColor3 {
    background-color: #1677ff;
  }
`;

const BottomSpace = styled.div`
  height: 30px;
`;

class ProjectCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      userInfo: null,
    };
  }
  getUserCard() {
    const { item } = this.props;
    this.setState({ loading: true });
    account
      .getUserCard({
        projectId: item.projectId,
      })
      .then(data => {
        if (data) {
          this.setState({ userInfo: data.user, loading: false });
        }
      });
  }
  handleChangeVisible = () => {
    const newVisible = !this.state.visible;
    this.setState({
      visible: newVisible,
    });
    if (newVisible && _.isEmpty(this.state.userInfo)) {
      this.getUserCard();
    }
  };
  getItems(list, key) {
    const listInfo = list.map(item => item[key]);
    return listInfo.join(' ; ');
  }
  renderStatus({ userStatus }) {
    if (userStatus === common.USER_STATUS.UNAUDITED) {
      return _l('待审核');
    } else {
      return null;
    }
  }
  renderUserCard() {
    const { userInfo } = this.state;
    return (
      <div className="mTop20 pTop20" style={{ borderTop: '1px solid #EAEAEA' }}>
        <div className="flexRow Font13 mBottom10">
          <div className="Gray_75 mRight15">{_l('姓名')}</div>
          <div className="Gray flex">{userInfo.fullname}</div>
        </div>
        <div className="flexRow Font13 mBottom10">
          <div className="Gray_75 mRight15">{_l('组织')}</div>
          <div className="Gray flex">{userInfo.companyName}</div>
        </div>
        <div className="flexRow Font13 mBottom10">
          <div className="Gray_75 mRight15">{_l('部门')}</div>
          <div className="Gray flex">
            {userInfo.departmentInfos.length > 0
              ? this.getItems(userInfo.departmentInfos, 'departmentName')
              : _l('未填写')}
          </div>
        </div>
        <div className="flexRow Font13">
          <div className="Gray_75 mRight15">{_l('职位')}</div>
          <div className="Gray flex">
            {userInfo.jobInfos.length > 0 ? this.getItems(userInfo.jobInfos, 'jobName') : _l('未填写')}
          </div>
        </div>
      </div>
    );
  }
  render() {
    const { item, checkedProjectId } = this.props;
    const { visible, loading } = this.state;
    return (
      <div className="projectWrapper WhiteBG pTop15 pBottom20 pLeft16 pRight16 mBottom10">
        <div className="flexRow">
          <div
            className="flex"
            onClick={() =>
              item.userStatus === common.USER_STATUS.UNAUDITED ? () => {} : this.props.checkCurrentProject(item)
            }
          >
            <div className="Font18">
              <Radio
                checked={checkedProjectId === item.projectId}
                disabled={item.userStatus === common.USER_STATUS.UNAUDITED}
              >
                {item.companyName}
              </Radio>
            </div>
            <div className="Font12 Gray_75 mTop15 mBottom16">
              {_l('组织门牌号 %0', item.projectCode)} {_l('(可用于邀请其他人加入该网络)')}
            </div>
            {item.userStatus !== common.USER_STATUS.UNAUDITED && (
              <div>
                <span className="Gray_9e">{common.PROJECT_STATUS_TYPES_LABLE[item.projectStatus]}</span>
                {item.projectStatus === common.PROJECT_STATUS_TYPES.PAID && (
                  <span className="mLeft10" style={{ color: '#47B14B' }}>
                    {_l('%0 到期', moment(item.currentLicense.endDate).format('YYYY-MM-DD'))}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flexRow valignWrapper Gray_75 mLeft10" onClick={this.handleChangeVisible}>
            <div>{this.renderStatus(item)}</div>
            <Icon className="Font20" icon={visible ? 'expand_more' : 'navigate_next'} />
          </div>
        </div>
        {visible &&
          (loading ? (
            <div className="flexRow justifyContentCenter alignItemsCenter mTop10">
              <SpinLoading color="primary" />
            </div>
          ) : (
            this.renderUserCard()
          ))}
      </div>
    );
  }
}

class Enterprise extends Component {
  constructor(props) {
    super(props);

    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };

    this.state = {
      loading: true,
      projectList: [],
      checkedProjectId: currentProject.projectId,
    };
  }
  componentDidMount() {
    this.getProjectList();
  }

  getProjectList = async () => {
    const result = await account.getProjectList({
      pageIndex: 1,
      pageSize: 500,
    });

    const { list = [] } = result;

    const projectList = list.map(item => {
      return {
        ...item,
        companyName: getCurrentProject(item.projectId).companyName || item.companyName,
      };
    });

    this.setState({ projectList, loading: false });
  };

  checkCurrentProject = item => {
    safeLocalStorageSetItem('currentProjectId', item.projectId);
    this.setState({ checkedProjectId: item.projectId });
  };
  renderNoProject = () => {
    let { checkedProjectId } = this.state;
    return (
      <Fragment>
        <EmptyProject>
          <div className="Gray Font17">{_l('您未拥有任何组织，申请加入组织')}</div>
          <div className="flexRow mTop28">
            <button
              type="button"
              className="joinNetwork ThemeBGColor3 ThemeHoverBGColor2 mRight20"
              onClick={() => window.open('/enterpriseRegister?type=add', '__blank')}
            >
              {_l('加入组织')}
            </button>
            {/*<button
              type="button"
              className="createNetwork ThemeBGColor3 ThemeBorderColor3 ThemeColor3"
              onClick={() => window.open('/enterpriseRegister?type=create', '__blank')}
            >
              {_l('创建组织')}
            </button>*/}
          </div>
        </EmptyProject>
        <div
          className="externalEntry WhiteBG pTop20 pBottom20 pLeft16 pRight16 mBottom20 Font18"
          onClick={() => this.checkCurrentProject({ projectId: 'external' })}
        >
          <Radio checked={checkedProjectId === 'external'}>{_l('外部协作')}</Radio>
        </div>
      </Fragment>
    );
  };
  render() {
    const { loading, projectList = [], checkedProjectId } = this.state;
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };

    return (
      <div className="h100" style={{ background: '#f5f5f5', paddingTop: 10, overflowY: 'auto' }}>
        {loading ? (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color="primary" />
          </div>
        ) : currentProject && !_.isEmpty(projectList) ? (
          <Fragment>
            {projectList.map((item, index) => (
              <ProjectCard
                key={item.projectId}
                item={item}
                index={index}
                checkedProjectId={checkedProjectId}
                checkCurrentProject={this.checkCurrentProject}
              />
            ))}
            <div
              className="externalEntry WhiteBG pTop20 pBottom20 pLeft16 pRight16 mBottom20 Font18"
              onClick={() => this.checkCurrentProject({ projectId: 'external' })}
            >
              <Radio checked={checkedProjectId === 'external'}>{_l('外部协作')}</Radio>
            </div>
            <BottomSpace />
          </Fragment>
        ) : (
          this.renderNoProject()
        )}
        {!loading && (
          <Back
            className="low"
            onClick={() => {
              history.back();
            }}
          />
        )}
      </div>
    );
  }
}

export default Enterprise;
