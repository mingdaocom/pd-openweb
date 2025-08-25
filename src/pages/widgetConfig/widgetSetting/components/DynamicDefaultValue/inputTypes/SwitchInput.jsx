import React, { createRef, Fragment, useState } from 'react';
import { ClickAwayMenu, DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';
import { getTypeList } from '../util';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], defaultType, data = {} } = props;
  const [visible, setVisible] = useState(false);
  const $wrap = createRef(null);
  const Type_List = getTypeList(data);

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
          types={Type_List}
          handleTimeSelect={handleTimeSelect}
          onClickAway={() => setVisible(false)}
        />
      )}
    </Fragment>
  );
}
