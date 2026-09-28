import React from 'react';
import { arrayOf, func, shape } from 'prop-types';
import CascaderDropdown from 'src/components/Form/DesktopForm/widgets/Cascader';

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
    <CascaderDropdown
      notLimitCount={true}
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
  );
}

RelateRecord.propTypes = {
  values: arrayOf(shape({})),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
};
