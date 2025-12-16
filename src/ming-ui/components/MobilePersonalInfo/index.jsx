import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { LoadDiv, ScrollView } from 'ming-ui';
import UserController from 'src/api/user';
import { displayFieldForNameInfo, maskValue } from 'src/pages/Admin/security/account/utils';
import PersonalStatus from 'src/pages/chat/components/MyStatus/PersonalStatus';
import DepartmentFullName from './components/DepartmentFullName';
import './index.less';

const maskFieldKeys = [56, 58];
const telFieldIds = ['mobilePhone', 'currentWorkPhone'];
const appointmentFieldIds = ['currentDepartmentName', 'currentDepartmentFullName', 'currentJobTitleName'];

const MobilePersonalInfo = props => {
  const { visible, accountId, appId, projectId, onClose = () => {} } = props;
  // 外部门户accountId包含#号
  const isExternalPortal = accountId?.includes('#');
  const isPublicShare =
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage') ||
    _.get(window, 'shareState.isPublicQuery') ||
    _.get(window, 'shareState.isPublicForm') ||
    _.get(window, 'shareState.isPublicWorkflowRecord') ||
    _.get(window, 'shareState.isPublicPrint') ||
    window.isPublicApp;

  const [{ loading, userInfo, cardInfoList }, setState] = useSetState({
    loading: true,
    userInfo: {},
    cardInfoList: [],
  });

  const closePopup = () => {
    setState({
      userInfo: null,
      cardInfoList: [],
      loading: false,
    });
    onClose();
  };

  const formatData = data => {
    const { cardSetList = [] } = data;

    if (isExternalPortal) {
      const { mobilePhone, email, portalValues = [] } = data;
      const baseList = [
        { id: 'mobilePhone', text: '手机', value: mobilePhone },
        { id: 'email', text: '邮箱', value: email },
      ];
      const extendedList = portalValues.map(({ key, value }, index) => ({
        id: `custom-${index}`,
        text: key,
        value,
      }));

      return [...baseList, ...extendedList];
    }

    return cardSetList
      ?.map(item => {
        const fieldItem = displayFieldForNameInfo[item.typeId];
        if (!fieldItem) return null;

        const isMaskField = _.includes(maskFieldKeys, item.typeId);
        return { ...fieldItem, value: data[fieldItem.id], isMask: isMaskField, hideMask: false };
      })
      .filter(Boolean);
  };

  const getAccountBaseInfo = () => {
    setState({
      loading: true,
    });
    const params = {
      accountId,
      refresh: false,
    };
    if (isExternalPortal) params.appId = appId;
    else params.onProjectId = projectId;

    UserController.getAccountBaseInfo(params)
      .then(result => {
        if (result) {
          setState({
            userInfo: result,
            cardInfoList: formatData(result),
          });
        }
      })
      .finally(() => {
        setState({
          loading: false,
        });
      });
  };

  const showMaskInfo = id => {
    const copyData = _.clone(cardInfoList);
    const index = _.findIndex(copyData, v => v.id === id);
    copyData[index] = { ...copyData[index], hideMask: true };
    setState({ cardInfoList: copyData });
  };

  const renderCardInfo = () => {
    return cardInfoList?.map(({ id, text, value, isMask, hideMask }) => {
      const isAppointmentField = appointmentFieldIds.includes(id);
      if (!value && !isAppointmentField) return null;
      if (id === 'currentJobTitleName' && !userInfo.jobInfos?.length) return null;
      if (id === 'currentDepartmentName' && !userInfo.departmentInfos?.length) return null;
      if (id === 'currentDepartmentFullName') {
        if (!userInfo.departmentInfos?.length) return null;

        return <DepartmentFullName projectId={projectId} departmentInfos={userInfo.departmentInfos} />;
      }

      return (
        <div
          className={cx('infoItem', {
            appointmentField: isAppointmentField,
          })}
          key={id}
        >
          <div className="label overflow_ellipsis">{text}</div>
          <div className="contentBox">
            <div className="content overflow_ellipsis">
              {isAppointmentField ? (
                <Fragment>
                  {id === 'currentJobTitleName' && (
                    <Fragment>
                      {userInfo.jobInfos?.map(item => (
                        <div className="overflow_ellipsis" key={item.jobId}>
                          {item.jobName}
                        </div>
                      ))}
                    </Fragment>
                  )}
                  {id === 'currentDepartmentName' && (
                    <Fragment>
                      {userInfo.departmentInfos?.map(item => (
                        <div className="overflow_ellipsis" key={item.departmentId}>
                          {item.departmentName}
                        </div>
                      ))}
                    </Fragment>
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  {isMask && !hideMask ? maskValue(value, id) : value}
                  {isMask && !hideMask && (
                    <span className="mLeft10" onClick={() => showMaskInfo(id)}>
                      <i className="icon icon-eye_off Gray_bd" />
                    </span>
                  )}
                </Fragment>
              )}
            </div>
            {telFieldIds.includes(id) && (
              <a className="tel" href={`tel:${value}`}>
                <Icon icon="phone22" />
              </a>
            )}
          </div>
        </div>
      );
    });
  };

  useEffect(() => {
    if (visible && accountId && !isPublicShare) getAccountBaseInfo();
  }, [visible, accountId]);

  if (!visible || isPublicShare) return null;

  return (
    <Popup visible={visible} onMaskClick={closePopup} className="mobileModal" bodyClassName="personalInfoBody">
      <div className="closeIconBox">
        <Icon icon="close" onClick={closePopup} />
      </div>
      {loading ? (
        <div className="loadingBox">
          <LoadDiv />
        </div>
      ) : (
        <Fragment>
          {userInfo ? (
            <Fragment>
              <div className="personalInfoHeaderBox">
                <img className="avatar" src={userInfo.avatar} alt="" />
                <div className="flexColumn overflowHidden">
                  <div className="fullname overflow_ellipsis">{userInfo.fullname}</div>
                  {userInfo.onStatusOption && (
                    <PersonalStatus
                      className="userDetailPersonalStatus noBorder pAll0 w100"
                      onStatusOption={userInfo.onStatusOption}
                    />
                  )}
                </div>
              </div>
              <ScrollView className="personalInfoContentBox">{renderCardInfo()}</ScrollView>
            </Fragment>
          ) : (
            <div className="noContactBox">
              <div className="emptyLogo">
                <Icon icon="user_male" />
              </div>
              <div className="emptyLabel">{_l('对方不是您的联系人，无法查看')}</div>
            </div>
          )}
        </Fragment>
      )}
    </Popup>
  );
};

MobilePersonalInfo.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default MobilePersonalInfo;
