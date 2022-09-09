import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Checkbox } from 'antd';
import Config from '../../config';
import { Icon, Switch, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import './style.less';
import orderController from 'src/api/order';
import projectSetting from 'src/api/projectSetting';
import PortalProgress from './PortalProgress';
import projectAjax from 'src/api/project';
import _ from 'lodash';

//操作类型
const EXPAND_TYPE = {
  USER: 'user',
  WORKFLOW: 'workflow',
  STORAGE: 'storage',
  PORTALUSER: 'portaluser',
  PORTALUPGRADE: 'portalupgrade',
};

const PAGE_TITLE = {
  user: _l('用户自助购买用户包'),
  workflow: _l('用户自助购买工作流'),
  storage: _l('用户自助购买应用附件上传量'),
  portaluser: _l('用户自助购买外部门户用户包'),
  portalupgrade: _l('用户自助购买外部门户用户包'),
};

//主操作标题名称
const HeaderTitle = {
  user: _l('扩充成员数量'),
  workflow: _l('购买工作流执行数升级包'),
  storage: _l('购买应用附件上传量扩充包'),
  portaluser: _l('购买外部用户人数'),
  portalupgrade: _l('购买外部用户人数'),
};

//第一步标题名称
const HeaderSubTitle = {
  user: _l('扩充成员数量'),
  workflow: _l('选择升级包'),
  storage: _l('选择类型'),
  portaluser: _l('选择增补人数'),
  portalupgrade: _l('选择购买人数和方式'),
};

//总计接口
const GET_ORDER_PRICE = {
  user: orderController.getPersonOrderPrice,
  workflow: orderController.getWorkflowOrderPrice,
  workflowMonthly: orderController.getMonthlyWorkflowOrderPrice,
  storage: orderController.getApkStorageOrderPrice,
  portaluser: orderController.getExternalUserOrderPrice,
  portalupgrade: orderController.getExternalUserExtensionOrderPrice,
};

//下单接口
const ADD_ORDER_PRICE = {
  user: orderController.addPersonOrder,
  workflow: orderController.addWorkflowOrder,
  workflowMonthly: orderController.addMonthlyWorkflowOrder,
  storage: orderController.addApkStorageOrder,
  portaluser: orderController.addExternalUserOrder,
  portalupgrade: orderController.addExternalUserExtensionOrder,
};

const expandType = Config.params[3];
const isPortalUser = _.includes([EXPAND_TYPE.PORTALUSER, EXPAND_TYPE.PORTALUPGRADE], expandType);

const WORKFLOW_TYPE_LIST = [
  { title: _l('每月额度升级包'), money: 50, count: 1, month: _l('剩余月份'), key: 1 },
  { title: _l('单月包'), money: 100, count: 1, month: _l('本月'), key: 2 },
];

const getFormatCount = count => {
  let formatCount = count % 100 || 100;
  if (formatCount > 0) {
    if (count < 1000) {
      formatCount = (parseInt(count / 100) + 1) * 100;
    } else if (count > 10000) {
      formatCount = (parseInt(count / 10000) + 1) * 10000;
    } else {
      formatCount = (parseInt(count / 1000) + 1) * 1000;
    }
  }
  return formatCount;
};

@withRouter
export default class ExpansionService extends Component {
  constructor() {
    super();
    this.state = {
      step: 1,
      addUserCount: 5, // 输入增加的人数
      addUserStep: 5,
      maxUserCount: 500,
      limitNumber: 0,
      counsellorName: '',
      counsellorAccountId: '',
      totalPrince: 0,
      needSalesAssistance: true,
      totalNum: 0,
      isPay: false,
      workflowType: 1,
      balance: 0,
      showWorkflowExtPack: false,
      autoPurchaseWorkflowExtPack: false,
      effectiveExternalUserCount: 0,
      licenseInfo: {},
      payType: expandType,
      loading: true,
    };
  }

  //获取余额
  componentDidMount() {
    const licenseType = _.get(Config.project || {}, 'licenseType');
    if (expandType === EXPAND_TYPE.WORKFLOW) {
      projectSetting.getAutoPurchaseWorkflowExtPack({ projectId: Config.projectId }).then(res => {
        this.setState(
          {
            addUserCount: 10000,
            addUserStep: 10000,
            maxUserCount: 1000000,
            balance: res.balance,
            showWorkflowExtPack:
              !_.includes([0, 2], licenseType) && !res.autoPurchaseWorkflowExtPack && !md.global.Config.IsLocal,
            autoPurchaseWorkflowExtPack: res.autoPurchaseWorkflowExtPack,
            loading: false,
          },
          () => this.computePrince(),
        );
      });
    } else if (expandType === EXPAND_TYPE.USER) {
      Config.AdminController.expansionInfos({
        projectId: Config.projectId,
      }).done(data => {
        const limitNumber =
          parseInt(
            expandType === EXPAND_TYPE.USER
              ? data.userLimitNumber
              : expandType === EXPAND_TYPE.APP
              ? data.apkLimitNumber
              : data.workflowLimitNumber * 1000,
            10,
          ) || 0;
        this.setState(
          {
            addUserCount: 5,
            addUserStep: 5,
            maxUserCount: 500,
            limitNumber,
            counsellorName: data.counsellorName,
            counsellorAccountId: data.counsellorAccountId,
            loading: false,
          },
          () => this.computePrince(),
        );
      });
    } else if (isPortalUser) {
      projectAjax.getProjectLicenseSupportInfo({ projectId: Config.projectId }).then(res => {
        this.setState(
          {
            addUserCount: expandType === 'portalupgrade' ? getFormatCount(res.effectiveExternalUserCount) : 100,
            maxUserCount: 100000,
            effectiveExternalUserCount: res.effectiveExternalUserCount,
            licenseInfo: res,
            loading: false,
          },
          () => this.computePrince(),
        );
      });
    } else {
      this.setState(
        {
          addUserCount: 10,
          addUserStep: 10,
          maxUserCount: 1000000,
          loading: false,
        },
        () => this.computePrince(),
      );
    }

    Config.setPageTitle(PAGE_TITLE[expandType]);
  }

  //计算金钱
  computePrince() {
    const actionType = this.getCurrentType();
    if (!GET_ORDER_PRICE[actionType]) return;
    if (this.ajax) {
      this.ajax.abort();
    }
    this.ajax = GET_ORDER_PRICE[actionType]({
      projectId: Config.projectId,
      num: expandType === EXPAND_TYPE.WORKFLOW ? this.state.addUserCount / 1000 : this.state.addUserCount,
    });
    this.ajax.then(price => {
      this.setState({
        totalPrince: price,
        totalNum: this.state.limitNumber + this.state.addUserCount,
      });
    });
  }

  //获取操作类型
  getCurrentType() {
    let actionType = expandType;
    if (actionType === 'workflow') {
      actionType = this.state.workflowType === 1 ? 'workflow' : 'workflowMonthly';
    }
    if (isPortalUser) {
      actionType = this.state.payType;
    }
    return actionType;
  }

  handleBack() {
    this.props.history.go(-1);
  }

  setStep(step) {
    this.setState({ step });
  }

  handleCheckBox(e) {
    this.setState({ needSalesAssistance: e.target.checked });
  }

  //减
  handleMinus() {
    const { addUserCount, addUserStep } = this.state;
    if (addUserCount <= addUserStep) {
      return;
    }
    this.setState(
      {
        addUserCount: addUserCount > addUserStep ? addUserCount - addUserStep : addUserCount,
      },
      () => {
        this.computePrince();
      },
    );
  }

  // 加
  handlePlus() {
    const { addUserCount, addUserStep, maxUserCount } = this.state;
    if (addUserCount >= maxUserCount) {
      return;
    }
    this.setState(
      {
        addUserCount: addUserCount < maxUserCount ? addUserCount + addUserStep : addUserCount,
      },
      () => {
        this.computePrince();
      },
    );
  }

  //输入
  handleInputChange(e) {
    const keycode = e.which;
    if (keycode == 37 || keycode == 38 || keycode == 39 || keycode == 40) {
      return false;
    }
    let num = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
    this.setState({ addUserCount: num });
  }

  // 输入框失焦
  handleInputBlur() {
    let num = Math.max(Math.min(this.state.maxUserCount, this.state.addUserCount), 5);
    if (num % this.state.addUserStep !== 0) {
      num += this.state.addUserStep - (num % this.state.addUserStep);
    }
    this.setState(
      {
        addUserCount: num,
      },
      () => {
        this.computePrince();
      },
    );
  }

  // 下单
  handlePay() {
    const _this = this;
    this.setState({ isPay: true });
    const { addUserCount, needSalesAssistance } = this.state;
    const actionType = this.getCurrentType();
    if (ADD_ORDER_PRICE[actionType]) {
      ADD_ORDER_PRICE[actionType]({
        projectId: Config.projectId,
        num: expandType === EXPAND_TYPE.WORKFLOW ? addUserCount / 1000 : addUserCount,
        needSalesAssistance,
      }).then(function (data) {
        if (data) {
          alert(_l('订单已创建成功，正在转到付款页...'), 1, 2000, function () {
            window.location.href = '/admin/waitingPay/' + Config.projectId + '/' + data.orderId;
          });
        } else {
          _this.setState({ isPay: false });
          alert(_l('操作失败'), 2);
        }
      });
    }
  }

  // input加减框
  renderPlusInput(hasUnit = false) {
    const { addUserCount, addUserStep, maxUserCount } = this.state;
    const value = addUserCount.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    return (
      <div className="addUserBox">
        <span className={cx('minus', { unClick: addUserCount <= addUserStep })} onClick={this.handleMinus.bind(this)}>
          －
        </span>
        <input
          type="text"
          className="ThemeColor3 bagNum"
          value={hasUnit ? value + 'GB' : value}
          onChange={this.handleInputChange.bind(this)}
          onBlur={this.handleInputBlur.bind(this)}
          onPaste={() => {
            return false;
          }}
        />
        <span className={cx('plus', { unClick: addUserCount >= maxUserCount })} onClick={this.handlePlus.bind(this)}>
          ＋
        </span>
      </div>
    );
  }

  //工作流新增时间类型选择
  renderWorkFlowContent() {
    const { workflowType } = this.state;
    return (
      <Fragment>
        <div className="workflowTypeContent">
          {WORKFLOW_TYPE_LIST.map(item => {
            return (
              <div
                className={cx('workflowTypeItem', { active: workflowType === item.key })}
                key={item.key}
                onClick={() => this.setState({ workflowType: item.key }, () => this.computePrince())}
              >
                <div className="Font15 Gray Bold">{item.title}</div>
                <div className="Gray_9e mTop6">
                  {_l('%0 元', item.money)} / {_l('%0 万次', item.count)}*{item.month}
                </div>
              </div>
            );
          })}
        </div>
        <div className="addWorkFlowBox">
          <div className="addUserLabl">
            {workflowType === 1 ? _l('每月工作流执行数增加数量') : _l('本月工作流执行数增加数量')}
          </div>
          {this.renderPlusInput()}
        </div>
      </Fragment>
    );
  }

  //上传量扩充包
  renderStorageContent() {
    return (
      <Fragment>
        <div className="workflowTypeContent">
          <div className="workflowTypeItem active">
            <div className="Font15 Gray Bold">{_l('本年用量扩充包')}</div>
            <div className="Gray_9e mTop6">
              {_l('200 元')} / {_l('10 GB')}
            </div>
          </div>
        </div>
        <div className="addWorkFlowBox">
          <div className="addUserLabl">{_l('购买数量')}</div>
          {this.renderPlusInput(true)}
          <div className="mLeft15 Gray_75">{_l('仅本年内使用有效，次年1月1日清零')}</div>
        </div>
      </Fragment>
    );
  }

  //step1说明文案
  renderSubTitleSummary() {
    const { maxUserCount, counsellorName, counsellorAccountId } = this.state;
    switch (expandType) {
      case EXPAND_TYPE.USER:
        return (
          <span>
            <span>{_l('单个增量用户包最多只能扩充 %0 人，如需特别定制，', maxUserCount)}</span>
            {counsellorName ? (
              <span>
                {_l('请联系部署顾问')}
                <a target="_blank" href={`/user_${counsellorAccountId}`} className="mLeft5">
                  {counsellorName}
                </a>
              </span>
            ) : (
              _l('请联系电话 400-665-6655')
            )}
          </span>
        );
      case EXPAND_TYPE.WORKFLOW:
        return _l('每月执行数免费额度不足时可购买使用，即时生效。');
      case EXPAND_TYPE.STORAGE:
      case EXPAND_TYPE.PORTALUSER:
      case EXPAND_TYPE.PORTALUPGRADE:
        return '';
    }
  }

  //类型选择操作
  renderOptionStyle() {
    switch (expandType) {
      case EXPAND_TYPE.USER:
        return this.renderPlusInput();
      case EXPAND_TYPE.WORKFLOW:
        return this.renderWorkFlowContent();
      case EXPAND_TYPE.STORAGE:
        return this.renderStorageContent();
      case EXPAND_TYPE.PORTALUSER:
      case EXPAND_TYPE.PORTALUPGRADE:
        const {
          licenseInfo: { nextLicense = {}, currentLicense = {} },
          payType,
        } = this.state;
        return (
          <PortalProgress
            {..._.pick(this.state, ['payType', 'addUserCount', 'effectiveExternalUserCount'])}
            licenseInfo={payType === 'portalupgrade' ? nextLicense : currentLicense}
            handleChange={(key, value) => {
              this.setState({ [key]: value }, () => this.computePrince());
            }}
          />
        );
    }
  }

  // 第一步禁用时文案异化
  renderInfoShow() {
    const { addUserCount, totalNum, workflowType } = this.state;
    switch (expandType) {
      case EXPAND_TYPE.USER:
        return (
          <Fragment>
            <span className="mRight8">{_l('购买人数')}</span>
            <span className="mLeft15 mRight15">{_l('%0 人', addUserCount)}</span>
            <span>{_l('（购买后人数上限增加到 %0 人）', totalNum)}</span>
          </Fragment>
        );
      case EXPAND_TYPE.WORKFLOW:
      case EXPAND_TYPE.STORAGE:
        return (
          <Fragment>
            <span className="mRight8">{_l('已选择')}</span>
            {expandType === EXPAND_TYPE.STORAGE ? (
              <span>{_l('扩展包')}</span>
            ) : (
              <span>{workflowType === 1 ? _l('每月额度升级包') : _l('本月额度升级包')}</span>
            )}
          </Fragment>
        );
      case EXPAND_TYPE.PORTALUSER:
      case EXPAND_TYPE.PORTALUPGRADE:
        return (
          <Fragment>
            <span className="mRight8">{_l('已选择')}</span>
            <span>{_l('%0人', addUserCount)}</span>
          </Fragment>
        );
    }
  }

  //自动订购
  renderAutoOrder() {
    return (
      <div className="flexRow pAll20 autoOrderCon mTop30">
        <span className="Bold">{_l('自动订购')}</span>
        <div className="flexColumn flex mLeft32">
          <Switch
            checked={this.state.autoPurchaseWorkflowExtPack}
            onClick={checked => {
              projectSetting
                .setAutoPurchaseWorkflowExtPack({ projectId: Config.projectId, autoPurchaseWorkflowExtPack: !checked })
                .then(res => {
                  if (res) {
                    this.setState(
                      {
                        autoPurchaseWorkflowExtPack: !checked,
                      },
                      () => {
                        if (this.state.autoPurchaseWorkflowExtPack && this.state.balance < 100) {
                          alert('当前账户余额不足100元，该功能可能无法正常运行');
                        }
                      },
                    );
                  } else {
                    alert(_l('操作失败'), 2);
                  }
                });
            }}
          />
          <span className="Gray_75 mTop10">
            {_l(
              '开启后，当月剩余执行额度为2%时，自动购买100元/1万次的单月包，从账户余额中扣款（开启后仍可以在组织管理后台的工作流处关闭）',
            )}
          </span>
        </div>
      </div>
    );
  }

  render() {
    const { step, totalPrince, needSalesAssistance, isPay, workflowType, showWorkflowExtPack, loading } = this.state;

    if (loading) {
      return (
        <div className="expansionService">
          <LoadDiv />
        </div>
      );
    }

    return (
      <div className="expansionService">
        <div className="valueAddServerHeader">
          <Icon icon="backspace" className="Hand mRight18 TxtMiddle Font24" onClick={() => this.handleBack()}></Icon>
          <span className="Font17 Bold">{HeaderTitle[expandType]}</span>
        </div>
        <div className="warpOneStep">
          <div className={cx('stepTitle', { color_bd: step !== 1 })}>
            <div className="stepNum">
              <span className="Bold Font12">1</span>
            </div>
            <span>{HeaderSubTitle[expandType]}</span>
          </div>
          <div className={cx('Gray_9 Font13 Normal mTop10', { Hidden: step !== 1 })}>
            {this.renderSubTitleSummary()}
          </div>
          <div className="stepContent">
            {step === 1 ? (
              <div className="infoEdit">
                {this.renderOptionStyle()}
                <div>
                  <div className="oneStepLeft">{_l('总计')}</div>
                  <span className="Font20 color_b">￥</span>
                  <span className="Font20 color_b Bold">{totalPrince}</span>
                  {isPortalUser ? (
                    <a target="blank" className="mLeft20" href="https://help.mingdao.com/Prices8.html">
                      {_l('计费方式')}
                    </a>
                  ) : (
                    <a target="blank" className="mLeft20" href="/price">
                      {_l('了解更多')}
                    </a>
                  )}
                </div>
                {showWorkflowExtPack && this.renderAutoOrder()}
                <div className="pTop30">
                  <button type="button" className="ming Button Button--primary nextBtn" onClick={() => this.setStep(2)}>
                    {_l('下一步')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="infoShow">
                <div className="mTop25 Font13 Gray_9">{this.renderInfoShow()}</div>
                <div className="mTop16 mBottom20 Font13 Gray_9">
                  <span className="mRight8">{_l('总计')}</span>
                  <span>￥{totalPrince}</span>
                </div>
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 pAll0 Hover_49"
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
          <div className={cx('stepContent pTop30', { Hidden: step !== 2 })}>
            {expandType === EXPAND_TYPE.WORKFLOW ? (
              <div className="mBottom10">
                <span className="mRight8 Gray_9">{_l('已选择')}</span>
                <span className="color_b">{workflowType === 1 ? _l('每月额度升级包') : _l('本月额度升级包')}</span>
              </div>
            ) : null}
            <div>
              <span className="Font13 mRight8 Gray_9">{_l('总计：')}</span>
              <span className="Font24 Bold color_b">￥{totalPrince}</span>
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
