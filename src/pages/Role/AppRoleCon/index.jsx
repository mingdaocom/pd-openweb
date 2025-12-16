import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { dialogSelectUser } from 'ming-ui/functions';
import AppAjax from 'src/api/appManagement';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { ROLE_CONFIG } from 'src/pages/Role/config';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import { WrapCon, WrapContext, WrapHeader } from 'src/pages/Role/style';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import OthersCon from './OthersCon';
import RoleCon from './RoleCon';
import UserCon from './UserCon';

const conList = [
  {
    url: '/',
    key: 'user',
    txt: _l('用户'),
  },
  { url: '/roleSet', key: 'roleSet', txt: _l('角色') },
];

const getTabList = () => {
  const currentProjectId =
    localStorage.getItem('currentProjectId') || ((_.get(md, 'global.Account.projects') || [])[0] || {}).projectId;
  const FEATURE_STATUS = getFeatureStatus(currentProjectId, VersionProductType.userExtensionInformation);
  if (FEATURE_STATUS) {
    return conList.concat({
      url: '/others',
      key: 'others',
      txt: _l('扩展'),
    });
  }
  return conList;
};

class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'user',
      rolesVisibleConfig: null,
      notify: false,
    };
    const { setQuickTag } = props;
    setQuickTag();
  }
  componentDidMount() {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { isAdmin, fetchAllNavCount, setSelectedIds, canEditUser, canEditApp } = this.props;
    setSelectedIds([]);
    (canEditUser || canEditApp) && this.getSet();
    fetchAllNavCount({
      canEditUser,
      appId,
    });
    if (!isAdmin) {
      this.setState({
        tab: 'user',
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.appRole.quickTag, nextProps.appRole.quickTag) && !!nextProps.appRole.quickTag.tab) {
      this.setState({
        tab: nextProps.appRole.quickTag.tab || 'user',
      });
    }
  }

  componentWillUnmount() {
    const { setAppRoleSummary, setUserList, SetAppRolePagingModel } = this.props;
    setUserList([]);
    setAppRoleSummary([]);
    SetAppRolePagingModel(null);
  }

  getSet = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    AppAjax.getAppRoleSetting({ appId }).then(data => {
      this.setState({ rolesVisibleConfig: String(data.appSettingsEnum), notify: data.notify });
    });
  };
  handleSwitchRolesDisplay = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { rolesVisibleConfig } = this.state;
    const status = rolesVisibleConfig === ROLE_CONFIG.REFUSE ? ROLE_CONFIG.PERMISSION : ROLE_CONFIG.REFUSE;
    AppAjax.updateMemberStatus({ appId, status }).then(data => {
      if (data) {
        this.setState({ rolesVisibleConfig: status });
      }
    });
  };
  updateAppRoleNotify = () => {
    const {
      match: {
        params: { appId },
      },
    } = this.props;
    const { notify } = this.state;
    AppAjax.updateAppRoleNotify({ appId, notify: !notify }).then(data => {
      if (data) {
        this.setState({ notify: !notify });
      }
    });
  };
  renderCon = () => {
    const { tab } = this.state;
    switch (tab) {
      case 'roleSet':
        return <RoleCon {...this.props} tab={tab} />;
      case 'others':
        return <OthersCon {...this.props} tab={tab} />;
      default:
        return <UserCon {...this.props} tab={tab} transferApp={() => this.transferApp()} />;
    }
  };
  /**
   * 转交他人
   */
  transferApp = () => {
    const {
      projectId,
      match: {
        params: { appId },
      },
    } = this.props;

    dialogSelectUser({
      showMoreInvite: false,
      SelectUserSettings: {
        projectId,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        unique: true,
        callback: users => {
          AppAjax.updateAppOwner({
            appId,
            memberId: users[0].accountId,
          }).then(res => {
            if (res) {
              location.reload();
            } else {
              alert(_l('托付失败'), 2);
            }
          });
        },
      },
    });
  };
  render() {
    const {
      canEditApp,
      canEditUser,
      appRole = {},
      isOwner,
      match: {
        params: { appId },
      },
      setQuickTag,
      SetAppRolePagingModel,
    } = this.props;
    const { notify, rolesVisibleConfig } = this.state;
    const { pageLoading, appRolePagingModel } = appRole;
    if (pageLoading) {
      return <LoadDiv />;
    }
    return (
      <WrapCon className="flexColumn overflowHidden">
        {(canEditApp || canEditUser) && (
          <WrapHeader>
            <div className="tabCon InlineBlock pLeft26">
              {getTabList()
                .filter(o => (canEditApp ? true : o.key === 'user')) //是否有编辑权限
                .map(o => {
                  return (
                    <span
                      className={cx('tab Hand Font14 Bold', { cur: this.state.tab === o.key })}
                      id={`tab_${o.key}`}
                      onClick={() => {
                        this.props.handleChangePage(() => {
                          SetAppRolePagingModel({
                            ...appRolePagingModel,
                            pageIndex: 1,
                            keywords: '',
                          });
                          setQuickTag({ ...appRole.quickTag, tab: o.key });
                          navigateTo(`/app/${appId}/role`);
                          this.setState({
                            tab: o.key,
                          });
                        });
                      }}
                    >
                      {o.txt}
                    </span>
                  );
                })}
            </div>
            <div className="flexRow alignItemsCenter" style={{ 'justify-content': 'flex-end' }}>
              {(canEditApp || canEditUser) && (
                <div className="flexRow pRight20 actCheckCon">
                  <Tooltip
                    title={
                      <span>
                        {_l('开启时，当用户被添加、移除、变更角色时会收到系统通知，关闭时，以上操作不通知用户。')}
                      </span>
                    }
                    placement="top"
                  >
                    <span>
                      <Checkbox
                        className=""
                        size="small"
                        checked={notify}
                        onClick={this.updateAppRoleNotify}
                        text={_l('发送通知')}
                      />
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      <span>
                        {_l('勾选时，普通角色可以查看应用下所有角色和人员。未勾选时，对普通角色直接隐藏用户入口')}
                      </span>
                    }
                    placement="top"
                  >
                    <span>
                      <Checkbox
                        className="mLeft25"
                        size="small"
                        checked={rolesVisibleConfig !== ROLE_CONFIG.REFUSE}
                        onClick={this.handleSwitchRolesDisplay}
                        text={_l('允许查看')}
                      />
                    </span>
                  </Tooltip>
                </div>
              )}
              {isOwner && (
                <div className="pRight20">
                  <DropOption
                    dataList={[
                      {
                        value: 0,
                        text: _l('转交应用'),
                      },
                    ]}
                    onAction={() => {
                      this.transferApp();
                    }}
                    popupAlign={{
                      points: ['tr', 'br'],
                      offset: [-180, 0],
                    }}
                  />
                </div>
              )}
            </div>
          </WrapHeader>
        )}

        <WrapContext className={cx('flex')}>{this.renderCon()}</WrapContext>
      </WrapCon>
    );
  }
}
const mapStateToProps = state => ({
  appRole: state.appRole,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Con);
