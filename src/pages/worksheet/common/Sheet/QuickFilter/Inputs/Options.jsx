import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { arrayOf, func, number, shape, string } from 'prop-types';
import Dropdown from 'src/components/newCustomFields/widgets/Dropdown';
import Checkbox from 'src/components/newCustomFields/widgets/Checkbox';
import Option from './StyledOption';
import { BaseSelectedItem } from './Styles';
import _ from 'lodash';

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  .ant-select {
    border-radius: 4px;
    border: 1px solid #dddddd;
    ${({ isMultiple }) => (isMultiple ? '' : 'height: 32px;')}
    line-height: 32px;
    overflow: hidden;
    &:hover {
      border-color: #ccc !important;
    }
    &.ant-select-open {
      border-color: #2196f3 !important;
    }
    &.customAntSelect:not(.ant-select-open):not(.ant-select-disabled) .ant-select-selector {
      background-color: transparent !important;
      &:hover {
        background-color: transparent !important;
      }
    }
    .ant-select-selector {
      cursor: pointer !important;
      border: none !important;
      min-height: 30px;
      .customAntSelectPlaceHolder,
      .ant-select-selection-placeholder {
        color: #bdbdbd !important;
        font-size: 13px !important;
      }
      .ant-select-selection-search-input {
        height: 30px !important;
      }
      .ant-select-selection-placeholder {
        line-height: 30px !important;
      }
      .ant-select-selection-item {
        line-height: 28px !important;
      }
      .ant-select-selection-item > span {
        margin: 3px 0 !important;
      }
      .customAntSelectPlaceHolder {
        padding: 0px !important;
      }
    }
    &.ant-select-multiple {
      .ant-select-selector .ant-select-selection-overflow {
        ${({ isMultiple }) => (isMultiple ? '.ant-select-selection-search { margin: 0px; }' : 'display: none;')}
      }
      .customAntDropdownTitleWithBG {
        margin-top: 4px !important;
        margin-bottom: 4px !important;
      }
    }
  }
`;

const FullLineCon = styled.div`
  position: relative;
`;

const Selected = styled.div`
  position: absolute;
  background: #fff;
  left: 10px;
  top: 1px;
  font-size: 13px;
  z-index: 2;
  min-height: 30px;
  width: calc(100% - 40px);
  pointer-events: none;
`;

export default function Options(props) {
  const { isMultiple, values = [], control, advancedSetting = {}, onChange = () => {} } = props;
  const { allowitem, direction } = advancedSetting;
  const { options } = control;
  const multiple = String(allowitem) === '2';
  function handleChange(value) {
    onChange({
      ...value,
    });
  }
  if (String(direction) === '1') {
    return (
      <FullLineCon>
        {options
          .filter(o => !o.isDeleted)
          .map((o, i) => (
            <Option
              className={cx('ellipsis', { checked: _.includes(values, o.key) })}
              title={o.value}
              key={i}
              onClick={() => {
                if (_.includes(values, o.key)) {
                  handleChange({ values: values.filter(v => v !== o.key) });
                } else {
                  handleChange({ values: multiple ? _.uniqBy(values.concat(o.key)) : [o.key] });
                }
              }}
            >
              {o.value}
            </Option>
          ))}
      </FullLineCon>
    );
  } else if (String(direction) === '2' && String(allowitem) === '1') {
    return (
      <Con>
        <Dropdown
          {...{ ...control, advancedSetting: { ...control.advancedSetting, allowadd: '0', showtype: '1' } }}
          default={undefined}
          dropdownClassName="scrollInTable"
          value={JSON.stringify(values)}
          selectProps={{
            onChange: newValue => {
              if (_.isObject(newValue)) {
                newValue = newValue.value;
              }
              handleChange({ values: newValue ? [newValue] : [] });
            },
          }}
        />
      </Con>
    );
  } else if (String(direction) === '2' && String(allowitem) === '2') {
    return (
      <Con isMultiple>
        <Checkbox
          {...{ ...control, advancedSetting: { ...control.advancedSetting, checktype: '1' } }}
          default={undefined}
          isFocus
          dropdownClassName="scrollInTable"
          value={JSON.stringify(values)}
          onChange={newValue => {
            handleChange({ values: JSON.parse(newValue) });
          }}
        />
      </Con>
    );
  } else {
    return <span />;
  }
}

Options.propTypes = {
  values: arrayOf(string),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
