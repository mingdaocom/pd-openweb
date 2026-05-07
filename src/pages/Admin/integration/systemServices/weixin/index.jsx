import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Button, Dialog, LoadDiv } from 'ming-ui';
import Ajax from 'src/api/project';
import { getRequest } from 'src/utils/common';
import Config from '../../../config';
import WeChatServiceAccountList from './WeChatServiceAccountList';
import './index.less';

const PRIVATE_CONFIG_OPTIONS = [
  {
    key: 'nickName',
    text: _l('服务号名称'),
    clickText: _l('取消绑定'),
    clickKey: 'unbind',
  },
  {
    key: 'appId',
    text: _l('开发者ID（AppID）'),
    clickText: _l('复制'),
    clickKey: 'copy',
    desc: _l('微信服务号管理后台-设置与开发-基本配置页面内的字段'),
  },
  {
    key: 'appSecret',
    text: _l('开发者密码(AppSecret)'),
    clickText: _l('复制'),
    clickKey: 'copy',
    desc: _l('微信服务号管理后台-设置与开发-基本配置页面内的字段'),
  },
];

const PLATFORM_CONFIG_OPTIONS = [
  { key: 'nickName', text: _l('服务号名称'), clickText: _l('取消绑定'), clickKey: 'unbind' },
  { key: 'appId', text: _l('AppID'), clickText: _l('复制'), clickKey: 'copy' },
  { key: 'funcInfo', text: _l('已授权权限'), clickText: _l('查看'), clickKey: 'view' },
  { key: 'principalName', text: _l('主体名称') },
];
const AUTH_OPTIONS = [
  { value: 2, text: _l('用户管理权限') },
  { value: 4, text: _l('网页服务权限') },
  { value: 7, text: _l('群发与通知权限') },
];

export default class WeiXin extends Component {
  constructor(props) {
    super(props);
    Config.setPageTitle(_l('集成 - 微信服务号'));
    this.state = {
      loading: false,
      weiXinInfo: [],
      currentWeiXinInfo: {},
      currentAppId: '',
    };
  }
  componentDidMount() {
    Config.setPageTitle(_l('微信服务号'));
    const { state, auth_code } = getRequest();

    if (window.platformENV.isPlatform && auth_code) {
      this.setState({ loading: true });
      projectAjax.callBackWeiXinBinding({ state, authCode: auth_code, projectId: Config.projectId }).then(res => {
        this.setState({ loading: false });
        if (res.flag) {
          location.href = `/admin/weixin/${Config.projectId}`;
        } else {
          alert(res.msg, 3);
        }
      });
    } else {
      this.getWeiXinInfo();
    }
  }

  getWeiXinInfo() {
    this.setState({ loading: true });
    Ajax.getWeiXinBindingInfo({ projectId: Config.projectId }).then(res => {
      this.setState({
        weiXinInfo: res,
        loading: false,
      });
    });
  }

