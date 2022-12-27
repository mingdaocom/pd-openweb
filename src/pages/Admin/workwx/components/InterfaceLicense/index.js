import React, { Component, Fragment } from 'react';
import { Button, ScrollView, LoadDiv, Icon } from 'ming-ui';
import workWeiXinAjax from 'src/api/workWeiXin';
import styled from 'styled-components';
import moment from 'moment';

const orderTypes = { 1: _l('购买账号'), 2: _l('续期账号'), 5: _l('历史企业迁移订单') };
const orderStatus = {
  0: _l('待支付'),
  1: _l('已支付'),
  2: _l('已取消'),
  3: _l('未支付，订单已过期'),
  4: _l('申请退款中'),
  5: _l('退款成功'),
  6: _l('退款被拒绝'),
  7: _l('订单已失效'),
};

const OrderInfo = styled.div`
  background: #fff;
  position: absolute;
  top: 17px;
  left: 20px;
  width: calc(100% - 40px);
  .titleInfo{
    height: 55px;
    border-bottom: 1px solid #eaeaea
    display: flex;
    align-items: center;
  }
  .applyConent{
    padding: 40px 72px 0;
  }
  .row{
    display: flex;
    .label{
      width: 108px ;
      color: #9e9e9e;
      font-size: 13px;
    }
    .value{
      flex:1;
      font-size: 15px;
      font-weight: 600;
    }
  }
  .line{
    width: 100%;
    height: 1px;
    border-top: 1px solid #eaeaea
    margin: 20px 0 28px 0;
  }
  .borderRadius16{
    border-radius: 16px;
  }
`;

const OrderDetail = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px 24px 24px;
  .tableRow {
    .headerItem {
      padding: 10px 0;
      font-weight: 600;
      border-bottom: 1px solid #eaeaea;
      width: 110px;
    }
    .bodyItem {
      padding: 12px 8px 12px 0;
      border-bottom: 1px solid #eaeaea;
      width: 110px;
    }
  }
  .themeColor {
    color: #2196f3;
  }
