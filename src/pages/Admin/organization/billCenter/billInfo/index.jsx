import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import { Dropdown as AntdDropdown, Button, Drawer, Select, Tooltip } from 'ming-ui/antd-components';
import agentAjax from 'src/api/agent';
import applicationAjax from 'src/api/application';
import downloadAjax from 'src/api/download';
import orderAjax from 'src/api/order';
import projectAjax from 'src/api/project';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import DatePickerFilter from 'src/pages/Admin/common/datePickerFilter';
import { BillInfoWrap } from 'src/pages/Admin/common/styled';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { formatNumberThousand } from 'src/utils/domain/control/number';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getCurrentProject } from 'src/utils/services/project';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import PaginationWrap from '../../../components/PaginationWrap';
import { getAITypeLabel } from '../../billing/config';
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

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const licenseSupportInfoCache = {};

const AgentBillingDetailWrap = styled.div`
  height: 100%;
  min-height: 120px;
  .agentBillingDetailTable {
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    overflow: hidden;
  }
  .agentBillingDetailRow {
    display: flex;
    align-items: center;
    min-height: 56px;
    border-top: 1px solid var(--color-border-primary);
    &:first-child {
      border-top: none;
    }
    > div {
      padding: 0 12px;
      box-sizing: border-box;
    }
  }
  .agentBillingDetailHeader {
    min-height: 48px;
    background-color: var(--color-background-secondary);
    color: var(--color-text-secondary);
    font-weight: 600;
  }
  .detailName {
    flex: 1;
    min-width: 0;
  }
  .model {
    flex: 0 0 280px;
    width: 280px;
  }
  .credits {
    flex: 0 0 150px;
    width: 150px;
    margin-right: 80px;
    text-align: right;
  }
  .createTime {
    flex: 0 0 180px;
    width: 180px;
  }
  .emptyList {
    padding: 32px 0;
    text-align: center;
    color: var(--color-text-secondary);
  }
`;

const AgentBillingDetailDrawer = styled(Drawer)`
  .hap-drawer-content-wrapper {
    box-shadow: -7px 0px 6px 1px rgba(0, 0, 0, 0.08);
  }
  .hap-drawer-body {
    padding: 20px 24px;
  }
  .agentBillingDetailTitle {
    min-width: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .agentBillingTitleText {
    flex: 0 0 auto;
  }
  .agentBillingTraceId {
    display: flex;
    align-items: center;
    margin-left: 24px;
    max-width: 560px;
    min-width: 0;
    font-size: 13px;
    font-weight: normal;
    color: var(--color-text-secondary);
    .traceIdText {
      min-width: 0;
    }
    .copyTraceId {
      flex: 0 0 auto;
    }
  }
`;

const AIWelfarePointLine = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 22px;
`;

const AIWelfarePointValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .monthlyRemaining {
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
  }
`;

const getAgentBillingDetailItems = res => {
  const data = _.get(res, 'data', res);

  if (_.isArray(data)) return data;

  const items = _.get(data, 'items');
  return _.isArray(items) ? items : [];
};

const getAgentBillingErrorMessage = error => {
  return (
    _.get(error, 'data.errorMessage') ||
    _.get(error, 'data.message') ||
    _.get(error, 'errorMessage') ||
    _.get(error, 'message') ||
    _l('获取扣费明细失败')
  );
};

const formatBillingNumber = value => {
  if (_.isNil(value) || value === '' || !_.isFinite(Number(value))) return '-';
  return formatNumberThousand(value);
};

const getBillingAccountName = createAccountInfo => {
  if (!createAccountInfo) return _l('系统');
  return createAccountInfo.fullName || createAccountInfo.fullname || createAccountInfo.accountId || _l('未知成员');
};

const getAgentBillingCacheKey = (projectId, traceId) => `${projectId}_${traceId}`;

