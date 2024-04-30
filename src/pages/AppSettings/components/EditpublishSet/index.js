import React, { PureComponent } from 'react';
import { Switch } from 'antd';
import { Textarea, Button, Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import workWeiXinAjax from 'src/api/workWeiXin';
import wechatPng from '../../img/wechat_work.png';
import { navigateTo } from 'src/router/navigateTo';
import { Modal } from 'antd';
import homeAppAjax from 'src/api/homeApp';
import AppSettingHeader from '../AppSettingHeader';

const Wrap = styled.div`
  h3,
  h6,
  p {
    margin: 0;
    padding: 0;
  }
`;
const WrapCon = styled.div`
  width: 100%;
  overflow: auto;
  position: relative;
  h6 {
    padding-top: 24px;
  }
  .borTopLine {
    border-top: 1px solid #eaeaea;
    margin-top: 24px;
  }
  .publishAppCourse {
    font-weight: 600;
    margin-top: 20px;

    span {
      color: #2196f3;
      cursor: pointer;
      margin-left: 13px;
      display: inline-block;
    }
  }
  .fixedCon {
    line-height: 36px;
    background: rgba(230, 162, 60, 0.17);
    border-radius: 4px;
    margin-top: 10px;
    padding: 0 12px;
  }
  .editFixed {
    color: #2196f3;
    margin-top: 10px;
  }
  .con {
    margin: 20px 0 40px;
    ul {
      display: flex;
      li {
        text-align: center;
        margin-right: 100px;
        .imgCon {
          margin: 20px 0;
          height: 43px;
        }
      }
    }
  }
  .ant-switch {
    transform: scale(0.8);
  }
`;
const TextareaWrapper = styled(Textarea)`
  &::placeholder {
    color: #bdbdbd;
  }
`;
const MDSwitch = styled(Switch)`
  &.ant-switch {
    width: 48px;
    height: 24px;
    line-height: 24px;
  }
  &.ant-switch-checked {
    background-color: #01ca83;
    .ant-switch-handle {
      left: calc(100% - 20px - 2px);
    }
  }
  .ant-switch-handle {
    width: 20px;
    height: 20px;
  }
`;

class EditPublishSetDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 0,
      saveLoading: false,
      hasChange: false,
      integratedWechat: false,
      data: {},
      fixed: false,
    };
    this.saveRef = null;
  }

  componentDidMount() {
    const { fixRemark, fixed } = this.props.data || {};
    this.setState({ fixed, fixRemark });
  }

  getWXProjectSettingInfo() {
    const { projectId, appId } = this.props;
    if (!md.global.Config.IsLocal) {
      workWeiXinAjax.getWXProjectSettingInfo({ projectId, appId }).then(res => {
        if (res && res.status === 1) {
          // 已集成的提交申请弹层
          this.setState({ integratedWechat: true });
        } else {
          // 未集成提示先去配置集成
          this.setState({ noIntegratedWechat: true });
        }
      });
    } else {
      window.open(`/weixinAppCourse/${projectId}/${appId}`);
    }
  }

  toSetEnterpirse = () => {
    const { projectId, appId } = this.props;
    navigateTo(`/admin/workwxapp/${projectId}`);
    this.setState({ noIntegratedWechat: false });
  };
  submitApply = () => {
    const { projectId, appId, appName } = this.props;
    workWeiXinAjax
      .applyWorkWXAlternativeApp({
        projectId,
        appId,
        appName,
      })
      .then(res => {
        if (res) {
          alert(_l('提交申请成功'));
        } else {
          alert(_l('提交申请失败'), 2);
        }
      });
    this.setState({ integratedWechat: false });
  };
  renderEnterpriseWechatModal = () => {
    let { integratedWechat, noIntegratedWechat } = this.state;
    const { appName } = this.props;
    if (integratedWechat) {
      // 已集成
      return (
        <Modal
          wrapClassName="addwechatModal"
          visible={integratedWechat}
          width={608}
          onCancel={() => this.setState({ integratedWechat: false })}
          footer={null}
        >
          <div className="modalContent flexColumn">
            <img className="wechatPng" src={wechatPng} />
            <div className="Font24 Blod mTop50">{_l('将此应用添加到企业微信工作台')}</div>
            <div className="flexRow mTop30">
              <sapn className=" colorGray mRight18">{_l('应用')}</sapn>
              <span>{appName}</span>
            </div>
            <div className="submitBtn" onClick={this.submitApply}>
              {_l('提交申请')}
            </div>
            <div className="connectInfo mTop16">
              {_l('提交后，顾问会电话联系您完成应用集成,也可主动联系顾问 联系电话：400-665-6655')}
            </div>
          </div>
        </Modal>
      );
    } else if (noIntegratedWechat) {
      // 未集成
      return (
        <Modal
          wrapClassName="addwechatModal"
          width={608}
          visible={noIntegratedWechat}
          onCancel={() => this.setState({ noIntegratedWechat: false })}
          footer={null}
        >
          <div className="modalContent flexColumn">
            <img className="wechatPng" src={wechatPng} />
            <div className="Font24 Blod mTop50">{_l('请先配置企业微信集成')}</div>
            <div className="mTop30 colorGray Font14">{_l('配置完成后，方可将此应用添加到企业微信工作台')}</div>
            <div className="settingBtn" onClick={this.toSetEnterpirse}>
              {_l('前往设置')}
            </div>
          </div>
        </Modal>
      );
    }
  };

  publishSettings = obj => {
    const { data, projectId, appId, onChangeData } = this.props;
    const { pcDisplay, webMobileDisplay, appDisplay } = data;
    onChangeData(obj);
    homeAppAjax
      .publishSettings({
        appId,
        projectId,
        pcDisplay,
        webMobileDisplay,
        appDisplay,
        ...obj,
      })
      .then(res => {
        if (res.data) {
          onChangeData(obj);
        } else {
          alert(_l('修改失败，请稍后再试'), 3);
        }
      });
  };

  // 应用维护
  fixedApp = (fixed, isSave) => {
    const { projectId, appId, onChangeData } = this.props;
    const { fixRemark } = this.state;
    homeAppAjax
      .editFix({
        appId,
        projectId,
        fixed,
        fixRemark: fixed ? fixRemark : undefined,
      })
      .then(res => {
        if (res) {
          if (isSave) alert(_l('保存成功'));
          onChangeData({ fixed, fixRemark });
          this.setState({ fixed, fixRemark: fixed ? fixRemark : undefined });
        }
      });
  };

  render() {
    const { projectId, appId, data } = this.props;
    const { appDisplay, webMobileDisplay, pcDisplay } = data;
    const { fixRemark, fixed } = this.state;

    return (
      <Wrap>
        <WrapCon>
          <AppSettingHeader title={_l('发布')} />
          <h6 className="Font15 Bold pTop0">{_l('发布到组织工作台')}</h6>
          <p className="Gray_9 mTop12">{_l('设置用户在哪些设备环境下可见此应用，管理员和开发者在PC端始终可见')}</p>
          <div className="con">
            <ul>
              {[1, 2, 3].map(o => {
                let cur = false;
                let s = ['pcCon', 'webCon', 'appCon'][o - 1];
                if (o === 1) {
                  cur = pcDisplay;
                }
                if (o === 2) {
                  cur = webMobileDisplay;
                }
                if (o === 3) {
                  cur = appDisplay;
                }
                s = !cur ? s + 'hover' : s;
                return (
                  <li
                    onClick={(checked, event) => {
                      let curData = {};
                      if (o === 1) {
                        curData = { pcDisplay: !cur };
                      }
                      if (o === 2) {
                        curData = { webMobileDisplay: !cur };
                      }
                      if (o === 3) {
                        curData = { appDisplay: !cur };
                      }
                      this.publishSettings(curData);
                    }}
                  >
                    <div className={cx(`imgCon Hand publishSettingsImgCon ${s}`)}></div>
                    <Switch size="small" checked={!cur} />
                    <span className="mLeft6 TxtMiddle Hand">
                      {o === 1 ? _l('PC端') : o === 2 ? _l('Web移动端') : _l('App')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          {(!md.global.SysSettings.hideWorkWeixin || !md.global.SysSettings.hideDingding) && (
            <h6 className="Font15 Bold borTopLine">{_l('发布到第三方')}</h6>
          )}
          {!md.global.SysSettings.hideWorkWeixin && (
            <div className="publishAppCourse">
              {_l('发布到')}
              <span
                className="ThemeHoverColor2"
                onClick={() => {
                  this.getWXProjectSettingInfo();
                }}
              >
                {_l('企业微信工作台')}
                <Icon icon="external_collaboration" className="mLeft10 Gray_9e" />
              </span>
            </div>
          )}
          {!md.global.SysSettings.hideDingding && (
            <div className="publishAppCourse">
              {_l('发布到')}
              <span
                className="ThemeHoverColor2"
                onClick={() => {
                  window.open(`/dingAppCourse/${projectId}/${appId}`);
                }}
              >
                {_l('钉钉工作台')}
                <Icon icon="external_collaboration" className="mLeft10 Gray_9e" />
              </span>
            </div>
          )}
          <h6 className="Font15 Bold borTopLine">{_l('应用维护')}</h6>
          <p className="Gray_9 mTop12 mBottom20">
            {_l('应用开启维护状态后，只有管理员和开发者可以访问应用进行更新维护，其他成员无法使用应用')}
          </p>
          <React.Fragment>
            <div className="flexRow alignItemsCenter" style={{ marginLeft: -4 }}>
              <MDSwitch size="default" checked={fixed} onChange={checked => this.fixedApp(checked)} />
              {fixed && <span className="Gray_9e"> {_l('正在维护中...')}</span>}
            </div>
            {fixed && (
              <React.Fragment>
                <div className="Font13 mBottom5 mTop24">{_l('维护公告')}</div>
                <TextareaWrapper
                  ref={ele => (this.appFixTextarea = ele)}
                  id="appFixTextarea"
                  value={fixRemark}
                  className="Font13"
                  placeholder={_l('简短说明维护原因，预计恢复时间...')}
                  onChange={value => {
                    this.setState({ fixRemark: value });
                  }}
                />
                <Button className="mTop20" onClick={() => this.fixedApp(true, true)}>
                  {_l('保存')}
                </Button>
              </React.Fragment>
            )}
          </React.Fragment>
        </WrapCon>

        {this.renderEnterpriseWechatModal()}
      </Wrap>
    );
  }
}

export default EditPublishSetDialog;
