import React, { useState, useEffect, createRef } from 'react';
import TimePicker from 'ming-ui/components/TimePicker';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType } = props;
  const { staticValue = '', cid = '' } = dynamicValue[0] || {};
  const [value, setValue] = useState(staticValue);
  // 静态值+此刻，此刻渲染走动态格式组件
  const [isDynamic, setDynamic] = useState(staticValue === '2' || !!cid);
  const $wrap = createRef(null);

  useEffect(() => {
    setDynamic(staticValue === '2' || !!cid);
    setValue(staticValue);
  }, [data.controlId, cid, staticValue]);

  const setDynamicValue = newValue => {
    setValue('');
    onDynamicValueChange(newValue || []);
  };

  const handleTimeChange = time => {
    const newTime = time ? time.format(data.unit === '6' ? 'HH:mm:ss' : 'HH:mm') : '';
    setValue(newTime);
    const newValue = [{ rcid: '', cid: '', staticValue: newTime }];
    onDynamicValueChange(newValue);
  };

  const clearTime = () => {
    onDynamicValueChange([]);
  };

  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  return (
    <DynamicValueInputWrap hasHoverBg={!!value}>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : isDynamic ? (
        <OtherFieldList {...props} />
      ) : (
        <div className="dynamicCityContainer">
          {value && (
            <div
              className="clearOp pointer"
              onClick={e => {
                e.stopPropagation();
                onDynamicValueChange([]);
              }}
            >
              <span className="icon icon-closeelement-bg-circle Font15"></span>
            </div>
          )}
          <TimePicker
            panelCls="dynamicTimePanel"
            showSecond={data.unit === '6'}
            onChange={value => handleTimeChange(value)}
            onClear={clearTime}
          >
            <input readOnly value={value} />
          </TimePicker>
        </div>
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
