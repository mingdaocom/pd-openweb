import React, { useRef } from 'react';
import { Select } from 'antd';
import styled from 'styled-components';

const SelectWrapper = styled.div`
  .selectItem {
    font-size: 13px;
    width: ${({ width }) => `${width ? width + 'px' : '100%'} !important`};
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border: 1px solid #ccc !important;
      border-radius: 3px !important;
      box-shadow: none !important;
    }
    &.ant-select-focused {
      .ant-select-selector {
        border-color: #1e88e5 !important;
      }
    }
    &.disabled {
      .ant-select-selector {
        border: 0;
      }
    }
  }
`;

export default function CommonSelect(props) {
  const { className, notFoundContent, width, ...restProps } = props;
  const selectRef = useRef();

  return (
    <SelectWrapper ref={selectRef} className={className || ''} width={width}>
      <Select
        className="selectItem"
        getPopupContainer={() => selectRef.current}
        notFoundContent={notFoundContent || _l('暂无数据')}
        {...restProps}
      />
    </SelectWrapper>
  );
}
