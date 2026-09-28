import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Pagination, Segmented, Table } from 'ming-ui/antd-components';
import billingAjax from 'src/api/billing';
import CustomSelectDate from 'src/pages/Admin/components/CustomSelectDate';
import SearchApp from 'src/pages/Admin/components/SearchApp';
import { formatNumberThousand } from 'src/utils/domain/control/number';
import { createDefaultDateInfo, formatBillingDate } from '../config';
import BillingChart from './BillingChart';
import {
  createStackedColumnOptions,
  getAppColumns,
  GRANULARITY_OPTIONS,
  OVERVIEW_CARD_CONFIG,
  PIE_OPTIONS,
} from './config';
import { aggregateColumnData, transformStatisticsSummary } from './utils';
import './index.less';

const STATISTICS_PAGE_SIZE = 10;
const STATISTICS_MAX_RANGE = { value: 1, unit: 'year' };
const EMPTY_STATISTICS_DATA = {
  loading: true,
  error: '',
  creditDistribution: [],
  mingoDistribution: [],
  credit: [],
  aiModel: [],
  creditTotal: 0,
  aiModelTotal: 0,
};
const EMPTY_APP_DATA = { appLoading: true, appError: '', apps: [] };

const getDateRangeDays = ({ startDate, endDate }) =>
  moment(endDate).startOf('day').diff(moment(startDate).startOf('day'), 'days') + 1;

