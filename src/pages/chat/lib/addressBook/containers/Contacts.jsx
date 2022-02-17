import React from 'react';

import Checkbox from 'ming-ui/components/Checkbox';

import ListSearchBar from '../components/ListSearchBar';
import ContactList from '../components/ContactList';

import UserDetail from '../components/UserDetail';

import API from '../api';

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
  // 选中状态
  selectedAccountId: null,
  // request param
  pageIndex: 1,
  keywords: '',
  isFilterOther: true,
};

export default class Contacts extends React.Component {
  constructor() {
    super();

    this.state = defaultState;
    this.promise = null;

    this.changeFilter = this.changeFilter.bind(this);
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
    if (this.promise && this.promise.state() === 'pending' && this.promise.abort) {
      this.promise.abort();
    }
  }

  fetchContacts() {
    const { pageIndex, keywords, isFilterOther } = this.state;
    this.promise = API.fetchAllContacts({ pageIndex, isFilterOther, keywords });
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

  changeFilter() {
    const { isFilterOther } = this.state;
    this.setState(
      {
        isFilterOther: !isFilterOther,
        pageIndex: 1,
        hasMore: true,
        listData: null,
      },
      this.fetch
    );
  }

  search(keywords) {
    this.abortRequest();

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

  itemClickHandler({ accountId }) {
    this.setState({
      selectedAccountId: accountId,
    });
  }

  renderFilter() {
    const { isFilterOther } = this.state;
    return (
      <div className="pBottom2 pTop10 pLeft15 Gray_75">
        <Checkbox checked={isFilterOther} text={_l('不显示其他协作关系')} onClick={this.changeFilter} />
      </div>
    );
  }

  render() {
    const { listData, keywords, selectedAccountId, isLoading } = this.state;
    const isSearch = keywords !== '';
    return (
      <React.Fragment>
        <div className="contacts-list">
          <ListSearchBar search={this.search} keywords={keywords} type={'contacts'} />
          {isSearch ? null : this.renderFilter()}
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
