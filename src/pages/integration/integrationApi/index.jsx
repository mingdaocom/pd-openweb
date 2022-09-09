import React from 'react';
import DocumentTitle from 'react-document-title';
import APIWrap from 'src/pages/integration/containers/APIWrap/index.jsx';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
const Wrap = styled.div`
  .apiCont {
    width: 100% !important;
    box-shadow: none !important;
    .tabCon {
      text-align: center;
    }
  }
`;
export default class IntegrationApi extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCreateCustomBtn: false,
      loading: true,
    };
  }

  componentDidMount() {
    $('html').addClass('integrationApi');
    this.getIsSuperAdmin();
  }

  componentWillUnmount() {
    $('html').removeClass('integrationApi');
  }

  getIsSuperAdmin = () => {
    const { match = {} } = this.props;
    const { params = {} } = match;
    let projectId = params.projectId;
    safeLocalStorageSetItem('currentProjectId', projectId);
    const projectInfo = md.global.Account.projects.find(o => o.projectId === projectId) || {};
    this.setState({ isSuperAdmin: projectInfo.isSuperAdmin || projectInfo.isProjectAppManager, loading: false });
  };

  render() {
    const { match = {} } = this.props;
    const { params = {} } = match;
    const { apiId } = params;
    if (this.state.loading) {
      return <LoadDiv />;
    }
    return (
      <Wrap className="Con">
        <DocumentTitle title={_l('集成中心')} />
        <APIWrap
          {...this.props}
          data={{}}
          isSuperAdmin={this.state.isSuperAdmin}
          connectInfo={null}
          onChange={null}
          listId={apiId}
          className="apiCont"
          forPage
        />
      </Wrap>
    );
  }
}
