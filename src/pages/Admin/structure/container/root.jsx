import React from 'react';
import SearchBox from '../components/search/searchBox';
import { connect } from 'react-redux';

import ToolBar from '../components/tools/tool';
import UserList from '../components/userList/userList';
import DepOrjobTab from '../components/depOrJopTab';
import TabList from '../components/tabList';
import { Icon, ScrollView, Tooltip } from 'ming-ui';
import DialogSettingInviteRules from 'src/pages/Admin/structure/modules/dialogSettingInviteRules/inde.jsx';
import { updateType } from '../actions/current';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialogSettingInviteRules: false,
    };
  }

  setValue = ({ showDialogSettingInviteRules, ischage }) => {
    const { dispatch } = this.props;
    this.setState({
      showDialogSettingInviteRules: showDialogSettingInviteRules,
    });
    if (ischage) {
      dispatch(updateType(0));
    }
  };

  render() {
    return (
      <React.Fragment>
        <div className="adminStructureBox">
          <div className="adminStructure">
            <div className="structureHeader">
              <span className="Gray Font17">{_l('人员与部门')}</span>
              <Tooltip text={<span>{_l('人员加入规则设置')}</span>} action={['hover']}>
                <Icon
                  className="Font16 Gray_bd mLeft8 Hand"
                  icon="settings"
                  onClick={e => {
                    this.setState({
                      showDialogSettingInviteRules: !this.state.showDialogSettingInviteRules,
                    });
                  }}
                />
              </Tooltip>
              {/* 头部右侧操作 +成员/倒入/导出/邀请 */}
              <ToolBar />
            </div>
            <div className="mainBox">
              <div className="structureNavigator">
                {/* 搜索成员 */}
                <SearchBox />
                {/* 部门/职位 */}
                <DepOrjobTab />
                {/* 创建职位/创建部门及固定分类*/}
                <TabList />
              </div>
              <div className="structureContent">
                {/* 右侧成员列表（成员list) */}
                <UserList />
              </div>
            </div>
          </div>
        </div>
        {this.state.showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={this.state.showDialogSettingInviteRules}
            setValue={this.setValue}
            projectId={this.props.projectId}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { current } = state;
  const { projectId } = current;
  return {
    projectId,
  };
};

const connectedJopList = connect(mapStateToProps)(Root);

export default connectedJopList;
