import React, { Component, Fragment } from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import { LoadDiv, Button, Checkbox, RichText, VerifyPasswordInput } from 'ming-ui';
import { browserIsMobile, mdAppResponse, verifyPassword } from 'src/util';
import cx from 'classnames';
import './cancellation.less';
import moment from 'moment';
import privateDeclareAjax from 'src/api/privateDeclare';
import accountAjax from 'src/api/account';

const actionMsg = {
  0: _l('操作失败'),
  1: _l('操作成功'),
  2: _l('验证密码错误！'),
  3: _l('您尚有未退出的组织，请先至 个人中心-我的组织 退出所有组织，方可注销！'),
  4: _l('账号已申请注销！'),
  5: _l('state过期或错误！'),
};
export default class Cancellation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      second: 30,
    };
    this.timer = null;
    this.loginStateTimer = null;
  }
  componentDidMount() {
    $('html').addClass('enterpriseLogoutCon');
    document.title = _l('账户注销');
    this.checkLogoutStatus();
    privateDeclareAjax.getDeclare().then(res => {
      this.setState({
        summary: res.agreement,
      });
    });

  }
  componentWillUnmount() {
    $('html').removeClass('enterpriseLogoutCon');
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  checkLogoutStatus = () => {
    const { state, createStateTime = moment().format('YYYY-MM-DD HH:mm:ss') } = localStorage.getItem('loginStatus')
      ? JSON.parse(localStorage.getItem('loginStatus'))
      : {};
    if (!state) {
      this.setState({ loading: false, step: 1 });
      return;
    }
    this.setState({ loading: true });
    accountAjax
      .getApplyLogOffAccount({ state })
      .then(res => {
        if (res === 0 || res === 5) {
          location.href = '/login';
        } else {
          this.setState(
            {
              step: 3,
              createTime: res.createTime,
              createStateTime,
              overdueDiff: moment(createStateTime).add(5, 'm').diff(moment(), 's'),
              loading: false,
            },
            () => {
              this.getLoginStateCountDown();
            },
          );
        }
      })
      .fail(err => {
        location.href = '/login';
      });
  };
  confirmPassword = () => {
    const { password = '' } = this.state;
    const _this = this;

    verifyPassword({
      password: password.trim(),
      success: () => {
        _this.setState({ step: 2 });
        _this.getCountDown();
      },
    });
  };
  renderInputPassword = () => {
    return (
      <Fragment>
        <div className="Font13 Bold  mBottom16 w300 TxtLeft">{_l('请输入登录密码确认注销操作')}</div>
        <VerifyPasswordInput onChange={({ password }) => this.setState({ password })} />
        <Button
          className="primary nextStep "
          onClick={() => {
            this.confirmPassword();
          }}
        >
          {_l('下一步')}
        </Button>
      </Fragment>
    );
  };
  getCountDown = () => {
    const { second } = this.state;
    if (second <= 0) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timer = setInterval(() => {
      this.func();
    }, 1000);
  };
  func = () => {
    const { second } = this.state;
    if (second <= 1) clearInterval(this.timer);
    this.setState({ second: second - 1 });
  };
  showProtocol = () => {
    const { second, checkedAgree, summary = '' } = this.state;
    const isMobile = browserIsMobile();

    return (
      <Fragment>
        <div className={cx('privacyContent', { mLeft24: isMobile, mRight16: isMobile })}>
          <div className="termsDiv">
            <RichText data={summary || ``} className={''} disabled={true} backGroundColor={'#fff'} />
          </div>
        </div>
        <div className="protocol TxtLeft flexRow alignItemsCenter mTop24">
          <Checkbox checked={checkedAgree} onClick={checked => this.setState({ checkedAgree: !checked })} />
          <div>
            <spam className="Font20">{_l('同意（注销后15天内可撤销操作）')}</spam>
          </div>
        </div>
        <Button
          className={cx('mTop40', { disabled: second || !checkedAgree })}
          onClick={() => {
            if (second || !checkedAgree) return;
            accountAjax.applyLogOffAccount({}).then(res => {
              let type = res === 0 || res === 5 ? 2 : res === 1 ? 1 : 3;
              const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
              alert(actionMsg[res], type);
              if (res === 1) {
                window.location.href = '/login';
              }
              if (isMingdao) {
                mdAppResponse({
                  type: 'native',
                  sessionId: 'Native test session',
                  settings: { action: 'deleteAccount' },
                });
              }
            });
          }}
        >
          {_l('确认注销')}
          {second ? `（${second}s）` : ''}
        </Button>
      </Fragment>
    );
  };
  revokeApply = () => {
    const { state } = localStorage.getItem('loginStatus') ? JSON.parse(localStorage.getItem('loginStatus')) : {};
    $.ajax({
      url: `${md.global.Config.AjaxApiUrl}Account/CancelLogOffAccount?state=${state}`,
      type: 'POST',
      params: { state },
      success: ({ data }) => {
        let type = data === 0 || data === 5 ? 2 : data === 1 ? 1 : 3;
        alert(actionMsg[data], type);
        if (data === 1) {
          // 撤销申请跳转至登录页
          window.location.href = '/login';
        }
      },
    });
  };
  getLoginStateCountDown = () => {
    const { overdueDiff } = this.state;
    if (overdueDiff <= 0) {
      clearInterval(this.loginStateTimer);
      this.loginStateTimer = null;
    }
    this.loginStateTimer = setInterval(() => {
      this.countDown();
    }, 1000);
  };
  countDown = () => {
    const { overdueDiff } = this.state;
    let min = Math.floor(overdueDiff / 60);
    let sec = overdueDiff % 60;
    let overdueDate = min ? (sec > 0 ? _l(' %0 分 %1 秒', min, sec) : _l(' %0 分', min)) : _l(' %0 秒', sec);
    this.setState({ overdueDate, overdueDiff: overdueDiff - 1 });
  };

  renderHasApplyLogout = () => {
    const { createTime, overdueDate = '', overdueDiff = 0 } = this.state;
    let diffValue = moment(createTime)
      .add(15 * 24, 'H')
      .diff(moment(), 'H');
    let days = Math.floor(diffValue / 24);
    let hours = diffValue % 24;
    let deadline = days
      ? hours > 0
        ? _l(' %0 天 %1 小时', days, hours)
        : _l(' %0 天', days)
      : hours > 0
      ? _l(' %0 小时', hours)
      : _l(' 1 小时');

    return (
      <Fragment>
        <div className="Font13 Bold mBottom9">
          {_l('您于%0  申请账号注销', moment(createTime).format('YYYY-MM-DD'))}
        </div>
        <div className="Font13 Bold">
          {_l('账号将在')}
          {deadline}
          {_l('后正式注销，不可撤销！')}
        </div>
        {overdueDiff > 0 ? (
          <div className="mTop50">
            {_l('如需撤销，请在 ')} <span className="ThemeColor3 mTop50 mBottom10">{overdueDate} </span>{' '}
            {_l(' 内撤销申请')}
          </div>
        ) : (
          ''
        )}
        {overdueDiff > 0 ? (
          <Button type="primary" onClick={this.revokeApply} className="mTop10">
            {_l('撤销申请')}
          </Button>
        ) : (
          ''
        )}
      </Fragment>
    );
  };
  renderPage() {}
  render() {
    const { loading } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    const { step } = this.state;
    const isMobile = browserIsMobile();

    return (
      <div className="contentWrap pTop25">
        <div
          className={cx('contentBox flexColumn alignItemsCenter', {
            privacyHieght: step === 2,
            mobileContainerWidth: isMobile,
          })}
        >
          <div className="title Font24 Bold mTop40">{step !== 3 ? _l('账号注销') : _l('您的账号已申请注销')}</div>
          {step === 1 ? this.renderInputPassword() : step === 2 ? this.showProtocol() : this.renderHasApplyLogout()}
        </div>
      </div>
    );
  }
}

const Comp = preall(Cancellation, { allownotlogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));
