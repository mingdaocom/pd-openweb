import React, { Component } from 'react';
import { LoadDiv } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import PayHeader from 'src/components/commonHeader/PayHeader';
import payAjax from 'src/api/pay';
import { getPssId } from 'src/util/pssId';
import genQrDataurl, { QRErrorCorrectLevel } from 'src/pages/worksheet/common/PrintQrBarCode/genQrDataurl';
import styled from 'styled-components';

const WecharPayWrap = styled.div`
  padding-top: 60px;
  height: 100%;
  .payCon {
    width: 80%;
    height: calc(100% - 60px);
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 16px auto 0;
    background: #fff;
    .payInfo {
      width: 280px;
      text-align: left;
    }
    .payNum {
      width: 280px;
      text-align: left;
      margin: 16px 0 24px 0;
    }
    .qrCode {
      width: 280px;
      height: 280px;
      border: 1px solid #eaeaea;
      padding: 9px;
      box-sizing: border-box;
      position: relative;
      img {
        width: 260px;
        height: 260px;
      }
      .mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: rgba(255, 255, 255, 0.95);
        z-index: 1;
      }
    }
    .payTxt {
      width: 280px;
      height: 50px;
      background: #15ba11;
      color: #fff;
      text-align: center;
      line-height: 50px;
      font-size: 15px;
      font-weight: 600;
      margin-top: 20px;
    }
  }
  .paySuccessContent {
    .successCon {
      margin: 80px auto 0;
      width: 800px;
      border-radius: 4px;
      box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
    }
  }
`;

export default class WechatPay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrCodeUrl: '',
      price: '',
      subject: '',
      loading: false,
      payState: '',
      disabledScan: false,
    };
    this.timeInterval = null;
  }
  componentDidMount() {
    const { projectId } = _.get(this.props, 'match.params') || {};
    const { isProjectAdmin } = _.find(md.global.Account.projects || [], it => it.projectId === projectId);
    if (!isProjectAdmin) return;
    this.getQRCode();
  }
  componentWillUnmount() {
    clearInterval(this.timeInterval);
  }

  // 获取微信支付二维码
  getQRCode = () => {
    const { projectId, orderId } = _.get(this.props, 'match.params') || {};
    this.setState({ loading: true });
    payAjax
      .weChatPay({
        projectId,
        orderNumber: orderId,
      })
      .then(res => {
        const { redirectUrl = '', price = '', subject, state } = res;
        const qrCodeUrl = genQrDataurl({
          width: 270,
          height: 270,
          value: redirectUrl,
          correctLevel: QRErrorCorrectLevel.H,
        });
        this.setState({ qrCodeUrl, price, subject, payState: state, loading: false }, () => this.pollFetch(5000));
      });
  };

  // 轮询获取订单状态
  pollFetch = delayTime => {
    this.timeInterval = setInterval(this.getPayStatus, delayTime);
  };

  getPayStatus = () => {
    const { orderId, projectId } = _.get(this.props, 'match.params') || {};

    payAjax.weChatQueryOrder({ projectId, state: this.state.payState }).then(res => {
      if (res.resultCode === 0) {
        // 二维码过期
        clearInterval(this.timeInterval);
        this.setState({ disabledScan: true });
        return;
      }
      if (res.tradeStatus === 'SUCCESS') {
        // 支付成功
        clearInterval(this.timeInterval);
        window.open(`/pay/success?orderId=${orderId}&payType=1`, '_self');
      }
    });
  };

  render() {
    const { qrCodeUrl, price, subject = '-', loading, disabledScan } = this.state;
    const { orderId = '-', projectId } = _.get(this.props, 'match.params') || {};

    return (
      <WecharPayWrap>
        <DocumentTitle title={subject} />
        <PayHeader projectId={projectId} title={_l('微信支付')} />
        {loading ? (
          <div className="payCon">
            <LoadDiv />
          </div>
        ) : (
          <div className="payCon">
            <div className="payInfo">
              <div className="Font17 bold mTop32 nowrap">{subject}</div>
              <div className="Gray_75">{_l('收款方：上海万企明道软件有限公司')}</div>
              <div className="Gray_75 nowrap">{_l('订单号：%0', orderId)}</div>
            </div>
            <div className="payNum">
              <span className="Font24 bold">{_l('%0元', price / 100)}</span>
            </div>
            <div className="qrCode">
              <img src={qrCodeUrl} />
              {disabledScan && (
                <div className="mask Font16">
                  <div>{_l('二维码失效')}</div>
                  <div>{_l('请刷新页面')}</div>
                </div>
              )}
            </div>
            <div className="Gray_75 mTop10">{_l('二维码有效期10分钟，过期请刷新页面')}</div>
            <div className="payTxt">{_l('请使用微信扫描二维码支付')}</div>
          </div>
        )}
      </WecharPayWrap>
    );
  }
}
