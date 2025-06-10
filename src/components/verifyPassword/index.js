import _ from 'lodash';
import { captcha } from 'ming-ui/functions';
import accountAjax from 'src/api/account';
import { encrypt } from 'src/utils/common';

/**
 * 验证登录密码
 * @param {Object} options - 选项对象
 * @param {string} options.projectId - 网络 ID
 * @param {string} options.password - 登录密码
 * @param {boolean} options.closeImageValidation - 是否前3次关闭图像验证
 * @param {boolean} options.isNoneVerification - 是否一小时内免验证
 * @param {boolean} options.checkNeedAuth - 检测是否免验证
 * @param {string} options.customActionName - 自定义 AJAX API 接口名称
 * @param {boolean} options.ignoreAlert - 忽略报错
 * @param {Function} options.success - 验证成功的回调函数
 * @param {Function} options.fail - 验证失败的回调函数
 */
export default ({
  projectId = '',
  password = '',
  closeImageValidation = false,
  isNoneVerification = false,
  checkNeedAuth = false,
  customActionName = '',
  ignoreAlert = false,
  success = () => {},
  fail = () => {},
}) => {
  const ERROR_CODE = {
    6: _l('密码不正确'),
    8: _l('验证码错误'),
  };
  const cb = function (res) {
    if (res.ret !== 0) {
      return;
    }

    accountAjax[
      customActionName
        ? customActionName
        : checkNeedAuth || closeImageValidation
          ? 'checkAccountIdentity'
          : 'checkAccount'
    ](
      checkNeedAuth
        ? { projectId }
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
      } else if (statusCode === 10) {
        new captcha(cb);
      } else if (checkNeedAuth && _.includes([6, 9], statusCode)) {
        fail(statusCode === 6 ? 'showPasswordAndNoneVerification' : 'showPassword');
      } else {
        !ignoreAlert && alert(ERROR_CODE[statusCode] || _l('操作失败'), 2);
        fail();
      }
    });
  };

  // 前3次关闭图像验证
  if (closeImageValidation || checkNeedAuth) {
    cb({ ret: 0 });
  } else {
    new captcha(cb);
  }
};
