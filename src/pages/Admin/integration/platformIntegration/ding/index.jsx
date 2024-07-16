import React, { Fragment } from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Switch, Icon, Button, LoadDiv, Radio } from 'ming-ui';
import Ajax from 'src/api/workWeiXin';
import IntegrationSetPssword from '../../../components/IntegrationSetPssword';
import IntegrationSync from '../components/IntegrationSync';
import CancelIntegration from '../components/CancelIntegration';
import { integrationFailed, checkClearIntergrationData } from '../utils';
import './style.less';
import _ from 'lodash';

const optionTypes = [
  { label: _l('新开浏览器打开'), key: 1 },
  { label: _l('钉钉内打开'), key: 2 },
];
const messageLinkTypes = [
  { label: _l('独立窗口'), key: 2 },
  { label: _l('侧边栏打开'), key: 1 },
];

const TABS = [
  { key: 'base', label: _l('钉钉集成') },
  { key: 'other', label: _l('其他') },
];

export default class Ding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      isHasInfo: false, //是否已填对接信息
      canEditInfo: true, //是否可编辑输入框
      isShowCorpId: false,
      isShowAppKey: false,
      isShowAppSecret: false,
      isShowAgentId: false,
      CorpId: null,
      AppKey: null,
      AppSecret: null,
      AgentId: null,
      CorpIdFormat: null, //用于显示
      AppKeyFormat: null,
      AppSecretFormat: null,
      AgentIdFormat: null,
      isCloseDing: false,
      data: null,
      show1: false,
      show2: false,
      isLoading: false,
      failed: false,
      failedStr: '',
      canSyncBtn: false,
      intergrationClientWorkingPattern: 0,
      intergrationTodoMessageEnabled: false,
      isSetPassword: false,
      passwordError: false,
      currentTab: 'base',
    };
  }

  componentDidMount() {
    Ajax.getDDProjectSettingInfo({ projectId: this.props.projectId }).then(res => {
      this.setState({
        pageLoading: false,
      });
      if (res) {
        this.setState({
          //"status: 集成状态，主要通过该值展现：1代表申请通过并提供了使用；0代表提交了申请；-1代表拒绝申请；2代表之前集成过但关闭了集成"
          CorpId: res.corpId,
          AppKey: res.appKey,
          AppSecret: res.appSecret,
          AgentId: res.agentId,
          isHasInfo: res.status === 2 || (res.corpId && res.agentId && res.appKey && res.appSecret),
          canEditInfo: !res.corpId && !res.agentId && !res.appKey && !res.appSecret,
          isCloseDing: res.status === 2,
          CorpIdFormat: this.formatStr(res.corpId), //用于显示
          AppKeyFormat: this.formatStr(res.appKey),
          AppSecretFormat: this.formatStr(res.appSecret),
          AgentIdFormat: this.formatStr(res.agentId),
          show1: !(res.corpId && res.agentId && res.appKey && res.appSecret && res.status != 2),
          show2: !(res.corpId && res.agentId && res.appKey && res.appSecret && res.status != 2),
          intergrationClientWorkingPattern: res.intergrationClientWorkingPattern,
          intergrationTodoMessageEnabled: res.intergrationTodoMessageEnabled,
          ddMessagUrlPcSlide: res.ddMessagUrlPcSlide,
          status: res.status,
        });
      }
    });
  }

  // 保存信息/编辑信息
  editInfo = () => {
    if (!this.state.AppKey || !this.state.AppSecret || !this.state.CorpId || !this.state.AgentId) {
      alert(_l('请输入相关信息'), 2);
      return;
    }
    Ajax.editDDProjectSetting({
      projectId: this.props.projectId,
      appKey: this.state.AppKey,
      appSecret: this.state.AppSecret,
      corpId: this.state.CorpId,
    }).then(res => {
      if (res.item1) {
        Ajax.editDDAppNoticeSetting({
          projectId: this.props.projectId,
          agentId: this.state.AgentId,
        }).then(info => {
          if (info.item1) {
            this.setState({
              isHasInfo: true,
              canEditInfo: false,
            });
          } else {
            alert(info.item2, 2);
          }
        });
      } else {
        alert(res.item2, 2);
      }
    });
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

  editDingStatus = (num, callback = () => {}) => {
    this.editDDProjectSettingStatus(num, () => {
      callback();
      this.setState({
        isCloseDing: !this.state.isCloseDing,
      });
    });
  };

  inputRender = (strId, w, labelId) => {
    return (
      <React.Fragment>
        <div className="inputTitleBox">
          <span className="inputTitle">{`${labelId}：`}</span>
        </div>
        <div className="Relative InlineBlock inputDiv clearfix">
          {this.state.canEditInfo ? (
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
                icon={!this.state[`isShow${strId}`] ? 'visibility_off' : 'circulated'}
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
    const { projectId } = this.props;
    const { canEditInfo, isHasInfo, isCloseDing } = this.state;

    return (
      <div className="pBottom100">
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
              <p className="mTop16 Font14 Gray_75">{_l('从钉钉开放平台获取对接信息，即可开始集成以及同步通讯录')}</p>
              <Link to={`/dingSyncCourse/${this.props.projectId}`} target="_blank" className="mTop16 Font14 howApply">
                {_l('如何获取对接信息？')}
              </Link>
            </React.Fragment>
          )}
        </div>
        <div className="stepItem Relative">
          <h3 className="stepTitle Font16 Gray">{_l('2.对接信息录入')}</h3>
          {!this.state.show2 && (
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
          {this.state.isHasInfo && this.state.show2 && (
            <span className="Font13 Gray_75 Right closeDing">
              <span
                className="mLeft10 switchBtn tip-bottom-left"
                data-tip={_l('关闭钉钉集成后，无法再从钉钉处进入应用')}
              >
                <Switch checked={!this.state.isCloseDing} onClick={checked => this.editDingStatus(checked ? 2 : 1)} />
              </span>
            </span>
          )}
          {!this.state.isCloseDing && this.state.show2 && (
            <React.Fragment>
              <p className="mTop16 Font14 Gray_75">
                {_l('完成步骤 1 后，填入CorpId、AgentId、ClientId、ClientScret后可对接应用与同步通讯录')}
              </p>
              <div className="mTop25 infoList">
                <ul>
                  <li>{this.inputRender('CorpId', 466, 'CorpId')}</li>
                  <li className="mTop16">{this.inputRender('AgentId', 446, 'AgentId')}</li>
                  <li className="mTop16">{this.inputRender('AppKey', 446, 'ClientId')}</li>
                  <li className="mTop16">{this.inputRender('AppSecret', 445, 'ClientScret')}</li>
                </ul>
              </div>
              <div className="TxtRight mTop30">
                {!this.state.canEditInfo ? (
                  <Button
                    type="primary"
                    className="editInfo"
                    onClick={e => {
                      this.setState({
                        canEditInfo: true,
                      });
                    }}
                  >
                    {_l('编辑')}
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    className="saveInfo"
                    onClick={e => {
                      checkClearIntergrationData({
                        projectId: this.props.projectId,
                        onSave: this.editInfo,
                      });
                    }}
                  >
                    {_l('保存')}
                  </Button>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
        <IntegrationSync
          integrationType={1}
          step="3."
          syncDisabled={(canEditInfo && !isHasInfo) || isCloseDing}
          projectId={projectId}
        />
      </div>
    );
  };

  editDDProjectSettingStatus = (tag, callback) => {
    // 状态：0 提交申请；2关闭集成；1重新开启集成 tag
    Ajax.editDDProjectSettingStatus({
      projectId: this.props.projectId,
      status: tag,
    }).then(res => {
      if (res) {
        callback();
      } else {
        integrationFailed(this.props.projectId);
      }
    });
  };

  /**
   * 编辑钉钉消息是否进入待办任务
   */
  switchEnabled() {
    Ajax.editDDProjectTodoMessageEnabled({
      projectId: this.props.projectId,
      status: this.state.intergrationTodoMessageEnabled ? 2 : 1,
    }).then(res => {
      if (res) {
        this.setState({
          intergrationTodoMessageEnabled: !this.state.intergrationTodoMessageEnabled,
        });
      } else {
        alert(_l('失败'), 2);
      }
    });
  }

  /**
   * 编辑钉钉客户端打开方式
   */
  handleChangePattern(value) {
    Ajax.editDDProjectClientWorkingPattern({
      projectId: this.props.projectId,
      status: value,
    }).then(res => {
      if (res) {
        this.setState({
          intergrationClientWorkingPattern: value,
        });
      } else {
        alert(_l('失败'), 2);
      }
    });
  }

  handleChangeMessageLinkWay = value => {
    Ajax.editDDMessagUrlPcSlide({
      projectId: this.props.projectId,
      status: value,
    }).then(res => {
      if (res) {
        this.setState({
          ddMessagUrlPcSlide: value,
        });
      } else {
        alert(_l('失败'), 2);
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

  changeTab = key => {
    this.setState({ currentTab: key });
    if (key === 'other') {
      this.getInitialPassword();
    }
  };
  render() {
    const { currentTab, CorpId, AppKey, AppSecret, AgentId } = this.state;

    if (this.state.pageLoading) {
      return <LoadDiv className="mTop80" />;
    }
    return (
      <div className="orgManagementWrap dingMainContent">
        <div className="orgManagementHeader">
          <div className="h100 flexRow alignItemsCenter">
            {!(!this.state.isCloseDing && CorpId && AppKey && AppSecret && AgentId) && (
              <i className="icon-backspace Font22 ThemeHoverColor3 pointer mRight10" onClick={this.props.onClose} />
            )}
            <div className={cx('tabBox', { singleTab: !(this.state.status === 1 && !this.state.isCloseDing) })}>
              {TABS.map(({ key, label }) => {
                if (key === 'other' && !(this.state.status === 1 && !this.state.isCloseDing)) return;

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
          {!this.state.isCloseDing && CorpId && AppKey && AppSecret && AgentId && (
            <CancelIntegration
              clickCancel={() =>
                this.editDingStatus(2, () => {
                  this.props.onClose();
                  alert(_l('取消成功'));
                })
              }
            />
          )}
        </div>
        <div className="orgManagementContent">
          {currentTab === 'base' && this.stepRender()}
          {currentTab === 'other' && this.state.status === 1 && !this.state.isCloseDing && (
            <Fragment>
              <div className="stepItem">
                <h3 className="stepTitle Font16 Gray pBottom5">{_l('应用在钉钉PC端打开方式')}</h3>
                {optionTypes.map(item => {
                  return (
                    <Radio
                      className="Block mTop20"
                      disabled={this.state.isCloseDing}
                      checked={this.state.intergrationClientWorkingPattern === item.key}
                      text={item.label}
                      onClick={e => this.handleChangePattern(item.key)}
                    />
                  );
                })}
              </div>
              <div className="stepItem">
                <h3 className="stepTitle Font16 Gray pBottom5">{_l('消息链接')}</h3>
                {messageLinkTypes.map(item => {
                  return (
                    <Radio
                      className="Block mTop20"
                      disabled={this.state.isCloseDing}
                      checked={this.state.ddMessagUrlPcSlide === item.key}
                      text={item.label}
                      onClick={e => this.handleChangeMessageLinkWay(item.key)}
                    />
                  );
                })}
              </div>
              <div className="stepItem flexRow valignWrapper">
                <div className="flexColumn flex">
                  <h3 className="stepTitle Font16 Gray mBottom24">{_l('流程待办同步至钉钉待办任务')}</h3>
                  <Switch
                    disabled={this.state.isCloseDing}
                    checked={this.state.intergrationTodoMessageEnabled}
                    onClick={() => this.switchEnabled()}
                  />
                  <div className="mTop16">
                    <span>
                      {_l('开启后，我的流程中的待办（待审批、待填写）同时会进入钉钉待办任务，处理状态会同步更新')}
                    </span>
                    <span className="Block Gray">
                      <span className="Bold">{_l('注意：')}</span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: _l(
                            '此功能需要在钉钉中开启添加待办任务接口权限。%0如何开启？%1',
                            '<a href="https://help.mingdao.com/dingtalk/integration-guide#pending" target="_blank">',
                            '</a>',
                          ),
                        }}
                      ></span>
                    </span>
                  </div>
                </div>
              </div>
              {md.global.Config.IsLocal && (
                <IntegrationSetPssword
                  password={this.state.password}
                  isSetPassword={this.state.isSetPassword}
                  disabled={this.state.isCloseDing}
                />
              )}
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
