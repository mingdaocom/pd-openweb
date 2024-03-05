import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import { WhiteSpace, Card, Flex, Modal, ActivityIndicator } from 'antd-mobile';
import { Icon } from 'ming-ui';
import Back from '../components/Back';
import { ROLE_CONFIG, sysRoleType } from 'src/pages/Role/config.js';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import './index.less';
import _ from 'lodash';

class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.memberData.rolesVisibleConfig === ROLE_CONFIG.REFUSE,
    };
    this.modal = null;
  }
  componentDidMount() {
    $('html').addClass('mobileMembers');
    const { params } = this.props.match;
    this.props.dispatch(actions.getMembers(params.appId));
  }
  componentWillUnmount() {
    $('html').removeClass('mobileMembers');
    if (this.modal) {
      this.modal.close();
    } else {
      this.modal = null;
    }
  }
  handleExitApp = () => {
    const { detail } = this.props.memberData;

    this.modal = Modal.prompt(
      <span className="Font17 bold">{_l('确认删除应用吗？')}</span>,
      <span className="Font13 Gray mBottom5">
        {_l('应用下所有配置和数据将被永久删除，不可恢复，请确认是否执行此操作！')}
      </span>,
      [
        { text: _l('取消'), onPress: () => {}, style: { color: '#2196f3' } },
        {
          text: _l('确定'),
          onPress: value => {
            if (detail.name === value) {
              this.props.dispatch(
                actions.deleteApp(
                  {
                    projectId: '',
                    appId: this.props.match.params.appId,
                    isHomePage: true,
                  },
                  ({ data }) => {
                    if (data) {
                      this.props.history.push('/mobile/dashboard');
                    }
                  },
                ),
              );
            } else {
              alert(_l('应用名称错误'), 2);
            }
          },
          style: { color: 'red' },
        },
      ],
      'default',
      null,
      [_l('输入应用名称以确定删除')],
    );
  };
  renderCard = (data, isAdmin) => {
    const { params } = this.props.match;

    return data.map((item, i) => {
      const { users, count } = item;
      const isInCurrentRole = !!_.filter(users, ({ accountId }) => accountId === md.global.Account.accountId).length;
      if (!isAdmin && item.permissionWay != 80 && this.props.memberData.rolesVisibleConfig === ROLE_CONFIG.REFUSE) {
        return '';
      }

      return (
        <Fragment key={item.roleId}>
          <WhiteSpace size="md" />
          <Card
            onClick={() => {
              this.props.history.push(`/mobile/membersList/${params.appId}/${item.roleId}`);
            }}
          >
            <Card.Body>
              <div>
                <Flex direction="row">
                  <Flex.Item className="Gray Font17 Bold overflow_ellipsis">
                    {isInCurrentRole && <span className="isMyRole" />}
                    {item.label}
                  </Flex.Item>
                  <Flex.Item className="TxtRight moreAction">
                    <span className="Gray_75 Bold TxtMiddle">{count > 0 && count}</span>
                    <Icon icon="arrow-right-border" className="Font20 mLeft5 Gray_75 TxtMiddle" />
                  </Flex.Item>
                </Flex>
              </div>
              <div className="Gray_75 Font14 mTop8 ellipsis">
                {item.description ||
                  (item.roleType === 100
                    ? _l('可以配置应用，管理应用下所有数据和人员')
                    : item.roleType === 2
                    ? _l('管理所有数据和人员，不可配置应用')
                    : item.roleType === 1
                    ? _l('开发者只能配置应用')
                    : _l('自定义权限'))}
              </div>
            </Card.Body>
          </Card>
        </Fragment>
      );
    });
  };
  renderRoleList(data, isAdmin) {
    const sysList = data.filter(o => sysRoleType.includes(o.roleType));
    const otherList = data.filter(o => !sysRoleType.includes(o.roleType));

    return (
      <div className="memberListCon">
        <div className="roleTypeTitle">{_l('系统')}</div>
        {this.renderCard(sysList, isAdmin)}
        {otherList && otherList.length ? (
          <Fragment>
            <div className="roleTypeTitle">{_l('普通')}</div>
            {this.renderCard(otherList, isAdmin)}
          </Fragment>
        ) : (
          ''
        )}
      </div>
    );
  }
  renderApplyList() {
    const { memberData } = this.props;
    const { params } = this.props.match;
    return (
      <div className="memberListCon">
        <Card
          onClick={() => {
            this.props.history.push(`/mobile/applyList/${params.appId}`);
          }}
        >
          <Card.Body>
            <Flex direction="row">
              <Flex.Item className="Gray Font17 overflow_ellipsis pendingApply">{_l('待处理的申请')}</Flex.Item>
              <Flex.Item className="TxtMiddle TxtRight moreAction">
                <span className="Bold Red">{_l('%0人', memberData.applyList.length)}</span>
                <Icon icon="arrow-right-border" className="Font20 mLeft5 Gray_75" />
              </Flex.Item>
            </Flex>
          </Card.Body>
        </Card>
        <WhiteSpace size="md" />
      </div>
    );
  }
  renderBtn() {
    const { detail } = this.props.memberData;
    const isOwer = detail.permissionType === APP_ROLE_TYPE.POSSESS_ROLE;

    if (!isOwer || detail.isLock) {
      return null;
    }

    return (
      <Fragment>
        <WhiteSpace size="lg" />
        <Card>
          <Card.Body className="TxtCenter Red Font15 Bold" onClick={this.handleExitApp}>
            {_l('删除应用并退出')}
          </Card.Body>
        </Card>
      </Fragment>
    );
  }
  render() {
    const { memberData, isMemberLoading } = this.props;
    const { params } = this.props.match;
    if (isMemberLoading) {
      return (
        <Flex className="h100" justify="center" align="center">
          <ActivityIndicator size="large" />
        </Flex>
      );
    } else {
      const { detail, rolesVisibleConfig } = this.props.memberData;
      const isAdmin =
        detail.permissionType === APP_ROLE_TYPE.POSSESS_ROLE || detail.permissionType === APP_ROLE_TYPE.ADMIN_ROLE;
      return (
        <div className="memberListMobile h100">
          {isAdmin && memberData.applyList && memberData.applyList.length > 0 && this.renderApplyList()}
          {this.renderRoleList(memberData.listData, isAdmin)}
          {!window.isPublicApp && this.renderBtn()}
          <Back
            className="low"
            onClick={() => {
              this.props.history.push(`/mobile/app/${detail.id}`);
            }}
          />
        </div>
      );
    }
  }
}

export default connect(state => {
  // status = rolesVisibleConfig === ROLE_CONFIG.REFUSE ? ROLE_CONFIG.PERMISSION : ROLE_CONFIG.REFUSE;
  const { memberData, isMemberLoading } = state.mobile;
  return {
    memberData,
    isMemberLoading,
  };
})(Members);