// 组织账务统计页，负责概览、消费分析及应用汇总的数据加载与展示。
export default function Statistics({ projectId }) {
  const [dateInfo, setDateInfo] = useState(createDefaultDateInfo);
  const [isDefaultDate, setIsDefaultDate] = useState(true);
  const [selectedGranularity, setSelectedGranularity] = useState('month');
  const [overviewCards, setOverviewCards] = useState(OVERVIEW_CARD_CONFIG);
  const [data, setData] = useState(EMPTY_STATISTICS_DATA);
  const [appData, setAppData] = useState(EMPTY_APP_DATA);
  const [appIds, setAppIds] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const { loading, error, creditDistribution, mingoDistribution, credit, aiModel, creditTotal, aiModelTotal } = data;
  const { appLoading, appError, apps } = appData;
  const pageApps = apps.slice((pageIndex - 1) * STATISTICS_PAGE_SIZE, pageIndex * STATISTICS_PAGE_SIZE);
  const appColumns = useMemo(() => getAppColumns(), []);
  const { startDate, endDate } = dateInfo;
  const dateRangeDays = getDateRangeDays(dateInfo);
  const showGranularitySelect = dateRangeDays >= 30;
  // 短周期按天展示，但保留用户的粒度偏好，重新选择长周期后自动恢复。
  const granularity = showGranularitySelect ? selectedGranularity : 'day';
  const creditColumnData = useMemo(
    () => aggregateColumnData(credit, granularity, startDate, endDate),
    [credit, endDate, granularity, startDate],
  );
  const aiModelColumnData = useMemo(
    () => aggregateColumnData(aiModel, granularity, startDate, endDate),
    [aiModel, endDate, granularity, startDate],
  );
  const columnOptions = useMemo(
    () => createStackedColumnOptions(granularity, startDate, endDate),
    [endDate, granularity, startDate],
  );

  // 概览始终统计当前自然月，不随消费分析的日期筛选变化。
  useEffect(() => {
    if (!projectId) return;

    // effect 清理后忽略过期响应，避免切换组织时旧请求覆盖新状态。
    let cancelled = false;

    // 加载本月消费及累计充值、消费数据。
    const loadOverview = async () => {
      try {
        const now = moment();
        const overview = await billingAjax.getCreditPointOverview({
          projectId,
          createdFrom: formatBillingDate(now.clone().startOf('month')),
          createdTo: formatBillingDate(now),
        });

        if (cancelled) return;
        setOverviewCards(
          OVERVIEW_CARD_CONFIG.map(item => ({
            ...item,
            value: overview[item.key],
          })),
        );
      } catch {
        // 请求失败时保留当前展示，避免瞬时网络问题清空已有数据。
      }
    };

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // 日期变化时重新加载图表统计汇总。
  useEffect(() => {
    if (!projectId) return;

    // 日期连续切换时只允许最后一次请求更新页面。
    let cancelled = false;

    // 请求汇总接口并转换为图表所需的数据结构。
    const loadStatistics = async () => {
      setData(prev => ({ ...prev, loading: true, error: '' }));

      try {
        const summary = await billingAjax.getCreditPointStatisticsSummary({
          projectId,
          createdFrom: formatBillingDate(startDate),
          createdTo: formatBillingDate(endDate),
        });

        if (cancelled) return;
        setData({ ...transformStatisticsSummary(summary), loading: false, error: '' });
      } catch {
        if (cancelled) return;
        // 刷新失败时仅更新状态提示，保留上一份有效统计数据供用户查看。
        setData(prev => ({ ...prev, loading: false, error: _l('统计数据加载失败') }));
      }
    };

    loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [endDate, projectId, startDate]);

  // 应用筛选和日期变化时，仅刷新应用消费汇总。
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    const loadApps = async () => {
      setAppData(prev => ({ ...prev, appLoading: true, appError: '' }));

      try {
        const result = await billingAjax.getApplicationCreditPointStatistics({
          projectId,
          createdFrom: formatBillingDate(startDate),
          createdTo: formatBillingDate(endDate),
          appIds,
        });

        if (cancelled) return;
        setAppData({ apps: result?.items || [], appLoading: false, appError: '' });
      } catch {
        if (cancelled) return;
        setAppData(prev => ({
          ...prev,
          appLoading: false,
          appError: _l('应用消费汇总加载失败'),
        }));
      }
    };

    loadApps();

    return () => {
      cancelled = true;
    };
  }, [appIds, endDate, projectId, startDate]);

  // 预设日期按范围语义重置颗粒度，自定义日期保留原有阈值规则。
  const handleDateChange = nextDateInfo => {
    const hasDateRange = Boolean(nextDateInfo.startDate && nextDateInfo.endDate);
    const normalizedDateInfo = hasDateRange ? nextDateInfo : createDefaultDateInfo();

    setDateInfo(normalizedDateInfo);
    setIsDefaultDate(!hasDateRange);
    if (Number.isInteger(normalizedDateInfo.value)) {
      setSelectedGranularity(normalizedDateInfo.value <= 7 ? 'day' : 'month');
    } else if (getDateRangeDays(normalizedDateInfo) >= 90) {
      setSelectedGranularity('month');
    }

    setPageIndex(1);
  };

  const handleAppChange = values => {
    setAppIds(values || []);
    setPageIndex(1);
  };

  return (
    <div className="billingStatistics">
      <section className="statisticsSection">
        <h2>{_l('概览')}</h2>
        <div className="statisticsCards">
          {overviewCards.map(item => (
            <div className="statisticsCard" key={item.key}>
              <div className="statisticsCardLabel Bold">{item.label}</div>
              <div className="statisticsCardValue">
                <span>{item.value === '-' ? item.value : formatNumberThousand(item.value)}</span>
                <span className="Font14 mLeft4">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="statisticsSection consumptionAnalysis">
        <h2>{_l('消费分析')}</h2>
        <div className="statisticsFilterRow flexRow alignItemsCenter justifyContentBetween">
          <CustomSelectDate
            allowClear={!isDefaultDate}
            className="statisticsDateSelect"
            dateInfo={dateInfo}
            maxRange={STATISTICS_MAX_RANGE}
            changeDate={handleDateChange}
          />
          {showGranularitySelect && (
            <Segmented
              block
              className="statisticsGranularity"
              options={GRANULARITY_OPTIONS}
              value={selectedGranularity}
              onChange={setSelectedGranularity}
            />
          )}
        </div>
        {error && <div className="statisticsError">{error}</div>}
        <div className="overviewCharts">
          <BillingChart
            type="pie"
            title={_l('信用点消费类型占比')}
            data={creditDistribution}
            loading={loading}
            options={PIE_OPTIONS}
          />
          <BillingChart
            type="pie"
            title={_l('Mingo 消费占比')}
            data={mingoDistribution}
            loading={loading}
            options={PIE_OPTIONS}
          />
        </div>
        <BillingChart
          className="analysisChart"
          type="column"
          title={_l('信用点消费')}
          total={creditTotal}
          data={creditColumnData}
          loading={loading}
          options={columnOptions}
        />
        <BillingChart
          className="analysisChart"
          type="column"
          title={_l('AI 模型（AIGC）消费')}
          total={aiModelTotal}
          data={aiModelColumnData}
          loading={loading}
          options={columnOptions}
        />

        <div className="applicationSummary">
          <div className="applicationSummaryHeader flexRow alignItemsCenter justifyContentBetween">
            <div className="applicationSummaryHeading flexColumn">
              <div className="applicationSummaryTitle Bold Font14">{_l('应用消费汇总')}</div>
              <div className="applicationSummaryDescription Font13 textSecondary">
                {_l('默认展示当前统计周期内总消耗最高的 50 个应用，可通过应用筛选查看指定应用的消费情况。')}
              </div>
            </div>
            <SearchApp
              className="applicationSummaryFilter"
              mode="multiple"
              placement="topLeft"
              placeholder={_l('全部应用')}
              projectId={projectId}
              value={appIds}
              onChange={handleAppChange}
            />
          </div>
          <Table
            bordered
            columns={appColumns}
            dataSource={pageApps}
            loading={appLoading}
            pagination={false}
            rowKey="appId"
            scroll={{ x: appColumns.reduce((total, item) => total + item.width, 0) }}
          />
          <div className="statisticsPaginationWrap flexRow alignItemsCenter justifyContentRight">
            <span className="textSecondary mRight12">{_l('共%0行', apps.length)}</span>
            <Pagination
              simple
              current={pageIndex}
              pageSize={STATISTICS_PAGE_SIZE}
              total={apps.length}
              showSizeChanger={false}
              onChange={setPageIndex}
            />
          </div>
          {appError && <div className="applicationSummaryError">{appError}</div>}
        </div>
      </section>
    </div>
  );
}
