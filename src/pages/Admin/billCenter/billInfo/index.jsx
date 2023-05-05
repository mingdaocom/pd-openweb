import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { LoadDiv, Dropdown, ScrollView } from 'ming-ui';
import orderAjax from 'src/api/order';
import UserHead from 'src/pages/feed/components/userHead/userHead.jsx';
import copy from 'copy-to-clipboard';
import projectAjax from 'src/api/project';
import applicationAjax from 'src/api/application';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import cx from 'classnames';
import { useSetState } from 'react-use';
import { getCurrentProject } from 'src/util';
import { AccountIdOperation, BillInfoWrap } from 'src/pages/Admin/common/styled';
import {
  PAID_RECORD_TYPE,
  RECHARGE_RECORD_TYPE,
  enumInvoiceStatus,
  invoiceTypeText,
  orderRecordType,
  orderTypeText,
  orderRecordText,
  enumOrderRecordStatus,
  orderRecordStatusDropdownData,
} from './config';
import InvoiceSetting from './invoiceSetting';
import ApplyInvoice from './applyInvoice';
import DatePickerFilter from 'src/pages/Admin/common/datePickerFilter';
import Common from '../common';
import img from 'staticfiles/images/billinfo_system.png';
import _ from 'lodash';

export default function BillInfo({ match }) {
  const { 0: projectId } = _.get(match, 'params');
  const [data, setData] = useSetState({});
  const [paras, setPara] = useSetState({ pageIndex: 1, pageSize: 20, status: 0, recordTypes: PAID_RECORD_TYPE });
  const [{ applyInvoiceVisible, applyOrderId, invoiceVisible, operateMenuVisible, datePickerVisible }, setVisible] =
    useSetState({
      applyInvoiceVisible: false,
      invoiceVisible: false,
      operateMenuVisible: -1,
      datePickerVisible: false,
      applyOrderId: '',
    });
  const [loading, setLoading] = useState(false);
  const [hasMoreDataFlag, setFlag] = useState(true);
  const [displayRecordType, setType] = useState('paid');
  const { balance, list = [], allCount, invoiceType } = data;
  const { pageIndex, status, pageSize, startDate, endDate } = paras;
  const isPaid =
    _.get(_.find(md.global.Account.projects, project => project.projectId === projectId) || {}, 'licenseType') === 1;
  const isRechargeType = displayRecordType === 'recharge';
  const { companyName } = getCurrentProject(projectId);
  const refreshData = () => {
    setLoading(true);
    orderAjax
      .getTransactionRecordByPage({ projectId, ...paras, status: displayRecordType === 'recharge' ? 0 : paras.status })
      .then(({ list }) => {
        setData({ list });
        if (list.length < pageSize) {
          setFlag(false);
        }
      })
      .always(() => {
        setLoading(false);
      });
  };

  const cancelOrderFn = ({ recordType, orderId }) => {
    if (confirm(_l('确定取消该订单？'))) {
      if (_.includes([5, 6], recordType)) {
        alert(_l('正在取消订单...'), 1, 80000);
        applicationAjax
          .updateAppBillingStatus({
            projectId,
            billingId: orderId,
            status: 0,
          })
          .then(function (data) {
            if (data.success) {
              alert(_l('已成功取消订单'));
              refreshData();
            } else {
              alert(_l('取消订单失败'), 2);
            }
          });
      } else {
        orderAjax
          .cancelOrder({
            projectId,
            orderId,
          })
          .then(function (data) {
            if (data) {
              alert(_l('已成功取消订单'));
              refreshData();
            } else {
              alert(_l('取消订单失败'), 2);
            }
          });
      }
    }
  };
  useEffect(() => {
    document.title = _l('组织管理 - 账务 - %0', companyName);
    return () => {
      document.title = _l('');
    };
  }, []);

  useEffect(() => {
    axios.all([projectAjax.getProjectLicenseSupportInfo({ projectId })]).then(res => {
      let data = res.reduce((p, c) => ({ ...p, ...c }), {});
      setData(data);
    });
  }, [displayRecordType]);

  useEffect(() => {
    setLoading(true);
    orderAjax
      .getTransactionRecordByPage({ projectId, ...paras, status: displayRecordType === 'recharge' ? 0 : paras.status })
      .then(({ list, allCount }) => {
        setData({ list, allCount });
        if (list.length < pageSize) {
          setFlag(false);
        }
      })
      .always(() => {
        setLoading(false);
      });
  }, [paras]);
  const handleClick = type => {
    if (type === 'recharge') {
      location.href = `/admin/valueaddservice/${projectId}`;
    }
  };
  const getValue = value => (loading ? '-' : value);
  const renderPay = ({ status, payAccountInfo = {}, orderId, recordType }) => {
    const { accountId, avatar, fullname } = payAccountInfo;
    if (status === 1) {
      return (
        <div
          className="goToPay"
          onClick={() =>
            (location.href = _.includes([5, 6], recordType)
              ? `/admin/appBillDetail/${projectId}/2/${orderId}`
              : `/admin/waitingPay/${projectId}/${orderId}`)
          }
        >
          {_l('立即支付')}
        </div>
      );
    }
    if (_.includes([3, 4, 5], status)) return null;
    return accountId ? (
      <Fragment>
        <UserHead className="billOwner" size={24} user={{ accountId, userHead: avatar }} />
        <span>{fullname}</span>
      </Fragment>
    ) : (
      <Fragment>
        <img src={img} alt={_l('系统')} />
        <span>{_l('系统')}</span>
      </Fragment>
    );
  };
  const renderRows = () => {
    const start = list.length ? pageSize * (pageIndex - 1) : 0;
    return _l('第 %0 - %1 条,共 %2 条', start + 1, start + list.length, allCount || 0);
  };
  const renderRecordList = () => {
    if (loading) return <LoadDiv />;
    if (!list.length) return <div className="emptyList">{_l('无相应订单数据')}</div>;
    return (
      <ScrollView>
        <ul className="recordList">
          {list.map(
            (
              {
                recordId,
                orderId,
                createTime,
                updateTime,
                recordType,
                price,
                status,
                remark,
                invoiceStatus,
                createAccountInfo,
                payAccountInfo,
                recordTypeTitle,
              },
              index,
            ) => (
              <li key={orderId || recordId} className="recordItem">
                <div className="time overflow_ellipsis item Font14 Gray_75">{createTime}</div>
                <div className={cx('type overflow_ellipsis item', { rechargeType: displayRecordType === 'recharge' })}>
                  {isRechargeType
                    ? orderTypeText[orderRecordType[recordType]] +
                      (recordTypeTitle ? '（' + recordTypeTitle + '）' : '')
                    : orderTypeText[orderRecordType[recordType]]}
                </div>
                <div className={cx('amount item', { isPositive: price > 0 })}>{price}</div>
                {isRechargeType ? (
                  <Fragment>
                    <div className="createPerson overflow_ellipsis item">
                      {createAccountInfo ? (
                        <Fragment>
                          <UserHead
                            className="billOwner"
                            size={24}
                            user={{ accountId: createAccountInfo.accountId, userHead: createAccountInfo.avatar }}
                          />
                          <span>{createAccountInfo.fullname}</span>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <img src={img} alt={_l('系统')} />
                          <span>{_l('系统')}</span>
                        </Fragment>
                      )}
                    </div>
                    <div className="fromType item">{_l('系统')}</div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div className="billStatus overflow_ellipsis item">
                      {orderRecordText[enumOrderRecordStatus[status]]}
                    </div>
                    <div className={cx('invoiceStatus overflow_ellipsis item', enumInvoiceStatus[invoiceStatus])}>
                      {invoiceTypeText[enumInvoiceStatus[invoiceStatus]]}
                    </div>
                    <div className="createPerson overflow_ellipsis item">
                      {createAccountInfo ? (
                        <Fragment>
                          <UserHead
                            className="billOwner"
                            size={24}
                            user={{ accountId: createAccountInfo.accountId, userHead: createAccountInfo.avatar }}
                          />
                          <span>{createAccountInfo.fullname}</span>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <img src={img} alt={_l('系统')} />
                          <span>{_l('系统')}</span>
                        </Fragment>
                      )}
                    </div>
                    {/* <div className="paidPerson overflow_ellipsis item">
                      {renderPay({ status, payAccountInfo, orderId, recordType })}
                    </div> */}
                    <Trigger
                      popupVisible={operateMenuVisible === index}
                      onPopupVisibleChange={visible => setVisible({ operateMenuVisible: visible ? index : -1 })}
                      action={['click']}
                      popup={
                        <AccountIdOperation>
                          {status === Common.orderRecordStatus.success &&
                            _.includes([enumInvoiceStatus.notApply], invoiceStatus) && (
                              <li
                                onClick={() => {
                                  setVisible({
                                    applyInvoiceVisible: true,
                                    applyOrderId: orderId || recordId,
                                    operateMenuVisible: -1,
                                  });
                                }}
                              >
                                {_l('申请发票')}
                              </li>
                            )}
                          <li
                            className="copyOrderId"
                            onClick={() => {
                              copy(`${orderId || recordId}`);
                              alert(_l('复制成功'));
                            }}
                          >
                            {_l('复制账单Id')}
                          </li>
                          {status === 1 && (
                            <li onClick={() => cancelOrderFn({ recordType, orderId })}>{_l('取消订单')}</li>
                          )}
                        </AccountIdOperation>
                      }
                      popupAlign={{ points: ['tr', 'bc'], offset: [0, -15] }}
                    >
                      <div className="operation Gray_9e item">
                        <i className="icon-moreop Font18 pointer" />
                      </div>
                    </Trigger>
                  </Fragment>
                )}
              </li>
            ),
          )}
        </ul>
      </ScrollView>
    );
  };
  return (
    <BillInfoWrap>
      <div className="billInfoHeader">
        <div className="title">账务</div>
        <div
          className="invoiceSetting pointer adminHoverColor"
          onClick={() => {
            setVisible({ invoiceVisible: true });
          }}
        >
          {_l('发票设置')}
        </div>
      </div>
      <div className="billInfoBox">
        <div className="accountInfo">
          <div className="balanceWrap">
            <i className="icon-sp_account_balance_wallet_white Font24" />
            <span>{_l('账户余额')}</span>
            <span className="moneySymbol Gray_75">(￥)</span>
            <span className="balance Font24">{getValue((balance || 0).toLocaleString())}</span>
            {/* isPaid && (
              <span className="recharge pointer adminHoverColor" onClick={() => handleClick('recharge')}>
                {_l('充值')}
              </span>
            )*/}
          </div>
        </div>
        <div className="listHeader">
          <ul className="recordType">
            <li
              className={cx({ active: displayRecordType === 'paid' })}
              onClick={() => {
                setType('paid');
                setFlag(true);
                setPara({ recordTypes: PAID_RECORD_TYPE, pageIndex: 1 });
              }}
            >
              {_l('支付记录')}
            </li>
            <li
              className={cx({ active: displayRecordType === 'recharge' })}
              onClick={() => {
                setType('recharge');
                setFlag(true);
                setPara({ recordTypes: RECHARGE_RECORD_TYPE, pageIndex: 1 });
              }}
            >
              {_l('扣费记录')}
            </li>
          </ul>
          <div className="dataFilter">
            <Trigger
              popupVisible={datePickerVisible}
              onPopupVisibleChange={visible => setVisible({ datePickerVisible: visible })}
              action={['click']}
              popupAlign={{ points: ['tl', 'bl'] }}
              popup={
                <DatePickerFilter
                  updateData={data => {
                    setPara({ ...data });
                    setFlag(true);
                    setVisible({ datePickerVisible: false });
                  }}
                />
              }
            >
              <div className="date Gray_75" data-tip={_l('按照时间筛选')}>
                <i className="Font18 icon-sidebar_calendar" />
              </div>
            </Trigger>
            {startDate ? (
              <div className="dateRange">
                {_l('%0 ~ %1', startDate, endDate)}
                <i className="icon-close" onClick={() => setPara({ startDate: '', endDate: '' })} />
              </div>
            ) : null}
            <div className="rows">{renderRows()}</div>
            <div className="switchPage">
              <div className={cx('prevPage mRight24', { disable: pageIndex === 1 })} data-tip={_l('上一页')}>
                <i
                  className="icon-arrow-left-border"
                  onClick={() => pageIndex !== 1 && setPara({ pageIndex: Math.max(1, pageIndex - 1) })}
                />
              </div>
              <div className={cx('nextPage', { disable: !hasMoreDataFlag })} data-tip={_l('下一页')}>
                <i
                  className="icon-arrow-right-border"
                  onClick={() => {
                    if (hasMoreDataFlag) {
                      setPara({ pageIndex: pageIndex + 1 });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="listTitle">
          <div className="time item">{_l('时间')}</div>
          <div className={cx('type item', { rechargeType: isRechargeType })}>{_l('类型')}</div>
          <div className="amount item Gray_75">{_l('金额')}</div>
          {isRechargeType ? (
            <Fragment>
              <div className="createPerson item">{_l('创建人')}</div>
              <div className="fromType item">{_l('来源')}</div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="billStatus item">
                <Dropdown
                  data={orderRecordStatusDropdownData}
                  value={status}
                  onChange={value => {
                    setPara({ status: value });
                    setFlag(true);
                  }}
                />
              </div>
              <div className="invoiceStatus item">{_l('发票状态')}</div>
              <div className="createPerson item">{_l('创建人')}</div>
              <div className="paidPerson item">{_l('付款人')}</div>
              <div className="operation item">{_l('操作')}</div>
            </Fragment>
          )}
        </div>
        {renderRecordList()}
      </div>
      {invoiceVisible && <InvoiceSetting projectId={projectId} onClose={() => setVisible({ invoiceVisible: false })} />}
      {applyInvoiceVisible && (
        <ApplyInvoice
          projectId={projectId}
          orderId={applyOrderId}
          onClose={() => setVisible({ applyInvoiceVisible: false, applyOrderId: '' })}
        />
      )}
    </BillInfoWrap>
  );
}
