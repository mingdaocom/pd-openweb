import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { dialogSelectExternalUser, dialogSelectUser } from 'ming-ui/functions';

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  .iconWrap {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: var(--color-white);
  }
`;

const USER_TYPE_OPTIONS = {
  addressBook: { value: 'addressBook', icon: 'topbar-addressList', color: 'var(--color-success)' },
  externalUser: { value: 'externalUser' },
  workflow: { value: 'workflow', icon: 'workflow', color: '#4158db' },
};

function getUserTypeOptions(containExternalUser, containWorkflow) {
  return [
    {
      ...USER_TYPE_OPTIONS.addressBook,
      text: containExternalUser ? _l('组织用户') : _l('通讯录'),
      showIcon: containWorkflow && !containExternalUser,
    },
    ...(containExternalUser ? [{ ...USER_TYPE_OPTIONS.externalUser, text: _l('外部门户用户') }] : []),
    ...(containWorkflow ? [{ ...USER_TYPE_OPTIONS.workflow, text: _l('工作流'), showIcon: true }] : []),
  ];
}

export default function SelectUser(props) {
  const {
    projectId,
    appId,
    userInfo: propUserInfo = [],
    changeData = () => {},
    className,
    unique = false,
    placeholder,
    isAdmin = false,
    maxCount,
    style = {},
    containWorkflow = false,
    containExternalUser = false,
  } = props;
  const [userType, setUserType] = useState(null);
  const selectingRef = useRef(false);
  const isUserTypeSelect = containWorkflow || containExternalUser;
  const userInfo = propUserInfo;

  const unlockSelectUser = () => {
    selectingRef.current = false;
  };

  const updateUserInfo = data => {
    if (maxCount && data.length > maxCount) {
      alert(_l('超过最大选择人数'), 2);
      return;
    }

    changeData(data);
  };

  const handleSelectUser = event => {
    if (event?.target?.closest('.hap-select-clear')) return;

    if (selectingRef.current) return;

    selectingRef.current = true;

    dialogSelectUser({
      fromAdmin: isAdmin,
      onCancel: unlockSelectUser,
      SelectUserSettings: {
        projectId,
        dataRange: 2,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        filterResigned: false,
        unique: unique,
        selectedAccountIds: userInfo.map(item => item.accountId),
        callback: updateUserInfo,
      },
    });
  };

  const userTypeOptions = getUserTypeOptions(containExternalUser, containWorkflow).map(item => ({
    ...item,
    label: item.showIcon ? (
      <OptionItem>
        <div className="iconWrap flexRow alignItemsCenter justifyContentCenter" style={{ backgroundColor: item.color }}>
          <Icon icon={item.icon} className="Font14" />
        </div>
        <div className="mLeft8">{item.text}</div>
      </OptionItem>
    ) : (
      item.text
    ),
  }));

  return (
    <Select
      className={className}
      value={
        userType === USER_TYPE_OPTIONS.workflow.value ? userType : userInfo.map(item => item.fullname).join(',') || null
      }
      placeholder={placeholder || _l('搜索用户')}
      allowClear
      style={style}
      suffixIcon={<Icon icon="person" className="Font16" />}
      onChange={value => {
        if (value) {
          setUserType(value);

          switch (value) {
            case USER_TYPE_OPTIONS.addressBook.value:
              handleSelectUser();
              break;
            case USER_TYPE_OPTIONS.externalUser.value:
              dialogSelectExternalUser({ projectId, appId, onOk: updateUserInfo });
              break;
            default:
              changeData([{ accountId: 'user-workflow' }]);
              break;
          }

          return;
        }

        changeData([]);
        setUserType(null);
      }}
      {...(!isUserTypeSelect ? { open: false, onClick: handleSelectUser } : { options: userTypeOptions })}
    />
  );
}
