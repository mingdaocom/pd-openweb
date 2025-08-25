import React, { Fragment } from 'react';
import { Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Icon, LoadDiv, MdLink, Switch } from 'ming-ui';
import Ajax from 'src/api/workWeiXin';
import CancelIntegration from '../components/CancelIntegration';
import EnableScanLogin from '../components/EnableScanLogin';
import IntegrationSetPassword from '../components/IntegrationSetPassword';
import IntegrationSync from '../components/IntegrationSync';
import SettingLinkOpen from '../components/SettingLinkOpen';
import { checkClearIntergrationData, integrationFailed } from '../utils';
import fsImg from './feishuSyncCourse/img/8.png';
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
      currentTab: 'base',
      isEditing: false,
    };
  }

  componentDidMount() {
    const { projectIntergrationType, type } = this.props;
    const isLark = type === 'lark';

    Ajax.getFeishuProjectSettingInfo({ projectId: this.props.projectId }).then(res => {
      this.setState({ pageLoading: false });

      if (!res || ((projectIntergrationType === 0 || res.status === 2) && isLark !== res.isLark)) {
        res = {
          appId: '',
          appSecret: '',
          status: '',
          isLark,
        };
      }

      if (res) {
        this.setState({
          AppId: res.appId,
          AppSecret: res.appSecret,
          isHasInfo: res.appId && res.appSecret,
          canEditInfo: !res.appId && !res.appSecret,
          isCloseDing: res.status === 2,
          AppIdFormat: this.formatStr(res.appId), //用于显示
          AppSecretFormat: this.formatStr(res.appSecret),
          show1: !(res.appId && res.appSecret && res.status != 2),
          show2: !(res.appId && res.appSecret && res.status != 2),
          integrationScanEnabled: res.intergrationScanEnabled,
          ..._.pick(res, ['customNameIcon', 'status', 'isLark', 'ddMessagUrlPcSlide']),
        });
      }
    });
  }

  // 保存信息/编辑信息
  editInfo = () => {
    if (!this.state.AppSecret || !this.state.AppId) {
      alert('请输入相关信息', 3);
      return;
    }

    Ajax.editFeishuProjectSetting({
      projectId: this.props.projectId,
      appId: this.state.AppId,
      appSecret: this.state.AppSecret,
      isLark: this.state.isLark,
    }).then(res => {
      if (res) {
        if (res.item1) {
          this.setState({
            isHasInfo: true,
            canEditInfo: false,
          });
        } else {
          alert(res.item2, 2);
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
      projectId: this.props.projectId,
      status: tag,
      isLark: this.state.isLark,
    }).then(res => {
      if (res) {
        callback();
      } else {
        integrationFailed(this.props.projectId);
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
                <img width={600} src={fsImg} />
              </span>
            }
          >
            <Icon icon="help" className="Font18 Gray_9e" />
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
                icon={!this.state[`isShow${strId}`] ? 'visibility_off' : 'visibility'}
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
    const { projectId, featureType, featureId } = this.props;
    const { canEditInfo, isHasInfo, isCloseDing, isLark, AppId, AppSecret } = this.state;

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
              <Icon icon="arrow-right-border" className="Font13 Gray_75 Right Hand" />
            </div>
          ) : (
            <React.Fragment>
              <p className="mTop16 Font14 Gray_75">
                {!isLark ? _l('从飞书开放平台获取对接信息，') : _l('从Lark开放平台获取对接信息，')}
                {_l('即可开始集成以及同步通讯录')}
              </p>
              <MdLink
                to={`/feishuSyncCourse/${this.props.projectId}?type=${isLark ? 'lark' : 'feishu'}`}
                target="_blank"
                className="mTop16 Font14 howApply"
              >
                {_l('如何获取对接信息？')}
              </MdLink>
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
              <Icon icon="arrow-right-border" className="Font13 Gray_75 Right Hand" />
            </div>
          )}
          {this.state.isHasInfo && this.state.show2 && (
            <span className="Font13 Gray_75 Right closeDing">
              <span
                className="mLeft10 switchBtn tip-bottom-left"
                data-tip={
                  isLark ? _l('关闭Lark集成后，无法再从Lark处进入应用') : _l('关闭飞书集成后，无法再从飞书处进入应用')
                }
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
              {}
              <div className="TxtRight mTop30">
                {!this.state.canEditInfo ? (
                  <Button
                    type="primary"
                    className="editInfo"
                    onClick={() => {
                      this.setState({
                        canEditInfo: true,
                        isEditing: true,
                      });
                    }}
                  >
                    {_l('编辑')}
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    className="saveInfo"
                    disabled={!AppId || !AppSecret}
                    onClick={() => {
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
          integrationType={isLark ? 7 : 6}
          step="3."
          syncDisabled={(canEditInfo && !isHasInfo) || isCloseDing}
          projectId={projectId}
          featureType={featureType}
          featureId={featureId}
        />
      </div>
    );
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
    const { projectId } = this.props;
    const {
      currentTab,
      AppId,
      AppSecret,
      integrationScanEnabled,
      isCloseDing,
      customNameIcon,
      isLark,
      isEditing,
      ddMessagUrlPcSlide,
    } = this.state;

    if (this.state.pageLoading) {
      return <LoadDiv className="mTop80" />;
    }

    return (
      <div className="orgManagementWrap feishuMainContent platformIntegrationContent">
        <div className="orgManagementHeader">
          <div className="h100 flexRow alignItemsCenter">
            {!(!this.state.isCloseDing && AppId && AppSecret) && !isEditing && (
              <i className="icon-backspace Font22 ThemeHoverColor3 pointer mRight10" onClick={this.props.onClose} />
            )}
            <div
              className={cx('tabBox', {
                singleTab: !(this.state.status === 1 && !this.state.isCloseDing),
              })}
            >
              {[
                { key: 'base', label: isLark ? _l('Lark集成') : _l('飞书集成') },
                { key: 'other', label: _l('其他') },
              ].map(({ key, label }) => {
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
          {!this.state.isCloseDing && AppId && AppSecret && (
            <CancelIntegration
              clickCancel={() =>
                this.editFeishuProjectSettingStatus(2, () => {
                  this.props.onClose();
                  alert(_l('取消成功'));
                })
              }
            />
          )}
        </div>
        <div className="orgManagementContent">
          {currentTab === 'base' && this.stepRender()}
          {currentTab === 'other' && (
            <Fragment>
              <div className="stepItem">
                <EnableScanLogin
                  integrationType={isLark ? 7 : 6}
                  projectId={projectId}
                  scanEnabled={integrationScanEnabled}
                  disabled={isCloseDing}
                  href={`/feishuSyncCourse/${projectId}?type=${isLark ? 'lark' : 'feishu'}`}
                  updateScanEnabled={integrationScanEnabled => this.setState({ integrationScanEnabled })}
                  customNameIcon={customNameIcon}
                  updateCustomNameIcon={customNameIcon => this.setState({ customNameIcon })}
                />
              </div>
              {md.global.Config.IsLocal && (
                <IntegrationSetPassword
                  password={this.state.password}
                  isSetPassword={this.state.isSetPassword}
                  disabled={
                    (this.state.canEditInfo && !this.state.isHasInfo) ||
                    this.state.isCloseDing ||
                    this.state.showSyncDiaLog
                  }
                />
              )}
              <SettingLinkOpen
                projectId={projectId}
                disabled={isCloseDing}
                value={ddMessagUrlPcSlide}
                onChange={value => this.setState({ ddMessagUrlPcSlide: value })}
              />
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
