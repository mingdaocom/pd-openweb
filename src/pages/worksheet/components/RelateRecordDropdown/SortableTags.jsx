import React from 'react';
import cx from 'classnames';
import { SortableList } from 'ming-ui';

export default function SortableTags() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4,
      }}
    >
      <SortableList
        // useDragHandle
        items={[
          {
            id: 1,
            name: 'tag1',
          },
          {
            id: 2,
            name: 'tag2',
          },
          {
            id: 3,
            name: 'tag3',
          },
          {
            id: 4,
            name: 'tag4',
          },
          {
            id: 5,
            name: 'tag5',
          },
        ]}
        itemKey="id"
        helperClass="draggingItem"
        onSortEnd={newItems => {
          console.log(newItems);
        }}
        renderItem={options => {
          const { item, index, dragging, isLayer } = options;
          return (
            <div
              className={cx('tagItem', { isDragging: dragging, draggingItem: isLayer })}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                backgroundColor: '#f0f0f0',
              }}
              key={index}
              index={index}
            >
              {item.name}
            </div>
          );
        }}
      />
    </div>
  );
}
