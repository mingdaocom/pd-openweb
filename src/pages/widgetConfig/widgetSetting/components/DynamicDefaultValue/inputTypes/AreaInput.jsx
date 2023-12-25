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
  const [search, setSearch] = useState('');
  const [keywords, setKeywords] = useState('');
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
    const last = _.last(area);
    setValue(last.path);
    setSearch('');
    setKeywords('');
    onDynamicValueChange([{ cid: '', rcid: '', staticValue: JSON.stringify({ code: last.id, name: last.path }) }]);
  };
  const onTriggerClick = () => {
    defaultType && $wrap.current.triggerClick();
  };

  const onFetchData = _.debounce(value => {
    setKeywords(value);
  }, 500);

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
          <CityPicker key={`CityPicker-${data.controlId}`} search={keywords} level={areaLevel} callback={handleChange}>
            <input
              className="CityPicker-input-placeholder-Gray3"
              autoFocus
              placeholder={value}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                onFetchData(e.target.value);
              }}
            />
          </CityPicker>
        </div>
      )}
      <SelectOtherField {...props} onDynamicValueChange={setDynamicValue} ref={$wrap} />
    </DynamicValueInputWrap>
  );
}
