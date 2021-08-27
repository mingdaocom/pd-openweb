import React, { Component } from 'react';
import cx from 'classnames';
import InfoTop from './UserInfoTop';
import InfoList from './UserInfoList';
import CardInfo from './CardInfo';

class Info extends Component {
  state = {
    visible: false,
  };

  gradeAnimate = () => {
    const { userInfo } = this.props;
    var scoreValue = 0;
    if (userInfo.nextGrade) {
      var currentValue = userInfo.currentGrade.scoreValue;
      var NextValue = userInfo.nextGrade.scoreValue;
      scoreValue = (userInfo.mark - currentValue) / (NextValue - currentValue);
    } else {
      scoreValue = 1;
    }
    var gradeLineW = $('#gradePrograssBar').width();
    $('#gradePrograssBar .prograssBar')
      .show()
      .animate(
        {
          width: scoreValue * gradeLineW,
        },
        3000
      );
  };

  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
    $('.infoList').slideToggle();
  };

  componentDidMount() {
    this.gradeAnimate();
  }

  render() {
    const { userInfo, isMe } = this.props;
    const { visible } = this.state;
    return (
      <React.Fragment>
        <div className="userInfoBox card BoderRadAll_5">
          <InfoTop {...this.props} />
          {visible && <InfoList {...this.props} />}
          <div className="Hand pLeft10 Gray_6 pBottom10 pRight40 Right">
            <span onClick={this.toggle}>{visible ? _l('收起完整信息') : _l('展示完整信息')}</span>
            <i className={cx('icon-arrow-down mLeft5 Gray_6', visible ? 'icon-arrow-up' : '')} />
          </div>
        </div>
        {userInfo.userCards && <CardInfo {...this.props} />}
      </React.Fragment>
    );
  }
}

export default Info;
