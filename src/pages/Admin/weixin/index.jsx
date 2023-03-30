import React, { Component, Fragment } from 'react';
import ClipboardButton from 'react-clipboard.js';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ReactDom from 'react-dom';
import { Button, Input, Form, Modal } from 'antd';
import { Dialog } from 'ming-ui';
import projectAjax from 'src/api/project';
import { getRequest } from 'src/util';
import Config from '../config';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const CONFIG_OPTIONS = [
  { key: 'name', text: _l('公众号名称'), clickText: _l('取消绑定'), clickKey: 'unbind' },
  {
    key: 'appId',
    text: _l('开发者ID（AppID）'),
    clickText: _l('复制'),
    clickKey: 'copy',
    private: true,
    desc: _l('微信公众号管理后台-设置与开发-基本配置页面内的字段'),
  },
  {
    key: 'appSecret',
    text: _l('开发者密码(AppSecret)'),
    clickText: _l('复制'),
    clickKey: 'copy',
    private: true,
    desc: _l('微信公众号管理后台-设置与开发-基本配置页面内的字段'),
  },
];
const FORM_CONFIG = [
  { key: 'name', label: _l('公众号名称'), type: 'text' },
  {
    key: 'appId',
    label: _l('开发者ID（AppID）'),
    type: 'text',
    description: _l('微信公众号管理后台-设置与开发-基本配置页面内的字段'),
  },
  {
    key: 'appSecret',
    label: _l('开发者密码(AppSecret)'),
    type: 'password',
    description: _l('微信公众号管理后台-设置与开发-基本配置页面内的字段'),
  },
];
const PLATFORM_CONFIG_OPTIONS = [
  { key: 'nickName', text: _l('公众号名称'), clickText: _l('取消绑定'), clickKey: 'unbind' },
  { key: 'appId', text: _l('AppID'), clickText: _l('复制'), clickKey: 'copy' },
  { key: 'funcInfo', text: _l('已授权权限'), clickText: _l('查看'), clickKey: 'view' },
  { key: 'principalName', text: _l('主体名称') },
];
const AUTH_OPTIONS = [
  { value: 2, text: _l('用户管理权限 ') },
  { value: 4, text: _l('网页服务权限') },
  { value: 7, text: _l('群发与通知权限') },
];

