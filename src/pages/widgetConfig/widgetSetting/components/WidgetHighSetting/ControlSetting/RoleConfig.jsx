/* eslint-disable no-new */
import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import update from 'immutability-helper';
import { dialogSelectOrgRole } from 'ming-ui/functions';
import { SelectOtherField, OtherField } from '../../DynamicDefaultValue/components';
import { DefaultOptionSetting } from '../../DynamicDefaultValue/inputTypes/OptionInput';
import { FieldInfo } from '../../DynamicDefaultValue/styled';
import { SettingItem } from '../../../../styled';
import cx from 'classnames';
import { DYNAMIC_FROM_MODE } from '../../DynamicDefaultValue/config';

const ROLE_RANGE = [
  { value: 0, text: _l('全部') },
  { value: 1, text: _l('指定组织角色') },
];

export default function RoleConfig(props) {
  const { globalSheetInfo, data, onChange } = props;
  const { enumDefault2 = 0 } = data;
  const chooseRange = getAdvanceSetting(data, 'chooserange') || [];

  const handleClick = () => {
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
  };

  const handleFieldClick = selectData => {
    let newValue = [].concat(chooseRange);
    const availUsers = selectData.map(item => (item.cid ? { ...item, type: 4 } : { ...item, type: 3 }));
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

  const existIndex = item =>
    chooseRange.findIndex(user => {
      if (item.cid) {
        return _.isEqual(_.pick(item, ['rcid', 'cid', 'type']), _.pick(user, ['rcid', 'cid', 'type']));
      } else {
        return _.get(safeParse(user.staticValue), 'organizeId') === _.get(safeParse(item.staticValue), 'organizeId');
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
    const organizeName = _.get(safeParse(item.staticValue || '{}'), 'organizeName');
    return (
      <FieldInfo hideIcon={true}>
        <div className="name">{organizeName || _l('已删除')}</div>
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
    <SettingItem>
      <div className="settingItemTitle">
        {_l('选择范围')}
        {/* <Tooltip placement="bottom" title={_l('设置为成员字段时，取成员所在的所有部门')}>
            <i className="icon-help Gray_9e Font16 Hand mLeft4"></i>
          </Tooltip> */}
      </div>

      <Dropdown
        border
        className="w100"
        data={ROLE_RANGE}
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
        <div className="content" onClick={() => handleClick()}>
          <div className="defaultOptionsWrap">
            {chooseRange.length > 0 ? (
              <Fragment>
                {chooseRange.map(item => {
                  if (item.type === 4) {
                    return (
                      <OtherField
                        {...props}
                        from={DYNAMIC_FROM_MODE.ORG_CONFIG}
                        dynamicValue={chooseRange}
                        controls={props.allControls || []}
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
        </div>
        <SelectOtherField
          {...props}
          controls={props.allControls || []}
          from={DYNAMIC_FROM_MODE.ORG_CONFIG}
          dynamicMultiple={true}
          dynamicValue={chooseRange}
          onDynamicValueChange={handleFieldClick}
          hideSearchAndFun={true}
        />
      </DefaultOptionSetting>
    </SettingItem>
  );
}
