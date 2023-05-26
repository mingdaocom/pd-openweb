import React, { Component } from 'react';
import { verifyPassword } from 'src/util';
import { Dialog, CheckboxGroup, Input } from 'ming-ui';
// import { Input } from 'antd';
import styled from 'styled-components';
import _ from 'lodash';

const CreateKeyWrap = styled.div`
  padding: 0 8px;
  .ming.CheckboxGroup {
    flex-wrap: wrap;
    .Checkbox:first-child,
    .Checkbox:nth-child(2) {
      margin-right: 50px;
    }
    .Checkbox:last-child {
      margin-top: 12px;
    }
  }
`;

const interfacePermission = [
  { value: 1, text: _l('人员组织接口') },
  { value: 2, text: _l('汇报关系接口') },
  { value: 3, text: _l('应用管理接口') },
  { value: 4, text: _l('审批接口（协作套件-人事）') },
];

export default class CreateEditKeyDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedValues: [],
    };
  }
  changeCheckedValue = val => {
    let copy = [...this.state.checkedValues];
    if (!_.includes(copy, val)) {
      copy.push(val);
    } else {
      copy = copy.filter(item => !item === val);
    }
    this.setState({ checkedValues: copy });
  };
  inputPassword = val => {
    this.setState({ password: val });
  };
  onOk = () => {
    let { password } = this.state;
    if (!password) return;
    const _this = this;
    verifyPassword({
      password,
      success: () => {
        _this.props.showCreateKeyDialog();
      },
    });
  };
  render() {
    let { checkedValues, password } = this.state;
    const { visible, idEdit, currentKeyInfo = {} } = this.props;
    return (
      <Dialog
        title={idEdit ? _l('编辑密钥') : _l('新建密钥')}
        width={500}
        visible={visible}
        onCancel={this.props.showCreateKeyDialog}
        onOk={this.onOk}
        overlayClosable={false}
      >
        <CreateKeyWrap>
          <div className="Gray_75 mBottom20">{_l('请选择该密钥授权的接口访问权限和管理应用的范围')}</div>
          <div className="mBottom15">{_l('接口权限')}</div>
          <CheckboxGroup data={interfacePermission} checkedValues={checkedValues} onChange={this.changeCheckedValue} />
          <div className="mTop24 mBottom10">{_l('当前用户密码')}</div>
          <Input
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={this.inputPassword}
            placeholder={_l('请输入密码确认授权')}
          />
        </CreateKeyWrap>
      </Dialog>
    );
  }
}
