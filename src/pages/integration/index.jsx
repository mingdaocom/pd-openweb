import React from 'react';
import DocumentTitle from 'react-document-title';
import Sidenav from './containers/Sidenav';
import { Route, Switch, Redirect } from 'react-router-dom';
import ConnectAndAuth from './containers/ConnectAndAuth';
import APICon from './containers/APICon';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { emitter, getProject } from 'src/util';
import Connector from './dataIntegration/connector';
import DataSource from './dataIntegration/source';
import SyncTask from './dataIntegration/task';
import TaskCon from './containers/TaskCon';
import { integrationConfig, dataIntegrationList } from 'src/pages/integration/config.js';
import './svgIcon';
import { navigateTo } from 'src/router/navigateTo';

export default class HubContainer extends React.Component {
  constructor(props) {
    super(props);

    const projectInfo = getProject(localStorage.getItem('currentProjectId')) || {};
    const { projectId = '', isSuperAdmin = false, isProjectAppManager = false } = projectInfo;

    this.state = {
      showCreateCustomBtn: false,
      isSuperAdmin: isSuperAdmin || isProjectAppManager,
      currentProjectId: projectId,
    };
  }

  componentDidMount() {
    $('html').addClass('integration');
    emitter.addListener('CHANGE_CURRENT_PROJECT', this.reload);
  }

  componentWillUnmount() {
    $('html').removeClass('integration');
    emitter.removeListener('CHANGE_CURRENT_PROJECT', this.reload);
  }

  reload = () => {
    const projectInfo = getProject(localStorage.getItem('currentProjectId')) || {};
    const { projectId = '', isSuperAdmin = false, isProjectAppManager = false } = projectInfo;

    safeLocalStorageSetItem('currentProjectId', projectId);
    this.setState({
      isSuperAdmin: isSuperAdmin || isProjectAppManager,
      currentProjectId: projectId,
    });
  };

  render() {
    const { match = { params: {} } } = this.props;
    const { type = '' } = match.params;
    const info = integrationConfig.find(o => o.type === type) || {};
    const { isSuperAdmin, currentProjectId } = this.state;
    const param = {
      ...this.props,
      currentProjectId,
      isSuperAdmin,
    };
    if (!isSuperAdmin || (md.global.Config.IsLocal && !md.global.Config.EnableDataPipeline)) {
      const dataIntegrationTypes = dataIntegrationList.map(o => o.type);
      if (dataIntegrationTypes.includes(type)) {
        navigateTo('/integration');
        return '';
      }
    }

    return (
      <div className="flexRow h100">
        <DocumentTitle title={!info.txt ? _l('集成中心') : `${_l('集成中心')}-${info.txt}`} />
        <Sidenav {...param} />
        <div className="flex">
          <ErrorBoundary>
            <Switch>
              <Route path="/integration/connect" component={() => <ConnectAndAuth {...param} />} />
              <Route path="/integration/api" component={() => <APICon {...param} />} />
              <Route path="/integration/dataConnect" component={() => <Connector {...param} />} />
              <Route path="/integration/taskCon" component={() => <TaskCon {...param} />} />
              <Route path="/integration/task" component={() => <SyncTask {...param} />} />
              <Route path="/integration/source" component={() => <DataSource {...param} />} />
              <Route path="*" component={() => <ConnectAndAuth {...param} />} exact />
            </Switch>
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}
