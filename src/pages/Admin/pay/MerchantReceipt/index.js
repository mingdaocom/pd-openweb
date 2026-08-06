import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import paymentAjax from 'src/api/payment';
import preall from 'src/common/preall';
import { getRequest } from 'src/utils/common';

const Wrap = styled.div`
  padding-top: 20px;
  max-height: 640px;
  width: 100%;
  .content {
    height: 299px;
    background: var(--color-background-secondary);
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
      background: var(--color-background-primary);
      border-radius: 18px;
      border: 1px solid var(--color-primary);
      color: var(--color-primary);
      margin: 0 auto;
      line-height: 34px;
    }
  }
`;

export default function MerchantReceipt() {
  const [data, setData] = useSetState({});
  const wxUrl = 'https://payapp.weixin.qq.com';

  useEffect(() => {
    const mchData = { action: 'onIframeReady', displayStyle: 'SHOW_CUSTOM_PAGE' };
    const postData = JSON.stringify(mchData);
    parent.postMessage(postData, wxUrl);

    const params = getRequest(window.location.search) || {};

    if (_.isEmpty(params)) {
      window.alert(_l('没有订单号，请联系管理员'), 2);
      return;
    }

    paymentAjax
      .getPayOrderForTicket({
        paymentPlatformOrderId: params.out_trade_no,
      })
      .then(setData);
  }, [setData]);

  return (
    <Wrap>
      <div className="content Relative Font15">
        {/* 组织头像 */}
        {data.projectLogo && data.projectLogo.indexOf('emptylogo.png') === -1 && (
          <img src={data.projectLogo} className="logo" />
        )}

        <div className="Font20 bold TxtCenter textPrimary">{data.description}</div>
        <div className="flexRow mBottom20">
          <div className="flex textSecondary">{_l('订单状态')}</div>
          <div className="value">{_l('支付成功')}</div>
        </div>
        <div className="flexRow mBottom20">
          <div className="flex textSecondary label">{_l('商户单号')}</div>
          <div className="value">{data.merchantOrderId}</div>
        </div>
        <div className="flexRow mBottom30">
          <div className="flex textSecondary">{_l('支付总额')}</div>
          <div className="value">¥ {data.amount}</div>
        </div>

        {/* 在微信内创建订单并支付&非公开表单支付时显示返回商家 */}
        {data.sourceType !== 1 && data.backUrlForTicket && (
          <div
            className="backBtn Font14 bold TxtCenter Hand"
            onClick={() => {
              let mchData = {
                action: 'jumpOut',
                jumpOutUrl: data.backUrlForTicket,
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
