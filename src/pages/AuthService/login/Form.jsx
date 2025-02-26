import React, { createRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Account from 'src/pages/AuthService/components/Inputs/Account.jsx';
import Password from 'src/pages/AuthService/components/Inputs/Password.jsx';
import FullName from 'src/pages/AuthService/components/Inputs/FullName.jsx';

export default function (props) {
  const { warnList, keys } = props;
  let warn = _.find(warnList, it => it.tipDom === 'code');
  return (
    <React.Fragment>
      <div className="messageBox mTop24">
        {warn && (
          <div
            className={cx('warnTxtDiv', { RedWarn: warn.isError, GreenWarn: !warn.isError })}
            dangerouslySetInnerHTML={{ __html: warn.warnTxt }}
          ></div>
        )}
        {(keys.includes('emailOrTel') || keys.includes('tel') || keys.includes('email')) && <Account {...props} />}
        {keys.includes('fullName') && <FullName {...props} />}
        {(keys.includes('password') || keys.includes('setPassword')) && <Password {...props} />}
      </div>
    </React.Fragment>
  );
}
