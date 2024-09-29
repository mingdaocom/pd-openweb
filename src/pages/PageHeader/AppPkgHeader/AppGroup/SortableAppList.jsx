import React from 'react';
import cx from 'classnames';
import { SortableList } from 'ming-ui';
import SortableAppItem from './SortableAppItem';
import withClickAway from 'ming-ui/decorators/withClickAway';
import _ from 'lodash';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';

export default withClickAway(
  ({ items, onScroll, ...rest }) => (
    <div className="appItemsWrap" onScroll={_.throttle(onScroll)}>
      <SortableList
        useDragHandle={false}
        dragPreviewImage={true}
        canDrag={canEditApp(rest.permissionType)}
        items={items}
        itemKey="appSectionId"
        renderItem={(options) => {
          const { index, item } = options;
          return (
            <SortableAppItem
              index={index}
              value={item}
              {...rest}
            />
          );
        }}
        onSortEnd={rest.onSortEnd}
      />
    </div>
  )
);
