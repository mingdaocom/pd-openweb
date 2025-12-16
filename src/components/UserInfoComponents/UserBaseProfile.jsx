import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Divider } from 'antd';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { getFieldsData, maskValue } from 'src/pages/Admin/security/account/utils';
import DepartmentFullName from './DepartmentFullName';

const NoProjectCardInfoData = [
  { id: 'companyName', text: _l('组织') },
  { id: 'profession', text: _l('职位') },
  { id: 'mobilePhone', text: _l('手机') },
  { id: 'email', text: _l('邮箱') },
];

const UserProjectInfoWrap = styled.div`
  padding-bottom: 10px;
  border-bottom: 1px solid #ededed;
  color: #151515;
  font-size: 14px;
  .projectsWrap {
    display: inline-block;
    max-width: 100%;
    padding: 3px 5px;
    border-radius: 4px;
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
  &.noBorder {
    border: none;
  }
  .infoWrap {
    flex-wrap: wrap;
  }
  .itemInfo {
    width: ${({ rowNum }) => (rowNum ? `calc((100% - 0px) / ${rowNum})` : '100%')};
    overflow: hidden;
    line-height: 30px;
  }
  .personalDepartment {
    min-width: 0;
  }
  .maskIcon {
    display: inline-block;
    width: 24px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    cursor: pointer;
    margin-left: 5px;
    border-radius: 50%;
    &:hover {
      background: rgba(221, 221, 221, 0.31);
    }
  }
  .multipleJobs {
    padding-bottom: 10px;
    margin-bottom: 12px;
    border-bottom: 1px solid #ededed;
    &.noBorder {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 0;
    }
  }
`;

const ProjectsMenuCon = styled.div`
  width: 400px;
  height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  border-radius: 3px;
  padding-bottom: 5px;
  box-shadow:
    0 4px 20px rgb(0 0 0 / 13%),
    0 2px 6px rgb(0 0 0 / 10%);

  .projectsMenu {
    padding-top: 5px;
    width: 400px;
  }
  .projectItem {
    cursor: pointer;
    padding: 0 20px;
    font-size: 15px;
    font-weight: 500;
    height: 40px;
    line-height: 40px;
    &.active {
      color: #1677ff;
      background: rgb(33, 150, 243, 0.08);
    }
    &:not(.active):hover {
      background: #f7f7f7;
    }
  }
`;

