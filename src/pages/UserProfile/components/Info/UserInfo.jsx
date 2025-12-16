import React, { Component } from 'react';
import UserMoreProfile from 'src/components/UserInfoComponents/UserMoreProfile.jsx';
import InfoTop from './UserInfoTop';

class Info extends Component {
  state = {};

  render() {
    return (
      <React.Fragment>
        <div className="userInfoBox card BoderRadAll_5">
          <InfoTop {...this.props} />

          <UserMoreProfile {...this.props} className="mLeft20 mRight20" rowNum={3} />
        </div>
      </React.Fragment>
    );
  }
}

export default Info;
