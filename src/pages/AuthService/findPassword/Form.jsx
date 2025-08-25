import React from 'react';
import Account from 'src/pages/AuthService/components/Inputs/Account.jsx';
import Password from 'src/pages/AuthService/components/Inputs/Password.jsx';
import VerifyCode from 'src/pages/AuthService/components/Inputs/VerifyCode.jsx';
import Warn from 'src/pages/AuthService/components/Warn.jsx';

export default function (props) {
  return (
    <div className="messageBox mTop24">
      <Warn {...props} />
      <Account {...props} />
      <VerifyCode {...props} maxLength="6" />
      <Password {...props} />
    </div>
  );
}
