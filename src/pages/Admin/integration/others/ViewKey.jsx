import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import { Dialog, VerifyPasswordConfirm } from 'ming-ui';
import AuthorizationController from 'src/api/authorization';

export default class ViewKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      appKey: '',
      secretKey: '',
      sign: '',
      type: null,
    };
  }

  componentDidMount() {
    this.getSecretKey();
  }

  getSecretKey() {
    AuthorizationController.getAuthorizationByType({
      projectId: this.props.projectId,
      type: 1,
    }).then(([res = {}]) => {
      this.setState({
        appKey: res.appKey,
        secretKey: res.secretKey,
        sign: res.sign,
        type: res.type,
      });
    });
  }

  handleChangeVisible(value) {
    this.setState({
      visible: value,
    });
  }

  updateKey = () => {
    AuthorizationController.addAuthorization({
      projectId: this.props.projectId,
      type: this.state.type,
    }).then(({ appKey, secretKey, sign, type }) => {
      if (appKey && secretKey && sign) {
        alert(_l('操作成功'));
        this.setState({
          visible: false,
          appKey,
          secretKey,
          sign,
          type,
        });
        this.props.handleChangeVisible(true);
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };

  render() {
    const { visible } = this.state;

    return (
      <Fragment>
        {visible ? (
          <Dialog
            visible={visible}
            title={<span className="updateTitle">{_l('确定要重新生成？')}</span>}
            cancelText={_l('取消')}
            okText={_l('确定')}
            width="480"
            overlayClosable={false}
            onCancel={() => {
              this.handleChangeVisible(false);
            }}
            onOk={() => VerifyPasswordConfirm.confirm({ onOk: this.updateKey })}
          >
            <div className="subLabel">{_l('重新生成将会影响到已经使用该密钥信息的服务，请确认操作')}</div>
          </Dialog>
        ) : (
          <Dialog
            visible={this.props.visible}
            title={<span>{_l('查看密钥')}</span>}
            width="480"
            footer={null}
            overlayClosable={false}
            onCancel={() => {
              this.props.handleChangeVisible(false);
            }}
          >
            <div className="keyBox">
              {[
                { text: 'AppKey', key: 'appKey' },
                { text: 'SecretKey', key: 'secretKey' },
                { text: _l('Sign（注：只针对应用下的接口生效，其他依然使用企业授权模式）'), key: 'sign' },
              ].map((item, index) => {
                return (
                  <Fragment key={index}>
                    <div className={cx('keyLabel', { mTop24: index !== 0 })}>{item.text}</div>
                    <div className="subLabel flexRow mTop5">
                      <div className="Gray_75 breakAll">{this.state[item.key]}</div>
                      <span
                        className="ThemeColor3 ThemeHoverColor2 mLeft15 pointer"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => {
                          copy(this.state[item.key]);
                          alert(_l('已复制到剪切板'));
                        }}
                      >
                        {_l('复制')}
                      </span>
                    </div>
                  </Fragment>
                );
              })}
              <div>
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 mTop16 adminHoverColor"
                  onClick={this.handleChangeVisible.bind(this, true)}
                >
                  {_l('重新生成')}
                </button>
              </div>
            </div>
          </Dialog>
        )}
      </Fragment>
    );
  }
}
