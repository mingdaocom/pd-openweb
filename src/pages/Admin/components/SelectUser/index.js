import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';

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

export default function SelectUser(props) {
  const {
    projectId,
    changeData = () => {},
    className,
    unique = false,
    placeholder,
    isAdmin = false,
    maxCount,
    style = {},
    containWorkflow = false,
  } = props;
  const [userInfo, setUserInfo] = useState(props.userInfo);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    setUserInfo(props.userInfo);
  }, [props.userInfo.length]);

  const handleSelectUser = () => {
    dialogSelectUser({
      fromAdmin: isAdmin,
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
        callback: data => {
          if (maxCount && data.length > maxCount) {
            alert(_l('超过最大选择人数'), 2);
            return;
          }
          setUserInfo(data);
          changeData(data);
        },
      },
    });
  };

  return (
    <Select
      className={className}
      value={
        !containWorkflow || userType === 'addressBook'
          ? userInfo.map(item => item.fullname).join(',') || null
          : userType
      }
      placeholder={placeholder || _l('搜索用户')}
      dropdownRender={null}
      allowClear
      style={style}
      suffixIcon={<Icon icon="person" className="Font16" />}
      onChange={value => {
        if (value) {
          setUserType(value);
          value === 'addressBook' ? handleSelectUser() : changeData([{ accountId: 'user-workflow' }]);
          return;
        }

        setUserInfo([]);
        changeData([]);
        setUserType(null);
      }}
      {...(!containWorkflow
        ? { open: false, onFocus: handleSelectUser }
        : {
            options: [
              { text: _l('通讯录'), value: 'addressBook', icon: 'topbar-addressList', color: 'var(--color-success)' },
              { text: _l('工作流'), value: 'workflow', icon: 'workflow', color: '#4158db' },
            ].map(item => ({
              ...item,
              label: (
                <OptionItem>
                  <div
                    className="iconWrap flexRow alignItemsCenter justifyContentCenter"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon icon={item.icon} className="Font14" />
                  </div>
                  <div className="mLeft8">{item.text}</div>
                </OptionItem>
              ),
            })),
          })}
    />
  );
}
