import { VERIFY_TYPE } from 'src/utils/domain/security/verification';

export const VERIFY_TYPE_CONFIG = {
  [VERIFY_TYPE.password]: {
    text: _l('登录密码'),
    icon: 'lock',
    color: 'var(--color-primary)',
  },
  [VERIFY_TYPE.mobilePhone]: {
    text: _l('短信验证码'),
    icon: 'chat-message',
    color: 'var(--color-success)',
  },
  [VERIFY_TYPE.email]: {
    text: _l('邮件验证码'),
    icon: 'email',
    color: 'var(--color-warning)',
  },
  [VERIFY_TYPE.totp]: {
    text: _l('身份验证器'),
    icon: 'gpp_good',
    color: 'var(--color-mingo)',
  },
  [VERIFY_TYPE.bioVerify]: {
    text: _l('App生物识别'),
    icon: 'mobile',
    color: 'var(--color-primary)',
  },
};

export const getVerifyTypeText = verifyType => VERIFY_TYPE_CONFIG[verifyType].text;
