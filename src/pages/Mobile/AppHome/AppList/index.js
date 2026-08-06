import React, { Component } from 'react';
import _ from 'lodash';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import DocumentTitle from 'mobile/components/DocumentTitle';
import AppStatus from 'src/pages/AppHomepage/AppCenter/components/AppStatus';
import { generateRandomPassword } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import Back from '../../components/Back';
import showAddAppActionSheet from '../components/AddAppActionSheet';
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
    this.actionSheetHandler = showAddAppActionSheet();
  };
  render() {
    let { currentGroupList, loading, groupInfo = {} } = this.state;
    currentGroupList = currentGroupList.filter(it => !(window.isMingDaoApp ? it.appDisplay : it.webMobileDisplay));
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
              iconColor: 'var(--color-background-secondary)',
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
