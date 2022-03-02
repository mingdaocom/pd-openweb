import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import { WingBlank, WhiteSpace, Card, Flex, ActionSheet, Modal, ActivityIndicator, Button, Switch } from 'antd-mobile';
import { Icon } from 'ming-ui';
import Back from '../components/Back';
import { ROLE_TYPES, ROLE_CONFIG } from 'pages/Roles/config';
import cx from 'classnames';
import './index.less';

class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.memberData.rolesVisibleConfig === ROLE_CONFIG.REFUSE,
    }
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

    this.modal = Modal.prompt((
      <span className="Font17 bold">{_l('确认删除应用吗？')}</span>
    ), (
      <span className="Font13 Gray mBottom5">{_l('应用下所有配置和数据将被永久删除，不可恢复，请确认是否执行此操作！')}</span>
    ), [
      { text: _l('取消'), onPress: () => { }, style: { color: '#2196f3' } },
      {
        text: _l('确定'),
        onPress: (value) => {
          if (detail.name === value) {
            this.props.dispatch(actions.deleteApp({
              projectId: '',
              appId: this.props.match.params.appId,
            }, ({ data }) => {
              if (data) {
                this.props.history.push('/mobile/appHome');
              }
            }));
          } else {
            alert(_l('应用名称错误'), 2);
          }
        },
        style: { color: 'red' },
      },
    ], 'default', null, [_l('输入应用名称以确定删除')]);
  }
  renderCard(data, isAdmin) {
    const { params } = this.props.match;
    const { detail, rolesVisibleConfig } = this.props.memberData;
    const isUserAdmin = detail.permissionType >= 100;
    return (
    <div className="memberListCon">
      {data.map((item, i) => {
        const { users } = item;
        const isInCurrentRole = !isAdmin && !!_.filter(users, ({ accountId }) => accountId === md.global.Account.accountId).length;
        if (!isAdmin && item.permissionWay != 80 && this.props.memberData.rolesVisibleConfig === ROLE_CONFIG.REFUSE) {
          return '';
        }
        return (
          <Fragment key={item.roleId}>
            <WhiteSpace size="md" />
            <Card className={cx({ cardBorder: isInCurrentRole })} onClick={() => {
              this.props.history.push(`/mobile/membersList/${params.appId}/${item.roleId}`);
            }}>
              <Card.Body>
                <div>
                  <Flex direction="row">
                    <Flex.Item className="Gray Font17 Bold overflow_ellipsis">
                      {item.label}
                      {isInCurrentRole && <span className="myRole TxtMiddle mLeft8">{_l('我的角色')}</span>}
                    </Flex.Item>
                    <Flex.Item className="TxtMiddle TxtRight moreAction">
                      <span className="Gray_75 Bold">
                        {!_.isEmpty(item.users) && _l('%0人', item.users.length)}
                        {!_.isEmpty(item.users) && !_.isEmpty(item.departmentsInfos) && `、`}
                        {!_.isEmpty(item.departmentsInfos) && _l('%0个部门', item.departmentsInfos.length)}
                      </span>
                      <Icon icon="arrow-right-border" className="Font20 mLeft5 Gray_75" />
                    </Flex.Item>
                  </Flex>
                </div>
                <div className="Gray_75 Font14 mTop8">
                  {
                    item.description || (item.permissionWay === 80 ? _l('可以配置应用，管理应用下所有数据和人员') : _l('自定义权限'))
                  }
                </div>
              </Card.Body>
            </Card>
            {isUserAdmin && rolesVisibleConfig == ROLE_CONFIG.REFUSE && item.roleType === ROLE_TYPES.ADMIN && (
              <WingBlank size="md">
                <WhiteSpace size="xl" />
                <div>{_l('对非管理员隐藏以下角色')}</div>
              </WingBlank>
            )}
          </Fragment>
        );
      })}
    </div>
    );
  }
  renderApplyList() {
    const { memberData } = this.props;
    const { params } = this.props.match;
    return (
      <div className="memberListCon">
        <Card onClick={() => { this.props.history.push(`/mobile/applyList/${params.appId}`); }}>
          <Card.Body>
            <Flex direction="row">
              <Flex.Item className="Gray Font17 overflow_ellipsis pendingApply">
                {_l('待处理的申请')}
              </Flex.Item>
              <Flex.Item className="TxtMiddle TxtRight moreAction">
                <span className="Bold Red">
                  {_l('%0人', memberData.applyList.length)}
                </span>
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
    const isOwer = detail.permissionType === ROLE_TYPES.OWNER;

    if (!isOwer) {
      return null;
    }

    return (
      <Fragment>
        <WhiteSpace size="lg" />
        <WhiteSpace size="lg" />
        <Card>
          <Card.Body className="TxtCenter Red Font15 Bold" onClick={this.handleExitApp}>
            {_l('删除应用')}
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
      const isAdmin = detail.permissionType === ROLE_TYPES.OWNER || detail.permissionType === ROLE_TYPES.ADMIN;
      return (
        <div className="memberListMobile h100">
          {(isAdmin && memberData.applyList && memberData.applyList.length > 0) && this.renderApplyList()}
          {this.renderCard(memberData.listData, isAdmin)}
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

export default connect((state) => {
  // status = rolesVisibleConfig === ROLE_CONFIG.REFUSE ? ROLE_CONFIG.PERMISSION : ROLE_CONFIG.REFUSE;
  const { memberData, isMemberLoading } = state.mobile;
  return {
    memberData,
    isMemberLoading,
  };
})(Members);
