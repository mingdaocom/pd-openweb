import React from 'react';
import cx from 'classnames';
import Dropdown from 'ming-ui/components/Dropdown';
import { Tooltip, Icon, LoadDiv, ScrollView, Dialog } from 'ming-ui';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import AddFriend from './AddFriend';
import API, { removeFriend } from '../api';
import { config } from '../config';
import departmentController from 'src/api/department';
import AddFriendConfirm from 'src/components/addFriendConfirm/addFriendConfirm';
import _ from 'lodash';
import moment from 'moment';

const defaultState = {
  data: null,
  isLoading: false,
  isShowMenu: false,
  isShowDetail: false,
  hasProjects: false,
  activeProjectId: '',
  dropDownValue: '',
  fullDepartmentInfo: {},
};

export default class UserDetail extends React.Component {
  constructor(props) {
    super();

    this.state = defaultState;

    this.addFriendConfirm = this.addFriendConfirm.bind(this);
    this.deleteFriendConfirm = this.deleteFriendConfirm.bind(this);
  }

  componentDidMount() {
    const { accountId } = this.props;
    if (accountId) {
      this.fetchUserDetail(accountId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.accountId && nextProps.accountId !== this.props.accountId) {
      this.fetchUserDetail(nextProps.accountId);
    } else if (nextProps.accountId === null) {
      this.setState(defaultState);
    }
  }

  fetchUserDetail(accountId) {
    this.setState({
      isLoading: true,
    });
    API.fetchUserDetail(accountId).then(
      data => {
        if (data) {
          data.userCards = (_.get(data, 'userCards') || []).filter(item => item.companyName);
          const { userCards } = data;
          const hasProjects = userCards.length;
          this.setState({
            ...defaultState,
            // assign default state
            data,
            hasProjects,
            activeProjectId: hasProjects ? userCards[0].projectId : '',
          });
        } else {
          this.setState({
            ...defaultState,
            // assign default state
            data,
          });
        }
      },
      () => {
        this.setState({
          ...defaultState,
          // assign default state
          data: undefined,
        });
      },
    );
  }

  addFriendConfirm() {
    const { accountId } = this.props;
   AddFriendConfirm({
      accountId,
    });
  }

  deleteFriendConfirm() {
    const { accountId } = this.props;
    Dialog.confirm({
      title: _l('确认删除当前好友？'),
      description: _l('删除后您将不显示在对方的好友列表里'),
      onOk: () => {
        removeFriend(accountId).done(() => {
          alert(_l('删除成功'), 1);
          this.setState({
            data: {
              ...this.state.data,
              isFriend: false,
            },
          });
        });
      },
    });
  }

  renderFriendTag() {
    const { isFriend, accountId } = this.state.data;
    if (accountId === md.global.Account.accountId) return null;
    if (!isFriend) {
      return (
        <span className="Right Gray_75 Hand ThemeHoverColor3" onClick={this.addFriendConfirm}>
          <i className="Font14 icon-custom_add_circle TxtMiddle" />
          <span className="mLeft5 TxtMiddle Font12">{_l('添加好友')}</span>
        </span>
      );
    } else {
      return (
        <span
          className="Right Gray_75 Hand Relative ThemeHoverColor3"
          onClick={() => {
            this.setState({
              isShowMenu: true,
            });
          }}
        >
          <i className="Font14 icon-check_circle TxtMiddle" />
          <span className="mLeft5 TxtMiddle Font12">{_l('我的好友')}</span>
          <i className="Font14 mLeft5 icon-moreop TxtMiddle" />
          {this.state.isShowMenu ? (
            <Menu
              onClickAway={() => {
                this.setState({
                  isShowMenu: false,
                });
              }}
              con={'.contacts-detail-wrapper'}
            >
              <MenuItem icon={<Icon icon="hr_delete" className="TxtMiddle" />} onClick={this.deleteFriendConfirm}>
                <span className="TxtMiddle">{_l('删除好友')}</span>
              </MenuItem>
            </Menu>
          ) : null}
        </span>
      );
    }
  }

  renderHeader() {
    const {
      data: { avatar, fullname, companyName, profession, accountId, isContact },
    } = this.state;
    return (
      <React.Fragment>
        <div className="detail-header">
          <img src={avatar} className="detail-header-avatar" />
          <div className="detail-header-info">
            <div className="Font18 clearfix">
              <div className="ellipsis Left" style={{ maxWidth: '200px' }}>
                {fullname}
              </div>
              {this.renderFriendTag()}
            </div>
            <div className="overflowHidden user-info">
              <div className="Font12 Gray_75 ellipsis">{companyName}</div>
              <div className="Font12 Gray_75 ellipsis">{profession}</div>
            </div>
          </div>
        </div>
        <div className="detail-btns mTop24">
          <a
            href="javascript:void 0;"
            className="detail-btn ThemeBGColor3 ThemeHoverBGColor2 NoUnderline"
            onClick={() => {
              if (isContact) {
                config.callback({ accountId });
              } else {
                this.addFriendConfirm();
              }
            }}
          >
            <Icon icon="chat" className="mRight5 Font18" />
            {_l('发消息')}
          </a>
          <a href={'/user_' + accountId} className="detail-btn Gray_75 mLeft10 NoUnderline" target="_blank">
            <Icon icon="dynamic-empty" className="mRight10 Font17" />
            {_l('TA的动态')}
          </a>
        </div>
      </React.Fragment>
    );
  }

  renderDetailCard() {
    const {
      data: { birthdate, gender, imqq, snsLinkedin, snsQQ, snsSina, weiXin },
      isShowDetail,
    } = this.state;
    const placeHolder = <span className="Gray_bd">{_l('未填写')}</span>;
    if (!isShowDetail) return null;
    return (
      <div className="Font13 detail-card border-top border-bottom">
        <div className="detail-info-row half">
          <span className="Gray_75">{_l('生日')}：</span>
          {moment(birthdate).format('YYYY-MM-DD') || placeHolder}
        </div>
        <div className="detail-info-row half">
          <span className="Gray_75">{_l('性别')}：</span>
          {gender === 1 ? _l('男') : _l('女')}
        </div>
        <div className="detail-info-row half">
          <span className="Gray_75">QQ：</span>
          {imqq || placeHolder}
        </div>
        <div className="detail-info-row half">
          <span className="Gray_75">{_l('微信')}：</span>
          {weiXin || placeHolder}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">LinkeIn：</span>
          {snsLinkedin || placeHolder}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('新浪微博')}：</span>
          {snsSina || placeHolder}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('腾讯微博')}：</span>
          {snsQQ || placeHolder}
        </div>
      </div>
    );
  }

  renderProjectCards() {
    const { hasProjects } = this.state;
    if (!hasProjects) return null;
    const {
      data: { userCards },
    } = this.state;
    return (
      <React.Fragment>
        <div className="Font15 mTop25 mBottom5">{_l('名片')}</div>
        <div className="detail-tabs">{this.renderProjectsTab()}</div>
        {this.renderProjectCard()}
      </React.Fragment>
    );
  }

  renderProjectsTab() {
    const {
      data: { userCards },
    } = this.state;
    const projects = userCards.slice(0);
    const { activeProjectId, dropDownValue } = this.state;
    const renderTab = projects => {
      return (
        <React.Fragment>
          {_.map(projects, project => {
            const isActive = activeProjectId === project.projectId;
            return (
              <div
                key={project.projectId}
                className={cx('detail-tab detail-tab-border', {
                  'ThemeColor3 ThemeBorderColor3': isActive,
                  'Gray_75 Hand': !isActive,
                })}
                onClick={() => {
                  this.setState({
                    activeProjectId: project.projectId,
                  });
                }}
              >
                {project.companyName}
              </div>
            );
          })}
        </React.Fragment>
      );
    };
    if (projects.length <= 3) {
      return renderTab(projects);
    } else {
      const prefix = projects.slice(0, 2);
      const otherProjects = projects.slice(2);
      const otherProjectIds = _.map(otherProjects, ({ projectId }) => projectId);
      const dropdownProps = {
        value: dropDownValue || otherProjectIds[0],
        data: _.map(otherProjects, ({ projectId, companyName }) => ({
          text: companyName,
          value: projectId,
          type: 'default',
        })),
        menuStyle: {
          left: 'auto',
          right: '0px',
        },
        onChange: projectId => {
          this.setState({
            activeProjectId: projectId,
            dropDownValue: projectId,
          });
        },
      };

      return (
        <React.Fragment>
          {renderTab(prefix)}
          <Dropdown
            className={cx('detail-tab', {
              'ThemeColor3 ThemeBorderColor3': otherProjectIds.indexOf(activeProjectId) !== -1,
              Gray_75: otherProjectIds.indexOf(activeProjectId) === -1,
            })}
            {...dropdownProps}
          />
        </React.Fragment>
      );
    }
  }

  getDepartmentFullName = (departmentData = []) => {
    let { fullDepartmentInfo = {} } = this.state;
    const departmentIds = departmentData.map(item => item.departmentId).filter(it => !fullDepartmentInfo[it]);
    if (_.isEmpty(departmentIds)) {
      return;
    }
    departmentController
      .getDepartmentFullNameByIds({
        projectId: this.state.activeProjectId,
        departmentIds,
      })
      .then(res => {
        res.forEach(it => {
          fullDepartmentInfo[it.id] = it.name;
        });
        this.setState({ fullDepartmentInfo });
      });
  };

  renderProjectCard() {
    const placeHolder = <span className="Gray_bd">{_l('未填写')}</span>;
    const {
      data: { userCards },
      activeProjectId,
      fullDepartmentInfo = {},
    } = this.state;
    const project = _.find(userCards, project => project.projectId === activeProjectId);
    const { companyName, department, job, jobNumber, workSite, contactPhone, departmentInfos } = project;
    return (
      <div className="pTop5 Font13 mTop">
        <div className="detail-info-row">
          <span className="Gray_75">{_l('组织')}：</span>
          {companyName || placeHolder}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('部门')}：</span>
          {department ? (
            <Tooltip
              tooltipClass="departmentFullNametip"
              popupPlacement="bottom"
              text={
                <div>
                  {departmentInfos.map((v, depIndex) => {
                    const fullName = (this.state.fullDepartmentInfo[v.departmentId] || '').split('/');
                    return (
                      <div className={cx({ mBottom8: depIndex < departmentInfos.length - 1 })}>
                        {fullName.map((n, i) => (
                          <span>
                            {n}
                            {fullName.length - 1 > i && <span className="mLeft8 mRight8">/</span>}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              }
              mouseEnterDelay={0.5}
            >
              <span onMouseEnter={() => this.getDepartmentFullName(departmentInfos)}>{department}</span>
            </Tooltip>
          ) : (
            <span>{placeHolder}</span>
          )}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('职位')}：</span>
          {job || placeHolder}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('工号')}：</span>
          {jobNumber || placeHolder}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('工作地点')}：</span>
          {workSite || placeHolder}
        </div>
        <div className="detail-info-row">
          <span className="Gray_75">{_l('工作电话')}：</span>
          {contactPhone || placeHolder}
        </div>
      </div>
    );
  }

  renderDetail() {
    const {
      data: { mobilePhone, email, isPrivateEmail, isPrivateMobile },
      isShowDetail,
    } = this.state;
    const placeHolder = <span className="Gray_bd">{_l('未填写')}</span>;
    return (
      <React.Fragment>
        <div className="Font13 mTop24">
          <div className="detail-info-row">
            <span className="Gray_75">{_l('电话')}：</span>
            {isPrivateMobile ? _l('保密') : mobilePhone || placeHolder}
          </div>
          <div className="detail-info-row">
            <span className="Gray_75">{_l('邮箱')}：</span>
            {isPrivateEmail ? _l('保密') : email || placeHolder}
          </div>
        </div>
        {this.renderDetailCard()}
        <div
          className="mTop10 Font13 Gray_9e Hand ThemeHoverColor3"
          onClick={() => {
            this.setState({ isShowDetail: !isShowDetail });
          }}
        >
          <span>{isShowDetail ? '收起详情' : '展开详情'}</span>
          {isShowDetail ? <Icon icon="arrow-up" className="mLeft5" /> : <Icon icon="arrow-down" className="mLeft5" />}
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { isLoading, data } = this.state;
    const { accountId, projectId, hideBackBtn } = this.props;
    if (isLoading) {
      return (
        <div className="pTop20">
          <LoadDiv />
        </div>
      );
    }
    if (data === null) return null;
    if (!isLoading && data === undefined) {
      return <AddFriend accountId={accountId} />;
    }
    return (
      <ScrollView>
        <div className="contacts-detail-wrapper">
          {projectId && !hideBackBtn && (
            <div className="back Hand mBottom24" onClick={this.props.back}>
              <Icon icon="arrow-left-border" /> {_l('返回')}
            </div>
          )}
          {this.renderHeader()}
          {this.renderDetail()}
          {this.renderProjectCards()}
        </div>
      </ScrollView>
    );
  }
}
