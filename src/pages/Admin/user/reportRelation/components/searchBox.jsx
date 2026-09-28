import React from 'react';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { dialogSelectUser } from 'ming-ui/functions';
import Config from '../../../config';

const SEARCH_USER_BUTTON_STYLE = { position: 'relative', zIndex: 2, float: 'right' };

export default ({ onChange = () => {} }) => {
  const selectUser = e => {
    e.stopPropagation();

    dialogSelectUser({
      sourceId: 0,
      fromType: 0,
      fromAdmin: true,
      SelectUserSettings: {
        filterAll: true, // 过滤全部
        filterFriend: true, // 是否过滤好友
        filterOthers: true,
        filterOtherProject: true,
        filterResigned: false,
        projectId: Config.projectId,
        inProject: true,
        unique: true,
        callback: users => {
          onChange(users[0]);
        },
      },
    });
  };

  return (
    <Button
      shape="round"
      style={SEARCH_USER_BUTTON_STYLE}
      icon={<Icon icon="charger" className="Font16" />}
      onClick={selectUser}
    >
      {_l('查看成员')}
    </Button>
  );
};
