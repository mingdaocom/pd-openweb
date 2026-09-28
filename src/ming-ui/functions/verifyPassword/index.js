import _ from 'lodash';
import accountAjax from 'src/api/account';
import { getVerifyPasswordErrorMessage, isVerifyCodeType, VERIFY_TYPE } from 'src/utils/domain/security/verification';
import { isBioVerifyAvailable } from 'src/utils/platform/browser/device';
import { buildAccountIdentityParams } from 'src/utils/services/security/accountIdentity';
import { encrypt } from 'src/utils/services/security/encryption';
import captcha from '../captcha';

/**
 * 验证登录密码
 * @param {Object} options - 选项对象
 * @param {string} options.projectId - 网络 ID
 * @param {string} options.password - 登录密码
 * @param {string} options.verifyCode - 验证码
 * @param {number} options.verifyType - 验证方式 0=密码 1=短信 2=邮箱 3=TOTP 4=App生物识别
 * @param {boolean} options.closeImageValidation - 是否前3次关闭图像验证
 * @param {boolean} options.isNoneVerification - 是否一小时内免验证
 * @param {boolean} options.showVerifyType - 是否启用多种验证方式
 * @param {boolean} options.checkNeedAuth - 检测是否免验证
 * @param {string} options.customActionName - 自定义 AJAX API 接口名称
 * @param {boolean} options.ignoreAlert - 忽略报错
 * @param {Function} options.onBioVerifyFallback - 生物识别失败后返回备用验证方式
 * @param {Function} options.success - 验证成功的回调函数
 * @param {Function} options.fail - 验证失败的回调函数
 */
export default ({
  projectId = '',
  password = '',
  verifyCode = '',
  verifyType = VERIFY_TYPE.password,
  closeImageValidation = false,
  isNoneVerification = false,
  showVerifyType = false,
  checkNeedAuth = false,
  customActionName = '',
  ignoreAlert = false,
  onBioVerifyFallback = () => {},
  success = () => {},
  fail = () => {},
}) => {
  if (!checkNeedAuth && verifyType === VERIFY_TYPE.bioVerify) {
    const handleBioVerifyFallback = () => onBioVerifyFallback(isNoneVerification);

    if (!isBioVerifyAvailable()) {
      handleBioVerifyFallback();
      return;
    }

    try {
      window.md_js.bioVerify({
        success,
        fail: res => {
          window.nativeAlert(JSON.stringify(res));
          handleBioVerifyFallback();
        },
        cancel: handleBioVerifyFallback,
      });
    } catch {
      handleBioVerifyFallback();
    }

    return;
  }

  const cb = function (res) {
    if (res.ret !== 0) {
      return;
    }

    const actionName = customActionName
      ? customActionName
      : checkNeedAuth || showVerifyType || closeImageValidation || isNoneVerification || isVerifyCodeType(verifyType)
        ? 'checkAccountIdentity'
        : 'checkAccount';

    accountAjax[actionName](
      checkNeedAuth
        ? { projectId }
        : actionName === 'checkAccountIdentity'
          ? buildAccountIdentityParams({
              projectId,
              password,
              verifyCode,
              verifyType,
              isNoneVerification,
              ticket: res.ticket,
              randStr: res.randstr,
              captchaType: md.global.getCaptchaType(),
            })
          : {
              projectId,
              isNoneVerification,
              ticket: res.ticket,
              randStr: res.randstr,
              captchaType: md.global.getCaptchaType(),
              password: encrypt(password),
            },
    ).then(statusCode => {
      if (statusCode === 1) {
        success();
      } else if (statusCode === 10 && verifyType === VERIFY_TYPE.password) {
        new captcha(cb);
      } else if (checkNeedAuth && _.includes([6, 9], statusCode)) {
        fail(statusCode === 6 ? 'showPasswordAndNoneVerification' : 'showPassword');
      } else {
        !ignoreAlert && alert(getVerifyPasswordErrorMessage(statusCode, verifyType), 2);
        fail(statusCode);
      }
    });
  };

  // 验证码/TOTP 身份验证不需要图形验证码；密码方式沿用原有图形验证码策略
  if (closeImageValidation || checkNeedAuth || isVerifyCodeType(verifyType)) {
    cb({ ret: 0 });
  } else {
    new captcha(cb);
  }
};
