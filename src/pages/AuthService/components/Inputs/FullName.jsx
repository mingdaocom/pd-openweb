import React, { useRef } from 'react';
import _ from 'lodash';
import cx from 'classnames';

// 'inputFullname',//账户名
export default function (props) {
  const { warnList = [], fullName, onChange = () => {}, focusDiv } = props;
  const warn = _.find(warnList, it => it.tipDom === 'inputFullname');
  const InputRef = useRef();

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
          onClick={e => {
            InputRef.current.focus();
          }}
        >
          {_l('用户名')}
        </div>
        {warn && <div className={cx('warnTips')}>{warn.warnTxt}</div>}
      </div>
    </React.Fragment>
  );
}
