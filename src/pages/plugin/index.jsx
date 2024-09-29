import React from 'react';
import DocumentTitle from 'react-document-title';
import SideNav from './SideNav';
import { Route, Switch } from 'react-router-dom';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { emitter, getCurrentProject } from 'src/util';
import PluginComponent from './pluginComponent';
import _ from 'lodash';
import Assistant from './assistant';
import KnowledgeBase from './knowledgeBase';
import { navigateTo } from 'src/router/navigateTo';
import { getFeatureStatus, upgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { getMyPermissions } from 'src/components/checkPermission';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { PLUGIN_TYPE } from './config';

export default class PluginContainer extends React.Component {
  constructor(props) {
    super(props);

    const projectInfo = this.getProjectInfo();
    const { projectId = '', companyName } = projectInfo;

    this.state = {
      currentProjectId: projectId,
      currentProjectName: companyName,
      myPermissions: [],
    };
  }

  componentDidMount() {
    $('html').addClass('plugin');
    this.loadPermissions();
    emitter.addListener('CHANGE_CURRENT_PROJECT', this.loadPermissions);
  }

  componentWillUnmount() {
    $('html').removeClass('plugin');
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
    const { projectId = '', companyName } = projectInfo;
    const myPermissions = getMyPermissions(projectId);
    this.setState({
      currentProjectId: projectInfo.projectId,
      currentProjectName: companyName,
      myPermissions,
    });
  };

  render() {
    const { match = { params: {} } } = this.props;
    const { type = '' } = match.params;
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
    const featureType = getFeatureStatus(currentProjectId, VersionProductType.assistant);
    const noAssistantAuth =
      !hasPermission(myPermissions, PERMISSION_ENUM.MANAGE_PLUGINS) || !featureType || featureType === '2';

    if (!hasPluginAuth) {
      return upgradeVersionDialog({
        dialogType: 'content',
        removeFooter: true,
        hint: _l('未启用插件中心'),
        explainText: '',
        projectId: currentProjectId,
      });
    }

    if (noAssistantAuth) {
      if (['assistant', 'knowledgeBase'].includes(type)) {
        navigateTo('/plugin/view');
        return '';
      }
    }

    return (
      <div className="flexRow h100">
        <DocumentTitle title={_l('插件中心')} />
        <SideNav {...param} noAssistantAuth={noAssistantAuth} />
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
              <Route path="/plugin/assistant" component={() => <Assistant {...param} />} />
              <Route path="/plugin/knowledgeBase" component={() => <KnowledgeBase {...param} />} />
              <Route path="*" component={() => <PluginComponent {...param} myPermissions={myPermissions} />} exact />
            </Switch>
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}
