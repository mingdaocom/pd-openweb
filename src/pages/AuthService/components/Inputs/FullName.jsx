import React, { useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';

// 'inputFullname',//账户名
export default function (props) {
  const { warnList = [], fullName, onChange = () => {}, focusDiv, accountTxtType, accountTxt } = props;
  const warn = _.find(warnList, it => it.tipDom === 'inputFullname');
  const InputRef = useRef();
  const getTxt = () => {
    let txt = _l('用户名');
    switch (accountTxtType) {
      case 10:
        txt = _l('用户名');
        break;
      case 12:
        txt = _l('手机号');
        break;
      case 13:
        txt = _l('邮箱');
        break;
      case 100:
        txt = accountTxt;
        break;
    }
    return txt;
  };

  return (
    <React.Fragment>
      <div
        className={cx('mesDiv', {
          hasValue: !!fullName || focusDiv === 'inputFullname',
          errorDiv: warn,
          warnDiv: warn && warn.noErr,
          errorDivCu: !!focusDiv && focusDiv === 'inputFullname',
        })}
      >
        <input
          type="text"
          id="fullName"
          value={fullName || ''}
          onBlur={() => onChange({ focusDiv: '' })}
          onFocus={() => onChange({ focusDiv: 'inputFullname' })}
          ref={InputRef}
          placeholder={fullName || ''}
          onChange={e => {
            let data = _.filter(warnList, it => it.tipDom !== 'inputFullname');
            onChange({
              fullName: e.target.value,
              focusDiv: 'inputFullname',
              warnList: data,
            });
          }}
        />
        <div
          className="title"
          onClick={() => {
            InputRef.current.focus();
          }}
        >
          {getTxt()}
        </div>
        {warn && <div className={cx('warnTips')}>{warn.warnTxt}</div>}
      </div>
    </React.Fragment>
  );
}
