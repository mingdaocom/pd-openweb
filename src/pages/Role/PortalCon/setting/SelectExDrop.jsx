import React, { useEffect, useState } from 'react';
import { Checkbox, Select } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';

const { Option } = Select;

const StyledSelectContainer = styled.div`
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 3px;
    border: 1px solid #e0e0e0;
    padding-right: 24px;
  }

  .ant-select-arrow {
    right: 8px;
    color: rgba(0, 0, 0, 0.25);
  }
`;

const StyledDropdown = styled.div`
  .ant-select-item {
    margin: 0;
  }
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled),
  .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    background-color: #fff;
  }
  .ant-select-item-option-selected:not(.ant-select-item-option-disabled) .ant-select-item-option-state {
    display: none;
  }
  .ant-select-item-option-disabled {
    opacity: 0.5;
    .ant-checkbox-wrapper {
      cursor: not-allowed;
    }
  }
`;

const StyledTag = styled.span`
  &.ant-select-selection-item {
    background: #f0f0f0;
    border-radius: 4px;
    margin-right: 4px;
    padding: 0 8px;
  }
`;

const CheckboxOption = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 0;
`;

export default function CheckboxSelect(props) {
  const { disabled, controls, onChange } = props;
  const [selectedValues, setSelectedValues] = useState(props.values);

  useEffect(() => {
    setSelectedValues(props.values);
  }, [props.values]);

  const handleChange = values => {
    onChange(values);
  };

  return (
    <StyledSelectContainer>
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
        maxTagCount={3}
        dropdownRender={menu => <StyledDropdown>{menu}</StyledDropdown>}
        tagRender={props => (
          <StyledTag className="ant-select-selection-item alignItemsCenter">
            <span
              className={cx('ant-select-selection-item-content', { Red: !props.label || props.label === props.value })}
            >
              {props.label === props.value ? _l('已删除') : props.label}
            </span>
            <Icon icon="close" className="Font14 inlineFlexRow Hand Gray_75 ThemeHoverColor3" onClick={props.onClose} />
          </StyledTag>
        )}
        notFoundContent={<span className="Gray_9e">{_l('暂无相关字段')}</span>}
        optionLabelProp="label"
        dropdownStyle={{ padding: 0 }}
        // 添加以下属性确保箭头显示
        showArrow={true}
        inputIcon={null}
      >
        {controls
          .map(o => {
            return { value: o.controlId, label: o.controlName };
          })
          .map((option, index) => (
            <React.Fragment key={option.value}>
              <Option
                value={option.value}
                label={option.label}
                disabled={selectedValues.length >= 3 && !selectedValues.includes(option.value)}
              >
                <CheckboxOption>
                  <Checkbox
                    checked={selectedValues.includes(option.value)}
                    disabled={selectedValues.length >= 3 && !selectedValues.includes(option.value)}
                  />
                  <span style={{ marginLeft: 8 }}>{option.label}</span>
                </CheckboxOption>
              </Option>
            </React.Fragment>
          ))}
      </Select>
    </StyledSelectContainer>
  );
}
