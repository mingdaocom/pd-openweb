import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/PortalCon/redux/actions';
import { Icon, Dialog } from 'ming-ui';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import styled from 'styled-components';
import cx from 'classnames';
import BaseSet from './BaseSet';
import InfoSet from './InfoSet';
import LoginSet from './LoginSet';
import TextMessage from './TextMessage';
import externalPortalAjax from 'src/api/externalPortal';
import { getStringBytes } from 'src/util';
import { getStrBytesLength } from 'src/pages/Role/PortalCon/tabCon/util-pure.js';
import _ from 'lodash';

const Wrap = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-flow: column nowrap;
  width: 640px;
  background: #fff;
  .cover {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 640px;
    background: rgba(0, 0, 0, 0.7);
    z-index: -1;
  }
  .header {
    padding: 24px 24px 16px;
    display: flex;
    & > span {
      flex: 1;
      font-size: 17px;
      font-weight: 500;
    }
  }
  .conTab {
    border-bottom: 1px solid #eaeaea;
    padding-left: 8px;
    li {
      display: inline-block;
      margin: 0 16px;
      position: relative;
      padding-bottom: 13px;
      font-size: 14px;
      font-weight: 500;
      color: #757575;
      &:hover {
        color: #2196f3;
      }
      &.current {
        color: #2196f3;
        &::before {
          content: ' ';
          width: 100%;
          height: 3px;
          background: #2196f3;
          border-radius: 2px;
          display: inline-block;
          position: absolute;
          left: 0;
          bottom: 0;
        }
      }
    }
  }
`;
const WrapCon = styled.div`
  background: #fff;
  position: absolute;
  bottom: 0;
  padding: 16px 24px;
  width: 100%;
  left: 0;
  right: 0;
  z-index: 2;
  .saveBtn {
    display: inline-block;
    height: 36px;
    padding: 0 24px;
    border-radius: 3px;
    box-sizing: border-box;
    line-height: 36px;
    cursor: pointer;
    background: #2196f3;
    color: #fff;
    &:hover {
      background-color: #1565c0;
    }
    &.disable {
      opacity: 0.5;
    }
  }
  .cancelBtn {
    display: inline-block;
    height: 36px;
    border-radius: 3px;
    box-sizing: border-box;
    line-height: 36px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #2196f3;
    color: #2196f3;
    margin-left: 16px;
    padding: 0 32px;
    width: auto;
  }
  .closePortal {
    line-height: 36px;
    color: #9e9e9e;
    &:hover {
      color: #f44336;
    }
  }
