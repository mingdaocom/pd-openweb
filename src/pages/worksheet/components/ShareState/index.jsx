import React, { useState } from 'react';
import { Button, ConfigProvider, Form, Input } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { captcha } from 'ming-ui/functions';

const VerificationPassWrap = styled.div`
  .ant-form {
    width: 240px;
  }
  .ant-input,
  .ant-btn {
    height: 36px;
    border-radius: 4px;
  }
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: none;
  }
  .ant-btn-primary[disabled],
  .ant-btn-primary[disabled]:hover,
  .ant-btn-primary[disabled]:focus,
  .ant-btn-primary[disabled]:active {
    background-color: #e0e0e0;
    border: none;
  }
  .ant-input-status-error:not(.ant-input-disabled):not(.ant-input-borderless).ant-input,
  .ant-input-status-error:not(.ant-input-disabled):not(.ant-input-borderless).ant-input:hover {
    border-color: #f44336;
  }
  .ant-form-item-explain-error {
    color: #f44336;
    font-size: 12px;
  }
`;

export const SHARE_STATE = {
  4: _l('数据不存在'),
  7: _l('无权限'),
  8: _l('分享已关闭'),
  14: _l('图形验证验证错误'),
  17: _l('链接已失效'),
  18: _l('需要密码'),
  19: _l('密码错误'),
};

export const ShareState = props => {
  const { code } = props;
  return (
    <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter WhiteBG">
      <Icon className="mBottom20" icon="error1" style={{ color: '#ddd', fontSize: 70 }} />
      <div className="Font17 Gray_9e">{SHARE_STATE[code]}</div>
    </div>
  );
};

export const VerificationPass = props => {
  const { validatorPassPromise } = props;
  const [loading, setLoading] = useState(false);
  const [fromFields, setFromFields] = useState([]);
  const [form] = Form.useForm();

  const passwordField = _.find(fromFields, { name: ['sharePassword'] });

  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      <VerificationPassWrap className="w100 h100 flexColumn justifyContentCenter WhiteBG">
        <div className="flexColumn alignItemsCenter" style={{ marginTop: -120 }}>
          <div className="flexRow alignItemsCenter mBottom18">
            <div className="Font13 mRight5">{_l('请输入密码访问')}</div>
            <div className="Font12">{_l('(密码区分大小写)')}</div>
          </div>
          <Form
            form={form}
            name="shareform"
            validateTrigger="submit"
            onFinish={() => {
              setLoading(false);
            }}
            onFinishFailed={() => {
              setLoading(false);
            }}
            onFieldsChange={changedFields => {
              setFromFields(changedFields);
            }}
            autoComplete="off"
          >
            <input type="password" hidden autoComplete="new-password" />
            <Form.Item
              name="sharePassword"
              rules={[
                {
                  required: true,
                  message: _l('请输入密码访问'),
                },
                () => ({
                  validator: (_, value) => {
                    return new Promise(async (resolve, reject) => {
                      const callback = data => {
                        if (data.ret === 0) {
                          setLoading(true);
                          const captchaResult = {
                            randStr: data.randstr,
                            ticket: data.ticket,
                            captchaType: md.global.getCaptchaType(),
                          };
                          resolve(validatorPassPromise(value, captchaResult));
                        } else {
                          reject(_l('图形验证失败'));
                        }
                      };
                      new captcha(callback);
                    });
                  },
                }),
              ]}
            >
              <Input.Password
                className="Font13"
                autoComplete="off"
                placeholder={_l('请输入密码')}
                visibilityToggle={false}
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button
                className="w100 bold"
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={passwordField ? passwordField.value.length < 4 || passwordField.value.length > 8 : true}
              >
                {_l('确定')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </VerificationPassWrap>
    </ConfigProvider>
  );
};
