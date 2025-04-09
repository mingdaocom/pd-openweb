import React from 'react';
import DocumentTitle from 'react-document-title';
import SideNav from './SideNav';
import { Route, Switch } from 'react-router-dom';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { emitter, getCurrentProject } from 'src/util';
import PluginComponent from './pluginComponent';
import _ from 'lodash';
import { getRequest } from 'src/util';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { getMyPermissions } from 'src/components/checkPermission';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { PLUGIN_TYPE } from './config';

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
    const projectInfo = !_.isEmpty(getCurrentProject(initProjectId || localStorage.getItem('currentProjectId')))
      ? getCurrentProject(initProjectId || localStorage.getItem('currentProjectId'))
      : _.get(md, 'global.Account.projects.0');
    return projectInfo || {};
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
                path="/plugin/view"
                component={() => <PluginComponent {...param} myPermissions={myPermissions} />}
              />
              <Route
                path="/plugin/node"
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
