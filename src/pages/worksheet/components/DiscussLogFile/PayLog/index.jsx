import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Dialog, LoadDiv, MenuItem } from 'ming-ui';
import paymentAjax from 'src/api/payment.js';
import { agreeOrRefuseRefundConfirm } from 'src/pages/Admin/pay/components/MobileRefundModal';
import { refundConfirmFunc } from 'src/pages/Admin/pay/components/MobileRefundModal';
import reimburseDialogFunc from 'src/pages/Admin/pay/Merchant/components/WithdrawReimburseDialog';
import ApplyInvoiceBtn from 'src/pages/invoice/ApplyInvoiceBtn';
import { INVOICE_STATUS } from 'src/pages/invoice/constant';
import { browserIsMobile } from 'src/utils/common';
import { infoKeys, refundInfoKeys, refundStatusList, selectPayStatusList, sourceTypeInfo, statusList } from './config';

const WrapCon = styled.div`
  overflow: auto;
  padding: 12px 16px;
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
    color: #1677ff;
  }
  .war {
    color: #ff9d00;
  }
  .cancel {
    color: #757575;
  }

  .refundBtn,
  .invoiceBtn,
  .cancelRefundBtn,
  .okBtn,
  .refuseBtn {
    padding: 10px 0;
    border-radius: 3px;
    text-align: center;
    font-weight: bold;
    cursor: pointer;

    background: rgba(244, 67, 54, 0.13);
    &:hover {
      background: rgba(244, 67, 54, 0.23);
    }

    &.invoiceBtn {
      background: #fff !important;
      border: 1px solid #e0e0e0;
      &:hover {
        border-color: #1677ff;
        color: #1677ff;
      }
    }
    &.cancelRefundBtn {
      background: rgba(33, 150, 243, 0.13);
      &:hover {
        background: rgba(33, 150, 243, 0.23);
      }
    }
    &.okBtn {
      background: rgba(76, 175, 80, 0.13);
      &:hover {
        background: rgba(76, 175, 80, 0.23);
      }
    }
    &.disable {
      cursor: not-allowed;
      background: #f5f5f5 !important;
    }
  }
  .gap10 {
    gap: 10px;
  }
`;

const EmptyWrap = styled.div`
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
    color: #1677ff;
    border: 1px solid #1677ff;
  }
`;

const SelectPayStatusWrap = styled.span`
  display: flex;
  align-items: center;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  width: fit-content;
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 3px;
  cursor: pointer;
  color: #757575;
  .icon.icon-arrow-down {
    color: #757575;
    font-size: 8px;
    width: 18px;
    display: inline-block;
    text-align: center;
  }
  &:hover {
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2);
  }
`;
const PopupWrap = styled.div`
  width: 220px;
  padding: 6px 0;
  background: #fff;
  box-shadow: 0 4px 16px 1px rgba(0, 0, 0, 0.24);
  .popupItem {
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    cursor: pointer;
    &:hover {
      background: #f8f8f8;
    }
  }
`;
const More = styled.div`
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  margin-left: 6px;
  border-radius: 3px;
  color: #9e9e9e;
  border: 1px solid #e0e0e0;
  &:hover {
    color: #1677ff;
  }
  &.mobileMore {
    width: 32px;
    height: 32px;
    line-height: 32px;
    border: none;
    background-color: #f6f6f6;
    color: #9d9d9d;
    &:hover {
      color: #9d9d9d;
    }
  }
`;

const MobileBtn = styled(Button)`
  border: 1px solid #eee !important;
  background-color: #fff !important;
  &.delete {
    background-color: #f44336 !important;
    border: 1px solid #f44336;
    color: #fff;
  }
`;

