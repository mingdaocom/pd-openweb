import React, { Fragment, useState } from 'react';
import { Dialog, Switch, Icon } from 'ming-ui';
import { Button, Select, Tooltip, Input, Divider } from 'antd';
import PasswordRuleDialog from './components/PasswordRuleDialog';
import { formatNumberFromInput } from 'src/util';
import { updateSysSettings } from '../common';
import _ from 'lodash';

const Register = props => {
  const { SysSettings } = md.global;
  const [twoFactorAuthenticationPriorityType, setTwoFactorAuthenticationPriorityType] = useState(
    SysSettings.twoFactorAuthenticationPriorityType,
  );
  const [enableTwoFactorAuthentication, setEnableTwoFactorAuthentication] = useState(
    SysSettings.enableTwoFactorAuthentication,
  );

  const handleChangeEnableTwoFactorAuthentication = () => {
    const value = !enableTwoFactorAuthentication;
    if (value) {
      Dialog.confirm({
        buttonType: 'danger',
        okText: _l('开启'),
        title: <span className="Red Bold">{_l('是否开启两步验证 ?')}</span>,
        description: (
          <div>
            {_l(
              '开启后，除了基于账号密码的登录认证，还需要通过手机号或邮箱接收验证码进行二次认证，所以请确保组织成员的手机号、邮箱的合法性，同时确保系统内的短信服务、邮件服务已正常启用。',
            )}
          </div>
        ),
        onOk: () => {
          updateSysSettings(
            {
              enableTwoFactorAuthentication: value,
              twoFactorAuthenticationPriorityType: twoFactorAuthenticationPriorityType || 1,
            },
            () => {
              setEnableTwoFactorAuthentication(value);
              md.global.SysSettings.enableTwoFactorAuthentication = value;
              md.global.SysSettings.twoFactorAuthenticationPriorityType = twoFactorAuthenticationPriorityType || 1;
            },
          );
        },
      });
    } else {
      updateSysSettings(
        {
          enableTwoFactorAuthentication: value,
        },
        () => {
          setEnableTwoFactorAuthentication(value);
          md.global.SysSettings.enableTwoFactorAuthentication = value;
        },
      );
    }
  };

  const handleChangeTwoFactorAuthenticationPriorityType = value => {
    updateSysSettings(
      {
        twoFactorAuthenticationPriorityType: value,
      },
      () => {
        setTwoFactorAuthenticationPriorityType(value);
        md.global.SysSettings.twoFactorAuthenticationPriorityType = value;
      },
    );
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('登录验证')}</div>
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn mRight60">
          <div className="Font14 bold mBottom8">{_l('二次验证')}</div>
          <div className="Font13 Gray_9e mBottom8">
            {_l(
              '此项为“登录二次验证”，开启后，除了基于账号密码的登录认证，还需要通过手机号或邮箱接收验证码进行二次认证，所以请确保组织成员的手机号、邮箱的合法性，同时确保系统内的短信服务、邮件服务已正常启用。',
            )}
          </div>
        </div>
        <Switch checked={enableTwoFactorAuthentication} onClick={handleChangeEnableTwoFactorAuthentication} />
      </div>
      <div className="flexRow valignWrapper mTop5">
        <div className="Gray_75 Font13 mRight10">{_l('二次验证方式优先级')}</div>
        <Select
          className="mRight10"
          style={{ width: 120 }}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          value={twoFactorAuthenticationPriorityType}
          onChange={handleChangeTwoFactorAuthenticationPriorityType}
        >
          <Select.Option value={1}>{_l('手机号')}</Select.Option>
          <Select.Option value={2}>{_l('邮箱')}</Select.Option>
        </Select>
        <Tooltip title={_l('登录时优先采用设置的验证方式进行验证')} placement="bottom">
          <Icon className="Font16 Gray_bd pointer" icon="info_outline" />
        </Tooltip>
      </div>
    </div>
  );
};

const overdueDays = [
  {
    name: _l('不过期'),
    value: 0,
  },
  {
    name: _l('1天'),
    value: 1,
  },
  {
    name: _l('2天'),
    value: 2,
  },
  {
    name: _l('5天'),
    value: 5,
  },
  {
    name: _l('15天'),
    value: 15,
  },
  {
    name: _l('30天'),
    value: 30,
  },
  {
    name: _l('自定义'),
    value: -1,
  },
];

