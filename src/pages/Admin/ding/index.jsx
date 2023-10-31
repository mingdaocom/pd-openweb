import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Switch, Icon, Button, LoadDiv, Radio } from 'ming-ui';
import { Tabs, Popover, Input } from 'antd';
import Ajax from 'src/api/workWeiXin';
import Config from '../config';
import Dialog from 'ming-ui/components/Dialog';
import IntegrationSetPssword from '../components/IntegrationSetPssword';
import ClearISaventergrationModal from '../components/ClearISaventergrationModal';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
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
      showSyncDiaLog: false,
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
    };
  }

  componentDidMount() {
    Config.setPageTitle(_l('钉钉'));
    Ajax.getDDProjectSettingInfo({ projectId: Config.projectId }).then(res => {
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

  checkClearIntergrationData = () => {
    checkClearIntergrationData(Config.projectId).then(res => {
      if (res) {
        this.setState({ showCheckClearModal: true });
      } else {
        this.editInfo();
      }
    });
  };

  // 保存信息/编辑信息
  editInfo = () => {
    if (!this.state.AppKey || !this.state.AppSecret || !this.state.CorpId || !this.state.AgentId) {
      alert(_l('请输入相关信息'), 2);
      return;
    }
    Ajax.editDDProjectSetting({
      projectId: Config.projectId,
      appKey: this.state.AppKey,
      appSecret: this.state.AppSecret,
      corpId: this.state.CorpId,
    }).then(res => {
      if (res.item1) {
        Ajax.editDDAppNoticeSetting({
          projectId: Config.projectId,
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

  editDingStatus = num => {
    this.editDDProjectSettingStatus(num, () => {
      this.setState({
        isCloseDing: !this.state.isCloseDing,
      });
    });
  };

  inputRender = (strId, w) => {
    return (
      <React.Fragment>
        <div className="inputTitleBox">
          <span className="inputTitle">{`${strId}：`}</span>
          <Popover
            title={null}
            arrowPointAtCenter={true}
            placement="bottomLeft"
            overlayClassName="dingPopoverWrapper"
            content={
              <span className="card Relative overflowHidden">
                <img
                  width={w}
                  src={`/src/pages/Admin/ding/img/${strId}.png`}
                  alt={_l('点击“自建应用”进入新建应用页面')}
                />
              </span>
            }
          >
            <Icon icon="sidebar_help" className="Font18 Gray_9e" />
          </Popover>
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

  syncFn = isCheck => {
    if (isCheck) {
      this.setState({
        isLoading: true,
        showSyncDiaLog: isCheck,
        canSyncBtn: false,
      });
    }
    Ajax.syncWorkDDToMing({
      projectId: Config.projectId,
      check: isCheck, //是否进行预先检查，true返回数据给前端展现但不进行同步，类似企业微信，false进行同步
    }).then(res => {
      if (res.item1) {
        this.setState({
          failed: false,
        });
        if (isCheck) {
          //返回数据给前端展现但不进行同步
          this.setState({
            canSyncBtn: true,
            data: res.item3,
            isLoading: false,
          });
        } else {
          // 进行成功同步后
          this.setState({
            showSyncDiaLog: false,
            isLoading: false,
          });
          alert(_l('成功同步'));
        }
      } else {
        //返回数据给前端展现但不进行同步
        this.setState({
          showSyncDiaLog: true,
          data: res.item3,
          isLoading: false,
          failed: true,
          failedStr: res.item2 ? res.item2 : _l('同步失败！'),
        });
      }
    });
  };

  stepRender = () => {
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
              <Link to={`/dingSyncCourse/${Config.projectId}`} target="_blank" className="mTop16 Font14 howApply">
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
                {_l('完成步骤 1 后，填入CorpId、AgentId、AppKey、AppSecret后可对接应用与同步通讯录')}
              </p>
              <div className="mTop25 infoList">
                <ul>
                  <li>{this.inputRender('CorpId', 466)}</li>
                  <li className="mTop16">{this.inputRender('AgentId', 446)}</li>
                  <li className="mTop16">{this.inputRender('AppKey', 446)}</li>
                  <li className="mTop16">{this.inputRender('AppSecret', 445)}</li>
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
                      this.checkClearIntergrationData();
                    }}
                  >
                    {_l('保存')}
                  </Button>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
        <div className="stepItem">
          <h3 className="stepTitle Font16 Gray">{_l('3.数据同步')}</h3>
          <div className="mTop20 syncBox">
            <span className="Font14 syncTxt">{_l('从钉钉通讯录同步到该系统')}</span>
            <Button
              type="primary"
              className={cx('syncBtn', {
                isNO:
                  (this.state.canEditInfo && !this.state.isHasInfo) ||
                  this.state.isCloseDing ||
                  this.state.showSyncDiaLog,
              })}
              onClick={e => {
                if (
                  (this.state.canEditInfo && !this.state.isHasInfo) ||
                  this.state.isCloseDing ||
                  this.state.showSyncDiaLog
                ) {
                  return;
                } else {
                  this.syncFn(true);
                }
              }}
            >
              {this.state.showSyncDiaLog ? _l('同步中') : _l('同步')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  renderSyncDiaLog = () => {
    return (
      <Dialog
        visible={this.state.showSyncDiaLog}
        className="SyncDiaLog"
        onCancel={() => {
          this.setState({
            showSyncDiaLog: false,
          });
        }}
        overlayClosable={false}
        title={this.state.failed ? _l('同步失败') : _l('同步内容')}
        footer={
          <Button
            disabled={this.state.canSyncBtn ? false : true}
            type="primary"
            onClick={() => {
              if (!this.state.canSyncBtn) {
                return;
              }
              if (this.state.failed) {
                this.setState({
                  showSyncDiaLog: false,
                });
              } else {
                this.setState({
                  canSyncBtn: false,
                });
                this.syncFn(false);
              }
            }}
          >
            {_l('确认')}
          </Button>
        }
      >
        <p>
          {this.state.isLoading ? (
            <LoadDiv className="" />
          ) : !this.state.failed ? (
            _.map(this.state.data, (item, i) => {
              switch (item.type) {
                case 4:
                  return <p>{`新增${item.items.length}个用户`}</p>;
                case 5:
                  return <p>{`删除${item.items.length}个用户`}</p>;
                case 6:
                  return <p>{`同步${item.items.length}个用户信息`}</p>;
                case 7:
                  return <p>{`${item.items.length}个用户信息，由于用户数量已达上限，暂不能同步到通讯录`}</p>;
                case 8:
                  return <p>{`新增${item.items.length}个部门`}</p>;
                case 9:
                  return <p>{`删除${item.items.length}个部门`}</p>;
                case 10:
                  return <p>{`同步${item.items.length}个部门信息`}</p>;
                default:
                  break;
              }
            })
          ) : (
            this.state.failedStr
          )}
        </p>
      </Dialog>
    );
  };

  editDDProjectSettingStatus = (tag, callback) => {
    // 状态：0 提交申请；2关闭集成；1重新开启集成 tag
    Ajax.editDDProjectSettingStatus({
      projectId: Config.projectId,
      status: tag,
    }).then(res => {
      if (res) {
        callback();
      } else {
        integrationFailed(Config.projectId);
      }
    });
  };

  /**
   * 编辑钉钉消息是否进入待办任务
   */
  switchEnabled() {
    Ajax.editDDProjectTodoMessageEnabled({
      projectId: Config.projectId,
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
      projectId: Config.projectId,
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
      projectId: Config.projectId,
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
      projectId: Config.projectId,
    }).then(res => {
      this.setState({ password: res, isSetPassword: !!res });
    });
  };

  changeTab = key => {
    if (key === 'other') {
      this.getInitialPassword();
    }
  };
  render() {
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.dingIntergration);
    if (featureType === '2') {
      return (
        <div className="orgManagementWrap">
          {buriedUpgradeVersionDialog(Config.projectId, VersionProductType.dingIntergration, { dialogType: 'content' })}
        </div>
      );
    }
    if (this.state.pageLoading) {
      return <LoadDiv className="mTop80" />;
    }
    return (
      <div className="orgManagementWrap dingMainContent">
        <Tabs
          defaultActiveKey="base"
          onChange={this.changeTab}
          className={cx('mdAntTabs', {
            tabStyle: !(this.state.status === 1 && !this.state.isCloseDing),
            singleTab: !(this.state.status === 1 && !this.state.isCloseDing),
          })}
        >
          <Tabs.TabPane tab={_l('钉钉集成')} key="base">
            {this.stepRender()}
          </Tabs.TabPane>
          {this.state.status === 1 && !this.state.isCloseDing && (
            <Tabs.TabPane tab={_l('其他')} key="other">
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
                            '<a href="https://help.mingdao.com/dingding#1%E3%80%81%E5%BE%85%E5%8A%9E%E6%B6%88%E6%81%AF%E5%90%8C%E6%AD%A5" target="_blank">',
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
            </Tabs.TabPane>
          )}
        </Tabs>
        {this.state.showSyncDiaLog && this.renderSyncDiaLog()}
        {this.state.showCheckClearModal && (
          <ClearISaventergrationModal
            projectId={Config.projectId}
            visible={this.state.showCheckClearModal}
            onSave={this.editInfo}
            onClose={() => {
              this.setState({ showCheckClearModal: false });
            }}
          />
        )}
      </div>
    );
  }
}
