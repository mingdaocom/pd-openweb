import React, { Component } from 'react';
import cx from 'classnames';
import { Button } from 'ming-ui';
import captcha from 'src/components/captcha';
import { specialTelVerify } from '../tools/utils';
import { initIntlTelInput } from '../tools/DataFormat';
import publicWorksheetAjax from 'src/api/publicWorksheet';

export default class WidgetsVerifyCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmit: false,
      count: 0,
    };
  }

  componentDidMount() {
    this.iti = initIntlTelInput();
  }

  handleVerify = () => {
    const { value, worksheetId } = this.props;
    const _this = this;

    if (this.state.isSubmit) return;

    let isAvailable = true;

    if (!value) {
      isAvailable = false;
    } else {
      this.iti.setNumber(value);
      if (!(this.iti.isValidNumber() || specialTelVerify(value))) {
        isAvailable = false;
      }
    }

    if (!isAvailable) {
      alert(_l('请正确填写手机号'), 3);
      return;
    }

    this.setState({ isSubmit: true });

    const cb = function(res) {
      if (res.ret !== 0) {
        _this.setState({ isSubmit: false });
        return;
      }

      publicWorksheetAjax
        .sendVerifyCode({
          account: value,
          ticket: res.ticket,
          randStr: res.randstr,
          worksheetId: worksheetId,
          captchaType: md.staticglobal.getCaptchaType(),
        })
        .then(data => {
          if (data === 1) {
            _this.handleSend();
          } else if (data === 15) {
            captchaFuc();
          } else {
            alert(
              {
                3: _l('图形验证码失败'),
                8: _l('该手机号发送过于频繁'),
                22: _l('短信余额不足，请联系表单发布者'),
              }[data] || _l('发送失败'),
              2,
            );
            _this.setState({ isSubmit: false });
          }
        });
    };
    const onCancel = isOk => {
      if (isOk) return;
      this.setState({ isSubmit: false });
    };
    const captchaFuc = () => {
      if (md.staticglobal.getCaptchaType() === 1) {
        new captcha(cb, onCancel);
      } else {
        new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), cb).show();
      }
    };

    // 前3次关闭图像验证
    cb({ ret: 0 });
  };

  handleSend() {
    this.setState({ count: 30 });

    this.timer = setInterval(() => {
      const { count } = this.state;

      if (count === 1) {
        this.handleClear();
        this.setState({ isSubmit: false, count: 0 });
      } else {
        this.setState({ count: count - 1 });
      }
    }, 1000);
  }

  handleClear() {
    clearInterval(this.timer);
  }

  componentWillUnmount() {
    this.handleClear();
  }

  render() {
    const { size, verifyCode, handleChange } = this.props;
    const { isSubmit, count } = this.state;

    return (
      <div className="customFormControlVerify">
        <input
          className={cx('customFormControlBox', { verifyCodeStyle: size === 4 })}
          value={verifyCode}
          maxLength={4}
          onChange={e => {
            const value = e.target.value.trim();
            handleChange(value.replace(/[^\d]/g, ''));
          }}
        />
        <Button disabled={isSubmit} type={isSubmit ? 'secondary' : 'primary'} onClick={this.handleVerify}>
          {isSubmit ? (count ? _l('%0秒后重发', count) : _l('正在发送...')) : _l('获取验证码')}
        </Button>
      </div>
    );
  }
}
