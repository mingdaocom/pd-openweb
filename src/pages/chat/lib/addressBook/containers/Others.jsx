import React from 'react';

import Checkbox from 'ming-ui/components/Checkbox';

import ListSearchBar from '../components/ListSearchBar';
import ContactList from '../components/ContactList';

import UserDetail from '../components/UserDetail';

import API from '../api';
import _ from 'lodash';

const formatContactsData = (store, list) => {
  const result = store || {};
  _.each(list, (item) => {
    const { firstCode } = item;
    const title = /[A-Z]/.test(firstCode.toUpperCase()) ? firstCode.toUpperCase() : '#';
    if (!result[title]) {
      result[title] = [];
    }
    result[title].push(item);
    // result[title] = _.uniqBy(result[title], (item) => item.accountId);
  });

  return result;
};

const defaultState = {
  // store
  listData: null,
  // list state
  isLoading: false,
  hasMore: true,
  selectedAccountId: null,
  isFriend: false,
  isContact: true,
  // request param
  pageIndex: 1,
  keywords: '',
};

export default class Others extends React.Component {
  constructor() {
    super();

    this.state = defaultState;

    this.promise = null;

    this.search = this.search.bind(this);
    this.fetch = this.fetch.bind(this);
    this.fetchContacts = this.fetchContacts.bind(this);
    this.itemClickHandler = this.itemClickHandler.bind(this);
  }

  componentWillReceiveProps() {
    this.setState(defaultState, this.fetch);
  }

  componentWillUnmount() {
    this.abortRequest();
  }

  abortRequest() {
    if (this.promise && this.promise.abort) {
      this.promise.abort();
    }
  }

  search(keywords) {
    this.promise.abort();
    this.setState(
      {
        isLoading: false,
        pageIndex: 1,
        keywords,
        hasMore: true,
        listData: null,
      },
      this.fetch
    );
  }

  fetchContacts() {
    const { pageIndex, keywords } = this.state;
    this.promise = API.fetchOthers({ pageIndex, keywords });
    return this.promise.then((data) => {
      const { listData } = this.state;
      if (keywords) {
        this.setState({
          listData: (listData || []).concat(data.list),
        });
      } else {
        this.setState({
          pageIndex: pageIndex + 1,
          listData: formatContactsData(listData, data.list),
        });
      }
      // has more data to load
      return data.list && data.list.length;
    });
  }

  fetch() {
    const { isLoading, pageIndex, hasMore } = this.state;
    if (isLoading || !hasMore) return;
    this.setState({
      isLoading: true,
    });
    this.fetchContacts().then((hasMore) => {
      this.setState({
        isLoading: false,
        pageIndex: pageIndex + 1,
        hasMore,
      });
    });
  }

  itemClickHandler({ accountId, isFriend, isContact }) {
    this.setState({
      selectedAccountId: accountId,
      isFriend,
      isContact,
    });
  }

  render() {
    const { listData, selectedAccountId, isLoading, keywords } = this.state;
    const isSearch = keywords !== '';
    return (
      <React.Fragment>
        <div className="contacts-list">
          <ListSearchBar keywords={keywords} search={this.search} type="contacts" />
          <div className="contacts-list-content">
            <ContactList
              isSearch={isSearch}
              selectedAccountId={selectedAccountId}
              list={listData}
              isLoading={isLoading}
              fetch={this.fetch}
              itemClickHandler={this.itemClickHandler}
            />
          </div>
        </div>
        <div className="contacts-detail">
          <UserDetail accountId={selectedAccountId} />
        </div>
      </React.Fragment>
    );
  }
}
