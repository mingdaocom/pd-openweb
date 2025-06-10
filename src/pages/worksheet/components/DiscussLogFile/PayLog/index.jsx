import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, LoadDiv } from 'ming-ui';
import paymentAjax from 'src/api/payment.js';
import { agreeOrRefuseRefundConfirm } from 'src/pages/Admin/pay/components/MobileRefundModal';
import { refundConfirmFunc } from 'src/pages/Admin/pay/components/MobileRefundModal';
import reimburseDialogFunc from 'src/pages/Admin/pay/Merchant/components/WithdrawReimburseDialog';
import { browserIsMobile } from 'src/utils/common';
import { infoKeys, refundInfoKeys, refundStatusList, sourceTypeInfo, statusList } from './config';

const WrapCon = styled.div`
  overflow: auto;
`;
const Wrap = styled.div`
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
  .status {
    padding: 6px 10px;
    border-radius: 3px;
    background: #f8f8f8;
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
  .refundBtn,
  .cancelRefundBtn {
    background: rgba(244, 67, 54, 0.13);
    &:hover {
      background: rgba(244, 67, 54, 0.23);
    }
    padding: 10px 0;
    border-radius: 3px;
    &.cancelRefundBtn {
      background: rgba(33, 150, 243, 0.13);
      &:hover {
        background: rgba(33, 150, 243, 0.23);
      }
    }
    &.disable {
      cursor: not-allowed;
      background: #f5f5f5 !important;
    }
  }
  .optionCon {
    gap: 10px;
    .okBtn,
    .refuseBtn {
      padding: 10px 0;
      background: rgba(76, 175, 80, 0.13);
      &:hover {
        background: rgba(76, 175, 80, 0.23);
      }
      border-radius: 3px;
      &.refuseBtn {
        background: rgba(244, 67, 54, 0.13);
        &:hover {
          background: rgba(244, 67, 54, 0.23);
        }
      }
      &.disable {
        cursor: not-allowed;
        background: #f5f5f5 !important;
      }
    }
  }
`;

const MobileEmptyWrap = styled.div`
  justify-content: center;
  .iconWrap {
    width: 80px;
    height: 80px;
    border-radius: 80%;
    background-color: #e0e0e0;
  }
`;

const Btn = styled.div`
  flex: 1;
  height: 36px;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  &:hover {
    color: #2196f3;
    border: 1px solid #2196f3;
  }
`;

