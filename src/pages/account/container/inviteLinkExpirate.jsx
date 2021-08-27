import React from 'react';
import './inviteLinkExpirate.less'

export default class InviteLinkExpirate extends React.Component {

  componentDidMount() {
    $('html').addClass('inviteLinkExpirate');
  }

  componentWillUnmount() {
    $('html').removeClass('inviteLinkExpirate');
  }

  render() {
    return <React.Fragment>
      <div className="TxtCenter">
        <div className="Font20 mTop40 Gray">{_l('链接已失效')}</div>
      </div>
    </React.Fragment>
  }
}

