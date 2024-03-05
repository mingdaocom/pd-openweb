import React from 'react';
import DocumentTitle from 'react-document-title';
import APIWrap from 'src/pages/integration/apiIntegration/APIWrap/index.jsx';
import styled from 'styled-components';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { Dialog, Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
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
    /**
     * 删除api
     */
    const onDel = async item => {
      const cite = await packageVersionAjax.getApiRelationList(
        {
          id: item.id,
          isPublic: true,
        },
        { isIntegration: true },
      );
      Dialog.confirm({
        title: (
          <span className="Red">
            {cite.length > 0 ? <Icon type="warning" className="mRight8" /> : ''}
            {_l('删除“%0”', item.name)}
          </span>
        ),
        description: (
          <div>
            {cite.length > 0 ? (
              <React.Fragment>
                <span className="Font14 Bold Gray">{_l('注意：当前API正在被组织内引用')}</span>
                <p className="Gray_75 Font14 mTop8">{_l('请务必确认引用位置不再需要此API，再执行此操作')}</p>
              </React.Fragment>
            ) : (
              _l('API 删除后将不可恢复，确认删除吗？')
            )}
          </div>
        ),
        buttonType: 'danger',
        onOk: () => {
          packageVersionAjax.deleteApi({ id: item.id }, { isIntegration: true }).then(res => {
            if (res) {
              alert(_l('删除成功'));
              navigateTo('/integration');
            }
          });
        },
      });
    };
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
          onDel={data => onDel(data)}
        />
      </Wrap>
    );
  }
}
