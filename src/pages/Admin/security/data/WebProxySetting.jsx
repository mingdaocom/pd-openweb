import React, { Component } from 'react';
import { Switch, Icon, Button, LoadDiv } from 'ming-ui';
import { Input, Checkbox } from 'antd';
import projectSettingController from 'src/api/projectSetting';
import styled from 'styled-components';
import { encrypt } from 'src/util';

const ipRegExp =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;
const portRegExp = new RegExp(
  /^([1-9](\d{0,3}))$|^([1-5]\d{4})$|^(6[0-4]\d{3})$|^(65[0-4]\d{2})$|^(655[0-2]\d)$|^(6553[0-5])$/,
);

const FormBox = styled.div`
  flex: 1;
  min-height: 0;
  padding: 0 32px;
  .formModuleTitle {
    color: #333333;
    font-size: 15px;
    font-weight: 600;
    margin: 25px 0 32px 30px;
  }
  .formItem {
    display: flex;
    color: #333333;
    font-size: 13px;
    margin-bottom: 10px;
    .formLabel {
      width: 140px;
      text-align: right;
      margin-right: 8px;
      margin-top: 8px;
      &.width135 {
        width: 135px;
        margin-right: 20px;
      }
    }
    .formRight {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      .formInput {
        display: flex;
        align-items: center;
        & > input,
        & > .ant-select {
          width: 40%;
          height: 36px;
          .ant-select-selector {
            width: 100%;
            height: 100%;
          }
        }
      }
      &.directionRow {
        flex-direction: row;
      }
    }
    .errorMsg {
      padding-top: 4px;
      height: 25px;
      color: #fb0038;
    }
  }
  .mLeft150 {
    margin-left: 150px;
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
      .catch(err => {
        this.setState({ loading: false });
      });
  }

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
        projectId: this.props.projectId,
      })
      .then(res => {
        this.setState({ isSaveWebProxy: false, saveDisabled: false });
        if (res) {
          alert(_l('保存成功'));
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .catch(err => {
        this.setState({ saveDisabled: false });
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
    const { onClose = () => {} } = this.props;
    const { http, https, ip, portNumber, openIdentityValidate, userName, webProxyPassword, isSaveWebProxy, loading } =
      this.state;
    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('API网络代理')}</div>
          </div>
        </div>
        {loading ? (
          <div className="flex">
            <LoadDiv />
          </div>
        ) : (
          <FormBox className="formBox">
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
            <Button
              className="mLeft150"
              radius
              type="primary"
              onClick={this.handleSaveWebProxy}
              disabled={this.state.saveDisabled}
            >
              {this.state.saveDisabled ? _l('保存中') : _l('保存')}
            </Button>
          </FormBox>
        )}
      </div>
    );
  }
}
