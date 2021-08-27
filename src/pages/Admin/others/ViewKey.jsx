import React, { Component, Fragment } from 'react';
import { Dialog } from 'ming-ui';
import AuthorizationController from 'src/api/authorization';
import ClipboardButton from 'react-clipboard.js';

export default class ViewKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      appKey: '',
      secretKey: '',
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
        type: res.type,
      });
    });
  }

  handleChangeVisible(value) {
    this.setState({
      visible: value,
    });
  }

  updateKey() {
    AuthorizationController.addAuthorization({
      projectId: this.props.projectId,
      type: this.state.type,
    }).then(res => {
      if (res) {
        alert(_l('操作成功'));
        this.setState({
          appKey: res.appKey,
          secretKey: res.secretKey,
          type: res.type,
          visible: false,
        });
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  }

  handleCopyTextSuccess() {
    alert(_l('复制成功'));
  }

  render() {
    const { visible, appKey, secretKey } = this.state;
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
            onOk={() => this.updateKey()}
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
              <div className="keyLabel">AppKey</div>
              <div className="subLabel">{appKey}</div>
              <div className="keyLabel mTop24">SecretKey</div>
              <div className="subLabel">
                {secretKey}
                <ClipboardButton
                  className="mLeft22"
                  component="span"
                  data-clipboard-text={secretKey}
                  onSuccess={this.handleCopyTextSuccess.bind(this)}
                >
                  <button type="button" className="ming Button Button--link ThemeColor3 adminHoverColor">
                    {_l('复制')}
                  </button>
                </ClipboardButton>
              </div>
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
