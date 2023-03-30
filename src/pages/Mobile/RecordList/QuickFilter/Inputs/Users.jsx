import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import SelectUser from 'mobile/components/SelectUser';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { Icon } from 'ming-ui';
import _ from 'lodash';

const UsersCon = styled.div`
  position: relative;
  .addBtn {
    display: inline-block;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    line-height: 26px;
    font-size: 16px;
    color: #9e9e9e;
  }
  .rightArrow {
    position: absolute;
    right: 0;
    line-height: 26px;
    font-size: 16px;
    color: #c7c7cc;
  }
`;
const UserItem = styled.span`
  display: inline-block;
  height: 28px;
  background: #f5f5f5;
  border-radius: 14px;
  margin: 0 8px 10px 0;
  padding-right: 12px;
  max-width: 100%;
  line-height: 28px;
  .userAvatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }
  .userName {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0 20px 0 8px;
    vertical-align: middle;
    display: inline-block;
    max-width: calc(100% - 69px);
  }
`;

export default function Users(props) {
  const {
    control,
    values = [],
    onChange = () => {},
    projectId,
    appId,
    isMultiple,
    advancedSetting,
    controlId,
    worksheetId,
  } = props;
  const [showSelectUser, setShowSelectUser] = useState(false);
  const pickUser = () => {
    setShowSelectUser(true);
  };
  const onSave = users => {
    onChange({ values: isMultiple ? _.uniqBy([...values, ...users], 'accountId') : users });
  };
  // 删除
  const deleteCurrentUser = item => {
    onChange({ values: values.filter(v => v.accountId !== item.accountId) });
  };
  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15">{control.controlName}</div>
      <UsersCon>
        {values.map(item => (
          <UserItem>
            <img src={item.avatar} alt="" className="userAvatar" />
            <span className="userName">{item.fullname}</span>
            <Icon icon="close" onClick={() => deleteCurrentUser(item)} />
          </UserItem>
        ))}
        {((!isMultiple && _.isEmpty(values)) || isMultiple) && (
          <span className="addBtn" onClick={pickUser}>
            <Icon icon="add" />
          </span>
        )}
        {!isMultiple && !_.isEmpty(values) && (
          <Icon onClick={pickUser} icon="arrow-right-border" className="rightArrow" />
        )}
      </UsersCon>

      {showSelectUser && (
        <SelectUser
          projectId={projectId}
          visible={true}
          type="user"
          userType={getTabTypeBySelectUser(props)}
          appId={appId || ''}
          selectRangeOptions={!!_.get(control, 'advancedSetting.userrange')}
          onlyOne={!isMultiple}
          onClose={() => setShowSelectUser(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
