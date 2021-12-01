import React, { useState, Fragment, createRef } from 'react';
import { DynamicValueInputWrap } from '../styled';
import { CHECKBOX_TYPES } from '../config';
import { OtherFieldList, SelectOtherField, ClickAwayMenu, DynamicInput } from '../components';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], defaultType } = props;
  const [visible, setVisible] = useState(false);
  const $wrap = createRef(null);

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
  return (
    <Fragment>
      <DynamicValueInputWrap>
        {defaultType ? (
          <DynamicInput {...props} onTriggerClick={onTriggerClick} />
        ) : (
          <OtherFieldList {...props} onClick={() => setVisible(true)} />
        )}
        <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
      </DynamicValueInputWrap>
      {visible && (
        <ClickAwayMenu
          showClear={false}
          dynamicValue={dynamicValue}
          types={CHECKBOX_TYPES}
          handleTimeSelect={handleTimeSelect}
          onClickAway={() => setVisible(false)}
        />
      )}
    </Fragment>
  );
}
