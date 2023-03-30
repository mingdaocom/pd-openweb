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
  }

  componentDidMount() {
    $('html').addClass('integrationApi');
  }

  componentWillUnmount() {
    $('html').removeClass('integrationApi');
  }

  render() {
    const { match = {} } = this.props;
    const { params = {} } = match;
    const { apiId } = params;
    return (
      <Wrap className="Con">
        <DocumentTitle title={_l('集成中心')} />
        <APIWrap
          {...this.props}
          data={{}}
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
