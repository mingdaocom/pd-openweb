import React, { Component, Fragment } from 'react';
import { Dialog, Input, Checkbox } from 'ming-ui';
import RegExp from 'src/util/expression';
import emailApi from 'src/api/email';

export default class EmailDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signature: '',
      fromAddress: '',
      server: '',
      account: '',
      port: '',
      enableSsl: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEmpty(nextProps.emailConfig)) {
      this.setState({
        ...nextProps.emailConfig,
      });
    }
  }
  handleSave = () => {
    const { signature, fromAddress, server, account, password, port, enableSsl } = this.state;

    if (_.isEmpty(signature)) {
      alert(_l('请输入签名'), 3);
      return;
    }

    if (_.isEmpty(fromAddress)) {
      alert(_l('请输入邮箱'), 3);
      return;
    } else if (!RegExp.isEmail(fromAddress)) {
      alert(_l('邮箱格式错误'), 3);
      return;
    }

    if (_.isEmpty(server)) {
      alert(_l('请输入服务器地址'), 3);
      return;
    }

    const data = {
      signature,
      fromAddress,
      server,
      account,
      password,
      port,
      enableSsl,
    }

    emailApi
      .editSmtpSecret(data)
      .then(result => {
        if (result) {
          alert(_l('修改成功'));
          this.props.onCancel();
          this.props.onChange(data);
        }
      });
  };
  render() {
    const { visible } = this.props;
    const { signature, fromAddress, server, account, password, port, enableSsl } = this.state;
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={_l('邮件服务设置')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('签名')}</div>
          <Input
            value={signature}
            onChange={value => {
              this.setState({ signature: value });
            }}
          />
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('发送邮箱')}</div>
          <Input
            className="w100"
            value={fromAddress}
            onChange={value => {
              this.setState({ fromAddress: value });
            }}
          />
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('服务器')}</div>
          <Input
            className="w100"
            value={server}
            onChange={value => {
              this.setState({ server: value });
            }}
          />
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('账号')}</div>
          <Input
            className="w100"
            value={account}
            onChange={value => {
              this.setState({ account: value });
            }}
          />
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('密码')}</div>
          <Input
            className="w100"
            value={password}
            onChange={value => {
              this.setState({ password: value });
            }}
            type="password"
          />
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('端口')}</div>
          <Input
            value={port}
            onChange={value => {
              this.setState({ port: value });
            }}
          />
        </div>
        <div className="mtop10">
          <Checkbox
            checked={enableSsl}
            onClick={value => {
              this.setState({ enableSsl: !value });
            }}
          >
            {_l('使用 SSL 链接')}
          </Checkbox>
        </div>
      </Dialog>
    );
  }
}
