import React, { Fragment } from 'react';
import ClipboardButton from 'react-clipboard.js';
import { Input, Popover, Radio, Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Checkbox, Icon, LoadDiv, MdLink, Switch } from 'ming-ui';
import Ajax from 'src/api/workWeiXin';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import CancelIntegration from '../components/CancelIntegration';
import EnableScanLogin from '../components/EnableScanLogin';
import IntegrationSetPassword from '../components/IntegrationSetPassword';
import IntegrationSync from '../components/IntegrationSync';
import { checkClearIntergrationData, integrationFailed } from '../utils';
import BuildAppNewRules from './BuildAppNewRules';
import ChartSetting from './components/ChartSetting';
import InterfaceLicense from './components/InterfaceLicense';
import workwxPng1 from './workwxSyncCourse/img/1.png';
import workwxPng2 from './workwxSyncCourse/img/2.png';
import workwxPng3 from './workwxSyncCourse/img/3.png';
import workwxPng4 from './workwxSyncCourse/img/4.png';
import './style.less';

const quickAprData = [
  { label: 'URL', key: 'url' },
  { label: 'Token', key: 'token' },
  { label: 'EncodingAESKey', key: 'encodingAESKey' },
];

const TABS = [
  { key: 'base', label: _l('企业微信集成') },
  { key: 'other', label: _l('扫码登录与同步') },
  { key: 'chatSetting', label: _l('聊天工具栏配置') },
  { key: 'interfaceLicense', label: '接口许可' },
];

