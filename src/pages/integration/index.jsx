import React from 'react';
import DocumentTitle from 'react-document-title';
import Sidenav from './containers/Sidenav';
import { Route, Switch, Redirect } from 'react-router-dom';
import ConnectAndAuth from './containers/ConnectAndAuth';
import APICon from './containers/APICon';
import ErrorBoundary from 'src/ming-ui/components/ErrorWrapper';
import { emitter, getProject } from 'src/util';

export default class HubContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCreateCustomBtn: false,
      isSuperAdmin: false,
      currentProjectId: localStorage.getItem('currentProjectId'),
    };
  }

  componentDidMount() {
    $('html').addClass('integration');
    this.reload();
    emitter.addListener('CHANGE_CURRENT_PROJECT', this.reload);
  }

  componentWillUnmount() {
    $('html').removeClass('integration');
    emitter.removeListener('CHANGE_CURRENT_PROJECT', this.reload);
  }

  reload = () => {
    const projectInfo = getProject(localStorage.getItem('currentProjectId'));
    safeLocalStorageSetItem('currentProjectId', projectInfo.projectId);
    this.setState({
      isSuperAdmin: projectInfo.isSuperAdmin || projectInfo.isProjectAppManager,
      currentProjectId: projectInfo.projectId,
    });
  };

  render() {
    return (
      <div className="flexRow h100">
        <DocumentTitle title={_l('集成中心')} />
        <Sidenav {...this.props} />
        <div className="flex">
          <ErrorBoundary>
            <Switch>
              <Route
                path="/integration/connect"
                component={() => (
                  <ConnectAndAuth
                    {...this.props}
                    currentProjectId={this.state.currentProjectId}
                    isSuperAdmin={this.state.isSuperAdmin}
                  />
                )}
              />
              <Route
                path="/integration/api"
                component={() => (
                  <APICon
                    {...this.props}
                    currentProjectId={this.state.currentProjectId}
                    isSuperAdmin={this.state.isSuperAdmin}
                  />
                )}
              />
              <Route
                path="*"
                component={() => (
                  <ConnectAndAuth
                    {...this.props}
                    currentProjectId={this.state.currentProjectId}
                    isSuperAdmin={this.state.isSuperAdmin}
                  />
                )}
                exact
              />
            </Switch>
          </ErrorBoundary>
        </div>
      </div>
    );
  }
}
