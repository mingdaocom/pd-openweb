import React from 'react';
import { Checkbox, Switch as SwitchComponent, RadioGroup } from 'ming-ui';
import styled from 'styled-components';
import { func, string } from 'prop-types';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { getSwitchItemNames } from 'src/pages/widgetConfig/util';

const Con = styled.div`
  display: flex;
  height: 32px;
  align-items: center;
  .RadioGroup {
    width: 100%;
    flex-wrap: nowrap;
    label {
      display: inline-block;
      max-width: 50%;
      margin-right: 0;
      padding-right: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export default function CheckboxComp(props) {
  const { filterType, onChange = () => {}, control: { advancedSetting = {} } = {} } = props;

  const itemnames = getSwitchItemNames(props.control);
  const isChecked = filterType === FILTER_CONDITION_TYPE.EQ;

  const handleChange = checked => {
    onChange({
      filterType: checked ? FILTER_CONDITION_TYPE.NE : FILTER_CONDITION_TYPE.EQ,
      value: 1,
    });
  };

  if (advancedSetting.showtype === '1') {
    const text = isChecked ? _.get(itemnames[0], 'value') : _.get(itemnames[1], 'value');
    return (
      <Con>
        <SwitchComponent checked={isChecked} onClick={handleChange} />
        {text && <span className="mLeft6 flex overflow_ellipsis">{text}</span>}
      </Con>
    );
  }

  if (advancedSetting.showtype === '2') {
    return (
      <Con>
        <RadioGroup
          size="middle"
          checkedValue={filterType === 0 || _.isUndefined(filterType) ? undefined : isChecked ? '1' : '0'}
          data={itemnames.map(item => ({ text: item.value, value: item.key }))}
          onChange={type => handleChange(type !== '1')}
        />
      </Con>
    );
  }

  return (
    <Con style={{ fontSize: 0 }}>
      <Checkbox checked={isChecked} onClick={handleChange} />
    </Con>
  );
}

CheckboxComp.propTypes = {
  filterType: string,
  onChange: func,
};
