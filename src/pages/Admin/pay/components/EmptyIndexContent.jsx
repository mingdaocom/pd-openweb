import React from 'react';
import styled from 'styled-components';
import { Button, Icon } from 'ming-ui';
import invoiceEmpty from '../images/invoiceEmpty.png';
import merchantEmpty from '../images/merchantEmpty.png';

const DescWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 50px 0 70px;
  .item {
    border-radius: 10px;
    border: 1px solid #ededed;
    text-align: center;
    padding: 24px 20px;
    flex: 1;
    &:nth-child(2) {
      margin: 0 20px;
    }
    .title {
      font-weight: 500;
    }
    .icon {
      vertical-align: -2px;
    }
  }
`;

const ActivePayment = styled(Button)`
  height: 48px;
  border-radius: 24px !important;
`;

const CONFIG_DATA = {
  merchant: {
    img: merchantEmpty,
    title: _l('申请商户号，开通组织在线收款'),
    desc: _l('场景举例：在线教育场景中用户购买课程或服务；各类活动报名在线完成报名费支付；电商零售场景中下单购买商品'),
    cardList: [
      {
        title: _l('支付收款'),
        desc: _l('需完成商户签约认证或绑定微信/支付宝直连商户'),
        icon: 'sp_account_balance_wallet_white',
      },
      { title: _l('资金管理'), desc: _l('独立收款并提供安全、便捷的资金管理功能'), icon: 'navigation_key' },
      { title: _l('聚合支付'), desc: _l('在多端场景下使用微信/支付宝聚合支付'), icon: 'phonelink' },
    ],
  },
  invoice: {
    img: invoiceEmpty,
    title: _l('申请开票税号，搭建企业电子开票能力'),
    desc: _l('电子开票功能费：按税号收取，年费 1500元/税号'),
    cardList: [
      { title: _l('支付联动'), desc: _l('订单—发票闭环，减少手工操作'), icon: 'account_balance_wallet' },
      { title: _l('降本增效'), desc: _l('流程在线化，减少人工与纸票成本'), icon: 'stats_line_chart' },
      { title: _l('客户友好'), desc: _l('客户可自助下载，开票状态实时通知'), icon: 'group' },
    ],
  },
};

export default function EmptyIndexContent(props) {
  const { type = 'merchant', onBtnClick = () => {}, hideBtn = false } = props;
  const data = CONFIG_DATA[type] || {};

  return (
    <div className="h100 flexColumn alignItemsCenter justifyContentCenter pBottom20">
      <img src={data.img} style={{ width: 90 }} />
      <div className="Font24 bold mTop30">{data.title}</div>
      <div className="Gray_75 Font18 mTop12">{data.desc}</div>
      <DescWrap>
        {data.cardList.map((item, index) => {
          const { title, desc, icon } = item;
          return (
            <div className="item" key={index}>
              <div className="Gray Font17 title">
                <Icon icon={icon} className="Black mRight8 Font24" />
                <span>{title}</span>
              </div>
              <div className="Gray_75 Font15 mTop10">{desc}</div>
            </div>
          );
        })}
      </DescWrap>
      {!hideBtn && (
        <ActivePayment type="primary" className="activatePayment Font15 mBottom20" onClick={onBtnClick}>
          {_l('立即申请')}
        </ActivePayment>
      )}
    </div>
  );
}
