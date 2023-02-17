import React, { Component } from 'react';
import cx from 'classnames';
import projectAjax from 'src/api/project';
import departmentController from 'src/api/department';
import { Tooltip } from 'ming-ui';
import _ from 'lodash';

class CardInfo extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      cadrIndex: 0,
      isMore: false,
      cardList: [],
      fullDepartmentInfo: {},
    };
  }

  hoverBg = () => {
    $('.showMorecards li').hover(
      function () {
        $(this).addClass('ThemeBGColor4 White');
      },
      function () {
        $(this).removeClass('ThemeBGColor4 White');
      },
    );
  };

  showCardList = (userInfo = {}, project = {}) => {
    //切换网络
    projectAjax.getEffectiveUsersCount({ projectId: project.projectId }).then(count => {
      let user = {
        userInfo,
        projectId: project.projectId,
        accountId: userInfo.accountId,
        count: count,
      };
      this.setState({
        user,
      });
    });
  };

  selectCard = index => {
    const { userInfo } = this.props;
    this.setState({
      cadrIndex: index,
      cardList: userInfo.userCards[index],
    });
    this.showCardList(userInfo, userInfo.userCards[index]);
  };

  setCardList = index => {
    const { userInfo } = this.props;
    const userCards = userInfo.userCards;
    let x = 3;
    userCards.splice(x - 1, 1, ...userCards.splice(index, 1, userCards[x - 1]));
    this.setState({
      cadrIndex: 2,
      cardList: userCards[2],
    });
    this.showCardList(userInfo, userInfo.userCards[2]);
  };

  showMoreCard = () => {
    this.setState({
      isMore: !this.state.isMore,
    });
  };

  getDepartmentFullName = (departmentData = []) => {
    let { fullDepartmentInfo } = this.state;
    const departmentIds = departmentData.map(item => item.departmentId).filter(it => !fullDepartmentInfo[it]);
    if (_.isEmpty(departmentIds)) {
      return;
    }
    departmentController
      .getDepartmentFullNameByIds({
        projectId: this.state.cardList.projectId,
        departmentIds,
      })
      .then(res => {
        res.forEach(it => {
          fullDepartmentInfo[it.id] = it.name;
        });
        this.setState({ fullDepartmentInfo });
      });
  };

  cardsList = (cardsLists = {}) => {
    const { fullDepartmentInfo = {} } = this.state;
    return (
      <li className="Left LineHeight30 pTop10 pBottom20" key={cardsLists.projectId}>
        {/* <span className="Left Width300">
          <span className="Left">{_l('组织')}：&nbsp;</span>
          {cardsLists.companyName ? (
            <span className="companyName overflow_ellipsis Width200 Left" title={cardsLists.companyName}>
              {cardsLists.companyName}
            </span>
          ) : (
            <span className="companyName overflow_ellipsis Width200 Left">{_l('未填写')}</span>
          )}
        </span> */}
        <span className="Left Width300">
          <span className="Left">{_l('部门')}：&nbsp;</span>
          {cardsLists.departmentInfos && cardsLists.departmentInfos.length > 0 ? (
            <span
              className="department overflow_ellipsis Width200 Left"
              onMouseEnter={() => this.getDepartmentFullName(cardsLists.departmentInfos)}
            >
              <Tooltip
                action={['hover']}
                tooltipClass="departmentFullNametip"
                popupPlacement="bottom"
                text={
                  <div>
                    {cardsLists.departmentInfos.map((v, depIndex) => {
                      const fullName = (this.state.fullDepartmentInfo[v.departmentId] || '').split('/');
                      return (
                        <div className={cx({ mBottom8: depIndex < cardsLists.departmentInfos.length - 1 })}>
                          {fullName.map((n, i) => (
                            <span>
                              {n}
                              {fullName.length - 1 > i && <span className="mLeft8 mRight8">/</span>}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                }
                mouseEnterDelay={0.5}
              >
                <span>{cardsLists.departmentInfos.map(it => it.departmentName).join(';')}</span>
              </Tooltip>
            </span>
          ) : (
            <span className="department overflow_ellipsis Width200 Left">{_l('未填写')}</span>
          )}
        </span>
        <span className="Left Width200">
          <span className="Left">{_l('职位')}：&nbsp;</span>
          {cardsLists.jobInfos && cardsLists.jobInfos.length > 0 ? (
            <Tooltip
              style={{ maxWidth: '400px' }}
              offset={[-50, 0]}
              text={<span>{cardsLists.jobInfos.map(it => it.jobName).join(';')}</span>}
              action={['hover']}
            >
              <span className="job overflow_ellipsis Width120 Left">
                {cardsLists.jobInfos.map(it => it.jobName).join(';')}
              </span>
            </Tooltip>
          ) : (
            <span className="job overflow_ellipsis Width120 Left">{_l('未填写')}</span>
          )}
        </span>

        <span className="Left Width200">
          <span className="Left">{_l('工作地点')}：&nbsp;</span>
          {cardsLists.workSite ? (
            <span className="workSite overflow_ellipsis Width120 Left" title={cardsLists.workSite}>
              {cardsLists.workSite}
            </span>
          ) : (
            <span className="workSite overflow_ellipsis Width120 Left">{_l('未填写')}</span>
          )}
        </span>

        <span className="Left Width300">
          <span className="Left">{_l('工号')}：&nbsp;</span>
          {cardsLists.jobNumber ? (
            <span className="jobNumber overflow_ellipsis Width120 Left" title={cardsLists.jobNumber}>
              {cardsLists.jobNumber}
            </span>
          ) : (
            <span className="jobNumber overflow_ellipsis Width120 Left">{_l('未填写')}</span>
          )}
        </span>

        <span className="Left Width200">
          <span className="Left">{_l('工作电话')}：&nbsp;</span>

          {cardsLists.contactPhone ? (
            <span className="contactPhone overflow_ellipsis Width120 Left" title={cardsLists.contactPhone}>
              {cardsLists.contactPhone}
            </span>
          ) : (
            <span className="contactPhone overflow_ellipsis Width120 Left">{_l('未填写')}</span>
          )}
        </span>
      </li>
    );
  };
  closeMoreCard = e => {
    const { isMore } = this.state;
    if (!isMore) {
      return;
    }
    if (!(e.target == $('.showMorecards')[0] || $.contains($('.showMorecards')[0], e.target))) {
      this.setState({
        isMore: false,
      });
    }
  };
  componentDidMount() {
    this.selectCard(0);
    document.addEventListener('click', this.closeMoreCard, false);
  }
  componentDidUpdate() {
    this.hoverBg();
  }
  componentWillUnmount() {
    document.removeEventListener('click', this.closeMoreCard, false);
  }

  render() {
    const { userInfo } = this.props;
    const { cadrIndex, isMore, cardList } = this.state;
    return (
      <div className="cardInfoBox card BoderRadAll_5 mTop15">
        <div className="businessCard-wrapper enterprise-businessCard">
          <h5 className="Font16 Normal mp0">{_l('名片')}</h5>
          <div className="tabCardTitle">
            <ul className="BorderBottom borderColor_d8 clearfix">
              {userInfo.userCards
                .filter(item => item.companyName)
                .map((item, index) => {
                  if (index < 3) {
                    return (
                      <li
                        className={cx(
                          'Left LineHeight40 tabCardTitleLi',
                          cadrIndex == index ? 'ThemeBorderColor3' : '',
                        )}
                        title={item.companyName}
                        key={index}
                        onClick={() => this.selectCard(index)}
                      >
                        {item.companyName}
                      </li>
                    );
                  }
                })}

              {userInfo.userCards.filter(item => item.companyName).length > 3 && (
                <div
                  className="Left LineHeight40 TxtCenter Hand showMorecards mLeft30 Relative"
                  onClick={this.showMoreCard}
                >
                  {_l('更多')}
                  <span className="icon-arrow-down-border mLeft10" />
                  {isMore && (
                    <ul className="Absolute card moreListCard">
                      {userInfo.userCards.map((item, index) => {
                        if (index >= 3) {
                          return (
                            <li
                              className="TxtLeft LineHeight30 pLeft10 pright10 overflow_ellipsis WordBreak"
                              title={item.companyName}
                              key={index}
                              onClick={() => this.setCardList(index)}
                            >
                              {item.companyName}
                            </li>
                          );
                        }
                      })}
                    </ul>
                  )}
                </div>
              )}
            </ul>
          </div>
          <div className="cardsList">
            <ul>{this.cardsList(cardList)}</ul>
          </div>
        </div>
      </div>
    );
  }
}

export default CardInfo;
