import React from 'react';
import cx from 'classnames';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import _ from 'lodash';

// 特殊手机号验证是否合法
export const specialTelVerify = value => {
  return /\+861[3-9]\d{9}$/.test(value || '');
};

export const inputFocusFn = (e, cb) => {
  $(e.target).closest('.mesDiv').addClass('current').find('.title').addClass('focusTitle');
  $(e.target)
    .closest('.errorDiv')
    .addClass('errorDivCu')
    .siblings('.errorDiv')
    .removeClass('errorDivCu')
    .find('.warnningTip')
    .hide();
  $(e.target).closest('.errorDiv').find('.warnningTip').removeClass('Hidden').show();
  if (cb) {
    cb();
  }
};

export const inputBlurFn = (e, cb) => {
  $(e.target).closest('.mesDiv').find('.title').removeClass('focusTitle');
  if (!e.target.value) {
    $(e.target).closest('.mesDiv').removeClass('current');
  }
  $(e.target).closest('.errorDiv').removeClass('errorDivCu');
  $(e.target).closest('.errorDiv').find('.warnningTip').addClass('Hidden').hide();
  if (cb) {
    cb();
  }
};
//className list=> current,errorDiv,errorDivCu
export const setWarnningData = (warnningData, list, focusDiv, currentData) => {
  return {
    current: !!currentData,
    errorDiv: _.find(warnningData, it => _.includes(list, it.tipDom)),
    errorDivCu:
      !!warnningData[0] && _.includes(list, warnningData[0].tipDom) && $(focusDiv).is($(warnningData[0].tipDom)),
  };
};
//render warnningTip
export const warnningTipFn = (warnningData, list, focusDiv) => {
  let data = _.find(warnningData, it => _.includes(list, it.tipDom));
  if (data) {
    return (
      <div
        className={cx('warnningTip', {
          Hidden:
            (!!warnningData[0] && !_.includes(list, warnningData[0].tipDom)) ||
            !$(focusDiv).is($(warnningData[0].tipDom)),
        })}
      >
        {data.warnningText}
      </div>
    );
  }
};

// 当前页面是否有验证码层
export const hasCaptcha = () => {
  return (
    document.getElementById('tcaptcha_iframe') ||
    (document.getElementsByClassName('captchaInput') && document.getElementsByClassName('captchaInput').length > 0)
  );
};

export const getDataByFilterXSS = summary => {
  let domain = summary.split('/'); //以“/”进行分割
  if (domain[2]) {
    domain = domain[2];
  } else {
    domain = ''; //如果url不正确就取空
  }
  if (summary.indexOf('javascript:') >= 0 || (domain.indexOf('mingdao') < 0 && domain !== location.host)) {
    return '/app';
  }
  return filterXSS(summary, {
    stripIgnoreTag: true,
    whiteList: Object.assign({}, whiteList, { span: ['style'] }),
  });
};
