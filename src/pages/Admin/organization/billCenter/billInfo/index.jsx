import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { LoadDiv, Dropdown, ScrollView, UserHead } from 'ming-ui';
import orderAjax from 'src/api/order';
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
import PaginationWrap from '../../../components/PaginationWrap';
import Common from '../common';
import img from 'staticfiles/images/billinfo_system.png';
import _ from 'lodash';
import { formatNumberThousand } from 'src/util';

export default function BillInfo({ match }) {
  const { 0: projectId } = _.get(match, 'params');
  const [data, setData] = useSetState({});
  const [paras, setPara] = useSetState({ pageIndex: 1, pageSize: 50, status: 0, recordTypes: PAID_RECORD_TYPE });
  const [{ applyInvoiceVisible, applyOrderId, invoiceVisible, operateMenuVisible, datePickerVisible }, setVisible] =
    useSetState({
      applyInvoiceVisible: false,
      invoiceVisible: false,
      operateMenuVisible: -1,
      datePickerVisible: false,
      applyOrderId: '',
    });
  const [loading, setLoading] = useState(false);
  const [displayRecordType, setType] = useState('paid');
  const { balance, list = [], allCount, invoiceType } = data;
  const { pageIndex, status, pageSize, startDate, endDate } = paras;
  const { companyName, licenseType } = getCurrentProject(projectId, true);
  const isPaid = licenseType === 1;
  const isRechargeType = displayRecordType === 'recharge';
  const refreshData = () => {
    setLoading(true);
    orderAjax
      .getTransactionRecordByPage({ projectId, ...paras, status: displayRecordType === 'recharge' ? 0 : paras.status })
      .then(({ list }) => {
        setData({ list });
      })
      .finally(() => {
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paras]);
  const handleClick = type => {
    if (type === 'recharge') {
      location.href = `/admin/valueaddservice/${projectId}`;
    }
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
                  {orderTypeText[orderRecordType[recordType]] + (recordTypeTitle ? '（' + recordTypeTitle + '）' : '')}
                </div>
                <div className={cx('amount item', { isPositive: price > 0 })}>{formatNumberThousand(price)}</div>
                {isRechargeType ? (
                  <Fragment>
                    <div className="createPerson overflow_ellipsis item">
                      {createAccountInfo ? (
                        <Fragment>
                          <UserHead
                            className="billOwner"
                            size={24}
                            user={{ accountId: createAccountInfo.accountId, userHead: createAccountInfo.avatar }}
                            projectId={projectId}
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
                            projectId={projectId}
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
      <div className="billInfoHeader orgManagementHeader">
        <div className="title">{_l('账务%15000')}</div>
        <div
          className="invoiceSetting pointer adminHoverColor"
          onClick={() => {
            setVisible({ invoiceVisible: true });
          }}
        >
          {_l('发票设置')}
        </div>
      </div>
      <div className="orgManagementContent flexColumn">
        <div className="accountInfo">
          <div className="balanceWrap">
            <i className="icon-sp_account_balance_wallet_white Font24" />
            <span>{_l('账户余额')}</span>
            <span className="moneySymbol Gray_75">(￥)</span>
            <span className="balance Font24">{loading ? '-' : formatNumberThousand(balance)}</span>
          </div>
        </div>
        <div className="listHeader">
          <ul className="recordType">
            <li
              className={cx({ active: displayRecordType === 'paid' })}
              onClick={() => {
                setType('paid');
                setPara({ recordTypes: PAID_RECORD_TYPE, pageIndex: 1 });
              }}
            >
              {_l('支付记录')}
            </li>
            <li
              className={cx({ active: displayRecordType === 'recharge' })}
              onClick={() => {
                setType('recharge');
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
              popupAlign={{ points: ['tl', 'bl'], offset: [0, 0], overflow: { adjustX: true, adjustY: true } }}
              popup={
                <DatePickerFilter
                  updateData={data => {
                    setPara({ ...data });
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
                  }}
                />
              </div>
              <div className="invoiceStatus item">{_l('发票状态')}</div>
              <div className="createPerson item">{_l('创建人')}</div>
              {/* <div className="paidPerson item">{_l('付款人')}</div> */}
              <div className="operation item">{_l('操作')}</div>
            </Fragment>
          )}
        </div>
        <div className="flex">{renderRecordList()}</div>
        <PaginationWrap
          total={allCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onChange={page => setPara({ pageIndex: page })}
        />
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
