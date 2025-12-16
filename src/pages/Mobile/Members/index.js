import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Card, Dialog, Input, SpinLoading } from 'antd-mobile';
import _ from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import { ROLE_CONFIG, sysRoleType } from 'src/pages/Role/config.js';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import Back from '../components/Back';
import * as actions from './redux/actions';
import './index.less';

class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.memberData.rolesVisibleConfig === ROLE_CONFIG.REFUSE,
    };
  }
  componentDidMount() {
    $('html').addClass('mobileMembers');
    const { params } = this.props.match;
    this.props.dispatch(actions.getMembers(params.appId));
  }
  componentWillUnmount() {
    $('html').removeClass('mobileMembers');
  }
  handleExitApp = () => {
    const { detail } = this.props.memberData;
    Dialog.confirm({
      title: <span className="Font17 bold">{_l('确认删除应用吗？')}</span>,
      content: (
        <div className="TxtCenter">
          <span className="Font13 Gray mBottom5">
            {_l('应用下所有配置和数据将被永久删除，不可恢复，请确认是否执行此操作！')}
          </span>
          <Input
            className="mTop10 pAll5 appNameInput"
            style={{ borderRadius: 4, border: '1px solid #ededed', '--font-size': 13 }}
            placeholder={_l('输入应用名称以确定删除')}
          />
        </div>
      ),
      cancelText: _l('取消'),
      confirmText: <span className="Red">{_l('确认')}</span>,
      onConfirm: () => {
        const { value } = document.querySelector('.appNameInput input');
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
    });
  };
  renderCard = (data, isAdmin) => {
    const { params } = this.props.match;

    return data.map(item => {
      const { users, count } = item;
      const isInCurrentRole = !!_.filter(users, ({ accountId }) => accountId === md.global.Account.accountId).length;
      if (!isAdmin && item.permissionWay != 80 && this.props.memberData.rolesVisibleConfig === ROLE_CONFIG.REFUSE) {
        return '';
      }

      return (
        <Fragment key={item.roleId}>
          <Card
            className="mTop10 Relative"
            onClick={() => {
              this.props.history.push(`/mobile/membersList/${params.appId}/${item.roleId}`);
            }}
          >
            <div className="flexRow alignItemsCenter">
              <div className="flex Gray Font17 Bold overflow_ellipsis">
                {isInCurrentRole && <span className="isMyRole" />}
                {item.label}
              </div>
              <div className="flex TxtRight moreAction">
                <span className="Gray_75 Bold TxtMiddle">{count > 0 && count}</span>
                <Icon icon="arrow-right-border" className="Font20 mLeft5 Gray_75 TxtMiddle" />
              </div>
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
          </Card>
        </Fragment>
      );
    });
  };
  renderRoleList(data, isAdmin) {
    const sysList = data.filter(o => sysRoleType.includes(o.roleType));
    const otherList = data.filter(o => !sysRoleType.includes(o.roleType));

    return (
      <ScrollView className="memberListCon flex">
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
      </ScrollView>
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
          <div className="flexRow alignItemsCenter">
            <div className="flex Gray Font17 overflow_ellipsis pendingApply">{_l('待处理的申请')}</div>
            <div className="flex TxtMiddle TxtRight moreAction">
              <span className="Bold Red">{_l('%0人', memberData.applyList.length)}</span>
              <Icon icon="arrow-right-border" className="Font20 mLeft5 Gray_75" />
            </div>
          </div>
        </Card>
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
        <Card className="mTop10">
          <div className="TxtCenter Red Font15 Bold" onClick={this.handleExitApp}>
            {_l('删除应用并退出')}
          </div>
        </Card>
      </Fragment>
    );
  }
  render() {
    const { memberData, isMemberLoading } = this.props;

    if (isMemberLoading) {
      return (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
      );
    } else {
      const { detail } = this.props.memberData;
      const isAdmin =
        detail.permissionType === APP_ROLE_TYPE.POSSESS_ROLE || detail.permissionType === APP_ROLE_TYPE.ADMIN_ROLE;
      return (
        <div className="memberListMobile h100 flexColumn">
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
