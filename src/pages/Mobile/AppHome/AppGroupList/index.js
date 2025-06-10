import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, SvgIcon } from 'ming-ui';
import { getCurrentProject } from 'src/utils/project';
import Back from '../../components/Back';
import * as actions from '../redux/actions';
import './index.less';

const groupTitleList = {
  markedGroup: _l('星标'),
  personalGroups: _l('个人'),
  projectGroups: _l('组织'),
};

class AppGroupList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const projectObj = getCurrentProject(
      localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
    );
    const currentProject = !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') };
    this.setState({ projectId: currentProject.projectId });
    this.props.dispatch(actions.getMyApp(currentProject.projectId));
  }
  renderlist = (data = [], type) => {
    return (
      <div key={type} className="groupItem">
        {!_.isEmpty(data) && <div className="Gray_75 Font13 groupTitle">{groupTitleList[type]}</div>}
        {data.map((item, index) => {
          return (
            <div className={cx('groupItemDetail flexRow', { borderTop: index === 0 })} key={item.id}>
              <div
                className="flex flexRow"
                onClick={() => {
                  safeLocalStorageSetItem(
                    'currentGroupInfo',
                    JSON.stringify({ id: item.id, groupType: item.groupType }),
                  );
                  window.mobileNavigateTo(`/mobile/groupAppList/${item.id}/${item.groupType}`);
                }}
              >
                <div className="groupItemIcon">
                  {item.iconUrl ? (
                    <SvgIcon url={item.iconUrl} fill="#9d9d9d" size={20} addClassName="mTop16" />
                  ) : (
                    <Icon className="Gray_9d Font20" icon={item.icon} />
                  )}
                </div>
                <div className={cx('groupItemName flex', { currentGroupLast: index === data.length - 1 })}>
                  {_.get(this.props.projectGroupsNameLang, `${item.id}.data[0].value`) || item.name}
                  {item.appIds && !_.isEmpty(item.appIds) && (
                    <span className="Gray_9e Font17 mLeft10">{item.appIds.length}</span>
                  )}
                </div>
              </div>
              <div className={cx('space', { currentGroupLast: index === data.length - 1 })}></div>
              <div
                className={cx('markedGroup', { currentGroupLast: index === data.length - 1 })}
                onClick={() => {
                  this.props.dispatch(
                    actions.markedGroup({ ...item, projectId: this.state.projectId, isMarked: !item.isMarked }),
                  );
                }}
              >
                <Icon icon="h5_star" className="Font20" style={{ color: item.isMarked ? '#ffc400' : '#9e9e9e' }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  render() {
    const { myAppData = {} } = this.props;
    const { markedGroup = [], personalGroups = [], projectGroups = [] } = myAppData;
    return (
      <div className="appGroupList">
        {!_.isEmpty(markedGroup) && this.renderlist(markedGroup, 'markedGroup')}
        {!_.isEmpty(personalGroups) && this.renderlist(personalGroups, 'personalGroups')}
        {!_.isEmpty(projectGroups) && this.renderlist(projectGroups, 'projectGroups')}
        <Back
          icon="home"
          onClick={() => {
            window.mobileNavigateTo('/mobile/dashboard');
          }}
        />
      </div>
    );
  }
}
export default connect(state => {
  const { isHomeLoading, myAppData, projectGroupsNameLang } = state.mobile;
  return {
    myAppData,
    isHomeLoading,
    projectGroupsNameLang,
  };
})(AppGroupList);
