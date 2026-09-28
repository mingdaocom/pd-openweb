import React from 'react';
import { SortableList } from 'ming-ui';
import Item from './Item';
import './index.less';

export default function (props) {
  const { setting, onChange, onAdd, onDelete } = props;

  return (
    <div className="sortCustom mTop6">
      <SortableList
        renderBody
        {...props}
        items={setting.map((o, i) => {
          return { info: o.info ? o.info : o, num: i };
        })}
        useDragHandle
        itemKey="num"
        onSortEnd={setting => onChange(setting.map(o => o.info))}
        helperClass={'sortCustomFile'}
        renderItem={options => (
          <Item
            {...props}
            {...options}
            setting={setting}
            onUpdate={(data, index) => onAdd(data, index)}
            onDelete={onDelete}
          />
        )}
      />
    </div>
  );
}
