import React from 'react';
import _ from 'lodash';
import { dialogSelectUser } from 'ming-ui/functions';
import Config from '../../../config';

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
    <div className="searchUserBox Relative Hand" onClick={selectUser}>
      <span className="Left icon-charger Font16 selectIcon mRight8" />
      <span className="Font13">{_l('查看成员')}</span>
    </div>
  );
};
