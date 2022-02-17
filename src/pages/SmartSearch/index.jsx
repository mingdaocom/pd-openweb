import React, { Component } from 'react';
import { parse } from 'query-string';
import { init, options } from './components/search';

export default class UserEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppSearch');
    init();
  }
  shouldComponentUpdate(nextProps) {
    const nextQuery = parse(nextProps.location.search.substr(1));
    const nextSearchKey = nextQuery.search_key;
    const nextSearchType = nextQuery.searchType;
    if (
      this.props.location.search !== nextProps.location.search &&
      (options.keywords !== nextSearchKey || (nextSearchType && options.searchType !== nextSearchType))
    ) {
      init();
    }
    return false;
  }
  componentWillUnmount() {
    $('html').removeClass('AppSearch');
  }
  render() {
    return <div className="keyWordsMain relativeContainer mTop20" />;
  }
}
