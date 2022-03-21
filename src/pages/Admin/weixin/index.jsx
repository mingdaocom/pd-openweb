import React, { Component, Fragment } from 'react';
import ClipboardButton from 'react-clipboard.js';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { Button, Input, Form, Modal } from 'antd';
import { addTpAuthorizerInfo, getWeiXinBindingInfo, cancelBindingWeiXin } from 'src/api/project';
import Config from '../config';
import cx from 'classnames';
import './index.less';

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
    };
  }
  componentDidMount() {
    Config.setPageTitle(_l('微信公众号'));
    this.getWeiXinBindingInfo();
  }
  getWeiXinBindingInfo = () => {
    this.setState({ loading: true });
    getWeiXinBindingInfo({ projectId: Config.projectId }).then(res => {
      this.setState({ loading: false });
      if (_.isArray(res) && res.length) {
        this.setState({
          isBind: true,
          name: res[0].nickName,
          appId: res[0].appId,
          appSecret: res[0].appSecret,
        });
      }
    });
  };
  submmit = () => {
    let { name, appId, appSecret } = this.state;
    addTpAuthorizerInfo({ projectId: Config.projectId, name, appId, appSecret }).then(res => {
      if (res) {
        this.getWeiXinBindingInfo();
      }
    });
  };
  handleClick = () => {
    this.setState({ cancelBindVisible: true });
  };
  changeFormData = (e, item) => {
    let value = e.target.value;
    this.setState({
      [item.key]: value,
    });
  };
  cancelBind = () => {
    let { appId } = this.state;
    cancelBindingWeiXin({ appId }).then(res => {
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
  renderApplyContent = () => {
    return (
      <Fragment>
        <span className="icon-wechat icon"></span>
        <div className="subTitle fontWeight600">{_l('绑定微信公众号')}</div>
        <div className="desTxt">
          {_l(
            '绑定公众号后，外部门户将可以通过指定的域名获取该服务号下微信用户的授权及openID，可以通过工作流为外部的微信用户推送模板消息',
          )}
        </div>
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
        <div className="descriptions">
          <div className="descriptionsInfo">
            {_l('1.为了可以获取到 openID及基本信息 或使用模版消息功能必须选择 ')}
            <span className="Bold">{_l('已认证的微信服务号')}</span>
          </div>
          <div className="descriptionsInfo">
            {_l('2.为获取微信授权需要将您公司的访问域名加入到公众号的网页授权域名内')}
          </div>
        </div>
      </Fragment>
    );
  };
  renderSuccessContent = () => {
    let { appSecret, appId, name } = this.state;
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
