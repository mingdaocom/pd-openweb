/* eslint-disable no-new */
import React, { Fragment, useState } from 'react';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../util/setting';
import { Checkbox } from 'ming-ui';
import update from 'immutability-helper';
import Icon from 'src/components/Icon';
import styled from 'styled-components';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import { Dropdown, Tooltip } from 'antd';
import cx from 'classnames';
import { DropdownContent, DropdownPlaceholder } from '../../../styled';
import { get, isEqual } from 'lodash';

const USER_RANGE = [
  // { id: 'self', type: 1, value: 'user-self', text: _l('当前用户') },
  { id: 'userGroup', type: 2, value: 'user-departments', text: _l('当前用户所在部门') },
  { id: 'assignUser', type: 1, value: '', text: _l('指定人员') },
  { id: 'assignGroup', type: 2, value: '', text: _l('指定部门') },
];

const InfoWrap = styled.ul`
  display: flex;
  flex-wrap: wrap;
  li {
    display: flex;
    padding: 0 8px;
    padding-left: 0;
    margin: 4px;
    background-color: #f5f5f5;
    border-radius: 12px;
    align-items: center;
    line-height: 24px;
    img {
      width: 24px;
      border-radius: 12px;
    }

    .departWrap {
      width: 24px;
      height: 24px;
      text-align: center;
      color: #fff;
      border-radius: 12px;
      background-color: #aaa;
    }

    .close {
      color: rgba(51, 51, 51, 0.3);
      &:hover {
        color: rgba(51, 51, 51, 0.4);
      }
    }

    span {
      margin: 0 4px;
    }
  }
`;

export default function UserConfig({ globalSheetInfo, data, onChange }) {
  const { noticeItem, enumDefault2 } = data;
  const userRange = getAdvanceSetting(data, 'userrange') || [];
  const userType = getAdvanceSetting(data, 'usertype');
  const [overlayVisible, setVisible] = useState(false);
  const handleClick = (item, e) => {
    const isExist = obj => userRange.some(user => isEqual(user, obj));
    setVisible(false);
    if (item.value) {
      const obj = { value: item.value, type: item.type };
      if (isExist(obj)) return;
      const nextValue = userRange.concat([obj]);
      onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(nextValue) }));
    }
    if (item.id === 'assignGroup') {
      new DialogSelectGroups({
        projectId: globalSheetInfo.projectId,
        isIncludeRoot: false,
        unique: false,
        showCreateBtn: false,
        selectFn: groupArr => {
          const availArr = groupArr
            .map(item => ({ value: item.departmentId, name: item.departmentName, type: 2 }))
            .filter(item => !isExist(item));
          const nextValue = userRange.concat(availArr);
          onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(nextValue) }));
        },
      });
    }
    if (item.id === 'assignUser') {
      const handleUserChange = users => {
        const availUsers = users
          .map(item => ({ value: item.accountId, avatar: item.avatar, name: item.fullname, type: 1 }))
          .filter(item => !isExist(item));
        const nextValue = userRange.concat(availUsers);
        onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(nextValue) }));
      };

      import('dialogSelectUser').then(() => {
        $({}).dialogSelectUser({
          showMoreInvite: false,
          SelectUserSettings: {
            unique: false,
            filterAll: true,
            filterFriend: true,
            filterOthers: true,
            filterOtherProject: true,
            projectId: globalSheetInfo.projectId,
            callback: handleUserChange,
            showTabs: ['conactUser', 'department', 'subordinateUser'],
          },
        });
      });
    }
  };

  const getUserDisplay = () => {
    const handleRemove = item => {
      const index = userRange.findIndex(user => isEqual(item, user));
      if (index > -1) {
        const nextValue = update(userRange, { $splice: [[index, 1]] });
        onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(nextValue) }));
      }
    };

    return userRange.length ? (
      <InfoWrap>
        {userRange.map(item => {
          // if (item.value === 'user-self') {
          //   return (
          //     <li>
          //       <div className="departWrap">
          //         <i className="icon-person"></i>
          //       </div>
          //       <span>{_l('当前用户')}</span>
          //       <i
          //         className="icon-close close"
          //         onClick={e => {
          //           e.stopPropagation();
          //           handleRemove(item);
          //         }}></i>
          //     </li>
          //   );
          // }
          return (
            <li>
              {item.type === 2 ? (
                <div className="departWrap">
                  <i className="icon-department1"></i>
                </div>
              ) : (
                <img src={item.avatar} alt="avatar"></img>
              )}
              <span>{item.value === 'user-departments' ? _l('当前用户所在部门') : item.name || item.value}</span>
              <i
                className="icon-close close"
                onClick={e => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
              ></i>
            </li>
          );
        })}
      </InfoWrap>
    ) : (
      <span className="Gray_75">{_l('请选择')}</span>
    );
  };

  return (
    <Fragment>
      {userType !== 2 && (
        <Fragment>
          <div className="labelWrap">
            <Checkbox
              className="checkboxWrap"
              onClick={checked => {
                const nextData = checked
                  ? handleAdvancedSettingChange({ ...data, enumDefault2: Number(!checked) }, { userrange: '' })
                  : {
                      enumDefault2: Number(!checked),
                    };
                onChange(nextData);
              }}
              checked={enumDefault2 === 1}
              text={_l('允许选择的人员')}
              size="small"
            />
            <Tooltip
              placement="bottom"
              title={_l('使用部门作为范围时，允许选择的人员包含当前部门和所有子部门中的人员')}
            >
              <Icon icon="help" />
            </Tooltip>
          </div>
          {enumDefault2 === 1 && (
            <Dropdown
              trigger={['click']}
              visible={overlayVisible}
              onVisibleChange={setVisible}
              overlay={
                <DropdownContent>
                  {USER_RANGE.map(item => (
                    <div className="item" onClick={e => handleClick(item, e)}>
                      {item.text}
                    </div>
                  ))}
                </DropdownContent>
              }
            >
              <DropdownPlaceholder
                style={{ padding: '4px 6px 4px 12px', marginBottom: '6px' }}
                className={cx({ active: overlayVisible })}
                color="#333"
              >
                {getUserDisplay()}
                <i className="icon-arrow-down-border Gray_9e"></i>
              </DropdownPlaceholder>
            </Dropdown>
          )}
        </Fragment>
      )}
      <div className="labelWrap">
        <Checkbox
          className="checkboxWrap"
          onClick={checked => {
            onChange({ noticeItem: Number(!checked) });
          }}
          checked={noticeItem === 1}
          text={_l('加入时收到通知')}
          size="small"
        />
      </div>
    </Fragment>
  );
}
