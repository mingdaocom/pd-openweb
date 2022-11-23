import React, { PureComponent } from 'react';
import { Switch } from 'antd';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import styled from 'styled-components';
import cx from 'classnames';
import { getWXProjectSettingInfo, applyWorkWXAlternativeApp } from 'src/api/workWeiXin';
import wechatPng from 'src/pages/PageHeader/AppPkgHeader/AppDetail/img/wechat_work.png';
import { navigateTo } from 'src/router/navigateTo';
import { Modal } from 'antd';
import { publishSettings } from 'src/api/homeApp';
import { Icon } from 'ming-ui';

const Wrap = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-flow: column nowrap;
  width: 480px;
  background: #fff;
  .cover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 480px;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
  }
  h3,
  h6,
  p {
    margin: 0;
    padding: 0;
  }
`;
const WrapCon = styled.div`
  width: 100%;
  padding: 24px;
  overflow: auto;
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
    ul {
      display: flex;
      li {
        flex: 1;
        text-align: center;
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

class EditPublishSetDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 0,
      saveLoading: false,
      hasChange: false,
      integratedWechat: false,
      data: {},
    };
    this.saveRef = null;
  }

  getWXProjectSettingInfo() {
    const { projectId, appId } = this.props;
    if (!md.global.Config.IsLocal) {
      getWXProjectSettingInfo({ projectId, appId }).then(res => {
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
    applyWorkWXAlternativeApp({
      projectId,
      appId,
      appName,
    }).then(res => {
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
    const { data, projectId, appId, onChangePublish } = this.props;
    const { pcDisplay, webMobileDisplay, appDisplay } = data;
    onChangePublish(obj);
    publishSettings({
      appId,
      projectId,
      pcDisplay,
      webMobileDisplay,
      appDisplay,
      ...obj,
    }).then(res => {
      if (res.data) {
        onChangePublish(obj);
      } else {
        alert(_l('修改失败，请稍后再试', 3));
      }
    });
  };

  render() {
    const { showEditPublishSetDialog, onClose, projectId, appId, data, onChangeFixStatus } = this.props;
    const { fixed, appDisplay, webMobileDisplay, pcDisplay } = data;
    return (
      <CSSTransitionGroup
        component={'div'}
        transitionName={'publishSettingsSlide'}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
      >
        {showEditPublishSetDialog ? (
          <Wrap className={''}>
            <WrapCon>
              <Icon
                icon="close"
                className="Gray_9d Font20 pointer right ThemeHoverColor2"
                onClick={this.props.onClose}
              />
              <h3 className="Font17 Bold InlineBlock">{_l('发布设置')}</h3>
              <h6 className="Font15 Bold">{_l('发布到组织工作台')}</h6>
              <p className="Gray_9 mTop12">{_l('设置用户在哪些设备环境下可见此应用，管理员在PC端始终可见')}</p>
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

              <h6 className="Font15 Bold borTopLine">{_l('发布到第三方')}</h6>
              {!md.global.Config.IsPlatformLocal && (
                <div className="publishAppCourse">
                  {_l('发布到')}
                  <span
                    className="ThemeHoverColor2"
                    onClick={() => {
                      this.getWXProjectSettingInfo();
                    }}
                  >
                    {_l('企业微信工作台')}
                  </span>
                </div>
              )}
              <div className="publishAppCourse">
                {_l('发布到')}
                <span
                  className="ThemeHoverColor2"
                  onClick={() => {
                    window.open(`/dingAppCourse/${projectId}/${appId}`);
                  }}
                >
                  {_l('钉钉工作台')}
                </span>
              </div>

              <h6 className="Font15 Bold borTopLine">{_l('应用维护')}</h6>
              <p className="Gray_9 mTop12">
                {_l('应用开启维护状态后，只有管理员可以访问应用进行更新维护，普通成员无法使用应用')}
              </p>
              <React.Fragment>
                {fixed && <div className="fixedCon">{_l('正在维护中...')}</div>}
                <span
                  className="editFixed InlineBlock Font13 Hand Bold ThemeHoverColor2"
                  onClick={() => {
                    onChangeFixStatus();
                  }}
                >
                  {fixed ? _l('更新维护状态') : _l('设为维护状态')}
                </span>
              </React.Fragment>
            </WrapCon>
            <div
              className="cover"
              onClick={() => {
                onClose();
              }}
            />
            {this.renderEnterpriseWechatModal()}
          </Wrap>
        ) : null}
      </CSSTransitionGroup>
    );
  }
}
// const mapStateToProps = state => ({
//   // appPkg: state.appPkg,
// });
// const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

// export default connect(mapStateToProps, mapDispatchToProps)(EditPublishSetDialog);
export default EditPublishSetDialog;
