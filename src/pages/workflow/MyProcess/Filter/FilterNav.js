import React, { Fragment } from 'react';
import { Segmented } from 'ming-ui/antd-components';

export default function FilterNav({ data, checked, doneTypeCount, onChange }) {
  const currentItem = data.find(item => item.value.type === checked?.type) || data[0];

  return (
    <Segmented
      className="bgDisabled mRight20"
      value={currentItem?.value.type}
      options={data.map(item => ({
        label: (
          <Fragment>
            <span>{item.name}</span>
            {!!doneTypeCount[item.value.type] && <span className="mLeft2">{doneTypeCount[item.value.type] || ''}</span>}
          </Fragment>
        ),
        value: item.value.type,
      }))}
      onChange={type => {
        const item = data.find(item => item.value.type === type);
        item && onChange(item.value);
      }}
    />
  );
}
