import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import 'src/components/mdBusinessCard/mdBusinessCard';
import { MEMBER_STATUS } from '../../constant';

export default class Member extends Component {
  componentDidMount() {
    const $member = $(this.memberItem);
    const { bindBusinessCard } = this.props;
    $member.on('mouseover', () => {
      const { member, isCreateUser } = this.props;
      bindBusinessCard($member, member, isCreateUser);
    });
  }

  componentDidUpdate(prevProps) {
    const $member = $(this.memberItem);
    $member.mdBusinessCard('destroy');
    if (!$member.data('md.businesscard')) {
      const { bindBusinessCard } = this.props;
      $member.on('mouseover', () => {
        const { member, isCreateUser } = this.props;
        bindBusinessCard($member, member, isCreateUser);
      });
    }
  }

  componentWillUnmout() {
    const $member = $(this.memberItem);
    if ($member.data('md.businesscard')) {
      $member.mdBusinessCard('destroy');
    }
  }

  render() {
    const { member: { head, memberName, status, face, nickName }, isCreateUser, isWxMember } = this.props;
    return (
      <span
        className="memberItem"
        ref={el => {
          this.memberItem = el;
        }}
      >
        {!isWxMember ? (
          <img src={head ? head.replace(/\/w\/(\w+)\/h\/(\w+)/, '/w/26/h/26') : ''} alt={memberName} className="memberAvatar" />
        ) : (
          <img src={face} alt={nickName} className="memberAvatar" />
        )}
        {(() => {
          if (isCreateUser) return null;
          if (isWxMember) return <span className="memberStatus confirmed" />;
          switch (status) {
            case MEMBER_STATUS.UNCONFIRMED:
            default:
              return <span className="memberStatus unConfirmed" />;
            case MEMBER_STATUS.CONFIRMED:
              return <span className="memberStatus confirmed" />;
            case MEMBER_STATUS.REFUSED:
              return <span className="memberStatus refused" />;
          }
        })()}
        {!isWxMember ? <span className="memberName">{memberName}</span> : <span className="memberName">{nickName}</span>}
        {isCreateUser ? <span>{_l('（发起人）')}</span> : null}
      </span>
    );
  }
}
