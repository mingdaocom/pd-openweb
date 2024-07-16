import React, { Fragment, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import cx from 'classnames';
import paymentAjax from 'src/api/payment.js';
import { useSetState } from 'react-use';
import moment from 'moment';
import { browserIsMobile } from 'src/util';

const Wrap = styled.div`
  margin: 20px;
  background: #ffffff;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 20px;
  .payTitle {
    font-weight: 400;
    flex-shrink: 0;
    min-width: 0;
  }
  .con {
    font-weight: 400;
    flex-shrink: 0;
    min-width: 0;
    flex: 1;
  }
  .success {
    color: #4caf50;
  }
  .err {
    color: #f44336;
  }
  .wait {
    color: #2196f3;
  }
  .war {
    color: #ff9d00;
  }
`;
// const keys = [订单编号、交易金额、结算金额、结算手续费、退款金额、下单时间、支付方式、交易单号、支付时间]
const infoKeys = [
  {
    key: 'orderId',
    txt: _l('订单编号'),
  },
  {
    key: 'amount',
    txt: _l('交易金额'),
  },
  {
    key: 'settlementAmount',
    txt: _l('结算金额'),
  },
  {
    key: 'taxAmount',
    txt: _l('结算手续费'),
  },
  {
    key: 'refundAmount',
    txt: _l('退款金额'),
  },
  {
    key: 'payOrderType',
    txt: _l('支付方式'),
  },
  {
    key: 'shortName',
    txt: _l('收款账户'),
  },
  {
    key: 'createTime',
    txt: _l('下单时间'),
  },
  {
    key: 'paidTime',
    txt: _l('支付时间'),
  },
  {
    key: 'merchantOrderId',
    txt: _l('交易单号'),
  },
];
// status 0待支付 1已支付 2退款中 3已退款 4支付超时 5部分退款
const statusList = [
  {
    key: 0,
    text: _l('待支付'),
    type: 'wait',
  },
  {
    key: 1,
    text: _l('支付成功'),
    type: 'success',
  },
  {
    key: 2,
    text: _l('退款中'),
    type: 'war',
  },
  {
    key: 3,
    text: _l('已退款'),
    type: 'success',
  },
  {
    key: 4,
    text: _l('订单超时'),
    type: 'err',
  },
  {
    key: 5,
    text: _l('部分退款'),
    type: 'war',
  },
];

export default function PayLog(props) {
  const { projectId, worksheetId, rowId, appId } = props;
  const [{ info, loading }, setState] = useSetState({
    info: {},
    loading: true,
  });

  useEffect(() => {
    getInfo();
  }, [props.formFlag]);

  const getInfo = () => {
    paymentAjax
      .getPayOrderForRowDetail({
        projectId,
        worksheetId,
        rowId,
        appId,
      })
      .then(res => {
        setState({
          loading: false,
          info: res,
        });
      });
  };
  if (loading) {
    return <LoadDiv />;
  }
  if (!!info.msg) {
    return <div className="Gray_bd Font13 mTop80 pTop100 TxtCenter">{_l('暂无数据')}</div>;
  }
  const data = statusList.find(o => o.key === info.status) || {};
  let list = infoKeys;
  //  退款金额 没有 则不显示
  // 已支付、待支付、支付超时；不展示退款金额字段
  if (!info.refundAmount || [0, 1, 4].includes(info.status)) {
    list = list.filter(o => o.key !== 'refundAmount');
  }
  const isMobile = browserIsMobile();

  return (
    <Wrap className={cx('Font13', { mAll10: isMobile })}>
      <div className="flexRow alignItemsCenter mBottom16">
        <span className="topTitle overflow_ellipsis flex Bold Gray Font15">{info.description}</span>
        <span className={cx('status mLeft30', data.type)}>{data.text}</span>
      </div>
      {list.map((o, i) => {
        const isNull =
          (o.key === 'paidTime' && ![1, 3, 5].includes(info.status)) || //支付时间
          (o.key === 'refundAmount' && ![3, 5].includes(info.status)) || //退款金额
          ([0, 4].includes(info.status) && ['settlementAmount', 'taxAmount'].includes(o.key) && !info[o.key]) || //待支付/支付超时结算金额和手续费显示-
          (!info[o.key] && info[o.key] !== 0); //已支付/已退款/部分退款直接显示结算金额和手续费
        return (
          <div className={cx('flexRow alignItemsCenter', { mBottom12: i < list.length - 1 })}>
            <span className={cx('payTitle Gray_75')}>{o.txt}</span>
            <span className={cx('con mLeft15 WordBreak Gray')}>
              {o.key === 'payOrderType'
                ? info.payOrderType === 0 //payOrderType 0支付宝 1微信 -1未支付
                  ? _l('支付宝')
                  : info.payOrderType === 1
                  ? _l('微信')
                  : '-'
                : isNull
                ? '-'
                : ['createTime', 'paidTime'].includes(o.key)
                ? moment(info[o.key]).format('YYYY-MM-DD HH:mm:ss')
                : info[o.key]}
              {['taxAmount', 'refundAmount', 'settlementAmount', 'amount'].includes(o.key) && !isNull ? (
                <span className="pLeft5">{_l('元')} </span>
              ) : (
                ''
              )}
            </span>
          </div>
        );
      })}
    </Wrap>
  );
}
