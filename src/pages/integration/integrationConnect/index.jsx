import React from 'react';
import DocumentTitle from 'react-document-title';
import ConnectWrap from 'src/pages/integration/containers/ConnectWrap/index.jsx';
import { LoadDiv } from 'ming-ui';
export default class IntegrationConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCreateCustomBtn: false,
      loading: true,
    };
  }

  componentDidMount() {
    $('html').addClass('integrationConnect');
    this.getIsSuperAdmin();
  }

  componentWillUnmount() {
    $('html').removeClass('integrationConnect');
  }

  getIsSuperAdmin = () => {
    const { match = {} } = this.props;
    const { params = {} } = match;
    let projectId = params.projectId || localStorage.getItem('currentProjectId');
    safeLocalStorageSetItem('currentProjectId', projectId);
    const projectInfo = md.global.Account.projects.find(o => o.projectId === projectId) || {};
    this.setState({ isSuperAdmin: projectInfo.isSuperAdmin || projectInfo.isProjectAppManager, loading: false });
  };

  render() {
    if (this.state.loading) {
      return <LoadDiv />;
    }
    return (
      <div className="Con">
        <DocumentTitle title={_l('集成中心')} />
        <ConnectWrap {...this.props} isSuperAdmin={this.state.isSuperAdmin} forPage />
      </div>
    );
  }
}
