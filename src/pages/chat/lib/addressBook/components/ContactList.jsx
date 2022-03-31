import React from 'react';

import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';

import ListNull from './ListNull';
import ContactItem from './ContactItem';

export default class ContactList extends React.Component {
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

  renderList(list) {
    return (
      <React.Fragment>
        {_.map(list, item => (
          <ContactItem
            {...item}
            key={item.accountId}
            itemClickHandler={this.props.itemClickHandler}
            isSelected={item.accountId === this.props.selectedAccountId}
            searchDepartmentUsers={this.props.searchDepartmentUsers}
          />
        ))}
      </React.Fragment>
    );
  }

  renderSingleList(listProps) {
    const { title, list } = listProps;
    return (
      <div className="list-wrapper" key={title}>
        <div className="list-packet list-packet-name Gray_75 Font12">{title}</div>
        <div>{this.renderList(list)}</div>
      </div>
    );
  }

  renderListContent() {
    const { isLoading, list, isSearch } = this.props;
    if (isSearch) {
      if (!isLoading && list && list.length === 0) {
        return <ListNull isSearch={isSearch} type={'contacts'} />;
      }
      return (
        <React.Fragment>
          {this.renderList(list)}
          {isLoading ? <LoadDiv className="mTop10" /> : null}
        </React.Fragment>
      );
    } else {
      const keys = _.keys(list);
      if (!keys.length && isLoading) return <LoadDiv className="mTop10" />;
      return (
        <React.Fragment>
          {_.map(
            keys.sort((a, b) => a.localeCompare(b)),
            key => {
              const props = {
                list: list[key],
                title: key,
              };
              return this.renderSingleList(props);
            },
          )}
          {isLoading ? <LoadDiv /> : null}
          {!isLoading && keys && keys.length === 0 ? <ListNull isSearch={isSearch} type={'contacts'} /> : null}
        </React.Fragment>
      );
    }
  }

  render() {
    const { searchDepartmentUsers } = this.props;
    return (
      <ScrollView updateEvent={searchDepartmentUsers ? () => {} : this.debouncedScroll}>
        {this.renderListContent()}
      </ScrollView>
    );
  }
}
