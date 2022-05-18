import React, { Fragment } from 'react';
import SearchBox from '../components/search/searchBox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/entities';
import DepOrjobTab from '../components/depOrJopTab';
import TabList from '../components/tabList';
import { Icon, Tooltip } from 'ming-ui';
import DialogSettingInviteRules from 'src/pages/Admin/structure/modules/dialogSettingInviteRules/inde.jsx';
import { updateType } from '../actions/current';
import StructureContent from '../components/structureContent';
import ImportAndExport from '../components/structureContent/ImportAndExport';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialogSettingInviteRules: false,
    };
  }

  componentDidMount() {
    if (location.href.indexOf('importusers') > -1) {
      this.props.updateShowExport(true);
    }
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
    const { isShowExport } = this.props;
    return (
      <Fragment>
        <div className="adminStructureBox">
          {!isShowExport && (
            <div className="adminStructureContent flexRow">
              <div className="adminStructure">
                <div className="headerInfo">
                  <span className="Gray Font17 Bold">{_l('人员与部门')}</span>
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
                  {/* <ToolBar /> */}
                </div>
                <div className="structureNavigator">
                  {/* 搜索成员 */}
                  <SearchBox />
                  {/* 部门/职位 */}
                  <DepOrjobTab />
                  {/* 创建职位/创建部门及固定分类*/}
                  <TabList />
                </div>
              </div>
              <div className="structureContent flex">
                <StructureContent />
              </div>
            </div>
          )}

          {isShowExport && <ImportAndExport />}
        </div>
        {this.state.showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={this.state.showDialogSettingInviteRules}
            setValue={this.setValue}
            projectId={this.props.projectId}
          />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { current, entities } = state;
  const { projectId } = current;
  const { isShowExport } = entities;
  return {
    projectId,
    isShowExport,
  };
};

const connectedJopList = connect(mapStateToProps, dispatch =>
  bindActionCreators({ ..._.pick(actions, ['updateShowExport']) }, dispatch),
)(Root);

export default connectedJopList;
