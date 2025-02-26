import React, { Component, Fragment } from 'react';
import { Icon, LoadDiv, UserHead, UserName, Tooltip } from 'ming-ui';
import Trigger from 'rc-trigger';
import SearchWrap from 'src/pages/Admin/components/SearchWrap';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import Empty from '../../../common/TableEmpty';
import PaymentDetails from '../../PaymentDetails';
import IsAppAdmin from 'src/pages/Admin/components/IsAppAdmin';
import DatePickerFilter from '../../../common/datePickerFilter';
import reimburseDialogFunc from './WithdrawReimburseDialog';
import { ORDER_STATUS, PAY_METHOD, INVOICE_STATUS, INCOME_INFO, DATE_CONFIG, ORDER_SOURCE } from '../config';
import paymentAjax from 'src/api/payment';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import transactionEmptyImg from '../../images/withdrawals.png';
import moment from 'moment';
import { buriedUpgradeVersionDialog, formatNumberThousand } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { navigateTo } from 'src/router/navigateTo';

const TransactionDetailsWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .pTop0 {
    padding-top: 0 !important;
  }
  .color_47 {
    color: #47b14b;
  }
  .color_f4 {
    color: #f44336;
  }
`;

const FlexWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const IncomeWrap = styled.div`
  display: flex;
  margin-bottom: 20px;
  .alignItemsBaseline {
    align-items: baseline;
  }
  .dateTxt:hover {
    .icon {
      color: #2196f3 !important;
    }
  }
