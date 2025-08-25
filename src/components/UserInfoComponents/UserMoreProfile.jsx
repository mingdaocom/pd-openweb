import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const MaterialInfoData = [
  { id: 'birthdate', text: _l('生日') },
  { id: 'gender', text: _l('性别') },
  { id: 'weiXin', text: _l('微信') },
  { id: 'snsLinkedin', text: _l('LinkedIn') },
  { id: 'snsSina', text: _l('新浪微博') },
];

const Wrap = styled.div`
  .materialInfo {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid #ddd;
    .materialInfoItem {
      width: ${({ rowNum }) => (rowNum ? `calc((100% - 0px) / ${rowNum})` : '100%')};
      overflow: hidden;
      line-height: 30px;
    }
  }
  .resumeItem {
    padding: 10px 8px;
    line-height: 30px;
    border-bottom: 1px dashed #ddd;
    word-wrap: break-word;
    word-break: break-word;
  }
  .noBorder {
    border: none;
  }
`;

// 更多资料
export default function UserMoreProfile(props) {
  const { className, userInfo, rowNum } = props;
  const [{ visible }, setState] = useSetState({ visible: false });

  const sex = userInfo => {
    return userInfo.gender === 2 ? _l('女') : _l('男');
  };

  // 工作列表list
  const renderJobList = (jobLists = []) => {
    if (!jobLists.length) {
      return null;
    }

    return (
      <div className="resumeWrap mTop10">
        <h5 className="Font14 bold">{_l('工作履历')}</h5>
        {jobLists.map((item, index) => {
          return (
            <div
              className={cx('resumeItem', {
                noBorder: index === jobLists.length - 1 && (!userInfo.jobList || !userInfo.jobList.length),
              })}
              key={index}
            >
              <div>
                <span className="mRight5">{item.startDate}</span>
                <span className="mRight5">{_l('至')}</span>
                <span className="mRight5">{item.endDate}</span>
                <span className="mRight10">{item.name}</span>
                <span className="mRight10">{item.title}</span>
              </div>
              <div>
                <span className="mRight5 Gray_75">{_l('描述：')}</span>
                <span className={`mRight10 ${item.description ? '' : 'Gray_bd'}`}>
                  {item.description || _l('未填写')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 教育经历list
  const renderEducationList = eduLists => {
    if (!eduLists.length) {
      return null;
    }

    return (
      <div className="resumeWrap mTop10 mBottom10">
        <h5 className="Font14 bold">{_l('教育经历')}</h5>
        {eduLists.map((item, index) => {
          return (
            <div className={cx('resumeItem', { noBorder: index === eduLists.length - 1 })} key={index}>
              <div>
                <span className="mRight5">{item.startDate}</span>
                <span className="mRight5">{_l('至')}</span>
                <span className="mRight5">{item.endDate}</span>
                <span className="mRight10">{item.name}</span>
                <span className="mRight10">{item.title}</span>
              </div>
              <div>
                <span className="mRight5 Gray_75">{_l('描述：')}</span>
                <span className={`mRight10 ${item.description ? '' : 'Gray_bd'}`}>
                  {item.description || _l('未填写')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Wrap className={className} rowNum={rowNum}>
      {visible && (
        <div className="infoList">
          <div
            className={cx('materialInfo pBottom10 mBottom10', {
              noBorder:
                visible &&
                (!userInfo.eduList || !userInfo.eduList.length) &&
                (!userInfo.jobList || !userInfo.jobList.length),
            })}
          >
            {MaterialInfoData.map(item => (
              <div key={item.id} className="materialInfoItem flexRow">
                <div className="Gray_75">{item.text}：</div>
                <div className="flex ellipsis">
                  {item.id === 'birthdate' && userInfo.birthdate ? (
                    moment(userInfo.birthdate).format('YYYY-MM-DD')
                  ) : item.id === 'gender' && userInfo.gender ? (
                    sex(userInfo)
                  ) : userInfo[item.id] ? (
                    userInfo[item.id]
                  ) : (
                    <span className="Gray_bd">{_l('未填写')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {userInfo.jobList && userInfo.jobList.length > 0 && userInfo.eduList && userInfo.eduList.length > 0 ? (
            <div>
              {renderJobList(userInfo.jobList)}
              {renderEducationList(userInfo.eduList)}
            </div>
          ) : null}
        </div>
      )}
      <div
        className="Hand Gray_9e pBottom20 InlineBlock"
        onClick={() => {
          setState({ visible: !visible });
          $('.infoList').slideToggle();
        }}
      >
        <span>{visible ? _l('收起') : _l('更多资料')}</span>
        <i className={cx('icon-arrow-down mLeft5', visible ? 'icon-arrow-up' : '')} />
      </div>
    </Wrap>
  );
}

UserMoreProfile.propTypes = {
  className: PropTypes.string,
  userInfo: PropTypes.object,
  hideNoBorder: PropTypes.bool,
  rowNum: PropTypes.number,
};
