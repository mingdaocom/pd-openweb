import React, { Component } from 'react';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Info from '../Info/UserInfo';
import UserFeed from 'src/pages/feed/components/app/userFeed';
import './index.less';

class UserProfile extends Component {
  renderFeed() {
    const { isLoading, isMe, userInfo: { fullname, accountId } = {} } = this.props;
    if (isLoading) {
      return <LoadDiv size="small" className={'mTop10'} />;
    }
    const title = isMe ? _l('我的动态墙') : _l('%0的动态墙', fullname);
    return (
      <div className="mTop10">
        <UserFeed accountId={accountId} title={title} />
      </div>
    );
  }

  render() {
    const { isLoading } = this.props;
    return (
      <div className="clearfix">
        <div className="clearfix Relative">{isLoading ? <LoadDiv size="small" /> : <Info {...this.props} />}</div>
        {this.renderFeed()}
      </div>
    );
  }
}

export default UserProfile;
