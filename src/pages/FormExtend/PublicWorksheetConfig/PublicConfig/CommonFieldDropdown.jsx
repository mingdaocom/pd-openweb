import React from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { getIconByType } from 'src/utils/domain/control/metadata';

const FIELD_SELECT_STYLES = {
  root: { width: 380 },
};

export default function CommonFieldDropdown(props) {
  const { controls, selectedFields, onChange, extendSourceId, weChatSetting } = props;
  const options = controls
    .filter(
      item =>
        !_.includes([21, 26, 27, 48, 52], item.type) &&
        !_.includes(
          [
            extendSourceId,
            _.get(weChatSetting, 'fieldMaps.openId'),
            _.get(weChatSetting, 'fieldMaps.nickName'),
            _.get(weChatSetting, 'fieldMaps.headImgUrl'),
          ],
          item.controlId,
        ),
    )
    .map(item => ({
      label: (
        <span>
          <Icon icon={getIconByType(item.type, false)} className="mRight8 textTertiary" />
          {item.controlName}
        </span>
      ),
      text: item.controlName,
      value: item.controlId,
    }));
  const selectedCount = controls.filter(item => _.includes(selectedFields, item.controlId)).length;
  const value = selectedFields.filter(id => options.some(option => option.value === id));

  return (
    <Select
      mode="multiple"
      placeholder={_l('选择字段')}
      showPopupSearch
      optionFilterProp="text"
      maxTagCount={0}
      maxTagPlaceholder={() => _l('已选择%0个字段', selectedCount)}
      styles={FIELD_SELECT_STYLES}
      options={options}
      value={value}
      onChange={values => {
        const changedValue = [...value, ...values].find(id => !value.includes(id) || !values.includes(id));
        changedValue && onChange(changedValue);
      }}
    />
  );
}
