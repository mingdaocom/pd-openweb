import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import styled from 'styled-components';
import UserBaseProfile from 'src/components/UserInfoComponents/UserBaseProfile.jsx';
import * as actions from 'src/pages/chat/redux/actions';

const InfoTopWrap = styled.div`
  color: #151515;
  .userAvatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
  }
`;

@connect()
class InfoTop extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentUserCard: _.get(props, 'userInfo.userCards[0]') || {},
    };
  }

  render() {
    const { userInfo = {}, isMe, dispatch } = this.props;
    const { currentUserCard } = this.state;
    const { userCards = [] } = userInfo;

    const sendMessage = () => {
      dispatch(actions.addUserSession(userInfo.accountId));
    };

    return (
      <InfoTopWrap className="pTop20 pRight20 pBottom10 pLeft20">
        <div className="flexRow alignItemsCenter mBottom30">
          <img src={userInfo.avatar} className="userAvatar" />
          <div className="flex mLeft12" title={userInfo.fullname}>
            <div className="bold">{userInfo.fullname}</div>
            {userCards.length > 1 ? (
              <div className="ThemeColor">{_l('%0个共同组织', userCards.length)}</div>
            ) : (
              <div className="Gray_75">{currentUserCard.companyName || userInfo.companyName}</div>
            )}
          </div>
          {isMe ? (
            <a className="Right ThemeColor4 Font12" href="/personal?type=information" target="_blank">
              {_l('修改个人设置')}
            </a>
          ) : (
            <React.Fragment>
              <div className="Left">
                <a href="javascript:void(0);" className="NoUnderline">
                  <span className="mLeft10 TxtMiddle icon-replyto Font18 ThemeColor4" title={_l('发送私信')} />
                  <span className="TxtMiddle Font12 ThemeColor4 pLeft5" onClick={sendMessage}>
                    {_l('发送私信')}
                  </span>
                </a>
              </div>
              <div className="Left">
                <a href={`mailto:${userInfo.email}`} className="NoUnderline">
                  <span className="mLeft30 TxtMiddle icon-message Font18 ThemeColor4" title={_l('发送 E-mail')} />
                  <span className="TxtMiddle Font12 ThemeColor4 pLeft5">{_l('发送 E-mail')}</span>
                </a>
              </div>
            </React.Fragment>
          )}
        </div>
        <UserBaseProfile
          infoWrapClassName="flexRow"
          projects={userCards}
          rowNum={3}
          currentUserProject={currentUserCard}
          userInfo={userInfo}
        />
      </InfoTopWrap>
    );
  }
}

export default InfoTop;
