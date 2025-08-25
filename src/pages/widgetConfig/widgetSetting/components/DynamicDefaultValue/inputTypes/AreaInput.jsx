import React, { createRef, useEffect, useState } from 'react';
import _ from 'lodash';
import CityPicker from 'ming-ui/components/CityPicker';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default function (props) {
  const { onDynamicValueChange, dynamicValue = [], data = {}, defaultType, globalSheetInfo = {} } = props;
  const { staticValue, cid = '' } = dynamicValue[0] || {};
  const name = JSON.parse(staticValue || '{}').name || '';
  const { chooserange } = data.advancedSetting || {};
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
    if (_.isEmpty(last)) {
      return onDynamicValueChange([]);
    }
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
              <span className="icon icon-cancel Font15"></span>
            </div>
          )}
          <CityPicker
            key={`CityPicker-${data.controlId}-${chooserange}-${data.enumDefault2}`}
            search={keywords}
            defaultValue={value}
            level={data.enumDefault2}
            chooserange={chooserange}
            projectId={globalSheetInfo.projectId}
            callback={handleChange}
          >
            <input
              className="CityPicker-input-placeholder-Gray3"
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