export default function PayLog(props) {
  const { projectId, worksheetId, rowId, appId, viewId } = props;
  const [{ payOrder, loading, refundOrders, allowRefund, editing }, setState] = useSetState({
    payOrder: {},
    loading: true,
    refundOrders: [],
    allowRefund: false,
    editing: false,
  });
  const isMobile = browserIsMobile();

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
      .then(data => {
        setState({
          loading: false,
          payOrder: data.payOrder,
          refundOrders: data.refundOrders,
          allowRefund: data.allowRefund,
          editing: false,
        });
      });
  };

  const changeStatus = (refundOrderId, status) => {
    if (editing) return;
    setState({
      editing: true,
    });
    paymentAjax
      .editRefundOrderStatus({
        projectId,
        refundOrderId,
        status,
        refundSourceType: 1,
        appId,
      })
      .then(res => {
        getInfo();
      })
      .catch(() => {
        // alert(_l('操作失败，请稍后再试'), 2);
        setState({
          editing: false,
        });
      });
  };

  if (loading) {
    return <LoadDiv />;
  }
  if (!!payOrder.msg) {
    if (isMobile) {
      return (
        <MobileEmptyWrap className="flexColumn valignWrapper h100">
          <div className="iconWrap flexRow justifyContentCenter alignItemsCenter">
            <i className="icon icon-sp_account_balance_wallet_white Font50 White" />
          </div>
          <div className="Font18 Gray_bd mTop20">{_l('暂无付款明细')}</div>
        </MobileEmptyWrap>
      );
    }
    return <div className="Gray_bd Font13 mTop80 pTop100 TxtCenter">{_l('暂无数据')}</div>;
  }

  const onOk = item => {
    if (editing) return;
    if (isMobile) {
      agreeOrRefuseRefundConfirm({
        status: 6,
        amount: item.amount,
        onOk: () => {
          changeStatus(item.refundOrderId, 6);
        },
      });
      return;
    }

    Dialog.confirm({
      title: _l('是否同意退款？'),
      okText: _l('同意'),
      description: _l('同意退款后，申请的退款金额 ¥%0 将原路退回到用户账户中', item.amount),
      onOk: () => {
        changeStatus(item.refundOrderId, 6);
      },
    });
  };

  const onRefuse = item => {
    if (editing) return;
    if (isMobile) {
      agreeOrRefuseRefundConfirm({
        status: 4,
        onOk: () => {
          changeStatus(item.refundOrderId, 4);
        },
      });
      return;
    }

    Dialog.confirm({
      title: _l('是否拒绝退款？'),
      okText: _l('拒绝'),
      buttonType: 'danger',
      onOk: () => {
        changeStatus(item.refundOrderId, 4);
      },
    });
  };

  const onRefund = () => {
    if (editing) return;
    const { amount, refundAmount, orderId, merchantOrderId, taxAmount, description, merchantNo } = payOrder;

    if (isMobile) {
      refundConfirmFunc({
        max: amount - refundAmount > 0 ? (amount - refundAmount).toFixed(2) : undefined,
        projectId,
        merchantNo,
        orderId,
        merchantOrderId,
        taxAmount,
        description,
        refundSourceType: 1,
        refundSuccuss: getInfo,
        viewId,
      });
      return;
    }

    reimburseDialogFunc({
      type: 'reimburse',
      title: <span className="Red">{_l('是否确定退款?')}</span>,
      buttonType: 'danger',
      okText: _l('退款'),
      label: _l('退款金额'),
      projectId,
      max: amount - refundAmount > 0 ? (amount - refundAmount).toFixed(2) : undefined,
      min: 0.01,
      cancelPasswordVerify: true,
      viewId,
      orderInfo: {
        merchantNo,
        orderId,
        merchantOrderId,
        taxAmount,
        description,
      },
      refundSourceType: 1,
      updateStatus: editing => {
        setState({
          editing,
        });
      },
      updateList: () => {
        getInfo();
      },
    });
  };

  const renderRefund = o => {
    // 状态 0 退款中 1 退款失败 2 已退款 3 待处理 4 已拒绝 5 已取消 6 同意退款 8 已取消（组织后台手动取消）
    const text = refundStatusList.find(it => it.key === o.status).text;
    return (
      <Wrap className={cx('Font13', isMobile ? 'mTop10' : 'mTop20')}>
        <div className="flexRow alignItemsCenter mBottom16">
          <span className="topTitle overflow_ellipsis flex Bold Gray Font15">{o.description}</span>
          {![3].includes(o.status) && (
            <span
              className={cx(
                'status mLeft30 Bold',
                [5].includes(o.status) ? 'Gray_75' : [4, 1].includes(o.status) ? 'err' : 'war',
              )}
            >
              {text}
            </span>
          )}
        </div>
        {refundInfoKeys.map((a, i) => {
          if (![2].includes(o.status) && a.key === 'refundTime') {
            //只有已退款才有退款时间
            return;
          }
          if (a.key === 'operatorAccountInfo' && !_.get(o, `operatorAccountInfo.accountId`)) {
            return;
          }
          return (
            <div className={cx('flexRow alignItemsCenter', { mBottom12: i < refundInfoKeys.length - 1 })}>
              <span className={cx('payTitle Gray_75 Bold')}>{a.txt}</span>
              <span className={cx('con mLeft15 WordBreak Gray')}>
                {['createTime', 'refundTime'].includes(a.key)
                  ? moment(o[a.key]).format('YYYY-MM-DD HH:mm:ss')
                  : ['payAccountInfo', 'operatorAccountInfo'].includes(a.key)
                    ? a.key === 'payAccountInfo' && o.sourceType === 6
                      ? '-'
                      : _.get(o, `${a.key}.fullname`)
                    : o[a.key]}
                {['amount', 'payAmount'].includes(a.key) ? <span className="pLeft5">{_l('元')} </span> : ''}
              </span>
            </div>
          );
        })}
        {/* 退款单操作权限 0无操作权限1取消退款权限2同意或拒绝权限3退款单用户既是付款人又有退款审批权限 */}
        {(o.refundOperation === 1 || o.refundOperation === 3) && (
          <div
            className={cx('cancelRefundBtn w100 mTop24 TxtCenter Bold', { Hand: !editing, disable: editing })}
            onClick={() => changeStatus(o.refundOrderId, 5)}
          >
            {_l('取消退款')}
          </div>
        )}
        {(o.refundOperation === 2 || o.refundOperation === 3) && (
          <div className="flexRow optionCon mTop24">
            <div
              className={cx('okBtn flex TxtCenter Bold', { Hand: !editing, disable: editing })}
              onClick={() => onOk(o)}
            >
              {_l('同意')}
            </div>
            <div
              className={cx('refuseBtn flex TxtCenter Bold', { Hand: !editing, disable: editing })}
              onClick={() => onRefuse(o)}
            >
              {_l('拒绝')}
            </div>
          </div>
        )}
      </Wrap>
    );
  };

  const renderRefundCon = () => {
    return (
      <div className="">
        {refundOrders.map(o => {
          return renderRefund(o);
        })}
      </div>
    );
  };

  const renderPay = () => {
    const data = statusList.find(o => o.key === payOrder.status) || {};
    let list = infoKeys;
    //  退款金额 没有 则不显示
    // 已支付、待支付、支付超时；不展示退款金额字段
    if (!payOrder.refundAmount || [0, 1, 4].includes(payOrder.status)) {
      list = list.filter(o => o.key !== 'refundAmount');
    }
    return (
      <Wrap className={cx('Font13')}>
        <div className="flexRow alignItemsCenter mBottom16">
          <span className="topTitle overflow_ellipsis flex Bold Gray Font15">{payOrder.description}</span>
          <span className={cx('status mLeft30 Bold', data.type)}>{data.text}</span>
        </div>
        {list.map((o, i) => {
          const isNull =
            (o.key === 'paidTime' && ![1, 3, 5, 2].includes(payOrder.status)) || //支付时间
            (o.key === 'refundAmount' && ![3, 5].includes(payOrder.status)) || //退款金额
            ([0, 4].includes(payOrder.status) &&
              ['settlementAmount', 'taxAmount'].includes(o.key) &&
              !payOrder[o.key]) || //待支付/支付超时结算金额和手续费显示-
            (!payOrder[o.key] && payOrder[o.key] !== 0); //已支付/已退款/部分退款直接显示结算金额和手续费
          return (
            <div className={cx('flexRow alignItemsCenter', { mBottom12: i < list.length - 1 })}>
              <span className={cx('payTitle Gray_75 Bold')}>{o.txt}</span>
              <span className={cx('con mLeft15 WordBreak Gray')}>
                {o.key === 'sourceType'
                  ? sourceTypeInfo[payOrder[o.key]]
                  : o.key === 'payOrderType'
                    ? payOrder.payOrderType === 0 //payOrderType 0支付宝 1微信 -1未支付
                      ? _l('支付宝')
                      : payOrder.payOrderType === 1
                        ? _l('微信')
                        : '-'
                    : isNull
                      ? '-'
                      : ['createTime', 'paidTime'].includes(o.key)
                        ? moment(payOrder[o.key]).format('YYYY-MM-DD HH:mm:ss')
                        : ['payAccountInfo'].includes(o.key)
                          ? o.key === 'payAccountInfo' && payOrder.sourceType === 6
                            ? '-'
                            : _.get(payOrder, `${o.key}.fullname`)
                          : payOrder[o.key]}
                {['taxAmount', 'refundAmount', 'settlementAmount', 'amount'].includes(o.key) && !isNull ? (
                  <span className="pLeft5">{_l('元')} </span>
                ) : (
                  ''
                )}
              </span>
            </div>
          );
        })}
        {allowRefund && (
          <div
            className={cx('refundBtn w100 mTop24 TxtCenter Bold', { Hand: !editing, disable: editing })}
            onClick={() => onRefund()}
          >
            {_l('申请退款')}
          </div>
        )}
        {payOrder.status === 0 && !isMobile && (
          <div className="flexRow mTop12">
            <Btn
              className="mRight6"
              onClick={() => {
                copy(`${md.global.Config.WebUrl}orderpay/${payOrder.orderId}`);
                alert(_l('链接已复制'));
              }}
            >
              <i className="icon icon-add_link Font22 LineHeight36 mRight8 TxtMiddle" />
              <span className="TxtMiddle">{_l('获取支付链接')}</span>
            </Btn>
          </div>
        )}
      </Wrap>
    );
  };

  return (
    <WrapCon className={cx('h100', isMobile ? 'pAll10' : 'pAll20')}>
      {renderPay()}
      {renderRefundCon()}
    </WrapCon>
  );
}
