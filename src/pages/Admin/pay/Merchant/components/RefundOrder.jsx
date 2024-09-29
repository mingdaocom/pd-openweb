import React, { Component, Fragment } from 'react';
import { Icon, LoadDiv, UserHead, UserName, Dialog } from 'ming-ui';
import SearchWrap from 'src/pages/Admin/components/SearchWrap';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import Empty from '../../../common/TableEmpty';
import IsAppAdmin from 'src/pages/Admin/components/IsAppAdmin';
import { REFUND_STATUS } from '../config';
import paymentAjax from 'src/api/payment';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import _ from 'lodash';
import transactionEmptyImg from '../../images/withdrawals.png';
import moment from 'moment';
import { buriedUpgradeVersionDialog } from 'src/util';
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

export default class RefundOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
      orderInfo: {},
      appPageIndex: 1,
    };
    this.appPromise = null;
    this.isInit = true;
    this.columns = [
      { title: _l('退款订单'), dataIndex: 'refundOrderId', width: 290, ellipsis: true },
      {
        title: _l('退款状态'),
        dataIndex: 'status',
        width: 160,
        render: (text, record) => {
          // 0 退款中 1 退款失败 2 已退款 3 待处理 4 已拒绝 5 已取消 6 同意退款
          const { status } = record;
          return (
            _.find(REFUND_STATUS.concat([{ label: _l('退款中'), value: 0 }]), item => item.value === status) || {}
          ).label;
        },
      },
      {
        title: _l('交易金额'),
        dataIndex: 'payAmount',
        width: 170,
        render: (text, record) => {
          return text <= 0 ? 0 : text;
        },
      },
      {
        title: _l('退款金额'),
        dataIndex: 'amount',
        width: 150,
        render: (text, record) => {
          return <div className="color_47">{text}</div>;
        },
      },
      {
        title: _l('申请时间'),
        dataIndex: 'createTime',
        width: 220,
        render: (text, record) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: _l('退款时间'),
        dataIndex: 'refundTime',
        width: 220,
        render: (text, record) => {
          return record.status === 2 ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-';
        },
      },
      {
        title: _l('申请人'),
        dataIndex: 'operatorAccountId',
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
      { title: _l('订单编号'), dataIndex: 'orderId', width: 290, ellipsis: true },
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
        title: _l('操作人'),
        dataIndex: 'operatorAccountInfo',
        width: 160,
        render: (text, record) => {
          const { operatorAccountInfo = {} } = record;
          const { accountId, fullname, avatar, isPortal } = operatorAccountInfo;

          if (!accountId) return '-';

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
      {
        title: _l('操作'),
        dataIndex: 'action',
        fixed: 'right',
        width: 180,
        render: (text, record) => {
          if (record.status !== 3) return null;
          return (
            <Fragment>
              <span className="ThemeColor Hand mRight24 Hover_51" onClick={() => this.handleRefund(record, 6)}>
                {_l('同意')}
              </span>
              <span className="color_f4 Hand" onClick={() => this.handleRefund(record, 4)}>
                {_l('拒绝')}
              </span>
            </Fragment>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.getDataList();
  }

  getDataList = ({ pageIndex = 1 } = {}) => {
    const { projectId } = this.props;
    const { searchValues = {} } = this.state;

    const {
      refundOrderId,
      orderId,
      status,
      appIds,
      merchantNo,
      applyTimeInfo = {},
      refundTimeInfo = {},
      applicantInfo = [],
      operatorInfo = [],
    } = searchValues;
    this.setState({ loading: true });
    const accountIds = applicantInfo.map(item => item.accountId);
    const operatorAccountId = operatorInfo.map(item => item.accountId);

    paymentAjax
      .getRefundOrderList({
        merchantNo,
        projectId, // 组织Id
        refundOrderId: _.trim(refundOrderId), // 退款单号
        status,
        sourceInfo: { appId: appIds }, //支付附加信息
        startCreateTime: applyTimeInfo.startDate, // 申请时间起始
        endCreateTime: applyTimeInfo.endDate, // 申请时间结束
        startRefundTime: refundTimeInfo.startDate, // 退款时间结束
        endRefundTime: refundTimeInfo.endDate, // 退款时间结束
        orderId: _.trim(orderId), // 订单号
        accountId: !_.isEmpty(accountIds) ? accountIds[0] : undefined,
        operatorAccountId: !_.isEmpty(operatorAccountId) ? operatorAccountId[0] : undefined,
        pageFilter: {
          pageIndex, //页码
          pageSize: 50, //每页条数
        },
      })
      .then(({ refundOrders = [], dataCount }) => {
        this.props.updateDisabledExportBtn(_.isEmpty(refundOrders));
        this.isInit = false;
        this.setState({
          list: refundOrders,
          count: dataCount,
          loading: false,
          pageIndex,
        });
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };

  handleExport = () => {
    const { projectId } = this.props;
    const { searchValues = {}, pageIndex, isExport } = this.state;

    const {
      refundOrderId,
      orderId,
      status,
      appIds,
      merchantNo,
      applyTimeInfo = {},
      refundTimeInfo = {},
      applicantInfo = [],
      operatorInfo = [],
    } = searchValues;

    const accountIds = applicantInfo.map(item => item.accountId);
    const operatorAccountId = operatorInfo.map(item => item.accountId);

    if (isExport) return;

    this.setState({ isExport: true });
    this.props.updateDisabledExportBtn(true);

    paymentAjax
      .exportRefundOrder({
        merchantNo,
        projectId, // 组织Id
        refundOrderId: _.trim(refundOrderId), // 退款单号
        status,
        sourceInfo: { appId: appIds }, //支付附加信息
        startCreateTime: applyTimeInfo.startDate, // 申请时间起始
        endCreateTime: applyTimeInfo.endDate, // 申请时间结束
        startRefundTime: refundTimeInfo.endDate, // 退款时间结束
        endRefundTime: refundTimeInfo.endDate, // 退款时间结束
        orderId: _.trim(orderId), // 订单号
        accountId: !_.isEmpty(accountIds) ? accountIds[0] : undefined,
        operatorAccountId: !_.isEmpty(operatorAccountId) ? operatorAccountId[0] : undefined,
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

  getConditions = () => {
    const {
      appList = [],
      searchValues = {},
      isMoreApp,
      loadingApp,
      merchantListLoading,
      merchantList = [],
    } = this.state;
    const { status, appIds = [], merchantNo } = searchValues;

    let conditions = [
      {
        key: 'refundOrderId',
        type: 'input',
        label: _l('退款单号'),
        placeholder: _l('输入退款单号'),
      },
      {
        key: 'status',
        type: 'select',
        label: _l('退款状态'),
        placeholder: _l('请选择'),
        allowClear: true,
        value: status,
        maxTagCount: 'responsive',
        options: REFUND_STATUS,
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
        key: 'applyTimeInfo',
        type: 'selectTime',
        label: _l('申请时间'),
        placeholder: _l('选择日期范围'),
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      {
        key: 'refundTimeInfo',
        type: 'selectTime',
        label: _l('退款时间'),
        placeholder: _l('选择日期范围'),
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      {
        key: 'orderId',
        type: 'input',
        label: _l('订单编号'),
        placeholder: _l('输入订单编号'),
      },
      {
        type: 'selectUser',
        key: 'applicantInfo',
        label: _l('申请人'),
        suffixIcon: <Icon icon="person" className="Font16" />,
      },
      {
        type: 'selectUser',
        key: 'operatorInfo',
        label: _l('操作人'),
        suffixIcon: <Icon icon="person" className="Font16" />,
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
    ];

    return conditions;
  };

  changeSearchParams = (searchParams, isSearch) => {
    const { searchValues } = this.state;
    if (_.isEmpty(searchParams)) {
      this.setState({ searchValues: searchParams, pageIndex: 1 }, this.getDataList);
    } else {
      this.setState({ searchValues: { ...searchValues, ...searchParams }, pageIndex: 1 }, () => {
        if (_.isEqual(searchValues, this.state.searchValues) && !isSearch) return;
        this.getDataList();
      });
    }
  };

  // 操作退款订单（同意/拒绝）
  handleRefund = (record, status) => {
    // status: 4->拒绝 6:同意
    const { projectId, featureType } = this.props;
    const { refundOrderId, amount } = record;

    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
      return;
    }

    Dialog.confirm({
      buttonType: status === 4 ? 'danger' : 'primary',
      title: status === 4 ? _l('是否拒绝退款?') : _l('是否同意退款?'),
      description: status === 4 ? '' : _l('同意退款后，申请的退款金额 ¥%0 将原路退回到用户账户中', amount),
      okText: status === 4 ? _l('拒绝') : _l('同意'),
      onOk: () => {
        paymentAjax.editRefundOrderStatus({ projectId, status, refundOrderId, refundSourceType: 0 }).then(res => {
          if (res) {
            this.getDataList({ pageIndex: 1 });
            alert(_l('操作成功'));
          } else {
            alert(_l('操作失败'), 2);
          }
        });
      },
    });
  };

  render() {
    const { projectId } = this.props;
    const { loading, list, count, pageIndex, searchValues } = this.state;

    if (this.isInit && loading) {
      return <LoadDiv />;
    }

    if (!this.isInit && _.isEmpty(list) && !searchValues) {
      return (
        <Empty
          className="flex"
          descClassName="Gray_bd"
          detail={{
            desc: _l('您的账户目前暂无退款订单'),
            customIcon: <img className="customIcon" src={transactionEmptyImg} />,
          }}
        />
      );
    }

    return (
      <TransactionDetailsWrap className="flex">
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
