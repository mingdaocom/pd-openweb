import React, { Component } from 'react';
import { arrayOf, shape, string, func } from 'prop-types';
import { SortableList } from 'ming-ui';
import AddAppItem from './AddAppItem';
import MyAppItem from './MyAppItem';
import _, { isEmpty } from 'lodash';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util.js';

const SORT_TYPE = {
  star: 1,
  project: 2,
  personal: 3,
  external: 4,
  expire: 4,
  group: 6,
  owned: 8,
};

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
      canDrag: true,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.items.length !== this.props.items.length) {
      this.setState({ sortedIds: this.props.items.map(item => item.id) });
    }
  }

  onSortEnd = newItems => {
    const { type, projectId, groupId } = this.props;
    const sortedAppIds = newItems.map(item => item.id);
    this.setState({ sortedIds: sortedAppIds });

    this.props.onAppSorted({ appIds: sortedAppIds, projectId, sortType: SORT_TYPE[type], groupId });
  };

  render() {
    const {
      items,
      allowCreate,
      keywords,
      groupId,
      groupType,
      type,
      projectId,
      createAppFromEmpty,
      myPermissions = [],
    } = this.props;
    const { sortedIds, canDrag } = this.state;

    const renderContent = () => {
      if (allowCreate && !keywords) {
        return (
          <AddAppItem
            groupId={groupId}
            groupType={groupType}
            type={type}
            projectId={projectId}
            createAppFromEmpty={createAppFromEmpty}
            myPermissions={myPermissions}
          />
        );
      }
      if (isEmpty(items)) return <span />;
      return null;
    };

    return (
      <div className="sortableAppItemList myAppGroupDetail">
        <SortableList
          items={sortedIds
            .map(id => _.find(items, { id }))
            .concat(items.filter(item => !_.includes(sortedIds, item.id)))
            .filter(o => o && (!o.pcDisplay || canEditApp(o.permissionType)))}
          renderItem={({ item }) => (
            <MyAppItem
              {...item}
              {...this.props}
              canDrag={canDrag}
              onChangeCanDrag={value => this.setState({ canDrag: value })}
            />
          )}
          itemKey="id"
          helperClass="sortableItemHelperClass"
          onSortEnd={this.onSortEnd}
          canDrag={canDrag}
        />
        {renderContent()}
      </div>
    );
  }
}