`;
const SETTYPE = [_l('基础设置'), _l('信息收集'), _l('自定义登录界面'), _l('消息设置')];
const TYPE_TO_COMP = [BaseSet, InfoSet, LoginSet, TextMessage];

class PortalSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 0,
      saveLoading: false,
      hasChange: false,
      portalSet: {},
    };
    this.saveRef = null;
  }

  componentDidMount() {
    const { portalSet = {} } = this.props;
    this.setState({
      portalSet,
    });
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(this.props.portalSet, nextProps.portalSet)) {
      this.setState({
        portalSet: nextProps.portalSet,
      });
    }
  }

  closeSetFn = callback => {
    if (this.state.hasChange) {
      return Dialog.confirm({
        title: _l('您是否保存当前页的更改'),
        okText: _l('保存'),
        width: 440,
        description: _l('当前有尚未保存的更改，您在离开当前页面前是否需要保存这些更改。'),
        onOk: () => {
          this.saveRef && $(this.saveRef).click();
        },
        onCancel: () => {
          this.setState(
            {
              hasChange: false,
            },
            () => {
              callback && callback();
            },
          );
        },
      });
    } else {
      callback && callback();
    }
  };

  closePortal = () => {
    return Dialog.confirm({
      title: _l('关闭后所有人将不能再访问门户'),
      okText: _l('关闭门户'),
      width: 480,
      onOk: () => {
        this.props.closePortal();
      },
      buttonType: 'danger',
    });
  };

  editPortal = noClose => {
    const { portalSet = {} } = this.state;
    const { projectId, closeSet } = this.props;
    const { portalSetModel = {}, controlTemplate = {}, authorizerInfo = {}, epDiscussWorkFlow = {} } = portalSet;
    let mdSign = getStrBytesLength(
      ((_.get(md, ['global', 'Account', 'projects']) || []).find(o => o.projectId === projectId) || {}).companyName,
    );
    const {
      pageTitle = '',
      smsSignature = mdSign,
      allowUserType,
      noticeScope = {},
      pageMode,
      backGroundType,
      backColor,
      logoImagePath,
      backImagePath,
      appId,
      customizeName,
    } = portalSetModel;
    if (!customizeName) {
      return alert(_l('请输入外部门户名称'), 3);
    }
    if (!pageTitle) {
      return alert(_l('请输入登录页名称'), 3);
    }
    if (!smsSignature) {
      return alert(_l('请输入短信签名'), 3);
    }
    if (!/^[\u4E00-\u9FA5A-Za-z]+$/.test(smsSignature)) {
      return alert(_l('短信签名只支持中英文'));
    }
    if (getStringBytes(smsSignature) > 16) {
      return alert(_l('短信签名最多只能16个字节'));
    }
    if (!noClose) {
      this.setState({
        saveLoading: true,
      });
    }
    externalPortalAjax
      .editPortalSet({
        appId,
        portalSet: {
          ..._.pick(portalSetModel, [
            'inviteSms',
            'refusedSms',
            'approvedSms',
            'termsAndAgreementEnable',
            'userAgreement',
            'privacyTerms',
            'customizeName',
            'exAccountDiscussEnum',
            'allowExAccountDiscuss',
            'loginMode',
            'registerMode',
            'subscribeWXOfficial',
            'emailSignature',
            'approvedEmail',
            'refusedEmail',
            'inviteEmail',
          ]),
          epDiscussWorkFlow,
          appId,
          allowUserType,
          noticeScope,
          wxAppId: authorizerInfo.appId,
          pageTitle,
          logoImageBucket: 4,
          logoImagePath,
          pageMode,
          backGroundType,
          backColor,
          backImageBucket: 4,
          backImagePath,
          smsSignature,
        },
        worksheetControls: {
          ...controlTemplate,
          controls: controlTemplate.controls.filter(o => !!o.type),
          appId,
        },
      })
      .then(
        res => {
          if (res.success) {
            this.props.onChangePortal(res.portalSetModelDTO);
            this.setState({ hasChange: false, saveLoading: false });
            if (!noClose) {
              alert(_l('保存成功'));
              closeSet();
            }
          } else {
            alert(_l('保存失败，请稍后再试'), 3);
          }
        },
        () => {
          this.setState({
            saveLoading: false,
          });
        },
      );
  };
  render() {
    const { show, closeSet, getControls, appId } = this.props;
    const { type, portalSet = {} } = this.state;
    const Component = TYPE_TO_COMP[type];

    return (
      <CSSTransitionGroup
        component={'div'}
        transitionName={'roleSettingSlide'}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
      >
        {show ? (
          <Wrap className={''}>
            <div className="header">
              <span className="">{_l('门户设置')}</span>
              <Icon
                icon="close"
                className="Right LineHeight25 Gray_9 Hand Font22 ThemeHoverColor3"
                onClick={() => {
                  this.closeSetFn(() => {
                    closeSet();
                  });
                }}
              />
            </div>
            <ul className="conTab">
              {SETTYPE.map((o, i) => {
                return (
                  <li
                    className={cx('Hand', { current: i === type })}
                    onClick={() => {
                      this.setState({ type: i });
                    }}
                  >
                    {o}
                  </li>
                );
              })}
            </ul>
            <Component
              {...this.props}
              portalSet={portalSet || {}}
              onChangePortalSet={(data, isChange = true) => {
                this.setState({
                  hasChange: isChange,
                  portalSet: { ...portalSet, ...data },
                });
              }}
              onSave={() => {
                this.editPortal(true);
              }}
              onChangeImg={data => {
                this.setState({
                  hasChange: true,
                  portalSet: {
                    ...this.state.portalSet,
                    portalSetModel: {
                      ...this.state.portalSet.portalSetModel,
                      ...data,
                    },
                  },
                });
              }}
            />
            <WrapCon className="Con">
              <span
                ref={textarea => {
                  this.saveRef = textarea;
                }}
                className={cx('saveBtn Hand', { disable: this.state.name === '' || this.state.saveLoading })}
                onClick={() => {
                  this.editPortal();
                }}
              >
                {_l('保存设置')}
              </span>
              <span
                className="cancelBtn Hand"
                onClick={() => {
                  this.closeSetFn(() => closeSet());
                }}
              >
                {_l('取消')}
              </span>
              <span className="closePortal Hand Right Bold" onClick={this.closePortal}>
                {_l('关闭门户')}
              </span>
            </WrapCon>
            <div className="cover"></div>
          </Wrap>
        ) : null}
      </CSSTransitionGroup>
    );
  }
}
const mapStateToProps = state => ({
  portal: state.portal,
  visible: state.chat.visible,
  appPkg: state.appPkg,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PortalSetting);
