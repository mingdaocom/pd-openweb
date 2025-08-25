import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, UserHead, UserName } from 'ming-ui';
import paymentAjax from 'src/api/payment';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import SearchWrap from 'src/pages/Admin/components/SearchWrap';
import { VersionProductType } from 'src/utils/enum';
import Empty from '../../../common/TableEmpty';
import { BALANCE_INFO } from '../../config';
import withdrawalsEmptyImg from '../../images/withdrawals.png';
import WithdrawalsDialogFunc from './WithdrawReimburseDialog';

const BalanceWrap = styled.div`
  padding: 36px 0 25px 32px;
  border-bottom: 1px solid #eaeaea;
  position: relative;
  .alignItemsBaseline {
    align-items: baseline;
  }
  .icon-help {
    color: #9d9d9d;
    &:hover {
      color: #1677ff;
    }
  }
`;

const Header = styled.div`
  .icon-backspace {
    vertical-align: text-top;
  }
`;

const Content = styled.div`
  .searchWrap {
    padding-top: 0 !important;
  }
`;

const FlexWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export default class WithdrawalsRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
      banlance: 0,
      balanceLoading: true,
    };
    this.isInit = true;
    this.columns = [
      { title: _l('商户简称'), dataIndex: 'shortName', width: 200 },
      { title: _l('提现单号'), dataIndex: 'withDrawId', width: 300 },
      {
        title: _l('提现金额'),
        dataIndex: 'amount',
        width: 160,
        render: text => {
          return <div style={{ color: '#47b14b' }}>{text}</div>;
        },
      },
      {
        title: _l('提现状态'),
        dataIndex: 'status',
        width: 120,
        render: text => {
          return <div>{text === 0 ? _l('提现中') : text === 2 ? _l('已完成') : '-'}</div>;
        },
      },
      {
        title: _l('操作人'),
        dataIndex: 'accountId',
        width: 120,
        render: (text, record) => {
          const { payAccountInfo = {} } = record;
          const { accountId, fullname, avatar } = payAccountInfo;
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
              <UserName
                className="Gray Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                projectId={props.projectId}
                user={{
                  userName: fullname,
                  accountId: accountId,
                }}
              />
            </div>
          );
        },
      },
      { title: _l('提现时间'), dataIndex: 'updateTime', width: 220 },
      { title: _l('手续费'), dataIndex: 'taxAmount', width: 160 },
      { title: _l('到账金额'), dataIndex: 'settlementAmount', width: 160 },
    ];
  }

  componentDidMount() {
    this.getMerchantBalance();
    this.getDataList();
  }

  // 获取商户余额
  getMerchantBalance = () => {
    const { projectId, currentMerchantInfo = {} } = this.props;
    paymentAjax
      .getMerchantBanlance({
        projectId,
        merchantNo: currentMerchantInfo.merchantNo,
      })
      .then(res => {
        this.setState({ ...res, balanceLoading: false });
      })
      .catch(() => {
        this.setState({ balanceLoading: false });
      });
  };

  getDataList = ({ pageIndex = 1 } = {}) => {
    this.setState({ loading: true });
    const { projectId, currentMerchantInfo = {} } = this.props;
    const { merchantNo } = currentMerchantInfo;
    const { searchValues = {} } = this.state;
    const { selectUserInfo = [], shortName, withdrawTimeInfo = {}, status } = searchValues;
    const { startDate, endDate } = withdrawTimeInfo;

    const ids = selectUserInfo.map(item => item.accountId);

    paymentAjax
      .getWithDrawList({
        projectId,
        merchantNo,
        shortName,
        accountId: !_.isEmpty(ids) ? ids[0] : undefined,
        startUpdateTime: startDate,
        endUpdateTime: endDate,
        status: _.isNumber(status) ? status : undefined,
        pageFilter: {
          pageIndex,
          pageSize: 50,
        },
      })
      .then(({ dataCount, widthDraws = [] }) => {
        this.isInit = false;
        this.setState({ loading: false, list: widthDraws, count: dataCount });
      });
  };

  // 提现
  handleWithdraw = () => {
    const { projectId, currentMerchantInfo = {}, featureType } = this.props;
    const { banlance } = this.state;

    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
      return;
    }
    WithdrawalsDialogFunc({
      type: 'withdrawals',
      title: _l('提现'),
      okText: _l('提现'),
      label: _l('提现金额'),
      projectId: projectId,
      orderInfo: currentMerchantInfo,
      min: 0,
      max: banlance,
      desc: (
        <div className="Gray_9e Font12 mTop10">
          <div>{_l('1、提现手续费说明：当前版本暂不收取手续费')}</div>
          <div>{_l('2、余额的变动会影响后续退款是否成功')}</div>
        </div>
      ),
      updateList: () => {
        this.getMerchantBalance();
        this.getDataList();
      },
    });
  };

  render() {
    const { projectId } = this.props;
    const { loading, list, searchValues, pageIndex, count, balanceLoading } = this.state;
    const { status = '' } = searchValues || {};

    return (
      <Fragment>
        <div className="orgManagementHeader">
          <Header className="bold Font17">
            <Icon
              icon="backspace"
              className="Font22 ThemeHoverColor3 pointer mRight10"
              onClick={() => this.props.changeCreateMerchant(false)}
            />
            {_l('提现记录')}
          </Header>
        </div>
        <BalanceWrap className="flexRow">
          {BALANCE_INFO.map(item => {
            const { id, text } = item;

            return (
              <div key={id} className="flexRow alignItemsBaseline mRight60">
                <span className="Font12">{`${text}`}</span>
                <span className="Font24 bold mLeft10 ThemeColor">
                  {!balanceLoading && !_.isUndefined(this.state[id]) ? (
                    <Fragment>
                      <span className="Font18">¥</span> {this.state[id]}
                    </Fragment>
                  ) : (
                    '-'
                  )}
                </span>
                {!balanceLoading && (
                  <span className="ThemeColor Hand mLeft10" onClick={this.handleWithdraw}>
                    {_l('提现')}
                  </span>
                )}
              </div>
            );
          })}
        </BalanceWrap>

        <Content className="orgManagementContent flexColumn">
          {this.isInit && loading ? (
            <LoadDiv />
          ) : _.isEmpty(list) && !searchValues ? (
            <Empty
              className="flex"
              detail={{
                descClassName: 'Gray_bd',
                desc: _l('您的账户目前暂无提现记录'),
                customIcon: <img className="customIcon" src={withdrawalsEmptyImg} />,
              }}
            />
          ) : (
            <Fragment>
              <SearchWrap
                wrapClassName="searchWrap"
                projectId={projectId}
                searchList={[
                  {
                    key: 'status',
                    type: 'select',
                    label: _l('提现状态'),
                    placeholder: _l('请选择'),
                    allowClear: true,
                    value: status,
                    maxTagCount: 'responsive',
                    options: [
                      { label: _l('全部'), value: '' },
                      { label: _l('提现中'), value: 0 },
                      { label: _l('已完成'), value: 2 },
                    ],
                  },
                  {
                    key: 'selectUserInfo',
                    type: 'selectUser',
                    label: _l('操作人'),
                    unique: true,
                    suffixIcon: <Icon icon="person" className="Font16" />,
                  },
                  {
                    key: 'withdrawTimeInfo',
                    type: 'selectTime',
                    label: _l('提现时间'),
                    placeholder: _l('选择日期范围'),
                    dateFormat: 'YYYY-MM-DD HH:mm:ss',
                    suffixIcon: <Icon icon="person" className="Font16" />,
                  },
                ]}
                searchValues={searchValues}
                showExpandBtn={false}
                onChange={searchParams => {
                  this.setState(
                    {
                      searchValues: _.isEmpty(searchParams)
                        ? {}
                        : {
                            ...searchValues,
                            ...searchParams,
                          },
                      pageIndex: 1,
                    },
                    () => {
                      this.getDataList();
                    },
                  );
                }}
              />
              <FlexWrap className="flex">
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
            </Fragment>
          )}
        </Content>
      </Fragment>
    );
  }
}
