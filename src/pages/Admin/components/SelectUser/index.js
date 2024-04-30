import React, { useEffect, useState } from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import { dialogSelectUser } from 'ming-ui/functions';

export default function SelectUser(props) {
  const { projectId, changeData = () => {}, className } = props;
  const [userInfo, setUserInfo] = useState(props.userInfo);

  useEffect(() => {
    setUserInfo(props.userInfo);
  }, [props.userInfo.length]);

  const handleSelectUser = () => {
    dialogSelectUser({
      fromAdmin: true,
      SelectUserSettings: {
        projectId,
        dataRange: 2,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        unique: false,
        callback: data => {
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
      placeholder={_l('搜索用户')}
      dropdownRender={null}
      allowClear
      open={false}
      onFocus={handleSelectUser}
      suffixIcon={<Icon icon="person" className="Font16" />}
      onChange={() => {
        setUserInfo([]);
        changeData([]);
      }}
    />
  );
}
