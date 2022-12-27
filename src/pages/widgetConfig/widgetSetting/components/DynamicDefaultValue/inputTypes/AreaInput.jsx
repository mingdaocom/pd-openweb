import React, { useState, useEffect, createRef } from 'react';
import { DynamicValueInputWrap } from '../styled';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import CityPicker from 'ming-ui/components/CityPicker';
import _ from 'lodash';

const AREA_TYPE = {
  19: 1,
  23: 2,
  24: 3,
};

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType } = props;
  const { staticValue, cid = '' } = dynamicValue[0] || {};
  const areaLevel = AREA_TYPE[data.type];
  const name = JSON.parse(staticValue || '{}').name || '';
  const [value, setValue] = useState(name);
  const [isDynamic, setDynamic] = useState(!!cid);
  const $wrap = createRef(null);

  useEffect(() => {
    setDynamic(!!cid);
    setValue(name);
  }, [data.controlId, cid, name]);

  const setDynamicValue = newValue => {
    setValue('');
    onDynamicValueChange(newValue || []);
  };

  const handleChange = area => {
    const code = _.last(area).id;
    const name = area.map(item => item.name).join('/');
    setValue(name);
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: JSON.stringify({ code, name }) }]);
  };
  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };
  return (
    <DynamicValueInputWrap hasHoverBg={!!value}>
      {defaultType ? (
        <DynamicInput {...props} onTriggerClick={onTriggerClick} />
      ) : isDynamic ? (
        <OtherFieldList
          onClick={() => {
            setDynamic(false);
          }}
          {...props}
        />
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
          <CityPicker level={areaLevel} callback={handleChange}>
            <input readOnly autoFocus value={value} />
          </CityPicker>
        </div>
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
