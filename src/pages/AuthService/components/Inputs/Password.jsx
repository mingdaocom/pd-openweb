import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import Icon from 'ming-ui/components/Icon';
import RegExpValidator from 'src/utils/expression';

// 'inputPassword',//密码
export default function (props) {
  const { warnList = [], password, onChange = () => {}, focusDiv, keys } = props;
  const [{ isOpen, inputType }, setState] = useSetState({ isOpen: false, inputType: 'text' });

  const warn = _.find(warnList, it => it.tipDom === 'inputPassword');
  const InputRef = useRef();

  useEffect(() => {
    setState({
      inputType:
        (keys.includes('setPassword') && isOpen) || (keys.includes('setPassword') && !password) ? 'text' : 'password',
    });
  }, [keys, isOpen, password]);

  const passwordOnWarn = (txt, changeWarn, info) => {
    if (keys.includes('setPassword') || (changeWarn && keys.includes('password'))) {
      let data = _.filter(warnList, it => !('inputPassword' === it.tipDom));
      //设置密码时，提示密码规则 符合验证则不再提示
      if (!RegExpValidator.isPasswordValid(txt) && keys.includes('setPassword')) {
        data = data.concat({
          tipDom: 'inputPassword',
          noErr: true,
          warnTxt:
            _.get(window, 'md.global.SysSettings.passwordRegexTip') ||
            `${_l('· 密码长度为8-20 字符')}<br/>${_l('· 需包含字母和数字，区分大小写')}`,
        });
      }
      onChange({ ...info, warnList: data });
    } else {
      onChange({ ...info });
    }
  };
  return (
    <React.Fragment>
      <div
        className={cx('mesDiv', {
          hasValue: !!password || focusDiv === 'inputPassword',
          errorDiv: warn,
          warnDiv: warn && warn.noErr,
          errorDivCu: !!focusDiv && focusDiv === 'inputPassword',
        })}
      >
        <input
          type={inputType}
          className="passwordIcon"
          ref={InputRef}
          onBlur={e => {
            let data = _.filter(warnList, it => !('inputPassword' === it.tipDom && it.noErr));
            onChange({ focusDiv: '', warnList: data });
          }}
          onFocus={e => passwordOnWarn(e.target.value, false, { focusDiv: 'inputPassword' })}
          onChange={e => passwordOnWarn(e.target.value, true, { password: e.target.value })}
          autoComplete={'new-password'} //密码不自动填充
        />
        <div className="title" onClick={e => onChange({ focusDiv: 'inputPassword' })}>
          {_l('密码')}
        </div>
        {keys.includes('setPassword') && (
          <span className="passwordTip Hand" onClick={() => setState({ isOpen: !isOpen })}>
            <Icon type={!isOpen ? 'eye_off' : 'eye'} />
          </span>
        )}
        {warn && (
          <div
            className={cx('warnTips', { noIcon: !!warn.noErr })}
            dangerouslySetInnerHTML={{ __html: warn.warnTxt }}
          ></div>
        )}
      </div>
    </React.Fragment>
  );
}
