import React, { Component } from 'react';
import { arrayOf, shape, string, func } from 'prop-types';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import AddAppItem from './AddAppItem';
import MyAppItem from './MyAppItem';
import { find, get, isEmpty } from 'lodash';
import { ADVANCE_AUTHORITY } from 'src/pages/PageHeader/AppPkgHeader/config';
const SORT_TYPE = {
  star: 1,
  project: 2,
  personal: 3,
  external: 4,
  expire: 4,
  group: 6,
};
const SortableItem = SortableElement(props => <MyAppItem {...props} />);

const SortableList = SortableContainer(({ items, type, projectId, createAppFromEmpty, allowCreate, ...props }) => {
  const renderContent = () => {
    const canCreate =
      allowCreate &&
      !get(
        find(md.global.Account.projects, item => item.projectId === projectId),
        'cannotCreateApp',
      );
    if (canCreate) {
      return (
        <AddAppItem groupId={props.groupId} type={type} projectId={projectId} createAppFromEmpty={createAppFromEmpty} />
      );
    }
    if (isEmpty(items)) return <span />;
    return null;
  };
  return (
    <div className="sortableAppItemList myAppGroupDetail">
      {items
        .filter(o => !o.pcDisplay || o.permissionType >= ADVANCE_AUTHORITY) // 排除pc端未发布的
        .map((value, index) => (
          <SortableItem key={index} index={index} type={type} {...value} {...props} />
        ))}
      {renderContent()}
    </div>
  );
});

export default class SortableComponent extends Component {
  static propTypes = {
    items: arrayOf(
      shape({
        icon: string,
        iconColor: string,
        name: string,
        projectId: string,
      }),
    ),
    onAppSorted: func,
    type: string,
    projectId: string,
  };

  static defaultProps = {
    onAppSorted: _.noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      items: props.items,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ items: nextProps.items });
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { type, projectId, groupId } = this.props;
    const { items } = this.state;
    const sortedItems = arrayMove(items, oldIndex, newIndex);
    this.setState({ items: sortedItems });

    // 顺序不变则不发请求
    const appIds = items.map(({ id }) => id);
    const sortedAppIds = sortedItems.map(({ id }) => id);
    if (String(appIds) !== String(sortedAppIds)) {
      this.props.onAppSorted(
        { appIds: sortedAppIds, projectId, sortType: SORT_TYPE[type], groupId },
        { type, projectId, sortedItems },
      );
    }
  };

  render() {
    const { items } = this.state;
    return (
      <SortableList
        {..._.omit(this.props, 'items')}
        axis={'xy'}
        hideSortableGhost
        transitionDuration={0}
        helperClass="sortableItemHelperClass"
        distance={3}
        items={items}
        onSortEnd={this.onSortEnd}
      />
    );
  }
}
