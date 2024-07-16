import React, { Fragment } from 'react';
import SearchBox from '../components/search/searchBox';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/entities';
import * as currentActions from '../actions/current';
import TabList from '../components/tabList';
import StructureContent from '../components/structureContent';
import ImportAndExport from '../components/structureContent/ImportAndExport';
import ImportDepAndPosition from '../components/structureContent/ImportDepAndPosition';
import _ from 'lodash';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (location.href.indexOf('importusers') > -1) {
      this.props.updateShowExport(true);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isShowExport !== this.props.isShowExport) {
      nextProps.handleShowHeader(!nextProps.isShowExport);
    }
  }

  render() {
    const { isShowExport, importExportType, authority = [] } = this.props;

    return (
      <Fragment>
        <div className="adminStructureBox">
          {!isShowExport && (
            <div className="adminStructureContent flexRow">
              <div className="structureNavigator">
                {/* 搜索成员 */}
                <SearchBox />
                {/* 创建职位/创建部门及固定分类*/}
                <TabList />
              </div>
              <div className="structureContent flex">
                <StructureContent authority={authority} />
              </div>
            </div>
          )}

          {isShowExport && (importExportType ? <ImportDepAndPosition /> : <ImportAndExport />)}
        </div>
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
