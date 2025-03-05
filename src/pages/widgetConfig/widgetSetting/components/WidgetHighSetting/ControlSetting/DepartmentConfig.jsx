/* eslint-disable no-new */
import React, { Fragment } from 'react';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import { Dropdown } from 'ming-ui';
import update from 'immutability-helper';
import { dialogSelectDept } from 'ming-ui/functions';
import { Tooltip } from 'antd';
import { SelectOtherField, OtherField } from '../../DynamicDefaultValue/components';
import { DefaultOptionSetting } from '../../DynamicDefaultValue/inputTypes/OptionInput';
import { FieldInfo } from '../../DynamicDefaultValue/styled';
import { isEqual } from 'lodash';
import cx from 'classnames';
import { SettingItem } from '../../../../styled';

const DEPARTMENT_RANGE = [
  { value: '0', text: _l('全组织') },
  { value: '1', text: _l('仅指定部门') },
  { value: '2', text: _l('指定部门和所有下级部门') },
  { value: '3', text: _l('仅指定部门的所有下级部门') },
];

export default function DepartmentConfig(props) {
  const { globalSheetInfo = {}, data, onChange } = props;
  const chooseRange = getAdvanceSetting(data, 'chooserange') || [];
  const { departrangetype = '0' } = getAdvanceSetting(data);

  const handleClick = e => {
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
  };

  const handleFieldClick = selectData => {
    let newValue = [].concat(chooseRange);
    const availUsers = selectData.map(item => (item.cid ? { ...item, type: 4 } : { ...item, type: 2 }));
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
        return (
          _.get(safeParse(user.staticValue), 'departmentId') === _.get(safeParse(item.staticValue), 'departmentId')
        );
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
    const departmentName = _.get(safeParse(item.staticValue || '{}'), 'departmentName');
    return (
      <FieldInfo hideIcon={true}>
        <div className="name">{departmentName || _l('已删除')}</div>
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
        <Tooltip placement="bottom" title={_l('使用成员字段设置选择范围时，成员所在的所有部门可选。')}>
          <i className="icon-help Gray_9e Font16 Hand mLeft4"></i>
        </Tooltip>
      </div>

      <Dropdown
        border
        className="w100"
        data={DEPARTMENT_RANGE}
        value={departrangetype}
        showItemTitle={true}
        onChange={value => {
          onChange(handleAdvancedSettingChange(data, { departrangetype: value }));
        }}
      />

      <DefaultOptionSetting className={cx('mTop8', { Hidden: departrangetype === '0' })}>
        <div className="content" onClick={() => handleClick()}>
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
                        item={{ cid: item.cid, rcid: item.rcid }}
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
          dynamicMultiple={true}
          dynamicValue={chooseRange}
          onDynamicValueChange={handleFieldClick}
          hideSearchAndFun={true}
        />
      </DefaultOptionSetting>
    </SettingItem>
  );
}
