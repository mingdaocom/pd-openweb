import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Dropdown, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import MaskText from 'src/pages/Admin/components/MaskText';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import SearchWrap from 'src/pages/Admin/components/SearchWrap';
import { INVOICE_STATUS, INVOICE_STATUS_OPTIONS } from 'src/pages/invoice/constant';
import { InvoiceConfirmDialog } from 'src/pages/invoice/InvoiceConfirm';
import { formatNumberThousand } from 'src/utils/control';
import { INVOICE_TYPE, REVERSAL_REASON, STATISTIC } from '../config';
import InvoiceDetail from './InvoiceDetail';

const Wrapper = styled.div`
  .statisticWrap {
    display: flex;
    align-items: baseline;
    gap: 48px;
    padding-left: 16px;
  }
  .successColor {
    color: var(--color-success);
  }
  .failedColor {
    color: var(--color-error);
  }
  .warningColor {
    color: var(--color-warning);
  }
`;

let appPromise = null;

const InvoiceList = forwardRef((props, ref) => {
  const { projectId, updateDisabledExportBtn, taxList } = props;
  const [summary, setSummary] = useState({});
  const [invoiceList, setInvoiceList] = useState({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchValues, setSearchValues] = useState({});
  const [fetchAppState, setFetchAppState] = useSetState({ appPageIndex: 1, loading: false, hasMore: true });
  const [appList, setAppList] = useState([]);
  const [worksheetList, setWorksheetList] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [syncingInvoiceId, setSyncingInvoiceId] = useState('');
  const [detailVisibleId, setDetailVisibleId] = useState('');
  const [reversalReason, setReversalReason] = useState(1);
  const [reversalOrderId, setReversalOrderId] = useState('');
  const [reversalLoading, setReversalLoading] = useState(false);

  // 使用 useImperativeHandle 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    handleExport,
    getInvoiceList,
    getSummary,
  }));

  useEffect(() => {
    getSummary();
  }, []);

  useEffect(() => {
    getInvoiceList();
  }, [searchValues]);

  useEffect(() => {
    getAppList();
  }, [fetchAppState.loading, fetchAppState.appPageIndex, fetchAppState.keyword]);

  const getSummary = () => {
    merchantInvoiceApi.getInvoiceSummary({ projectId }).then(res => {
      setSummary(res);
    });
  };

  const getInvoiceList = ({ pageIndex = 1 } = {}) => {
    setLoading(true);

    const { startDate, endDate } = searchValues?.applyTime || {};
    const operator = (searchValues?.operatorInfo || [])[0]?.accountId;

    merchantInvoiceApi
      .getInvoiceList({
        projectId,
        pageFilter: { pageIndex, pageSize: 50 },
        ..._.omit(searchValues, ['applyTime', 'operatorInfo']),
        startCreateTime: startDate,
        endCreateTime: endDate,
        operator,
      })
      .then(({ invoices, dataCount }) => {
        updateDisabledExportBtn(dataCount === 0);
        setInvoiceList({ list: invoices || [], total: dataCount });
        setLoading(false);
        setPageIndex(pageIndex);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getAppList = () => {
    const { appPageIndex, hasMore, loading, keyword = '' } = fetchAppState;

    // 加载更多
    if (!loading || !hasMore) {
      return;
    }

    setFetchAppState({ loading: true });
    if (appPromise && _.isFunction(appPromise)) {
      appPromise.abort();
    }

    appPromise = appManagementApi.getAppsByProject({
      projectId,
      status: '',
      order: 3,
      pageIndex: appPageIndex,
      pageSize: 50,
      keyword,
    });

    appPromise
      .then(({ apps }) => {
        const newAppList = (apps || []).map(item => ({ label: item.appName, value: item.appId }));
        setFetchAppState({ loading: false, hasMore: newAppList.length >= 50 });
        setAppList(appPageIndex === 1 ? newAppList : appList.concat(newAppList));
      })
      .catch(() => setFetchAppState({ loading: false }));
  };

  const getWorksheetList = appId => {
    appManagementApi.getWorksheetsUnderTheApp({ projectId, appIds: [appId], isFilterCustomPage: true }).then(res => {
      const list = appId ? (res[appId] || []).map(it => ({ label: it.worksheetName, value: it.worksheetId })) : [];
      setWorksheetList(list);
    });
  };

  const onChangeSearchValues = searchParams => {
    const { appId } = searchValues || {};

    if (searchParams.appId && !_.isEqual(searchParams.appId, appId)) {
      getWorksheetList(searchParams.appId);
    }

    if (_.isEmpty(searchParams) && fetchAppState.keyword) {
      setFetchAppState({ appPageIndex: 1, keyword: fetchAppState.keyword, loading: true });
    }

    const searchValuesObj = _.isEmpty(searchParams) ? searchParams : { ...searchValues, ...searchParams };

    setSearchValues({
      ...searchValuesObj,
      worksheetId: searchParams.worksheetId && !searchParams.appId ? undefined : searchValuesObj.worksheetId,
    });
  };

  const getConditions = () => {
    const { invoiceNo, title, status, appId = '', worksheetId, orderId, isFastRed, isBlue, taxNo } = searchValues || {};

    const conditions = [
      { key: 'invoiceNo', type: 'input', label: _l('发票号码'), placeholder: _l('输入发票号码'), value: invoiceNo },
      { key: 'invoiceTitle', type: 'input', label: _l('发票抬头'), placeholder: _l('输入发票抬头'), value: title },
      {
        key: 'status',
        type: 'select',
        label: _l('开票状态'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: status,
        maxTagCount: 'responsive',
        options: INVOICE_STATUS_OPTIONS,
      },
      {
        key: 'applyTime',
        type: 'selectTime',
        label: _l('申请时间'),
        placeholder: _l('选择日期范围'),
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      { key: 'orderId', type: 'input', label: _l('订单编号'), placeholder: _l('输入订单编号'), value: orderId },
      {
        type: 'selectUser',
        key: 'operatorInfo',
        label: _l('开票人'),
        suffixIcon: <Icon icon="person" className="Font16" />,
        containWorkflow: true,
        unique: true,
      },
      {
        key: 'appId',
        type: 'select',
        label: _l('应用'),
        placeholder: _l('全部'),
        showSearch: true,
        allowClear: true,
        options: appList,
        value: appId || [],
        notFoundContent: fetchAppState.loading ? <LoadDiv /> : <span className="textTertiary">{_l('无搜索结果')}</span>,
        maxTagCount: 'responsive',
        onFocus: () => !appList.length && setFetchAppState({ loading: true }),
        onSearch: _.debounce(val => setFetchAppState({ keyword: val, appPageIndex: 1, loading: true }), 500),
        filterOption: (inputValue, option) => {
          return (
            appList
              .find(item => item.value === option.value)
              .label.toLowerCase()
              .indexOf(inputValue.toLowerCase()) > -1
          );
        },
        onClear: () => setFetchAppState({ appPageIndex: 1, keyword: '', loading: true }),
        onPopupScroll: e => {
          e.persist();
          const { scrollTop, offsetHeight, scrollHeight } = e.target;

          if (scrollTop + offsetHeight === scrollHeight) {
            if (fetchAppState.hasMore) {
              setFetchAppState({ loading: true, appPageIndex: fetchAppState.appPageIndex + 1 });
            }
          }
        },
      },
      {
        key: 'worksheetId',
        type: 'select',
        label: _l('表单'),
        placeholder: _l('请选择'),
        showSearch: true,
        allowClear: true,
        options: worksheetList,
        value: worksheetId,
        disabled: !appId,
        filterOption: (inputValue, option) => {
          return (
            worksheetList
              .find(item => item.value === option.value)
              .label.toLowerCase()
              .indexOf(inputValue.toLowerCase()) > -1
          );
        },
        notFoundContent: <span className="textTertiary">{_l('无搜索结果')}</span>,
        maxTagCount: 'responsive',
      },
      {
        key: 'taxNo',
        type: 'select',
        label: _l('开票主体'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: taxNo,
        maxTagCount: 'responsive',
        options: taxList.map(item => ({ label: item.companyName, value: item.taxNo })),
      },
      {
        key: 'isFastRed',
        type: 'select',
        label: _l('发票状态'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: isFastRed,
        maxTagCount: 'responsive',
        options: [
          { label: _l('正常'), value: false },
          { label: _l('已红冲-全额'), value: true },
        ],
      },
      {
        key: 'isBlue',
        type: 'select',
        label: _l('红蓝标志'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: isBlue,
        maxTagCount: 'responsive',
        options: [
          { label: _l('红票'), value: false },
          { label: _l('蓝票'), value: true },
        ],
      },
    ];

    return conditions;
  };

  const handleExport = () => {
    const { startDate, endDate } = searchValues?.applyTime || {};
    const operator = (searchValues?.operatorInfo || [])[0]?.accountId;

    if (exporting) return;

    setExporting(true);
    updateDisabledExportBtn(true);

    merchantInvoiceApi
      .exportInvoices({
        projectId,
        pageFilter: { pageIndex, pageSize: 50 },
        ..._.omit(searchValues, ['applyTime', 'operatorInfo']),
        startCreateTime: startDate,
        endCreateTime: endDate,
        operator,
      })
      .then(() => {
        setExporting(false);
        updateDisabledExportBtn(false);
      })
      .catch(() => {
        setExporting(false);
        updateDisabledExportBtn(false);
      });
  };

  const onSyncInvoice = invoice => {
    const { orderId, invoiceId } = invoice;
    setSyncingInvoiceId(invoiceId);
    merchantInvoiceApi
      .syncInvoice({ projectId, orderId })
      .then(res => {
        if (res?.message) {
          alert(res.message, 2);
        } else {
          const newList = invoiceList.list.map(item => (item.orderId === orderId ? res?.invoice || item : item));
          setInvoiceList({ list: newList, total: invoiceList.total });
        }

        setSyncingInvoiceId('');
      })
      .catch(() => setSyncingInvoiceId(''));
  };

  const onReversalInvoice = () => {
    setReversalLoading(true);
    merchantInvoiceApi
      .fastRed({ projectId, orderId: reversalOrderId, remark: reversalReason })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          setReversalOrderId('');
          setReversalReason(1);
          getInvoiceList();
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .finally(() => setReversalLoading(false));
  };

  const columns = [
    {
      title: _l('开票状态'),
      dataIndex: 'status',
      width: 100,
      render: (value, record) => (
        <div className="flexRow alignItemsCenter">
          <span
            className={cx({
              successColor: value === INVOICE_STATUS.INVOICED,
              failedColor: value === INVOICE_STATUS.FAILED,
              warningColor: value === INVOICE_STATUS.CANCELLED,
            })}
          >
            {(_.find(INVOICE_STATUS_OPTIONS, item => item.value === value) || {}).label}
          </span>
          {value === INVOICE_STATUS.FAILED && (
            <Tooltip title={record.message}>
              <Icon icon="info_outline" className="textTertiary Font14 mLeft5" />
            </Tooltip>
          )}
        </div>
      ),
    },
    { title: _l('发票抬头'), dataIndex: 'invoiceTitle', width: 280 },
    { title: _l('发票类型'), dataIndex: 'invoiceType', width: 100, render: value => INVOICE_TYPE[value] },
    {
      title: _l('发票金额(含税)'),
      dataIndex: 'price',
      width: 120,
      render: value => <span className={cx({ textError: value < 0 })}>{value}</span>,
    },
    { title: _l('开票单号'), dataIndex: 'invoiceId', width: 240, ellipsis: true },
    { title: _l('发票号码'), dataIndex: 'invoiceNo', width: 200, ellipsis: true, render: value => value || '-' },
    {
      title: _l('申请时间'),
      dataIndex: 'createTime',
      width: 180,
      render: value => <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>,
    },
    {
      title: _l('开票时间'),
      dataIndex: 'invoiceTime',
      width: 180,
      render: (value, record) => <span>{record.invoiceUrl ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>,
    },
    {
      title: _l('发票状态'),
      dataIndex: 'isFastRed',
      width: 120,
      render: (value, record) =>
        record.invoiceUrl ? value ? <span className="textError">{_l('已红冲-全额')}</span> : _l('正常') : '-',
    },
    {
      title: _l('红蓝标志'),
      dataIndex: 'isBlue',
      width: 100,
      render: value => (!value ? _l('红票') : _l('蓝票')),
    },
    {
      title: _l('发票'),
      dataIndex: 'invoiceUrl',
      width: 100,
      render: value =>
        value ? (
          <span className="colorPrimary Hand Hover_51" onClick={() => window.open(value)}>
            {_l('查看')}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: _l('操作'),
      dataIndex: 'action',
      fixed: 'right',
      width: 'auto',
      minWidth: 108,
      render: (value, record) => {
        return (
          <div className="flexRow alignItemsCenter">
            <span className="colorPrimary Hand Hover_51" onClick={() => setDetailVisibleId(record.invoiceId)}>
              {_l('详情')}
            </span>

            {record.status === INVOICE_STATUS.INVOICED && record.isBlue && !record.isFastRed && (
              <span className="colorPrimary Hand Hover_51 mLeft24" onClick={() => setReversalOrderId(record.orderId)}>
                {_l('冲红')}
              </span>
            )}

            {!record.processId && record.isBlue && (
              <Fragment>
                {record.status === INVOICE_STATUS.PROCESSING &&
                  (syncingInvoiceId === record.invoiceId ? (
                    <span>
                      <LoadDiv className="mLeft24" size="small" />
                    </span>
                  ) : (
                    <span className="colorPrimary Hand Hover_51 mLeft24" onClick={() => onSyncInvoice(record)}>
                      {_l('刷新')}
                    </span>
                  ))}

                {record.status === INVOICE_STATUS.UN_INVOICED && (
                  <span
                    className="colorPrimary Hand Hover_51 mLeft24"
                    onClick={() => {
                      InvoiceConfirmDialog({
                        isLandPage: false,
                        orderId: record.orderId,
                        projectId,
                        onConfirmSuccess: () => getInvoiceList(),
                      });
                    }}
                  >
                    {_l('审核开票')}
                  </span>
                )}
              </Fragment>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Wrapper className="h100 flex flexColumn">
      <div className="statisticWrap">
        {STATISTIC.map((item, index) => (
          <div key={item.id}>
            <span>{item.text}</span>
            {index > 2 && <span className="mLeft8 colorPrimary">¥</span>}
            <span className={cx('Font26 bold mLeft5', { colorPrimary: index > 2 })}>
              {index > 2 ? <MaskText text={formatNumberThousand(summary[item.id])} /> : summary[item.id] || 0}
            </span>
            {index <= 2 && <span className="mLeft4">{_l('张')}</span>}
          </div>
        ))}
      </div>
      <SearchWrap
        projectId={projectId}
        searchList={getConditions()}
        searchValues={searchValues}
        showExpandBtn={true}
        onChange={onChangeSearchValues}
      />
      <div className="flex overflowHidden">
        <PageTableCon
          paginationInfo={{ pageIndex, pageSize: 50 }}
          loading={loading}
          columns={columns.map(item => ({
            ...item,
            width: _.isEmpty(invoiceList.list) && item.dataIndex === 'action' ? 150 : item.width,
          }))}
          dataSource={invoiceList.list}
          count={invoiceList.total}
          getDataSource={getInvoiceList}
        />
      </div>

      {detailVisibleId && (
        <InvoiceDetail
          projectId={projectId}
          invoiceId={detailVisibleId}
          onClose={() => setDetailVisibleId('')}
          onViewDetail={id => setDetailVisibleId(id)}
        />
      )}

      {reversalOrderId && (
        <Dialog
          visible={true}
          title={<span className="textError">{_l('确定冲红')}</span>}
          buttonType="danger"
          onCancel={() => {
            setReversalOrderId('');
            setReversalReason(1);
          }}
          okDisabled={reversalLoading}
          onOk={onReversalInvoice}
        >
          <div>
            <div className="Font14 mBottom8">{_l('冲红原因')}</div>
            <Dropdown
              border
              isAppendToBody
              className="w100"
              data={REVERSAL_REASON}
              value={reversalReason}
              onChange={value => setReversalReason(value)}
            />
          </div>
        </Dialog>
      )}
    </Wrapper>
  );
});

export default InvoiceList;
