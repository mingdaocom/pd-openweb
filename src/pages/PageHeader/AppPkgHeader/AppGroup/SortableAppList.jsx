import React from 'react';
import _ from 'lodash';
import { SortableList } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import SortableAppItem from './SortableAppItem';

export default ClickAway.wrap(({ items, onScroll, ...rest }) => (
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
