import React, { Fragment, useState } from 'react';
import { Dropdown, Tooltip } from 'antd';
import cx from 'classnames';
import update from 'immutability-helper';
import _ from 'lodash';
import { Dropdown as MingDropdown } from 'ming-ui';
import { dialogSelectDept, dialogSelectOrgRole, dialogSelectUser } from 'ming-ui/functions';
import { DropdownContent, SettingItem } from '../../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import { OtherField, SelectOtherField } from '../../DynamicDefaultValue/components';
import { DYNAMIC_FROM_MODE } from '../../DynamicDefaultValue/config';
import { DefaultOptionSetting } from '../../DynamicDefaultValue/inputTypes/OptionInput';
import { FieldInfo } from '../../DynamicDefaultValue/styled';

const USER_RANGE_CONFIG = [
  { text: _l('用户通讯录'), value: 0 },
  { text: _l('组织通讯录'), value: 2 },
  { text: _l('指定人员范围'), value: 1 },
];

const USER_RANGE = [
  { id: 'assignUser', type: 1, value: '', text: _l('指定人员') },
  { id: 'assignGroup', type: 2, value: '', text: _l('指定部门') },
  { id: 'assignOrg', type: 3, value: '', text: _l('指定组织角色') },
];

export default function UserConfig(props) {
  const { globalSheetInfo, data, onChange } = props;
  const { enumDefault2 = 0 } = data;
  const chooseRange = getAdvanceSetting(data, 'chooserange') || [];
  const userType = getAdvanceSetting(data, 'usertype');
  const [overlayVisible, setVisible] = useState(false);

  const handleClick = item => {
    setVisible(false);

    if (item.id === 'assignGroup') {
      dialogSelectDept({
        projectId: globalSheetInfo.projectId,
        isIncludeRoot: false,
        unique: false,
        showCreateBtn: false,
        selectFn: groupArr => {
          const availArr = groupArr
            .map(item => ({
              rcid: '',
              cid: '',
              staticValue: JSON.stringify({ departmentId: item.departmentId, departmentName: item.departmentName }),
              type: 2,
            }))
            .filter(item => existIndex(item) === -1);
          const nextValue = chooseRange.concat(availArr);
          onChange(handleAdvancedSettingChange(data, { chooserange: JSON.stringify(nextValue) }));
        },
      });
    }
    if (item.id === 'assignUser') {
      const handleUserChange = users => {
        const availUsers = users
          .map(item => ({
            rcid: '',
            cid: '',
            staticValue: JSON.stringify({ accountId: item.accountId, avatar: item.avatar, fullname: item.fullname }),
            type: 1,
          }))
          .filter(item => existIndex(item) === -1);
        const nextValue = chooseRange.concat(availUsers);
        onChange(handleAdvancedSettingChange(data, { chooserange: JSON.stringify(nextValue) }));
      };

      dialogSelectUser({
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
    }
    if (item.id === 'assignOrg') {
      dialogSelectOrgRole({
        projectId: globalSheetInfo.projectId,
        unique: false,
        onSave: orgArr => {
          const availArr = orgArr
            .map(item => ({
              rcid: '',
              cid: '',
              staticValue: JSON.stringify({ organizeId: item.organizeId, organizeName: item.organizeName }),
              type: 3,
            }))
            .filter(item => existIndex(item) === -1);
          const nextValue = chooseRange.concat(availArr);
          onChange(handleAdvancedSettingChange(data, { chooserange: JSON.stringify(nextValue) }));
        },
      });
    }
  };

  const handleFieldClick = selectData => {
    let newValue = [].concat(chooseRange);
    const availUsers = selectData.map(item => {
      if (item.cid) {
        return { ...item, type: 4 };
      } else {
        // 当前用户所在部门、当前用户type异化
        const tempType = (item.staticValue || '').indexOf('user-self') > -1 ? 1 : 2;
        return { ...item, type: tempType };
      }
    });
    availUsers.map(item => {
      if (existIndex(item) === -1) {
        newValue.push(item);
      }
    });
    newValue = newValue.filter(item => {
      return item.cid
        ? _.find(availUsers, a => _.isEqual(_.pick(a, ['rcid', 'cid', 'type']), _.pick(item, ['rcid', 'cid', 'type'])))
        : true;
    });
    onChange(handleAdvancedSettingChange(data, { chooserange: JSON.stringify(newValue) }));
  };

  const getId = item => {
    return item.type === 1 ? 'accountId' : item.type === 2 ? 'departmentId' : 'organizeId';
  };

  const existIndex = item =>
    chooseRange.findIndex(user => {
      if (item.cid) {
        return _.isEqual(_.pick(item, ['rcid', 'cid', 'type']), _.pick(user, ['rcid', 'cid', 'type']));
      } else {
        const id = getId(item);
        return _.get(safeParse(user.staticValue), [id]) === _.get(safeParse(item.staticValue), [id]);
      }
    });

  const handleRemove = item => {
    const index = existIndex(item);
    if (index > -1) {
      const nextValue = update(chooseRange, { $splice: [[index, 1]] });
      onChange(handleAdvancedSettingChange(data, { chooserange: JSON.stringify(nextValue) }));
    }
  };

  const getUserDisplay = item => {
    const userInfo = safeParse(item.staticValue || '{}');

    return (
      <FieldInfo hideIcon={true}>
        <div className="name">
          {userInfo.departmentName || userInfo.organizeName || userInfo.fullname || userInfo.name || _l('已删除')}
        </div>
        <div
          className="remove"
          onClick={e => {
            e.stopPropagation();
            handleRemove(item);
          }}
        >
          <i className="icon-close" />
        </div>
      </FieldInfo>
    );
  };

  return (
    <Fragment>
      {userType !== 2 && (
        <SettingItem>
          <div className="settingItemTitle">
            {_l('选择范围')}
            <Tooltip
              placement="bottom"
              autoCloseDelay={0}
              title={_l(
                '用户通讯录指当前操作人的通讯录；组织通讯录指当前组织的通讯录。此外，使用部门作为选择范围时，所设置部门及所有子部门中的人员可选；使用组织角色作为选择范围时，所设置角色下的所有人员可选。',
              )}
            >
              <i className="icon-help Gray_9e Font16 Hand mLeft4"></i>
            </Tooltip>
          </div>

          <MingDropdown
            border
            className="w100"
            data={USER_RANGE_CONFIG}
            value={enumDefault2}
            onChange={value => {
              const nextData =
                value !== 1
                  ? handleAdvancedSettingChange({ ...data, enumDefault2: value }, { chooserange: '' })
                  : {
                      enumDefault2: value,
                    };
              onChange(nextData);
            }}
          />

          <DefaultOptionSetting className={cx('mTop8', { Hidden: enumDefault2 !== 1 })}>
            <div className="content">
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
                <div className="defaultOptionsWrap">
                  {chooseRange.length > 0 ? (
                    <Fragment>
                      {chooseRange.map(item => {
                        if (item.type === 4) {
                          return (
                            <OtherField
                              {...props}
                              dynamicValue={chooseRange}
                              controls={props.allControls || []}
                              from={DYNAMIC_FROM_MODE.USER_CONFIG}
                              data={{ ...props.data, enumDefault: 1 }}
                              item={item}
                              onDynamicValueChange={nextValue =>
                                onChange(handleAdvancedSettingChange(data, { chooserange: JSON.stringify(nextValue) }))
                              }
                            />
                          );
                        }
                        return getUserDisplay(item);
                      })}
                    </Fragment>
                  ) : (
                    <span className="Gray_75 mTop4">{_l('请选择')}</span>
                  )}
                </div>
              </Dropdown>
            </div>
            <SelectOtherField
              {...props}
              data={{ ...props.data, enumDefault: 1 }}
              controls={props.allControls || []}
              fromRange={true}
              from={DYNAMIC_FROM_MODE.USER_CONFIG}
              dynamicValue={chooseRange}
              onDynamicValueChange={handleFieldClick}
              hideSearchAndFun={true}
            />
          </DefaultOptionSetting>
        </SettingItem>
      )}
    </Fragment>
  );
}
