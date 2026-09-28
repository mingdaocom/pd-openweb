import React, { useRef } from 'react';
import styled from 'styled-components';
import { Select } from 'ming-ui/antd-components';

const SelectWrapper = styled.div`
  .selectItem {
    font-size: 13px;
    width: ${({ $width }) => `${$width ? $width + 'px' : '100%'} !important`};
  }
`;

export default function CommonSelect(props) {
  const { className, notFoundContent, width, ...restProps } = props;
  const selectRef = useRef();

  return (
    <SelectWrapper ref={selectRef} className={className || ''} $width={width}>
      <Select
        className="selectItem"
        getPopupContainer={() => selectRef.current}
        notFoundContent={notFoundContent || _l('暂无数据')}
        {...restProps}
      />
    </SelectWrapper>
  );
}
