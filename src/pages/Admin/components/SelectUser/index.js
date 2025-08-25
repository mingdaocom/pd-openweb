import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { Icon } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';

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
  } = props;
  const [userInfo, setUserInfo] = useState(props.userInfo);

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
      value={userInfo.map(item => item.fullname).join(',') || undefined}
      placeholder={placeholder || _l('搜索用户')}
      dropdownRender={null}
      allowClear
      open={false}
      style={style}
      onFocus={handleSelectUser}
      suffixIcon={<Icon icon="person" className="Font16" />}
      onChange={() => {
        setUserInfo([]);
        changeData([]);
      }}
    />
  );
}
