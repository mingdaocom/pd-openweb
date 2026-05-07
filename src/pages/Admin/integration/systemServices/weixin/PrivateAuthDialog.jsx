import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Input } from 'ming-ui';
import projectAjax from 'src/api/project';

const FORM_CONFIG = [
  { key: 'name', label: _l('服务号名称'), type: 'text' },
  {
    key: 'appId',
    label: _l('开发者ID（AppID）'),
    type: 'text',
    description: _l('微信服务号管理后台-设置与开发-基本配置页面内的字段'),
  },
  {
    key: 'appSecret',
    label: _l('开发者密码(AppSecret)'),
    type: 'password',
    description: _l('微信服务号管理后台-设置与开发-基本配置页面内的字段'),
  },
];

const DialogWrap = styled(Dialog)`
  .icon-wechat {
    font-size: 110px;
    color: var(--color-success);
  }
  .desTxt {
    line-height: 29px;
    width: 580px;
    margin: 0 auto;
    font-size: 14px;
  }
  .formGroup {
    width: 520px;
    margin: 0 auto;
    .required {
      color: var(--color-error);
      margin-right: 4px;
    }
    .error {
      border-color: var(--color-error) !important;
    }
    .errorMessage {
      color: var(--color-error);
      margin-top: 5px;
    }
    .description {
      font-size: 13px;
      color: var(--color-text-tertiary);
      text-align: left;
      margin-top: 10px;
    }
  }
  .desc {
    width: 520px;
    margin: 0 auto;
    text-align: left;
  }
`;

export default function PrivateAuthDialog(props) {
  const { visible, projectId, onCancel, getWeiXinBindingInfo } = props;
  const [state, setState] = useState({ name: '', appId: '', appSecret: '' });
  const { name, appId, appSecret } = state;

  const changeFormData = (value, item) => {
    setState({ ...state, [item.key]: value, [`${item.key}Error`]: false });
  };

  // 提交授权
  const handleSubmit = () => {
    if ([name, appId, appSecret].some(item => !_.trim(item))) {
      setState({ ...state, nameError: !_.trim(name), appIdError: !_.trim(appId), appSecretError: !_.trim(appSecret) });
      return;
    }

    projectAjax.addTpAuthorizerInfo({ projectId, name, appId, appSecret }).then(res => {
      if (res) {
        onCancel();
        getWeiXinBindingInfo();
      }
    });
  };

  return (
    <DialogWrap visible={visible} onCancel={onCancel} title={_l('绑定微信服务号')} width={680} onOk={handleSubmit}>
      <div className="TxtCenter">
        <span className="icon-wechat icon" />
      </div>
      <div className="bold Font22 TxtCenter">{_l('绑定微信服务号')}</div>
      <div className="desTxt TxtCenter">
        {_l(
          '绑定服务号后，外部门户将可以通过指定的域名获取该服务号下微信用户的授权及openID，可以通过工作流为外部的微信用户推送模板消息',
        )}
      </div>
      <div className="formGroup">
        {FORM_CONFIG.map(item => (
          <Fragment>
            <div className="mTop20 mBottom10 TxtLeft">
              <span className="required">*</span>
              {item.label}
            </div>
            <div className="formItem">
              {item.type == 'text' ? (
                <Input
                  className={cx('w100', { error: state[`${item.key}Error`] })}
                  onChange={val => changeFormData(val, item)}
                />
              ) : (
                <Input
                  className={cx('w100', { error: state[`${item.key}Error`] })}
                  type="password"
                  autoComplete="new-password"
                  onChange={val => changeFormData(val, item)}
                  visibilityToggle={false}
                />
              )}
            </div>
            {state[`${item.key}Error`] && <div className="errorMessage">{_l('请输入') + item.label}</div>}
            {item.description && <div className="description">{item.description}</div>}
          </Fragment>
        ))}
      </div>
      <div className="desc">
        {_l('1.为了可以获取到 openID及基本信息 或使用模版消息功能必须选择')}
        <span className="Bold mLeft3">{_l('已认证的微信服务号')}</span>
      </div>
      <div className="desc">{_l('2.为获取微信授权需要将您公司的访问域名加入到服务号的网页授权域名内')}</div>
    </DialogWrap>
  );
}
