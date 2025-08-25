import React from 'react';
import Account from 'src/pages/AuthService/components/Inputs/Account.jsx';
import Password from 'src/pages/AuthService/components/Inputs/Password.jsx';
import VerifyCode from 'src/pages/AuthService/components/Inputs/VerifyCode.jsx';
import Warn from 'src/pages/AuthService/components/Warn.jsx';

export default function (props) {
  return (
    <React.Fragment>
      <div className="messageBox mTop36">
        <Warn {...props} />
        <Account {...props} />
        <VerifyCode {...props} />
        <Password {...props} />
      </div>
    </React.Fragment>
  );
}
