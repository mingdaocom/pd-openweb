import React from 'react';
import { createRoot } from 'react-dom/client';
import preall from 'src/common/preall';
import PayHeader from '../payHeader';
import styled from 'styled-components';

const PayFailedWrap = styled.div`
  .failedWrap {
    margin-top: 80px;
    .failedCon {
      width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
    }
    .failIcon {
      border: 2px solid #d75b73;
      color: #d75b73;
      font-size: 20px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      text-align: center;
      line-height: 41px;
      display: inline-block;
    }
  }
`;

function PayFailed(props) {
  return (
    <PayFailedWrap>
      <PayHeader />
      <div className="failedWrap">
        <div className="failedCon TxtCenter">
          <div className="mBottom30">
            <span className="failIcon TxtMiddle">
              <i className="icon icon-delete"></i>
            </span>
            <span className="Font40 mLeft10 TxtMiddle">{_l('支付失败')}</span>
          </div>
          <div className="Font14 LineHeight30 mTop30">{_l('抱歉，您在支付中遇到异常问题！')}</div>
          <div className="Font14 LineHeight30">{_l('请尝试重新支付，或拨打400-665-6655联系顾问帮助支付。')}</div>
        </div>
      </div>
    </PayFailedWrap>
  );
}

const Comp = preall(PayFailed, { allowNotLogin: false });
const root = createRoot(document.querySelector('#app'));

root.render(<Comp />);
