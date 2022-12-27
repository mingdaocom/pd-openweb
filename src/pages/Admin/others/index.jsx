import React, { Component, Fragment } from 'react';
import { Icon, Switch, LoadDiv, Tooltip, Support } from 'ming-ui';
import { Input, Select, Checkbox, Button } from 'antd';
import cx from 'classnames';
import './index.less';
import { formListTop, formListBottom } from './form.config.js';
import projectSettingController from 'src/api/projectSetting';
import Config from '../config';
import ViewKeyDialog from './ViewKey';
import { getFeatureStatus, buriedUpgradeVersionDialog, encrypt, upgradeVersionDialog } from 'src/util';
import _ from 'lodash';

const API_PROXY_FEATURE_ID = 22;

const headerTitle = {
  index: _l('其他'),
  effective: _l('LDAP用户目录'),
  webProxy: _l('API网络代理'),
  sso: _l('SSO'),
};
const DATA_INFO = [
  {
    key: 'effective',
    label: _l('LDAP用户目录'),
    showSetting: true,
    description: _l('在付费版下，您可以集成LDAP用户目录，实现统一身份认证管理 （需确保员工的账号已和邮箱绑定）'),
    featureId: 15,
  },
  {
    key: 'orgKey',
    label: _l('组织密钥'),
    showSetting: false,
    docLink: 'https://www.showdoc.com.cn/mingdao',
    description: _l('此密钥是用于访问企业授权开放接口的凭证'),
  },
  {
    key: 'webProxy',
    label: _l('API网络代理'),
    showSetting: true,
    docLink: 'https://help.mingdao.com/apiproxy.html',
    description: _l('启用后，您可以在发送API请求时选择通过设置的代理服务器发送'),
    featureId: 22,
  },
  {
    key: 'sso',
    label: _l('SSO'),
    showSetting: true,
    description: _l('您可以通过组织的二级域名，以SSO登录方式登录到平台'),
  },
];
const ipRegExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;
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
      searchRange: 0,
      DNGroupList: [{ dn: '', groupName: '' }],
    };
  }

  componentDidMount() {
    this.getSettings();
    this.getApiProxyState();
    this.getSsoSettings();
  }

  getSettings() {
    this.setState({ loading: true });
    projectSettingController
      .getProjectLdapSetting({
        projectId: Config.projectId,
      })
      .then(data => {
        let dnGroupObj = data.dnGroup || {};
        let DNGroupList = [];
        Object.keys(dnGroupObj).forEach(item => {
          DNGroupList.push({ dn: item, groupName: dnGroupObj[item] });
        });
        if (data) {
          this.setState({
            effective: data.effective,
            type: data.type || '',
            serverIP: data.serverIP,
            port: data.port,
            user: data.user,
            password: data.password,
            domainPath: data.domainPath,
            DNGroupList: _.isEmpty(DNGroupList) ? [{ dn: '', groupName: '' }] : DNGroupList,
            searchRange: data.searchRange || 0,
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

  updateSSO = () => {
    projectSettingController
      .setSso({
        projectId: Config.projectId,
        isOpenSso: this.state.sso,
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
        if (key === 'sso') {
          this.updateSSO();
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
    const { DNGroupList = [], searchRange } = this.state;
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
    const dnGroupError = searchRange === 0 || (searchRange === 1 && DNGroupList.every(it => !!it.dn && !!it.groupName));
    return isChecked && dnGroupError;
  }

  clearError(key) {
    $(`.errorInput${key}`).removeClass('errorInput');
    $(`#errorMsg${key}`).text('');
  }

  addDNGroup = () => {
    const copyDNGroupList = [...this.state.DNGroupList];
    copyDNGroupList.push({ dn: '', groupName: '' });
    this.setState({ DNGroupList: copyDNGroupList });
  };

  renderCompType(key, compType = 'input') {
    const { searchRange, DNGroupList = [], checkDnGroupEmpty } = this.state;
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
      case 'tab':
        return (
          <div className="searchRange flexRow">
            {[
              { key: 0, tab: 'BaseDN' },
              { key: 1, tab: _l('DN/组名') },
            ].map(it => (
              <div
                key={it.key}
                className={cx('flex', { active: searchRange === it.key })}
                onClick={() => {
                  this.setState({ searchRange: it.key });
                }}
              >
                {it.tab}
              </div>
            ))}
          </div>
        );
      case 'group':
        return (
          <div className="DNGroup w100">
            <div className="Gray_9e Font12 mTop8">{_l('根据组在对应的DN检索账户')}</div>
            <div className="groupItem">
              <div className="flex">DN</div>
              <div className="flex mLeft12">{_l('组名')}</div>
            </div>
            {DNGroupList.map((it, i) => {
              return (
                <div className="groupItem mBottom16">
                  <div className="flex">
                    <Input
                      style={{ height: 36 }}
                      value={it.dn}
                      onChange={e => {
                        const copyDNGroupList = [...DNGroupList];
                        copyDNGroupList[i].dn = e.target.value;
                        this.setState({ DNGroupList: copyDNGroupList });
                      }}
                    />
                    {checkDnGroupEmpty && !it.groupName && searchRange === 1 && (
                      <div className={cx('TxtMiddle Red')}>{_l('请输入DN')}</div>
                    )}
                  </div>
                  <div className="flex mLeft12">
                    <Input
                      style={{ height: 36 }}
                      value={it.groupName}
                      onChange={e => {
                        const copyDNGroupList = [...DNGroupList];
                        copyDNGroupList[i].groupName = e.target.value;
                        this.setState({ DNGroupList: copyDNGroupList, checkDnGroupEmpty: false });
                      }}
                    />
                    {checkDnGroupEmpty && !it.groupName && searchRange === 1 && (
                      <div className={cx('TxtMiddle Red')}>{_l('请输入组名')}</div>
                    )}
                  </div>

                  {DNGroupList.length > 1 && (
                    <Icon
                      icon="remove_circle_outline"
                      className="minus mLeft15"
                      onClick={() => {
                        const copyDNGroupList = [...DNGroupList];
                        copyDNGroupList.splice(i, 1);
                        this.setState({ DNGroupList: copyDNGroupList, checkDnGroupEmpty: false });
                      }}
                    />
                  )}
                </div>
              );
            })}

            <span className="Hand ThemeColor" onClick={this.addDNGroup}>
              <Icon icon="plus" className="mRight5" /> {_l('添加')}
            </span>
          </div>
        );
    }
  }

  renderFormCommon(list) {
    const { searchRange } = this.state;
    return (
      <Fragment>
        {list &&
          list.map(({ label, key, compType, errorMsg, desc }) => {
            if (key === 'domainPath' && searchRange !== 0) return;
            if (key === 'DNGroup' && searchRange !== 1) return;
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
                  <div className="errorMsg" id={'errorMsg' + key} />
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
        <div className="splitLine" />
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
    const {
      http,
      https,
      ip,
      portNumber,
      openIdentityValidate,
      userName,
      webProxyPassword,
      isSaveWebProxy,
    } = this.state;
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
            <div className="errorMsg" />
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
    const {
      type,
      port,
      enableSSL,
      serverIP,
      user,
      password,
      searchRange,
      searchFilter,
      emailAttr,
      fullnameAttr,
      departmentAttr,
      jobAttr,
      workphoneAttr,
      domainPath,
      DNGroupList = [],
    } = this.state;
    const dnGroupError = DNGroupList.every(it => !!it.dn && !!it.groupName);
    if (!noneError || (searchRange === 1 && dnGroupError)) {
      this.setState({ checkDnGroupEmpty: true });
    } else {
      this.setState({ checkDnGroupEmpty: false });
    }
    if (noneError) {
      this.setState({ saveDisabled: true });
      let dnGroup = {};
      DNGroupList.filter(v => !!v.dn).forEach(it => (dnGroup[`${it.dn}`] = it.groupName));
      const extra =
        this.state.searchRange === 0
          ? {
              domainPath,
              dnGroup: {},
            }
          : { dnGroup, domainPath: '' };
      projectSettingController
        .updateProjectLdapSetting({
          ldapType: parseInt(type),
          port,
          enableSSL,
          serverIP,
          user,
          password,
          searchRange,
          searchFilter,
          emailAttr,
          fullnameAttr,
          departmentAttr,
          jobAttr,
          workphoneAttr,
          projectId: Config.projectId,
          ...extra,
        })
        .then(data => {
          if (data) {
            alert(_l('保存成功'));
            this.setState({
              saveDisabled: false,
              domainPath: searchRange === 0 ? this.state.domainPath : '',
              DNGroupList: searchRange === 1 ? DNGroupList : [{ dn: '', groupName: '' }],
            });
          } else {
            alert(_l('连接失败，请确保系统能够正常访问您的服务器'), 3);
            this.setState({ saveDisabled: false });
          }
        })
        .fail(err => {
          this.setState({ saveDisabled: false });
        });
    }
  }

  // renderLogin() {}

  handleChangeVisible(value) {
    this.setState({
      keyVisible: value,
    });
  }

  getApiProxySetting = () => {
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
  };
  getSsoSettings = () => {
    projectSettingController
      .getSsoSettings({
        projectId: Config.projectId,
      })
      .then(res => {
        if (res) {
          this.setState({
            ssoWebUrl: res.ssoWebUrl,
            ssoAppUrl: res.ssoAppUrl,
            sso: res.isOpenSso,
          });
        }
      });
  };
  renderIndex() {
    const licenseType = _.get(
      _.find(md.global.Account.projects, item => item.projectId === Config.projectId) || {},
      'licenseType',
    );
    return (
      <Fragment>
        {DATA_INFO.map(item => {
          const { key, featureId, docLink, showSetting, description } = item;
          const featureType = getFeatureStatus(Config.projectId, featureId);
          if (item.featureId && !featureType) return;
          return (
            <div className="toolItem">
              <div className="toolItemLabel">{item.label}</div>
              <div className="toolItemRight">
                <div>
                  {key !== 'orgKey' && (
                    <Switch
                      checked={this.state[key]}
                      onClick={() => {
                        if (featureType === '2') {
                          buriedUpgradeVersionDialog(Config.projectId, featureId);
                          return;
                        }
                        if (key === 'sso' && licenseType === 0) {
                          return upgradeVersionDialog({
                            projectId: Config.projectId,
                            explainText: _l('请升级至付费版解锁开启'),
                            isFree: true,
                          });
                        }
                        this.enableForm(key);
                      }}
                    />
                  )}
                  {key === 'orgKey' && (
                    <div>
                      <button
                        type="button"
                        className="ming Button Button--link ThemeColor3 pLeft0 adminHoverColor Block"
                        onClick={this.handleChangeVisible.bind(this, true)}
                      >
                        {_l('查看密钥')}
                      </button>
                    </div>
                  )}
                  {showSetting && (
                    <button
                      type="button"
                      className={cx('ming Button Button--link mLeft24 ThemeColor3 mTop2 TxtTop adminHoverColor', {
                        hidden: !this.state[key],
                      })}
                      onClick={() => {
                        if (featureType === '2') {
                          buriedUpgradeVersionDialog(Config.projectId, featureId);
                          return;
                        }
                        if (key === 'sso' && licenseType === 0) {
                          return upgradeVersionDialog({
                            projectId: Config.projectId,
                            explainText: _l('请升级至付费版解锁开启'),
                            isFree: true,
                          });
                        }
                        switch (key) {
                          case 'webProxy':
                            return this.getApiProxySetting();
                          default:
                            this.toggleComp(key);
                        }
                      }}
                    >
                      {_l('设置')}
                    </button>
                  )}
                </div>
                <div className="toolItemDescribe">
                  {description}
                  {docLink && <Support text={_l('查看文档')} type={3} href={docLink} />}
                </div>
              </div>
            </div>
          );
        })}
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
      case 'sso':
        return this.renderSSO();
      // case 'isSingleLogin':
      //   return this.renderLogin();
    }
  }

  renderSSO = () => {
    const { ssoWebUrl, ssoAppUrl, saveSSO } = this.state;
    return (
      <div className="formBox">
        <div className="formModuleTitle">{_l('SSO链接地址')}</div>
        <div className="formItem pLeft30 pRight20">
          <div className="formLabel TxtLeft">{_l('WEB-PC端')}</div>
          <div className="formRight">
            <Input
              value={ssoWebUrl}
              onChange={e => {
                this.setState({ ssoWebUrl: e.target.value });
              }}
            />
            {saveSSO && !_.trim(ssoWebUrl) && <div className="errorMsg">{_l('请输入WEB-PC端')}</div>}
          </div>
        </div>
        <div className="formItem pLeft30 pRight20">
          <div className="formLabel TxtLeft">
            {_l('WEB-移动端')}
            <Tooltip
              popupPlacement="bottom"
              text={<span>{_l('若”WEB-移动端“未填写，通过WEB-移动端登录时，系统默认使用”WEB-PC端“地址登录')}</span>}
            >
              <Icon icon="info" className="Gray_9e mLeft10" />
            </Tooltip>
          </div>
          <div className="formRight">
            <Input value={ssoAppUrl} onChange={e => this.setState({ ssoAppUrl: e.target.value })} />
          </div>
        </div>
        <div className="TxtRight pRight20">
          <Button
            type="primary"
            className="mTop20"
            onClick={() => {
              this.setState({ saveSSO: true });
              if (!_.trim(this.state.ssoWebUrl)) return;
              projectSettingController
                .setSsoUrl({
                  projectId: Config.projectId,
                  ssoWebUrl: _.trim(this.state.ssoWebUrl),
                  ssoAppUrl: this.state.ssoAppUrl,
                })
                .then(res => {
                  if (res) {
                    alert(_l('保存成功'));
                  } else {
                    alert(_l('保存失败'), 2);
                  }
                });
            }}
          >
            {_l('保存')}
          </Button>
        </div>
      </div>
    );
  };

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
          />
          <span className="Font17">{title}</span>
        </div>
        <div className="toolContentBox">{this.renderContent()}</div>
      </div>
    );
  }
}
