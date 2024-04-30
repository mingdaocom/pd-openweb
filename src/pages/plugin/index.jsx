import React from 'react';
import DocumentTitle from 'react-document-title';
import SideNav from './SideNav';
import { Route, Switch } from 'react-router-dom';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { emitter, getCurrentProject } from 'src/util';
import ViewPlugin from './viewPlugin';
import _ from 'lodash';
import Assistant from './assistant';
import KnowledgeBase from './knowledgeBase';
import { navigateTo } from 'src/router/navigateTo';
import { getFeatureStatus, upgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';

export default class PluginContainer extends React.Component {
  constructor(props) {
    super(props);

    const projectInfo = this.getProjectInfo();
    const { projectId = '', isSuperAdmin = false, isProjectAppManager = false, companyName } = projectInfo;

    this.state = {
      showCreateCustomBtn: false,
      isAdmin: isSuperAdmin || isProjectAppManager,
      currentProjectId: projectId,
      currentProjectName: companyName,
    };
  }

  componentDidMount() {
    $('html').addClass('plugin');
    emitter.addListener('CHANGE_CURRENT_PROJECT', this.reload);
  }

  componentWillUnmount() {
    $('html').removeClass('plugin');
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
    const { projectId = '', isSuperAdmin = false, isProjectAppManager = false, companyName } = projectInfo;

    this.setState({
      isAdmin: isSuperAdmin || isProjectAppManager,
      currentProjectId: projectId,
      currentProjectName: companyName,
    });
  };

  render() {
    const { match = { params: {} } } = this.props;
    const { type = '' } = match.params;
    const { isAdmin, currentProjectId, currentProjectName } = this.state;
    const param = {
      ...this.props,
      currentProjectId,
      currentProjectName,
      isAdmin,
    };
    const featureType = getFeatureStatus(currentProjectId, VersionProductType.assistant);
    const allowPlugin = _.get(
      _.find(md.global.Account.projects, item => item.projectId === currentProjectId),
      'allowPlugin',
    );

    if (!allowPlugin) {
      return upgradeVersionDialog({
        dialogType: 'content',
        removeFooter: true,
        hint: _l('未启用插件中心'),
        explainText: '',
        projectId: currentProjectId,
      });
    }

    if (!isAdmin || !featureType || featureType === '2') {
      if (['assistant', 'knowledgeBase'].includes(type)) {
        navigateTo('/plugin/view');
        return '';
      }
    }

    return (
      <div className="flexRow h100">
        <DocumentTitle title={_l('插件中心')} />
        <SideNav {...param} />
        <div className="flex">
          <ErrorBoundary>
            <Switch>
              <Route path="/plugin/view" component={() => <ViewPlugin {...param} />} />
              <Route path="/plugin/assistant" component={() => <Assistant {...param} />} />
              <Route path="/plugin/knowledgeBase" component={() => <KnowledgeBase {...param} />} />
              <Route path="*" component={() => <ViewPlugin {...param} />} exact />
            </Switch>
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}
