import React, { Component } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';

export default class RoleSearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      isSearching: false,
    };
    this.ajaxObj = null;
  }
  handleFocus = () => {};
  handleBlur = () => {};
  handChange = _.debounce(value => {
    this.props.updateSearchValue(value);
    if (!value) {
      this.handleClear();
    } else {
      this.props.updateIsRequestList(true);
      this.props.handleSearch(value);
    }
  }, 500);
  handleClear = () => {
    this.setState({ searchValue: '' });
    this.props.updateSearchValue('');
    this.props.updateIsRequestList(true);
    this.props.handleClear();
  };

  render() {
    const { searchValue } = this.state;
    return (
      <div className="searchContainer Relative">
        <Icon icon="search" className=" btnSearch Gray_75 Font18" />
        <input
          defaultValue={searchValue}
          ref={input => (this.input = input)}
          onChange={e => {
            this.props.updateIsRequestList(false);
            this.setState({ searchValue: e.target.value.trim() });
            if (this.ajaxObj && this.ajaxObj.abort) {
              this.ajaxObj.abort();
              this.ajaxObj = null;
            }
            this.handChange(e.target.value.trim());
          }}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          type="text"
          className="searchInput ThemeColor10 w100"
          placeholder={_l('搜索')}
          value={searchValue}
        />
        {searchValue !== '' ? (
          <span
            className="Font14 icon-cancel Gray_c Hand Absolute"
            style={{
              top: '8px',
              right: '8px',
            }}
            onClick={this.handleClear}
          />
        ) : null}
      </div>
    );
  }
}
