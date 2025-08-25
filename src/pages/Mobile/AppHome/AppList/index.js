import React, { Component, Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import { ActionSheet, Dialog } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import AppStatus from 'src/pages/AppHomepage/AppCenter/components/AppStatus';
import { generateRandomPassword } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import Back from '../../components/Back';
import './index.less';

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
  componentWillUnmount() {
    this.actionSheetHandler && this.actionSheetHandler.close();
  }
  getAppListInfo = () => {
    const { params = {} } = this.props.match;
    const { groupId, groupType } = params;
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    const { projectId } = currentProject;
    homeAppAjax.getGroup({ projectId, id: groupId, groupType }).then(res => {
      this.setState({ currentGroupList: res.apps || [], loading: false, groupInfo: res });
    });
  };
  renderItem(data) {
    return (
      <div className="myAppItemWrap InlineBlock" key={`${data.id}-${generateRandomPassword(10)}`}>
        <div
          className="myAppItem mTop24"
          onClick={() => {
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
            {data.id === 'add' || (!data.fixed && !data.isUpgrade && !data.isNew && data.isGoodsStatus) ? null : (
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
      {
        key: 'application',
        text: (
          <Fragment>
            <Icon className={cx('mRight10 Gray_9e Font18')} icon="application_library" />
            <span className="Bold">{_l('从模板库添加')}</span>
          </Fragment>
        ),
      },
      {
        key: 'add',
        text: (
          <Fragment>
            <Icon className={cx('mRight10 Gray_9e Font18')} icon="add1" />
            <span className="Bold">{_l('自定义创建')}</span>
          </Fragment>
        ),
      },
    ].filter(
      v =>
        (md.global.SysSettings.hideTemplateLibrary && v.key !== 'application') ||
        !md.global.SysSettings.hideTemplateLibrary,
    );
    this.actionSheetHandler = ActionSheet.show({
      actions: BUTTONS,
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('添加应用')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: action => {
        if (action.key === 'application') {
          window.mobileNavigateTo(`/mobile/appBox`);
        }
        if (action.key === 'add') {
          const title = window.isWxWork ? _l('创建自定义应用请前往企业微信PC桌面端') : _l('创建自定义应用请前往PC端');
          Dialog.alert({
            content: title,
            confirmText: _l('我知道了'),
            onAction: () => {},
          });
        }
        this.actionSheetHandler.close();
      },
    });
  };
  render() {
    let { currentGroupList, loading, groupInfo = {} } = this.state;
    currentGroupList = currentGroupList.filter(it => !it.webMobileDisplay);
    const currentProject = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const { projectId } = currentProject;

    if (loading) return <LoadDiv className="h100 flexColumn justifyCenter" />;

    return (
      <div className="appList">
        <DocumentTitle title={groupInfo.name} />
        <div className="appCon flexRow alignItemsCenter">
          {_.map(currentGroupList || [], item => {
            return this.renderItem(item);
          })}
          {!(_.find(md.global.Account.projects, item => item.projectId === projectId) || {}).cannotCreateApp &&
            this.renderItem({
              id: 'add',
              iconColor: '#F5F5F5',
              icon: 'plus',
              name: _l('添加应用'),
              onClick: this.showActionSheet,
            })}
        </div>
        <Back
          onClick={() => {
            window.mobileNavigateTo('/mobile/appGroupList');
          }}
        />
      </div>
    );
  }
}
export default AppList;
