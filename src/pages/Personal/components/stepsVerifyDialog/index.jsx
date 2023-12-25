import React from 'react';
import cx from 'classnames';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
import '../InitBindAccountDialog/index.less';

const verifyList = [
  { key: 'mobilePhone', title: _l('第二个验证步骤'), label: _l('手机短信验证码'), errorMsg: _l('手机') },
  { key: 'email', title: _l('备用验证方式'), label: _l('邮箱验证码'), errorMsg: _l('邮箱'), needVerify: true },
];

export default class StepsVerifyDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
    };
  }

  componentDidUpdate() {
    $('input.ant-input').attr('autocomplete', 'new-password');
  }

  render() {
    const { mobilePhone, email, isVerify, visible } = this.props;
    const { password } = this.state;
    const canVerify = mobilePhone && email && isVerify && password;
    return (
      <Dialog
        title={_l('开启两步验证？')}
        visible={visible}
        onCancel={this.props.onCancel}
        showCancel={false}
        okText={_l('开启')}
        onOk={() => this.props.onOk(password)}
        footer={null}
      >
        <div className="initPassowrdDialog">
          <div
            dangerouslySetInnerHTML={{
              __html: _l(
                '开启后，输入账户和密码后，仍需输入验证码；开启 %0。',
                `<span class="Gray Bold">请确保手机和邮箱均为可用状态</span>`,
              ),
            }}
          ></div>
          {verifyList.map(item => {
            const isError = !(item.needVerify ? email && isVerify : mobilePhone);
            return (
              <div className="mTop24">
                <div className="Gray_75">{item.title}</div>
                <div className={cx({ Red: isError })}>
                  {isError
                    ? _l('%0不可用，请先绑定或验证', item.errorMsg)
                    : _l('%0・%1', item.label, this.props[item.key])}
                </div>
              </div>
            );
          })}
          <div className="mTop24 mBottom24 line"></div>
          <div>{_l('登录密码')}</div>
          <div className="inputWrap">
            <Input.Password
              className="inputBox"
              value={password}
              autocomplete="new-password"
              onChange={e => this.setState({ password: e.target.value })}
            />
          </div>
          <div className="clearfix mTop40">
            <button
              type="button"
              disabled={!canVerify}
              className={cx('submitBtn ming Button Right Button--primary', { disable: !canVerify })}
              onClick={() => this.props.onOk(password)}
            >
              {_l('开启')}
            </button>
          </div>
        </div>
      </Dialog>
    );
  }
}
