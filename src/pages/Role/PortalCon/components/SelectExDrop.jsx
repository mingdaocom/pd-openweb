import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';

const StyledSelectContainer = styled.div`
  .hap-select-arrow {
    right: 8px;
    color: rgba(0, 0, 0, 0.25);
  }
`;

const StyledDropdown = styled.div`
  .hap-select-item {
    margin: 0;
  }
  .hap-select-item-option-selected:not(.hap-select-item-option-disabled),
  .hap-select-item-option-active:not(.hap-select-item-option-disabled) {
    background-color: var(--color-background-primary);
  }
`;

const StyledTag = styled.span`
  &.hap-select-selection-item {
    background: var(--color-background-disabled);
    border-radius: 4px;
    margin-right: 4px;
    padding: 0 8px;
  }
`;

export default function SelectExDrop(props) {
  const { disabled, controls, onChange, max = 3 } = props;
  const selectedValues = props.values;
  const selectOptions = controls.map(o => {
    const value = o[props.keyId || 'controlId'];

    return {
      value,
      label: o[props.name || 'controlName'],
      disabled: selectedValues.length >= max && !selectedValues.includes(value),
    };
  });

  const handleChange = values => {
    onChange(values);
  };

  return (
    <StyledSelectContainer className={props.className}>
      <Select
        mode="multiple"
        placeholder={_l('请选择')}
        className="mTop10"
        allowClear
        suffixIcon={<Icon icon="arrow-down-border" className="Font14" />}
        disabled={disabled}
        value={selectedValues}
        onChange={handleChange}
        style={{ width: '100%' }}
        maxTagCount={max}
        popupRender={menu => <StyledDropdown>{menu}</StyledDropdown>}
        tagRender={props => (
          <StyledTag className="hap-select-selection-item alignItemsCenter">
            <span
              className={cx('hap-select-selection-item-content', { Red: !props.label || props.label === props.value })}
            >
              {props.label === props.value ? _l('已删除') : props.label}
            </span>
            <Icon
              icon="close"
              className="Font14 inlineFlexRow Hand textSecondary hoverColorPrimary"
              onClick={props.onClose}
            />
          </StyledTag>
        )}
        notFoundContent={<span className="textTertiary">{props.noTxt || _l('暂无相关字段')}</span>}
        optionLabelProp="label"
        styles={{ popup: { root: { padding: 0 } } }}
        options={selectOptions}
      />
    </StyledSelectContainer>
  );
}
