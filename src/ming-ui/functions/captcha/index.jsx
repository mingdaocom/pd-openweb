﻿import React, { Fragment } from 'react';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import { generateRandomPassword } from 'src/utils/common';
import './index.less';

export default (callback = () => {}, onCancel = () => {}) => {
  const randstr = generateRandomPassword(16);
  const getImgLink = () => {
    return `${
      __api_server__.main
    }code/CreateVerifyCodeImage?width=320&height=130&fontSize=30&randstr=${randstr}&${Math.random()}`;
  };
  const LANG_MAPS = {
    'zh-Hans': 'zh-cn',
    'zh-Hant': 'zh-hk',
    ja: 'en',
    en: 'en',
  };

  if (md.global.getCaptchaType() === 1) {
    Dialog.confirm({
      title: _l('请输入验证码'),
      closable: false,
      anim: false,
      width: 368,
      description: (
        <Fragment>
          <input type="text" className="captchaInput" autoFocus />
          <div className="captchaImg">
            <img src={getImgLink()} />
          </div>
          <div className="mTop10">
            <span
              className="ThemeColor3 ThemeHoverColor2 pointer"
              onClick={() => {
                $('.captchaImg img').attr('src', getImgLink());
              }}
            >
              {_l('看不清，换一张')}
            </span>
          </div>
        </Fragment>
      ),
      onOk: () => {
        return new Promise(function (reslove, reject) {
          const value = $('.captchaInput').val().trim();

          if (!value) {
            alert(_l('请输入验证码'), 3);
            reject(true);
          } else {
            callback({ ret: 0, ticket: value, randstr: randstr });
            reslove();
          }
        });
      },
      onCancel,
    });
  } else {
    new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback, {
      needFeedBack: false,
      userLanguage: LANG_MAPS[window.getCurrentLang()],
    }).show();
  }
};
