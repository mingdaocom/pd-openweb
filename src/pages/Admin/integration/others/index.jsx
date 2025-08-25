import React, { Component, Fragment } from 'react';
import { Input, Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import {
  Button,
  Checkbox,
  Dropdown,
  Icon,
  LoadDiv,
  Switch,
  Tooltip,
  UpgradeIcon,
  VerifyPasswordConfirm,
} from 'ming-ui';
import projectSettingController from 'src/api/projectSetting';
import { hasPermission } from 'src/components/checkPermission';
import { buriedUpgradeVersionDialog, upgradeVersionDialog } from 'src/components/upgradeVersion';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { VersionProductType } from 'src/utils/enum';
import { getCurrentProject, getFeatureStatus } from 'src/utils/project';
import SettingIconAndName from '../../components/SettingIconAndName';
import Config from '../../config';
import { accountTxtInfo, formListBottom, formListTop, loginSetting } from './form.config.js';
import ViewKeyDialog from './ViewKey';
import './index.less';

const headerTitle = {
  index: _l('其他'),
  effective: _l('LDAP登录'),
  sso: _l('SSO'),
};
const DATA_INFO = [
  {
    key: 'effective',
    label: _l('LDAP登录'),
    showSetting: true,
    description: md.global.Config.IsLocal
      ? _l('启用后，成员可在组织专属登录页使用 LDAP 登录。系统将通过邮箱进行身份匹配，请确保成员账号已绑定对应邮箱')
      : _l(
          '在付费版下，您可以通过组织的二级域名登录页面，通过集成LDAP账号登录，实现统一身份认证管理 （确保员工的账号已与邮箱绑定，系统通过邮箱进行映射）',
        ),
    featureId: VersionProductType.LDAPIntergration,
    showCustomName: true,
    iconClassName: 'icon-lock',
  },
  {
    key: 'sso',
    label: _l('SSO登录'),
    showSetting: true,
    description: _l('在付费版本下，您可以通过组织的二级域名，以SSO登录方式登录到平台'),
    showCustomName: true,
    iconClassName: 'icon-tab_move',
  },
  {
    key: 'enabledMDLogin',
    label: _l('平台帐号登录'),
    description: md.global.Config.IsLocal
      ? _l('在组织专属登录页，当开启了SSO、LDAP或第三方平台账号登录时，可关闭平台账号登录入口')
      : _l('在组织的二级域名登录页面，当组织启用了LDAP、SSO或第三方平台账号登录时，可以关闭本系统账号登录'),
  },
  {
    key: 'orgKey',
    label: _l('开放接口'),
    showSetting: false,
    docLink: md.global.Config.WebUrl + 'apidoc/',
    description: _l('此密钥是用于访问系统企业授权开放API接口的凭证'),
  },
  // {
  //   key: 'integrationAuthority',
  //   label: _l('只允许管理员访问集成中心'),
  //   showSetting: false,
  //   description: _l('启用后，只有组织的应用管理员可以访问集成中心。关闭时，所有人都可以访问'),
  // },
];
const AUTH_MAPPING = {
  [DATA_INFO[0].key]: PERMISSION_ENUM.LDAP_LOGIN,
  [DATA_INFO[1].key]: PERMISSION_ENUM.SSO_LOGIN,
  [DATA_INFO[2].key]: PERMISSION_ENUM.PLATFORM_ACCOUNT_LOGIN,
  [DATA_INFO[3].key]: PERMISSION_ENUM.OPEN_INTERFACE,
};

export default class OtherTool extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('其他'));
    this.state = {
      level: 'index', //index | effective | key
      keyVisible: false,
      //ldap
      effective: false,
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
      effectiveCustomName: 'LDAP',
      ssoCustomName: 'SSO',
      enabledMDLogin: false,
      mustFullname: false,
      mustDepartment: false,
      mustJob: false,
      mustWorkphone: false,
      noMatchCreate: false, // 无匹配用户时新建
    };
  }

  componentDidMount() {
    const { authority } = this.props;
    hasPermission(authority, PERMISSION_ENUM.LDAP_LOGIN) && this.getSettings();
    hasPermission(authority, PERMISSION_ENUM.SSO_LOGIN) && this.getSsoSettings();
    hasPermission(authority, PERMISSION_ENUM.PLATFORM_ACCOUNT_LOGIN) && this.getMDLoginSetting();
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
            initSyncInfo: {
              fullnameAttr: data.fullnameAttr || '',
              departmentAttr: data.departmentAttr || '',
              jobAttr: data.jobAttr || '',
              workphoneAttr: data.workphoneAttr || '',
            },
            loading: false,
            effectiveCustomName: data.name || 'LDAP',
            effectiveDefaultCustomName: data.name || 'LDAP',
            mustFullname: data.mustFullname,
            mustDepartment: data.mustDepartment,
            mustJob: data.mustJob,
            mustWorkphone: data.mustWorkphone,
            createIfNotExists: data.createIfNotExists,
            initLdapData: { ...data, DNGroupList: _.isEmpty(DNGroupList) ? [{ dn: '', groupName: '' }] : DNGroupList },
            iconUrl: data.iconUrl,
          });
        }
      });
  }

  getMDLoginSetting = () => {
    projectSettingController.getMDLoginSetting({ projectId: Config.projectId }).then(({ enabledMDLogin }) => {
      this.setState({ enabledMDLogin });
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

  // 更新平台帐号登录状态
  setMDLoginSetting = () => {
    projectSettingController
      .setMDLoginSetting({
        projectId: Config.projectId,
        enabledMDLogin: this.state.enabledMDLogin,
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
        if (key === 'sso') {
          this.updateSSO();
        }
        if (key === 'enabledMDLogin') {
          this.setMDLoginSetting();
        }
      },
    );
  }

  toggleComp(level) {
    const { initLdapData = {}, initSsoData = {} } = this.state;
    this.setState({ level, isSaveWebProxy: false, ...initLdapData, ...initSsoData });
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

  handleUpdateItemCheck = checked => {
    this.setState({
      enableSSL: !checked,
      port: !checked ? 636 : 389,
    });
  };

  selectTypeComp = key => {
    const { errorInfo = {} } = this.state;

    return (
      <Select
        className={cx({ errorInput: !!errorInfo[key] })}
        value={this.state[key] + ''}
        placeholder={_l('请选择用户目录类型')}
        onChange={this.handleUpdateItemSelect.bind(this)}
        onFocus={() => this.clearError(key)}
      >
        <Select.Option value="1">Microsoft Active Directory</Select.Option>
        <Select.Option value="2">Novell eDirectory Server</Select.Option>
        <Select.Option value="3">OpenLDAP</Select.Option>
        <Select.Option value="4">Generic Directory Server</Select.Option>
        <Select.Option value="5">Sun Directory Server Premium Edition</Select.Option>
      </Select>
    );
  };

  handleCheck() {
    const { DNGroupList = [], searchRange, accountTxtType } = this.state;
    const loginSettingData =
      accountTxtType === 100
        ? loginSetting.concat({
            label: '',
            key: 'accountTxt',
            errorMsg: _l('请输入自定义显示名称'),
          })
        : loginSetting;
    const list = formListTop.concat(formListBottom).concat(loginSettingData);
    const dnGroupError = searchRange === 0 || (searchRange === 1 && DNGroupList.every(it => !!it.dn && !!it.groupName));
    const errorInfo = {};
    list.forEach(({ key, errorMsg }) => {
      if (errorMsg) {
        if (!this.state[key]) {
          errorInfo[key] = errorMsg;
        }
        if (key === 'port' && isNaN(this.state.port)) {
          errorInfo[key] = _l('端口号必须为数字');
        }
      }
    });
    if (!dnGroupError) {
      errorInfo.dnGroup = true;
    }

    this.setState({ errorInfo });

    return _.isEmpty(errorInfo);
  }

  clearError = key => {
    const { errorInfo = {} } = this.state;
    this.setState({ errorInfo: { ...errorInfo, [key]: '' } });
  };

  addDNGroup = () => {
    const copyDNGroupList = [...this.state.DNGroupList];
    copyDNGroupList.push({ dn: '', groupName: '' });
    this.setState({ DNGroupList: copyDNGroupList });
  };

  changeAccountTxtInfo = () => {};

  renderCompType(key, compType = 'input', inputDisabled, placeholder) {
    const { searchRange, DNGroupList = [], errorInfo = {} } = this.state;
    switch (compType) {
      case 'select':
        return this.selectTypeComp(key);
      case 'dropDown':
        return (
          <Dropdown
            border
            style={{ width: '40%' }}
            menuClass="w100"
            isAppendBody
            data={accountTxtInfo}
            value={this.state[key]}
            onChange={value => this.setState({ [key]: value })}
          />
        );
      case 'password':
        return (
          <Input.Password
            className={cx('passwordInput', { errorInput: !!errorInfo[key] })}
            autocomplete="new-password"
            value={this.state[key]}
            onChange={e => this.handleUpdateItem(e, key)}
            onFocus={() => this.clearError(key)}
          />
        );
      case 'input':
        return (
          <Input
            placeholder={inputDisabled ? '' : placeholder}
            disabled={inputDisabled}
            className={cx({ errorInput: !!errorInfo[key] })}
            value={inputDisabled ? '' : this.state[key]}
            onChange={e => this.handleUpdateItem(e, key)}
            onFocus={() => this.clearError(key)}
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
                  this.setState({
                    searchRange: it.key,
                    errorInfo: { ...errorInfo, dnGroup: it.key === 0 ? false : errorInfo.dnGroup },
                  });
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
                        this.setState({
                          DNGroupList: copyDNGroupList,
                          errorInfo: { ...errorInfo, dnGroup: !copyDNGroupList.every(it => !!it.dn && !!it.groupName) },
                        });
                      }}
                    />
                    {errorInfo.dnGroup && !it.groupName && searchRange === 1 && (
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
                        this.setState({
                          DNGroupList: copyDNGroupList,
                          errorInfo: { ...errorInfo, dnGroup: !copyDNGroupList.every(it => !!it.dn && !!it.groupName) },
                        });
                      }}
                    />
                    {errorInfo.dnGroup && !it.groupName && searchRange === 1 && (
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
                        this.setState({
                          DNGroupList: copyDNGroupList,
                          errorInfo: { ...errorInfo, dnGroup: !copyDNGroupList.every(it => !!it.dn && !!it.groupName) },
                        });
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
    const { searchRange, initSyncInfo, errorInfo = {} } = this.state;

    return (
      <Fragment>
        {list &&
          list.map(({ label, key, compType, errorMsg, desc, showCheckbox, checkedField, placeholder }) => {
            if (key === 'domainPath' && searchRange !== 0) return;
            if (key === 'DNGroup' && searchRange !== 1) return;
            return (
              <div className="formItem" key={key}>
                <div className={cx('formLabel', { flexRow: showCheckbox })}>
                  {showCheckbox ? (
                    <Checkbox
                      checked={this.state[checkedField]}
                      text={label}
                      onClick={checked =>
                        this.setState({
                          [checkedField]: !checked,
                          [key]: checked ? initSyncInfo[key] : this.state[key],
                        })
                      }
                    />
                  ) : (
                    <Fragment>
                      <span className={cx('TxtMiddle Red', errorMsg ? '' : 'hidden')}>*</span>
                      {label}
                    </Fragment>
                  )}
                </div>
                <div className="formRight">
                  <div className="formInput">
                    {this.renderCompType(key, compType, showCheckbox ? !this.state[checkedField] : false, placeholder)}
                    {desc === 'enableSSL' ? (
                      <Checkbox
                        text={_l('使用安全链接')}
                        className="mLeft16"
                        checked={this.state[desc]}
                        onClick={this.handleUpdateItemCheck}
                      />
                    ) : (
                      <span className="formItemDesc">{desc}</span>
                    )}
                  </div>
                  {errorMsg && errorInfo[key] && <div className="errorMsg">{errorInfo[key]}</div>}
                </div>
              </div>
            );
          })}
      </Fragment>
    );
  }

  renderLdap() {
    const { createIfNotExists, accountTxtType } = this.state;

    return (
      <div className="formBox">
        <div className="formModuleTitle mTop0">{_l('服务器设置（带*为必填项）')}</div>
        {this.renderFormCommon(formListTop)}
        <div className="splitLine"></div>
        <div className="formModuleTitle mBottom15">{_l('登录设置')}</div>
        <div className="Gray_9e mBottom15">{_l('设置LDAP登录时作为用户登录账号的字段')}</div>
        {this.renderFormCommon(
          accountTxtType === 100
            ? loginSetting.concat({
                label: '',
                key: 'accountTxt',
                errorMsg: _l('请输入自定义显示名称'),
              })
            : loginSetting,
        )}
        <div className="formModuleTitle mBottom15">{_l('账号映射')}</div>
        <div className="Gray_9e mBottom15">{_l('设置LDAP服务器中用于和本系统账号匹配的字段')}</div>
        {this.renderFormCommon(formListBottom.slice(0, 1))}
        <div style={{ marginLeft: 150 }}>
          <Checkbox
            text={_l('当无法通过以上字段匹配到系统账号时，新建一个账号')}
            checked={createIfNotExists}
            onClick={checked => this.setState({ createIfNotExists: !checked })}
          />
        </div>
        <div className="formModuleTitle mBottom15">{_l('同步信息')}</div>
        <div className="Gray_9e mBottom15">{_l('勾选后，在用户使用LDAP登录时，将同步以下账号信息')}</div>
        {this.renderFormCommon(formListBottom.slice(1))}

        <Button
          type="primary"
          className="mBottom45 mTop45 mLeft150"
          onClick={() => this.handleSubmit()}
          disabled={this.state.saveDisabled}
        >
          {this.state.saveDisabled ? _l('保存中') : _l('保存')}
        </Button>
      </div>
    );
  }

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
      mustFullname,
      mustDepartment,
      mustJob,
      mustWorkphone,
      createIfNotExists,
      initLdapData = {},
      accountTxtType,
      accountTxt,
    } = this.state;

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
          mustFullname,
          mustDepartment,
          mustJob,
          mustWorkphone,
          createIfNotExists,
          accountTxtType,
          accountTxt,
          ...extra,
        })
        .then(data => {
          if (data) {
            alert(_l('保存成功'));
            this.setState({
              saveDisabled: false,
              domainPath: searchRange === 0 ? this.state.domainPath : '',
              DNGroupList: searchRange === 1 ? DNGroupList : [{ dn: '', groupName: '' }],
              initSyncInfo: {
                fullnameAttr,
                departmentAttr,
                jobAttr,
                workphoneAttr,
              },
              initLdapData: {
                ...initLdapData,
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
                DNGroupList,
                mustFullname,
                mustDepartment,
                mustJob,
                mustWorkphone,
                createIfNotExists,
                accountTxtType,
                accountTxt,
              },
            });
          } else {
            alert(_l('连接失败，请确保系统能够正常访问您的服务器'), 2);
            this.setState({ saveDisabled: false });
          }
        })
        .catch(() => {
          this.setState({ saveDisabled: false });
        });
    }
  }

  handleChangeVisible = value => {
    this.setState({
      keyVisible: value,
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
            ssoCustomName: res.ssoName || 'SSO',
            ssoDefaultCustomName: res.ssoName || 'SSO',
          });
        }
      });
  };

  // 检查是否有密钥
  checkHasKey = () => {
    VerifyPasswordConfirm.confirm({
      onOk: () => {
        this.handleChangeVisible(true);
      },
    });
  };

  // 保存自定义名称
  saveCustomName = (key, { icon, success = () => {} } = {}) => {
    const currentName = this.state[`${key}CustomName`];
    if (!currentName) {
      alert(_l('名称不得为空'), 2);
      return;
    }
    this.setState({ [`set${key}Name`]: false });

    if (key === 'sso' && _.isEqual(currentName, this.state[`${key}DefaultCustomName`])) return;

    const ajax = key === 'sso' ? projectSettingController.setSsoName : projectSettingController.updateLdapName;
    const params = key === 'sso' ? { ssoName: currentName } : { ldapName: currentName, ldapIcon: icon || '' };

    ajax({ projectId: Config.projectId, ...params })
      .then(res => {
        if (res) {
          alert(_l('修改成功'));
          success();
          this.setState({ [`${key}DefaultCustomName`]: currentName });
        } else {
          alert(_l('修改失败'), 2);
        }
      })
      .catch(() => {
        alert(_l('修改失败'), 2);
        this.setState({ [`${key}CustomName`]: this.state[`${key}DefaultCustomName`] });
      });
  };

  renderIndex() {
    const { licenseType } = getCurrentProject(Config.projectId, true);
    const { authority } = this.props;
    const lang = window.getCurrentLang();

    return (
      <Fragment>
        {DATA_INFO.map(item => {
          const { key, featureId, docLink, showSetting, description, showCustomName, label, iconClassName } = item;
          const featureType = getFeatureStatus(Config.projectId, featureId);
          if ((item.featureId && !featureType) || !hasPermission(authority, AUTH_MAPPING[item.key])) return null;

          if (key === 'sso') return null;

          return (
            <div className="toolItem">
              <div className="toolItemLabel">
                {item.label}
                {(featureType === '2' || (key === 'sso' && licenseType === 0)) && <UpgradeIcon />}
              </div>
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
                        onClick={this.checkHasKey}
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
                  {docLink && (
                    <a href={docLink + (lang === 'zh-Hans' ? 'zh-Hans/' : 'en/')} className="mLeft5" target="_blank">
                      {_l('查看文档')}
                    </a>
                  )}
                </div>
                {showCustomName && (
                  <Fragment>
                    {key === 'sso' && md.global.Config.IsLocal ? (
                      <div className="customNameWrap mTop8">
                        <span className="Gray_9e">{_l('自定义显示登录文案：')}</span>
                        {this.state[`set${key}Name`] ? (
                          <input
                            ref={node => (this.customNameInput = node)}
                            value={this.state[`${key}CustomName`]}
                            className="customNameInput"
                            onChange={e => this.setState({ [`${key}CustomName`]: e.target.value })}
                          />
                        ) : (
                          <span className="name">{this.state[`${key}CustomName`]}</span>
                        )}
                        {this.state[`set${key}Name`] ? (
                          <Fragment>
                            <span className="ThemeColor Hand mLeft16 mRight20" onClick={() => this.saveCustomName(key)}>
                              {_l('保存')}
                            </span>
                            <span
                              className="ThemeColor Hand"
                              onClick={() => {
                                this.setState({
                                  [`set${key}Name`]: false,
                                  [`${key}CustomName`]: this.state[`${key}DefaultCustomName`],
                                });
                              }}
                            >
                              {_l('取消')}
                            </span>
                          </Fragment>
                        ) : this.state[key] ? (
                          <Icon
                            icon="edit"
                            className="Font12 mLeft8 Gray_9e Hover_21 Hand"
                            onClick={() => {
                              setTimeout(() => {
                                this.customNameInput.focus();
                              }, 500);
                              this.setState({ [`set${key}Name`]: true });
                            }}
                          />
                        ) : (
                          ''
                        )}
                      </div>
                    ) : (
                      <SettingIconAndName
                        className="mTop8"
                        iconClassName={iconClassName}
                        defaultName={label}
                        name={this.state[`${key}CustomName`]}
                        iconUrl={this.state.iconUrl}
                        handleSave={params => {
                          params.success();
                          this.setState(
                            {
                              [`${key}CustomName`]: params.name,
                            },
                            () => this.saveCustomName(key, params),
                          );
                        }}
                      />
                    )}
                  </Fragment>
                )}
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
              autoCloseDelay={0}
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
      <div className="otherToolBox orgManagementWrap">
        {keyVisible && (
          <ViewKeyDialog
            projectId={Config.projectId}
            visible={keyVisible}
            handleChangeVisible={this.handleChangeVisible}
          />
        )}
        <div className="orgManagementHeader">
          <Icon
            icon="backspace"
            className={cx('Hand mRight10 TxtMiddle Font24 adminHeaderIconColor', { hidden: level === 'index' })}
            onClick={() => this.toggleComp('index')}
          />
          <span className="Font17">{title}</span>
          <div className="flex"></div>
        </div>
        <div className="orgManagementContent toolContentBox">{this.renderContent()}</div>
      </div>
    );
  }
}
