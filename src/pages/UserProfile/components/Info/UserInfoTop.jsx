import React from 'react';
import { connect } from 'react-redux';
import Clipboard from 'clipboard';
import * as actions from 'src/pages/chat/redux/actions';

@connect(_ => ({}))
class InfoTop extends React.PureComponent {
  componentDidMount() {
    this.bindClipboard();
  }

  componentDidUpdate() {
    this.bindClipboard();
  }

  componentWillUnmount() {
    if (this.clipboard && this.clipboard.destroy) {
      this.clipboard.destroy();
    }
  }

  bindClipboard() {
    if (this.btn && !this.clipboard) {
      this.clipboard = new Clipboard(this.btn, {
        text: () => {
          return $(this.btn).attr('data-clipboard-text');
        },
      });
      this.clipboard.on('success', function () {
        alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
      });
    }
  }

  render() {
    const { userInfo, isMe, dispatch } = this.props;

    const sendMessage = () => {
      dispatch(actions.addUserSession(userInfo.accountId));
    };

    return (
      <div className="pTop20 pRight20 pBottom10 pLeft20 LineHeight30">
        <div className="clearfix">
          <div className="Left TxtCenter mRight10">
            <div className="TxtCenter">
              <img src={userInfo.avatar} className="userAvatar" />
            </div>
            {isMe && (
              <div className="Hand TxtCenter mTop10">
                <a href="/personal?type=information&userInfo=avatarSetting">{_l('更换头像')}</a>
              </div>
            )}
          </div>
          <div className="Left infoBox">
            <div className="Height30 pLeft15">
              <span className="Font16 active Width400 overflow_ellipsis" title={userInfo.fullname}>
                {userInfo.fullname}
              </span>
              {isMe && (
                <a className="Right ThemeColor4 Font12" href="/personal?type=information" target="_blank">
                  {_l('修改个人设置')}
                </a>
              )}
            </div>
            {userInfo.companyName && (
              <div className="Height30 pLeft15 Gray_6 ">
                <span className="overflow_ellipsis Width500" title={userInfo.companyName}>
                  {userInfo.companyName}
                </span>
              </div>
            )}
            {userInfo.profession && (
              <div className="Height30 pLeft15 Gray_6">
                <span className="overflow_ellipsis Width500" title={userInfo.profession}>
                  {userInfo.profession}
                </span>
              </div>
            )}
            {userInfo.mobilePhone && (
              <div className="Height30 pLeft15 Gray_6">
                <span className="overflow_ellipsis Width500" title={userInfo.mobilePhone}>
                  {userInfo.mobilePhone}
                </span>
              </div>
            )}
            {userInfo.email && (
              <div className="Height30 pLeft15 Gray_6">
                <span id="span_emailContact" className="InlineBlock" title={userInfo.email}>
                  {userInfo.email}
                  <span
                    data-clipboard-text={userInfo.email}
                    className="ThemeColor3 Hand pLeft30"
                    ref={el => {
                      this.btn = el;
                    }}
                  >
                    {_l('复制')}
                  </span>
                </span>
              </div>
            )}
            <div className="Height30 pLeft15 Gray_6">
              <div className="Right mRight30 mTop3">
                {_l('积分：')}
                <span className="ThemeColor3">{userInfo.mark}</span>
                <span className="ThemeColor3 mLeft20">{userInfo.grade}</span>
              </div>
              <div className="gradePrograssBar mTop15 Left" id="gradePrograssBar">
                <div className="prograssBarBG ThemeBGColor6 boderRadAll_5">
                  <div className="prograssBar ThemeBGColor3 boderRadAll_5" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w100 clearfix">
          <div className="TxtMiddle pLeft5">
            {!isMe && (
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
        </div>
      </div>
    );
  }
}

export default InfoTop;
