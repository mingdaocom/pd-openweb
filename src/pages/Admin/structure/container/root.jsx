import React, { Fragment } from 'react';
import { Tooltip, Icon } from 'ming-ui';
import SearchBox from '../components/search/searchBox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/entities';
import TabList from '../components/tabList';
import StructureContent from '../components/structureContent';
import ImportAndExport from '../components/structureContent/ImportAndExport';
import ImportDepAndPosition from '../components/structureContent/ImportDepAndPosition';
import DialogSettingInviteRules from '../modules/dialogSettingInviteRules/inde.jsx';

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
    const { isShowExport, importExportType } = this.props;
    const { showDialogSettingInviteRules } = this.state;
    return (
      <Fragment>
        <div className="adminStructureBox">
          {!isShowExport && (
            <div className="adminStructureContent flexRow">
              <div className="adminStructure">
                <div className="structureNavigator">
                  <div className="Bold Font15 mBottom20 pLeft24">
                    {_l('人员与部门')}
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
  bindActionCreators({ ..._.pick(actions, ['updateShowExport']) }, dispatch),
)(Root);

export default connectedJopList;