export default function PayLog(props) {
  const { projectId, worksheetId, rowId, appId, viewId, isCharge, updatePayConfig = () => {} } = props;
  const [
    {
      payOrders,
      loading,
      refundOrders,
      allowRefund,
      editing,
      selectStatus,
      showCancelOrder,
      showConfirmCancelOrderDialog,
      cancelOrderId,
      popupVisible,
      isOpenInvoice,
    },
    setState,
  ] = useSetState({
    payOrder: {},
    payOrders: [],
    loading: true,
    refundOrders: [],
    allowRefund: false,
    editing: false,
    selectStatus: 100,
    showCancelOrder: false,
    showConfirmCancelOrderDialog: false,
    cancelOrderId: undefined,
    popupVisible: false,
    isOpenInvoice: false,
  });
  const isMobile = browserIsMobile();
  const filterPayOrders = payOrders.filter(v =>
    isMobile
      ? true
      : (selectStatus !== 100 && selectStatus === v.status) || (selectStatus === 100 && !_.includes([4, 7], v.status)),
  );

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
          payOrders: data.payOrders,
          refundOrders: data.refundOrders,
          allowRefund: data.allowRefund,
          isOpenInvoice: data.isOpenInvoice,
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
      .then(() => {
        getInfo();
      })
      .catch(() => {
        // alert(_l('操作失败，请稍后再试'), 2);
        setState({
          editing: false,
        });
      });
  };

  const handleCancelPayOrder = orderId => {
    paymentAjax
      .cancelOrder({ orderId })
      .then(res => {
        if (res) {
          const copyPayOrders = _.clone(payOrders);
          const index = _.findIndex(copyPayOrders, v => v.orderId === orderId);
          copyPayOrders[index] = { ...copyPayOrders[index], status: 7 };
          setState({ payOrders: copyPayOrders, cancelOrderId: undefined });
          updatePayConfig();
          alert(_l('取消订单成功'));
        } else {
          alert(_l('取消订单失败'), 2);
        }
      })
      .catch(() => {
        alert(_l('取消订单失败'), 2);
      });
  };

  // 确认取消订单
  const confirmCancelOrder = orderId => {
    Dialog.confirm({
      title: _l('取消后无法恢复，是否确认取消？'),
      confirm: 'danger',
      onOk: () => handleCancelPayOrder(orderId),
    });
  };

  const renderEmpty = () => {
    return (
      <EmptyWrap className="flexColumn valignWrapper h100">
        <div className="iconWrap flexRow justifyContentCenter alignItemsCenter">
          <i className="icon icon-sp_account_balance_wallet_white Font50 White" />
        </div>
        <div className="Font15 Gray_bd mTop20 bold">{isMobile ? _l('暂无付款') : _l('暂无订单')}</div>
      </EmptyWrap>
    );
  };

  if (loading) {
    return <LoadDiv />;
  }
  if (filterPayOrders.length && !!_.get(filterPayOrders[0] || {}, 'msg')) {
    return renderEmpty();
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

  const onRefund = payOrder => {
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
                    ? a.key === 'payAccountInfo' &&
                      (o.sourceType === 6 || _.get(o, `${a.key}.accountId`) === 'user-workflow')
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
            className={cx('cancelRefundBtn w100 mTop24', { disable: editing })}
            onClick={() => changeStatus(o.refundOrderId, 5)}
          >
            {_l('取消退款')}
          </div>
        )}
        {(o.refundOperation === 2 || o.refundOperation === 3) && (
          <div className="flexRow gap10 mTop24">
            <div className={cx('okBtn flex', { disable: editing })} onClick={() => onOk(o)}>
              {_l('同意')}
            </div>
            <div className={cx('refuseBtn flex', { disable: editing })} onClick={() => onRefuse(o)}>
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
    return filterPayOrders.map(payOrder => {
      const data = statusList.find(o => o.key === payOrder.status) || {};
      let list = infoKeys;
      //  退款金额 没有 则不显示
      // 已支付、待支付、支付超时；不展示退款金额字段
      if (!payOrder.refundAmount || [0, 1, 4].includes(payOrder.status)) {
        list = list.filter(o => o.key !== 'refundAmount');
      }

      return (
        <Wrap key={payOrder.orderId} className={cx('Font13 mBottom14')}>
          <div className="flexRow alignItemsCenter mBottom16">
            <span className="topTitle overflow_ellipsis flex Bold Gray Font15">{payOrder.description}</span>
            <span className={cx('status mLeft30 Bold', data.type)}>{data.text}</span>
            {isMobile && data.key === 0 && (
              <More
                className="mobileMore"
                onClick={() => setState({ showCancelOrder: true, cancelOrderId: payOrder.orderId })}
              >
                <i className="icon icon-more_horiz Font20 LineHeight32" />
              </More>
            )}
          </div>
          {list.map((o, i) => {
            const isNull =
              (o.key === 'paidTime' && ![1, 3, 5, 2].includes(payOrder.status)) || //支付时间
              (o.key === 'refundAmount' && ![3, 5].includes(payOrder.status)) || //退款金额
              ([0, 4, 7].includes(payOrder.status) && ['settlementAmount', 'taxAmount'].includes(o.key)) || //待支付/支付超时/已取消结算金额和手续费显示-
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
                            ? o.key === 'payAccountInfo' &&
                              (payOrder.sourceType === 6 || _.get(payOrder, `${o.key}.accountId`) === 'user-workflow')
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

          {_.includes([1, 5], payOrder.status) && (
            <div className="flexRow gap10 mTop24">
              {allowRefund &&
                ((payOrder.invoiceStatus === INVOICE_STATUS.UN_INVOICED && !payOrder.invoiceId) ||
                  [INVOICE_STATUS.CANCELLED, INVOICE_STATUS.FAILED].includes(payOrder.invoiceStatus)) && (
                  <div className={cx('refundBtn flex ', { disable: editing })} onClick={() => onRefund(payOrder)}>
                    {_l('退款')}
                  </div>
                )}

              <ApplyInvoiceBtn
                className="invoiceBtn flex"
                orderInfo={{
                  orderId: payOrder.orderId,
                  orderStatus: payOrder.status,
                  amount: payOrder.amount,
                  payAccountId: payOrder.payAccountInfo?.accountId,
                }}
                isOpenInvoice={isOpenInvoice}
                invoiceStatus={payOrder.invoiceStatus}
                invoiceId={payOrder.invoiceId}
                onCallback={getInfo}
              />
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
              {/* 下单人和管理员都可以取消订单 */}
              {(isCharge || md.global.Account.accountId === _.get(payOrder, 'payAccountInfo.accountId')) && (
                <Trigger
                  popupVisible={!isMobile && showCancelOrder}
                  onPopupVisibleChange={visible => setState({ showCancelOrder: visible })}
                  popupAlign={{ points: ['tr', 'br'], offset: [0, 5], overflow: { adjustX: true, adjustY: true } }}
                  action={['click']}
                  popup={() => (
                    <PopupWrap
                      onClick={() => {
                        setState({ showCancelOrder: false });
                        confirmCancelOrder(payOrder.orderId);
                      }}
                    >
                      <MenuItem>
                        <span className="icon icon-cancel Gray_9e mRight6 Font16 TxtMiddle" />
                        <span className="TxtMiddle">{_l('取消订单')}</span>
                      </MenuItem>
                    </PopupWrap>
                  )}
                >
                  <More>
                    <i className="icon icon-more_horiz Font20 LineHeight36" />
                  </More>
                </Trigger>
              )}
            </div>
          )}
        </Wrap>
      );
    });
  };

  const renderPopup = () => {
    return (
      <PopupWrap>
        {selectPayStatusList.map(item => (
          <div
            key={item.key}
            className="popupItem"
            onClick={() => {
              setState({ selectStatus: item.key, popupVisible: false });
            }}
          >
            {item.text}
          </div>
        ))}
      </PopupWrap>
    );
  };

  return (
    <Fragment>
      <WrapCon className={cx('h100', { pAll10: isMobile })}>
        {!isMobile && (
          <Trigger
            popupAlign={{ points: ['tl', 'bl'], offset: [0, 2] }}
            action={['click']}
            popupVisible={popupVisible}
            onPopupVisibleChange={visible => setState({ popupVisible: visible })}
            popup={renderPopup}
          >
            <SelectPayStatusWrap>
              <span>{(_.find(selectPayStatusList, v => v.key === selectStatus) || { text: _l('待支付') }).text}</span>
              <i className="icon icon-arrow-down mLeft4" />
            </SelectPayStatusWrap>
          </Trigger>
        )}
        {_.includes([4, 7, 100], selectStatus) && !filterPayOrders.length ? (
          renderEmpty()
        ) : (
          <Fragment>
            {renderPay()}
            {selectStatus === 100 && renderRefundCon()}
          </Fragment>
        )}
      </WrapCon>
      <Popup
        position="bottom"
        className="mobileModal topRadius"
        visible={isMobile && showCancelOrder}
        onMaskClick={() => setState({ showCancelOrder: false })}
      >
        <div className="flexRow header LineHeight24">
          <div className="Gray_9e">{_l('订单操作')}</div>
          <div className="closeIcon TxtCenter" onClick={() => setState({ showCancelOrder: false })}>
            <icon className="icon icon-close" />
          </div>
        </div>
        <div
          className="Font15 bold pLeft15 pBottom20"
          onClick={() => setState({ showCancelOrder: false, showConfirmCancelOrderDialog: true })}
        >
          <span className="icon icon-cancel Gray_9e mRight10 Font16 TxtMiddle" />
          <span className="TxtMiddle">{_l('取消订单')}</span>
        </div>
      </Popup>

      <Popup position="bottom" className="mobileModal topRadius" visible={showConfirmCancelOrderDialog}>
        <div className="Font16 bold header Gray LineHeight24">{_l('取消后无法恢复，是否确认取消？')}</div>
        <div className="flexRow mBottom10 pLeft15 pRight15">
          <MobileBtn
            radius
            className="flex mRight6 bold Gray_75 Font13"
            onClick={() => setState({ showConfirmCancelOrderDialog: false })}
          >
            {_l('取消')}
          </MobileBtn>
          <MobileBtn
            radius
            className="flex mLeft6 bold Font13 delete"
            onClick={() => {
              setState({ showConfirmCancelOrderDialog: false });
              handleCancelPayOrder(cancelOrderId);
            }}
          >
            {_l('确定')}
          </MobileBtn>
        </div>
      </Popup>
    </Fragment>
  );
}