const formatMsDate = dateStr => {
  if (!dateStr) return '-';
  const match = /\/Date\((\d+)/.exec(String(dateStr));

  if (match) {
    const d = new Date(parseInt(match[1], 10));
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return dateStr;
};

export default function BillInfo({ match }) {
  const { projectId, type: routeType } = _.get(match, 'params');
  const isSaas = !window.platformENV.isLocal;
  const recordType = routeType || localStorage.getItem('billInfoType') || 'paid';
  const availableRecordTypes = isSaas ? ['paid', 'recharge', 'aiBenefit'] : ['paid', 'recharge'];
  const type = _.includes(availableRecordTypes, recordType) ? recordType : 'paid';
  const [data, setData] = useSetState({});
  const [paras, setPara] = useSetState({
    pageIndex: 1,
    pageSize: 50,
    status: 0,
    recordTypes: type === 'paid' ? PAID_RECORD_TYPE : RECHARGE_RECORD_TYPE,
  });
  const [{ applyInvoiceVisible, applyOrderId, invoiceVisible, operateMenuVisible, hideBalance }, setVisible] =
    useSetState({
      applyInvoiceVisible: false,
      invoiceVisible: false,
      operateMenuVisible: -1,
      applyOrderId: '',
      hideBalance: true,
    });
  const [agentBillingFreeQuota, setAgentBillingFreeQuota] = useState({});
  const [loading, setLoading] = useState(true);
  const [disabledExportBtn, setDisabledExportBtn] = useState(false);
  const [displayRecordType, setType] = useState(type);
  const [agentBillingDetail, setAgentBillingDetail] = useSetState({
    visible: false,
    loading: false,
    list: [],
    traceId: '',
  });
  const agentBillingDetailCacheRef = useRef({});
  const agentBillingDetailPendingRef = useRef({});
  const agentBillingDetailCacheKeyRef = useRef('');

  const [aiBenefitParas, setAiBenefitParas] = useSetState({ page: 1, size: 50, startDate: '', endDate: '' });
  const [aiBenefitData, setAiBenefitData] = useSetState({ list: [], totalCount: 0 });
  const [aiBenefitLoading, setAiBenefitLoading] = useState(false);

  const { balance, list = [], allCount } = data;
  const { pageIndex, status, pageSize, startDate, endDate, recordTypes } = paras;
  const { licenseType } = getCurrentProject(projectId, true);
  const isPaid = licenseType === 1;
  const isFree = licenseType === 0;
  const isRechargeType = displayRecordType === 'recharge';
  const isAiBenefitType = displayRecordType === 'aiBenefit';
  const { grantedMonthlyCredits = 0 } = agentBillingFreeQuota;

  const renderAIWelfarePointValue = () => {
    if (isFree) {
      return <span className="Bold">{formatNumberThousand(agentBillingFreeQuota.remainingCredits)}</span>;
    }

    const { giftRemaining = 0, monthlyRemaining = 0 } = agentBillingFreeQuota;

    return (
      <AIWelfarePointValue className="Bold">
        {giftRemaining > 0 && (
          <Fragment>
            <span>{formatNumberThousand(giftRemaining)}</span>
            <span className="textTertiary">+</span>
          </Fragment>
        )}
        <span className="monthlyRemaining">{formatNumberThousand(monthlyRemaining)}</span>
      </AIWelfarePointValue>
    );
  };

  const activeStartDate = isAiBenefitType ? aiBenefitParas.startDate : startDate;
  const activeEndDate = isAiBenefitType ? aiBenefitParas.endDate : endDate;

  const updateParas = data => {
    setLoading(true);
    setPara(data);
  };

  const getAgentBillingFreeQuota = useCallback(() => {
    if (!projectId || !isSaas) return;

    agentAjax
      .getAgentBillingFreeQuota({ projectId }, { silent: true })
      .then(res => {
        setAgentBillingFreeQuota(res.data || {});
      })
      .catch(() => {
        setAgentBillingFreeQuota({});
      });
  }, [isSaas, projectId, setAgentBillingFreeQuota]);

  const fetchData = useCallback(() => {
    return orderAjax
      .getTransactionRecordByPage({ projectId, ...paras, status: displayRecordType === 'recharge' ? 0 : paras.status })
      .then(({ list = [], allCount }) => {
        setData({
          list,
          allCount,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [displayRecordType, paras, projectId, setData, setLoading]);

  const getData = () => {
    setLoading(true);
    fetchData();
  };

  const fetchAiBenefitData = useCallback(() => {
    if (!isSaas) return;

    setAiBenefitLoading(true);
    const { page, size, startDate: sd, endDate: ed } = aiBenefitParas;
    return agentAjax
      .getAgentBillingTransactions(
        {
          projectId,
          page,
          size,
          ...(sd ? { startDate: sd } : {}),
          ...(ed ? { endDate: ed } : {}),
        },
        { silent: true },
      )
      .then(res => {
        if (res && res.success) {
          const { items = [], totalCount = 0 } = res.data || {};
          setAiBenefitData({ list: items, totalCount });
        } else {
          alert(_.get(res, 'errorMessage') || _l('获取AI福利点记录失败'), 2);
          setAiBenefitData({ list: [], totalCount: 0 });
        }
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('获取AI福利点记录失败'), 2);
        setAiBenefitData({ list: [], totalCount: 0 });
      })
      .finally(() => {
        setAiBenefitLoading(false);
      });
  }, [isSaas, projectId, aiBenefitParas, setAiBenefitData, setAiBenefitLoading]);

  // 导出
  const exportOrderRecord = () => {
    if (disabledExportBtn) return;

    setDisabledExportBtn(true);
    downloadAjax
      .exportTransactionRecords({
        projectId,
        ...paras,
        status: displayRecordType === 'recharge' ? 0 : paras.status,
        exportType: type === 'paid' ? 0 : 1,
        fileName: type === 'paid' ? _l('支付记录') : _l('信用点消费'),
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
      location.href = pathCompletion(`/admin/valueaddservice/${projectId}`);
    }
  };

  const getAgentBillingTransactionsByTraceId = useCallback(
    (extendId, isFreeApplied) => {
      const traceId = _.trim(String(extendId || ''));

      if (!traceId) return;

      const cacheKey = getAgentBillingCacheKey(projectId, traceId);
      const hasCache = _.has(agentBillingDetailCacheRef.current, cacheKey);
      const cachedList = hasCache ? agentBillingDetailCacheRef.current[cacheKey] : [];

      agentBillingDetailCacheKeyRef.current = cacheKey;
      setAgentBillingDetail({
        visible: true,
        loading: !hasCache,
        list: cachedList,
        traceId,
        isFreeApplied,
      });

      if (hasCache) return;

      if (!agentBillingDetailPendingRef.current[cacheKey]) {
        agentBillingDetailPendingRef.current[cacheKey] = agentAjax
          .getAgentBillingTransactionsByTraceId({ projectId, traceId }, { silent: true })
          .then(res => {
            if (res && res.success === false) {
              alert(res.errorMessage || _l('获取扣费明细失败'), 2);
              return [];
            }

            const list = getAgentBillingDetailItems(res);
            agentBillingDetailCacheRef.current[cacheKey] = list;
            return list;
          })
          .catch(error => {
            alertIfNotUnauthorized(error, getAgentBillingErrorMessage(error), 2);
            return [];
          })
          .finally(() => {
            delete agentBillingDetailPendingRef.current[cacheKey];
          });
      }

      agentBillingDetailPendingRef.current[cacheKey].then(list => {
        if (agentBillingDetailCacheKeyRef.current !== cacheKey) return;

        setAgentBillingDetail({
          loading: false,
          list,
          isFreeApplied,
        });
      });
    },
    [projectId, setAgentBillingDetail],
  );

  const renderAgentBillingDetailDrawer = () => {
    if (!agentBillingDetail.visible) return null;

    return (
      <AgentBillingDetailDrawer
        open
        width={980}
        title={
          <div className="agentBillingDetailTitle">
            <span className="agentBillingTitleText">{_l('扣费明细')}</span>
            <div className="agentBillingTraceId">
              <span className="textPrimary">TraceID：</span>
              <span className="traceIdText overflow_ellipsis textPrimary" title={agentBillingDetail.traceId}>
                {agentBillingDetail.traceId}
              </span>
              <Tooltip title={_l('复制')} placement="top">
                <Icon
                  icon="content-copy"
                  className="copyTraceId Font16 textTertiary pointer hoverColorPrimary mLeft8"
                  onClick={() => {
                    copy(agentBillingDetail.traceId);
                    alert(_l('复制成功'));
                  }}
                />
              </Tooltip>
            </div>
          </div>
        }
        placement="right"
        onClose={() => {
          agentBillingDetailCacheKeyRef.current = '';
          setAgentBillingDetail({ visible: false, loading: false, list: [], traceId: '' });
        }}
      >
        <AgentBillingDetailWrap>
          {agentBillingDetail.loading ? (
            <LoadDiv />
          ) : agentBillingDetail.list.length ? (
            <div className="agentBillingDetailTable">
              <div className="agentBillingDetailRow agentBillingDetailHeader">
                <div className="detailName">{_l('明细项')}</div>
                <div className="model">{_l('模型')}</div>
                <div className="credits">{agentBillingDetail.isFreeApplied ? _l('AI 福利点') : _l('信用点')}</div>
                <div className="createTime">{_l('创建时间')}</div>
              </div>
              {agentBillingDetail.list
                .filter(item => {
                  const value = agentBillingDetail.isFreeApplied ? item.freeApplied : item.credits;
                  return _.isNil(value) || value === '' || !_.isFinite(Number(value)) || Number(value) !== 0;
                })
                .map((item, index) => {
                  const timeText = formatMsDate(item.createTime);
                  const sceneLabel = item.scene ? getAITypeLabel(item.scene) : '';
                  const detailLabel =
                    sceneLabel && item.agentName
                      ? `${sceneLabel} · ${item.agentName}`
                      : sceneLabel || item.agentName || '-';

                  return (
                    <div className="agentBillingDetailRow" key={`${agentBillingDetail.traceId}_${index}`}>
                      <div className="detailName">
                        <Tooltip title={detailLabel} placement="top">
                          <span className="InlineBlock wMax100 ellipsis cursorDefault">{detailLabel || '-'}</span>
                        </Tooltip>
                      </div>
                      <div className="model overflow_ellipsis" title={item.model}>
                        {item.model || '-'}
                      </div>
                      <div
                        className="credits"
                        title={agentBillingDetail.isFreeApplied ? item.freeApplied : item.credits}
                      >
                        -{formatBillingNumber(agentBillingDetail.isFreeApplied ? item.freeApplied : item.credits)}
                      </div>
                      <div className="createTime" title={timeText}>
                        {timeText}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="emptyList">{_l('暂无扣费明细')}</div>
          )}
        </AgentBillingDetailWrap>
      </AgentBillingDetailDrawer>
    );
  };

  useEffect(() => {
    getAgentBillingFreeQuota();

    if (licenseSupportInfoCache[projectId]) {
      setData(licenseSupportInfoCache[projectId]);
      return;
    }

    projectAjax.getProjectLicenseSupportInfo({ projectId }).then(res => {
      licenseSupportInfoCache[projectId] = res;
      setData(res);
    });
  }, [getAgentBillingFreeQuota, projectId, setData]);

  useEffect(() => {
    if (displayRecordType !== 'aiBenefit') {
      fetchData();
    }
  }, [displayRecordType, fetchData]);

  useEffect(() => {
    if (isSaas && displayRecordType === 'aiBenefit') {
      const timer = setTimeout(fetchAiBenefitData, 0);
      return () => clearTimeout(timer);
    }
  }, [fetchAiBenefitData, isSaas, displayRecordType]);

  const renderPay = ({ status, payAccountInfo = {}, orderId, recordType }) => {
    const { accountId, avatar, fullname } = payAccountInfo;

    if (status === 1) {
      return (
        <Button
          color="orange"
          variant="solid"
          size="small"
          shape="round"
          onClick={() => {
            location.href = pathCompletion(
              _.includes([5, 6], recordType)
                ? `/admin/appBillDetail/${projectId}/2/${orderId}`
                : `/admin/waitingpay/${projectId}/${orderId}`,
            );
          }}
        >
          {_l('立即支付')}
        </Button>
      );
    }

    if (_.includes([3, 4, 5], status)) return null;
    return accountId ? (
      <Fragment>
        <UserHead className="billOwner" size={24} user={{ accountId, userHead: avatar }} projectId={projectId} />
        <span>{fullname}</span>
      </Fragment>
    ) : (
      <Fragment>
        <i className="icon icon-system Font24 textSecondary" />
        <span>{_l('系统')}</span>
      </Fragment>
    );
  };

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
                payAccountInfo,
                recordTypeTitle,
                payType,
                extendId,
              },
              index,
            ) => {
              const hasExtendId = !_.isNil(extendId) && !_.isEmpty(_.trim(String(extendId)));
              const canViewAgentBillingDetail = Number(recordType) === orderRecordType.Mingo && hasExtendId;

              return (
                <li key={orderId || recordId} className="recordItem">
                  <div className="time overflow_ellipsis item Font14 textSecondary">{createTime}</div>
                  <div
                    className={cx('type item flex overflow_ellipsis', {
                      rechargeType: displayRecordType === 'recharge',
                    })}
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
                            <i className="icon icon-system Font24 textSecondary" />
                            <span>{_l('系统')}</span>
                          </Fragment>
                        )}
                      </div>
                      <div className="fromType item">{_l('系统')}</div>
                      <div className="agentBillingDetail item">
                        {canViewAgentBillingDetail && (
                          <Tooltip title={_l('查看扣费明细')} placement="top">
                            <Icon
                              icon="remarks"
                              className="Font18 textSecondary pointer hoverColorPrimary"
                              onClick={event => {
                                event.stopPropagation();
                                getAgentBillingTransactionsByTraceId(extendId);
                              }}
                            />
                          </Tooltip>
                        )}
                      </div>
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
                            <i className="icon icon-system Font24 textSecondary" />
                            <span>{_l('系统')}</span>
                          </Fragment>
                        )}
                      </div>
                      {window.platformENV.isHap && (
                        <div className="paidPerson overflow_ellipsis item">
                          {renderPay({ status, payAccountInfo, orderId, recordType })}
                        </div>
                      )}
                      <AntdDropdown
                        open={operateMenuVisible === index}
                        onOpenChange={visible => setVisible({ operateMenuVisible: visible ? index : -1 })}
                        trigger={['click']}
                        menu={{
                          items: [
                            ...(status === Common.orderRecordStatus.success &&
                            _.includes([enumInvoiceStatus.notApply], invoiceStatus)
                              ? [
                                  {
                                    key: 'invoice',
                                    label: _l('申请发票'),
                                    onClick: () => {
                                      setVisible({
                                        applyInvoiceVisible: true,
                                        applyOrderId: orderId || recordId,
                                        operateMenuVisible: -1,
                                      });
                                    },
                                  },
                                ]
                              : []),
                            {
                              key: 'copy',
                              label: _l('复制账单Id'),
                              onClick: () => {
                                copy(`${orderId || recordId}`);
                                alert(_l('复制成功'));
                              },
                            },
                            ...(status === 1
                              ? [
                                  {
                                    key: 'cancel',
                                    label: _l('取消订单'),
                                    danger: true,
                                    onClick: () => cancelOrderFn({ recordType, orderId }),
                                  },
                                ]
                              : []),
                          ],
                        }}
                      >
                        <div className="operation textTertiary item">
                          <i className="icon-moreop Font18 pointer" />
                        </div>
                      </AntdDropdown>
                    </Fragment>
                  )}
                </li>
              );
            },
          )}
        </ul>
      </ScrollView>
    );
  };

  const renderAiBenefitList = () => {
    if (aiBenefitLoading) return <LoadDiv />;
    if (!aiBenefitData.list.length) return <div className="emptyList">{_l('暂无AI福利点扣费记录')}</div>;
    return (
      <ScrollView className="h100">
        <ul className="recordList aiBenefitRecordList">
          {aiBenefitData.list.map((item, index) => {
            const { traceId, scene, createTime, freeApplied } = item;
            const sceneLabel = getAITypeLabel(scene);
            const timeText = formatMsDate(createTime);
            const createAccountInfo = item.createAccountInfo;
            const accountName = getBillingAccountName(createAccountInfo);
            return (
              <li key={traceId || index} className="recordItem">
                <div className="time overflow_ellipsis item Font14 textSecondary" title={timeText}>
                  {timeText}
                </div>
                <div className="type item flex overflow_ellipsis">
                  <Tooltip placement="bottom" title={sceneLabel}>
                    <span>{sceneLabel}</span>
                  </Tooltip>
                </div>
                <div className="aiBenefitPoint item TxtRight">-{formatBillingNumber(freeApplied)}</div>
                <div className="createPerson overflow_ellipsis item" title={accountName}>
                  {createAccountInfo ? (
                    <Fragment>
                      <UserHead
                        className="billOwner"
                        size={24}
                        user={{ accountId: createAccountInfo.accountId, userHead: createAccountInfo.avatar }}
                        projectId={projectId}
                      />
                      <span className="overflow_ellipsis">{accountName}</span>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <i className="icon icon-system Font24 textSecondary" />
                      <span>{_l('系统')}</span>
                    </Fragment>
                  )}
                </div>
                <div className="agentBillingDetail item">
                  {traceId && (
                    <Tooltip title={_l('查看扣费明细')} placement="top">
                      <Icon
                        icon="remarks"
                        className="Font18 textSecondary pointer hoverColorPrimary"
                        onClick={event => {
                          event.stopPropagation();
                          getAgentBillingTransactionsByTraceId(traceId, true);
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollView>
    );
  };

  return (
    <BillInfoWrap>
      <AdminTitle prefix={_l('组织 - 账务')} />
      <div className="billInfoHeader orgManagementHeader">
        <div className="title">{_l('账务%15000')}</div>
        <div className="billInfoHeaderActions flexRow alignItemsCenter Font15">
          <span
            className="colorPrimary adminHoverColor pointer"
            onClick={() => navigateTo(`/admin/billing/${projectId}/statistics`)}
          >
            {_l('进入新版')}
          </span>
          {!window.platformENV.isOverseas && (
            <div
              className="invoiceSetting pointer adminHoverColor mLeft32"
              onClick={() => {
                setVisible({ invoiceVisible: true });
              }}
            >
              {_l('发票设置')}
            </div>
          )}
        </div>
      </div>
      <div className="orgManagementContent flexColumn">
        <div className="accountInfo">
          <i className="icon-sp_account_balance_wallet_white Font24" />
          <span>{_l('信用点')}</span>
          <span className={cx('balance Font24', { mRight0: hideBalance })}>
            {balance === undefined ? '-' : hideBalance ? '*****' : formatNumberThousand(balance)}
          </span>
          <Icon
            icon={hideBalance ? 'eye_off' : 'eye'}
            className="textTertiary eyeIcon Hand mRight8 mBottom10"
            onClick={() => setVisible({ hideBalance: !hideBalance })}
          />

          {!window.platformENV.isLocal &&
            isPaid &&
            (!window.platformENV.isOverseas ? (
              <Button type="primary" size="small" className="Bold" onClick={() => handleClick('recharge')}>
                {_l('充值')}
              </Button>
            ) : (
              <PurchaseExpandPack className="mLeft10 nowrap" text={_l('充值')} type="recharge" projectId={projectId} />
            ))}

          {isSaas && (
            <AIWelfarePointLine className="Font14 mLeft20">
              <span>{_l('AI 福利点:')}</span>
              {renderAIWelfarePointValue()}
              {isPaid && (
                <Tooltip
                  title={
                    <Fragment>
                      <div>
                        {_l(
                          '「AI 福利点」为平台赠送额度（1福利点=1个信用点），仅抵扣 Mingo AI 功能费用；使用时会优先消耗 AI 福利点，额度用尽后再从通用信用点扣费。',
                        )}
                      </div>
                      <div className="mTop12">
                        {_l('每月赠送%0福利点，当月1日00:00自动刷新，不累加。', grantedMonthlyCredits)}
                      </div>
                    </Fragment>
                  }
                  placement="bottom"
                >
                  <i className="icon icon-help Font14 mLeft0 textDisabled hoverColorPrimary TxtMiddle pointer" />
                </Tooltip>
              )}
            </AIWelfarePointLine>
          )}
        </div>
        <div className="listHeader">
          <ul className="recordType">
            <li
              className={cx({ active: displayRecordType === 'paid' })}
              onClick={() => {
                setType('paid');
                updateParas({ recordTypes: PAID_RECORD_TYPE, pageIndex: 1 });
                safeLocalStorageSetItem('billInfoType', 'paid');
                navigateTo(`/admin/billinfo/${projectId}/paid`);
              }}
            >
              <span className="TxtMiddle">{_l('支付记录')}</span>
            </li>
            <li
              className={cx('mLeft24 mRight24', { active: displayRecordType === 'recharge' })}
              onClick={() => {
                setType('recharge');
                updateParas({ recordTypes: RECHARGE_RECORD_TYPE, pageIndex: 1 });
                safeLocalStorageSetItem('billInfoType', 'recharge');
                navigateTo(`/admin/billinfo/${projectId}/recharge`);
              }}
            >
              <span className="TxtMiddle"> {_l('信用点消费')}</span>
              <Tooltip
                title={_l(
                  '异步执行的工作流扣费存在约 5 分钟延迟，同时系统会将 5 分钟内相同操作自动合并成一条扣费记录，如5分钟内相同流程的扣费信息',
                )}
              >
                <i className="icon icon-help Font14 mLeft5 textDisabled hoverColorPrimary TxtMiddle pointer" />
              </Tooltip>
            </li>
            {isSaas && (
              <li
                className={cx({ active: isAiBenefitType })}
                onClick={() => {
                  setType('aiBenefit');
                  safeLocalStorageSetItem('billInfoType', 'aiBenefit');
                  navigateTo(`/admin/billinfo/${projectId}/aiBenefit`);
                }}
              >
                <span className="TxtMiddle">{_l('AI 福利点消费')}</span>
              </li>
            )}
          </ul>
          <div className="flexRow alignCenter">
            <div className="dataFilter">
              <DatePickerFilter
                placement="bottomLeft"
                tooltipProps={{ title: _l('按照时间筛选'), placement: 'top' }}
                updateData={data => {
                  if (isAiBenefitType) {
                    setAiBenefitParas({ ...data, page: 1 });
                  } else {
                    updateParas({ ...data });
                  }
                }}
              >
                <span className="date textSecondary">
                  <i className="Font18 icon-sidebar_calendar" />
                </span>
              </DatePickerFilter>
              {activeStartDate ? (
                <div className="dateRange">
                  {_l('%0 ~ %1', activeStartDate, activeEndDate)}
                  <i
                    className="icon-close"
                    onClick={() => {
                      if (isAiBenefitType) {
                        setAiBenefitParas({ startDate: '', endDate: '' });
                      } else {
                        updateParas({ startDate: '', endDate: '' });
                      }
                    }}
                  />
                </div>
              ) : null}
            </div>

            <Tooltip title={_l('刷新')} placement="top">
              <div
                className="mLeft10"
                onClick={() => {
                  if (isAiBenefitType) {
                    setAiBenefitParas({ page: 1 });
                  } else {
                    updateParas({ pageIndex: 1 });
                  }
                }}
              >
                <i className="icon icon-refresh1 textSecondary Font18 LineHeight24 pointer" />
              </div>
            </Tooltip>
            {!isAiBenefitType && (
              <Tooltip title={_l('导出')} placement="top">
                <Button
                  color="default"
                  variant="text"
                  size="small"
                  className="mLeft10"
                  aria-label={_l('导出')}
                  disabled={disabledExportBtn}
                  icon={<Icon icon="download" />}
                  onClick={exportOrderRecord}
                />
              </Tooltip>
            )}
          </div>
        </div>
        <div className={cx('listTitle', { aiBenefitListTitle: isAiBenefitType })}>
          <div className="time item">{_l('时间')}</div>
          {isAiBenefitType ? (
            <Fragment>
              <div className="type item flex">{_l('全部')}</div>
              <div className="aiBenefitPoint item TxtRight">{_l('AI 福利点')}</div>
              <div className="createPerson item">{_l('创建人')}</div>
              <div className="agentBillingDetail item" />
            </Fragment>
          ) : (
            <Fragment>
              <div className={cx('type item flex', { rechargeType: isRechargeType })}>
                <Select
                  variant="borderless"
                  popupMatchSelectWidth={180}
                  options={
                    displayRecordType === 'paid' ? orderRecordPaidTypeDropdownData : orderRecordRechargeTypeDropdownData
                  }
                  fieldNames={SELECT_FIELD_NAMES}
                  value={recordTypes.length > 1 ? 0 : recordTypes[0]}
                  onChange={value => {
                    updateParas({
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
                  <div className="agentBillingDetail item" />
                </Fragment>
              ) : (
                <Fragment>
                  {displayRecordType === 'paid' && <div className="payType item pLeft20">{_l('支付方式')}</div>}
                  <div className="billStatus item pLeft20">
                    <Select
                      variant="borderless"
                      options={orderRecordStatusDropdownData}
                      fieldNames={SELECT_FIELD_NAMES}
                      value={status}
                      onChange={value => {
                        updateParas({ status: value });
                      }}
                    />
                  </div>
                  <div className="invoiceStatus item">{_l('发票状态')}</div>
                  <div className="createPerson item">{_l('创建人')}</div>
                  {window.platformENV.isHap && <div className="paidPerson item">{_l('付款人')}</div>}
                  <div className="operation item">{_l('操作')}</div>
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
        <div className="flex overflowHidden">{isAiBenefitType ? renderAiBenefitList() : renderRecordList()}</div>
        {isAiBenefitType ? (
          <PaginationWrap
            total={aiBenefitData.totalCount}
            pageIndex={aiBenefitParas.page}
            pageSize={aiBenefitParas.size}
            onChange={page => setAiBenefitParas({ page })}
          />
        ) : (
          <PaginationWrap
            total={allCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onChange={page => updateParas({ pageIndex: page })}
          />
        )}
      </div>
      {invoiceVisible && <InvoiceSetting projectId={projectId} onClose={() => setVisible({ invoiceVisible: false })} />}
      {applyInvoiceVisible && (
        <ApplyInvoice
          projectId={projectId}
          orderId={applyOrderId}
          onClose={() => setVisible({ applyInvoiceVisible: false, applyOrderId: '' })}
        />
      )}
      {renderAgentBillingDetailDrawer()}
    </BillInfoWrap>
  );
}
