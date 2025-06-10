import React, { Fragment, useState } from 'react';
import { Button, Checkbox, Divider, Input, InputNumber, Select, Tooltip } from 'antd';
import _ from 'lodash';
import { Dialog, Icon, Radio, Switch } from 'ming-ui';
import { formatNumberFromInput } from 'src/utils/control';
import { updateSysSettings } from '../common';
import PasswordRuleDialog from './components/PasswordRuleDialog';

const Register = props => {
  const { SysSettings } = md.global;
  const [twoFactorAuthenticationPriorityType, setTwoFactorAuthenticationPriorityType] = useState(
    SysSettings.twoFactorAuthenticationPriorityType,
  );
  const [enableTwoFactorAuthentication, setEnableTwoFactorAuthentication] = useState(
    SysSettings.enableTwoFactorAuthentication,
  );
  const [enableMultipleDevicesUse, setEnableMultipleDevicesUse] = useState(SysSettings.enableMultipleDevicesUse);

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
      <div className="Font17 bold mBottom25">{_l('登录')}</div>
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
      <Divider className="mTop20 mBottom20" />
      <LoginSession {...props} />
      <Divider className="mTop20 mBottom20" />
      {renderAllowLoginSameTime()}
    </div>
  );
};

const LoginSession = props => {
  const [isEdit, setIsEdit] = useState(false);
  const { SysSettings } = md.global;
  const [sysSettings, setSysSetting] = useState(_.pick(SysSettings, ['sessionWeb', 'sessionApp', 'sessionWebPortal']));
  const minMinutes = 10;
  const sessionList = [
    {
      title: _l('Web 系统账号'),
      key: 'sessionWeb',
    },
    {
      title: _l('Web 外部门户'),
      key: 'sessionWebPortal',
    },
    {
      title: _l('APP'),
      key: 'sessionApp',
    },
  ];

  return (
    <div className="">
      <div className="flex flexColumn mRight60">
        <div className="Font14 bold mBottom8">{_l('登录有效期')}</div>
        <div className="Gray_9e mBottom5">
          {_l('有效期不能小于%0分钟。当勾选活跃时自动延长有效期时，有效期将从活跃时刻重新计时', minMinutes)}
        </div>
      </div>
      <div className="">
        {sessionList.map(o => {
          const data = safeParse(sysSettings[o.key] || '');
          if (!data.v && !isEdit) return '';
          const saveSession = value => {
            const info = JSON.stringify({ ...data, ...value });
            setSysSetting({ ...sysSettings, [o.key]: info });
          };
          //输入非负整数，单位支持分钟、小时、天，默认用小时
          const handleValue = value => {
            let num = parseInt(value);
            if (data.t === 1) {
              num = isNaN(num) || num < minMinutes ? minMinutes : num;
            }
            saveSession({ v: num });
          };

          let text = '';
          if (!isEdit) {
            let v = data.v || minMinutes;
            if (data.r) {
              text =
                data.t === 1
                  ? _l('%0分钟，活跃时自动延长有效期', v)
                  : data.t === 2
                    ? _l('%0小时，活跃时自动延长有效期', v)
                    : _l('%0天，活跃时自动延长有效期', v);
            } else {
              text = data.t === 1 ? _l('%0分钟', v) : data.t === 2 ? _l('%0小时', v) : _l('%0天', v);
            }
          }

          return (
            <div className="settingItem ">
              {isEdit ? (
                <React.Fragment>
                  <div className="settingLabel Gray_75 Bold mTop8">{o.title}</div>
                  <div className="flexRow valignWrapper mTop8">
                    <InputNumber
                      className="Width120"
                      min={0}
                      value={data.v}
                      onBlur={e => handleValue(e.target.value)}
                      placeholder={_l('请输入')}
                      type="number"
                    />
                    <Select
                      style={{ width: 80 }}
                      className="mLeft10"
                      value={data.t || 2}
                      suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                      onChange={value => saveSession({ t: value })}
                    >
                      <Select.Option value={1}>{_l('分钟')}</Select.Option>
                      <Select.Option value={2}>{_l('小时')}</Select.Option>
                      <Select.Option value={3}>{_l('天%250125')}</Select.Option>
                    </Select>
                    <Checkbox checked={data.r} className="mLeft10" onChange={() => saveSession({ r: !data.r })}>
                      {_l('活跃时自动延长有效期')}
                    </Checkbox>
                  </div>
                </React.Fragment>
              ) : (
                <div className="flexRow valignWrapper mTop8">
                  <span className="settingLabel Gray_75" style={{ width: 200 }}>
                    {o.title}
                  </span>
                  <span className="settingValue className='mLeft10'">{text}</span>
                </div>
              )}
            </div>
          );
        })}
        <div className="mTop10">
          {isEdit ? (
            <React.Fragment>
              <Button
                type="primary"
                onClick={() => {
                  let isErr = false;
                  let info = sysSettings;
                  sessionList.map(o => {
                    let data = safeParse(info[o.key] || '');
                    if (data.v) {
                      info = { ...info, [o.key]: JSON.stringify({ ...data, t: data.t || 2, r: !!data.r }) };
                    } else {
                      if (data.r || (data.t && data.t !== 2)) {
                        isErr = true;
                      } else {
                        info = { ...info, [o.key]: undefined };
                      }
                    }
                  });
                  if (isErr) {
                    alert(_l('请输入有效时间'), 3);
                    return;
                  }
                  updateSysSettings(info, () => {
                    sessionList.map(o => {
                      md.global.SysSettings[o.key] = info[o.key];
                    });
                    setIsEdit(false);
                  });
                }}
              >
                {_l('保存')}
              </Button>
              <Button className="mLeft16" onClick={() => setIsEdit(false)}>
                {_l('取消')}
              </Button>
            </React.Fragment>
          ) : (
            <Button ghost type="primary" onClick={() => setIsEdit(true)}>
              {_l('设置')}
            </Button>
          )}
        </div>
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
          <div className="Gray_9e">{_l('在首次登录自主创建的账号、导入的预设账号、被管理员重置密码的账号时生效')}</div>
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

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom25">{_l('用户密码')}</div>
      {renderPasswordOverdueDays()}
      <Divider className="mTop20 mBottom20" />
      {renderFirstLoginResetPassword()}
      <Divider className="mTop20 mBottom20" />
      {passwordRule()}
    </div>
  );
};

