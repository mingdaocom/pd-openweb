import React, { Component, Fragment } from 'react';
import { Button, LoadDiv, Dialog, UserHead, Icon } from 'ming-ui';
import CreateMerchant from './CreateMerchant';
import WithdrawalsRecord from './WithdrawalsRecord';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import { STATUS } from '../config';
import paymentAjax from 'src/api/payment';
import merchantEmpty from '../../images/merchantEmpty.png';
import styled from 'styled-components';
import _ from 'lodash';
import { buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';

const TableWrap = styled(PageTableCon)`
  .ant-table-body {
    height: calc(100% - 60px) !important;
  }
  .ant-table .ant-table-thead tr th {
    padding-top: 0;
  }
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #f78900;
    border-radius: 50%;
    margin-right: 3px;
  }
  .mRight52 {
    margin-right: 52px !important;
  }
`;

const DescWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 50px 0 70px;
  .item {
    border-radius: 10px;
    border: 1px solid #ededed;
    text-align: center;
    padding: 24px 20px;
    flex: 1;
    &:nth-child(2) {
      margin: 0 20px;
    }
    .title {
      font-weight: 500;
    }
    .icon {
      vertical-align: -2px;
    }
  }
`;

const ActivePayment = styled(Button)`
  width: 130px !important;
  height: 48px;
  border-radius: 24px !important;
`;

function EmptyMerchant(props) {
  const { changeCreateMerchant } = props;

  return (
    <div className="h100 flexColumn alignItemsCenter justifyContentCenter">
      <img src={merchantEmpty} style={{ width: 90 }} />
      <div className="Font24 bold mTop30">{_l('申请商户号，开通组织在线收款')}</div>
      <div className="Gray_75 Font18 mTop12">
        {_l('在线教育场景中用户购买课程或服务；各类活动报名在线完成报名费支付；电商零售场景中下单购买商品')}
      </div>
      <DescWrap>
        {[
          {
            title: _l('支付收款'),
            desc: _l('完成商户签约认证才可使用支付功能收款'),
            icon: 'sp_account_balance_wallet_white',
          },
          { title: _l('资金管理'), desc: _l('独立收款并提供安全、便捷的资金管理功能'), icon: 'payment3' },
          { title: _l('聚合支付'), desc: _l('在多端场景下使用微信/支付宝聚合支付'), icon: 'phonelink' },
        ].map((item, index) => {
          const { title, desc, icon } = item;
          return (
            <div className="item" key={index}>
              <div className="Gray Font17 title">
                <Icon icon={icon} className="Black mRight8 Font24" />
                <span>{title}</span>
              </div>
              <div className="Gray_75 Font15 mTop10">{desc}</div>
            </div>
          );
        })}
      </DescWrap>
      <ActivePayment
        type="primary"
        className="activatePayment Font15"
        onClick={() => changeCreateMerchant('createMerchantVisible', true)}
      >
        {_l('立即申请')}
      </ActivePayment>
    </div>
  );
}

export default class MerchantCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createMerchantVisible: props.isCreate,
      loading: false,
      merchantList: [],
      createStep: 0,
    };
    this.columns = [
      { title: _l('商户编号'), dataIndex: 'merchantNo', width: 200 },
      { title: _l('商户简称'), dataIndex: 'shortName', ellipsis: true },
      {
        title: _l('状态'),
        dataIndex: 'status',
        render: (text, record) => {
          return (
            <Fragment>
              <span className="dot" style={{ background: record.status === 3 ? '#4CAF50' : '#F78900' }}></span>
              {STATUS[record.status]}
            </Fragment>
          );
        },
      },
      {
        title: _l('余额'),
        dataIndex: 'banlance',
        render: (text, record) => {
          return <div>{_.isNumber(text) && record.status === 3 ? text : '-'}</div>;
        },
      },
      {
        title: _l('支付渠道'),
        dataIndex: 'paymentMethod',
        render: (text, record) => {
          const { aliPayStatus, wechatPayStatus } = record;
          if (_.includes([1, 2], aliPayStatus) && _.includes([1, 2], wechatPayStatus)) {
            return <span>{_l('微信、支付宝')}</span>;
          } else if (_.includes([1, 2], aliPayStatus)) {
            return <span>{_l('支付宝')}</span>;
          } else if (_.includes([1, 2], wechatPayStatus)) {
            return <span>{_l('微信')}</span>;
          }
          return '-';
        },
      },
      {
        title: _l('操作人'),
        dataIndex: 'accountInfo',
        width: 160,
        render: (text, record) => {
          const { createAccount = {} } = record;
          const { accountId, fullname, avatar } = createAccount;
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
              <div className="mLeft8 ellipsis flex mRight20">{fullname}</div>
            </div>
          );
        },
      },
      {
        title: _l('操作'),
        dataIndex: 'accountId',
        width: 'fit-content',
        fixed: 'right',
        render: (text, record) => {
          const { status } = record;
          // 0-注册中 1-待开通 2-开通中 3-已开通 4-已禁用
          switch (status) {
            case 0:
              return (
                <Fragment>
                  <span
                    className="Hand ThemeColor mRight24 Hover_51"
                    onClick={() => this.openCreateMerchant(1, record)}
                  >
                    {_l('商户详情')}
                  </span>
                  <span className="Hand Red" onClick={() => this.deleteMerchant(record)}>
                    {_l('删除')}
                  </span>
                </Fragment>
              );
            case 1:
            case 2:
              return (
                <Fragment>
                  <span
                    className="Hand ThemeColor mRight52 Hover_51"
                    onClick={() => this.openCreateMerchant(2, record)}
                  >
                    {status === 2 ? _l('签约') : _l('开通')}
                  </span>
                  <span className="Hand Red" onClick={() => this.deleteMerchant(record)}>
                    {_l('删除')}
                  </span>
                </Fragment>
              );
            case 3:
              return (
                <Fragment>
                  <span
                    className="Hand ThemeColor mRight24 Hover_51"
                    onClick={() => this.openCreateMerchant(3, record)}
                  >
                    {_l('商户详情')}
                  </span>
                  <span
                    className="Hand ThemeColor Hover_51"
                    onClick={() => {
                      this.props.changeShowHeader(false);
                      this.setState({ showWithdraw: true, currentMerchantInfo: record });
                    }}
                  >
                    {_l('提现')}
                  </span>
                </Fragment>
              );
          }
        },
      },
    ];
  }

  componentDidMount() {
    this.getDataList();
  }

  getDataList = ({ pageIndex = 1 } = {}) => {
    const { projectId } = this.props;
    this.setState({ loading: true });
    paymentAjax
      .getMerchantList({
        projectId,
        pageFilter: {
          pageIndex,
          pageSize: 50,
        },
      })
      .then(({ merchants, dataCount }) => {
        this.setState({ merchantList: merchants, count: dataCount, loading: false, pageIndex });
        localStorage.setItem(`${projectId}-hasMerchant`, !_.isEmpty(merchants));
        if (!_.isEmpty(merchants)) {
          this.props.changeShowCreateMerchant(true);
        }
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };

  changeCreateMerchant = (key, visible) => {
    const { projectId, featureType } = this.props;
    const { currentMerchantInfo } = this.state;
    if (featureType === '2' && key === 'createMerchantVisible') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
      return;
    }

    this.props.changeShowHeader(!visible);
    this.setState({
      [key]: visible,
      currentMerchantInfo: !visible ? {} : currentMerchantInfo,
      createStep: key === 'createMerchantVisible' && visible ? 0 : undefined,
    });
  };

  openCreateMerchant = (step, record) => {
    const { projectId, featureType } = this.props;
    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
      return;
    }

    this.props.changeShowHeader(false);
    this.setState({ createMerchantVisible: true, createStep: step, currentMerchantInfo: record });
  };

  // 删除商户
  deleteMerchant = record => {
    const { projectId, featureType } = this.props;
    const { merchantList, count } = this.state;

    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
      return;
    }

    Dialog.confirm({
      width: 560,
      title: _l('是否删除当前商户'),
      okText: _l('确认'),
      buttonType: 'danger',
      onOk: () => {
        paymentAjax.deleteMerchant({ projectId, merchantId: record.id, merchantNo: record.merchantNo }).then(res => {
          if (res) {
            alert(_l('删除成功'));
            const newList = _.filter(merchantList, v => v.id !== record.id);
            this.setState({ merchantList: newList, count: count - 1 });
            if (_.isEmpty(newList)) {
              localStorage.setItem(`${projectId}-hasMerchant`, false);
              this.props.changeShowCreateMerchant(false);
            }
          } else {
            alert(_l('删除失败'), 2);
          }
        });
      },
    });
  };

  render() {
    const { projectId, featureType } = this.props;
    const {
      createMerchantVisible,
      showWithdraw,
      loading,
      merchantList = [],
      currentMerchantInfo,
      createStep,
      count,
    } = this.state;

    if (loading) {
      return <LoadDiv />;
    }

    if (showWithdraw) {
      return (
        <WithdrawalsRecord
          featureType={featureType}
          projectId={projectId}
          currentMerchantInfo={currentMerchantInfo}
          changeCreateMerchant={visible => this.changeCreateMerchant('showWithdraw', visible)}
        />
      );
    }

    if (createMerchantVisible) {
      return (
        <CreateMerchant
          projectId={projectId}
          createStep={createStep}
          currentMerchantInfo={currentMerchantInfo}
          changeCreateMerchant={visible => this.changeCreateMerchant('createMerchantVisible', visible)}
          getDataList={this.getDataList}
          updateCurrentMerchant={merchant => {
            const cloneMerchantList = _.clone(merchantList);
            const index = _.findIndex(cloneMerchantList, v => v.id === merchant.id);
            if (index === -1) {
              cloneMerchantList.unshift(merchant);
            } else {
              cloneMerchantList[index] = merchant;
            }
            this.setState({ merchantList: cloneMerchantList });
          }}
        />
      );
    }

    return (
      <Fragment>
        {_.isEmpty(merchantList) ? (
          <EmptyMerchant
            changeCreateMerchant={visible => this.changeCreateMerchant('createMerchantVisible', visible)}
          />
        ) : (
          <TableWrap
            loading={loading}
            columns={this.columns}
            dataSource={merchantList}
            count={count}
            getDataSource={this.getDataList}
          />
        )}
      </Fragment>
    );
  }
}
