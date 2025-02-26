import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { Button, LoadDiv, Dialog, UserHead, Icon } from 'ming-ui';
import CreateMerchant from './CreateMerchant';
import WithdrawalsRecord from './WithdrawalsRecord';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import { STATUS } from '../config';
import paymentAjax from 'src/api/payment';
import orderController from 'src/api/order';
import merchantEmpty from '../../images/merchantEmpty.png';
import styled from 'styled-components';
import _ from 'lodash';
import { buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack';

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

const SuccessWrap = styled.div`
  height: 364px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .finishIcon {
    color: #4caf50;
  }
`;

const ExplainWrap = styled.div`
  background: #f2fafe;
  border-radius: 3px;
  font-size: 13px;
  padding: 12px;
  margin-bottom: 24px;
`;

function SuccessDialog(props) {
  const { visible, loading, onCancel } = props;

  return (
    <Dialog visible={visible} onCancel={onCancel} height={300} footer={null}>
      <SuccessWrap className="pTop100 pBottom100">
        {!loading ? (
          <Fragment>
            <Icon icon="Finish" className="Font48 finishIcon" />
            <div className="Font24 Bold Gray mTop28 TxtCenter">{_l('试用开通成功')}</div>
          </Fragment>
        ) : (
          <Fragment>
            <LoadDiv size="big" />
            <div className="Font24 Bold Gray mTop28 TxtCenter">{_l('开通中')}</div>
          </Fragment>
        )}
      </SuccessWrap>
    </Dialog>
  );
}

function EmptyMerchant(props) {
  const { changeCreateMerchant } = props;

  return (
    <div className="h100 flexColumn alignItemsCenter justifyContentCenter">
      <img src={merchantEmpty} style={{ width: 90 }} />
      <div className="Font24 bold mTop30">{_l('申请商户号，开通组织在线收款')}</div>
      <div className="Gray_75 Font18 mTop12">
        {_l('场景举例：在线教育场景中用户购买课程或服务；各类活动报名在线完成报名费支付；电商零售场景中下单购买商品')}
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
        className="activatePayment Font15 mBottom20"
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
        title: _l('付费状态'),
        dataIndex: 'subscribeMerchant',
        render: (value, record) => {
          return (
            <span style={{ color: value ? '#4CAF50' : '#2196f3' }}>
              {value ? _l('已付费') : record.planType === 0 ? _l('试用中') : _l('待付费')}
            </span>
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
        title: _l('到期时间'),
        dataIndex: 'planExpiredTime',
        render: (value, record) => {
          return <span>{record.status === 3 && !!value ? moment(value).format('YYYY.MM.DD') : '-'}</span>;
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
                    className="Hand ThemeColor Hover_51 mRight24"
                    onClick={() => {
                      this.props.changeShowHeader(false);
                      this.setState({ showWithdraw: true, currentMerchantInfo: record });
                    }}
                  >
                    {_l('提现')}
                  </span>
                  {!record.isTrialed && !record.subscribeMerchant && (
                    <span className="Hand ThemeColor Hover_51 mRight24" onClick={() => this.onClickTrial(record)}>
                      {_l('开通试用')}
                    </span>
                  )}
                  {record.planType !== 1 && (
                    <PurchaseExpandPack
                      className="Hand ThemeColor Hover_51"
                      text={record.subscribeMerchant ? _l('续费') : _l('付费开通')}
                      type="merchant"
                      extraParam={record.id}
                      projectId={props.projectId}
                    />
                  )}
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

  onClickTrial = record => {
    const { projectId } = this.props;

    Dialog.confirm({
      width: 560,
      title: _l('您确定开通试用？'),
      description: (
        <span className="Gray Bold">{_l('开通后此商户号有 7 天免费试用期，试用期间单笔订单交易最高1元')}</span>
      ),
      okText: _l('下一步'),
      onOk: () => {
        this.setState({ successDialogVisible: true });
        orderController
          .addMerchantPaymentOrder({
            projectId,
            num: 1,
            productOrderType: 0,
            productDetailId: record.merchantNo,
            startDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
            endDate: moment().add(6, 'days').format('YYYY-MM-DDTHH:mm:ssZ'),
          })
          .then(data => {
            if (data) {
              this.setState({ success: true });
              this.getDataList();
            }
          });
      },
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

  // 不翻译
  renderExplain = () => {
    return (
      <ExplainWrap>
        <div className="mBottom8">
          从2025年1月22日起，平台将对支付能力进行调整，按照商户号收取功能服务费。具体规则如下：
        </div>
        <div className="mLeft8">
          1.新开通的商户号：
          <br />
          <div className="mLeft16">
            统一按照商户号收费，支付渠道费率为0.25%
            <br />
            商户号在填写资料开通后，可申请一周的免费试用。试用期内，单笔订单交易额最高为 1元
            <br />
            商户也可以选择直接付费开通。付费开通后，单笔订单交易额不受限制。平台支持按月购买，或购买至与组织版本授权到期的时间
            <br />
          </div>
          2.已开通使用的商户：
          <br />
          <div className="mLeft16">
            平台将提供 3个月的过渡调整期。过渡期内，支付渠道费率仍为0.6%，且平台不收取功能服务费
            <br />
            商户切换新的收费方式时必须联系顾问。切换后支付渠道费率为0.25%；调整费率后，之前的订单不支持线上退款
          </div>
        </div>
        <div className="mTop8">功能服务费：</div>
        <div className="mLeft8">
          999元/商户/年（年费）
          <br />
          199元/商户/月（月费）
        </div>
      </ExplainWrap>
    );
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
      success = false,
      successDialogVisible = false,
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
        {this.renderExplain()}
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
        <SuccessDialog
          visible={successDialogVisible}
          loading={!success}
          onCancel={() => this.setState({ successDialogVisible: false, success: false })}
        />
      </Fragment>
    );
  }
}
