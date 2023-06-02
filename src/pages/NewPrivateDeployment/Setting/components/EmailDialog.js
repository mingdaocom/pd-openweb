import React, { Component, Fragment } from 'react';
import { Dialog, Input, Checkbox, Button, LoadDiv } from 'ming-ui';
import RegExp from 'src/util/expression';
import emailApi from 'src/api/email';
import { encrypt } from 'src/util';
import _ from 'lodash';

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
      toEmail: '',
      toEmailVisible: false,
      toEmailLoading: false,
      toEmailResult: null
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEmpty(nextProps.emailConfig)) {
      this.setState({
        ...nextProps.emailConfig,
      });
    }
  }
  getEmailConfig = () => {
    const { signature, fromAddress, server, account, password, port, enableSsl } = this.state;

    if (_.isEmpty(signature)) {
      alert(_l('请输入签名'), 3);
      return;
    }

    if (_.isEmpty(fromAddress)) {
      alert(_l('请输入发送邮箱'), 3);
      return;
    } else if (!RegExp.isEmail(fromAddress)) {
      alert(_l('发送邮箱格式错误'), 3);
      return;
    }

    if (_.isEmpty(server)) {
      alert(_l('请输入服务器地址'), 3);
      return;
    }

    if (!port) {
      alert(_l('请输入端口'), 3);
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
    return data;
  }
  handleSave = () => {
    const data = this.getEmailConfig();
    if (data) {
      emailApi
        .editSmtpSecret({
          ...data,
          password: data.password ? encrypt(data.password) : ''
        })
        .then(result => {
          if (result) {
            alert(_l('修改成功'));
            this.props.onCancel();
            this.props.onChange(data);
          }
        });
    }
  }
  handleSendTest = () => {
    const { toEmail } = this.state;
    const data = this.getEmailConfig();
    if (data) {
      if (_.isEmpty(toEmail)) {
        alert(_l('请输入收件邮箱'), 3);
        return;
      }
      this.setState({ toEmailLoading: true });
      emailApi.sendTest({
        ...data,
        toEmail,
        password: data.password ? encrypt(data.password) : ''
      }).then(data => {
        this.setState({
          toEmailLoading: false,
          toEmailResult: data
        });
      }).fail(() => {
        this.setState({
          toEmailLoading: false,
          toEmailResult: null
        });
      });
    }
  }
  render() {
    const { visible } = this.props;
    const { signature, fromAddress, server, account, password, port, enableSsl } = this.state;
    const { toEmail, toEmailVisible, toEmailLoading, toEmailResult } = this.state;
    return (
      <Fragment>
        <Dialog
          visible={visible}
          anim={false}
          title={_l('邮件服务设置')}
          width={560}
          footer={(
            <div className="mui-dialog-footer">
              <Button type="link" onClick={this.props.onCancel}>{_l('取消')}</Button>
              <Button
                type="ghost"
                onClick={() => {
                  const data = this.getEmailConfig();
                  this.setState({ toEmailVisible: data ? true : false });
                }}
              >
                {_l('测试连接')}
              </Button>
              <Button type="primary" onClick={this.handleSave}>{_l('确定')}</Button>
            </div>
          )}
          onCancel={this.props.onCancel}
        >
          <div className="mBottom20">
            <div className="mBottom5 Font14">{_l('签名')} <span class="Red">*</span></div>
            <Input
              value={signature}
              onChange={value => {
                this.setState({ signature: value });
              }}
            />
          </div>
          <div className="mBottom20">
            <div className="mBottom5 Font14">{_l('发送邮箱')} <span class="Red">*</span></div>
            <Input
              className="w100"
              value={fromAddress}
              onChange={value => {
                this.setState({ fromAddress: value });
              }}
            />
          </div>
          <div className="mBottom20">
            <div className="mBottom5 Font14">{_l('服务器')} <span class="Red">*</span></div>
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
            <div className="mBottom5 Font14">{_l('端口')} <span class="Red">*</span></div>
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
        <Dialog
          visible={toEmailVisible}
          anim={false}
          title={_l('测试连接')}
          width={560}
          onOk={this.handleSendTest}
          okText={_l('发送测试邮件')}
          onCancel={() => this.setState({ toEmailVisible: false, toEmailResult: null })}
        >
          <div className="mBottom10">{_l('收件邮箱')}</div>
          <Input
            className="w100 mBottom10"
            value={toEmail}
            onChange={value => {
              this.setState({ toEmail: value });
            }}
          />
          {toEmailLoading ? (
            <div style={{ width: 30 }}><LoadDiv size="small" /></div>
          ) : (
            toEmailResult && (
              <div className={toEmailResult.success ? 'DepGreen' : 'Red'}>
                <div className="mBottom5">{toEmailResult.success ? _l('发送成功') : _l('发送失败')}</div>
                <div>{!toEmailResult.success && toEmailResult.message}</div>
              </div>
            )
          )}
        </Dialog>
      </Fragment>
    );
  }
}
