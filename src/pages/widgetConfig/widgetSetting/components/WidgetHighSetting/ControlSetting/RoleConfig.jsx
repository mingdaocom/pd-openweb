/* eslint-disable no-new */
import React, { Fragment, useState } from 'react';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import { Checkbox } from 'ming-ui';
import update from 'immutability-helper';
import { dialogSelectOrgRole } from 'ming-ui/functions';
import { Dropdown } from 'antd';
import { DropdownContent } from '../../../../styled';
import { SelectOtherField, OtherField } from '../../DynamicDefaultValue/components';
import { DefaultOptionSetting } from '../../DynamicDefaultValue/inputTypes/OptionInput';
import { FieldInfo } from '../../DynamicDefaultValue/styled';
import { isEqual } from 'lodash';
import cx from 'classnames';

const USER_RANGE = [
  { id: 'userOrg', type: 3, value: 'user-role', text: _l('当前用户的组织角色') },
  { id: 'assignOrg', type: 3, value: '', text: _l('指定组织角色') },
];

export default function RoleConfig(props) {
  const { globalSheetInfo, data, onChange } = props;
  const { enumDefault2 } = data;
  const userRange = getAdvanceSetting(data, 'userrange') || [];
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
    if (item.id === 'assignOrg') {
      dialogSelectOrgRole({
        projectId: globalSheetInfo.projectId,
        unique: false,
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

    return (
      <FieldInfo>
        <div className="departWrap">
          <i className="icon-group"></i>
        </div>
        <div className="name">{item.value === 'user-role' ? _l('当前用户的组织角色') : item.name || item.value}</div>
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
          text={_l('允许选择的组织角色')}
          size="small"
        />
      </div>

      <DefaultOptionSetting className={cx('mTop8 mBottom8', { Hidden: enumDefault2 !== 1 })}>
        <div className="content" onClick={e => handleClick(_.last(USER_RANGE), e)}>
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
        </div>
        <SelectOtherField
          {...props}
          controls={props.allControls || []}
          needFilter={true}
          dynamicMultiple={true}
          dynamicValue={userRange}
          onDynamicValueChange={handleFieldClick}
          propFiledVisible={true}
          hideSearchAndFun={true}
        />
      </DefaultOptionSetting>
    </Fragment>
  );
}
