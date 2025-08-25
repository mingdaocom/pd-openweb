import React from 'react';
import _ from 'lodash';
import { SortableList } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import SortableAppItem from './SortableAppItem';

export default withClickAway(({ items, onScroll, ...rest }) => (
  <div className="appItemsWrap" onScroll={_.throttle(onScroll)}>
    <SortableList
      useDragHandle={false}
      dragPreviewImage={true}
      canDrag={canEditApp(rest.permissionType)}
      items={items}
      itemKey="appSectionId"
      renderItem={options => {
        const { index, item } = options;
        return <SortableAppItem index={index} value={item} {...rest} />;
      }}
      onSortEnd={rest.onSortEnd}
    />
  </div>
));
