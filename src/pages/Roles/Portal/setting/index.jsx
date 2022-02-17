import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Icon, Dialog } from 'ming-ui';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import styled from 'styled-components';
import cx from 'classnames';
import BaseSet from './BaseSet';
import InfoSet from './InfoSet';
import LoginSet from './LoginSet';
import TextMessage from './TextMessage';
import { editBaseSet, editLoginPageSet, saveUserControls, saveMessageSet } from 'src/api/externalPortal';
import { getStringBytes } from 'src/util';

const Wrap = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0px 12px 36px 0px rgba(0, 0, 0, 0.3);
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
    background: rgba(0, 0, 0, 0.1);
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
  background: #f5f5f5;
  position: absolute;
  bottom: 0;
  padding: 16px 24px;
  width: 100%;
  left: 0;
  right: 0;
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
    };
    this.saveRef = null;
  }

  closeSetFn = callback => {
    if (this.state.hasChange) {
      return Dialog.confirm({
        title: _l('您是否保存当前页的更改'),
        okText: _l('保存'),
        description: _l('当前有尚未保存的更改，您在离开当前页面前是否需要保存这些更改。'),
        onOk: () => {
          this.saveRef && $(this.saveRef).click();
          this.setState(
            {
              hasChange: false,
            },
            () => {
              this.state.type === 0 && this.props.callback();
              callback && callback();
            },
          );
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
  render() {
    const { show, closeSet, getControls, appId } = this.props;
    const { type } = this.state;
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
                      this.closeSetFn(() => this.setState({ type: i }));
                    }}
                  >
                    {o}
                  </li>
                );
              })}
            </ul>
            <Component
              hasChange={() => {
                this.setState({
                  hasChange: true,
                });
              }}
              {...this.props}
              footor={(data, cb) => {
                return (
                  <WrapCon className="Con">
                    <span
                      ref={textarea => {
                        this.saveRef = textarea;
                      }}
                      className={cx('saveBtn Hand', { disable: this.state.name === '' || this.state.saveLoading })}
                      onClick={() => {
                        let fn = null;
                        if (type === 0) {
                          fn = editBaseSet;
                        } else if (type === 2) {
                          if (!data.pageTitle) {
                            return alert(_l('请输入登录页名称'), 3);
                          }
                          fn = editLoginPageSet;
                        } else if (type === 1) {
                          fn = saveUserControls;
                        } else if (type === 3) {
                          fn = saveMessageSet;
                          if (!data.smsSignature) {
                            return alert(_l('请输入短信签名'), 3);
                          }
                          if (!/^[\u4E00-\u9FA5A-Za-z]+$/.test(data.smsSignature)) {
                            return alert(_l('只支持中英文'));
                          }
                          if (getStringBytes(data.smsSignature) > 16) {
                            return alert(_l('最多只能16个字节'));
                          }
                        }
                        this.setState({
                          saveLoading: true,
                        });
                        fn({ ...data }).then(
                          res => {
                            this.setState({ hasChange: false });
                            if (type === 1 && res.code === 1) {
                              cb && cb();
                            }
                            alert(_l('保存成功'));
                            this.setState(
                              {
                                saveLoading: false,
                              },
                              () => {
                                type === 0 && this.props.callback();
                                type === 1 && getControls(appId);
                              },
                            );
                          },
                          () => {
                            this.setState({
                              saveLoading: false,
                            });
                          },
                        );
                      }}
                    >
                      {
                        //this.state.saveLoading ? _l('保存设置...') :
                        _l('保存设置')
                      }
                    </span>
                    <span
                      className="cancelBtn Hand"
                      onClick={() => {
                        this.closeSetFn(() => closeSet());
                      }}
                    >
                      {_l('取消')}
                    </span>
                  </WrapCon>
                );
              }}
            />
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
