import React from 'react';
import cx from 'classnames';
import { SupportFindVerifyCodeUrl } from 'src/pages/AuthService/config.js';
import { emitter } from 'src/util';
import { isTel } from 'src/pages/AuthService/util.js';

// 'code',//验证码计时与报错提示
export default function (props) {
  const { warnList, keys, emailOrTel, type } = props;
  let warn = _.find(warnList, it => it.tipDom === 'code');
  if (!warn) return null;
  return warn.warnTxt == 'txt' ? (
    <div
      className={cx('warnTxtDiv', {
        RedWarn: warn.isError,
        GreenWarn: !warn.isError,
      })}
    >
      <a href={SupportFindVerifyCodeUrl} target="_blank">
        {_l('收不到验证码？')}
      </a>
      {(keys.includes('emailOrTel') || keys.includes('tel')) && isTel(emailOrTel) && type !== 'portalLogin' ? (
        <React.Fragment>
          {_l('重新获取或')}
          <span onClick={() => emitter.emit('ON_SEND_VERIFYCODE_VOICE')} className="mLeft2">
            <a href="javascript:;" className="lblVoiceVerifyCode">
              {_l('获取语音验证码')}
            </a>
          </span>
        </React.Fragment>
      ) : (
        _l('重新获取')
      )}
    </div>
  ) : (
    <div
      className={cx('warnTxtDiv', { RedWarn: warn.isError, GreenWarn: !warn.isError })}
      dangerouslySetInnerHTML={{ __html: warn.warnTxt }}
    />
  );
}
