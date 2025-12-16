import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import systemIcon from 'staticfiles/svg/system.svg';
import { Dropdown, Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import applicationAjax from 'src/api/application';
import downloadAjax from 'src/api/download';
import orderAjax from 'src/api/order';
import projectAjax from 'src/api/project';
import DatePickerFilter from 'src/pages/Admin/common/datePickerFilter';
import { AccountIdOperation, BillInfoWrap } from 'src/pages/Admin/common/styled';
import { navigateTo } from 'src/router/navigateTo';
import { formatNumberThousand } from 'src/utils/control';
import { getCurrentProject } from 'src/utils/project';
import PaginationWrap from '../../../components/PaginationWrap';
import Common from '../common';
import ApplyInvoice from './applyInvoice';
import {
  enumInvoiceStatus,
  enumOrderRecordStatus,
  invoiceTypeText,
  orderRecordPaidTypeDropdownData,
  orderRecordRechargeTypeDropdownData,
  orderRecordStatusDropdownData,
  orderRecordText,
  orderRecordType,
  orderTypeText,
  PAID_RECORD_TYPE,
  PAY_TYPE,
  RECHARGE_RECORD_TYPE,
} from './config';
import InvoiceSetting from './invoiceSetting';
import 'rc-trigger/assets/index.css';

export default function BillInfo({ match }) {
  const { projectId, type = localStorage.getItem('billInfoType') || 'paid' } = _.get(match, 'params');
  const [data, setData] = useSetState({});
  const [paras, setPara] = useSetState({
    pageIndex: 1,
    pageSize: 50,
    status: 0,
    recordTypes: type === 'paid' ? PAID_RECORD_TYPE : RECHARGE_RECORD_TYPE,
  });
  const [
    { applyInvoiceVisible, applyOrderId, invoiceVisible, operateMenuVisible, datePickerVisible, hideBalance },
    setVisible,
  ] = useSetState({
    applyInvoiceVisible: false,
    invoiceVisible: false,
    operateMenuVisible: -1,
    datePickerVisible: false,
    applyOrderId: '',
    hideBalance: true,
  });
  const [loading, setLoading] = useState(false);
  const [disabledExportBtn, setDisabledExportBtn] = useState(false);
  const [displayRecordType, setType] = useState(type && _.includes(['paid', 'recharge'], type) ? type : 'paid');
  const { balance, list = [], allCount } = data;
  const { pageIndex, status, pageSize, startDate, endDate, recordTypes } = paras;
  const { companyName, licenseType } = getCurrentProject(projectId, true);
  const isPaid = licenseType === 1;
  const isRechargeType = displayRecordType === 'recharge';

  const getData = () => {
    setLoading(true);
    orderAjax
      .getTransactionRecordByPage({ projectId, ...paras, status: displayRecordType === 'recharge' ? 0 : paras.status })
      .then(({ list, allCount }) => {
        setData({ list, allCount });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 导出
  const exportOrderRecord = () => {
    setDisabledExportBtn(true);
    downloadAjax
      .exportTransactionRecords({
        projectId,
        ...paras,
        status: displayRecordType === 'recharge' ? 0 : paras.status,
        exportType: type === 'paid' ? 0 : 1,
        fileName: type === 'paid' ? _l('支付记录') : _l('扣费记录'),
      })
      .then(() => {
        setDisabledExportBtn(false);
      })
      .catch(() => {
        setDisabledExportBtn(false);
      });
  };

  const cancelOrderFn = ({ recordType, orderId }) => {
    if (confirm(_l('确定取消该订单？'))) {
      if (_.includes([5, 6], recordType)) {
        const alertKey = `cancelOrderFn_${orderId}`;
        alert({
          msg: _l('正在取消订单...'),
          duration: 0,
          key: alertKey,
        });
        applicationAjax
          .updateAppBillingStatus({
            projectId,
            billingId: orderId,
            status: 0,
          })
          .then(function (data) {
            if (data.success) {
              alert({
                msg: _l('已成功取消订单'),
                key: alertKey,
              });
              getData();
            } else {
              alert({
                msg: _l('取消订单失败'),
                key: alertKey,
                type: 2,
              });
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
              getData();
            } else {
              alert(_l('取消订单失败'), 2);
            }
          });
      }
    }
  };

  const handleClick = type => {
    if (type === 'recharge') {
      location.href = `/admin/valueaddservice/${projectId}`;
    }
  };

  useEffect(() => {
    document.title = _l('组织管理 - 账务 - %0', companyName);
  }, []);

  useEffect(() => {
    projectAjax.getProjectLicenseSupportInfo({ projectId }).then(res => {
      setData(res);
    });
  }, [displayRecordType]);

  useEffect(() => {
    getData();
  }, [paras]);

  const renderRecordList = () => {
    if (loading) return <LoadDiv />;
    if (!list.length) return <div className="emptyList">{_l('无相应订单数据')}</div>;
    return (
      <ScrollView className="h100">
        <ul className="recordList">
          {list.map(
            (
              {
                recordId,
                orderId,
                createTime,
                recordType,
                price,
                status,
                invoiceStatus,
                createAccountInfo,
                recordTypeTitle,
                payType,
              },
              index,
            ) => (
              <li key={orderId || recordId} className="recordItem">
                <div className="time overflow_ellipsis item Font14 Gray_75">{createTime}</div>
                <div
                  className={cx('type item flex overflow_ellipsis', { rechargeType: displayRecordType === 'recharge' })}
                >
                  <Tooltip
                    placement="bottom"
                    title={
                      orderTypeText[orderRecordType[recordType]] +
                      (recordTypeTitle ? '（' + recordTypeTitle + '）' : '')
                    }
                  >
                    <span>
                      {orderTypeText[orderRecordType[recordType]] +
                        (recordTypeTitle ? '（' + recordTypeTitle + '）' : '')}
                    </span>
                  </Tooltip>
                </div>
                <div className={`item TxtRight ${displayRecordType === 'paid' ? 'mRight20' : 'mRight60'}`}>
                  {formatNumberThousand(price)}
                </div>
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
                          <img src={systemIcon} alt={_l('系统')} />
                          <span>{_l('系统')}</span>
                        </Fragment>
                      )}
                    </div>
                    <div className="fromType item">{_l('系统')}</div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div className="payType overflow_ellipsis item pLeft20">
                      {payType && price !== 0 ? PAY_TYPE[payType] : '-'}
                    </div>
                    <div className="billStatus overflow_ellipsis item pLeft20">
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
                          <img src={systemIcon} alt={_l('系统')} />
                          <span>{_l('系统')}</span>
                        </Fragment>
                      )}
                    </div>

                    {!md.global.Config.IsLocal && (
                      <div className="paidPerson overflow_ellipsis item">
                        {renderPay({ status, payAccountInfo, orderId, recordType })}
                      </div>
                    )}

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
          <i className="icon-sp_account_balance_wallet_white Font24" />
          <span>{_l('信用点')}</span>
          <span className={cx('balance Font24', { mRight0: hideBalance })}>
            {loading ? '-' : hideBalance ? '*****' : formatNumberThousand(balance)}
          </span>
          <Icon
            icon={hideBalance ? 'eye_off' : 'eye'}
            className="Gray_9e eyeIcon Hand mRight8 mBottom10"
            onClick={() => setVisible({ hideBalance: !hideBalance })}
          />
          {!md.global.Config.IsLocal && isPaid && (
            <span className="recharge pointer bold" onClick={() => handleClick('recharge')}>
              {_l('充值')}
            </span>
          )}
        </div>
        <div className="listHeader">
          <ul className="recordType">
            <li
              className={cx({ active: displayRecordType === 'paid' })}
              onClick={() => {
                setType('paid');
                setPara({ recordTypes: PAID_RECORD_TYPE, pageIndex: 1 });
                localStorage.setItem('billInfoType', 'paid');
                navigateTo(`/admin/billinfo/${projectId}/paid`);
              }}
            >
              <span className="TxtMiddle">{_l('支付记录')}</span>
            </li>
            <li
              className={cx({ active: displayRecordType === 'recharge' })}
              onClick={() => {
                setType('recharge');
                setPara({ recordTypes: RECHARGE_RECORD_TYPE, pageIndex: 1 });
                localStorage.setItem('billInfoType', 'recharge');
                navigateTo(`/admin/billinfo/${projectId}/recharge`);
              }}
            >
              <span className="TxtMiddle"> {_l('扣费记录')}</span>
              <Tooltip
                title={_l(
                  '异步执行的工作流扣费存在约 5 分钟延迟，同时系统会将 5 分钟内相同操作自动合并成一条扣费记录，如5分钟内相同流程的扣费信息',
                )}
              >
                <i className="icon icon-help Font14 mLeft5 Gray_bd ThemeHoverColor3 TxtMiddle" />
              </Tooltip>
            </li>
          </ul>
          <div className="flexRow alignCenter">
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
                <Tooltip title={_l('按照时间筛选')} placement="top">
                  <div className="date Gray_75">
                    <i className="Font18 icon-sidebar_calendar" />
                  </div>
                </Tooltip>
              </Trigger>
              {startDate ? (
                <div className="dateRange">
                  {_l('%0 ~ %1', startDate, endDate)}
                  <i className="icon-close" onClick={() => setPara({ startDate: '', endDate: '' })} />
                </div>
              ) : null}
            </div>
            <Tooltip title={_l('导出')} placement="top">
              <div className={cx('exportBtn mLeft10', { disabledExportBtn })} onClick={exportOrderRecord}>
                <i className="icon icon-download Gray_75 Font18 LineHeight24" />
              </div>
            </Tooltip>
          </div>
        </div>
        <div className="listTitle">
          <div className="time item">{_l('时间')}</div>
          <div className={cx('type item flex', { rechargeType: isRechargeType })}>
            <Dropdown
              data={
                displayRecordType === 'paid' ? orderRecordPaidTypeDropdownData : orderRecordRechargeTypeDropdownData
              }
              value={recordTypes.length > 1 ? 0 : recordTypes[0]}
              onChange={value => {
                setPara({
                  recordTypes: value === 0 ? (type === 'paid' ? PAID_RECORD_TYPE : RECHARGE_RECORD_TYPE) : [value],
                  pageIndex: 1,
                });
              }}
            />
          </div>
          <div className={`item TxtRight ${displayRecordType === 'paid' ? 'mRight20' : 'mRight60'}`}>
            {displayRecordType === 'paid' ? _l('应付/结算') : _l('信用点')}
          </div>
          {isRechargeType ? (
            <Fragment>
              <div className="createPerson item">{_l('创建人')}</div>
              <div className="fromType item">{_l('来源')}</div>
            </Fragment>
          ) : (
            <Fragment>
              {displayRecordType === 'paid' && <div className="payType item pLeft20">{_l('支付方式')}</div>}
              <div className="billStatus item pLeft20">
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
              {!md.global.Config.IsLocal && <div className="paidPerson item">{_l('付款人')}</div>}
              <div className="operation item">{_l('操作')}</div>
            </Fragment>
          )}
        </div>
        <div className="flex overflowHidden">{renderRecordList()}</div>
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
