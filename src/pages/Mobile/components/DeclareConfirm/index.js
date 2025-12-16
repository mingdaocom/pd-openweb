import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import { Button, CenterPopup, Popup, SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import styled from 'styled-components';
import DialogBase from 'ming-ui/components/Dialog/DialogBase';
import privateLegalApi from 'src/api/privateLegal';
import { browserIsMobile } from 'src/utils/common';

const Con = styled.div`
  text-align: left;

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
  .DialogButton {
    width: auto;
    height: 36px;
    border-radius: 3px;
    font-weight: 700 !important;
    font-size: 14px !important;
    padding: 0 32px !important;
    &.reject {
      color: #757575;
      background-color: #fff;
      &:hover {
        color: #1e88e5;
        background-color: #f5f5f5;
      }
    }
    border: none;
  }
`;

const declareConfirm = Component => {
  class DeclareConfirm extends React.Component {
    constructor(props) {
      super(props);
      const { enableDeclareConfirm } = md.global.SysSettings;
      this.state = {
        loading: enableDeclareConfirm,
        confirm: enableDeclareConfirm,
        reject: false,
        declareId: null,
        type: null,
        declareModal: false,
      };
    }
    componentDidMount() {
      const { confirm } = this.state;
      if (confirm) {
        privateLegalApi.getDeclareByAcountId().then(declareId => {
          if (declareId) {
            this.setState({
              declareId: declareId,
            });
          } else {
            this.setState({ confirm: false });
          }
          this.setState({ loading: false });
        });
      }
    }
    handleOpenModal = event => {
      const { target } = event;
      if (target.className.includes('agreement')) {
        this.setState({ declareModal: true, type: 'agreement' });
      }
      if (target.className.includes('privacy')) {
        this.setState({ declareModal: true, type: 'privacy' });
      }
    };
    handleAgree = () => {
      const { declareId } = this.state;
      privateLegalApi
        .addDeclareAgreeLog({
          declareId,
        })
        .then(data => {
          if (data) {
            this.setState({ confirm: false });
          }
        });
    };
    renderDeclare() {
      const { type, declareModal } = this.state;
      const title = {
        agreement: _l('服务协议'),
        privacy: _l('隐私政策'),
      };
      const url = {
        agreement: 'terms',
        privacy: 'privacy',
      };
      return (
        <CenterPopup
          style={{ '--min-width': '90%' }}
          visible={declareModal}
          onMaskClick={() => {
            this.setState({ declareModal: false });
          }}
          getContainer={() => document.body}
          title={title[type]}
          footer={[
            {
              text: _l('关闭'),
              onPress: () => {
                this.setState({ declareModal: false });
              },
            },
          ]}
        >
          <div
            style={{ height: document.body.clientHeight - 200, color: 'initial', borderRadius: 10, overflow: 'hidden' }}
          >
            <iframe
              className="w100 h100"
              style={{ border: 'none' }}
              src={`${md.global.Config.WebUrl}legalportal/${url[type]}?hideHeader=1`}
            />
          </div>
        </CenterPopup>
      );
    }
    renderConfirm() {
      const { reject } = this.state;
      const isMobile = browserIsMobile();
      return (
        <Con className="pAll20">
          <DocumentTitle title={_l('用户服务协议和隐私政策')} />
          {reject ? (
            <Fragment>
              <div className={cx('bold Gray  mBottom10', isMobile ? 'Font16' : 'Font17')}>
                {_l('用户服务协议和隐私政策')}
              </div>
              <div className="Gray Font14">
                {_l('您拒绝了我们的用户服务协议和隐私政策，很遗憾无法继续提供服务！请手动关闭页面后退出。')}
              </div>
              <div className={cx(!isMobile ? 'mTop40 TxtRight' : 'flexRow mTop20')}>
                <Button
                  className={cx('bold mRight20 alreadyReject', { DialogButton: !isMobile })}
                  color="default"
                  size="small"
                  inline
                >
                  {_l('已拒绝')}
                </Button>
                <Button
                  className={cx('bold flex agree', { DialogButton: !isMobile })}
                  color="primary"
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
              <div className={cx('bold Gray mBottom10', isMobile ? 'Font16' : 'Font17')}>
                {_l('用户服务协议和隐私政策')}
              </div>
              <div
                className="Gray Font14"
                onClick={this.handleOpenModal}
                dangerouslySetInnerHTML={{
                  __html: _l(
                    '为了更好保护您的个人信息安全，在使用我们的产品前请仔细阅读并同意我们的%0和%1，我们将严格保护您的个人信息和合法权益。',
                    `<a class="agreement">${_l('《用户服务协议》')}</a>`,
                    `<a class="privacy">${_l('《隐私政策》')}</a>`,
                  ),
                }}
              ></div>
              <div className={cx(!isMobile ? 'mTop40 TxtRight' : 'flexRow mTop20')}>
                <Button
                  className={cx('bold mRight20 reject', { DialogButton: !isMobile })}
                  color="default"
                  size="small"
                  inline
                  onClick={() => {
                    this.setState({ reject: true });
                  }}
                >
                  {_l('拒绝')}
                </Button>
                <Button
                  className={cx('bold flex agree', { DialogButton: !isMobile })}
                  color="primary"
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
      const { loading, confirm } = this.state;

      if (loading) {
        return (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color="primary" />
          </div>
        );
      }

      if (confirm) {
        const isMobile = browserIsMobile();
        if (isMobile) {
          return (
            <Fragment>
              <Popup visible={true} onClose={() => {}}>
                {this.renderConfirm()}
              </Popup>
              {this.renderDeclare()}
            </Fragment>
          );
        } else {
          return (
            <>
              <DialogBase visible={true} width={500}>
                {this.renderConfirm()}
              </DialogBase>
              {this.renderDeclare()}
            </>
          );
        }
      }

      return <Component {...this.props} />;
    }
  }
  return DeclareConfirm;
};

const run = () => {
  return Component => declareConfirm(Component);
};

export default run(props => {
  return <Fragment>{props.children}</Fragment>;
});
