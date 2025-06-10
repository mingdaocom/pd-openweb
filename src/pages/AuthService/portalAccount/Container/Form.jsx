import React, { createRef } from 'react';
import _ from 'lodash';
import Account from 'src/pages/AuthService/components/Inputs/Account.jsx';
import Password from 'src/pages/AuthService/components/Inputs/Password.jsx';
import VerifyCode from 'src/pages/AuthService/components/Inputs/VerifyCode.jsx';
import Warn from 'src/pages/AuthService/components/Warn.jsx';

export default function (props) {
  const { keys = [] } = props;
  return (
    <React.Fragment>
      <div className="messageBox mTop36">
        <Warn {...props} />
        {(keys.includes('tel') || keys.includes('email') || keys.includes('emailOrTel')) && <Account {...props} />}
        {keys.includes('code') && <VerifyCode {...props} />}
        {(keys.includes('password') || keys.includes('setPassword')) && <Password {...props} />}
      </div>
    </React.Fragment>
  );
}