  handleClick(clickKey, data = {}) {
    const { weiXinInfo } = this.state;

    if (clickKey === 'view') {
      const root = createRoot(document.createElement('div'));
      const options = {
        title: (
          <span>
            {_l('已授权权限列表')}
            <span className="Hand ThemeColor3 adminHoverColor Block Font13 mTop10" onClick={this.handleReset}>
              {_l('重新授权')}
            </span>
          </span>
        ),
        footer: null,
        visible: true,
        width: '480',
        className: 'weixinFuncInfoDialog',
        overlayClosable: false,
        onCancel: () => {
          root.unmount();
          $('.weixinFuncInfoDialog').parents('.mui-dialog-container').parents('div').remove();
        },
      };

      root.render(
        <Dialog {...options}>
          <ul>
            {AUTH_OPTIONS.map(item => {
              return (
                <li className={cx('mTop10 textPrimary', { Hidden: !_.includes(data.funcInfo || [], item.value) })}>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </Dialog>,
      );
    } else if (clickKey === 'unbind') {
      Dialog.confirm({
        title: <span className="Font17 Bold">{_l('取消绑定')}</span>,
        description: _l(
          '取消绑定后，本组织内与服务号所有相关信息将失效（包含但不限于外部用户、模板消息）请您谨慎操作。',
        ),
        onOk: () => {
          projectAjax.cancelBindingWeiXin({ appId: data.appId, projectId: Config.projectId }).then(result => {
            if (result) {
              alert(_l('成功取消绑定'));
              this.setState({ weiXinInfo: weiXinInfo.filter(item => item.appId !== data.appId), currentAppId: '' });
            } else {
              alert(_l('操作失败，请稍候重试！'), 2);
            }
          });
        },
      });
    }
  }

  handleReset = () => {
    Dialog.confirm({
      title: <span className="Font17 Bold">{_l('重新授权')}</span>,
      description: (
        <span>
          <span>{_l('1. 重新授权时不可换绑其他微信服务号，否则重新授权将失败；')}</span>
          <span className="Block">
            {_l('2. 为保证您在明道云功能的正常使用，授权时请保持默认选择，把开放平台账号管理权限统一授权给明道云')}
          </span>
        </span>
      ),
      onOk: () => {
        Ajax.bindingWeiXin({ projectId: Config.projectId }).then(res => {
          location.href = res;
        });
      },
    });
  };

  renderBindContent() {
    const { weiXinInfo = [], currentAppId } = this.state;
    const currentWeiXinInfo = weiXinInfo.filter(item => item.appId === currentAppId);
    const CONFIGS = window.platformENV.isPlatform ? PLATFORM_CONFIG_OPTIONS : PRIVATE_CONFIG_OPTIONS;

    return (
      <Fragment>
        {currentWeiXinInfo.map((item = {}) => {
          return (
            <Fragment key={item.appId}>
              {CONFIGS.map(i => {
                const value = item[i.key];

                const content =
                  i.key === 'appSecret'
                    ? value.length < 16
                      ? '*********'
                      : value.substr(0, 6) + '*********' + value.substr(value.length - 6)
                    : i.key === 'funcInfo'
                      ? ''
                      : value;

                return (
                  <div className="weixin-info-row" key={i.key}>
                    <span className="weixin-info-row-label">{i.text}</span>
                    <span
                      className={cx(i.key !== 'funcInfo' ? 'mRight8' : '', i.key === 'nickName' ? ' Font17 Bold' : '')}
                    >
                      {content}
                    </span>
                    {i.key === 'nickName' && <span className="weixin-info-tag">{_l('已认证')}</span>}
                    {i.clickKey === 'copy' ? (
                      <span
                        className="ThemeColor3 adminHoverColor Hand"
                        onClick={() => {
                          copy(item[i.key]);
                          alert(_l('复制成功'));
                        }}
                      >
                        {i.clickText}
                      </span>
                    ) : (
                      <span
                        className="ThemeColor3 adminHoverColor Hand"
                        onClick={() => this.handlePlatformClick(i.clickKey, item)}
                      >
                        {i.clickText}
                      </span>
                    )}
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </Fragment>
    );
  }

  render() {
    const { authLoading } = this.props;
    const { loading, currentAppId, weiXinInfo } = this.state;

    if (loading) {
      return (
        <div className="orgManagementWrap">
          <LoadDiv />
        </div>
      );
    }

    return (
      <div className="orgManagementWrap adminWeiXinContainer" ref={this.props.ref}>
        <div className="orgManagementHeader">
          <span className="Font17 Bold">
            <i
              className="icon-backspace Font22 ThemeHoverColor3 pointer mRight10"
              onClick={() => {
                if (currentAppId) {
                  this.setState({ currentAppId: '' });
                } else {
                  this.props.onBack();
                }
              }}
            />
            {_l('微信服务号')}
          </span>
          <Button type="primary" disabled={authLoading} onClick={this.props.handleBindWeiXin}>
            {authLoading ? (
              _l('授权中...')
            ) : (
              <span>
                <i className="icon-add mRight4" />
                {_l('绑定服务号')}
              </span>
            )}
          </Button>
        </div>
        <div className="orgManagementContent">
          {!currentAppId ? (
            <WeChatServiceAccountList
              weiXinInfo={weiXinInfo}
              authLoading={authLoading}
              handleClick={appId => this.setState({ currentAppId: appId })}
            />
          ) : (
            this.renderBindContent()
          )}
        </div>
      </div>
    );
  }
}