// 个人资料基础信息、名片层
export default function UserBaseProfile(props) {
  const {
    className,
    isCard,
    infoWrapClassName,
    projects,
    userInfo,
    rowNum,
    isAddressBook,
    updateUserInfo,
    onContentLoaded,
  } = props;
  const { isPrivateEmail, isPrivateMobile, cardSetList = [] } = userInfo;
  const [{ popupVisible, currentUserProject, cardInfoData }, setState] = useSetState({
    popupVisible: false,
    currentUserProject: props.currentUserProject || {},
    cardInfoData: getFieldsData(isCard, isCard ? cardSetList : _.get(props.currentUserProject, 'personalSetList')),
  });
  const noProject =
    _.isEmpty(currentUserProject) ||
    !currentUserProject.projectId ||
    get(userInfo, 'accountId', '').startsWith('virtualuser-');
  const departmentInfos = isCard ? userInfo.departmentInfos : currentUserProject.departmentInfos;

  const renderProjects = () => {
    return (
      <ProjectsMenuCon>
        <div className="projectsMenu">
          {projects.map(item => {
            return (
              <div
                className={cx('projectItem', { active: item.projectId === currentUserProject.projectId })}
                key={item.projectId}
                onClick={() =>
                  setState({
                    currentUserProject: item,
                    popupVisible: false,
                    cardInfoData: getFieldsData(isCard, isCard ? cardSetList : _.get(item, 'personalSetList')),
                  })
                }
              >
                <div className="flex ellipsis"> {item.companyName}</div>
              </div>
            );
          })}
        </div>
      </ProjectsMenuCon>
    );
  };

  useEffect(() => {
    setState({
      currentUserProject: props.currentUserProject,
      cardInfoData: getFieldsData(isCard, isCard ? cardSetList : _.get(props.currentUserProject, 'personalSetList')),
    });
  }, [props.currentUserProject]);

  const getFilterDisplayData = data => {
    return data.filter(item => {
      let showFields = _.includes(['currentDepartmentFullName', 'currentDepartmentName'], item.id)
        ? userInfo.departmentInfos && !!userInfo.departmentInfos.length
        : _.includes(['currentJobTitleName'], item.id) && currentUserProject.projectId
          ? userInfo.jobInfos && !!userInfo.jobInfos.length
          : userInfo[item.id];

      return (
        (isCard ? showFields : !(currentUserProject.useMultiJobs && ['department', 'job'].includes(item.id))) &&
        !(isPrivateMobile && item.id === 'mobilePhone') &&
        !(isPrivateEmail && item.id === 'email')
      ); // 个人账户-账户与隐私 设置手机号/邮箱仅自己可见时用户卡片不显示手机/邮箱信息
    });
  };

  return (
    <UserProjectInfoWrap className={className} rowNum={rowNum}>
      {!isCard && (
        <React.Fragment>
          {projects.length > 1 ? (
            <Trigger
              action={['click']}
              popupVisible={popupVisible}
              onPopupVisibleChange={visible => setState({ popupVisible: visible })}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [0, 4],
              }}
              popup={renderProjects}
            >
              <div className="projectsWrap mBottom6 Hand">
                <span className="bold">{currentUserProject.companyName || _l('个人资料')}</span>
                <span className="icon-arrow-down mLeft8 Gray_75 Hand"></span>
              </div>
            </Trigger>
          ) : (
            <span className="bold mBottom10">{currentUserProject.companyName || _l('个人资料')}</span>
          )}
          {currentUserProject.useMultiJobs && (
            <div
              className={cx('multipleJobs', {
                noBorder: !getFilterDisplayData(noProject ? NoProjectCardInfoData : cardInfoData).length,
              })}
            >
              {currentUserProject.departmentJobInfos.map((item, index) => (
                <div key={index} className="mTop8">
                  <div className="flexRow alignItemsCenter LineHeight30">
                    <div className="Gray_75 Font14">{_l('任职信息%0', index + 1)}</div>
                    {isAddressBook && (
                      <Divider className="flex mTop0 mBottom0 mLeft5 minWidth0" style={{ borderColor: '#ededed' }} />
                    )}
                  </div>
                  <div className={isAddressBook ? 'flexColumn' : 'flexRow'}>
                    <div className="itemInfo flexRow">
                      <div className={cx('Gray_75', { mRight8: isCard })}>{isCard ? _l('部门') : _l('部门：')}</div>
                      <DepartmentFullName
                        className="flex mRight5 personalDepartment"
                        projectId={currentUserProject.projectId}
                        departmentInfos={[
                          {
                            departmentId: _.get(item, 'department.id'),
                            departmentName: _.get(item, 'department.name'),
                          },
                        ]}
                        onContentLoaded={onContentLoaded}
                      />
                    </div>
                    <div className="itemInfo flexRow">
                      <div className={cx('Gray_75', { mRight8: isCard })}>{isCard ? _l('职位') : _l('职位：')}</div>
                      {item.jobs.length ? (
                        <div className="flex ellipsis mRight5" title={item.jobs.map(job => job.name).join(';')}>
                          {item.jobs.map(job => job.name).join(';')}
                        </div>
                      ) : (
                        <div className="Gray_bd">{_l('未填写')}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      )}
      <div className={`infoWrap ${infoWrapClassName}`}>
        {getFilterDisplayData(noProject ? NoProjectCardInfoData : cardInfoData).map(item => {
          const fieldValue = _.includes(['currentDepartmentFullName', 'currentDepartmentName'], item.id)
            ? !!userInfo.departmentInfos.length
            : _.includes(['currentJobTitleName'], item.id) && currentUserProject.projectId
              ? !!userInfo.jobInfos.length
              : userInfo[item.id];

          return (
            <div key={item.id} className="itemInfo flexRow">
              <div className={cx('Gray_75', { mRight8: isCard })}>
                {item.text}
                {isCard ? '' : '：'}
              </div>
              <div className="flex ellipsis mRight5" title={item.id === 'job' ? currentUserProject[item.id] : ''}>
                {(_.includes(['mobilePhone', 'email'], item.id) || noProject) && userInfo[item.id] ? (
                  item.isMask ? (
                    maskValue(userInfo[item.id], item.id)
                  ) : (
                    userInfo[item.id]
                  )
                ) : isCard && fieldValue ? (
                  _.includes(['currentDepartmentFullName', 'currentDepartmentName'], item.id) &&
                  userInfo.departmentInfos.length ? (
                    <DepartmentFullName
                      noPath={item.id === 'currentDepartmentName'}
                      projectId={currentUserProject.projectId}
                      departmentInfos={departmentInfos}
                      onContentLoaded={onContentLoaded}
                    />
                  ) : item.id === 'currentJobTitleName' && userInfo.jobInfos.length && currentUserProject.projectId ? (
                    <span title={(userInfo.jobInfos || []).map(item => item.jobName).join(';')}>
                      {(userInfo.jobInfos || []).map(item => item.jobName).join(';')}
                    </span>
                  ) : (
                    userInfo[item.id]
                  )
                ) : currentUserProject[item.id] ? (
                  item.id === 'department' ? (
                    <DepartmentFullName
                      className="flex ellipsis mRight5"
                      projectId={currentUserProject.projectId}
                      departmentInfos={departmentInfos}
                      onContentLoaded={onContentLoaded}
                    />
                  ) : (
                    currentUserProject[item.id]
                  )
                ) : (
                  <span className="Gray_bd">{_l('未填写')}</span>
                )}

                {_.includes(['mobilePhone', 'email'], item.id) && item.isMask && !noProject && userInfo[item.id] && (
                  <span
                    className="maskIcon"
                    onClick={() => {
                      const copyCardInfoData = _.clone(cardInfoData);
                      const index = _.findIndex(cardInfoData, v => v.id === item.id);
                      copyCardInfoData[index] = {
                        ...copyCardInfoData[index],
                        isMask: false,
                        typeId: item.id === 'mobilePhone' ? 55 : item.id === 'email' ? 57 : item.typeId,
                      };
                      setState({ cardInfoData: copyCardInfoData });
                      if (_.isFunction(updateUserInfo)) {
                        updateUserInfo({
                          ...userInfo,
                          displayFieldForName:
                            item.id === 'mobilePhone' && userInfo.displayFieldForName === 56
                              ? 55
                              : item.id === 'email' && userInfo.displayFieldForName === 58
                                ? 57
                                : userInfo.displayFieldForName,
                          cardSetList: copyCardInfoData.map(({ typeId }) => ({ typeId })),
                        });
                      }
                    }}
                  >
                    <i className="icon icon-eye_off Gray_bd" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </UserProjectInfoWrap>
  );
}

UserBaseProfile.propTypes = {
  className: PropTypes.string,
  isCard: PropTypes.bool, // 名片层
  isAddressBook: PropTypes.bool, // 通讯录
  infoWrapClassName: PropTypes.string,
  projects: PropTypes.array, // 组织列表
  userInfo: PropTypes.object, // 用户信息
  currentUserProject: PropTypes.object, // 当前组织信息
  rowNum: PropTypes.number, // 一行显示几行
  updateUserInfo: PropTypes.func,
};
