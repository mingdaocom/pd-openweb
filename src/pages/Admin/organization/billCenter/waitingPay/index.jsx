import React, { Component, Fragment } from 'react';
import Config from '../../../config';
import billCommon from '../common';
import { Icon, LoadDiv, VerifyPasswordConfirm, Button } from 'ming-ui';
import { Checkbox } from 'antd';
import orderController from 'src/api/order';
import cx from 'classnames';
import './style.less';
import { payDialogFunc } from 'src/components/pay/payDialog';
import { encrypt, addToken } from 'src/util';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const params = Config.params;
const orderId = params[3];
const _payStyleArr = [
  {
    name: _l('余额付款'),
    id: 'balancePay',
    icon: 'icon-sp_account_balance_wallet_white Font24',
  },
  {
    name: _l('支付宝付款'),
    id: 'aliPay',
    icon: 'icon-order-alipay Font24',
  },
  {
    name: _l('微信支付'),
    id: 'wechartPay',
    icon: 'icon-wechat_pay Font24',
  },
  {
    name: _l('银行转账'),
    id: 'bankPay',
    icon: 'icon-credit-card Font24',
  },
];

export default class WaitingPay extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('等待支付'));
    this.state = {
      balance: 0,
      balanceNotEnough: false,
      payStyleArr: [],
      payStyle: 'aliPay',
      currRecordObj: {},
      needEmail: false,
      password: '',
      loading: true,
    };
  }

  componentDidMount() {
    if (!orderId) {
      alert(_l('传入参数无效'), 3);
      return false;
    }
    const _this = this;
    Promise.all([
      Config.AdminController.getHidBalance({
        projectId: Config.projectId,
      }),
      orderController.getTransactionRecordByOrderId({
        projectId: Config.projectId,
        orderId: orderId,
      }),
    ]).then(function ([balance, data]) {
      _this.setState(
        {
          balance: parseFloat(balance) || 0,
          currRecordObj: data,
        },
        () => {
          if (data) {
            _this.viewByCurrRecordObj();
          } else {
            window.location.href = '/admin/billinfo/' + Config.projectId;
          }
        },
      );
    });
  }

  /**
   * [viewByCurrRecordObj 根据当前记录处理页面视图]
   * @return {[type]} [description]
   */
  viewByCurrRecordObj() {
    const { currRecordObj, balance } = this.state;
    const { ReCharge, Ultimate, Enterprise } = billCommon.orderRecordType || {};
    if (!currRecordObj) return;
    const { status, recordType, price } = currRecordObj;
    const hasFinanceAuth = checkPermission(Config.projectId, PERMISSION_ENUM.FINANCE); //是否有财务权限

    //如果状态不在待付款状态直接返回首页
    if (status !== billCommon.orderRecordStatus.wating) {
      window.location.href = '/admin/billinfo/' + Config.projectId;
      return false;
    }
    let temp = _payStyleArr.filter(it => {
      if (it.id === 'balancePay' && (_.includes([ReCharge, Ultimate, Enterprise], recordType) || !hasFinanceAuth)) {
        //充值、升级没有余额支付
        return false;
      } else if (price === 0 || ([25, 26].includes(recordType) && md.global.Config.IsLocal)) {
        // 免费试用支付订单只保留余额支付
        return !_.includes(['aliPay', 'wechartPay', 'bankPay'], it.id);
      }
      if (price > 6000) {
        return it.id !== 'wechartPay';
      }
      return true;
    });

    //payStyle默认第一项
    const firstItem = temp[0].id;
    const balanceNotEnough = parseFloat(price) > parseFloat(balance);
    this.setState({
      payStyleArr: temp,
      balanceNotEnough,
      payStyle: firstItem,
      loading: false,
    });
  }

  handleBack() {
    window.location.href = '/admin/billinfo/' + Config.projectId;
  }

  renderTitle() {
    let text = '';
    switch (this.state.currRecordObj.recordType) {
      case billCommon.orderRecordType.MemberPackage:
        text = _l('感谢您购买用户包');
        break;
      case billCommon.orderRecordType.OAPackage:
        text = _l('感谢您购买OA');
        break;
      case billCommon.orderRecordType.ApprovePackage:
        text = _l('感谢您购买审批');
        break;
      case billCommon.orderRecordType.ReCharge:
        text = _l('感谢您购买充值包');
        break;
      case billCommon.orderRecordType.Upgrade:
        text = _l('感谢您开通标准版');
        break;
      case billCommon.orderRecordType.DayPackage:
        text = _l('感谢您开通一天包');
        break;
      case billCommon.orderRecordType.UpgradeEnterpriseAndOA:
        text = _l('感谢您开通标准版+OA');
        break;
      case billCommon.orderRecordType.EnterpriseAndApprove:
        text = _l('感谢您开通标准版+审批');
        break;
      case billCommon.orderRecordType.Enterprise:
        text = _l('感谢您开通专业版');
        break;
      case billCommon.orderRecordType.Ultimate:
        text = _l('感谢您开通旗舰版');
        break;
      case billCommon.orderRecordType.APK:
        text = _l('感谢您购买应用拓展包');
        break;
      case billCommon.orderRecordType.WORKFLOW:
        text = _l('感谢您购买工作流拓展包');
        break;
      default:
        break;
    }
    return text;
  }

  // 支付方式
  renderPayTypes() {
    const { payStyleArr, payStyle } = this.state;
    return (
      <Fragment>
        {payStyleArr.map(item => {
          return (
            <div
              key={item.id}
              className={cx('itemBoxContent', { active: item.id === payStyle })}
              onClick={() => {
                this.setState({
                  payStyle: item.id,
                });
              }}
            >
              <span
                className={cx(
                  'Font12 mRight8',
                  item.icon,
                  item.id === 'bankPay' ? 'bankPayColor' : item.id === 'wechartPay' ? 'wxPayColor' : 'otherPayColor',
                )}
              ></span>
              <span>{item.name}</span>
            </div>
          );
        })}
      </Fragment>
    );
  }

  handleHelp() {
    window.open(
      'https://d557778d685be9b5.share.mingdao.net/public/form/b9cfd9d0f4a84f6798cf0d3235fc4ead?source=package_payment',
    );
  }

  handleCheckBox(e) {
    this.setState({ needEmail: e.target.checked });
  }

  handlePay() {
    if (this.state.payStyle == 'bankPay') {
      this.bankPay();
    } else if (this.state.payStyle == 'balancePay') {
      VerifyPasswordConfirm.confirm({
        onOk: password => this.setState({ password }, this.balancePay),
      });
    } else if (this.state.payStyle == 'wechartPay') {
      if (confirm(_l('确定以【微信支付】方式进行本次付款？'))) {
        window.open(`/wechatPay/${Config.projectId}/${orderId}`);
        payDialogFunc({ url: `/admin/billinfo/${Config.projectId}` });
      }
    } else if (this.state.payStyle == 'aliPay') {
      this.aliPay();
    }
  }

  //银行转账
  bankPay() {
    window.open(
      addToken(
        md.global.Config.AjaxApiUrl +
          'download/downloadBankInfo?projectId=' +
          Config.projectId +
          '&orderId=' +
          orderId +
          '&sendEmail=' +
          this.state.needEmail,
      ),
    );
  }

  //余额支付
  balancePay = () => {
    if (confirm(_l('确定以【余额付款】方式进行本次付款？'))) {
      this.setState({ isPay: true });
      alert({ msg: _l('正在提交，请稍候...'), type: 1, timeout: false, key: 'pay' });
      orderController
        .balancePayOrder({
          projectId: Config.projectId,
          orderId,
          password: encrypt(this.state.password),
        })
        .then(data => {
          if (data.isSuccess) {
            alert({
              msg: _l('付款成功'),
              type: 1,
              key: 'pay',
              timeout: 1000,
              callback: () => {
                window.location.href = '/admin/billinfo/' + Config.projectId;
              },
            });
          } else {
            this.setState({ isPay: false });
            if (data.validateResult == 2) {
              alert({ msg: _l('密码错误'), type: 3, key: 'pay' });
            } else if (data.validateResult == 3) {
              alert({ msg: _l('余额不足'), type: 3, key: 'pay' });
            } else {
              alert({ msg: _l('操作失败'), type: 2, key: 'pay' });
            }
          }
        });
    }
  };

  //支付宝
  aliPay() {
    if (confirm(_l('确定以【支付宝付款】方式进行本次付款？'))) {
      window.open(
        addToken(md.global.Config.AjaxApiUrl + 'pay/alipay?projectId=' + Config.projectId + '&orderNumber=' + orderId),
      );
      const setting = {
        url: '/admin/billinfo/' + Config.projectId,
      };
      payDialogFunc({ url: '/admin/billinfo/' + Config.projectId });
      //操作日志
      orderController.addThreePartPayOrderLog({
        projectId: Config.projectId,
        orderId,
      });
    }
  }

  render() {
    const { payStyle, balanceNotEnough, currRecordObj, needEmail, isPay, loading } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <div className="warpCenter waitingPay">
        <div className="valueAddServerHeader">
          <Icon icon="backspace" className="Hand mRight18 TxtMiddle Font24" onClick={() => this.handleBack()}></Icon>
          <span className="Font17 Bold">{_l('支付订单')}</span>
        </div>
        <div className="warpMainView">
          <div className="Font24 Bold color_b">{this.renderTitle()}</div>
          <div className="payItemRow mTop40">
            <div className="payItemLabel">{_l('支付方式')}</div>
            <div className="payItemResult">{this.renderPayTypes()}</div>
          </div>
          <div className="warpPayBottom">
            {/** 银行卡支付 */}
            <div className={cx('warpShowBankAcountInfo mTop30', { Hidden: payStyle !== 'bankPay' })}>
              <div className="color_b Font13 LineHeight26">{_l('收款账号信息')}</div>
              <div className="color_b Font13 LineHeight26">
                {_l('用户名：')}
                <span>{_l('上海万企明道软件有限公司')}</span>
              </div>
              <div className="color_b Font13 LineHeight26">
                &nbsp;&nbsp;&nbsp;{_l('账号：')}
                <span>641967782</span>
              </div>
              <div className="color_b Font13 LineHeight26">
                {_l('开户行：')}
                <span>{_l('民生银行上海大宁支行')}</span>
              </div>
            </div>
            {/** 余额支付 */}
            <div className={cx('warpShowBankAcountInfo', { Hidden: payStyle !== 'balancePay' })}>
              {balanceNotEnough ? (
                <span className="Block Red mTop15">
                  {_l('对不起，您的余额不足！')}
                  {/* <a href={`/admin/valueaddservice/${Config.projectId}`}> {_l('前去充值')} </a>
                  {_l('或使用其他支付方式')} */}
                </span>
              ) : (
                ''
              )}
            </div>
          </div>
          <div className="payItemRow mTop30">
            <div className="payItemLabel">{_l('总计')}</div>
            <div className="payItemResult Font24 Bold color_b">￥{Math.abs(currRecordObj.price)}</div>
          </div>
          <div className="mTop40 flexRow alignItemsCenter">
            <Button
              type="primary"
              disabled={(payStyle === 'balancePay' && balanceNotEnough) || isPay}
              className="nextBtn"
              onClick={() => this.handlePay()}
            >
              {payStyle === 'bankPay' ? _l('保存付款信息') : _l('立即支付')}
            </Button>
            {!md.global.Config.IsLocal && _.includes(['bankPay', 'balancePay'], payStyle) && (
              <div className="warpSendBankInfoEmail mLeft20">
                <Checkbox onChange={this.handleCheckBox.bind(this)} checked={needEmail}>
                  {_l('同时邮件给我')}
                </Checkbox>
              </div>
            )}
          </div>
          {!md.global.Config.IsLocal && (
            <div className="Gray_9 mTop24">
              <div>{_l('我们将在收到款项后的15分钟内为您完成服务')}</div>
              {_l('如有疑问，')}
              <span className="ThemeColor3 Hand" onClick={this.handleHelp.bind(this)}>
                {_l('请与我们联系')}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
