import React, { Component } from 'react';
import { func, bool } from 'prop-types';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import SearchContent from 'src/pages/SmartSearch/components/reactSmartSearch';
import { navigateTo } from 'router/navigateTo';
import './index.less';
import _ from 'lodash';

export default class GlobalSearch extends Component {
  static propTypes = {
    onClose: func,
  };

  static defaultProps = {
    onClose: _.noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      searchVal: '',
    };
  }

  componentDidMount() {
    this.removeEscEvent = this.bindEscEvent();
  }

  componentWillUnmount() {
    this.removeEscEvent();
  }

  bindEscEvent = () => {
    document.body.addEventListener('keydown', this.closeGlobalSearch);
    return () => document.body.removeEventListener('keydown', this.closeGlobalSearch);
  };

  closeGlobalSearch = e => {
    if (e.key === 'Escape' || e.keyCode === 26) {
      this.props.onClose();
    }
  };

  handleChange = val => {
    this.setState({ searchVal: val });
  };

  handleMaskClick = e => {
    const { classList } = e.target;
    if (classList.contains('globalSearchWrap')) {
      this.props.onClose();
    }
  };

  handleInputKeyDown = e => {
    e.stopPropagation();
    const { searchVal } = this.state;
    if (!searchVal) return;
    console.log(searchVal)
    if (e.key === 'Enter') {
      navigateTo(`/search?search_key=${encodeURIComponent(searchVal)}`);
      // navigateTo(`/search?search_key=${searchVal}`);
    }
  };

  render() {
    const { searchVal } = this.state;
    return (
      <div className="globalSearchWrap" onClick={this.handleMaskClick}>
        <div className={cx('inputWrap', { hasResult: !!searchVal })}>
          <Icon icon="search" className="searchIcon Font20" />
          <input type="text" style={{ display: 'none' }} />
          <form autoComplete="off" onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              autoFocus
              onKeyDown={this.handleInputKeyDown}
              placeholder={_l('智能搜索(F)...')}
              value={searchVal}
              onChange={e => this.handleChange(e.target.value)}
              autoComplete="off"
            />
          </form>
          <Icon icon="external_collaboration" className="hrefIcon Font16" onClick={() => navigateTo(`/search?search_key=${searchVal}`)} />
          <Icon
            icon="delete"
            className="emptyIcon Font18"
            onClick={() => {
              this.setState({ searchVal: '' });
              this.props.onClose();
            }}
          />
        </div>
        {searchVal.trim() && <SearchContent searchKeyword={searchVal.trim()} />}
      </div>
    );
  }
}
