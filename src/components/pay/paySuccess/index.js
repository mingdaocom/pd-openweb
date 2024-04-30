import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import preall from 'src/common/preall';
import PayHeader from '../payHeader';
import DocumentTitle from 'react-document-title';
import orderController from 'src/api/order';
import { getRequest } from 'src/util';
import moment from 'moment';
import styled from 'styled-components';

const PaySuccessWrap = styled.div`
  .successWrap {
    margin: 80px auto;
    width: 800px;
    padding: 50px 20px;
    box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
    .okIcon {
      border: 2px solid #39c028;
      color: #fff;
      background: #39c028;
      font-size: 30px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      text-align: center;
      line-height: 41px;
      display: inline-block;
    }
    .toMdBtn {
      display: block;
      width: 250px;
      height: 38px;
      line-height: 38px;
      text-align: center;
      background-color: #1e88e5;
      transition: all 0.35s ease-in;
      color: #fff;
      margin: 0 auto 50px;
      border-radius: 3px;
      &:hover {
        background-color: #1565c0;
      }
    }
    .orderTitle {
      width: 100px;
      display: inline-block;
    }
  }
`;

const ORDERTYPE = {
  NORMAL: 0, // 未知
  NEW: 1, // 新订单
  AGAINFIRST: 2, // 首次续约
  RECHARGE: 3, // 充值
  AGAINOTHER: 4, // 再次续约
  ADDPERSON: 6, // 增补人数
  ONEDAY: 9, // 一天包
  TRIAL: 10, // 试用订单
  UPGRADE: 11, // 升级订单
};

const getOrderTxt = data => {
  const { orderType, version = {} } = data;
  switch (orderType) {
    case ORDERTYPE.NEW:
    case ORDERTYPE.AGAINFIRST:
    case ORDERTYPE.UPGRADE:
      return _l('感谢您开通%0，现在可以开始使用啦', version.name);
    case ORDERTYPE.AGAINOTHER:
      return _l('为了不影响您正常使用，请去续费外部用户');
    case ORDERTYPE.RECHARGE:
      return _l('感谢您购买充值包，现在可以开始使用啦');
    case ORDERTYPE.ADDPERSON:
      return _l('感谢您购买用户增补包，现在可以开始使用啦');
    case ORDERTYPE.ONEDAY:
      return _l('感谢您成功续费一天%0，现在可以开始使用啦', version.name);
    default:
      return '';
  }
};

function PaySuccess(props) {
  const [resultData, setResResultData] = useState({});
  const { orderType, unLimited, totalUserCount, projectId, startDate, endDate, totalPrice } = resultData;
  const { orderId, payType } = getRequest();
  const start = startDate ? moment(startDate).format('YYYY.MM.DD') : '';
  const end = endDate ? moment(endDate).format('YYYY.MM.DD') : '';
  const { companyName } = _.find(md.global.Account.projects || [], o => o.projectId === projectId) || {};

  // 获取支付结果
  const getPayResult = () => {
    orderController
      .getProjectPayResult({
        orderId,
      })
      .then(data => {
        if (data) {
          setResResultData(data);
        } else {
          alert(_l('加载失败'), 2, false);
        }
      });
  };

  useEffect(() => {
    getPayResult();
  }, []);

  return (
    <PaySuccessWrap>
      <DocumentTitle title={_l('支付成功 - %0', companyName)} />
      <PayHeader projectId={projectId} title={payType === '1' ? _l('微信支付') : ''} />
      <div className="successWrap">
        <div className="mBottom30 TxtCenter">
          <span className="okIcon TxtMiddle">
            <i className="icon icon-ok"></i>
          </span>
          <span className="Font40 mLeft10 TxtMiddle">{_l('支付成功')}</span>
        </div>
        <p className="Font14 LineHeight30 TxtCenter mBottom50">{getOrderTxt(resultData)}</p>
        <a
          className="toMdBtn"
          href={
            orderType === ORDERTYPE.AGAINOTHER
              ? `/admin/expansionservice/${projectId}/portalupgrade`
              : `/admin/home/${projectId}`
          }
        >
          {orderType === ORDERTYPE.AGAINOTHER ? _l('去续费外部用户') : _l('进入组织')}
        </a>
        {_.includes([1, 2, 4, 6, 11], orderType) && (
          <div className="LineHeight30 Font14">
            <span className="orderTitle">{_l('购买人数')}</span>
            <span className="mLeft20">{unLimited ? _l('不限人数') : _l('%0人', totalUserCount)}</span>
          </div>
        )}
        {_.includes([], resultData.orderType) && (
          <div className="LineHeight30 Font14">
            <span className="orderTitle">{_l('购买时限')}</span>
            <span className="mLeft20">{_l('%0 至 %1', start, end)}</span>
          </div>
        )}
        <div className="LineHeight30 Font14">
          <span className="orderTitle">{_l('支付金额')}</span>
          <span className="mLeft20">{_l('%0元（人民币）', totalPrice)}</span>
        </div>
        <p className="LineHeight30 Gray_8 pTop20">
          {_l(
            '如需发票，请拨打 %0 联系顾问，为您开具发票；您也可以前往组织管理 - > 账务，进行申请',
            md.global.Config.ServiceTel,
          )}
        </p>
      </div>
    </PaySuccessWrap>
  );
}

const Comp = preall(PaySuccess, { allowNotLogin: false });

ReactDOM.render(<Comp />, document.querySelector('#paySuccess'));
