import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import { Icon, UserHead } from 'ming-ui';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import agentAjax from 'src/api/agent';
import billingAjax from 'src/api/billing';
import { BillInfoWrap } from 'src/pages/Admin/common/styled';
import IsAppAdmin from 'src/pages/Admin/components/IsAppAdmin';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import SearchWrap from 'src/pages/Admin/components/SearchWrap';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { CREDIT_TYPES, formatBillingDate, getAITypeLabel, getChannelLabel } from '../config';
import BalanceHeader from './BalanceHeader';
import BillingDetailDrawer from './BillingDetailDrawer';
import {
  DETAIL_TABS,
  formatBillingDeduction,
  formatBillingNumber,
  formatOrderAmount,
  getCreditTypeLabel,
  getSearchList,
  ORDER_STATUS_OPTIONS,
} from './config';
import './index.less';

const AI_MAX_RESULT_COUNT = 1000;
const AMOUNT_COLUMN_CLASS = 'billingAmountColumn';
const WAITING_PAY_ORIGIN = 'http://localhost:3000';
// 未选择具体类型时传入全部可选消费类型，保证默认请求与筛选范围一致。
const DEFAULT_BUSINESS_TYPES = CREDIT_TYPES.map(item => item.value);

const getTimeParams = ({ startDate, endDate } = {}) => ({
  ...(startDate ? { createdFrom: formatBillingDate(startDate) } : {}),
  ...(endDate ? { createdTo: formatBillingDate(endDate) } : {}),
});

export function getRequestParams({ tab, projectId, filters = {}, pageIndex }) {
  if (tab === 'purchase') {
    return {
      projectId,
      ...(filters.content ? { productCode: filters.content } : {}),
      ...(filters.orderStatus ? { orderStatuses: [filters.orderStatus] } : {}),
      ...getTimeParams(filters.time),
      pageIndex,
      pageSize: 50,
    };
  }

  return {
    projectId,
    transactionType: tab === 'refund' ? 3 : 2,
    businessTypes: filters.type ? [filters.type] : DEFAULT_BUSINESS_TYPES,
    ...(filters.creator?.[0]?.accountId ? { operatorAccountId: filters.creator[0].accountId } : {}),
    ...getTimeParams(filters.time),
    extensionFilters: {
      ...(filters.app ? { appId: filters.app } : {}),
      ...(filters.channel ? { channel: filters.channel } : {}),
    },
    pageIndex,
    pageSize: 50,
  };
}

const mapOrderRecord = record => ({
  ...record,
  id: record.orderId,
  orderStatusCode: record.orderStatus,
  type: record.item?.productName || '-',
  amount: formatOrderAmount(record.totalAmount, record.item?.productCode),
  orderStatus: ORDER_STATUS_OPTIONS.find(item => item.value === record.orderStatus)?.label || '-',
  invoiceStatus: '-',
});

// 信用点和退款金额的符号以后端为准，前端只负责数字格式化，避免重复翻转符号。
const mapCreditPointRecord = record => ({
  ...record,
  type: getCreditTypeLabel(record.businessType),
  credit: formatBillingNumber(record.amount),
  app: record.application,
  channel: getChannelLabel(record.channel),
  business: record.channel === 'mingo' ? getAITypeLabel(record.businessId) : record.businessName || '-',
});

const getBillingDetail = (record, amountType) => {
  const instanceId = amountType === 'credit' ? String(record.instanceId || '').trim() : '';
  if (instanceId) return { instanceId, amountType };

  const traceId = String(record.traceId || '').trim();
  return traceId ? { traceId, amountType } : null;
};

const renderApplication = (projectId, application) => {
  if (!application?.appName) return '-';
  if (application.status === 2) return <span className="textTertiary">{_l('已删除')}</span>;

  return (
    <IsAppAdmin
      appId={application.appId}
      appName={application.appName}
      iconUrl={application.appIconUrl}
      iconColor={application.appIconColor}
      createType={application.createType}
      urlTemplate={application.urlTemplate}
      projectId={projectId}
      passCheckManager
    />
  );
};

