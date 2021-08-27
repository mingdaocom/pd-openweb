import React from 'react';

import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';

import ListNull from './ListNull';
import GroupItem from './GroupItem';

export default class GroupList extends React.Component {
  constructor() {
    super();

    this.debouncedScroll = _.throttle(this.scrollEvent.bind(this), 20, {
      leading: true,
    });
  }

  componentDidMount() {
    this.props.fetch();
  }

  componentWillUnmount() {
    this.debouncedScroll.cancel();
  }

  scrollEvent(e, { direction, maximum, position }) {
    if (direction === 'down' && maximum - position < 20) {
      this.props.fetch();
    }
  }

  renderSingleList(listProps) {
    const { title, list } = listProps;
    return (
      <div className="list-wrapper" key={title}>
        <div className="list-packet list-packet-name Gray_75 Font12">{title}</div>
        <div>
          {_.map(list, item => (
            <GroupItem {...item} key={item.groupId} itemClickHandler={this.props.itemClickHandler} isSelected={item.groupId === this.props.selectedGroupId} />
          ))}
        </div>
      </div>
    );
  }

  renderListContent() {
    const { isLoading, list, isSearch } = this.props;
    if (!isSearch) {
      const keys = _.keys(list);
      if (!keys.length && isLoading) return <LoadDiv className="mTop10" />;
      return (
        <React.Fragment>
          {_.map(keys.sort((a, b) => a.localeCompare(b)), (key) => {
            const props = {
              list: list[key],
              title: key,
            };
            return this.renderSingleList(props);
          })}
          {isLoading ? <LoadDiv /> : null}
          {!isLoading && keys && keys.length === 0 ? <ListNull isSearch={isSearch} type={'groups'} /> : null}
        </React.Fragment>
      );
    } else {
      if (!isLoading && list && list.length === 0) {
        return <ListNull isSearch={isSearch} type={'groups'} />;
      }
      return (
        <React.Fragment>
          {_.map(list, item => (
            <GroupItem {...item} key={item.groupId} itemClickHandler={this.props.itemClickHandler} isSelected={item.groupId === this.props.selectedGroupId} />
          ))}
          {isLoading ? <LoadDiv /> : null}
        </React.Fragment>
      );
    }
  }

  render() {
    return <ScrollView updateEvent={this.debouncedScroll}>{this.renderListContent()}</ScrollView>;
  }
}
