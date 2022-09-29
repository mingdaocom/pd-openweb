import React, { Component, Fragment } from 'react';
import { Icon, Switch, LoadDiv, Support } from 'ming-ui';
import { Input, Select, Checkbox, Button } from 'antd';
import cx from 'classnames';
import './index.less';
import { formListTop, formListBottom } from './form.config.js';
import projectSettingController from 'src/api/projectSetting';
import Config from '../config';
import ViewKeyDialog from './ViewKey';
import { getFeatureStatus, buriedUpgradeVersionDialog, encrypt } from 'src/util';

const FEATURE_ID = 15;
const API_PROXY_FEATURE_ID = 22;

const headerTitle = {
  index: _l('其他'),
  effective: _l('LDAP用户目录'),
  webProxy: _l('API网络代理'),
};
const ipRegExp =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;
const portRegExp = new RegExp(
  /^([1-9](\d{0,3}))$|^([1-5]\d{4})$|^(6[0-4]\d{3})$|^(65[0-4]\d{2})$|^(655[0-2]\d)$|^(6553[0-5])$/,
);

export default class OtherTool extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('其他'));
    this.state = {
      level: 'index', //index | effective | key
      keyVisible: false,
      //ldap
      effective: false,
      webProxy: false,
      type: 0,
      port: 389,
      serverIP: '',
      user: '',
      password: '',
      domainPath: '',
      enableSSL: '',
      searchFilter: '',
      emailAttr: '',
      fullnameAttr: '',
      departmentAttr: '',
      jobAttr: '',
      workphoneAttr: '',
      saveDisabled: false,
      loading: false,
      isSaveWebProxy: false,
    };
  }

  componentDidMount() {
    this.getSettings();
    this.getApiProxyState();
  }

  getSettings() {
    this.setState({ loading: true });
    projectSettingController
      .getProjectLdapSetting({
        projectId: Config.projectId,
      })
      .then(data => {
        if (data) {
          this.setState({
            effective: data.effective,
            type: data.type || '',
            serverIP: data.serverIP,
            port: data.port,
            user: data.user,
            password: data.password,
            domainPath: data.domainPath,
            enableSSL: data.enableSSL,
            searchFilter: data.searchFilter || '',
            emailAttr: data.emailAttr || '',
            fullnameAttr: data.fullnameAttr || '',
            departmentAttr: data.departmentAttr || '',
            jobAttr: data.jobAttr || '',
            workphoneAttr: data.workphoneAttr || '',
            loading: false,
          });
        }
      });
  }

  getApiProxyState = () => {
    const apiProxyFeatureType = getFeatureStatus(Config.projectId, API_PROXY_FEATURE_ID);
    if (!apiProxyFeatureType) return;
    projectSettingController.getApiProxyState({ projectId: Config.projectId }).then(res => {
      this.setState({ webProxy: res });
    });
  };

  //更新ldap状态
  updateLDAPState() {
    projectSettingController
      .updateLdapState({
        isEffect: this.state.effective,
        projectId: Config.projectId,
      })
      .then(data => {
        if (!data) {
          alert(_l('操作失败'), 3);
        }
      });
  }

  updateWebProxyState = () => {
    projectSettingController
      .setApiProxyState({
        projectId: Config.projectId,
        state: this.state.webProxy,
      })
      .then(res => {
        if (!res) {
          alert(_l('操作失败'), 2);
        }
      });
  };

  enableForm(key) {
    this.setState(
      {
        [key]: !this.state[key],
      },
      () => {
        if (key === 'effective') {
          this.updateLDAPState();
        }
        if (key === 'webProxy') {
          this.updateWebProxyState();
        }
      },
    );
  }

  toggleComp(level) {
    this.setState({ level, isSaveWebProxy: false });
  }

  handleUpdateItem(e, key) {
    this.setState({
      [key]: e.target.value,
    });
  }

  handleUpdateItemSelect(value) {
    this.setState({
      type: value,
      searchFilter: value === '1' ? 'sAMAccountName' : 'cn',
      emailAttr: 'mail',
      fullnameAttr: 'displayName',
    });
  }

  handleUpdateItemCheck(e) {
    this.setState({
      enableSSL: e.target.checked,
      port: e.target.checked ? 636 : 389,
    });
  }

  selectTypeComp = key => {
    return (
      <Select
        className={`errorInput${key}`}
        value={this.state[key] + ''}
        placeholder={_l('请选择用户目录类型')}
        onChange={this.handleUpdateItemSelect.bind(this)}
        onFocus={this.clearError.bind(this, key)}
      >
        <Select.Option value="1">{_l('Microsoft Active Directory')}</Select.Option>
        <Select.Option value="2">{_l('Novell eDirectory Server')}</Select.Option>
        <Select.Option value="3">{_l('OpenLDAP')}</Select.Option>
        <Select.Option value="4">{_l('Generic Directory Server')}</Select.Option>
        <Select.Option value="5">{_l('Sun Directory Server Premium Edition')}</Select.Option>
      </Select>
    );
  };

  handleCheck() {
    let isChecked = false;
    const list = formListTop.concat(formListBottom);
    list &&
      list.map(({ key, errorMsg }) => {
        if (errorMsg) {
          if (!this.state[key]) {
            isChecked = false;
            $(`.errorInput${key}`).addClass('errorInput');
            $(`#errorMsg${key}`).text(errorMsg);
          } else {
            if (key === 'port' && isNaN(this.state.port)) {
              isChecked = false;
              $(`.errorInputport`).addClass('errorInput');
              $('#errorMsgport').text(_l('端口号必须为数字'));
            } else {
              isChecked = true;
            }
          }
        }
      });
    return isChecked;
  }

  clearError(key) {
    $(`.errorInput${key}`).removeClass('errorInput');
    $(`#errorMsg${key}`).text('');
  }

  renderCompType(key, compType = 'input') {
    switch (compType) {
      case 'select':
        return this.selectTypeComp(key);
      case 'password':
        return (
          <Input.Password
            className={`passwordInput errorInput${key}`}
            autocomplete="new-password"
            value={this.state[key]}
            onChange={e => this.handleUpdateItem(e, key)}
            onFocus={this.clearError.bind(this, key)}
          />
        );
      case 'input':
        return (
          <Input
            className={`errorInput${key}`}
            value={this.state[key]}
            onChange={e => this.handleUpdateItem(e, key)}
            onFocus={this.clearError.bind(this, key)}
          />
        );
    }
  }

  renderFormCommon(list) {
    return (
      <Fragment>
        {list &&
          list.map(({ label, key, compType, errorMsg, desc }) => {
            return (
              <div className="formItem" key={key}>
                <div className="formLabel">
                  <span className={cx('TxtMiddle Red', errorMsg ? '' : 'hidden')}>*</span>
                  {label}
                </div>
                <div className="formRight">
                  <div className="formInput">
                    {this.renderCompType(key, compType)}
                    {desc === 'enableSSL' ? (
                      <Checkbox
                        className="mLeft16"
                        checked={this.state[desc]}
                        onChange={e => this.handleUpdateItemCheck(e, key)}
                      >
                        {_l('使用安全链接')}
                      </Checkbox>
                    ) : (
                      <span className="formItemDesc">{desc}</span>
                    )}
                  </div>
                  <div className="errorMsg" id={'errorMsg' + key}></div>
                </div>
              </div>
            );
          })}
      </Fragment>
    );
  }

  renderLdap() {
    return (
      <div className="formBox">
        <div className="formModuleTitle">{_l('服务器设置（带*为必填项）')}</div>
        {this.renderFormCommon(formListTop)}
        <div className="splitLine"></div>
        <div className="formModuleTitle">{_l('用户 schema')}</div>
        {this.renderFormCommon(formListBottom)}
        <Button type="primary" onClick={() => this.handleSubmit()} disabled={this.state.saveDisabled}>
          {this.state.saveDisabled ? _l('保存中') : _l('保存')}
        </Button>
      </div>
    );
  }
  changeValue = (val, field, type) => {
    let value;
    switch (type) {
      case 'checkbox':
        value = val.target.checked;
        break;
      case 'switch':
        value = !val;
        break;
      case 'input':
        value = val.target.value;
        break;
      default:
    }
    this.setState({ [field]: value });
  };
  handleSaveWebProxy = () => {
    const { http, https, ip, portNumber, openIdentityValidate, userName, webProxyPassword } = this.state;
    this.setState({ isSaveWebProxy: true });
    if (
      (!http && !https) ||
      !ip ||
      !ipRegExp.test(ip) ||
      !portRegExp.test(portNumber) ||
      !portNumber ||
      (openIdentityValidate && (!userName || !webProxyPassword))
    ) {
      return;
    }
    this.setState({ saveDisabled: true });
    projectSettingController
      .editApiProxySettings({
        type: http && https ? 0 : http ? 1 : https ? 2 : '',
        ip,
        port: portNumber,
        openIdentityValidate,
        username: openIdentityValidate ? userName : null,
        password: openIdentityValidate ? encrypt(webProxyPassword) : null,
        projectId: Config.projectId,
      })
      .then(res => {
        this.setState({ isSaveWebProxy: false, saveDisabled: false });
        if (res) {
          alert(_l('保存成功'));
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .fail(err => {
        this.setState({ saveDisabled: false });
      });
  };

  renderWebProxy = () => {
    const { http, https, ip, portNumber, openIdentityValidate, userName, webProxyPassword, isSaveWebProxy } =
      this.state;
    return (
      <div className="formBox">
        <div className="formModuleTitle">{_l('代理服务器设置')}</div>
        <div className="formItem">
          <div className="formLabel width135">
            <span className="TxtMiddle Red">*</span>
            {_l('接口类型')}
          </div>
          <div className="formRight flexRow">
            <div className="formInput directionRow pTop8">
              <Checkbox
                checked={http}
                onChange={checked => {
                  this.changeValue(checked, 'http', 'checkbox');
                }}
              >
                {_l('HTTP')}
              </Checkbox>
              <Checkbox
                checked={https}
                onChange={checked => {
                  this.changeValue(checked, 'https', 'checkbox');
                }}
              >
                {_l('HTTPS')}
              </Checkbox>
            </div>
            <div className="errorMsg">{isSaveWebProxy && !http && !https ? _l('请选择接口类型') : ''}</div>
          </div>
        </div>
        <div className="formItem">
          <div className="formLabel width135">
            <span className="TxtMiddle Red">*</span>
            {_l('服务器地址')}
          </div>
          <div className="formRight">
            <div className="formInput flexRow directionRow">
              <Input
                style={{ width: 180 }}
                placeholder={_l('IP、域名')}
                value={ip}
                onChange={e => {
                  this.changeValue(e, 'ip', 'input');
                }}
              />
              <span className="mLeft10 mRight10 LineHeight32">:</span>
              <Input
                style={{ width: 100 }}
                placeholder={_l('端口号')}
                value={portNumber}
                onChange={e => {
                  this.changeValue(e, 'portNumber', 'input');
                }}
              />
            </div>
            <div className="errorMsg">
              {isSaveWebProxy &&
                (!ip || !portNumber
                  ? _l('请输入服务器地址')
                  : !ipRegExp.test(ip)
                  ? _l('地址格式不正确')
                  : !portRegExp.test(portNumber)
                  ? _l('无效的端口号')
                  : '')}
            </div>
          </div>
        </div>
        <div className="formItem">
          <div className="formLabel width135">{_l('身份验证')}</div>
          <div className="formRight pTop8">
            <div className="formInput">
              <Switch
                size="small"
                checked={openIdentityValidate}
                onClick={checked => {
                  this.changeValue(checked, 'openIdentityValidate', 'switch');
                }}
              />
            </div>
            <div className="errorMsg"></div>
          </div>
        </div>
        {openIdentityValidate && (
          <div className="formItem">
            <div className="formLabel width135">
              <span className="TxtMiddle Red">*</span>
              {_l('用户名')}
            </div>
            <div className="formRight">
              <div className="formInput">
                <Input
                  placeholder={_l('用户名')}
                  style={{ width: 302 }}
                  value={userName}
                  onChange={e => {
                    this.changeValue(e, 'userName', 'input');
                  }}
                />
              </div>
              <div className="errorMsg">
                {isSaveWebProxy && openIdentityValidate && !userName ? _l('请输入用户名') : ''}
              </div>
            </div>
          </div>
        )}
        {openIdentityValidate && (
          <div className="formItem">
            <div className="formLabel width135">
              <span className="TxtMiddle Red">*</span>
              {_l('密码')}
            </div>
            <div className="formRight">
              <div className="formInput">
                <Input.Password
                  placeholder={_l('密码')}
                  style={{ width: 302 }}
                  value={webProxyPassword}
                  autocomplete="new-password"
                  onChange={e => {
                    this.changeValue(e, 'webProxyPassword', 'input');
                  }}
                />
              </div>
              <div className="errorMsg">
                {isSaveWebProxy && openIdentityValidate && !webProxyPassword ? _l('请输入密码') : ''}
              </div>
            </div>
          </div>
        )}
        <Button type="primary" onClick={this.handleSaveWebProxy} disabled={this.state.saveDisabled}>
          {this.state.saveDisabled ? _l('保存中') : _l('保存')}
        </Button>
      </div>
    );
  };

  handleSubmit() {
    const noneError = this.handleCheck();
    if (noneError) {
      this.setState({ saveDisabled: true });
      projectSettingController
        .updateProjectLdapSetting({
          ldapType: parseInt(this.state.type),
          port: this.state.port,
          enableSSL: this.state.enableSSL,
          serverIP: this.state.serverIP,
          user: this.state.user,
          password: this.state.password,
          domainPath: this.state.domainPath,
          searchFilter: this.state.searchFilter,
          emailAttr: this.state.emailAttr,
          fullnameAttr: this.state.fullnameAttr,
          departmentAttr: this.state.departmentAttr,
          jobAttr: this.state.jobAttr,
          workphoneAttr: this.state.workphoneAttr,
          projectId: Config.projectId,
        })
        .then(data => {
          if (data) {
            alert(_l('保存成功'));
            this.setState({ saveDisabled: false });
          } else {
            alert(_l('连接失败，请确保系统能够正常访问您的服务器'), 3);
            this.setState({ saveDisabled: false });
          }
        });
    }
  }

  // renderLogin() {}

  handleChangeVisible(value) {
    this.setState({
      keyVisible: value,
    });
  }

  renderIndex() {
    const { effective, webProxy } = this.state;
    const featureType = getFeatureStatus(Config.projectId, FEATURE_ID);
    const apiProxyFeatureType = getFeatureStatus(Config.projectId, API_PROXY_FEATURE_ID);
    return (
      <Fragment>
        {featureType && (
          <div className="toolItem">
            <div className="toolItemLabel">{_l('LDAP用户目录')}</div>
            <div className="toolItemRight">
              <div>
                <Switch
                  checked={effective}
                  onClick={() => {
                    if (featureType === '2') {
                      buriedUpgradeVersionDialog(Config.projectId, FEATURE_ID);
                      return;
                    }
                    this.enableForm('effective');
                  }}
                />
                <button
                  type="button"
                  className={cx('ming Button Button--link mLeft24 ThemeColor3 mTop2 TxtTop adminHoverColor', {
                    hidden: !effective,
                  })}
                  onClick={() => {
                    if (featureType === '2') {
                      buriedUpgradeVersionDialog(Config.projectId, FEATURE_ID);
                      return;
                    }
                    this.toggleComp('effective');
                  }}
                >
                  {_l('设置')}
                </button>
              </div>
              <div className="toolItemDescribe">
                {_l('在付费版下，您可以集成LDAP用户目录，实现统一身份认证管理 （需确保员工的账号已和邮箱绑定）')}
              </div>
            </div>
          </div>
        )}
        <div className="toolItem">
          <div className="toolItemLabel">{_l('组织密钥')}</div>
          <div className="toolItemRight">
            <div>
              <button
                type="button"
                className="ming Button Button--link ThemeColor3 pLeft0 adminHoverColor Block"
                onClick={this.handleChangeVisible.bind(this, true)}
              >
                {_l('查看密钥')}
              </button>
            </div>
            <div className="toolItemDescribe">{_l('此密钥是用于访问企业授权开放接口的凭证')}</div>
          </div>
        </div>
        {apiProxyFeatureType && (
          <div className="toolItem">
            <div className="toolItemLabel">{_l('API网络代理')}</div>
            <div className="toolItemRight">
              <div>
                <Switch
                  checked={webProxy}
                  onClick={() => {
                    if (apiProxyFeatureType === '2') {
                      buriedUpgradeVersionDialog(Config.projectId, API_PROXY_FEATURE_ID);
                      return;
                    }
                    this.enableForm('webProxy');
                  }}
                />
                <button
                  type="button"
                  className={cx('ming Button Button--link mLeft24 ThemeColor3 mTop2 TxtTop adminHoverColor', {
                    hidden: !webProxy,
                  })}
                  onClick={() => {
                    if (apiProxyFeatureType === '2') {
                      buriedUpgradeVersionDialog(Config.projectId, API_PROXY_FEATURE_ID);
                      return;
                    }
                    projectSettingController
                      .getApiProxySettings({
                        projectId: Config.projectId,
                      })
                      .then(res => {
                        if (res) {
                          this.setState({
                            http: res.type === 0 || res.type === 1 ? true : false,
                            https: res.type === 0 || res.type === 2 ? true : false,
                            ip: res.ip,
                            portNumber: res.port,
                            openIdentityValidate: res.openIdentityValidate,
                            userName: res.userName,
                            webProxyPassword: res.password,
                            loading: false,
                          });
                        }
                        this.toggleComp('webProxy');
                      });
                  }}
                >
                  {_l('设置')}
                </button>
              </div>
              <div className="toolItemDescribe TxtMiddle">
                {_l('启用后，您可以在发送API请求时选择通过设置的代理服务器发送')}
                <Support type={3} href="https://help.mingdao.com/apiproxy.html" text={_l('查看文档')} />
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  renderContent() {
    switch (this.state.level) {
      case 'index':
        return this.renderIndex();
      case 'effective':
        return this.renderLdap();
      case 'webProxy':
        return this.renderWebProxy();
      // case 'isSingleLogin':
      //   return this.renderLogin();
    }
  }

  setLevel(level) {
    this.setState({ level });
  }

  render() {
    const { level, loading, keyVisible } = this.state;
    const title = headerTitle[level];
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <div className="otherToolBox">
        {keyVisible && (
          <ViewKeyDialog
            projectId={Config.projectId}
            visible={keyVisible}
            handleChangeVisible={this.handleChangeVisible.bind(this)}
          />
        )}
        <div className="otherHeader">
          <Icon
            icon="backspace"
            className={cx('Hand mRight18 TxtMiddle Font24 adminHeaderIconColor', { hidden: level === 'index' })}
            onClick={() => this.toggleComp('index')}
          ></Icon>
          <span className="Font17">{title}</span>
        </div>
        <div className="toolContentBox">{this.renderContent()}</div>
      </div>
    );
  }
}