const renderUser = (projectId, user) => {
  if (!user) {
    return (
      <div className="billingUser flexRow alignItemsCenter">
        <i className="icon icon-system Font24 textSecondary" />
        <span className="mLeft8">{_l('系统')}</span>
      </div>
    );
  }

  const fullName = user.fullName || user.fullname || _l('未知成员');
  return (
    <div className="billingUser flexRow alignItemsCenter">
      <UserHead
        className="circle"
        size={28}
        projectId={projectId}
        user={{ accountId: user.accountId, userHead: user.avatar }}
        disabled={!user.accountId}
      />
      <span className="mLeft8 ellipsis" title={fullName}>
        {fullName}
      </span>
    </div>
  );
};

export const getWaitingPayUrl = (projectId, orderId) => {
  const webUrl = md.global.Config.WebUrl.replace(/\/+$/, '');
  const returnUrl = `${webUrl}/admin/billing/${projectId}/details`;
  return `${WAITING_PAY_ORIGIN}/waitingPay/${projectId}/${orderId}?ReturnUrl=${encodeURIComponent(returnUrl)}`;
};

const renderPayer = (projectId, record) => {
  if (record.orderStatusCode === 1) {
    return (
      <Button
        color="orange"
        variant="solid"
        size="small"
        shape="round"
        onClick={() => {
          location.href = getWaitingPayUrl(projectId, record.orderId);
        }}
      >
        {_l('立即支付')}
      </Button>
    );
  }

  if (record.orderStatusCode === 4) return null;
  return renderUser(projectId, record.payer);
};

