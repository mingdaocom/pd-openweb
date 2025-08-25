import React from 'react';
import { Route, Switch } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import { getMyPermissions } from 'src/components/checkPermission';
import { hasPermission } from 'src/components/checkPermission';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { integrationConfig } from 'src/pages/integration/config.js';
import { navigateTo } from 'src/router/navigateTo';
import { emitter } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { getCurrentProject } from 'src/utils/project';
import { getFeatureStatus } from 'src/utils/project';
import APILibrary from './apiIntegration';
import ConnectList from './apiIntegration/ConnectList';
import Connector from './dataIntegration/connector';
import DataMirror from './dataIntegration/dataMirror';
import DataSource from './dataIntegration/source';
import Stats from './dataIntegration/stats';
import SyncTask from './dataIntegration/task';
import TaskCon from './dataIntegration/TaskCon';
import Sidenav from './Sidenav';
import './svgIcon';

const ROUTE_CONFIG_PATH = {
  connectList: '/integration/connectList',
  dataConnect: '/integration/dataConnect',
  taskCon: '/integration/taskCon',
  task: '/integration/task',
  source: '/integration/source',
  dataMirror: '/integration/dataMirror',
  stats: '/integration/stats',
};
const TYPE_TO_COMP = {
  connectList: ConnectList,
  dataConnect: Connector,
  taskCon: TaskCon,
  task: SyncTask,
  source: DataSource,
  dataMirror: DataMirror,
  stats: Stats,
};
const ENABLE_DATAPIPELINE_KEYS = ['dataConnect', 'taskCon', 'task', 'source', 'dataMirror', 'stats'];

const getRoutes = param => {
  let components = [];
  _.keys(ROUTE_CONFIG_PATH).forEach((key, i) => {
    const path = ROUTE_CONFIG_PATH[key];
    const Component = TYPE_TO_COMP[key];
    const featureType = getFeatureStatus(param.currentProjectId, VersionProductType.dataMirror);
    const noRender = !featureType && key === 'dataMirror';
    if (!noRender) {
      components.push(
        <Route
          key={i}
          path={path}
          component={() => {
            return md.global.Config.IsLocal &&
              !md.global.Config.EnableDataPipeline &&
              ENABLE_DATAPIPELINE_KEYS.includes(key) ? (
              <div className="flexColumn alignItemsCenter justifyContentCenter h100">
                {upgradeVersionDialog({
                  hint: md.global.Config.IsPlatformLocal ? (
                    _l('数据集成服务未部署，暂不可用')
                  ) : (
                    <span>
                      {_l('数据集成服务未部署，请参考')}
                      <a href="https://docs-pd.mingdao.com/faq/integrate/flink" target="_blank">
                        {_l('帮助')}
                      </a>
                    </span>
                  ),
                  dialogType: 'content',
                })}
              </div>
            ) : (
              <Component {...param} />
            );
          }}
        />,
      );
    }
  });
  return components;
};

export default class HubContainer extends React.Component {
  constructor(props) {
    super(props);

    const projectInfo = this.getProjectInfo();

    this.state = {
      currentProjectId: projectInfo.projectId,
    };
  }

  componentDidMount() {
    $('html').addClass('integration');
    this.loadPermissions();
    emitter.addListener('CHANGE_CURRENT_PROJECT', this.loadPermissions);
  }

  componentWillUnmount() {
    $('html').removeClass('integration');
    emitter.removeListener('CHANGE_CURRENT_PROJECT', this.loadPermissions);
  }

  getProjectInfo = () => {
    const projectInfo = !_.isEmpty(getCurrentProject(localStorage.getItem('currentProjectId')))
      ? getCurrentProject(localStorage.getItem('currentProjectId'))
      : _.get(md, 'global.Account.projects.0');
    return projectInfo || {};
  };

  loadPermissions = () => {
    const projectInfo = this.getProjectInfo();
    this.setState({ currentProjectId: projectInfo.projectId });
  };

  render() {
    const { match = { params: {} } } = this.props;
    const { type = '' } = match.params;
    const info = integrationConfig.find(o => o.type === type) || {};
    const { currentProjectId } = this.state;
    const myPermissions = getMyPermissions(currentProjectId);
    const menuAuth = {
      noCreateTaskMenu: !hasPermission(myPermissions, PERMISSION_ENUM.CREATE_SYNC_TASK),
      noSyncTaskMenu:
        !hasPermission(myPermissions, PERMISSION_ENUM.CREATE_SYNC_TASK) &&
        !hasPermission(myPermissions, PERMISSION_ENUM.MANAGE_SYNC_TASKS),
      noSourceMenu:
        !hasPermission(myPermissions, PERMISSION_ENUM.CREATE_SYNC_TASK) &&
        !hasPermission(myPermissions, PERMISSION_ENUM.MANAGE_DATA_SOURCES),
      noMirrorMenu: !hasPermission(myPermissions, PERMISSION_ENUM.CREATE_SYNC_TASK),
      noStatsMenu: !hasPermission(myPermissions, PERMISSION_ENUM.CREATE_SYNC_TASK),
    };
    const param = {
      ...this.props,
      currentProjectId,
      myPermissions,
    };

    if ((type === 'dataMirror' && menuAuth.noMirrorMenu) || (type === 'stats' && menuAuth.noStatsMenu)) {
      navigateTo('/integration');
      return;
    }

    if (
      (type === 'dataConnect' && menuAuth.noCreateTaskMenu) ||
      (type === 'task' && menuAuth.noSyncTaskMenu) ||
      (type === 'source' && menuAuth.noSourceMenu)
    ) {
      const navigateLink = !menuAuth.noCreateTaskMenu
        ? '/integration/dataConnect'
        : !menuAuth.noSyncTaskMenu
          ? '/integration/task'
          : !menuAuth.noSourceMenu
            ? '/integration/source'
            : '/integration';
      navigateTo(navigateLink);
      return;
    }

    return (
      <div className="flexRow h100">
        <DocumentTitle title={!info.txt ? _l('集成') : `${_l('集成')}-${info.txt}`} />
        <Sidenav {...param} menuAuth={menuAuth} />
        <div className="flex overflowHidden">
          <ErrorBoundary>
            <Switch>
              {getRoutes(param)}
              <Route path="*" component={() => <APILibrary {...param} />} exact />
            </Switch>
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}
