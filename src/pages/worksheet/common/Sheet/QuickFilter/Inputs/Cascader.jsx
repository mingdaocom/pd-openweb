import React from 'react';
import { arrayOf, func, shape } from 'prop-types';
import styled from 'styled-components';
import CascaderDropdown from 'src/components/Form/DesktopForm/widgets/Cascader';

const Con = styled.div`
  .ant-select-selector {
    min-height: 30px;
    line-height: 30px;
  }
  .customCascader .cascader-input {
    min-height: 30px;
    .cascader-placeholder {
      line-height: 30px !important;
    }
  }
  .customAntSelect:not(.ant-select-open):not(.ant-select-disabled) .ant-select-selector {
    background-color: #fff !important;
    border-color: #d9d9d9 !important;
    &:hover {
      background-color: #fff !important;
      border-color: #d9d9d9 !important;
    }
  }
  .customTreeSelect.ant-select-single {
    .ant-select-selection-item {
      word-wrap: break-word;
      word-break: break-all;
      line-height: 24px !important;
    }
  }
`;

export default function RelateRecord(props) {
  const { control, values = [], advancedSetting, onChange = () => {}, enumDefault } = props;
  const { allowitem } = advancedSetting || {};
  const isMultiple = enumDefault === 2 || String(allowitem) === '2';
  function handleChange(value) {
    onChange({
      filterType: props.filterType || 24,
      ...value,
    });
  }
  return (
    <Con>
      <CascaderDropdown
        notLimitCount={true}
        popupAlign={{
          offset: [6, 2],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
        treePopupAlign={{
          offset: [7, -28],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
        onChange={newSelected => {
          handleChange({
            values: JSON.parse(newSelected || '[]').map(item => ({ rowid: item.sid, name: item.name })),
          });
        }}
        {...{
          ...control,
          enumDefault: isMultiple ? 2 : 1,
          advancedSetting: {
            ...control.advancedSetting,
            anylevel: '0',
            filters: '[]',
          },
          value: JSON.stringify(values.map(v => ({ sid: v.rowid, name: v.name }))),
        }}
      />
    </Con>
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