export default function Details({ projectId, onRequestParamsChange }) {
  const [activeTab, setActiveTab] = useState('credit');
  const [query, setQuery] = useState({ filters: {}, pageIndex: 1 });
  const [data, setData] = useState({ loading: false, list: [] });
  const [totalCount, setTotalCount] = useState(0);
  const [detail, setDetail] = useState(null);
  const requestRef = useRef(null);
  const countRequestRef = useRef(null);
  const { filters, pageIndex } = query;
  const isAI = activeTab === 'aiBenefit';

  const loadData = useCallback(() => {
    if (!projectId) return;

    const request = {};
    requestRef.current = request;

    Promise.resolve().then(async () => {
      if (requestRef.current !== request) return;
      setData({ loading: true, list: [] });
      const isPurchase = activeTab === 'purchase';

      try {
        if (isAI) {
          const time = filters.time;
          const res = await agentAjax.getAgentBillingTransactions({
            projectId,
            page: pageIndex,
            size: 50,
            ...(filters.type ? { scene: filters.type } : {}),
            ...(time?.startDate ? { startDate: time.startDate } : {}),
            ...(time?.endDate ? { endDate: time.endDate } : {}),
          });

          if (!res.success) throw res;
          if (requestRef.current === request) {
            setData({ loading: false, list: res.data.items });
            setTotalCount(res.data.totalCount);
          }

          return;
        }

        const requestParams = getRequestParams({ tab: activeTab, projectId, filters, pageIndex });
        const res = isPurchase
          ? await billingAjax.listOrders(requestParams)
          : await billingAjax.getListCreditPoints(requestParams);

        if (requestRef.current === request) {
          setData({
            loading: false,
            list: isPurchase ? res.items.map(mapOrderRecord) : res.items.map(mapCreditPointRecord),
          });
          if (isPurchase) setTotalCount(res.page.totalCount);
        }
      } catch (error) {
        if (requestRef.current !== request) return;

        const fallback = isAI
          ? _l('获取AI福利点记录失败')
          : isPurchase
            ? _l('获取订单记录失败')
            : _l('获取信用点记录失败');
        alertIfNotUnauthorized(error, error?.errorMessage || (isAI ? error?.data?.errorMessage : '') || fallback, 2);
        setData({ loading: false, list: [] });
        if (isAI || isPurchase) setTotalCount(0);
      } finally {
        if (requestRef.current === request) {
          requestRef.current = null;
        }
      }
    });
  }, [activeTab, filters, isAI, pageIndex, projectId]);

  // 总数只随查询范围或手动刷新更新，翻页不会重新统计。
  const loadCount = useCallback(async () => {
    if (!projectId || ['purchase', 'aiBenefit'].includes(activeTab)) return;

    const request = {};
    countRequestRef.current = request;
    setTotalCount(0);

    try {
      const count = await billingAjax.getCreditPointCount(
        getRequestParams({ tab: activeTab, projectId, filters, pageIndex: 1 }),
      );
      if (countRequestRef.current === request) setTotalCount(count);
    } catch (error) {
      if (countRequestRef.current !== request) return;
      alertIfNotUnauthorized(error, error?.errorMessage || _l('获取信用点记录失败'), 2);
    }
  }, [activeTab, filters, projectId]);

  useEffect(() => {
    // 发起新范围的查询时清空旧总数，避免新列表短暂使用上一筛选的分页。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCount();

    return () => {
      countRequestRef.current = null;
    };
  }, [loadCount]);

  useEffect(() => {
    loadData();

    return () => {
      requestRef.current = null;
    };
  }, [loadData]);

  useEffect(() => {
    onRequestParamsChange?.(isAI ? null : getRequestParams({ tab: activeTab, projectId, filters, pageIndex }));
  }, [activeTab, filters, isAI, onRequestParamsChange, pageIndex, projectId]);

  const handleRefresh = () => {
    if (requestRef.current) return;

    loadCount();
    if (pageIndex === 1) {
      loadData();
      return;
    }

    setQuery(previous => ({ ...previous, pageIndex: 1 }));
  };

  const columns = useMemo(() => {
    const renderDetailAction = detail =>
      detail ? (
        <Tooltip title={_l('查看扣费明细')} placement="top">
          <Icon
            icon="remarks"
            className="Font18 textSecondary pointer hoverColorPrimary"
            onClick={() => setDetail(detail)}
          />
        </Tooltip>
      ) : null;

    const columnsByTab = {
      purchase: [
        { title: _l('下单时间'), dataIndex: 'createTime', width: 180 },
        { title: _l('类型'), dataIndex: 'type', width: 200, ellipsis: true },
        {
          title: _l('应付/结算'),
          dataIndex: 'amount',
          width: 150,
          align: 'right',
          className: AMOUNT_COLUMN_CLASS,
        },
        { title: _l('订单状态'), dataIndex: 'orderStatus', width: 140 },
        { title: _l('发票状态'), dataIndex: 'invoiceStatus', width: 140 },
        {
          title: _l('创建人'),
          dataIndex: 'operator',
          width: 140,
          ellipsis: true,
          render: user => renderUser(projectId, user),
        },
        {
          title: _l('付款人'),
          dataIndex: 'payer',
          width: 140,
          ellipsis: true,
          render: (user, record) => renderPayer(projectId, record),
        },
        {
          title: _l('操作'),
          dataIndex: 'action',
          width: 70,
          align: 'center',
          render: (text, record) => (
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  { key: 'invoice', label: _l('申请发票'), disabled: true },
                  {
                    key: 'copy',
                    label: _l('复制账单Id'),
                    onClick: () => {
                      copy(record.orderId);
                      alert(_l('复制成功'));
                    },
                  },
                  { key: 'cancel', label: _l('取消订单'), danger: true, disabled: true },
                ],
              }}
            >
              <Icon icon="moreop" className="Font18 textTertiary pointer hoverColorPrimary" />
            </Dropdown>
          ),
        },
      ],
      credit: [
        { title: _l('时间'), dataIndex: 'createTime', width: 180 },
        { title: _l('产品类型'), dataIndex: 'type', width: 120, ellipsis: true },
        {
          title: _l('信用点'),
          dataIndex: 'credit',
          width: 150,
          align: 'right',
          className: AMOUNT_COLUMN_CLASS,
        },
        {
          title: _l('应用'),
          dataIndex: 'app',
          width: 300,
          ellipsis: true,
          render: application => renderApplication(projectId, application),
        },
        { title: _l('操作对象'), dataIndex: 'business', width: 300, ellipsis: true },
        { title: _l('操作来源'), dataIndex: 'channel', width: 120, ellipsis: true },
        {
          title: _l('操作人'),
          dataIndex: 'operator',
          width: 140,
          ellipsis: true,
          render: user => renderUser(projectId, user),
        },
        {
          title: '',
          dataIndex: 'detail',
          width: 70,
          align: 'center',
          render: (text, record) => renderDetailAction(getBillingDetail(record, 'credit')),
        },
      ],
      aiBenefit: [
        {
          title: _l('时间'),
          dataIndex: 'createTime',
          width: 200,
        },
        {
          title: _l('产品类型'),
          dataIndex: 'scene',
          width: 200,
          ellipsis: true,
          render: scene => getAITypeLabel(scene),
        },
        {
          title: _l('AI 福利点'),
          dataIndex: 'freeApplied',
          width: 200,
          align: 'right',
          className: AMOUNT_COLUMN_CLASS,
          render: (value, record) =>
            record?.accountStatus === 'pending_aggregate' ? _l('结算中') : formatBillingDeduction(value),
        },
        {
          title: _l('创建人'),
          dataIndex: 'createAccountInfo',
          width: 200,
          ellipsis: true,
          render: (text, record) => renderUser(projectId, record.createAccountInfo),
        },
        {
          title: '',
          dataIndex: 'detail',
          width: 70,
          align: 'center',
          render: (text, record) => renderDetailAction(getBillingDetail(record, 'aiBenefit')),
        },
      ],
      refund: [
        { title: _l('退款时间'), dataIndex: 'createTime', width: 180 },
        { title: _l('产品类型'), dataIndex: 'type', width: 120, ellipsis: true },
        {
          title: _l('信用点'),
          dataIndex: 'credit',
          width: 150,
          align: 'right',
          className: AMOUNT_COLUMN_CLASS,
        },
        {
          title: _l('应用'),
          dataIndex: 'app',
          width: 260,
          ellipsis: true,
          render: application => renderApplication(projectId, application),
        },
        { title: _l('操作对象'), dataIndex: 'business', width: 260, ellipsis: true },
        { title: _l('操作来源'), dataIndex: 'channel', width: 120, ellipsis: true },
      ],
    };

    return columnsByTab[activeTab];
  }, [activeTab, projectId]);

  return (
    <BillInfoWrap className="billingDetails">
      <BalanceHeader projectId={projectId} />
      <div className="billingDetailTabs flexRow">
        {DETAIL_TABS.map(item => (
          <span
            key={item.key}
            className={cx('billingDetailTab pointer', { active: activeTab === item.key })}
            onClick={() => {
              if (activeTab === item.key) return;

              onRequestParamsChange?.(
                item.key === 'aiBenefit' ? null : getRequestParams({ tab: item.key, projectId, pageIndex: 1 }),
              );
              setActiveTab(item.key);
              setQuery({ filters: {}, pageIndex: 1 });
              setData({ loading: true, list: [] });
            }}
          >
            {item.label}
          </span>
        ))}
        <div className="billingDetailRefresh flexRow alignItemsCenter">
          <Tooltip title={_l('刷新')} placement="top">
            <Icon
              icon="refresh1"
              className={cx('billingDetailRefreshIcon Font18', { disabled: data.loading })}
              onClick={handleRefresh}
            />
          </Tooltip>
        </div>
      </div>
      <SearchWrap
        wrapClassName="billingSearchWrap"
        projectId={projectId}
        searchList={getSearchList(activeTab, filters)}
        searchValues={filters}
        showExpandBtn={true}
        onChange={nextFilters => {
          onRequestParamsChange?.(
            isAI ? null : getRequestParams({ tab: activeTab, projectId, filters: nextFilters, pageIndex: 1 }),
          );
          setQuery({ filters: nextFilters, pageIndex: 1 });
        }}
      />
      <div className="billingTable flex minHeight0">
        <PageTableCon
          key={activeTab}
          loading={data.loading}
          columns={columns}
          dataSource={data.list}
          count={isAI ? Math.min(totalCount, AI_MAX_RESULT_COUNT) : totalCount}
          paginationInfo={{ pageIndex, pageSize: 50 }}
          getDataSource={({ pageIndex: nextPageIndex }) =>
            setQuery(previous => ({ ...previous, pageIndex: nextPageIndex }))
          }
          tableSetting={{ rowKey: isAI ? 'traceId' : 'id' }}
        />
      </div>
      {detail && <BillingDetailDrawer projectId={projectId} detail={detail} onClose={() => setDetail(null)} />}
    </BillInfoWrap>
  );
}
