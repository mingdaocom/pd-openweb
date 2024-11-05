import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Checkbox } from 'antd';
import Config from '../../../config';
import { Icon, Switch, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import './style.less';
import orderController from 'src/api/order';
import projectSetting from 'src/api/projectSetting';
import PortalProgress from './PortalProgress';
import projectAjax from 'src/api/project';
import _ from 'lodash';
import moment from 'moment';

//操作类型
const EXPAND_TYPE = {
  USER: 'user',
  WORKFLOW: 'workflow',
  STORAGE: 'storage',
  PORTALUSER: 'portalexpand',
  PORTALUPGRADE: 'portalupgrade',
  DATASYNC: 'dataSync',
  COMPUTING: 'computing',
  RENEWCOMPUTING: 'renewcomputing',
  AGGREGATIONTABLE: 'aggregationtable',
};

const PAGE_TITLE = {
  user: _l('用户自助购买用户包'),
  workflow: _l('用户自助购买工作流'),
  storage: _l('用户自助购买应用附件上传量'),
  portalexpand: _l('用户自助购买外部门户用户包'),
  portalupgrade: _l('用户自助购买外部门户用户包'),
  dataSync: _l('用户自助购买数据同步算力升级包'),
  computing: md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? _l('创建专属算力') : _l('购买专属算力'),
  renewcomputing: _l('续费专属算力'),
  aggregationtable: _l('扩充聚合表数量'),
};

//主操作标题名称
const HeaderTitle = {
  user: _l('扩充成员数量'),
  workflow: _l('购买工作流执行数升级包'),
  storage: _l('购买应用附件上传量扩充包'),
  portalexpand: _l('购买外部用户人数'),
  portalupgrade: _l('购买外部用户人数'),
  dataSync: _l('购买数据同步算力升级包'),
  computing: md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? _l('创建专属算力') : _l('购买专属算力'),
  renewcomputing: _l('续费专属算力'),
  aggregationtable: _l('扩充聚合表数量'),
};

//第一步标题名称
const HeaderSubTitle = {
  user: _l('扩充成员数量'),
  workflow: _l('选择升级包'),
  storage: _l('选择类型'),
  portalexpand: _l('选择增补人数'),
  portalupgrade: _l('选择购买人数和方式'),
  dataSync: _l('选择类型'),
  computing: _l('选择规格'),
  renewcomputing: _l('确认续费信息'),
  aggregationtable: _l('扩充聚合表数量'),
};

//总计接口
const GET_ORDER_PRICE = {
  user: orderController.getPersonOrderPrice,
  workflow: orderController.getWorkflowOrderPrice,
  dataSync: orderController.getDataPipelineOrderPrice,
  workflowMonthly: orderController.getMonthlyWorkflowOrderPrice,
  storage: orderController.getApkStorageOrderPrice,
  portalexpand: orderController.getExternalUserOrderPrice,
  portalupgrade: orderController.getExternalUserExtensionOrderPrice,
  dataSyncMonthly: orderController.getMonthlyDataPipelineOrderPrice,
  computing: orderController.getComputingInstanceOrderPrice,
  computingMonthly: orderController.getMonthlyComputingInstanceOrderPrice,
  renewcomputing: orderController.getComputingInstanceExtensionOrderPrice,
  aggregationtable: orderController.getAggregationTableOrderPrice,
};

//下单接口
const ADD_ORDER_PRICE = {
  user: orderController.addPersonOrder,
  workflow: orderController.addWorkflowOrder,
  dataSync: orderController.addDataPipelineOrder,
  workflowMonthly: orderController.addMonthlyWorkflowOrder,
  storage: orderController.addApkStorageOrder,
  portalexpand: orderController.addExternalUserOrder,
  portalupgrade: orderController.addExternalUserExtensionOrder,
  dataSyncMonthly: orderController.addMonthlyDataPipelineOrder,
  computing: orderController.addComputingInstanceOrder,
  computingMonthly: orderController.addMonthlyComputingInstanceOrder,
  renewcomputing: orderController.addComputingInstanceExtensionOrder,
  aggregationtable: orderController.addAggregationTableOrder,
  computingPermanent: orderController.addPermanentComputingInstanceOrder,
};

const WORKFLOW_TYPE_LIST = [
  { title: _l('每月额度升级包'), money: 50, count: 1, month: _l('剩余月份'), key: 1 },
  { title: _l('单月包'), money: 10, count: 1, month: _l('本月'), key: 2 },
];
const DATASYNC_TYPE_LIST = [
  { title: _l('每月额度升级包'), money: 50, count: 10, month: _l('剩余月份'), key: 1 },
  { title: _l('单月包'), money: 10, count: 1, month: _l('本月'), key: 2 },
];
const EXCLUSIVE_TYPE_LIST =
  md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal
    ? [{ title: _l('组织到期时间'), key: 1 }]
    : [
        { title: _l('组织到期时间'), key: 1 },
        { title: _l('单月包（本月）'), key: 0 },
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
    this.expandType = Config.params[3];
    this.isPortalUser = _.includes([EXPAND_TYPE.PORTALUSER, EXPAND_TYPE.PORTALUPGRADE], this.expandType);
    this.state = {
      step: 1,
      addUserCount: 5, // 输入增加的人数
      addUserStep: 5,
      maxUserCount: 500,
      limitNumber: 0,
      totalPrince: 0,
      needSalesAssistance: true,
      totalNum: 0,
      isPay: false,
      workflowType: 1,
      dataSyncType: 1,
      balance: 0,
      showWorkflowExtPack: false,
      autoPurchaseWorkflowExtPack: false,
      effectiveExternalUserCount: 0,
      licenseInfo: {},
      payType: this.expandType,
      loading: true,
      specsList: [],
      exclusiveInfo: {
        specs: '1', // 规格
        type: 1, // 时长
        currentLicense: {},
      },
      renewexclusiveInfo: {
        name: '',
        resourceId: '', // 资源id
        orderId: '', //订单id
        productId: '', //规格id
        concurrency: '',
        core: '',
        memory: '',
        currentLicense: {},
      },
    };
  }

  //获取余额
  componentDidMount() {
    const licenseType = _.get(Config.project || {}, 'licenseType');
    const expandType = this.expandType;
    if (expandType === EXPAND_TYPE.WORKFLOW) {
      projectSetting.getAutoPurchaseWorkflowExtPack({ projectId: Config.projectId }).then(res => {
        this.setState(
          {
            addUserCount: 10000,
            addUserStep: 10000,
            maxUserCount: 5000000,
            balance: res.balance,
            showWorkflowExtPack:
              !_.includes([0, 2], licenseType) && !res.autoPurchaseWorkflowExtPack && !md.global.Config.IsLocal,
            autoPurchaseWorkflowExtPack: res.autoPurchaseWorkflowExtPack,
            loading: false,
          },
          () => this.computePrince(),
        );
      });
    } else if (expandType === EXPAND_TYPE.DATASYNC) {
      projectSetting.getAutoPurchaseDataPipelineExtPack({ projectId: Config.projectId }).then(res => {
        this.setState(
          {
            addUserCount: 100000,
            addUserStep: 100000,
            maxUserCount: 5000000,
            balance: res.balance,
            showDataSyncExtPack:
              !_.includes([0, 2], licenseType) && !res.autoPurchaseDataPipelineExtPack && !md.global.Config.IsLocal,
            autoPurchaseDataPipelineExtPack: res.autoPurchaseDataPipelineExtPack,
            loading: false,
          },
          () => this.computePrince(),
        );
      });
    } else if (expandType === EXPAND_TYPE.USER) {
      Config.AdminController.expansionInfos({
        projectId: Config.projectId,
      }).then(data => {
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
            loading: false,
          },
          () => this.computePrince(),
        );
      });
    } else if (expandType === EXPAND_TYPE.COMPUTING) {
      Promise.all([
        projectAjax.getProjectLicenseSupportInfo({ projectId: Config.projectId, onlyNormal: true }),
        orderController.getProjectComputingInstances({
          projectId: Config.projectId,
        }),
      ]).then(([res, data]) => {
        this.setState(
          {
            addUserCount: 1,
            addUserStep: 1,
            maxUserCount: 1,
            loading: false,
            specsList: data,
            exclusiveInfo: {
              ...this.state.exclusiveInfo,
              specs: (data.find(l => l.isDefault) || data[0] || {}).id,
              currentLicense: {
                ...res.currentLicense,
              },
            },
          },
          () => this.computePrince(),
        );
      });
    } else if (expandType === EXPAND_TYPE.RENEWCOMPUTING) {
      Promise.all([
        projectAjax.getProjectLicenseSupportInfo({ projectId: Config.projectId, onlyNormal: true }),
        projectAjax.getComputingInstanceDetail({
          projectId: Config.projectId,
          id: Config.params[Config.params.length - 1],
        }),
      ]).then(([versionInfo, res]) => {
        this.setState(
          {
            addUserCount: 1,
            addUserStep: 1,
            maxUserCount: 1,
            loading: false,
            renewexclusiveInfo: {
              name: res.name,
              resourceId: res.resourceId, // 资源id
              orderId: res.orderId, //订单id
              productId: res.specification.id, //规格id
              concurrency: res.specification.concurrency,
              core: res.specification.core,
              memory: res.specification.memory,
              currentLicense: {
                ...versionInfo.currentLicense,
                expireDays: moment(versionInfo.currentLicense.endDate).diff(res.expirationDatetime, 'days'),
              },
            },
          },
          () => this.computePrince(),
        );
      });
    } else if (expandType === EXPAND_TYPE.AGGREGATIONTABLE) {
      this.setState({ addUserCount: 5, addUserStep: 5, maxUserCount: 1000000, loading: false }, this.computePrince);
    } else if (this.isPortalUser) {
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
    } else if (expandType === EXPAND_TYPE.AGGREGATIONTABLE) {
      this.setState({ addUserCount: 5, addUserStep: 5, loading: false });
    } else {
      this.setState(
        {
          addUserCount: 1,
          addUserStep: 1,
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
    const expandType = this.expandType;

    if (
      !GET_ORDER_PRICE[actionType] ||
      ([EXPAND_TYPE.COMPUTING, EXPAND_TYPE.RENEWCOMPUTING].includes(expandType) &&
        md.global.Config.IsLocal &&
        !md.global.Config.IsPlatformLocal)
    )
      return;
    if (this.ajax) {
      this.ajax.abort();
    }
    let param = {};

    if (expandType === EXPAND_TYPE.COMPUTING) {
      param.productId = this.state.exclusiveInfo.specs;
    } else if (expandType === EXPAND_TYPE.RENEWCOMPUTING) {
      const { orderId, productId } = this.state.renewexclusiveInfo;
      param.productId = productId;
      param.orderId = orderId;
    }

    this.ajax = GET_ORDER_PRICE[actionType]({
      projectId: Config.projectId,
      num: expandType === EXPAND_TYPE.WORKFLOW ? this.state.addUserCount / 1000 : this.state.addUserCount,
      ...param,
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
    let actionType = this.expandType;
    if (actionType === 'workflow') {
      actionType = this.state.workflowType === 1 ? 'workflow' : 'workflowMonthly';
    }
    if (actionType === 'dataSync') {
      actionType = this.state.dataSyncType === 1 ? 'dataSync' : 'dataSyncMonthly';
    }
    if (actionType === 'computing') {
      actionType = this.state.exclusiveInfo.type === 1 ? 'computing' : 'computingMonthly';
    }
    if (this.isPortalUser) {
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
    const expandType = this.expandType;
    this.setState({ isPay: true });
    const { addUserCount, needSalesAssistance, exclusiveInfo } = this.state;
    let actionType = this.getCurrentType();
    const isNotPlatformLocal =
      [EXPAND_TYPE.COMPUTING, EXPAND_TYPE.RENEWCOMPUTING].includes(expandType) &&
      md.global.Config.IsLocal &&
      !md.global.Config.IsPlatformLocal;
    let param = {};
    if (expandType === EXPAND_TYPE.COMPUTING) {
      param.productId = exclusiveInfo.specs;
    } else if (expandType === EXPAND_TYPE.RENEWCOMPUTING) {
      param.orderId = this.state.renewexclusiveInfo.orderId;
      param.id = Config.params[Config.params.length - 1];
      param.num = undefined;
      param.productId = this.state.renewexclusiveInfo.productId;
    }
    if (isNotPlatformLocal) actionType = 'computingPermanent';
    if (ADD_ORDER_PRICE[actionType]) {
      ADD_ORDER_PRICE[actionType]({
        projectId: Config.projectId,
        num: expandType === EXPAND_TYPE.WORKFLOW ? addUserCount / 1000 : addUserCount,
        needSalesAssistance,
        ...param,
      }).then(function (data) {
        if (data) {
          alert(isNotPlatformLocal ? _l('创建成功') : _l('订单已创建成功，正在转到付款页...'), 1, 500, function () {
            window.location.href = isNotPlatformLocal
              ? `/admin/computing/${Config.projectId}`
              : '/admin/waitingPay/' + Config.projectId + '/' + data.orderId;
          });
        } else {
          _this.setState({ isPay: false });
          alert(_l('操作失败'), 2);
        }
      });
    }
  }

  // input加减框
  renderPlusInput({ hasUnit = false, disabled = false, desc = '' } = {}) {
    const { addUserCount, addUserStep, maxUserCount } = this.state;
    const value = addUserCount.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    return (
      <div className="mTop40 mBottom40">
        <div className={cx('addUserBox', { disabled: disabled })}>
          <span
            className={cx('minus', { unClick: addUserCount <= addUserStep })}
            onClick={() => {
              if (disabled) return;
              this.handleMinus();
            }}
          >
            －
          </span>
          <input
            type="text"
            className="ThemeColor3 bagNum"
            value={hasUnit ? value + 'GB' : value}
            disabled={disabled}
            onChange={e => {
              if (disabled) return;
              this.handleInputChange(e);
            }}
            onBlur={e => {
              if (disabled) return;
              this.handleInputBlur(e);
            }}
            onPaste={() => {
              return false;
            }}
          />
          <span
            className={cx('plus', { unClick: addUserCount >= maxUserCount })}
            onClick={() => {
              if (disabled) return;
              this.handlePlus();
            }}
          >
            ＋
          </span>
        </div>
        {desc && <div className="Gray_75 mTop8">{desc}</div>}
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
                onClick={() =>
                  this.setState(
                    {
                      workflowType: item.key,
                      dataSyncType: item.key,
                      addUserCount: item.key === 1 ? 10000 : 1000,
                      addUserStep: item.key === 1 ? 10000 : 1000,
                    },
                    () => this.computePrince(),
                  )
                }
              >
                <div className="Font15 Gray Bold">{item.title}</div>
                <div className="Gray_9e mTop6">
                  {_l('%0 元', item.money)} / {item.key === 1 ? _l('%0 W次', item.count) : _l('%0 K次', item.count)}*
                  {item.month}
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

  renderDataSyncContent() {
    const { dataSyncType } = this.state;
    return (
      <Fragment>
        <div className="workflowTypeContent">
          {DATASYNC_TYPE_LIST.map(item => {
            return (
              <div
                className={cx('workflowTypeItem', { active: dataSyncType === item.key })}
                key={item.key}
                onClick={() =>
                  this.setState(
                    {
                      dataSyncType: item.key,
                      addUserCount: item.key === 1 ? 100000 : 10000,
                      addUserStep: item.key === 1 ? 100000 : 10000,
                    },
                    () => this.computePrince(),
                  )
                }
              >
                <div className="Font15 Gray Bold">{item.title}</div>
                <div className="Gray_9e mTop6">
                  {_l('%0 元', item.money)} / {_l('%0 W行', item.count)}*{item.month}
                </div>
              </div>
            );
          })}
        </div>
        <div className="addWorkFlowBox">
          <div className="addUserLabl">
            {dataSyncType === 1 ? _l('每月同步任务算力行数增加数量') : _l('本月同步任务算力行数增加数量')}
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
            <div className="Gray_9e mTop6">{_l('20 元')} / 1 GB</div>
          </div>
        </div>
        <div className="addWorkFlowBox">
          <div className="addUserLabl">{_l('购买数量')}</div>
          {this.renderPlusInput({ hasUnit: true })}
          <div className="mLeft15 Gray_75">{_l('仅本年内使用有效，次年1月1日清零')}</div>
        </div>
      </Fragment>
    );
  }

  //step1说明文案
  renderSubTitleSummary() {
    const { maxUserCount } = this.state;
    const expandType = this.expandType;
    switch (expandType) {
      case EXPAND_TYPE.USER:
        return (
          <span>
            {_l('单个增量用户包5人起购，最多只能扩充 %0 人，如有特别需求，请联系我们 400-665-6655', maxUserCount)}
          </span>
        );
      case EXPAND_TYPE.WORKFLOW:
        return _l('每月执行数免费额度不足时可购买使用，即时生效。');
      case EXPAND_TYPE.DATASYNC:
        return _l('每月同步任务数的算力不足时，可购买使用，立即生效。');
      case EXPAND_TYPE.AGGREGATIONTABLE:
        return _l('聚合表扩充5个起购');
      case EXPAND_TYPE.STORAGE:
      case EXPAND_TYPE.PORTALUSER:
      case EXPAND_TYPE.PORTALUPGRADE:
        return '';
    }
  }

  // 购买专属算力
  renderExclusiveContent() {
    const { exclusiveInfo, specsList } = this.state;
    const monthEndDate = moment(new Date()).endOf('month');
    return (
      <Fragment>
        <div className="exclusiveSpecsWrap mTop25">
          {specsList.map(item => (
            <div
              className={cx('exclusiveSpecsCard', { active: exclusiveInfo.specs === item.id })}
              key={`exclusiveSpecsCard-${item.id}`}
              onClick={() => {
                this.setState(
                  {
                    exclusiveInfo: {
                      ...exclusiveInfo,
                      specs: item.id,
                    },
                  },
                  () => this.computePrince(),
                );
              }}
            >
              <div className="Font15 Gray Bold">
                {_.get(md, 'global.Config.IsLocal') ? _l('%0并发数', item.partion) : item.name}
              </div>
              <div className="Gray_9e mTop6">
                {`${_l('%0核', item.cpu)}（vCPU）`} | {`${item.memory / 1024}GiB`}
              </div>
            </div>
          ))}
        </div>
        <div className="mTop13 Gray_9e Font13">{_l('并发数是指同一个时间点可同时运行的实例数')}</div>
        <div className="mTop40 Font13">
          <div className="Gray_75 mRight24 mBottom16">
            {md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? _l('有效时长') : _l('购买时长')}
          </div>
          <div className="flexRow">
            {EXCLUSIVE_TYPE_LIST.map(item => (
              <div
                className={cx('exclusiveTypeCard flexColumn justifyContentCenter', {
                  active: item.key === exclusiveInfo.type,
                })}
                key={`exclusiveTypeCard-${item.key}`}
                onClick={() => {
                  this.setState(
                    {
                      exclusiveInfo: {
                        ...exclusiveInfo,
                        type: item.key,
                      },
                    },
                    () => this.computePrince(),
                  );
                }}
              >
                <div className="Font15 bold Gray">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="addWorkFlowBox">
          <div className="addUserLabl">
            {md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? _l('创建数量') : _l('购买数量')}
          </div>
          {this.renderPlusInput(false, true)}
          <div className="mLeft16">{_l('个实例数')}</div>
        </div>
        {exclusiveInfo.currentLicense.endDate && !(md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal) && (
          <div className="Font13 mBottom40">
            <span className="Gray_75 mRight24">{_l('到期时间')}</span>
            <span className="Gray">
              {exclusiveInfo.type === 0
                ? monthEndDate.format('YYYY年MM月DD日')
                : moment(exclusiveInfo.currentLicense.endDate).format('YYYY年MM月DD日')}
            </span>
            <span className="" style={{ color: '#b4b4b4' }}>{`（${_l('计费')}：${
              exclusiveInfo.type === 0
                ? moment(monthEndDate).diff(new Date(), 'days') + 1
                : exclusiveInfo.currentLicense.expireDays
            }${_l('天')}）`}</span>
          </div>
        )}
      </Fragment>
    );
  }

  renderRenewExclusiveContent() {
    const { renewexclusiveInfo } = this.state;
    const { concurrency, core, memory, name, resourceId } = renewexclusiveInfo;

    return (
      <Fragment>
        <div className="Font17 bold mTop25">{name}</div>
        <div className="renewExclusiveInfo">
          <span className="label">{_l('规格')}</span>
          <span className="value">{`${concurrency}${_l('并发数')} | ${_l('%0核', core)}（vCPU） ｜ ${
            memory / 1024
          }GiB`}</span>
        </div>
        <div className="renewExclusiveInfo">
          <span className="label">{_l('资源ID')}</span>
          <span className="value">{resourceId}</span>
        </div>
        <div className="mTop40 Gray_75 mBottom16">{_l('购买时长')}</div>
        <div className="renewExclusiveCard">
          <div className="Font15 bold">{_l('组织到期时间')}</div>
        </div>
        <div className="mTop40 mBottom40">
          <span className="Gray_75 mRight24">{_l('到期时间')}</span>
          {moment(renewexclusiveInfo.currentLicense.endDate).format('YYYY年MM月DD日')}
          <span className="Gray_b4">
            {`（${_l('计费')}：${renewexclusiveInfo.currentLicense.expireDays}${_l('天')}）`}
          </span>
        </div>
      </Fragment>
    );
  }

  //类型选择操作
  renderOptionStyle() {
    switch (this.expandType) {
      case EXPAND_TYPE.USER:
        return this.renderPlusInput({ desc: _l('300 元/人/年（版本剩余时间）') });
      case EXPAND_TYPE.WORKFLOW:
        return this.renderWorkFlowContent();
      case EXPAND_TYPE.DATASYNC:
        return this.renderDataSyncContent();
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
      case EXPAND_TYPE.COMPUTING:
        return this.renderExclusiveContent();
      case EXPAND_TYPE.RENEWCOMPUTING:
        return this.renderRenewExclusiveContent();
      case EXPAND_TYPE.AGGREGATIONTABLE:
        return this.renderPlusInput({ desc: _l('100元/个/年（版本剩余时间）') });
    }
  }

  // 第一步禁用时文案异化
  renderInfoShow() {
    const { addUserCount, totalNum, workflowType, dataSyncType, exclusiveInfo, specsList, renewexclusiveInfo } =
      this.state;
    const expandType = this.expandType;
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
      case EXPAND_TYPE.DATASYNC:
        return (
          <Fragment>
            <span className="mRight8">{_l('已选择')}</span>
            {expandType === EXPAND_TYPE.STORAGE ? (
              <span>{_l('扩展包')}</span>
            ) : (
              <span>
                {expandType === 'dataSync'
                  ? dataSyncType === 1
                    ? _l('每月额度升级包')
                    : _l('本月额度升级包')
                  : workflowType === 1
                  ? _l('每月额度升级包')
                  : _l('本月额度升级包')}
              </span>
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
      case EXPAND_TYPE.COMPUTING:
        const data = specsList.find(l => l.id === exclusiveInfo.specs);
        const monthEndDate = moment(new Date()).endOf('month');
        return (
          <Fragment>
            <div className="mBottom16">
              <span className="mRight40">{_l('规格')}</span>
              <span>
                {name} {`${_l('%0核', data.cpu)}（vCPU） | ${data.memory / 1024}GiB`}
              </span>
            </div>
            <div className="mBottom16">
              <span className="mRight40">{_l('时长')}</span>
              <span>{EXCLUSIVE_TYPE_LIST.find(l => l.key === exclusiveInfo.type).title}</span>
            </div>
            <div className="mBottom16">
              <span className="mRight40">{_l('数量')}</span>
              <span>1</span>
            </div>
            {exclusiveInfo.currentLicense.endDate && (
              <div className="Font13 mBottom24 Gray_9e">
                <span className="mRight12">{_l('到期时间')}</span>
                <span>
                  {exclusiveInfo.type === 0
                    ? monthEndDate.format('YYYY年MM月DD日')
                    : moment(exclusiveInfo.currentLicense.endDate).format('YYYY年MM月DD日')}
                </span>
                <span>{`（${_l('计费')}：${
                  exclusiveInfo.type === 0
                    ? moment(monthEndDate).diff(new Date(), 'days') + 1
                    : exclusiveInfo.currentLicense.expireDays
                }${_l('天')}）`}</span>
              </div>
            )}
          </Fragment>
        );
      case EXPAND_TYPE.RENEWCOMPUTING:
        return (
          <Fragment>
            <div className="mBottom16">
              <span className="mRight40">{_l('规格')}</span>
              <span>
                {`${_l('%0并发数', renewexclusiveInfo.concurrency)} ${_l('%0核', renewexclusiveInfo.core)}（vCPU） | ${
                  renewexclusiveInfo.memory / 1024
                }GiB`}
              </span>
            </div>
            <div className="mBottom16">
              <span className="mRight40">{_l('时长')}</span>
              <span>{EXCLUSIVE_TYPE_LIST.find(l => l.key === 1).title}</span>
            </div>
            <div className="mBottom16">
              <span className="mRight40">{_l('数量')}</span>
              <span>1</span>
            </div>
            {exclusiveInfo.currentLicense.endDate && (
              <div className="Font13 mBottom24 Gray_9e">
                <span className="mRight12">{_l('到期时间')}</span>
                <span>{moment(renewexclusiveInfo.currentLicense.endDate).format('YYYY年MM月DD日')}</span>
                <span>{`（${_l('计费')}：${renewexclusiveInfo.currentLicense.expireDays}${_l('天')}）`}</span>
              </div>
            )}
          </Fragment>
        );
      case EXPAND_TYPE.AGGREGATIONTABLE:
        return (
          <div className="flexRow">
            <div className="mRight24">{_l('购买数量')}</div>
            <div className="flex">{_l('%0个', addUserCount)}</div>
          </div>
        );
    }
  }

  //自动订购
  renderAutoOrder() {
    const { showWorkflowExtPack } = this.state;
    return (
      <div className="flexRow pAll20 autoOrderCon mTop30">
        <span className="Bold">{_l('自动订购')}</span>
        <div className="flexColumn flex mLeft32">
          <Switch
            checked={
              showWorkflowExtPack ? this.state.autoPurchaseWorkflowExtPack : this.state.autoPurchaseDataPipelineExtPack
            }
            onClick={checked => {
              if (showWorkflowExtPack) {
                projectSetting
                  .setAutoPurchaseWorkflowExtPack({
                    projectId: Config.projectId,
                    autoPurchaseWorkflowExtPack: !checked,
                  })
                  .then(res => {
                    if (res) {
                      this.setState(
                        {
                          autoPurchaseWorkflowExtPack: !checked,
                        },
                        () => {
                          if (this.state.autoPurchaseWorkflowExtPack && this.state.balance < 100) {
                            alert('当前账户余额不足100元，该功能可能无法正常运行', 3);
                          }
                        },
                      );
                    } else {
                      alert(_l('操作失败'), 2);
                    }
                  });
                return;
              }
              projectSetting
                .setAutoPurchaseDataPipelineExtPack({
                  projectId: Config.projectId,
                  autoPurchaseDataPipelineExtPack: !checked,
                })
                .then(res => {
                  if (res) {
                    this.setState(
                      {
                        autoPurchaseDataPipelineExtPack: !checked,
                      },
                      () => {
                        if (this.state.autoPurchaseDataPipelineExtPack && this.state.balance < 100) {
                          alert('当前账户余额不足100元，该功能可能无法正常运行', 3);
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
            {showWorkflowExtPack
              ? _l(
                  '开启后，当月剩余执行额度为2%时，自动购买100元/1万次的单月包，从账户余额中扣款（开启后仍可以在组织管理后台的工作流处关闭）',
                )
              : _l(
                  '开启后，当月剩余执行额度为2%时，自动购买 100元/10万行 的单月包，从账户余额中扣款。（开启后可以在数据集成的同步任务中关闭）',
                )}
          </span>
        </div>
      </div>
    );
  }

  renderSelectText() {
    const { dataSyncType, workflowType, exclusiveInfo } = this.state;
    switch (this.expandType) {
      case EXPAND_TYPE.DATASYNC:
        return dataSyncType === 1 ? _l('每月额度升级包') : _l('本月额度升级包');
      case EXPAND_TYPE.WORKFLOW:
        return workflowType === 1 ? _l('每月额度升级包') : _l('本月额度升级包');
      case EXPAND_TYPE.COMPUTING:
        return EXCLUSIVE_TYPE_LIST.find(l => l.key === exclusiveInfo.type).title;
      default:
        return null;
    }
  }

  render() {
    const {
      step,
      totalPrince,
      needSalesAssistance,
      isPay,
      workflowType,
      showWorkflowExtPack,
      showDataSyncExtPack,
      loading,
      dataSyncType,
    } = this.state;

    const expandType = this.expandType;

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
        <div style={{ flex: 1, overflow: 'scroll' }}>
          <div className="warpOneStep">
            <div className={cx('stepTitle', { color_bd: step !== 1 })}>
              {!(expandType === 'computing' && md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal) && (
                <div className="stepNum">
                  <span className="Bold Font12">1</span>
                </div>
              )}
              <span>{HeaderSubTitle[expandType]}</span>
            </div>
            <div className={cx('Gray_9 Font13 Normal mTop10', { Hidden: step !== 1 })}>
              {this.renderSubTitleSummary()}
            </div>
            <div className="stepContent">
              {step === 1 ? (
                <div className="infoEdit">
                  {this.renderOptionStyle()}
                  {!(expandType === 'computing' && md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal) && (
                    <div>
                      <div className="oneStepLeft">{_l('总计')}</div>
                      <span className="Font20 color_b">￥</span>
                      <span className="Font20 color_b Bold">{totalPrince}</span>
                      {![EXPAND_TYPE.COMPUTING, EXPAND_TYPE.RENEWCOMPUTING].includes(expandType) &&
                        (this.isPortalUser ? (
                          <a
                            target="blank"
                            className="mLeft20"
                            href="https://help.mingdao.com/purchase/external-user-billing"
                          >
                            {_l('计费方式')}
                          </a>
                        ) : (
                          <a target="blank" className="mLeft20" href="/price">
                            {_l('了解更多')}
                          </a>
                        ))}
                    </div>
                  )}
                  {(showWorkflowExtPack || showDataSyncExtPack) && this.renderAutoOrder()}
                  <div className="pTop30">
                    <button
                      type="button"
                      className="ming Button Button--primary nextBtn"
                      onClick={() => {
                        if (
                          !(expandType === 'computing' && md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal)
                        ) {
                          this.setStep(2);
                          return;
                        }
                        this.handlePay();
                      }}
                      disabled={isPay}
                    >
                      {expandType === 'computing' && md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal
                        ? _l('确认')
                        : _l('下一步')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="infoShow">
                  <div className="mTop25 Font13 Gray_9">{this.renderInfoShow()}</div>
                  <div className="mTop16 mBottom20 Font13 Gray_9">
                    <span
                      className={`${
                        [EXPAND_TYPE.COMPUTING, EXPAND_TYPE.RENEWCOMPUTING, EXPAND_TYPE.AGGREGATIONTABLE].includes(
                          expandType,
                        )
                          ? 'mRight40'
                          : 'mRight8'
                      }`}
                    >
                      {_l('总计')}
                    </span>
                    <span className={cx({ mLeft7: _.includes([EXPAND_TYPE.AGGREGATIONTABLE], expandType) })}>
                      ￥{totalPrince}
                    </span>
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
          {!(expandType === 'computing' && md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal) && (
            <Fragment>
              <div className="stepDiviceLine"></div>
              <div className="warpTowStep">
                <div className={cx('stepTitle', { color_bd: step !== 2 })}>
                  <div className="stepNum">
                    <span className="Bold Font12">2</span>
                  </div>
                  <span>{_l('生成订单')}</span>
                </div>
                <div className={cx('stepContent pTop30', { Hidden: step !== 2 })}>
                  {[EXPAND_TYPE.WORKFLOW, EXPAND_TYPE.DATASYNC, EXPAND_TYPE.COMPUTING].includes(expandType) ? (
                    <div className="mBottom10">
                      <span className="mRight8 Gray_9">{_l('已选择')}</span>
                      <span className="color_b">{this.renderSelectText()}</span>
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
                  {!md.global.Config.IsLocal && (
                    <div className="warpNeedHelp">
                      <Checkbox onChange={this.handleCheckBox.bind(this)} checked={needSalesAssistance}>
                        {_l('我希望得到销售代表的协助')}
                      </Checkbox>
                    </div>
                  )}
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
