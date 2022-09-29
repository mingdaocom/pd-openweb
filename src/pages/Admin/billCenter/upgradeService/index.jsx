import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Checkbox } from 'antd';
import Config from '../../config';
import { Icon, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import './style.less';
import orderController from 'src/api/order';
import projectController from 'src/api/project';

const productList = [5000, 3000, 2000, 1000];

@withRouter
export default class UpgradeService extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('升级明道云产品'));
    this.state = {
      step: 1,
      versionId: null,
      versionName: '',
      versionData: {},
      versionPrice: {},
      totalPrice: 0,
      needSalesAssistance: true,
      isPay: false,
      allowUpgradeVersion: true,
      loading: true,
    };
  }

  componentDidMount() {
    //是否可以升级
    projectController
      .getProjectLicenseSupportInfo({
        projectId: Config.projectId,
      })
      .then(data => {
        if (!data.allowUpgradeVersion) {
          this.setState({
            allowUpgradeVersion: data.allowUpgradeVersion,
          });
          alert(_l('版本不需要升级'), 3, 1000);
        } else {
          this.getVersionData();
        }
      });
  }

  //升级版本信息
  getVersionData() {
    orderController
      .getUpgradeVersionData({
        projectId: Config.projectId,
      })
      .then(data => {
        if (data) {
          if (data.versions && _.isArray(data.versions) && data.versions.length > 0) {
            const versionId = data.versions[0].versionIdV2;
            this.setState(
              {
                versionData: data,
                versionId,
                versionName: data.versions[0].name
              },
              () => {
                this.getUpgradeOrderPrice();
              },
            );
          }
        } else {
          alert(_l('获取升级版本失败'), 2, 1000);
        }
      });
  }

  // 版本费用
  getUpgradeOrderPrice() {
    if (!this.state.versionId) return false;
    orderController
      .getUpgradeVersionOrderPrice({
        projectId: Config.projectId,
        versionId: this.state.versionId,
      })
      .then(data => {
        if (data) {
          this.setState({
            totalPrice: data.totalPrice,
            versionPrice: data.versionPrice,
            loading: false
          });
        }
      });
  }

  handleBack() {
    if(!this.props.history.go(-1)) {
      location.href = `/admin/home/${Config.projectId}`
      return
    }
    this.props.history.go(-1)
  }

  setStep(step) {
    this.setState({ step });
  }

  handleCheckBox(e) {
    this.setState({ needSalesAssistance: e.target.checked });
  }

  handleChange(item) {
    this.setState({
      versionName: item.name,
      versionId: item.versionIdV2,
    }, () => {
      this.getUpgradeOrderPrice();
    });
  }

  handlePay() {
    this.setState({ isPay: true });
    const { versionId, needSalesAssistance } = this.state;
    orderController
      .addUpgradeVersionOrder({
        projectId: Config.projectId,
        versionId,
        needSalesAssistance,
      })
      .then(data => {
        if (data) {
          alert(_l('订单已创建成功，正在转到付款页...'), 1, 2000, function() {
            window.location.href = '/admin/waitingPay/' + Config.projectId + '/' + data.orderId;
          });
        } else {
          this.setState({ isPay: false });
          alert(_l('操作失败'), 2);
        }
      });
  }

  render() {
    const {
      step,
      totalPrice,
      versionName,
      versionData,
      versionPrice,
      needSalesAssistance,
      isPay,
      versionId,
      allowUpgradeVersion,
      loading,
    } = this.state;
    const limitNumber = versionData.unLimited ? _l('不限人数') : _l('%0 人', versionData.projectUserLimitNumber);
    const versions = versionData.versions || [];
    if (loading) {
      return <LoadDiv />;
    }
    if (allowUpgradeVersion) {
      return (
        <div className="warpCenter upgradeServiceContent">
          <div className="valueAddServerHeader">
            <Icon icon="backspace" className="Hand mRight18 TxtMiddle Font24" onClick={() => this.handleBack()}></Icon>
            <span className="Font17 Bold">{_l('升级版本')}</span>
          </div>
          <div className="warpOneStep">
            <div className={cx('stepTitle', { color_bd: step !== 1 })}>
              <div className="stepNum">
                <span className="Bold Font12">1</span>
              </div>
              <span>{_l('选择版本')}</span>
            </div>
            <div className="stepContent">
              {step === 1 ? (
                <div className="infoEdit">
                  <ul className="viewRow productList">
                    {versions.length &&
                      versions.map(item => {
                        return (
                          <li
                            key={item.versionIdV2}
                            onClick={() => this.handleChange(item)}
                            className={cx(versionId === item.versionIdV2 ? 'selectProduct' : '')}
                          >
                            <span className="color_b Font15 Bold">{item.name}</span>
                            <span className="color_9e mTop12">
                              {_l('%0 rmb / 人 / 年', versionPrice[parseInt(item.versionIdV2)])}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                  <div>
                    <div className="oneStepLeft">{_l('购买人数:')}</div>
                    <span className="color_b">{limitNumber}</span>
                  </div>
                  <div className="mTop8 mBottom8">
                    <div className="oneStepLeft">{_l('到期时间：')}</div>
                    <span className="color_b">
                      {moment(versionData.currentLicenseEndDate).format('YYYY年MM月DD日')}
                    </span>
                  </div>
                  <div>
                    <div className="oneStepLeft">{_l('总计金额：')}</div>
                    <span className="Font20 color_b">￥</span>
                    <span className="Font20 color_b Bold">{totalPrice}</span>
                  </div>
                  <div className="pTop30">
                    <button
                      type="button"
                      className="ming Button Button--primary nextBtn"
                      onClick={() => this.setStep(2)}
                    >
                      {_l('下一步')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="infoShow">
                  <div className="infoShowRow mTop24">
                    <div className="infoShowLabel">{_l('已选择')}</div>
                    <div className="infoShowResult">{versionName}</div>
                  </div>
                  <div className="infoShowRow">
                    <div className="infoShowLabel">{_l('购买人数:')}</div>
                    <div className="infoShowResult">{limitNumber}</div>
                  </div>
                  <div className="infoShowRow">
                    <div className="infoShowLabel">{_l('到期时间:')}</div>
                    <div className="infoShowResult">
                      {moment(versionData.currentLicenseEndDate).format('YYYY年MM月DD日')}
                    </div>
                  </div>
                  <div className="infoShowRow">
                    <span className="infoShowLabel">{_l('总计金额：')}</span>
                    <span className="infoShowResult Font20">￥{totalPrice}</span>
                  </div>
                  <button
                    type="button"
                    className="ming Button Button--link ThemeColor3 pAll0 mTop24"
                    onClick={() => this.setStep(1)}
                  >
                    {_l('修改')}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="stepDiviceLine"></div>
          <div className="warpTowStep">
            <div className={cx('stepTitle', { color_bd: step !== 2 })}>
              <div className="stepNum">
                <span className="Bold Font12">2</span>
              </div>
              <span>{_l('生成订单')}</span>
            </div>
            <div className={cx('stepContent', { Hidden: step !== 2 })}>
              <div className="mTop25">
                <span className="Font13 mRight24 Gray_9">{_l('已选择')}</span>
                <span className="color_b">{versionName}</span>
              </div>
              <div className="mTop15">
                <span className="mRight8 Gray_9">{_l('总计金额')}</span>
                <span className="Font24 Bold color_b">￥{totalPrice}</span>
              </div>
              <div className="pTop40">
                <button
                  type="button"
                  disabled={isPay}
                  className="ming Button Button--primary nextBtn"
                  onClick={() => this.handlePay()}
                >
                  {_l('确认下单')}
                </button>
              </div>
              <div className="warpNeedHelp">
                <Checkbox onChange={this.handleCheckBox.bind(this)} checked={needSalesAssistance}>
                  {_l('我希望得到销售代表的协助')}
                </Checkbox>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
