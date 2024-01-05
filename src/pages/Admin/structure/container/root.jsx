import React, { Fragment } from 'react';
import { Tooltip, Icon } from 'ming-ui';
import SearchBox from '../components/search/searchBox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/entities';
import * as currentActions from '../actions/current';
import TabList from '../components/tabList';
import StructureContent from '../components/structureContent';
import ImportAndExport from '../components/structureContent/ImportAndExport';
import ImportDepAndPosition from '../components/structureContent/ImportDepAndPosition';
import DialogSettingInviteRules from '../modules/dialogSettingInviteRules/inde.jsx';
import _ from 'lodash';

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
    if (location.href.indexOf('isShowSetting') > -1) {
      this.setState({ showDialogSettingInviteRules: true });
    }
  }

  setValue = ({ showDialogSettingInviteRules, ischage }) => {
    this.setState({
      showDialogSettingInviteRules: showDialogSettingInviteRules,
    });
    if (ischage) {
      this.props.updateType(0);
    }
  };

  render() {
    const { isShowExport, importExportType } = this.props;
    const { showDialogSettingInviteRules } = this.state;
    return (
      <Fragment>
        <div className="adminStructureBox">
          {!isShowExport && (
            <div className="adminStructureContent flexRow">
              <div className="adminStructure">
                <div className="structureNavigator">
                  <div className="Bold Font17 mBottom20 pLeft24 pRight24 flexRow alignItemsCenter">
                    <div className="flex">
                      {_l('成员与部门')}
                      <Tooltip
                        text={
                          <span>
                            {_l(
                              '在工作表和工作流的汇报关系检索时，若所有下级部门总数超过2000（含），系统将默认仅获取当前部门的“一级子部门”所有部门',
                            )}
                          </span>
                        }
                        action={['hover']}
                      >
                        <Icon className="Font16 Gray_bd Hand mLeft8" icon="info_outline" />
                      </Tooltip>
                    </div>
                    <Tooltip text={<span>{_l('人员加入规则设置')}</span>} action={['hover']}>
                      <Icon
                        className="Font16 Gray_bd Hand mLeft8"
                        icon="settings"
                        onClick={e => {
                          this.setState({
                            showDialogSettingInviteRules: !showDialogSettingInviteRules,
                          });
                        }}
                      />
                    </Tooltip>
                  </div>
                  {/* 搜索成员 */}
                  <SearchBox />
                  {/* 创建职位/创建部门及固定分类*/}
                  <TabList />
                </div>
              </div>
              <div className="structureContent flex">
                <StructureContent />
              </div>
            </div>
          )}

          {isShowExport && (importExportType ? <ImportDepAndPosition /> : <ImportAndExport />)}
        </div>
        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
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
  const { isShowExport, importExportType } = entities;
  return {
    projectId,
    isShowExport,
    importExportType,
  };
};

const connectedJopList = connect(mapStateToProps, dispatch =>
  bindActionCreators({ ..._.pick({ ...actions, ...currentActions }, ['updateShowExport', 'updateType']) }, dispatch),
)(Root);

export default connectedJopList;
