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
          position: relative;
          img {
            position: absolute;
            left: 50%;
            transform: translate(-50%, 0);
          }
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
          // ??????????????????????????????
          this.setState({ integratedWechat: true });
        } else {
          // ?????????????????????????????????
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
        alert(_l('??????????????????'));
      } else {
        alert(_l('??????????????????'), 2);
      }
    });
    this.setState({ integratedWechat: false });
  };
  renderEnterpriseWechatModal = () => {
    let { integratedWechat, noIntegratedWechat } = this.state;
    const { appName } = this.props;
    if (integratedWechat) {
      // ?????????
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
            <div className="Font24 Blod mTop50">{_l('??????????????????????????????????????????')}</div>
            <div className="flexRow mTop30">
              <sapn className=" colorGray mRight18">{_l('??????')}</sapn>
              <span>{appName}</span>
            </div>
            <div className="submitBtn" onClick={this.submitApply}>
              {_l('????????????')}
            </div>
            <div className="connectInfo mTop16">
              {_l('??????????????????????????????????????????????????????,???????????????????????? ???????????????400-665-6655')}
            </div>
          </div>
        </Modal>
      );
    } else if (noIntegratedWechat) {
      // ?????????
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
            <div className="Font24 Blod mTop50">{_l('??????????????????????????????')}</div>
            <div className="mTop30 colorGray Font14">{_l('??????????????????????????????????????????????????????????????????')}</div>
            <div className="settingBtn" onClick={this.toSetEnterpirse}>
              {_l('????????????')}
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
        alert(_l('??????????????????????????????', 3));
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
              <h3 className="Font17 Bold InlineBlock">{_l('????????????')}</h3>
              <h6 className="Font15 Bold">{_l('????????????????????????')}</h6>
              <p className="Gray_9 mTop12">{_l('??????????????????????????????????????????????????????????????????PC???????????????')}</p>
              <div className="con">
                <ul>
                  {[1, 2, 3].map(o => {
                    let cur = false;
                    let s = o;
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
                        <div className={cx('imgCon Hand')}>
                          <img
                            className="imgcur"
                            height={43}
                            src={require(`src/pages/PageHeader/AppPkgHeader/AppDetail/img/${s}.png`)}
                          />
                        </div>
                        <Switch size="small" checked={!cur} />
                        <span className="mLeft6 TxtMiddle Hand">
                          {o === 1 ? _l('PC???') : o === 2 ? _l('Web?????????') : _l('App')}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <h6 className="Font15 Bold borTopLine">{_l('??????????????????')}</h6>
              <div className="publishAppCourse">
                {_l('?????????')}
                <span
                  className="ThemeHoverColor2"
                  onClick={() => {
                    this.getWXProjectSettingInfo();
                  }}
                >
                  {_l('?????????????????????')}
                </span>
              </div>
              <div className="publishAppCourse">
                {_l('?????????')}
                <span
                  className="ThemeHoverColor2"
                  onClick={() => {
                    window.open(`/dingAppCourse/${projectId}/${appId}`);
                  }}
                >
                  {_l('???????????????')}
                </span>
              </div>

              <h6 className="Font15 Bold borTopLine">{_l('????????????')}</h6>
              <p className="Gray_9 mTop12">
                {_l('??????????????????????????????????????????????????????????????????????????????????????????????????????????????????')}
              </p>
              <React.Fragment>
                {fixed && <div className="fixedCon">{_l('???????????????...')}</div>}
                <span
                  className="editFixed InlineBlock Font13 Hand Bold ThemeHoverColor2"
                  onClick={() => {
                    onChangeFixStatus();
                  }}
                >
                  {fixed ? _l('??????????????????') : _l('??????????????????')}
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
