import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Button, Checkbox, Input, Switch, Tooltip } from 'ming-ui/antd-components';
import projectSettingController from 'src/api/projectSetting';
import { encrypt } from 'src/utils/services/security/encryption';

const ipRegExp =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/;
const portRegExp = new RegExp(
  /^([1-9](\d{0,3}))$|^([1-5]\d{4})$|^(6[0-4]\d{3})$|^(65[0-4]\d{2})$|^(655[0-2]\d)$|^(6553[0-5])$/,
);

const FormBox = styled.div`
  padding: 0 32px 24px 32px;
  .formModuleTitle {
    font-weight: 600;
  }
  .formRight {
    width: 560px;
  }
  .proxyPortInput {
    flex: 0 0 112px;
    width: 112px;
  }
  .errorMsg {
    padding-top: 4px;
    height: 25px;
  }
`;

export default class WebProxySetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    projectSettingController
      .getApiProxySettings({
        projectId: this.props.projectId,
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
          });
        }

        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  handleSaveWebProxy = isEnable => {
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
        projectId: this.props.projectId,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          isEnable ? this.updateWebProxyState() : this.setState({ isSaveWebProxy: false, saveDisabled: false });
        } else {
          alert(_l('操作失败'), 2);
          this.setState({ isSaveWebProxy: false, saveDisabled: false });
        }
      })
      .catch(() => {
        this.setState({ saveDisabled: false });
      });
  };

  updateWebProxyState = () => {
    const { projectId, apiProxyEnabled, updateApiProxyEnabled } = this.props;

    this.setState({ saveDisabled: true });
    projectSettingController.setApiProxyState({ projectId, state: !apiProxyEnabled }).then(res => {
      if (res) {
        updateApiProxyEnabled(!apiProxyEnabled);
        this.setState({ saveDisabled: false, isSaveWebProxy: false });
      }
    });
  };

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

  render() {
    const { onClose = () => {}, apiProxyEnabled } = this.props;
    const { http, https, ip, portNumber, openIdentityValidate, userName, webProxyPassword, isSaveWebProxy, loading } =
      this.state;

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 hoverColorPrimary pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('API 网络代理')}</div>
          </div>
        </div>
        {loading ? (
          <div className="flex">
            <LoadDiv />
          </div>
        ) : (
          <FormBox className="flex flexColumn minHeight0">
            <div className="flex">
              <div className="formModuleTitle textTitle Font15 mTop25 mBottom32">{_l('代理服务器设置')}</div>
              <div className="formItem textTitle Font14 mBottom8">
                <div className="formLabel flexRow alignItemsCenter mBottom12">
                  <span className="Red">*</span>
                  {_l('接口类型')}
                  <Tooltip title={_l('是指通过代理访问的目标 URL 的协议类型')}>
                    <Icon icon="info_outline" className="Font16 textTertiary mLeft5 pointer" />
                  </Tooltip>
                </div>
                <div className="formRight flexColumn wMax100 minWidth0">
                  <div className="formInput flexRow alignItemsCenter w100">
                    <Checkbox
                      className="mRight40"
                      checked={http}
                      onChange={checked => {
                        this.changeValue(checked, 'http', 'checkbox');
                      }}
                    >
                      HTTP
                    </Checkbox>
                    <Checkbox
                      checked={https}
                      onChange={checked => {
                        this.changeValue(checked, 'https', 'checkbox');
                      }}
                    >
                      HTTPS
                    </Checkbox>
                  </div>
                  <div className="errorMsg textError">
                    {isSaveWebProxy && !http && !https ? _l('请选择接口类型') : ''}
                  </div>
                </div>
              </div>
              <div className="formItem textTitle Font14 mBottom8">
                <div className="formLabel flexRow alignItemsCenter mBottom12">
                  <span className="Red">*</span>
                  {_l('代理地址')}
                  <Tooltip
                    title={_l(
                      '填写代理服务器的 IP 地址或域名，如 192.168.1.10 或 proxy.example.com，不包含 http://、https://',
                    )}
                  >
                    <Icon icon="info_outline" className="Font16 textTertiary mLeft5 pointer" />
                  </Tooltip>
                </div>
                <div className="formRight flexColumn wMax100 minWidth0">
                  <div className="formInput flexRow alignItemsCenter w100">
                    <Input
                      className="flex minWidth0 Height36"
                      placeholder={_l('IP地址或域名地址')}
                      value={ip}
                      onChange={e => {
                        this.changeValue(e, 'ip', 'input');
                      }}
                      onBlur={e => {
                        this.setState({ ip: e.target.value.trim().replace(/^https?:\/\//i, '') });
                      }}
                    />
                    <span className="mLeft10 mRight10 LineHeight32">:</span>
                    <Input
                      className="proxyPortInput Height36"
                      placeholder={_l('端口')}
                      value={portNumber}
                      onChange={e => {
                        this.changeValue(e, 'portNumber', 'input');
                      }}
                    />
                  </div>
                  <div className="errorMsg textError">
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
              <div className="formItem textTitle Font14 mBottom8">
                <div className="formLabel flexRow alignItemsCenter mBottom12">{_l('身份验证')}</div>
                <div className="formRight flexColumn wMax100 minWidth0">
                  <div className="formInput flexRow alignItemsCenter w100">
                    <Switch
                      size="small"
                      checked={openIdentityValidate}
                      onClick={(checked, event) => {
                        event.stopPropagation();
                        this.changeValue(!checked, 'openIdentityValidate', 'switch');
                      }}
                    />
                  </div>
                  <div className="errorMsg"></div>
                </div>
              </div>
              {openIdentityValidate && (
                <div className="formItem textTitle Font14 mBottom8">
                  <div className="formLabel flexRow alignItemsCenter mBottom12">
                    <span className="Red">*</span>
                    {_l('用户名')}
                  </div>
                  <div className="formRight flexColumn wMax100 minWidth0">
                    <div className="formInput flexRow alignItemsCenter w100">
                      <Input
                        className="w100 Height36"
                        placeholder={_l('用户名')}
                        value={userName}
                        onChange={e => {
                          this.changeValue(e, 'userName', 'input');
                        }}
                      />
                    </div>
                    <div className="errorMsg textError">
                      {isSaveWebProxy && openIdentityValidate && !userName ? _l('请输入用户名') : ''}
                    </div>
                  </div>
                </div>
              )}
              {openIdentityValidate && (
                <div className="formItem textTitle Font14 mBottom8">
                  <div className="formLabel flexRow alignItemsCenter mBottom12">
                    <span className="Red">*</span>
                    {_l('密码')}
                  </div>
                  <div className="formRight flexColumn wMax100 minWidth0">
                    <div className="formInput flexRow alignItemsCenter w100">
                      <Input.Password
                        className="w100 Height36"
                        placeholder={_l('密码')}
                        value={webProxyPassword}
                        autocomplete="new-password"
                        onChange={e => {
                          this.changeValue(e, 'webProxyPassword', 'input');
                        }}
                      />
                    </div>
                    <div className="errorMsg textError">
                      {isSaveWebProxy && openIdentityValidate && !webProxyPassword ? _l('请输入密码') : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flexRow alignItemsCenter">
              {apiProxyEnabled ? (
                <Fragment>
                  <Button
                    type="primary"
                    className="mRight10"
                    onClick={() => this.handleSaveWebProxy(false)}
                    disabled={this.state.saveDisabled}
                  >
                    {_l('更新设置')}
                  </Button>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={this.updateWebProxyState}
                    disabled={this.state.saveDisabled}
                  >
                    {_l('关闭此功能')}
                  </Button>
                </Fragment>
              ) : (
                <Button
                  color="var(--color-success)"
                  variant="solid"
                  onClick={() => this.handleSaveWebProxy(true)}
                  disabled={this.state.saveDisabled}
                >
                  {_l('启用')}
                </Button>
              )}
            </div>
          </FormBox>
        )}
      </div>
    );
  }
}
