import React, { Component, Fragment } from 'react';
import { Flex, ActionSheet, Modal } from 'antd-mobile';
import { Icon, LoadDiv } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import AppStatus from 'src/pages/AppHomepage/AppCenter/components/AppStatus';
import homeAppAjax from 'src/api/homeApp';
import { getRandomString, getCurrentProject } from 'src/util';
import Back from '../../components/Back';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

class AppList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentGroupList: [],
      groupInfo: {},
      loading: true,
    };
  }
  componentDidMount() {
    this.getAppListInfo();
  }
  getAppListInfo = () => {
    const { params = {} } = this.props.match;
    const { groupId, groupType } = params;
    const { projectId } = getCurrentProject(
      localStorage.getItem('currentProjectId') ||
        (md.global.Account.projects[0] || { projectId: 'external' }).projectId,
    );
    homeAppAjax.getGroup({ projectId, id: groupId, groupType }).then(res => {
      this.setState({ currentGroupList: res.apps || [], loading: false, groupInfo: res });
    });
  };
  renderItem(data) {
    return (
      <div className="myAppItemWrap InlineBlock" key={`${data.id}-${getRandomString()}`}>
        <div
          className="myAppItem mTop24"
          onClick={e => {
            localStorage.removeItem('currentNavWorksheetId');
            data.onClick ? data.onClick() : window.mobileNavigateTo(`/mobile/app/${data.id}`);
          }}
        >
          <div className="myAppItemDetail TxtCenter Relative" style={{ backgroundColor: data.iconColor }}>
            {data.iconUrl ? (
              <SvgIcon url={data.iconUrl} fill="#fff" size={32} addClassName="mTop12" />
            ) : (
              <Icon icon={data.icon} className="Font30" />
            )}
            {data.id === 'add' || !data.fixed ? null : (
              <AppStatus isGoodsStatus={data.isGoodsStatus} isNew={data.isNew} fixed={data.fixed} />
            )}
          </div>
          <span className="breakAll LineHeight16 Font13 mTop10 contentText" style={{ WebkitBoxOrient: 'vertical' }}>
            {data.name}
          </span>
        </div>
      </div>
    );
  }
  showActionSheet = () => {
    const BUTTONS = [
      { name: _l('从模板库添加'), icon: 'application_library', iconClass: 'Font18' },
      { name: _l('自定义创建'), icon: 'add', iconClass: 'Font22' },
    ];
    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS.map(item => (
          <Fragment>
            <Icon className={cx('mRight10 Gray_9e', item.iconClass)} icon={item.icon} />
            <span className="Bold">{item.name}</span>
          </Fragment>
        )),
        message: (
          <div className="flexRow header">
            <span className="Font13">{_l('添加应用')}</span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
      },
      buttonIndex => {
        if (buttonIndex === -1) return;
        if (buttonIndex === 0) {
          window.mobileNavigateTo(`/mobile/appBox`);
        }
        if (buttonIndex === 1) {
          const title = _l('创建自定义应用请前往%0。', isWxWork ? _l('企业微信PC桌面端') : _l('PC端'));
          Modal.alert(title, null, [{ text: _l('我知道了'), onPress: () => {} }]);
        }
      },
    );
  };
  render() {
    let { currentGroupList, loading, groupInfo = {} } = this.state;
    currentGroupList = currentGroupList.filter(it => !it.webMobileDisplay);
    if (loading) return <LoadDiv className="h100 flexColumn justifyCenter" />;
    return (
      <div className="appList">
        <DocumentTitle title={groupInfo.name} />
        <Flex align="center" wrap="wrap" className="appCon">
          {_.map(currentGroupList || [], (item, i) => {
            return this.renderItem(item);
          })}
          {this.renderItem({
            id: 'add',
            iconColor: '#F5F5F5',
            icon: 'plus',
            name: _l('添加应用'),
            onClick: this.showActionSheet,
          })}
        </Flex>
        <Back
          style={{ bottom: '20px' }}
          onClick={() => {
            window.mobileNavigateTo('/mobile/appGroupList');
          }}
        />
      </div>
    );
  }
}
export default AppList;
