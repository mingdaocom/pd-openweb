import React from 'react';
import cx from 'classnames';
import { sortableContainer } from 'react-sortable-hoc';
import SortableAppItem from './SortableAppItem';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { ADVANCE_AUTHORITY } from '../config';
import _ from 'lodash';

export default withClickAway(
  sortableContainer(({ items, onScroll, permissionType, ...rest }) => (
    <ul className="appItemsWrap" onScroll={_.throttle(onScroll)}>
      {items.map((value, index) => (
        <SortableAppItem
          key={`item-${index}`}
          index={index}
          disabled={permissionType < ADVANCE_AUTHORITY}
          value={value}
          permissionType={permissionType}
          {...rest}
        />
      ))}
    </ul>
  ))
);
