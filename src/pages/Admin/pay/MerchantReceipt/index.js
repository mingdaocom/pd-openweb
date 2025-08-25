import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import paymentAjax from 'src/api/payment';
import webCacheAjax from 'src/api/webCache';
import preall from 'src/common/preall';
import { getRequest } from 'src/utils/common';

const Wrap = styled.div`
  padding-top: 20px;
  max-height: 640px;
  width: 100%;
  .content {
    height: 299px;
    background: #f8f8f8;
    border-radius: 9px 9px 9px 9px;
    padding: 50px 16px 0;
    .label {
      min-width: 100px;
    }
    .value {
      word-break: break-word;
    }
    .logo {
      height: 56px;
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
    }
    .backBtn {
      width: 113px;
      height: 36px;
      background: #ffffff;
      border-radius: 18px;
      border: 1px solid #1677ff;
      color: #1677ff;
      margin: 0 auto;
      line-height: 34px;
    }
  }
`;

export default function MerchantReceipt() {
  const [data, setData] = useSetState({});
  const wxUrl = 'https://payapp.weixin.qq.com';

  const showCustomPage = () => {
    let mchData = { action: 'onIframeReady', displayStyle: 'SHOW_CUSTOM_PAGE' };
    let postData = JSON.stringify(mchData);
    parent.postMessage(postData, wxUrl);

    getOrderInfo();
  };

  const getOrderInfo = () => {
    const params = getRequest(window.location.search) || {};
    if (_.isEmpty(params)) return window.alert(_l('没有订单号，请联系管理员'), 2);

    paymentAjax
      .getPayOrderForTicket({
        paymentPlatformOrderId: params.out_trade_no,
      })
      .then(res => {
        setData(res);
        getUrl(res.orderId, res.sourceInfo);
      });
  };

  const getUrl = (orderId, sourceInfo = {}) => {
    if (!orderId) return;
    webCacheAjax
      .get({
        key: `${orderId}`,
      })
      .then(res => {
        const backUrl = res.data
          ? `${res.data}/mobile/record/${sourceInfo.appId}/${sourceInfo.worksheetId}/${sourceInfo.rowId}`
          : undefined;
        setData({ backUrl });
      });
  };

  useEffect(() => {
    showCustomPage();
  }, []);

  return (
    <Wrap>
      <div className="content Relative Font15">
        {/* 组织头像 */}
        {data.projectLogo && data.projectLogo.indexOf('emptylogo.png') === -1 && (
          <img src={data.projectLogo} className="logo" />
        )}

        <div className="Font20 bold TxtCenter Gray">{data.description}</div>
        <div className="flexRow mBottom20">
          <div className="flex Gray_75">{_l('订单状态')}</div>
          <div className="value">{_l('支付成功')}</div>
        </div>
        <div className="flexRow mBottom20">
          <div className="flex Gray_75 label">{_l('商户单号')}</div>
          <div className="value">{data.merchantOrderId}</div>
        </div>
        <div className="flexRow mBottom30">
          <div className="flex Gray_75">{_l('支付总额')}</div>
          <div className="value">¥ {data.amount}</div>
        </div>

        {/* 在微信内创建订单并支付&非公开表单支付时显示返回商家 */}
        {data.sourceType !== 1 && data.backUrl && (
          <div
            className="backBtn Font14 bold TxtCenter Hand"
            onClick={() => {
              let mchData = {
                action: 'jumpOut',
                jumpOutUrl: data.backUrl,
              };
              let postData = JSON.stringify(mchData);
              parent.postMessage(postData, wxUrl);
            }}
          >
            {_l('返回商家')}
          </div>
        )}
      </div>
    </Wrap>
  );
}

const Comp = preall(MerchantReceipt, { allowNotLogin: true });
const root = createRoot(document.querySelector('#app'));

root.render(<Comp />);
