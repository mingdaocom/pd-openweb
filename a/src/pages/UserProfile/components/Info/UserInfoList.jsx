import React from 'react';

function InfoList(porps) {
  const { userInfo } = porps;
  const sex = userInfo => {
    var sexText = '';
    if (userInfo.gender === 2) {
      sexText = '女';
    } else if (userInfo.gender === 1) {
      sexText = '男';
    } else {
      sexText = '未填写';
    }
    return sexText;
  };
  const jobList = jobLists => {
    // 工作列表list
    if (jobLists.length > 0) {
      return (
        <div className="pLeft20 pRight20 mTop10">
          <h5 className="Font16 Normal mp0 mTop10 pLeft20">{_l('工作履历')}</h5>
          {jobLists.map((item, index) => {
            return (
              <div className="ThemeBorderColor4 LineHeight30 historyLi pAll10 pLeft20 WordBreak" key={index}>
                <div>
                  <span className="mRight5">{item.startDate}</span>
                  <span className="mRight5">{_l('至')}</span>
                  <span className="mRight5">{item.endDate}</span>
                  <span className="mRight10">{item.name}</span>
                  <span className="mRight10">{item.title}</span>
                </div>
                <div>
                  <span className="mRight5">{_l('描述：')}</span>
                  <span className="mRight10">{item.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      return null;
    }
  };

  const eduList = eduLists => {
    // 教育经历list
    if (eduLists.length > 0) {
      return (
        <div className="pLeft20 mTop10">
          <h5 className="Font16 Normal mp0 mTop10 pLeft20">{_l('教育经历')}</h5>
          {eduLists.map((item, index) => {
            return (
              <div className="ThemeBorderColor4 LineHeight30 historyLi pAll10 pLeft20 WordBreak" key={index}>
                <div>
                  <span className="mRight5">{item.startDate}</span>
                  <span className="mRight5">{_l('至')}</span>
                  <span className="mRight5">{item.endDate}</span>
                  <span className="mRight10">{item.name}</span>
                  <span className="mRight10">{item.title}</span>
                </div>
                <div>
                  <span className="mRight5">{_l('描述：')}</span>
                  <span className="mRight10">{item.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      return null;
    }
  };
  return (
    <div className="infoList w100">
      <div className="ThemeBorderColor4 BorderTop mAll10 pTop10 clearfix">
        <div className="Left pLeft20 pRight20 ThemeBorderColor4 BorderRight infoContact">
          <ul className="LineHeight25">
            <li>
              <span className="Gray_8 Left">{_l('生日')}：</span>&nbsp;
              <span className="Gray_6 TxtMaxW overflow_ellipsis">
                {userInfo.birthdate ? userInfo.birthdate.split(' ')[0] : _l('未填写')}
              </span>
            </li>
            <li>
              <span className="Gray_8 Left">{_l('性别')}：</span>&nbsp;
              <span className="Gray_6 TxtMaxW overflow_ellipsis">{sex(userInfo)}</span>
            </li>
            <li>
              <span className="Gray_8 Left">QQ：</span>&nbsp;
              <span className="Gray_6 TxtMaxW overflow_ellipsis">{userInfo.imqq ? userInfo.imqq : _l('未填写')}</span>
            </li>
            <li>
              <span className="Gray_8 Left">LinkeIn：</span>&nbsp;
              <span className="Gray_6 TxtMaxW overflow_ellipsis">
                {userInfo.snsLinkedin ? userInfo.snsLinkedin : _l('未填写')}
              </span>
            </li>
          </ul>
        </div>
        <div className="Left pLeft20 infoContact">
          <ul className="LineHeight25">
            <li>
              <span className="Gray_8 Left">{_l('微信：')}</span>&nbsp;
              <span className="Gray_6 TxtMaxW overflow_ellipsis">
                {userInfo.weiXin ? userInfo.weiXin : _l('未填写')}
              </span>
            </li>
            <li>
              <span className="Gray_8 Left">{_l('新浪微博：')}</span>&nbsp;
              <span className="Gray_6 TxtMaxW overflow_ellipsis InlineBlock">
                {userInfo.snsSina ? userInfo.snsSina : _l('未填写')}
              </span>
            </li>
            <li>
              <span className="Gray_8 Left">{_l('腾讯微博：')}</span>&nbsp;
              <span className="Gray_6 TxtMaxW overflow_ellipsis">{userInfo.snsQQ ? userInfo.snsQQ : _l('未填写')}</span>
            </li>
          </ul>
        </div>
      </div>
      {userInfo.jobList && userInfo.jobList.length > 0 && userInfo.eduList && userInfo.eduList.length > 0 ? (
        <div className="ThemeBorderColor4 BorderTop mAll10 historyBox mTop20">
          {jobList(userInfo.jobList)}
          {eduList(userInfo.eduList)}
        </div>
      ) : null}
    </div>
  );
}

export default InfoList;