export default class Workwx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      hasApply: false, //是否已提交申请/尚未提交申请false
      isPassApply: false, //是否已通过申请
      isReject: false, //是否已拒绝申请
      isHasInfo: false, //是否已填对接信息
      canEditInfo: true, //是否可编辑输入框
      isShowCorpId: false,
      isShowAgentId: false,
      isShowSecret: false,
      CorpId: null,
      AgentId: null,
      Secret: null,
      CorpIdFormat: null, //用于显示
      AgentIdFormat: null,
      SecretFormat: null,
      isCloseDing: false,
      data: null,
      show1: false,
      show2: false,
      isLoading: false,
      canSyncBtn: false,
      integrationScanEnabled: false,
      customMappingFieldEnabled: false,
      jobnumberMappingField: null,
      fieldRadio: null,
      isSetPassword: false,
      passwordError: false,
      syncWXLabel: md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? 'job' : 'organize',
      qwQuickAprData: {},
      currentTab: 'base',
    };
  }

  componentDidMount() {
    Ajax.getWXProjectSettingInfo({ projectId: this.props.projectId }).then(res => {
      this.setState({
        pageLoading: false,
      });
      if (!res) {
        res = {
          corpId: '',
          agentId: '',
          secret: '',
          status: md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal ? 1 : '',
        };
      }
      if (res) {
        this.setState({
          hasApply: !!res,
          //"status: 集成状态，主要通过该值展现：1代表申请通过并提供了使用；0代表提交了申请；-1代表拒绝申请；2代表之前集成过但关闭了集成"
          isPassApply: res.status === 2 || res.status === 1,
          isReject: res.status === -1,
          CorpId: res.corpId,
          AgentId: res.agentId,
          Secret: res.secret,
          isHasInfo: res.status === 2 || (res.corpId && res.agentId && res.secret),
          canEditInfo: !res.corpId && !res.agentId && !res.secret,
          isCloseDing: res.status === 2,
          CorpIdFormat: this.formatStr(res.corpId), //用于显示
          AgentIdFormat: this.formatStr(res.agentId),
          SecretFormat: this.formatStr(res.secret),
          show1: !(res.corpId && res.agentId && res.secret && res.status != 2),
          show2: !(res.corpId && res.agentId && res.secret && res.status != 2),
          integrationScanEnabled: res.intergrationScanEnabled,
          customNameIcon: res.customNameIcon,
          customMappingFieldEnabled: res.customMappingFieldEnabled,
          jobnumberMappingField: res.jobnumberMappingField,
          fieldRadio: res.jobnumberMappingField !== 'workxeixinapp-userid' ? 'customField' : res.jobnumberMappingField,
          status: res.status,
          intergrationType: res.intergrationType, // 1代表老的模式，2代表待开发模式
          syncWXLabel: res.wxTagMappingField ? res.wxTagMappingField : this.state.syncWXLabel,
          syncWXLabelChecked: res.wxTagMappingField ? true : false,
          qwQuickAprData: {
            url: res.workWxCallBackUrl,
            token: res.workWxToken,
            encodingAESKey: res.workWxAesKey,
          },
          openQuickApproval: !!res.workWxCallBackUrl,
        });
      }
    });
  }

  // 保存信息/编辑信息
  editInfo = () => {
    if (!this.state.AgentId || !this.state.Secret || !this.state.CorpId) {
      alert('请输入相关信息', 3);
      return;
    }
    Ajax.editWXProjectSetting({
      projectId: this.props.projectId,
      agentId: this.state.AgentId,
      secret: this.state.Secret,
      corpId: this.state.CorpId,
    }).then(res => {
      if (res.item1) {
        this.setState({
          isHasInfo: true,
          canEditInfo: false,
        });
      } else {
        alert(res.item2, 2);
      }
    });
  };

  // 获取初始密码值
  getInitialPassword = () => {
    Ajax.getIntergrationAccountInitializeInfo({
      projectId: this.props.projectId,
    }).then(res => {
      this.setState({ password: res, isSetPassword: !!res });
    });
  };

  handleSaveJobnumberMappingField = () => {
    const { fieldRadio, jobnumberMappingField } = this.state;
    const fieldName = jobnumberMappingField.trim();
    if (fieldName) {
      Ajax.editWXProjectJobnumberMappingField({
        projectId: this.props.projectId,
        fieldName,
      }).then(res => {
        if (res && fieldRadio === 'customField') {
          alert(_l('保存成功'));
        }
      });
    } else {
      alert(_l('请输入信息字段'), 2);
    }
  };

  handleChangeJobnumberMappingField = event => {
    const { jobnumberMappingField } = this.state;
    const { value } = event.target;
    const isWorkxeixinapp = value === 'workxeixinapp-userid';
    this.setState(
      {
        fieldRadio: value,
        jobnumberMappingField: isWorkxeixinapp ? value : '',
      },
      () => {
        isWorkxeixinapp && this.handleSaveJobnumberMappingField();
      },
    );
  };

  formatStr = str => {
    if (!str) return;
    let newStr;
    if (str.length === 4) {
      newStr = str.substr(0, 3) + '*';
    } else if (str.length > 4) {
      let char = '';
      for (let i = 0, len = str.length - 4; i < len; i++) {
        char += '*';
      }
      newStr = str.substr(0, 3) + char + str.substr(-3, 3);
    } else {
      newStr = str;
    }
    return newStr;
  };

  editDingStatus = num => {
    this.editWXProjectSettingStatus(num, () => {
      this.setState({
        isCloseDing: !this.state.isCloseDing,
      });
    });
  };

  inputRender = (strId, w, img1, img2) => {
    return (
      <React.Fragment>
        <div className="inputTitleBox">
          <span className="inputTitle">{`${strId}：`}</span>
          <Popover
            title={null}
            arrowPointAtCenter={true}
            placement="bottomLeft"
            overlayClassName="workwxPopoverWrapper"
            content={
              <span className="card Relative overflowHidden">
                <img
                  width={w}
                  className="mTop1"
                  src={img1 === 1 ? workwxPng1 : img1 === 2 ? workwxPng2 : workwxPng3}
                  alt={_l('点击“自建应用”进入新建应用页面')}
                />
                {img2 ? (
                  <img width={w} className="mTop1 Block" src={workwxPng4} alt={_l('点击“自建应用”进入新建应用页面')} />
                ) : null}
              </span>
            }
          >
            <Icon icon="sidebar_help" className="Font18 Gray_9e" />
          </Popover>
        </div>
        <div className="Relative InlineBlock inputDiv clearfix">
          {this.state.canEditInfo && this.state.intergrationType !== 2 ? (
            <React.Fragment>
              <input
                type="text"
                className="inputBox"
                onChange={e => {
                  this.setState({
                    [strId]: e.target.value,
                    [`${strId}Format`]: this.formatStr(e.target.value),
                  });
                }}
                value={this.state[strId]}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <input
                type="text"
                className="inputBox"
                readOnly
                value={!this.state[`isShow${strId}`] ? this.state[`${strId}Format`] : this.state[strId]}
              />
              <Icon
                icon={!this.state[`isShow${strId}`] ? 'public-folder-hidden' : 'circulated'}
                className="Gray_9e Font18 isShowIcon"
                onClick={() => {
                  this.setState({
                    [`isShow${strId}`]: !this.state[`isShow${strId}`],
                  });
                }}
              />
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  };

  stepRender = () => {
    let { intergrationType, show2, isHasInfo, isCloseDing, canEditInfo } = this.state;
    const { projectId, featureType, featureId } = this.props;

    return (
      <div className="pBottom100">
        {intergrationType !== 2 && (
          <div className="stepItem Relative">
            <h3 className="stepTitle Font16 Gray">{_l('1.获取对接信息')}</h3>
            {!this.state.show1 ? (
              <div
                className="showDiv flexRow valignWrapper"
                onClick={() => {
                  this.setState({
                    show1: true,
                  });
                }}
              >
                <Icon icon="sidebar-more" className="Font13 Gray_75 Right Hand" />
              </div>
            ) : (
              <React.Fragment>
                <p className="mTop16 Font14 Gray_75">{_l('从企业微信后台获取对接信息，即可开始集成以及同步通讯录')}</p>
                <MdLink to={`/wxappSyncCourse/${projectId}`} target="_blank" className="mTop16 Font14 howApply">
                  {_l('如何获取对接信息？')}
                </MdLink>
              </React.Fragment>
            )}
          </div>
        )}
        <div className="stepItem Relative">
          <h3 className="stepTitle Font16 Gray">{intergrationType === 2 ? _l('1.对接信息') : _l('2.对接信息录入')}</h3>
          {!show2 && intergrationType !== 2 && (
            <div
              className="showDiv flexRow valignWrapper"
              onClick={() => {
                this.setState({
                  show2: true,
                });
              }}
            >
              <Icon icon="sidebar-more" className="Font13 Gray_75 Right Hand" />
            </div>
          )}
          {((isHasInfo && show2) || intergrationType === 2) && (
            <span className="Font13 Gray_75 Right closeDing">
              <span
                className="mLeft10 switchBtn tip-bottom-left"
                data-tip={_l('关闭企业微信集成后，无法再从企业微信处进入应用')}
              >
                <Switch
                  checked={!isCloseDing}
                  onClick={checked => {
                    this.editDingStatus(checked ? 2 : 1);
                  }}
                />
              </span>
            </span>
          )}
          {((!isCloseDing && show2) || intergrationType === 2) && (
            <React.Fragment>
              {intergrationType !== 2 && (
                <p className="mTop16 Font14 Gray_75">
                  {_l('完成步骤 1 后，填入CorpId、AgentId、Secret后可对接应用与同步通讯录')}
                </p>
              )}
              <div className="mTop25 infoList">
                <ul>
                  <li>{this.inputRender('CorpId', 600, 1)}</li>
                  <li className="mTop16">{this.inputRender('AgentId', 600, 2)}</li>
                  <li className="mTop16">{this.inputRender('Secret', 600, 3, 4)}</li>
                </ul>
              </div>
              {intergrationType !== 2 && (
                <div className="TxtRight mTop30">
                  {!canEditInfo ? (
                    <Button type="primary" className="editInfo" onClick={e => this.setState({ canEditInfo: true })}>
                      {_l('编辑')}
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      className="saveInfo"
                      onClick={() => {
                        checkClearIntergrationData({ projectId, onSave: this.editInfo });
                      }}
                    >
                      {_l('保存')}
                    </Button>
                  )}
                </div>
              )}
            </React.Fragment>
          )}
        </div>
        <IntegrationSync
          integrationType={3}
          step={intergrationType !== 2 ? '3.' : '2.'}
          syncDisabled={(canEditInfo && !isHasInfo) || isCloseDing}
          projectId={projectId}
          featureType={featureType}
          featureId={featureId}
        />
      </div>
    );
  };

  editWXProjectSettingStatus = (tag, callback) => {
    // 状态：0 提交申请；2关闭集成；1重新开启集成 tag
    Ajax.editWXProjectSettingStatus({
      projectId: this.props.projectId,
      status: tag,
    }).then(res => {
      if (res) {
        callback();
        this.setState({ status: tag });
      } else {
        integrationFailed(this.props.projectId);
      }
    });
  };
  changeTab = key => {
    this.setState({ currentTab: key });
    if (key === 'other') {
      this.getInitialPassword();
    }
  };
  handleChangeCustomMappingFieldEnabled = checked => {
    Ajax.editWXProjectMappingFieldEnabled({
      projectId: this.props.projectId,
      status: checked ? 0 : 1,
    }).then(res => {
      if (res) {
        this.setState({
          customMappingFieldEnabled: !checked,
        });
      }
    });
  };
  changeSyncWXLabel = value => {
    Ajax.editWXProjectTagMappingField({
      projectId: this.props.projectId,
      fieldName: value,
    }).then(res => {
      if (res) {
        this.setState({ syncWXLabel: value });
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };
  syncWXLabel = checked => {
    Ajax.editWXProjectTagMappingField({
      projectId: this.props.projectId,
      fieldName: checked ? '' : this.state.syncWXLabel,
    }).then(res => {
      if (res) {
        this.setState({ syncWXLabelChecked: !checked });
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };
  handleChangeOpenQuickApproval = checked => {
    const { qwQuickAprData = {} } = this.state;
    Ajax.editWXIsEnableQuickApprove({
      projectId: this.props.projectId,
      status: checked ? 2 : 1,
    }).then(res => {
      if (res) {
        this.setState({
          openQuickApproval: !checked,
        });
        if (!checked || _.isEmpty(qwQuickAprData)) {
          Ajax.getWXProjectSettingInfo({ projectId: this.props.projectId }).then(res => {
            this.setState({
              qwQuickAprData: {
                url: res.workWxCallBackUrl,
                token: res.workWxToken,
                encodingAESKey: res.workWxAesKey,
              },
            });
          });
        }
      } else {
        alert(_l('操作失败'), 2);
      }
    });
  };
  handleCopyTextSuccess = () => {
    return alert(_l('复制成功'));
  };

  renderTabContent = () => {
    const { projectId } = this.props;
    const {
      currentTab,
      CorpId,
      status,
      isPassApply,
      intergrationType,
      syncWXLabel,
      integrationScanEnabled,
      canEditInfo,
      isHasInfo,
      isCloseDing,
      customNameIcon = {},
    } = this.state;

    if (currentTab === 'base') {
      return (
        <Fragment>
          {!CorpId && (!md.global.Config.IsLocal || md.global.Config.IsPlatformLocal) && (status === 0 || !status) ? (
            <BuildAppNewRules
              projectId={projectId}
              editWXProjectSettingStatus={this.editWXProjectSettingStatus}
              isPassApply={isPassApply}
              stepRender={this.stepRender}
              status={status}
            />
          ) : (
            this.stepRender()
          )}
        </Fragment>
      );
    } else if (currentTab === 'other') {
      return (
        <Fragment>
          <div className="stepItem flexRow valignWrapper">
            <div className="flex">
              <EnableScanLogin
                integrationType={3}
                projectId={projectId}
                scanEnabled={integrationScanEnabled}
                disabled={(canEditInfo && !isHasInfo) || isCloseDing}
                customDoc={intergrationType === 2}
                href={
                  intergrationType !== 2
                    ? `/wxappSyncCourse/${projectId}#scanWorkwx`
                    : 'https://help.mingdao.com/wecom/ways-login-HAP#scan-code-login'
                }
                updateScanEnabled={integrationScanEnabled => this.setState({ integrationScanEnabled })}
                customNameIcon={customNameIcon}
                updateCustomNameIcon={customNameIcon => this.setState({ customNameIcon })}
              />
              {md.global.Config.IsLocal && (
                <IntegrationSetPassword
                  password={this.state.password}
                  isSetPassword={this.state.isSetPassword}
                  disabled={(canEditInfo && !isHasInfo) || isCloseDing}
                />
              )}
              <div className="stepItem flexRow valignWrapper">
                <div className="flexColumn flex">
                  <h3 className="stepTitle Font16 Gray">{_l('企业微信字段同步')}</h3>
                  <div className="mTop16 syncBox mBottom24">
                    <span className="Font14 Gray_75">
                      {_l(
                        '完成通讯录同步的基础配置后，可将企业微信用户账号或者企业微信自定义信息字段同步到系统的工号字段',
                      )}
                    </span>
                  </div>
                  <div className="flexRow alignItemsCenter mBottom16 syncRow height32">
                    <Checkbox checked={this.state.syncWXLabelChecked} onClick={this.syncWXLabel}>
                      {_l('同步企业微信标签')}
                    </Checkbox>
                    {this.state.syncWXLabelChecked && (
                      <span className="mLeft110">
                        {_l('同步到')}
                        <Select
                          style={{ width: 180, margin: '0 10px' }}
                          value={syncWXLabel}
                          onChange={this.changeSyncWXLabel}
                        >
                          <Option value={'organize'}>{_l('组织角色')}</Option>
                          <Option value={'job'}>{_l('职位')}</Option>
                        </Select>
                        {_l('字段')}
                      </span>
                    )}
                  </div>
                  <div className="syncRow mBottom8">
                    <Checkbox
                      checked={this.state.customMappingFieldEnabled}
                      onClick={this.handleChangeCustomMappingFieldEnabled}
                    >
                      {_l('同步企业微信用户账号 或 自定义信息字段 到工号字段')}
                    </Checkbox>
                  </div>
                  <div className="Gray_9e mLeft32">
                    {_l('企业微信用户账号和企业微信自定义字段只可选择一个同步到工号字段')}
                  </div>
                  {this.state.customMappingFieldEnabled && (
                    <div className="mLeft32">
                      <div className="flexRow">
                        <Radio.Group
                          className="radioGroupWrapper"
                          onChange={this.handleChangeJobnumberMappingField}
                          value={this.state.fieldRadio}
                        >
                          <Radio className="Block" value="workxeixinapp-userid">
                            <span className="width225"> {_l('企业微信用户账号')}</span>
                          </Radio>
                          <Radio className="Block" value="customField">
                            <span className="width225">{_l('企业微信自定义信息字段')}</span>
                          </Radio>
                        </Radio.Group>
                        <div className="pTop15">
                          <div>
                            <span>{_l('同步到工号字段')}</span>
                          </div>
                          <div>
                            <span>{_l('同步到工号字段')}</span>
                            <MdLink
                              to={`/wxappSyncCourse/${projectId}#syncField`}
                              target="_blank"
                              className="mTop16 Font14 howApply mLeft10"
                            >
                              {_l('如何同步？')}
                            </MdLink>
                          </div>
                        </div>
                      </div>
                      {this.state.fieldRadio == 'customField' && (
                        <div className="flexRow customFieldWrapper mTop12 mLeft25">
                          <Input
                            className="mRight12"
                            value={this.state.jobnumberMappingField}
                            onChange={event => {
                              this.setState({
                                jobnumberMappingField: event.target.value,
                              });
                            }}
                          />
                          <Button type="primary" onClick={this.handleSaveJobnumberMappingField}>
                            {_l('保存')}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* {md.global.Config.IsLocal && (
                  <div className="stepItem">
                    <div className="Font16 Gray mBottom16 bold">{_l('在企业微信中使用快速审批')}</div>
                    <div className="Gray_9e exampleTxt mBottom24">
                      {_l(
                        '此功能需要配置企业微信中的应用接收回调消息服务。配置完成后，企业微信中的工作流审批消息卡片可以直接显示通过否决按钮，无需打开审批详情即可直接完成审批（注：需要审批节点启用了快速审批功能）。',
                      )}
                      <Popover title={null} arrowPointAtCenter={true} content={<img src={fucExampleImg} />}>
                        <span className="Hand ThemeColor">{_l('示例')}</span>
                      </Popover>
                    </div>
                    <Switch checked={this.state.openQuickApproval} onClick={this.handleChangeOpenQuickApproval} />
                    <div className="Gray_9e mTop24">
                      {_l('请将下面的字段内容完整准确的复制到企业微信-应用管理-接收消息-设置API接收对应的字段内。')}{' '}
                      <Popover title={null} arrowPointAtCenter={true} content={<img src={setApiExampleImg} />}>
                        <span className="Hand ThemeColor">{_l('示例')}</span>
                      </Popover>
                    </div>
                    {this.state.openQuickApproval && (
                      <Fragment>
                        {quickAprData.map((it, index) => {

                          return (
                            <div
                              className={cx('flexRow alignItemsCenter', { mTop24: index == 0, mTop32: index !== 0 })}
                            >
                              <div className="Font14 w166">{it.label}</div>
                              <Input className="w418 Gray" disabled value={qwQuickAprData[it.key]} />
                              <ClipboardButton
                                component="span"
                                data-clipboard-text={qwQuickAprData[it.key]}
                                onSuccess={this.handleCopyTextSuccess}
                              >
                                <span className="mLeft16 Hand ThemeColor">{_l('复制')}</span>
                              </ClipboardButton>
                            </div>
                          );
                        })}
                      </Fragment>
                    )}
                  </div>
                )} */}
            </div>
          </div>
        </Fragment>
      );
    } else if (currentTab === 'chatSetting') {
      return <ChartSetting projectId={projectId} />;
    } else if (currentTab === 'interfaceLicense') {
      return <InterfaceLicense projectId={projectId} />;
    }
  };
  render() {
    let { intergrationType, currentTab, status } = this.state;
    const { projectId } = this.props;

    if (this.state.pageLoading) {
      return <LoadDiv className="mTop80" />;
    }
    return (
      <div className="orgManagementWrap workwxMainContent platformIntegrationContent">
        {!this.state.isPassApply &&
        !(!this.state.CorpId && (!md.global.Config.IsLocal || md.global.Config.IsPlatformLocal)) &&
        intergrationType !== 2 ? (
          <div className="TxtMiddle">
            <div className="TxtCenter logoBox">
              {this.state.isReject ? (
                <React.Fragment>
                  <Icon icon="closeelement-bg-circle" className="Red iconReject" />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span className="mdIcon">
                    <Icon icon="feed" className="Font40 White" />
                  </span>
                  <Icon icon="swap_horiz" className="Font36 mLeft30 mRight30 Gray_bd" />
                  <Icon icon="invite-ding" className="TxtCenter" />
                </React.Fragment>
              )}
            </div>
            {!this.state.hasApply ? (
              <div className="TxtCenter mTop50">
                <h2 className="Font26 Gray">{_l('申请企业微信集成')}</h2>
                <p className="mTop24 mBottom32 Font16 Gray_75">
                  {_l('申请通过后，可将该系统应用安装到企业微信工作台！')}
                </p>
                <Button
                  type="primary"
                  className="applyBtn mBottom10"
                  onClick={e => {
                    // 提交申请
                    this.editWXProjectSettingStatus(0, () => {
                      this.setState({
                        hasApply: true,
                      });
                    });
                  }}
                >
                  {_l('立即申请')}
                </Button>
              </div>
            ) : (
              <div className="TxtCenter mTop50">
                {this.state.isReject ? (
                  <React.Fragment>
                    <h2 className="Font18 Gray">{_l('试用已过期，请付费后继续使用')}</h2>
                    <p className="mTop15 Font13 Gray_75">{_l('如有疑问，请联系您的专属顾问')}</p>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <h2 className="Font26 Gray">{_l('申请已提交')}</h2>
                    <p className="mTop24 mBottom32 Font16 Gray_75">
                      {_l('预计两个工作日反馈信息，如有疑问，请联系您的专属顾问')}
                    </p>
                  </React.Fragment>
                )}
              </div>
            )}
          </div>
        ) : (
          <Fragment>
            <div className="orgManagementHeader">
              <div className="h100 flexRow alignItemsCenter">
                {status !== 1 && (
                  <i className="icon-backspace Font22 ThemeHoverColor3 pointer mRight10" onClick={this.props.onClose} />
                )}
                <div className={cx('tabBox', { singleTab: !(this.state.status === 1 || intergrationType === 2) })}>
                  {TABS.map(({ key, label }) => {
                    if (key === 'other' && !(this.state.status === 1 || intergrationType === 2)) return;

                    if (
                      key === 'chatSetting' &&
                      !(
                        this.state.status === 1 &&
                        (_.includes(
                          ['fe288386-3d26-4eab-b5d2-51eeab82a7f9', 'faa2f6b1-f706-4084-9a8d-50616817f890'],
                          projectId,
                        ) ||
                          md.global.Config.IsLocal)
                      )
                    )
                      return;

                    if (
                      key === 'interfaceLicense' &&
                      !(!md.global.Config.IsLocal && intergrationType === 2 && this.state.status === 1)
                    )
                      return;

                    return (
                      <span
                        key={key}
                        className={cx('tabItem Hand', { active: currentTab === key })}
                        onClick={() => this.changeTab(key)}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
              {status === 1 && (
                <CancelIntegration
                  clickCancel={() =>
                    this.editWXProjectSettingStatus(2, () => {
                      this.props.onClose();
                      alert(_l('取消成功'));
                    })
                  }
                />
              )}
            </div>
            <div className="orgManagementContent">{this.renderTabContent()}</div>
          </Fragment>
        )}
      </div>
    );
  }
}
