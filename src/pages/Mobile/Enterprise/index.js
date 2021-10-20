import React, { Component } from 'react';
import cx from 'classnames';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { Icon } from 'ming-ui';
import Back from '../components/Back';
import account from 'src/api/account';
import common from 'src/pages/Personal/common';

class ProjectCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      userInfo: null,
    }
  }
  getUserCard() {
    const { item } = this.props;
    this.setState({ loading: true });
    account.getUserCard({
      projectId: item.projectId
    }).then(data => {
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
  }
  getItems(list, key) {
    const listInfo = list.map(item => item[key]);
    return listInfo.join(' ; ');
  }
  renderStatus({ userStatus, projectStatus, isProjectAdmin, isCreateUser }) {
    if (userStatus === common.USER_STATUS.UNAUDITED) {
      return _l('待审核');
    } else {
      if (projectStatus === common.PROJECT_STATUS_TYPES.FREE) {
        return null;
      }
      return isProjectAdmin ? (isCreateUser ? _l('管理员') + _l('(创建者)') : _l('管理员')) : _l('普通成员')
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
          <div className="Gray flex">{userInfo.departmentInfos.length > 0 ? this.getItems(userInfo.departmentInfos, 'departmentName') : _l('未填写')}</div>
        </div>
        <div className="flexRow Font13">
          <div className="Gray_75 mRight15">{_l('职位')}</div>
          <div className="Gray flex">{userInfo.jobInfos.length > 0 ? this.getItems(userInfo.jobInfos, 'jobName') : _l('未填写')}</div>
        </div>
      </div>
    );
  }
  render() {
    const { item, index } = this.props;
    const { visible, loading } = this.state;
    return (
      <div className={cx('projectWrapper WhiteBG pTop20 pBottom20 pLeft16 pRight16 mBottom20', { mTop20: !index })}>
        <div className="flexRow">
          <div className="flex">
            <div className="Font18">{item.companyName}</div>
            <div className="Font12 Gray_75 mTop15 mBottom20">{_l('组织ID %0', item.projectCode)} {_l('(可用于邀请其他人加入该网络)')}</div>
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
        {visible && (
          loading ? (
            <Flex className="mTop10" justify="center" align="center">
              <ActivityIndicator size="small" />
            </Flex>
          ) : (
            this.renderUserCard()
          )
        )}
      </div>
    );
  }
}

export default class Enterprise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      projectList: [],
    }
  }
  componentDidMount() {
    account.getProjectList({
      pageIndex: 1,
      pageSize: 500,
    }).then(result => {
      this.setState({
        projectList: result.list,
        loading: false,
      });
    });
  }
  render() {
    const { loading, projectList } = this.state;
    return (
      <div className="h100">
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          projectList.map((item, index) => (
            <ProjectCard key={item.projectId} item={item} index={index} />
          ))
        )}
        <Back
          className="low"
          onClick={() => {
            history.back();
          }}
        />
      </div>
    );
  }
}
