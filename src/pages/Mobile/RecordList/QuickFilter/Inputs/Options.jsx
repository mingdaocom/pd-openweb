import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { arrayOf, func, number, shape, string } from 'prop-types';
import OptionsList from './OptionsList';
import RightSidebar from './RightSidebar';
import _ from 'lodash';

export const Option = styled.div`
  cursor: pointer;
  font-size: 12px;
  display: inline-block;
  margin: 0 12px 12px 0;
  color: #757575;
  padding: 4px 12px;
  border-radius: 28px;
  max-width: 200px;
  user-select: none;
  background-color: #F5F5F5;
  &.checked {
    color: #fff;
    border-color: #2196f3;
    background-color: #2196f3;
  }
  &.more {
    padding: 3px 12px;
    border: 1px solid #EAEAEA;
    background-color: #fff;
  }
  .ming.Checkbox {
    padding: 1px 0;
  }
`;

function pickOptions(options, navfilters) {
  try {
    const pickIds = JSON.parse(navfilters);
    return options.filter(o => _.includes(pickIds, o.key));
  } catch (err) {
    return options;
  }
}
export default function Options(props) {
  const { values = [], control, advancedSetting = {}, onChange = () => {} } = props;
  const { allowitem, direction, navshow, navfilters, shownullitem, nullitemname } = advancedSetting;
  let { options } = control;
  const multiple = String(allowitem) === '2';
  const [moreVisible, setMoreVisible] = useState(false);
  if (String(navshow) === '2') {
    options = pickOptions(options, navfilters);
  }
  if (shownullitem === '1') {
    options = [
      {
        key: 'isEmpty',
        color: 'transparent',
        value: nullitemname || _l('为空'),
      },
    ].concat(options);
  }
  const newOptions = options.filter(o => !o.isDeleted).slice(0, 10);
  const isMore = options.length > newOptions.length;

  const handleSetMoreVisible = () => {
    setMoreVisible(!moreVisible);
  };

  function handleChange(value) {
    onChange({
      ...value,
    });
  }

  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis">{control.controlName}</div>
        {!_.isEmpty(values) && (
          <div className="selected ellipsis">{multiple ? _l('选择%0项', values.length) : _.find(options, { key: values[0] }).value }</div>
        )}
      </div>
      <div>
        {newOptions.map((o, i) => (
          <Option
            key={i}
            className={('ellipsis', cx({ checked: _.includes(values, o.key) }))}
            onClick={() => {
              if (o.key === 'isEmpty') {
                handleChange({ values: values.length === 1 && values[0] === 'isEmpty' ? [] : ['isEmpty'] });
              } else if (_.includes(values, o.key)) {
                handleChange({ values: values.filter(v => v !== o.key) });
              } else {
                handleChange({ values: multiple ? _.uniqBy(values.concat(o.key)) : [o.key] });
              }
            }}
          >
            {o.value}
          </Option>
        ))}
        {isMore && <Option className="more" onClick={handleSetMoreVisible}>{_l('更多...')}</Option>}
      </div>
      {moreVisible && (
        <RightSidebar
          name={control.controlName}
          onHideSidebar={handleSetMoreVisible}
        >
          <OptionsList
            multiple={multiple}
            selected={values}
            control={control}
            onChange={newOptions => {
              handleChange({ values: newOptions });
            }}
          />
        </RightSidebar>
      )}
    </div>
  );
}

Options.propTypes = {
  values: arrayOf(string),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