const RequiredStrictVerification = props => {
  const { SysSettings } = md.global;
  const [enableRequiredStrictVerification = false, setEnableRequiredStrictVerification] = useState(
    SysSettings.enableRequiredStrictVerification,
  );
  return (
    <div className="privateCardWrap flexColumn">
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn mRight60">
          <div className="Font17 bold mBottom10">{_l('接口防护')}</div>
          <div className="Gray_9e">
            {_l(
              '平台中部分接口需在未鉴权的情况下被调用，如：全局固定的配置信息；关联表字段结构；对外公开分享、查询和填写等。如果需要接口严格鉴权或响应体加密返回，可开启此配置。',
            )}
          </div>
          <div className="mTop5">{_l('注意：存在多访问地址时，仅主地址下有效')}</div>
        </div>
        <Switch
          checked={enableRequiredStrictVerification}
          onClick={value => {
            value = !value;
            updateSysSettings(
              {
                enableRequiredStrictVerification: value,
              },
              () => {
                setEnableRequiredStrictVerification(value);
                md.global.SysSettings.enableRequiredStrictVerification = value;
              },
            );
          }}
        />
      </div>
    </div>
  );
};

const LogOutAction = props => {
  const { SysSettings } = md.global;
  const [sessionExpireRedirectType = 1, setSessionExpireRedirectType] = useState(SysSettings.sessionExpireRedirectType);
  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold">{_l('账号退出时，已打开页面的处理方式')}</div>
      <div className="mTop10">
        {[
          { text: _l('停留在原页面，重新登录后可继续使用'), value: 1 },
          { text: _l('自动刷新到登录页'), value: 2 },
        ].map((item, index) => (
          <div className="mTop10">
            <Radio
              key={`sessionExpireRedirectType_${index}`}
              text={item.text}
              checked={sessionExpireRedirectType === item.value}
              onClick={() => {
                if (item.value === sessionExpireRedirectType) return;
                updateSysSettings(
                  {
                    sessionExpireRedirectType: item.value,
                  },
                  () => {
                    setSessionExpireRedirectType(item.value);
                    md.global.SysSettings.sessionExpireRedirectType = item.value;
                  },
                );
              }}
            />
            <span className="Block Gray_75 mTop10 mLeft30">
              {item.value === 1 ? _l('常规，不影响页面中正在操作的内容') : _l('更安全，但页面中正在编辑的内容将会丢失')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default props => {
  return (
    <Fragment>
      <Register {...props} />
      <UserPassword {...props} />
      <RequiredStrictVerification {...props} />
      <LogOutAction {...props} />
    </Fragment>
  );
};
