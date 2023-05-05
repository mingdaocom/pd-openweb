import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import { verifyPassword } from 'src/util';

const PasswordConfirmWWrap = styled.div``;


export default class PasswordConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  inputPassword = e => {
    this.setState({ password: e.target.value });
  };
  onOk = () => {
    let { password } = this.state;
    if (!password) return;

    const _this = this;
    verifyPassword(password, () => {
      _this.props.cancelPasswordComfirm();
    });
  };
  render() {
    const { actType, visible } = this.props;
    let { password } = this.state;
    return (
      <Dialog
        width={500}
        visible={visible}
        title={actType === 'delete' ? <span className="Red">{_l('删除密钥')}</span> : _l('查看密钥')}
        onCancel={this.props.cancelPasswordComfirm}
        onOk={this.onOk}
        overlayClosable={false}
      >
        <PasswordConfirmWWrap>
          <div className="Gray_75 mBottom24">
            {actType === 'delete'
              ? _l('删除密钥后，之前所有使用此密钥的服务都将停止，请谨慎操作')
              : _l('组织密钥是极为重要的凭证，需要你输入密码确认后才能查看')}
          </div>
          <div className="mBottom10">{_l('当前用户密码')}</div>
          <Input.Password
            value={password}
            autoComplete="new-password"
            onChange={this.inputPassword}
            placeholder={_l('请输入密码确认授权')}
          />
        </PasswordConfirmWWrap>
      </Dialog>
    );
  }
}
