import React, { Component } from 'react';
import account from 'src/api/account';
import { encrypt } from 'src/util';
import './index.less';

export default class ValidPassWord extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      disabled: false,
    };
  }

  handleSubmit() {
    if (!this.state.password) {
      alert(_l('请输入密码'), 2);
    } else {
      this.setState({ disabled: true });
      const { projectId, companyName } = this.props;
      account
        .validateExitProject({
          password: encrypt(this.state.password),
          projectId,
        })
        .done(result => {
          if (result === 2) {
            alert(_l('密码错误'), 3);
            $('inputBox')
              .val('')
              .focus();
          } else {
            // result
            // 0 failed
            // 1 success
            // 2 password error
            // 3 need transfter admin
            // 4 need apply to Mingdao
            this.props.closeDialog();
            switch (result) {
              case 1:
              case 3:
                this.props.transferAdminProject(projectId, companyName, this.state.password, result);
                break;
              case 0:
              default:
                alert(_l('操作失败'));
            }
          }
        })
        .always(() => {
          this.setState({ disabled: false });
        });
    }
  }

  render() {
    const { password, disabled } = this.state;
    return (
      <div className="pTop15 pBottom15 TxtCenter">
        <div className="mBottom15">
          <input
            type="password"
            className="inputBox"
            value={password}
            placeholder={_l('请输入登录密码')}
            onChange={e => {
              this.setState({ password: e.target.value });
            }}
          />
        </div>
        <div>
          <button
            type="button"
            disabled={disabled}
            className="btn ming Button Button--primary"
            onClick={() => this.handleSubmit()}
          >
            {_l('确认')}
          </button>
        </div>
      </div>
    );
  }
}
