import React from 'react';
import DocumentTitle from 'react-document-title';
import Sidenav from './Sidenav';
import { Route, Switch } from 'react-router-dom';
import APILibrary from './apiIntegration';
import ConnectList from './apiIntegration/ConnectList';
import APICon from './apiIntegration/APICon';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { emitter, getCurrentProject, upgradeVersionDialog } from 'src/util';
import Connector from './dataIntegration/connector';
import DataSource from './dataIntegration/source';
import SyncTask from './dataIntegration/task';
import TaskCon from './dataIntegration/TaskCon';
import { integrationConfig, dataIntegrationList } from 'src/pages/integration/config.js';
import './svgIcon';
import { navigateTo } from 'src/router/navigateTo';
import _ from 'lodash';

export default class HubContainer extends React.Component {
  constructor(props) {
    super(props);

    const projectInfo = this.getProjectInfo();
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

  getProjectInfo = () => {
    const projectInfo = !_.isEmpty(getCurrentProject(localStorage.getItem('currentProjectId')))
      ? getCurrentProject(localStorage.getItem('currentProjectId'))
      : _.get(md, 'global.Account.projects.0');
    return projectInfo || {};
  };

  reload = () => {
    const projectInfo = this.getProjectInfo();
    const { projectId = '', isSuperAdmin = false, isProjectAppManager = false } = projectInfo;

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
    if (!isSuperAdmin) {
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
            {md.global.Config.IsLocal && !md.global.Config.EnableDataPipeline ? (
              <Switch>
                <Route path="/integration/connectList" component={() => <ConnectList {...param} />} />
                <Route
                  path={`/integration/(dataConnect|taskCon|task|source)/`}
                  component={() => (
                    <div className="flexColumn alignItemsCenter justifyContentCenter h100">
                      {upgradeVersionDialog({
                        hint: md.global.Config.IsPlatformLocal ? (
                          _l('数据集成服务未部署，暂不可用')
                        ) : (
                          <span>
                            {_l('数据集成服务未部署，请参考')}
                            <a href="https://docs.pd.mingdao.com/faq/integrate/flink" target="_blank">
                              {_l('帮助')}
                            </a>
                          </span>
                        ),
                        dialogType: 'content',
                      })}
                    </div>
                  )}
                />
                <Route path="*" component={() => <APILibrary {...param} />} exact />
              </Switch>
            ) : (
              <Switch>
                <Route path="/integration/connectList" component={() => <ConnectList {...param} />} />
                <Route path="/integration/dataConnect" component={() => <Connector {...param} />} />
                <Route path="/integration/taskCon" component={() => <TaskCon {...param} />} />
                <Route path="/integration/task" component={() => <SyncTask {...param} />} />
                <Route path="/integration/source" component={() => <DataSource {...param} />} />
                <Route path="*" component={() => <APILibrary {...param} />} exact />
              </Switch>
            )}
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}