`;

export default class TransactionDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
      orderInfo: {},
      showPaymentDetails: false,
      appPageIndex: 1,
      dateItem: 'today',
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
    };
    this.appPromise = null;
    this.isInit = true;
    this.columns = [
      { title: _l('订单编号'), dataIndex: 'orderId', width: 290, ellipsis: true },
      {
        title: _l('订单状态'),
        dataIndex: 'status',
        width: 160,
        render: (text, record) => {
          const { status } = record;
          return (_.find(ORDER_STATUS, item => item.value === status) || {}).label;
        },
      },
      {
        title: _l('交易金额'),
        dataIndex: 'amount',
        width: 170,
        render: (text, record) => {
          return text <= 0 ? 0 : text;
        },
      },
      {
        title: _l('结算金额'),
        dataIndex: 'settlementAmount',
        width: 170,
        render: (text, record) => {
          const { status } = record;
          return _.includes([1, 2, 3, 5], status) ? text : '-';
        },
      },
      {
        title: _l('结算手续费'),
        dataIndex: 'taxAmount',
        width: 200,
        render: (text, record) => {
          const { status } = record;
          return _.includes([1, 2, 3, 5], status) ? text : '-';
        },
      },
      {
        title: _l('结算手续费率'),
        dataIndex: 'taxRate',
        width: 200,
        render: (text, record) => {
          const { status } = record;
          return _.includes([1, 2, 3, 5], status) ? text + '%' : '-';
        },
      },
      {
        title: _l('退款金额'),
        dataIndex: 'actualRefundAmount',
        width: 150,
        render: (text, record) => {
          return _.includes([3, 5], record.status) ? <div className="color_47">{text}</div> : '-';
        },
      },
      {
        title: _l('订单来源'),
        dataIndex: 'sourceType',
        width: 150,
        render: (text = 1, record) => {
          return (_.find(ORDER_SOURCE, v => v.value === text) || {}).label;
        },
      },
      {
        title: _l('下单人'),
        dataIndex: 'accountId',
        width: 160,
        render: (text, record) => {
          const { payAccountInfo = {} } = record;
          const { accountId, fullname, avatar, isPortal } = payAccountInfo;
          return (
            <div className="flexRow">
              <UserHead
                className="circle"
                user={{
                  userHead: avatar,
                  accountId: accountId,
                }}
                size={24}
                projectId={props.projectId}
              />
              {isPortal ? (
                <div className="pLeft5">{fullname}</div>
              ) : (
                <UserName
                  className="Gray Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                  user={{
                    userName: fullname,
                    accountId: accountId,
                  }}
                />
              )}
            </div>
          );
        },
      },
      { title: _l('下单时间'), dataIndex: 'createTime', width: 220 },
      {
        title: _l('支付方式'),
        dataIndex: 'payOrderType',
        width: 160,
        render: (text, record) => {
          const { payOrderType, status } = record;
          return _.includes([0, 4], status)
            ? '-'
            : (_.find(PAY_METHOD, item => item.value === payOrderType) || {}).label || '-';
        },
      },
      {
        title: _l('支付时间'),
        dataIndex: 'paidTime',
        width: 220,
        render: (text, record) => {
          return _.includes([0, 4], record.status) ? '-' : text;
        },
      },
      { title: _l('收款商户'), dataIndex: 'shortName', width: 300, ellipsis: true },
      {
        title: _l('所属应用'),
        dataIndex: 'app',
        width: 160,
        render: (text, record) => {
          const { sourceInfo = {} } = record;
          const { appColor, appIconUrl, appName, appId } = sourceInfo;
          return (
            <IsAppAdmin
              appId={appId}
              appName={appName}
              iconUrl={appIconUrl}
              iconColor={appColor}
              projectId={props.projectId}
              passCheckManager={true}
            />
          );
        },
      },
      {
        title: _l('所属表单'),
        dataIndex: 'worksheet',
        width: 160,
        render: (text, record) => {
          const { sourceInfo = {} } = record;
          const { workSheetName, worksheetId } = sourceInfo;

          if (!worksheetId) {
            return <span>{workSheetName}</span>;
          }

          return (
            <span
              title={workSheetName}
              className="Hand Hover_21"
              onClick={() => navigateTo(`/worksheet/${worksheetId}`)}
            >
              {workSheetName}
            </span>
          );
        },
      },
      {
        title: _l('记录'),
        dataIndex: 'record',
        width: 160,
        render: (text, record) => {
          const { sourceInfo = {} } = record;
          return <span title={sourceInfo.title}>{sourceInfo.title}</span>;
        },
      },
      // {
      //   title: _l('开票状态'),
      //   dataIndex: 'invoicingStatus',
      //   width: 160,
      //   render: (text, record) => {
      //     const { invoicingStatus } = record;
      //     return _.find(INVOICE_STATUS, item => item.value === invoicingStatus).label;
      //   },
      // },
      {
        title: _l('操作'),
        dataIndex: 'action',
        fixed: 'right',
        width: 180,
        render: (text, record) => {
          // 开票： 已开票、开票中不展示，同时申请退款、退款中、已退款不展示开票按钮；状态是申请开票、开票失败、已支付才可点击开票
          // 退款：已退款、退款中、订单状态（已完结）也不展示此操作项；订单状态已支付、退款失败才可点击退款
          const { status, amount, refundAmount, taxAmount } = record;
          return (
            <Fragment>
              <span
                className="ThemeColor Hand mRight24 Hover_51"
                onClick={() => {
                  const { projectId, featureType } = props;
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
                    return;
                  }
                  this.setState({ orderInfo: record, showPaymentDetails: true }, () => props.changeShowHeader(false));
                }}
              >
                {_l('交易明细')}
              </span>
              {_.includes([1, 5], status) && amount && amount > refundAmount ? (
                <span
                  className="color_f4 Hand"
                  onClick={() => {
                    const { projectId, featureType } = props;
                    if (featureType === '2') {
                      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
                      return;
                    }

                    reimburseDialogFunc({
                      type: 'reimburse',
                      title: <span className="Red">{_l('是否确定退款?')}</span>,
                      buttonType: 'danger',
                      okText: _l('退款'),
                      label: _l('退款金额'),
                      projectId: props.projectId,
                      max: amount - refundAmount > 0 ? (amount - refundAmount).toFixed(2) : undefined,
                      min: 0.01,
                      orderInfo: record,
                      updateList: () => {
                        this.getDataList();
                        this.getPayOrderSummary();
                      },
                    });
                  }}
                >
                  {_l('退款')}
                </span>
              ) : (
                ''
              )}
              {/* {(_.includes([3, 4], invoicingStatus) || status === 2) && (
                <span className="ThemeColor Hand">{_l('开票')}</span>
              )} */}
            </Fragment>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.getDataList();
    this.getPayOrderSummary();
  }

  getMerchantList = () => {
    const { projectId } = this.props;
    this.setState({ merchantListLoading: true });
    paymentAjax
      .getMerchantList({
        projectId,
        pageFilter: {
          pageIndex: 1,
          pageSize: 50,
        },
      })
      .then(({ merchants = [] }) => {
        this.setState({
          merchantList: merchants
            .filter(({ status }) => status === 3)
            .map(({ shortName, merchantNo }) => ({ label: shortName, value: merchantNo })),
          merchantListLoading: false,
        });
      })
      .catch(err => {
        this.setState({ merchantListLoading: false });
      });
  };

  getPayOrderSummary = () => {
    const { projectId } = this.props;
    const { startDate, endDate, searchValues = {} } = this.state;
    const { merchantNo } = searchValues;

    paymentAjax
      .getPayOrderSummary({
        projectId,
        startDate: startDate || moment().format('YYYY-MM-DD'),
        endDate: endDate
          ? moment(endDate).add(1, 'day').format('YYYY-MM-DD')
          : moment().add(1, 'day').format('YYYY-MM-DD'),
        merchantNo,
      })
      .then(({ totalAmount, dateRangeTotalAmount, refundTotalAmount, realAmount }) => {
        this.setState({ totalAmount, dateRangeTotalAmount, refundTotalAmount, realAmount });
      });
  };

  getDataList = ({ pageIndex = 1 } = {}) => {
    const { projectId } = this.props;
    const { searchValues = {} } = this.state;

    const {
      orderId,
      status,
      payOrderType,
      payTimeInfo = {},
      appIds,
      worksheetIds,
      merchantNo,
      sourceType,
      merchantOrderId,
    } = searchValues;
    const { startDate, endDate } = payTimeInfo;

    this.setState({ loading: true });

    paymentAjax
      .getPayOrderList({
        projectId, //组织Id
        orderId: _.trim(orderId), //订单Id
        merchantOrderId: _.trim(merchantOrderId), //交易单号
        merchantNo, // 商户编号
        sourceInfo: {
          appId: appIds,
          worksheetId: worksheetIds,
        }, //支付附加信息
        status, //状态 0未支付 1已支付 2退款中 3已退款
        startPaidTime: startDate, //更新时间 开始
        endPaidTime: endDate, //更新时间 结束
        payOrderType,
        sourceType,
        pageFilter: {
          pageIndex, //页码
          pageSize: 50, //每页条数
        },
      })
      .then(({ payOrders = [], dataCount }) => {
        this.props.updateDisabledExportBtn(_.isEmpty(payOrders));
        this.isInit = false;
        this.setState({
          list: payOrders,
          count: dataCount,
          loading: false,
          pageIndex,
        });
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };

  getAppList = () => {
    const { projectId } = this.props;
    const { appPageIndex, isMoreApp, loadingApp, keyword = '' } = this.state;
    // 加载更多
    if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
      return;
    }
    this.setState({ loadingApp: true });
    if (this.appPromise && _.isFunction(this.appPromise)) {
      this.appPromise.abort();
    }
    this.appPromise = appManagementAjax.getAppsByProject({
      projectId,
      status: '',
      order: 3,
      pageIndex: appPageIndex,
      pageSize: 50,
      keyword,
    });

    this.appPromise
      .then(({ apps }) => {
        const newAppList = (apps || []).map(item => {
          return {
            label: item.appName,
            value: item.appId,
          };
        });
        this.setState({
          appList: appPageIndex === 1 ? [].concat(newAppList) : this.state.appList.concat(newAppList),
          isMoreApp: newAppList.length >= 50,
          loadingApp: false,
          appPageIndex: appPageIndex + 1,
        });
      })
      .catch(err => {
        this.setState({ loadingApp: false });
      });
  };

  getWorksheetList = appIds => {
    appManagementAjax
      .getWorksheetsUnderTheApp({ projectId: this.props.projectId, appIds: [appIds], isFilterCustomPage: true })
      .then(res => {
        const worksheetList = appIds
          ? (res[appIds] || []).map(it => ({ label: it.worksheetName, value: it.worksheetId }))
          : [];
        this.setState({ worksheetList });
      });
  };

  getConditions = () => {
    const { appId } = this.props;
    const {
      appList = [],
      searchValues = {},
      isMoreApp,
      worksheetList,
      merchantList = [],
      merchantListLoading,
      loadingApp,
    } = this.state;
    const { status, payOrderType, appIds = [], worksheetIds = [], merchantNo, sourceType } = searchValues;

    let conditions = [
      {
        key: 'orderId',
        type: 'input',
        label: _l('订单编号'),
        placeholder: _l('输入订单编号'),
      },
      {
        key: 'appIds',
        type: 'select',
        label: _l('应用'),
        placeholder: _l('全部'),
        showSearch: true,
        allowClear: true,
        options: appList,
        value: appIds,
        notFoundContent: loadingApp ? <LoadDiv /> : <span className="Gray_9e">{_l('无搜索结果')}</span>,
        maxTagCount: 'responsive',
        onFocus: () => !appList.length && this.getAppList(),
        onSearch: _.debounce(val => this.setState({ keyword: val, appPageIndex: 1 }, this.getAppList), 500),
        filterOption: (inputValue, option) => {
          return (
            appList
              .find(item => item.value === option.value)
              .label.toLowerCase()
              .indexOf(inputValue.toLowerCase()) > -1
          );
        },
        onClear: () => {
          this.setState({ appPageIndex: 1, keyword: '' }, this.getAppList);
        },
        onPopupScroll: e => {
          e.persist();
          const { scrollTop, offsetHeight, scrollHeight } = e.target;
          if (scrollTop + offsetHeight === scrollHeight) {
            if (isMoreApp) {
              this.getAppList();
            }
          }
        },
      },
      {
        key: 'worksheetIds',
        type: 'select',
        label: _l('表单'),
        placeholder: _l('请选择'),
        showSearch: true,
        allowClear: true,
        options: worksheetList,
        value: worksheetIds,
        disabled: !appId && _.isEmpty(appIds),
        filterOption: (inputValue, option) => {
          return (
            worksheetList
              .find(item => item.value === option.value)
              .label.toLowerCase()
              .indexOf(inputValue.toLowerCase()) > -1
          );
        },
        notFoundContent: <span className="Gray_9e">{_l('无搜索结果')}</span>,
        maxTagCount: 'responsive',
      },
      {
        key: 'payTimeInfo',
        type: 'selectTime',
        label: _l('支付时间'),
        placeholder: _l('选择日期范围'),
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      {
        key: 'status',
        type: 'select',
        label: _l('订单状态'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: status,
        maxTagCount: 'responsive',
        options: ORDER_STATUS,
      },
      {
        key: 'payOrderType',
        type: 'select',
        label: _l('支付方式'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: payOrderType,
        maxTagCount: 'responsive',
        options: PAY_METHOD,
      },
      {
        key: 'merchantNo',
        type: 'select',
        label: _l('收款商户'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: merchantNo,
        maxTagCount: 'responsive',
        options: merchantList,
        onFocus: () => !merchantList.length && this.getMerchantList(),
        notFoundContent: merchantListLoading ? <LoadDiv /> : <span className="Gray_9e">{_l('无搜索结果')}</span>,
      },
      {
        key: 'sourceType',
        type: 'select',
        label: _l('订单来源'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: sourceType,
        maxTagCount: 'responsive',
        options: ORDER_SOURCE,
      },
      {
        key: 'merchantOrderId',
        type: 'input',
        label: _l('交易单号'),
        placeholder: _l('输入交易单号'),
      },
      // {
      //   key: 'type',
      //   type: 'select',
      //   label: _l('开票状态'),
      //   placeholder: _l('请选择'),
      //   options: [],
      //   value: modules,
      //   mode: 'multiple',
      //   maxTagCount: 'responsive',
      //   options: INVOICE_STATUS,
      // },
    ];

    return conditions;
  };

  changeSearchParams = (searchParams, isSearch) => {
    const { searchValues } = this.state;
    const { appIds, merchantNo } = searchValues || {};

    if (searchParams.appIds && !_.isEqual(searchParams.appIds, appIds)) {
      this.getWorksheetList(searchParams.appIds);
    }
    if (_.isEmpty(searchParams) && this.state.keyword) {
      this.setState({ appPageIndex: 1, keyword: '' }, this.getAppList);
    }

    if (_.isEmpty(searchParams)) {
      this.setState({ searchValues: searchParams, pageIndex: 1 }, () => {
        this.getPayOrderSummary();
        this.getDataList();
      });
      return;
    }

    this.setState(
      {
        searchValues: {
          ...searchValues,
          ...searchParams,
          worksheetIds:
            !searchParams.appIds || !_.isEqual(searchParams.appIds, appIds) ? undefined : searchParams.worksheetIds,
        },
        pageIndex: 1,
      },
      () => {
        if (_.isEqual(this.state.searchValues, searchValues) && !isSearch) return;
        if (this.state.searchValues.merchantNo !== merchantNo) {
          this.getPayOrderSummary();
        }
        this.getDataList();
      },
    );
  };

  handleExport = () => {
    const { projectId } = this.props;
    const { searchValues = {}, pageIndex, isExport } = this.state;

    const {
      orderId,
      status,
      payOrderType,
      payTimeInfo = {},
      appIds,
      worksheetIds,
      merchantNo,
      sourceType,
      merchantOrderId,
    } = searchValues;
    const { startDate, endDate } = payTimeInfo;

    if (isExport) return;

    this.setState({ isExport: true });
    this.props.updateDisabledExportBtn(true);

    paymentAjax
      .exportOrder({
        projectId, //组织Id
        orderId: _.trim(orderId), //订单Id
        merchantOrderId: _.trim(merchantOrderId), //交易单号
        merchantNo, // 商户编号
        sourceInfo: {
          appId: appIds,
          worksheetId: worksheetIds,
        }, //支付附加信息
        status, //状态 0未支付 1已支付 2退款中 3已退款
        startPaidTime: startDate, //更新时间 开始
        endPaidTime: endDate, //更新时间 结束
        payOrderType,
        sourceType,
        pageFilter: {
          pageIndex, //页码
          pageSize: 50, //每页条数
        },
      })
      .then(res => {
        this.setState({ isExport: false });
        this.props.updateDisabledExportBtn(false);
      })
      .catch(err => {
        this.setState({ isExport: false });
        this.props.updateDisabledExportBtn(false);
      });
  };

  render() {
    const { projectId, changeShowHeader = () => {} } = this.props;
    const {
      loading,
      list,
      count,
      pageIndex,
      orderInfo,
      showPaymentDetails,
      datePickerVisible,
      dateItem,
      startDate,
      endDate,
      searchValues,
    } = this.state;

    if (showPaymentDetails) {
      return (
        <PaymentDetails
          projectId={projectId}
          orderInfo={orderInfo}
          onClose={() => this.setState({ showPaymentDetails: false }, () => changeShowHeader(true))}
        />
      );
    }

    if (this.isInit && loading) {
      return <LoadDiv />;
    }

    if (!this.isInit && _.isEmpty(list) && !searchValues) {
      return (
        <Empty
          className="flex"
          descClassName="Gray_bd"
          detail={{
            desc: _l('您的账户目前暂无订单明细'),
            customIcon: <img className="customIcon" src={transactionEmptyImg} />,
          }}
        />
      );
    }

    return (
      <TransactionDetailsWrap className="flex">
        <IncomeWrap className="pLeft16">
          {INCOME_INFO.map(item => {
            const { id, text } = item;
            const dateTxt =
              dateItem !== 'custom'
                ? (_.find(DATE_CONFIG, v => v.id === dateItem) || {}).text
                : `${startDate}-${endDate}`;

            return (
              <div key={id} className="flexRow alignItemsBaseline mRight60">
                {id === 'dateRangeTotalAmount' && (
                  <Trigger
                    popupVisible={datePickerVisible}
                    onPopupVisibleChange={visible => this.setState({ datePickerVisible: visible })}
                    action={['click']}
                    popupAlign={{
                      points: ['tl', 'bl'],
                      offset: [0, 0],
                      overflow: { adjustX: true, adjustY: true },
                    }}
                    popup={
                      <DatePickerFilter
                        offset={{ left: 0, top: -345 }}
                        dataConfig={DATE_CONFIG}
                        updateData={data => {
                          this.setState(
                            {
                              ...data,
                              startDate: data.startDate ? data.startDate : moment().format('YYYY-MM-DD'),
                              endDate: data.endDate ? data.endDate : moment().format('YYYY-MM-DD'),
                              dateItem: data.dateItem ? data.dateItem : 'today',
                              datePickerVisible: false,
                            },
                            this.getPayOrderSummary,
                          );
                        }}
                      />
                    }
                  >
                    <span className="dateTxt">
                      <span>{`${dateTxt} ¥`}</span>
                      <Icon icon="arrow-down-border" className=" Gray_9e Hand mLeft6 mRight12" />
                    </span>
                  </Trigger>
                )}
                {id !== 'dateRangeTotalAmount' && (
                  <span>
                    {text}
                    {_.includes(['totalAmount', 'realAmount'], id) && (
                      <Tooltip text={id === 'totalAmount' ? _l('交易金额的总和') : _l('总收入-手续费-退款金额')}>
                        <i className="icon icon-info Gray_9e Font14 mRight5" />
                      </Tooltip>
                    )}
                    ¥
                  </span>
                )}
                <span
                  className={cx('Font26 bold mLeft5', {
                    ThemeColor: _.includes(['totalAmount', 'dateRangeTotalAmount', 'realAmount'], id),
                  })}
                >
                  {!_.isUndefined(this.state[id]) ? formatNumberThousand(this.state[id]) : '-'}
                </span>
              </div>
            );
          })}
        </IncomeWrap>
        <SearchWrap
          wrapClassName="pTop0"
          projectId={projectId}
          searchList={this.getConditions()}
          searchValues={searchValues}
          showExpandBtn={true}
          onChange={this.changeSearchParams}
        />
        <FlexWrap>
          <PageTableCon
            paginationInfo={{ pageIndex, pageSize: 50 }}
            ref={node => (this.tableWrap = node)}
            loading={loading}
            columns={this.columns}
            dataSource={list}
            count={count}
            getDataSource={this.getDataList}
          />
        </FlexWrap>
      </TransactionDetailsWrap>
    );
  }
}
