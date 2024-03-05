import React, { Fragment } from 'react';
import { Flex, Button, Modal, ActivityIndicator } from 'antd-mobile';
import { RichText } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import styled from 'styled-components';
import privateDeclare from 'src/api/privateDeclare';

const Con = styled.div`
  text-align: left;
  padding: 20px;

  a {
    text-decoration: none;
  }
  .reject {
    width: 100px;
    color: #0097ef;
    background-color: #f5f5f5;
    ::before {
      border-color: #f5f5f5 !important;
    }
  }
  .alreadyReject {
    width: 100px;
    color: red;
    background-color: #ffe9e7;
    ::before {
      border-color: #ffe9e7 !important;
    }
  }
  .agree {
    color: #fff;
    background-color: #0097ef;
    ::before {
      border-color: #0097ef !important;
    }
  }
  .am-button-small {
    height: 35px;
    line-height: 35px;
  }
`;

const DeclareModal = styled(Modal)`
  width: 90% !important;
`

const declareConfirm = (Component) => {
  class DeclareConfirm extends React.Component {
    constructor(props) {
      super(props);
      const { enableDeclareConfirm } = md.global.SysSettings;
      this.state = {
        loading: enableDeclareConfirm,
        confirm: enableDeclareConfirm,
        reject: false,
        declareData: null,
        type: null,
        declareModal: false
      }
    }
    componentDidMount() {
      const { confirm } = this.state;
      if (confirm) {
        privateDeclare.getDeclareByAcountId().then(data => {
          if (data && data.declareId) {
            this.setState({
              declareData: data
            });
          } else {
            this.setState({ confirm: false });
          }
          this.setState({ loading: false });
        });
      }
    }
    handleOpenModal = (event) => {
      const { target } = event;
      if (target.className.includes('agreement')) {
        this.setState({ declareModal: true, type: 'agreement' });
      }
      if (target.className.includes('privacy')) {
        this.setState({ declareModal: true, type: 'privacy' });
      }
    }
    handleAgree = () => {
      const { declareData } = this.state;
      privateDeclare.addDeclareAgreeLog({
        declareId: declareData.declareId
      }).then(data => {
        if (data) {
          this.setState({ confirm: false });
        }
      });
    }
    renderDeclare() {
      const { type, declareModal, declareData } = this.state;
      const title = {
        agreement: _l('服务协议'),
        privacy: _l('隐私政策')
      }
      return (
        <DeclareModal
          visible={declareModal}
          transparent
          onClose={() => {
            this.setState({ declareModal: false });
          }}
          title={title[type]}
          footer={[{ text: _l('关闭'), onPress: () => { this.setState({ declareModal: false }); } }]}
        >
          <div style={{ height: document.body.clientHeight - 200, overflowY: 'auto', color: 'initial' }}>
            {declareData && (
              <RichText
                data={declareData[type]}
                disabled={true}
                showTool={false}
              />
            )}
          </div>
        </DeclareModal>
      );
    }
    renderConfirm() {
      const { reject } = this.state;
      return (
        <Con>
          <DocumentTitle title={_l('用户服务协议和隐私政策')} />
          {reject ? (
            <Fragment>
              <div className="bold Gray Font16 mBottom10">{_l('用户服务协议和隐私政策')}</div>
              <div className="Gray Font14">{_l('您拒绝了我们的用户服务协议和隐私政策，很遗憾无法继续提供服务！请手动关闭页面后退出。')}</div>
              <div className="flexRow mTop20">
                <Button className="bold mRight20 alreadyReject" type="default" size="small" inline>{_l('已拒绝')}</Button>
                <Button
                  className="bold flex agree"
                  type="primary"
                  size="small"
                  inline
                  onClick={() => {
                    this.setState({ reject: false });
                  }}
                >
                  {_l('再次查看')}
                </Button>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="bold Gray Font16 mBottom10">{_l('用户服务协议和隐私政策')}</div>
              <div
                className="Gray Font14"
                onClick={this.handleOpenModal}
                dangerouslySetInnerHTML={{
                  __html: _l('为了更好保护您的个人信息安全，在使用我们的产品前请仔细阅读并同意我们的%0和%1，我们将严格保护您的个人信息和合法权益。', `<a class="agreement">${_l('《用户服务协议》')}</a>`, `<a class="privacy">${_l('《隐私政策》')}</a>`)
                }}>
              </div>
              <div className="flexRow mTop20">
                <Button
                  className="bold mRight20 reject"
                  type="default"
                  size="small"
                  inline
                  onClick={() => {
                    this.setState({ reject: true });
                  }}
                >
                  {_l('拒绝')}
                </Button>
                <Button
                  className="bold flex agree"
                  type="primary"
                  size="small"
                  inline
                  onClick={this.handleAgree}
                >
                  {_l('同意并继续')}
                </Button>
              </div>
            </Fragment>
          )}
        </Con>
      );
    }
    render() {
      const { loading, reject, confirm } = this.state;

      if (loading) {
        return (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        )
      }

      if (confirm) {
        return (
          <Fragment>
            <Modal
              popup
              visible={true}
              onClose={() => {}}
              animationType="slide-up"
              afterClose={() => {  }}
            >
              {this.renderConfirm()}
            </Modal>
            {this.renderDeclare()}
          </Fragment>
        )
      }

      return <Component {...this.props} />;
    }
  }
  return DeclareConfirm;
}

const run = (Component) => {
  return Component => declareConfirm(Component);
}

export default run((props) => {
  return <Fragment>{props.children}</Fragment>;
});
