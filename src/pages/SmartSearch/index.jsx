import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { parse } from 'query-string';
import Search from './components/search';

export default class UserEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppSearch');
    Search.init();
  }
  shouldComponentUpdate(nextProps) {
    const nextQuery = parse(nextProps.location.search.substr(1));
    const nextSearchKey = nextQuery.search_key;
    const nextSearchType = nextQuery.searchType;
    if (
      this.props.location.search !== nextProps.location.search &&
      (Search.options.keywords !== nextSearchKey || (nextSearchType && Search.options.searchType !== nextSearchType))
    ) {
      Search.init();
    }
    return false;
  }
  componentWillUnmount() {
    delete window.feedSelectDate;
    delete window.feedCustomDate;
    ReactDom.unmountComponentAtNode(document.querySelector('.smartSearchFilterDateWrap'));
    $('html').removeClass('AppSearch');
  }
  render() {
    return <div className="keyWordsMain relative mTop20" />;
  }
}
