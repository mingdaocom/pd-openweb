import React, { Fragment } from 'react';
import { Flex, Button, Modal, ActivityIndicator } from 'antd-mobile';
import styled from 'styled-components';
import homeAppAjax from 'src/api/homeApp';
import noAppImg from './img/noApp.png';
import noAppListImg from './img/noList.png';
import noRoleImg from './img/lock.png';
import AppManagement from 'src/api/appManagement';

const STATUS_TO_TEXT = {
  1: { src: noAppListImg, text: _l('请前往Web端创建工作表，开始构建你的应用') },
  2: { src: noAppImg, text: _l('应用不存在') },
  4: { src: noRoleImg, text: _l('你还不是应用成员，无权访问此应用') },
  5: { src: noRoleImg, text: _l('未分配任何工作表，请联系此应用的管理员') },
};

const ApplyButton = styled(Button)`
  height: 38px !important;
  line-height: 38px !important;
  border-radius: 25px !important;
  &:hover {
    color: #fff !important;
  }
`;

export class AppPermissionsInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAppActioning: false,
    }
  }
  handleAddAppApply = () => {
    const { appId } = this.props;
    this.setState({ isAppActioning: true });
    AppManagement.addAppApply({
      appId,
      remark: '',
    }).then(data => {
      this.setState({ isAppActioning: false });
      if (data) {
        Modal.alert(
          _l('申请已提交'),
          '',
          [{
            text: _l('确定'),
            onPress: () => { },
          },
          ]);
      }
    });
  }
  render() {
    const { appStatus } = this.props;
    const { isAppActioning } = this.state;
    return (
      <Flex align="center" justify="between" className="WhiteBG TxtCenter overflowHidden h100">
        <Flex.Item>
          <img src={STATUS_TO_TEXT[appStatus].src} alt={_l('错误')} className="InlineBlock" width="110" />
          <br />
          <p className="mTop25 mBottom25 TxtCenter Gray Font17 hintInfo">{STATUS_TO_TEXT[appStatus].text}</p>
          {appStatus === 4 && (
            <div>
              <ApplyButton
                inline
                loading={isAppActioning}
                type="primary"
                size="middle"
                className="Font16"
                onClick={this.handleAddAppApply}
              >
                {_l('申请加入')}
              </ApplyButton>
            </div>
          )}
        </Flex.Item>
      </Flex>
    );
  }
}

const appPermissions = (Component) => {
  class AppPermissions extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        appStatus: 1
      }
    }
    componentDidMount() {
      const { params, path } = this.props.match;
      if (['undefined', 'null'].includes(params.appId)) {
        this.setState({ loading: false });
        return
      }
      if (path.includes('recordList')) {
        homeAppAjax.getPageInfo({
          appId: params.appId,
          id: params.worksheetId,
          sectionId: params.groupId
        }).then(data => {
          const { wsType } = data;
          if (wsType === 1) {
            window.mobileNavigateTo(`/mobile/customPage/${params.appId}/${params.groupId}/${params.worksheetId}`);
          }
        });
      }
      homeAppAjax.checkApp({
        appId: params.appId,
      }, {
        silent: true
      }).then(status => {
        this.setState({ appStatus: status, loading: false });
      });
    }
    render() {
      const { params } = this.props.match;
      const { loading, appStatus } = this.state;
      if (loading) {
        return (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        )
      }
      if (appStatus !== 1) {
        return <AppPermissionsInfo appId={params.appId} appStatus={appStatus} />
      }
      return <Component {...this.props} />;
    }
  }
  return AppPermissions;
}

const run = (Component) => {
  return Component => appPermissions(Component);
}

export default run((props) => {
  return <Fragment>{props.children}</Fragment>;
});
