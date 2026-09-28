import React, { Component } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Input } from 'ming-ui/antd-components';

export default class RoleSearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      isSearching: false,
    };
    this.ajaxObj = null;
  }
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
        <Input
          radius
          variant="filled"
          onChange={e => {
            this.props.updateIsRequestList(false);
            this.setState({ searchValue: e.target.value.trim() });
            if (this.ajaxObj && this.ajaxObj.abort) {
              this.ajaxObj.abort();
              this.ajaxObj = null;
            }

            this.handChange(e.target.value.trim());
          }}
          className="searchInput textPrimary w100"
          placeholder={_l('搜索')}
          value={searchValue}
          prefix={<Icon icon="search" className="textSecondary Font18" />}
          suffix={
            searchValue ? (
              <Icon
                icon="cancel"
                className="Font14 textPlaceholder pointer"
                onMouseDown={e => e.preventDefault()}
                onClick={this.handleClear}
              />
            ) : null
          }
        />
      </div>
    );
  }
}
