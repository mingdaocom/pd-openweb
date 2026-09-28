import React from 'react';
import _ from 'lodash';
import { func, string } from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Radio, Switch } from 'ming-ui/antd-components';
import { getSwitchItemNames } from 'src/utils/domain/control/options';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

const Con = styled.div`
  display: flex;
  height: 32px;
  align-items: center;
  .quickFilterRadioGroup {
    display: flex;
    width: 100%;
    flex-wrap: nowrap;
    label {
      display: inline-flex;
      max-width: 50%;
      margin-right: 0;
      padding-right: 20px;
      > span:last-child {
        min-width: 0;
      }
      .ellipsis {
        display: block;
      }
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
        <Switch
          checked={isChecked}
          onClick={(checked, event) => {
            event.stopPropagation();
            return handleChange(!checked, event);
          }}
        />
        {text && <span className="mLeft6 flex overflow_ellipsis">{text}</span>}
      </Con>
    );
  }

  if (advancedSetting.showtype === '2') {
    return (
      <Con>
        <Radio.Group
          className="quickFilterRadioGroup"
          size="middle"
          value={filterType === 0 || _.isUndefined(filterType) ? undefined : isChecked ? '1' : '0'}
          options={(itemnames.map(item => ({ text: item.value, value: item.key })) || []).map(
            ({ text, ...option }) => ({
              ...option,
              label: (
                <span className="ellipsis" title={text}>
                  {text}
                </span>
              ),
            }),
          )}
          onChange={event => handleChange(event.target.value !== '1')}
        />
      </Con>
    );
  }

  return (
    <Con style={{ fontSize: 0 }}>
      <Checkbox checked={isChecked} onChange={event => handleChange(!event.target.checked, undefined, event)} />
    </Con>
  );
}

CheckboxComp.propTypes = {
  filterType: string,
  onChange: func,
};
