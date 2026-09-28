import React, { useRef, useState } from 'react';
import { Dropdown } from 'ming-ui/antd-components';
import { getTypeList } from 'src/utils/domain/control/dynamicValue';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

const DROPDOWN_TRIGGER_STYLE = { width: 'calc(100% - 36px)' };

export default function (props) {
  const { onDynamicValueChange, defaultType, data = {} } = props;
  const [visible, setVisible] = useState(false);
  const $wrap = useRef(null);

  const setDynamicValue = newValue => {
    onDynamicValueChange(newValue || []);
  };

  const handleTimeSelect = type => {
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: type.id }]);
    setVisible(false);
  };

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  const menuItems = getTypeList(data).map(type => ({
    key: type.id,
    label: type.text,
    onClick: () => handleTimeSelect(type),
  }));

  return (
    <DynamicValueInputWrap>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : (
        <Dropdown trigger={['click']} open={visible} onOpenChange={setVisible} menu={{ items: menuItems }}>
          <div style={DROPDOWN_TRIGGER_STYLE}>
            <OtherFieldList {...props} totalWidth />
          </div>
        </Dropdown>
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
