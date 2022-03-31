import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { Switch, Icon, Button, LoadDiv } from 'ming-ui';
import { Tabs, Popover, Radio, Input } from 'antd';
import Ajax from 'src/api/workWeiXin';
import Config from '../config';
import Dialog from 'ming-ui/components/Dialog';
import { navigateTo } from 'src/router/navigateTo';
import IntegrationSetPssword from '../components/IntegrationSetPssword';
import './style.less';

export default class FeiShu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      isHasInfo: false, //是否已填对接信息
      canEditInfo: true, //是否可编辑输入框
      isShowAppId: false,
      isShowAppSecret: false,
      AppId: null,
      AppSecret: null,
      AppIdFormat: null, //用于显示
      AppSecretFormat: null,
      isCloseDing: false,
      showSyncDiaLog: false,
      data: null,
      show1: false,
      show2: false,
      isLoading: false,
      failed: false,
      failedStr: '',
      canSyncBtn: false,
      isSetPassword: false,
      passwordError: false,
    };
  }

  componentDidMount() {
    Config.setPageTitle(_l('飞书'));
    Ajax.getFeishuProjectSettingInfo({ projectId: Config.projectId }).then(res => {
      this.setState({
        pageLoading: false,
      });
      if (!res) {
        res = {
          appId: '',
          appSecret: '',
          status: '',
        };
      }
      if (res) {
        this.setState({
          AppId: res.appId,
          AppSecret: res.appSecret,
          isHasInfo: res.status === 2 || (res.appId && res.appSecret),
          canEditInfo: !res.appId && !res.appSecret,
          isCloseDing: res.status === 2,
          AppIdFormat: this.formatStr(res.appId), //用于显示
          AppSecretFormat: this.formatStr(res.appSecret),
          show1: !(res.appId && res.appSecret && res.status != 2),
          show2: !(res.appId && res.appSecret && res.status != 2),
          status: res.status,
        });
      }
    });
  }

  // 保存信息/编辑信息
  editInfo = () => {
    if (!this.state.AppSecret || !this.state.AppId) {
      alert('请输入相关信息');
      return;
    }
    Ajax.editFeishuProjectSetting({
      projectId: Config.projectId,
      appId: this.state.AppId,
      appSecret: this.state.AppSecret,
    }).then(res => {
      if (res) {
        if (res.item1) {
          this.setState({
            isHasInfo: true,
            canEditInfo: false,
          });
        } else {
          alert(res.item2);
        }
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

  editFeishuProjectSettingStatus = (tag, callback) => {
    // 状态：0 提交申请；2关闭集成；1重新开启集成 tag
    Ajax.editFeishuProjectSettingStatus({
      projectId: Config.projectId,
      status: tag,
    }).then(res => {
      if (res) {
        callback();
      } else {
        alert('失败');
      }
    });
  };

  editDingStatus = num => {
    this.editFeishuProjectSettingStatus(num, () => {
      this.setState({
        isCloseDing: !this.state.isCloseDing,
      });
    });
  };

  inputRender = (strId, name) => {
    return (
      <React.Fragment>
        <div className="inputTitleBox">
          <span className="inputTitle">{`${name}：`}</span>
          <Popover
            title={null}
            arrowPointAtCenter={true}
            placement="bottomLeft"
            overlayClassName="workwxPopoverWrapper"
            content={
              <span className="card Relative overflowHidden">
                <img width={600} src="/src/pages/Admin/feishu/feishuSyncCourse/img/8.png" />
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
                icon={!this.state[`isShow${strId}`] ? 'circulated' : 'public-folder-hidden'}
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
    Ajax.syncFeishuToMingByApp({
      projectId: Config.projectId,
      check: isCheck,
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
          <h3 className="Font16 Gray">{_l('1.获取对接信息')}</h3>
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
              <p className="mTop16 Font14 Gray_75">{_l('从飞书开放平台获取对接信息，即可开始集成以及同步通讯录')}</p>
              <Link to={`/feishuSyncCourse/${Config.projectId}`} target="_blank" className="mTop16 Font14 howApply">
                {_l('如何获取对接信息？')}
              </Link>
            </React.Fragment>
          )}
        </div>
        <div className="stepItem Relative">
          <h3 className="Font16 Gray">{_l('2.对接信息录入')}</h3>
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
                data-tip={_l('关闭飞书集成后，无法再从飞书处进入应用')}
              >
                <Switch checked={!this.state.isCloseDing} onClick={checked => this.editDingStatus(checked ? 2 : 1)} />
              </span>
            </span>
          )}
          {!this.state.isCloseDing && this.state.show2 && (
            <React.Fragment>
              <p className="mTop16 Font14 Gray_75">
                {_l('完成步骤 1 后，填入App ID、App Secret后可对接应用与同步通讯录')}
              </p>
              <div className="mTop25 infoList">
                <ul>
                  <li>{this.inputRender('AppId', 'App ID')}</li>
                  <li className="mTop16">{this.inputRender('AppSecret', 'App Secret')}</li>
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
                      this.editInfo();
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
          <h3 className="Font16 Gray">{_l('3.数据同步')}</h3>
          <div className="mTop16 syncBox">
            <span className="Font14 syncTxt Gray_75">{_l('从飞书通讯录同步到该系统')}</span>
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

  // 免费版显示付费升级
  renderUpgrade = () => {
    return (
      <div className="upgradePage flexColumn">
        <div className="netStateWrap">
          <div className="imgWrap" />
          <div className="hint">{_l('当前版本无法使用此功能')}</div>
          <div className="explain">{_l('请升级到标准版本或以上版本')}</div>
        </div>
        {/*<Button
          type="primary"
          className="payUpgradeBtn"
          onClick={() => {
            navigateTo(`/upgrade/choose?projectId=${Config.projectId}`);
          }}
        >
          {_l('立即购买')}
        </Button>*/}
      </div>
    );
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
    if (Config.project.licenseType === 0) {
      return this.renderUpgrade();
    }
    if (this.state.pageLoading) {
      return <LoadDiv className="mTop80" />;
    }
    return (
      <div className="feishuMainContent">
        <Tabs
          defaultActiveKey="base"
          onChange={this.changeTab}
          className={cx({ tabStyle: !(this.state.status === 1 && !this.state.isCloseDing) })}
        >
          <Tabs.TabPane tab={_l('飞书集成')} key="base">
            {this.stepRender()}
          </Tabs.TabPane>
          {md.global.Config.IsLocal && this.state.status === 1 && !this.state.isCloseDing && (
            <Tabs.TabPane tab={_l('其他')} key="other">
              <IntegrationSetPssword
                password={this.state.password}
                isSetPassword={this.state.isSetPassword}
                disabled={
                  (this.state.canEditInfo && !this.state.isHasInfo) ||
                  this.state.isCloseDing ||
                  this.state.showSyncDiaLog
                }
              />
            </Tabs.TabPane>
          )}
        </Tabs>
        {this.state.showSyncDiaLog && this.renderSyncDiaLog()}
      </div>
    );
  }
}
