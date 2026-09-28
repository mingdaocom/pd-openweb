import { isVerifyCodeType, VERIFY_TYPE } from 'src/utils/domain/security/verification';
import { encrypt } from 'src/utils/services/security/encryption';

export const buildAccountIdentityParams = ({
  projectId = '',
  password = '',
  verifyCode = '',
  verifyType = VERIFY_TYPE.password,
  isNoneVerification = false,
  ticket,
  randStr,
  captchaType,
}) => {
  const baseParams = {
    projectId,
    isNoneVerification,
    type: verifyType,
  };

  if (isVerifyCodeType(verifyType)) {
    return {
      ...baseParams,
      verifyCode,
    };
  }

  return {
    ...baseParams,
    ticket,
    randStr,
    captchaType,
    password: encrypt(password),
  };
};
