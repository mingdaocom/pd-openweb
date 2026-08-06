import React from 'react';
import { Route, Switch } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import { getMyPermissions } from 'src/components/checkPermission';
import { hasPermission } from 'src/components/checkPermission';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { addSubPathOfRoute, emitter, getRequest } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import { PLUGIN_TYPE } from './config';
import PluginComponent from './pluginComponent';
import SideNav from './SideNav';

export default class PluginContainer extends React.Component {
  constructor(props) {
    super(props);

    const request = getRequest();
    const projectInfo = this.getProjectInfo(request.projectId);
    const { projectId = '', companyName } = projectInfo;

    this.state = {
      currentProjectId: projectId,
      currentProjectName: companyName,
      myPermissions: [],
    };
  }

  componentDidMount() {
    const request = getRequest();
    $('html').addClass('plugin');
    this.loadPermissions(request.projectId);
    emitter.addListener('CHANGE_CURRENT_PROJECT', () => this.loadPermissions());
  }

  componentWillUnmount() {
    $('html').removeClass('plugin');
    emitter.removeListener('CHANGE_CURRENT_PROJECT', () => this.loadPermissions());
  }

  getProjectInfo = initProjectId => {
    const currentProject = getCurrentProject(initProjectId || localStorage.getItem('currentProjectId'));
    return (!_.isEmpty(currentProject) ? currentProject : _.get(md, 'global.Account.projects.0')) || {};
  };

  loadPermissions = initProjectId => {
    const projectInfo = this.getProjectInfo(initProjectId);
    const { projectId = '', companyName } = projectInfo;
    const myPermissions = getMyPermissions(projectId);
    this.setState({
      currentProjectId: projectInfo.projectId,
      currentProjectName: companyName,
      myPermissions,
    });
  };

  render() {
    const { currentProjectId, currentProjectName, myPermissions } = this.state;
    const param = {
      ...this.props,
      currentProjectId,
      currentProjectName,
      myPermissions,
    };
    const hasPluginAuth =
      _.get(
        _.find(md.global.Account.projects, item => item.projectId === currentProjectId),
        'allowPlugin',
      ) || hasPermission(myPermissions, [PERMISSION_ENUM.DEVELOP_PLUGIN, PERMISSION_ENUM.MANAGE_PLUGINS]);

    if (!hasPluginAuth) {
      return upgradeVersionDialog({
        dialogType: 'content',
        removeFooter: true,
        hint: _l('未启用插件中心'),
        explainText: '',
        projectId: currentProjectId,
      });
    }

    return (
      <div className="flexRow h100">
        <DocumentTitle title={_l('插件')} />
        <SideNav {...param} />
        <div className="flex">
          <ErrorBoundary>
            <Switch>
              <Route
                path={addSubPathOfRoute('/plugin/view')}
                component={() => <PluginComponent {...param} myPermissions={myPermissions} />}
              />
              <Route
                path={addSubPathOfRoute('/plugin/node')}
                component={() => (
                  <PluginComponent {...param} myPermissions={myPermissions} pluginType={PLUGIN_TYPE.WORKFLOW} />
                )}
              />
              <Route path="*" component={() => <PluginComponent {...param} myPermissions={myPermissions} />} exact />
            </Switch>
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}
