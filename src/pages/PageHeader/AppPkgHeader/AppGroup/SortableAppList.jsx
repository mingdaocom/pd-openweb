import React from 'react';
import cx from 'classnames';
import { sortableContainer } from 'react-sortable-hoc';
import SortableAppItem from './SortableAppItem';
import withClickAway from 'ming-ui/decorators/withClickAway';
import _ from 'lodash';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';

export default withClickAway(
  sortableContainer(({ items, onScroll, permissionType, ...rest }) => (
    <ul className="appItemsWrap" onScroll={_.throttle(onScroll)}>
      {items.map((value, index) => (
        <SortableAppItem
          key={`item-${index}`}
          index={index}
          disabled={!canEditApp(permissionType)}
          value={value}
          permissionType={permissionType}
          {...rest}
        />
      ))}
    </ul>
  )),
);
