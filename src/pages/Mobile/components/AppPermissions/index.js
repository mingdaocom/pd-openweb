import React, { Fragment } from 'react';
import { Button, Dialog, Popup, SpinLoading } from 'antd-mobile';
import styled from 'styled-components';
import { Textarea } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import FixedPage from 'src/pages/Mobile/App/FixedPage';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import { getAppLangDetail } from 'src/utils/app';
import Back from '../Back';
import noRoleImg from './img/lock.png';
import noAppImg from './img/noApp.png';
import noAppListImg from './img/noList.png';

const ApplyJoinAppPopup = styled(Popup)`
  .adm-popup-body {
    border-radius: 8px 8px 0 0;
    padding: 16px 15px 7px;
    .ming.Textarea {
      border: 1px solid #e0e0e0;
      &::-webkit-input-placeholder {
        color: #bdbdbd;
      }
    }
  }
`;

const STATUS_TO_TEXT = {
  1: { src: noAppListImg, text: _l('请前往Web端创建工作表，开始构建你的应用') },
  2: { src: noAppImg, text: _l('应用不存在') },
  3: { src: noAppImg, text: _l('应用已删除') },
  4: { src: noRoleImg, text: _l('你还不是应用成员，无权访问此应用') },
  5: { src: noRoleImg, text: _l('未分配任何工作表，请联系此应用的管理员') },
  6: { src: noAppImg, text: _l('工作表或自定义页面已删除') },
  20: { src: noRoleImg, text: _l('当前应用已过期') },
  30: { src: noAppImg, text: _l('应用已删除，如需使用请从回收站内恢复') },
  31: { src: noAppImg, text: _l('应用已被彻底删除，如需使用请重新安装') },
};

export class AppPermissionsInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAppActioning: false,
    };
  }
  handleAddAppApply = () => {
    const { appId } = this.props;
    const { remark } = this.state;

    this.setState({ isAppActioning: true, applyJoinAppVisible: false, remark: '' });

    appManagementApi
      .addAppApply({
        appId,
        remark,
      })
      .then(data => {
        this.setState({ isAppActioning: false });
        if (data) {
          Dialog.alert({
            content: _l('申请已提交'),
            confirmText: _l('确定'),
            onAction: () => {},
          });
        }
      });
  };

  renderApplyJoinApp = () => {
    const { applyJoinAppVisible, remark } = this.state;

    return (
      <ApplyJoinAppPopup
        visible={applyJoinAppVisible}
        onClose={() => this.setState({ applyJoinAppVisible: false, remark: '' })}
      >
        <div className="bold mBottom10">{_l('申请加入应用')}</div>
        <Textarea
          height={120}
          value={remark}
          onChange={value => this.setState({ remark: value })}
          placeholder={_l('填写申请说明')}
        />
        <div className="flexRow mTop16">
          <Button
            className="flex mRight6 Font14 bold Gray_75"
            onClick={() => this.setState({ applyJoinAppVisible: false, remark: '' })}
          >
            <span>{_l('取消')}</span>
          </Button>
          <Button className="flex mLeft6 Font14 bold" color="primary" onClick={this.handleAddAppApply}>
            {_l('申请加入')}
          </Button>
        </div>
      </ApplyJoinAppPopup>
    );
  };

  render() {
    const { appStatus } = this.props;
    const { isAppActioning } = this.state;
    const info = STATUS_TO_TEXT[appStatus] || STATUS_TO_TEXT[2];
    return (
      <div className="WhiteBG TxtCenter overflowHidden h100 flexRow alignItemsCenter justifyContentCenter">
        <div className="flex">
          <img src={info.src} className="InlineBlock" width="110" />
          <br />
          <p className="mTop25 mBottom25 TxtCenter Gray Font17 hintInfo">{info.text}</p>
          {appStatus === 4 && (
            <div>
              <Button
                style={{
                  '--border-radius': '24px',
                }}
                size="middle"
                loading={isAppActioning}
                color="primary"
                className="Font16"
                onClick={() => this.setState({ applyJoinAppVisible: true })}
              >
                {_l('申请加入')}
              </Button>
            </div>
          )}
        </div>

        {this.renderApplyJoinApp()}

        <Back
          icon="home"
          style={{ bottom: '20px' }}
          onClick={() => {
            window.mobileNavigateTo('/mobile/dashboard');
          }}
        />
      </div>
    );
  }
}

const appPermissions = Component => {
  class AppPermissions extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        appStatus: 1,
        fixedData: {},
      };
    }
    componentDidMount() {
      const { params, path } = this.props.match;
      const { appId } = params;
      if (['undefined', 'null'].includes(appId) || _.get(window, 'shareState.shareId')) {
        this.setState({ loading: false });
        return;
      }
      if (path.includes('recordList')) {
        homeAppApi
          .getPageInfo({
            appId,
            id: params.worksheetId,
            sectionId: params.groupId,
          })
          .then(data => {
            const { wsType } = data;
            if (wsType === 1) {
              window.mobileNavigateTo(`/mobile/customPage/${appId}/${params.groupId}/${params.worksheetId}`, true);
            }
          });
      }
      homeAppApi
        .checkApp(
          {
            appId,
          },
          {
            silent: true,
          },
        )
        .then(status => {
          this.getApp(appId);
          this.setState({ appStatus: status });
        })
        .catch(error => {
          this.setState({ appStatus: error.errorCode, loading: false });
        });
    }
    getApp = appId => {
      homeAppApi
        .getApp({
          appId,
          getLang: true,
        })
        .then(data => {
          const { langInfo, fixAccount, fixRemark, fixed, webMobileDisplay, permissionType } = data;
          const isAuthorityApp = permissionType >= APP_ROLE_TYPE.ADMIN_ROLE;
          window[`timeZone_${appId}`] = data.timeZone;
          window.appInfo = data;
          this.setState({
            fixedData: {
              fixAccount,
              fixRemark,
              fixed: fixed && !isAuthorityApp,
              webMobileDisplay,
            },
          });
          getAppLangDetail(data).then(() => {
            this.setState({ loading: false });
          });
        });
    };
    render() {
      const { params } = this.props.match;
      const { loading, appStatus, fixedData } = this.state;
      if (loading) {
        return (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color="primary" />
          </div>
        );
      }
      if (fixedData.fixed || fixedData.webMobileDisplay) {
        const { fixAccount, fixRemark, webMobileDisplay } = fixedData;
        return <FixedPage fixAccount={fixAccount} fixRemark={fixRemark} isNoPublish={webMobileDisplay} />;
      }
      if (appStatus !== 1) {
        return <AppPermissionsInfo appId={params.appId} appStatus={appStatus} />;
      }
      return <Component {...this.props} />;
    }
  }
  return AppPermissions;
};

const run = Component => {
  return Component => appPermissions(Component);
};

export default run(props => {
  return <Fragment>{props.children}</Fragment>;
});
