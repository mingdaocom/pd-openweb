/* eslint-disable no-new */
import React, { Fragment, useState } from 'react';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import { Checkbox } from 'ming-ui';
import update from 'immutability-helper';
import Components from '../../../../components';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import selectOrgRole from 'src/components/dialogSelectOrgRole';
import { Dropdown, Tooltip } from 'antd';
import cx from 'classnames';
import { DropdownContent } from '../../../../styled';
import { SelectOtherField, OtherField } from '../../DynamicDefaultValue/components';
import { DefaultOptionSetting } from '../../DynamicDefaultValue/inputTypes/OptionInput';
import { FieldInfo } from '../../DynamicDefaultValue/styled';
import { head, isEqual } from 'lodash';

const Icon = Components.Icon;

const USER_RANGE = [
  // { id: 'self', type: 1, value: 'user-self', text: _l('当前用户') },
  { id: 'userGroup', type: 2, value: 'user-departments', text: _l('当前用户所在部门') },
  { id: 'assignUser', type: 1, value: '', text: _l('指定人员') },
  { id: 'assignGroup', type: 2, value: '', text: _l('指定部门') },
  { id: 'assignOrg', type: 3, value: '', text: _l('指定组织角色') },
];

export default function UserConfig(props) {
  const { globalSheetInfo, data, onChange } = props;
  const { noticeItem, enumDefault2, enumDefault } = data;
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

      import('src/components/dialogSelectUser/dialogSelectUser').then(dialogSelectUser => {
        dialogSelectUser.default({
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
    if (item.id === 'assignOrg') {
      selectOrgRole({
        projectId: globalSheetInfo.projectId,
        unique: data.enumDefault === 0,
        onSave: orgArr => {
          const availArr = orgArr
            .map(item => ({ value: item.organizeId, name: item.organizeName, type: 3 }))
            .filter(item => !isExist(item));
          const nextValue = userRange.concat(availArr);
          onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(nextValue) }));
        },
      });
    }
  };

  const handleFieldClick = selectData => {
    const availUsers = selectData.map(item => (item.cid ? { ..._.pick(item, ['cid', 'rcid']), type: 4 } : item));
    onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(availUsers) }));
  };

  const getUserDisplay = item => {
    const handleRemove = item => {
      const index = userRange.findIndex(user => isEqual(item, user));
      if (index > -1) {
        const nextValue = update(userRange, { $splice: [[index, 1]] });
        onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(nextValue) }));
      }
    };

    let iconContent = null;

    if (item.type === 2) {
      iconContent = (
        <div className="departWrap">
          <i className="icon-department1"></i>
        </div>
      );
    } else if (item.type === 1) {
      iconContent = <img src={item.avatar} alt="avatar" className="avatar"></img>;
    } else if (item.type === 3) {
      iconContent = (
        <div className="departWrap">
          <i className="icon-group"></i>
        </div>
      );
    }

    return (
      <FieldInfo>
        {iconContent}
        <div className="name">
          {item.value === 'user-departments' ? _l('当前用户所在部门') : item.name || item.value}
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
            <DefaultOptionSetting className="mTop8 mBottom8">
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
                    {userRange.length > 0 ? (
                      <Fragment>
                        {userRange.map(item => {
                          if (item.type === 4) {
                            return (
                              <OtherField
                                {...props}
                                needFilter={true}
                                dynamicValue={userRange}
                                controls={props.allControls || []}
                                data={{ ...props.data, enumDefault: 1 }}
                                item={{ cid: item.cid, rcid: item.rcid }}
                                onDynamicValueChange={nextValue =>
                                  onChange(handleAdvancedSettingChange(data, { userrange: JSON.stringify(nextValue) }))
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
                needFilter={true}
                dynamicValue={userRange}
                onDynamicValueChange={handleFieldClick}
                propFiledVisible={true}
                hideSearchAndFun={true}
              />
            </DefaultOptionSetting>
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