`;

export default class InterfaceLicense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      pageIndex: 1,
      licenseDetail: {},
    };
  }

  componentDidMount() {
    this.getLicenseDetail();
  }

  getLicenseDetail = () => {
    const { projectId } = this.props;
    this.setState({ loading: true });
    this.getWorkWxLicenseOrderList();
    workWeiXinAjax.getWorkWxLicenseDetailByApp({ projectId }).then(res => {
      this.setState({ licenseDetail: res, loading: false });
    });
  };

  //  购买/增购
  clickBuy = buyMore => {
    const { projectId } = this.props;
    this.setState({ loading: true, step: 2 });
    workWeiXinAjax.getWorkWxLicenseCreateOrderDetailByApp({ projectId }).then(res => {
      this.setState({ buyMore, orderInfo: res, loading: false });
    });
  };

  getWorkWxLicenseOrderList = () => {
    const { orderList = [], pageIndex = 1 } = this.state;
    const { projectId } = this.props;
    workWeiXinAjax.getWorkWxLicenseOrderList({
      projectId,
      pageIndex,
      pageSize: 50,
    }).then(res => {
      this.setState({
        orderList: pageIndex == 1 ? res.orderList : orderList.concat(res.orderList),
        hasMore: res.orderList.length > 50,
        step: res.orderList.length ? 3 : 1,
      });
    });
  };

  onScrollEnd = () => {
    const { hasMore } = this.state;
    if (!hasMore) return;
    this.setState({ pageIndex: this.state.pageIndex + 1, hasMore: false }, () => {
      this.getWorkWxLicenseOrderList(cursor);
    });
  };

  // 申请下单
  applyPayOrder = isRenewal => {
    const { projectId } = this.props;
    if (isRenewal) {
      // 申请续费
    } else {
      // 申请下单
      workWeiXinAjax.createWorkWxLicenseOrder({ projectId }).then(res => {
        if (res.item1) {
          alert(_l('申请成功'));
          this.setState({ isRenewal: false }, () => {
            this.getLicenseDetail();
            this.getWorkWxLicenseOrderList();
          });
        } else {
          alert(res.item2, 2);
        }
      });
    }
  };

  // 续期
  clickRenewal = () => {
    const { projectId } = this.props;
    workWeiXinAjax.getWorkWxLicenseCreateOrderDetailByApp({ projectId }).then(res => {
      this.setState({ step: 2, isRenewal: true, orderInfo: res });
    });
  };

  renderFirstBuy = () => {
    const { licenseDetail = {} } = this.state;
    return (
      <div className="pLeft24 pRight24">
        <div className="Font15 bold mBottom18">
          {_l(
            '为确保首次集成90天后正常使用，需向企业微信购买接口许可，购买许可费用由平台承担支付，您无需额外支付，您只需提交申请购买即可',
          )}
        </div>
        <div className="Font13 mBottom5">{_l('已同步账号：%0个', licenseDetail.allAccountCount)}</div>
        <div className="Font13 mBottom40">{_l('已购买许可：%0个', licenseDetail.boughtAccountCount)}</div>
        <Button type="primary" onClick={() => this.clickBuy(false)}>
          {_l('申请购买')}
        </Button>
      </div>
    );
  };

  renderOrderInfo = () => {
    const { loading, orderInfo = {}, isRenewal, buyMore, orderList = [] } = this.state;
    if (loading) {
      return (
        <div className="w100 h100 flexColumn justifyContentCenter alignItemsCenter">
          <LoadDiv />
        </div>
      );
    }
    return (
      <OrderInfo>
        <div className="titleInfo">
          <Icon
            icon="backspace"
            className="Font24 mRight24 mLeft24 Hand"
            onClick={() => this.setState({ step: orderList.length ? 3 : 1 })}
          />
          <span className="Font17">{_l('接口许可')}</span>
        </div>
        <div className="applyConent">
          <div className="Font17 bold mBottom10">{isRenewal ? _l('接口许可续期') : _l('接口许可购买')}</div>
          <div className="Gray_9e mBottom40">{_l('定价规则来源于企业微信')}</div>
          <div className="row mBottom12">
            <div className="label">{_l('企业客户ID')}</div>
            <div className="value">{orderInfo.corpId || '-'}</div>
          </div>
          <div className="row mBottom12">
            <div className="label">{_l('企业客户名称')}</div>
            <div className="value">{orderInfo.corpName || '-'}</div>
          </div>
          <div className="line"></div>
          <div className="row mBottom12">
            <div className="label">{_l('定价')}</div>
            <div className="value">{orderInfo.price || '-'}</div>
          </div>
          <div className="row mBottom12">
            <div className="label">{isRenewal ? _l('续期账号') : _l('许可账号')}</div>
            <div className="value">{_l('%0个', orderInfo.licenseAccountCount)}</div>
          </div>
          <div className="row mBottom40">
            <div className="label">{_l('购买时长')}</div>
            <div className="value">
              {_l('%0个月', orderInfo.months || '-')}
              <span className="Font13 Gray_9e">
                {buyMore ? _l('（截止到接口许可到期时间）') : _l('（截止到版本到期时间）')}
              </span>
            </div>
          </div>
          <div className="Gray_75 mBottom50">
            {_l('总计')}
            <span className="Font20 bold Gray mLeft10">{_l('¥%0元', orderInfo.amount)}</span>
          </div>
          <Button
            type="primary"
            className="borderRadius16"
            onClick={() => {
              this.applyPayOrder(isRenewal);
            }}
          >
            {isRenewal ? _l('申请续期') : _l('申请下单')}
          </Button>
          <div className="Gray_9e mTop20">{_l('购买费用由平台支付，您只需申请下单即可')}</div>
        </div>
      </OrderInfo>
    );
  };

  renderOrderDetail = () => {
    const { licenseDetail = {}, orderList = [] } = this.state;
    return (
      <OrderDetail>
        <div className="Font15 bold mBottom20">
          {_l(
            '为确保首次集成90天后正常使用，需向企业微信购买接口许可，购买许可费用由平台承担支付，您无需额外支付，您只需提交申请购买即可',
          )}
        </div>
        <div className="Font14">
          {_l('已同步账号：')}
          <span className="bold">{_l('%0个', licenseDetail.allAccountCount || '-')}</span>
        </div>
        <div className="Font14">
          {_l('已购买许可：')} <span className="bold">{_l('%0个', licenseDetail.boughtAccountCount)}</span>
          {licenseDetail.isShowBuy && (
            <span className="mLeft10 Hand themeColor" onClick={() => this.clickBuy(true)}>
              {_l('申请购买')}
            </span>
          )}
        </div>
        <div className="Font14 mBottom30">
          {_l('接口许可到期时间：')} <span className="bold">{licenseDetail.expireDate}</span>
          {/* {licenseDetail.isShowBuy && (
            <span className="mLeft10 Hand themeColor" onClick={this.clickRenewal}>
              {_l('续期')}
            </span>
          )} */}
        </div>
        <Fragment>
          <div className="Font15 bold">{_l('购买订单')}</div>
          <div className="tableRow flexRow">
            <div className="headerItem orderId pLeft8 ellipsis flex">{_l('订单号')}</div>
            <div className="headerItem">{_l('类型')}</div>
            <div className="headerItem">{_l('账号数量')}</div>
            <div className="headerItem">{_l('时长')}</div>
            <div className="headerItem">{_l('金额')}</div>
            <div className="headerItem">{_l('状态')}</div>
            <div className="headerItem">{_l('下单时间')}</div>
            <div className="headerItem">{_l('下单人')}</div>
          </div>
          <div className="tableContent flex">
            <ScrollView onScrollEnd={this.onScrollEnd}>
              {orderList.map(item => {
                return (
                  <div className="tableRow flexRow" key={item.orderId}>
                    <div className="bodyItem orderId pLeft8 flex ellipsis">{item.orderId}</div>
                    <div className="bodyItem ellipsis">{orderTypes[item.orderType]}</div>
                    <div className="bodyItem ellipsis">{_l('%0个', item.accountCount)}</div>
                    <div className="bodyItem ellipsis">{_l('%0月', item.accountDuration)}</div>
                    <div className="bodyItem ellipsis">{item.price}</div>
                    <div className="bodyItem ellipsis">{orderStatus[item.orderStatus]}</div>
                    <div className="bodyItem ellipsis">{moment(item.createTime).format('YYYY-MM-DD')}</div>
                    <div className="bodyItem ellipsis">{item.operatorName}</div>
                  </div>
                );
              })}
            </ScrollView>
          </div>
        </Fragment>
      </OrderDetail>
    );
  };

  renderContent = () => {
    if (this.state.loading && this.state.step !== 2) {
      return (
        <div className="w100 h100 flexColumn justifyContentCenter alignItemsCenter">
          <LoadDiv />
        </div>
      );
    }
    switch (this.state.step) {
      case 1:
        return this.renderFirstBuy();
      case 2:
        return this.renderOrderInfo();
      case 3:
        return this.renderOrderDetail();
    }
  };

  render() {
    return <Fragment>{this.renderContent()}</Fragment>;
  }
}
