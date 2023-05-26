import React, { Component } from 'react';
import { arrayOf, shape, string, func } from 'prop-types';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import AddAppItem from './AddAppItem';
import MyAppItem from './MyAppItem';
import _, { find, get, isEmpty } from 'lodash';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util.js';
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
        <AddAppItem
          groupId={props.groupId}
          groupType={props.groupType}
          type={type}
          projectId={projectId}
          createAppFromEmpty={createAppFromEmpty}
        />
      );
    }
    if (isEmpty(items)) return <span />;
    return null;
  };
  return (
    <div className="sortableAppItemList myAppGroupDetail">
      {items
        .filter(o => !o.pcDisplay || canEditApp(o.permissionType)) // 排除pc端未发布的
        .map((value, index) => (
          <SortableItem key={value.id || index} index={index} type={type} {...value} {...props} />
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
      sortedIds: props.items.map(item => item.id),
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.items.length !== this.props.items.length) {
      this.setState({ sortedIds: this.props.items.map(item => item.id) });
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { type, projectId, groupId, items } = this.props;
    const { sortedIds } = this.state;
    const sortedAppIds = arrayMove(sortedIds, oldIndex, newIndex);
    this.setState({ sortedIds: sortedAppIds });

    // 顺序不变则不发请求
    const appIds = items.map(({ id }) => id);
    if (String(appIds) !== String(sortedAppIds)) {
      this.props.onAppSorted({ appIds: sortedAppIds, projectId, sortType: SORT_TYPE[type], groupId });
    }
  };

  render() {
    const { items } = this.props;
    const { sortedIds } = this.state;
    return (
      <SortableList
        {..._.omit(this.props, 'items')}
        axis={'xy'}
        hideSortableGhost
        transitionDuration={0}
        helperClass="sortableItemHelperClass"
        distance={3}
        items={sortedIds
          .map(id => _.find(items, { id }))
          .concat(items.filter(item => !_.includes(sortedIds, item.id)))
          .filter(_.identity)}
        onSortEnd={this.onSortEnd}
      />
    );
  }
}