const UserPassword = props => {
  const { SysSettings } = md.global;
  const [passwordOverdueDays, setPasswordOverdueDays] = useState(SysSettings.passwordOverdueDays || 0);
  const [customDay, setCustomDay] = useState(_.find(overdueDays, { value: passwordOverdueDays }) ? false : true);

  const changePasswordOverdueDays = value => {
    updateSysSettings(
      {
        passwordOverdueDays: value,
      },
      () => {
        setPasswordOverdueDays(value);
        md.global.SysSettings.passwordOverdueDays = value;
      },
    );
  };

  const inputSavePasswordOverdueDays = event => {
    const value = Number(formatNumberFromInput(event.target.value));
    if (value !== passwordOverdueDays) {
      changePasswordOverdueDays(value);
    }
  };

  const renderPasswordOverdueDays = () => {
    return (
      <Fragment>
        <div className="flex flexColumn mRight60">
          <div className="Font14 bold mBottom8">{_l('密码有效期')}</div>
          <div className="Font13 Gray_9e mBottom8">{_l('密码过期后，用户需设置新密码才能使用系统')}</div>
        </div>
        <div className="flexRow valignWrapper">
          <div className="Gray_75 Font13 mRight10">{_l('过期天数')}</div>
          <Select
            className="mRight10"
            style={{ width: 120 }}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            value={_.find(overdueDays, { value: passwordOverdueDays }) ? passwordOverdueDays : -1}
            onChange={value => {
              if (value === -1) {
                setCustomDay(true);
                setPasswordOverdueDays(value);
              } else {
                setCustomDay(false);
                changePasswordOverdueDays(value);
              }
            }}
          >
            {overdueDays.map(item => (
              <Select.Option value={item.value}>{item.name}</Select.Option>
            ))}
          </Select>
          {customDay && (
            <div className="flexRow valignWrapper">
              <Input
                style={{ width: 100 }}
                className="passwordOverdueDaysInput"
                defaultValue={passwordOverdueDays === -1 ? 0 : passwordOverdueDays}
                placeholder={_l('请输入')}
                onBlur={event => {
                  inputSavePasswordOverdueDays(event);
                }}
                onKeyDown={event => {
                  if (event.which === 13) {
                    inputSavePasswordOverdueDays(event);
                  }
                }}
              />
              <div className="mLeft10">{_l('天')}</div>
            </div>
          )}
        </div>
      </Fragment>
    );
  };

  const [firstLoginResetPassword, setFirstLoginResetPassword] = useState(SysSettings.firstLoginResetPassword);

  const renderFirstLoginResetPassword = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('首次登录需修改密码')}</div>
          <div className="Gray_9e">{_l('此设置仅对自主创建或导入的预设账号生效')}</div>
        </div>
        <Switch
          checked={firstLoginResetPassword}
          onClick={value => {
            value = !value;
            updateSysSettings(
              {
                firstLoginResetPassword: value,
              },
              () => {
                setFirstLoginResetPassword(value);
                md.global.SysSettings.firstLoginResetPassword = value;
              },
            );
          }}
        />
      </div>
    );
  };

  const [passwordRegex, setPasswordRegex] = useState(SysSettings.passwordRegex);
  const [passwordRegexTip, setPasswordRegexTip] = useState(SysSettings.passwordRegexTip);
  const [passwordRuleDialogVisible, setPasswordRuleDialogVisible] = useState(false);
  const [enableMultipleDevicesUse, setEnableMultipleDevicesUse] = useState(SysSettings.enableMultipleDevicesUse);

  const passwordRule = () => {
    const style = { width: 100 };
    return (
      <div className="flexColumn">
        <div className="Font14 bold mBottom8">{_l('密码规则')}</div>
        <div className="Gray_9e mBottom18">{_l('启用后，平台用户密码安全策略将按配置进行强校验')}</div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">
            {_l('密码规则')}
          </div>
          <div>{passwordRegex}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">
            {_l('提示说明')}
          </div>
          <div>{passwordRegexTip}</div>
        </div>
        <div>
          <Button
            ghost
            type="primary"
            onClick={() => {
              setPasswordRuleDialogVisible(true);
            }}
          >
            {_l('设置')}
          </Button>
        </div>
        <PasswordRuleDialog
          visible={passwordRuleDialogVisible}
          config={{
            passwordRegex,
            passwordRegexTip,
          }}
          onCancel={() => {
            setPasswordRuleDialogVisible(false);
          }}
          onSave={({ passwordRegex, passwordRegexTip }) => {
            updateSysSettings(
              {
                passwordRegex,
                passwordRegexTip,
              },
              () => {
                setPasswordRegex(passwordRegex);
                setPasswordRegexTip(passwordRegexTip);
                md.global.SysSettings.passwordRegex = passwordRegex;
                md.global.SysSettings.passwordRegexTip = passwordRegexTip;
              },
            );
          }}
        />
      </div>
    );
  };

  const renderAllowLoginSameTime = () => {
    return (
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn mRight60">
          <div className="Font14 bold mBottom8">{_l('允许同时登录')}</div>
          <div className="Gray_9e">
            {_l(
              '开启时，平台账户可自行配置设备登录限制(账户管理-->安全设置)；关闭后，平台用户仅可在同设备类型登录一个终端，例如在Web浏览器登录后，将会使其他Web浏览器登录的同一账号强制退出登录，以确保账户登录安全，手机APP同理',
            )}
          </div>
        </div>
        <Switch
          checked={enableMultipleDevicesUse}
          onClick={value => {
            value = !value;
            updateSysSettings(
              {
                enableMultipleDevicesUse: value,
              },
              () => {
                setEnableMultipleDevicesUse(value);
                md.global.SysSettings.enableMultipleDevicesUse = value;
              },
            );
          }}
        />
      </div>
    );
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('用户密码')}</div>
      {renderPasswordOverdueDays()}
      <Divider className="mTop20 mBottom20" />
      {renderFirstLoginResetPassword()}
      <Divider className="mTop20 mBottom20" />
      {passwordRule()}
      <Divider className="mTop20 mBottom20" />
      {renderAllowLoginSameTime()}
      <Divider className="mTop20 mBottom20" />
    </div>
  );
};

export default props => {
  return (
    <Fragment>
      <Register {...props} />
      <UserPassword {...props} />
    </Fragment>
  );
};