export default class WeiXin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isBind: false,
      name: '',
      appId: '',
      appSecret: '',
      cancelBindVisible: false,
      loading: false,
      weixinInfo: [],
    };
  }
  componentDidMount() {
    Config.setPageTitle(_l('微信公众号'));
    const { state, auth_code } = getRequest();
    if (md.global.Config.IsPlatformLocal && auth_code) {
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
      this.getWeiXinBindingInfo();
    }
  }
  getWeiXinBindingInfo = () => {
    this.setState({ loading: true });
    projectAjax.getWeiXinBindingInfo({ projectId: Config.projectId }).then(res => {
      this.setState({ loading: false });
      if (_.isArray(res) && res.length) {
        this.setState({
          isBind: true,
          name: res[0].nickName,
          appId: res[0].appId,
          appSecret: res[0].appSecret,
          weixinInfo: res,
        });
      }
    });
  };
  submmit = () => {
    let { name, appId, appSecret } = this.state;
    projectAjax.addTpAuthorizerInfo({ projectId: Config.projectId, name, appId, appSecret }).then(res => {
      if (res) {
        this.getWeiXinBindingInfo();
      }
    });
  };
  handleClick = () => {
    this.setState({ cancelBindVisible: true });
  };
  // 重新授权
  handleReset() {
    Dialog.confirm({
      title: <span className="Font17 Bold">{_l('重新授权')}</span>,
      description: (
        <span>
          <span>{_l('1. 重新授权时不可换绑其他微信公众号，否则重新授权将失败；')}</span>
          <span className="Block">
            {_l('2. 为保证功能的正常使用，授权时请保持默认选择，把开放平台账号管理权限统一授权给此系统')}
          </span>
        </span>
      ),
      onOk: () => {
        projectAjax.bindingWeiXin({ projectId: Config.projectId }).then(res => {
          location.href = res;
        });
      },
    });
  }
  handlePlatformClick(clickKey, data = {}) {
    if (clickKey === 'view') {
      const options = {
        title: (
          <span>
            {_l('已授权权限列表')}
            <span className="Hand ThemeColor3 adminHoverColor Block Font13 mTop10" onClick={() => this.handleReset()}>
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
          $('.weixinFuncInfoDialog')
            .parents('.mui-dialog-container')
            .parents('div')
            .remove();
        },
      };
      ReactDom.render(
        <Dialog {...options}>
          <ul>
            {AUTH_OPTIONS.map(item => {
              return (
                <li className={cx('mTop10 Gray', { Hidden: !_.includes(data.funcInfo || [], item.value) })}>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </Dialog>,
        document.createElement('div'),
      );
    } else if (clickKey === 'unbind') {
      Dialog.confirm({
        title: <span className="Font17 Bold">{_l('取消绑定')}</span>,
        description: _l(
          '取消绑定后，本组织内与公众号所有相关信息将失效（包含但不限于外部用户、模板消息）请您谨慎操作。',
        ),
        onOk: () => {
          projectAjax.cancelBindingWeiXin({ appId: data.appId }).then(result => {
            if (result) {
              alert(_l('成功取消绑定'));
              this.setState({ isBind: false, weixinInfo: [] });
            } else {
              alert(_l('操作失败，请稍候重试！'), 2);
            }
          });
        },
      });
    }
  }
  changeFormData = (e, item) => {
    let value = e.target.value;
    this.setState({
      [item.key]: value,
    });
  };
  cancelBind = () => {
    let { appId } = this.state;
    projectAjax.cancelBindingWeiXin({ appId }).then(res => {
      this.setState({ cancelBindVisible: false });
      if (res) {
        alert(_l('取消成功'), 1);
        this.setState({ isBind: false });
      } else {
        alert(_l('取消失败'), 2);
      }
    });
  };
  renderCancelBindModal = () => {
    let { cancelBindVisible } = this.state;
    return (
      <Modal
        wrapClassName="cancelBindModal"
        closable={false}
        visible={cancelBindVisible}
        title={<span className="Font17 Bold">{_l('取消绑定')}</span>}
        onCancel={() => this.setState({ cancelBindVisible: false })}
        footer={
          <div className="opareationBtns">
            <Button className="cancelBtn" onClick={() => this.setState({ cancelBindVisible: false })}>
              取消
            </Button>
            <Button type="primary" className="confirmBtn" onClick={this.cancelBind}>
              确认
            </Button>
          </div>
        }
      >
        <div className="content">
          {_l('取消授权，本组织公众号所有相关信息将失效（包含但不限于外部用户、模板消息）请您谨慎操作。')}
        </div>
      </Modal>
    );
  };
  handleBind = () => {
    projectAjax.bindingWeiXin({ projectId: Config.projectId }).then(res => {
      location.href = res;
    });
  };
  renderApplyContent = () => {
    const isPlatformLocal = md.global.Config.IsPlatformLocal;
    return (
      <Fragment>
        <span className="icon-wechat icon" />
        <div className="subTitle fontWeight600">{_l('绑定微信公众号')}</div>
        <div className="desTxt">
          {_l(
            '绑定公众号后，外部门户将可以通过指定的域名获取该服务号下微信用户的授权及openID，可以通过工作流为外部的微信用户推送模板消息',
          )}
        </div>
        {!isPlatformLocal && (
          <div className="formGroup">
            <Form
              labelCol={{ span: 24 }}
              wrapperCol={{ span: 24 }}
              // initialValues={{ remember: true }}
              // onFinishFailed={onFinishFailed}
              autoComplete="off"
              onFinish={this.submmit}
            >
              {FORM_CONFIG.map(item => (
                <Fragment>
                  <Form.Item
                    label={item.label}
                    name={item.label}
                    rules={[{ required: true, message: `请输入${item.label}` }]}
                  >
                    {item.type == 'text' ? (
                      <Input onChange={e => this.changeFormData(e, item)} />
                    ) : (
                      <Input.Password
                        autoComplete="new-password"
                        onChange={e => this.changeFormData(e, item)}
                        visibilityToggle={false}
                      />
                    )}
                  </Form.Item>
                  {item.description && <div className="description">{item.description}</div>}
                </Fragment>
              ))}
              <Form.Item>
                <Button type="primary" className="submit" type="primary" htmlType="submit">
                  {_l('提交')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        {!isPlatformLocal && (
          <div className="descriptions">
            <div className="descriptionsInfo">
              {_l('1.为了可以获取到 openID及基本信息 或使用模版消息功能必须选择 ')}
              <span className="Bold">{_l('已认证的微信服务号')}</span>
            </div>
            <div className="descriptionsInfo">
              {_l('2.为获取微信授权需要将您公司的访问域名加入到公众号的网页授权域名内')}
            </div>
          </div>
        )}
        {isPlatformLocal && (
          <div>
            <div className="bindBtn" onClick={() => this.handleBind()}>
              {_l('立即授权')}
            </div>
            <span className="TxtCenter Width300">
              <span className="Gray_9e mLeft3">{_l('为了可以获取到 OpenID 及基本信息或')}</span>
              <br />
              <span className="Gray_9e">{_l('使用模板消息功能必须选择')}</span>
              <span className="Bold">{_l('已认证的企业服务号')}</span>
            </span>
          </div>
        )}
      </Fragment>
    );
  };
  renderPlatformContent = () => {
    const { weixinInfo = [] } = this.state;
    return (
      <Fragment>
        {weixinInfo.map((item = {}) => {
          return (
            <Fragment>
              {PLATFORM_CONFIG_OPTIONS.map(i => {
                return (
                  <div className="weixin-info-row">
                    <span className="weixin-info-row-label">{i.text}</span>
                    <span
                      className={cx(i.key !== 'funcInfo' ? 'mRight8' : '', i.key === 'nickName' ? ' Font17 Bold' : '')}
                    >
                      {i.key === 'funcInfo' ? '' : item[i.key]}
                    </span>
                    {i.key === 'nickName' && <span className="weixin-info-tag">{_l('已认证')}</span>}
                    {i.clickKey === 'copy' ? (
                      <ClipboardButton
                        component="span"
                        data-clipboard-text={item[i.key]}
                        onSuccess={() => {
                          alert(_l('复制成功'));
                        }}
                      >
                        <span className="ThemeColor3 adminHoverColor Hand">{i.clickText}</span>
                      </ClipboardButton>
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
  };
  renderSuccessContent = () => {
    if (md.global.Config.IsPlatformLocal) {
      return this.renderPlatformContent();
    }
    return (
      <Fragment>
        {CONFIG_OPTIONS.map(item => {
          let value = this.state[item.key];
          let content =
            item.key !== 'appSecret'
              ? value
              : value.length < 16
              ? '*********'
              : value.substr(0, 6) + '*********' + value.substr(value.length - 6);
          return (
            <div className="wechatSuccessRow" key={item.key}>
              <div className="wechatSuccessLabel">{item.text}</div>
              <div className="wechatSuccessValue">
                <span className={cx('mRight10', item.key === 'name' ? 'Font17 Bold' : '')}>{content}</span>
                {item.clickKey === 'copy' ? (
                  <ClipboardButton
                    component="span"
                    data-clipboard-text={[this.state[item.key]]}
                    onSuccess={() => {
                      alert(_l('复制成功'));
                    }}
                  >
                    <span className="ThemeColor3 adminHoverColor Hand">{item.clickText}</span>
                  </ClipboardButton>
                ) : (
                  <span
                    className="ThemeColor3 adminHoverColor Hand"
                    onClick={() => this.handleClick(item.clickKey, item)}
                  >
                    {item.clickText}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </Fragment>
    );
  };
  render() {
    let { isBind, loading } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <div className="wechatContainer">
        <div className="pageTitle fontWeight600">{_l('微信公众号')}</div>
        <div className="wechatInfo flex">
          {isBind ? (
            <div className="wechatSuccessContent">{this.renderSuccessContent()}</div>
          ) : (
            <div className="wechatApplyContent">{this.renderApplyContent()}</div>
          )}
          {this.renderCancelBindModal()}
        </div>
      </div>
    );
  }
}
