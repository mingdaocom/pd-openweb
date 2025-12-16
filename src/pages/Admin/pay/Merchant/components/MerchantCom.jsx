import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, UserHead } from 'ming-ui';
import orderController from 'src/api/order';
import paymentAjax from 'src/api/payment';
import { hasPermission } from 'src/components/checkPermission';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import EmptyIndexContent from 'src/pages/Admin/pay/components/EmptyIndexContent';
import { VersionProductType } from 'src/utils/enum';
import { PAY_CHANNEL_TXT, STATUS } from '../../config';
import CreateMerchant from './CreateMerchant';
import WithdrawalsRecord from './WithdrawalsRecord';

const TableWrap = styled(PageTableCon)`
  overflow: hidden;
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
            <Icon icon="check_circle" className="Font48 finishIcon" />
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
export default class MerchantCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createMerchantVisible: props.isCreate,
      loading: false,
      merchantList: [],
      createStep: 0,
      merchantUsage: {},
    };
  }

  componentDidMount() {
    this.getDataList();
    this.getMerchantUsage();
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
        if (!_.isEmpty(merchants)) {
          this.props.changeShowCreateMerchant(true);
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  // 获取商户可创建数量
  getMerchantUsage = () => {
    const { projectId } = this.props;
    paymentAjax.getMerchantUsage({ projectId }).then(res => {
      this.setState({ merchantUsage: res });
    });
  };

  onClickTrial = record => {
    const { projectId, featureType } = this.props;
    if (featureType === '2') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
      return;
    }

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
    const { currentMerchantInfo, merchantUsage = {} } = this.state;
    if (featureType === '2' && key === 'createMerchantVisible') {
      buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
      return;
    }

    if (merchantUsage.canCreate < 1 && key === 'createMerchantVisible' && visible) {
      alert(_l('支付商户号数量已达上限，请先购买'), 3);
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
      description: _l('删除后，待支付的订单不能继续收款，待退款的订单不能继续退款'),
      onOk: () => {
        paymentAjax.deleteMerchant({ projectId, merchantId: record.id, merchantNo: record.merchantNo }).then(res => {
          if (res) {
            alert(_l('删除成功'));
            const newList = _.filter(merchantList, v => v.id !== record.id);
            this.setState({ merchantList: newList, count: count - 1 });
            if (_.isEmpty(newList)) {
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
        {md.global.Config.IsLocal ? (
          <Fragment>
            <div>{_l('1.功能服务费：按商户号收取，年费999元/商户。')}</div>
            <div>{_l('2.支付渠道：支持微信支付、支付宝支付，费率以签约渠道为准。')}</div>
            <div>{_l('3.提现操作：微信/支付宝直连商户号，需在对应官方平台完成提现。')}</div>
          </Fragment>
        ) : (
          <Fragment>
            <div>
              {_l(
                '1.支付功能服务费：按商户号收取，年费999元/商户，月费199元/商户；新商户可申请一周免费试用，试用期间单笔订单限额1元。',
              )}
            </div>
            <div>{_l('2.支付渠道：聚合支付(费率0.25%)、微信支付/支付宝支付(费率以签约渠道为准)。')}</div>
            <div>{_l('3.提现说明：微信/支付宝直连商户号，需在对应官方平台操作提现。')}</div>
          </Fragment>
        )}
      </ExplainWrap>
    );
  };

  render() {
    const { projectId, featureType, myPermissions } = this.props;
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
    const hasManageMerchantAuth = hasPermission(myPermissions, PERMISSION_ENUM.MANAGE_MERCHANT);
    const hasWithdrawAuth = hasPermission(myPermissions, PERMISSION_ENUM.WITHDRAW);

    const columns = [
      { title: _l('商户编号'), dataIndex: 'merchantNo', width: 200, fixed: 'left' },
      { title: _l('商户简称'), dataIndex: 'shortName', ellipsis: true, fixed: 'left' },
      {
        title: _l('支付通道'),
        dataIndex: 'merchantPaymentChannel',
        ellipsis: true,
        width: 200,
        render: (text, record) => {
          const { merchantPaymentChannel } = record;
          return PAY_CHANNEL_TXT[merchantPaymentChannel] || '';
        },
      },
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
            <span style={{ color: value ? '#4CAF50' : '#1677ff' }}>
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
                projectId={projectId}
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
          const { status, merchantPaymentChannel } = record;

          // 0-注册中 1-待开通 2-开通中 3-已开通 4-已禁用
          if (md.global.Config.IsLocal) {
            return (
              hasManageMerchantAuth && (
                <Fragment>
                  {_.includes([0, 3], status) && (
                    <span
                      className="Hand ThemeColor mRight24 Hover_51"
                      onClick={() => this.openCreateMerchant(status == 0 ? 1 : status, record)}
                    >
                      {_l('商户详情')}
                    </span>
                  )}
                  {(_.includes([0, 1, 2], status) ||
                    (_.includes([1, 2], record.merchantPaymentChannel) && !record.subscribeMerchant)) && (
                    <span className="Hand Red" onClick={() => this.deleteMerchant(record)}>
                      {_l('删除')}
                    </span>
                  )}
                </Fragment>
              )
            );
          }

          switch (status) {
            case 0:
              return (
                hasManageMerchantAuth && (
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
                )
              );
            case 1:
            case 2:
              return (
                hasManageMerchantAuth && (
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
                )
              );
            case 3:
              return (
                <Fragment>
                  {hasManageMerchantAuth && (
                    <span
                      className="Hand ThemeColor mRight24 Hover_51"
                      onClick={() => this.openCreateMerchant(3, record)}
                    >
                      {_l('商户详情')}
                    </span>
                  )}
                  {hasWithdrawAuth && !_.includes([1, 2], merchantPaymentChannel) && (
                    <span
                      className="Hand ThemeColor Hover_51 mRight24"
                      onClick={() => {
                        this.props.changeShowHeader(false);
                        this.setState({ showWithdraw: true, currentMerchantInfo: record });
                      }}
                    >
                      {_l('提现')}
                    </span>
                  )}
                  {hasManageMerchantAuth && (
                    <Fragment>
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
                          projectId={projectId}
                          onClick={
                            featureType === '2'
                              ? () => {
                                  buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
                                }
                              : undefined
                          }
                        />
                      )}
                      {_.includes([1, 2], record.merchantPaymentChannel) && !record.subscribeMerchant && (
                        <span className="Hand Red mLeft24" onClick={() => this.deleteMerchant(record)}>
                          {_l('删除')}
                        </span>
                      )}
                    </Fragment>
                  )}
                </Fragment>
              );
          }
        },
      },
    ];

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
          <EmptyIndexContent
            hideBtn={!hasManageMerchantAuth}
            onBtnClick={() => this.changeCreateMerchant('createMerchantVisible', true)}
          />
        ) : (
          <TableWrap
            loading={loading}
            columns={columns.filter(v =>
              md.global.Config.IsLocal ? !_.includes(['subscribeMerchant', 'paymentMethod'], v.dataIndex) : true,
            )}
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
