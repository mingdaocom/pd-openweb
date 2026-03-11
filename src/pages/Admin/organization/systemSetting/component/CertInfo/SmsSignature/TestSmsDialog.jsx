import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, FunctionWrap, intlTelInput } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import certificationApi from 'src/api/certification';
import userApi from 'src/api/user';
import { checkForm } from 'src/pages/Admin/user/membersDepartments/structure/constant';

const InputWrapper = styled.div`
  .iti--inline-dropdown {
    width: 100%;
  }
  .iti__flag {
    display: none;
  }
  .iti__tel-input {
    padding-left: 48px;
  }
`;

function TestSms(props) {
  const { onCancel, signId, signName, projectId } = props || {};
  const mobileRef = useRef(null);
  const itiRef = useRef(null);
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    if (mobileRef && mobileRef.current) {
      itiRef.current && itiRef.current.destroy();
      itiRef.current = intlTelInput(mobileRef.current, {
        customPlaceholder: '',
        separateDialCode: true,
        showSelectedDialCode: true,
        initialCountry: 'cn',
        onlyCountries: ['cn'],
        allowDropdown: false,
      });

      if (itiRef.current) {
        userApi.getAccountBaseInfo().then(res => {
          itiRef.current.setNumber(res?.mobilePhone || '');
        });
      }
    }

    return () => {
      itiRef.current && itiRef.current.destroy();
    };
  }, []);

  const onTestSms = () => {
    const mobilePhone = itiRef.current?.getNumber();
    const mobileError = checkForm['mobile'](mobilePhone, itiRef.current);

    if (mobileError) {
      alert(mobileError, 3);
      return;
    }

    const onSend = (captchaData = {}) => {
      if (!_.isEmpty(captchaData) && captchaData.ret !== 0) {
        return;
      }

      setSendLoading(true);

      certificationApi
        .sendTestSmsSignature({
          ticket: captchaData.ticket,
          randStr: captchaData.randstr,
          captchaType: md.global.getCaptchaType(),
          projectId,
          id: signId,
          mobilePhone,
        })
        .then(res => {
          switch (res) {
            case 1:
              alert(_l('发送成功'));
              onCancel();
              break;
            case 3:
              alert(_l('图形验证码失败'), 3);
              break;
            case 8:
              alert(_l('该手机号发送过于频繁'), 3);
              break;
            default:
              alert(_l('发送失败'), 2);
              break;
          }
        })
        .finally(() => {
          setSendLoading(false);
        });
    };

    new captcha(onSend, isOk => {
      if (isOk) return;
      setSendLoading(false);
    });
  };

  return (
    <Dialog
      visible
      width={600}
      title={_l('短信发送测试')}
      description={_l('可通过发送一条短信来测试当前签名是否可以正常使用，短信发送后会自动扣费')}
      onCancel={onCancel}
      onOk={onTestSms}
      okText={sendLoading ? _l('发送中...') : _l('确定')}
      okDisabled={sendLoading}
    >
      <div className="textSecondary bold mBottom8 mTop8">{_l('短信内容')}</div>
      <div className="">{_l('【%0】您的验证码是1234，感谢您的使用！', signName)}</div>
      <div className="textSecondary bold mBottom8 mTop16">{_l('手机号')}</div>
      <InputWrapper>
        <input type="tel" className="ming Input w100" ref={mobileRef} placeholder={_l('请输入手机号')} />
      </InputWrapper>
    </Dialog>
  );
}

export const TestSmsDialog = props => FunctionWrap(TestSms, { ...props });
