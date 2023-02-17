import React, { Component } from 'react';
import { func, bool } from 'prop-types';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import GlobalSearchAllContent from 'src/pages/globalSearch/containers/GlobalSearchAllContent';
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
    if (val && val.length > 32) {
      alert(_l('最多可输入32个字符'));
      return;
    }
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
    if (e.key === 'Enter') {
      navigateTo(`/search?search_key=${encodeURIComponent(searchVal.trim())}`);
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
              placeholder={_l('超级搜索(F)...')}
              value={searchVal}
              onChange={e => this.handleChange(e.target.value)}
              autoComplete="off"
            />
          </form>
          <Icon
            icon="external_collaboration"
            className="hrefIcon Font16"
            onClick={() => navigateTo(`/search?search_key=${searchVal}`)}
          />
          <Icon
            icon="delete"
            className="emptyIcon Font18"
            onClick={() => {
              this.setState({ searchVal: '' });
              this.props.onClose();
            }}
          />
        </div>
        <div className={cx('dialogSearchContent', { easeWidth: !!searchVal })}>
          <GlobalSearchAllContent searchKeyword={searchVal.trim()} onClose={this.props.onClose} />
        </div>
      </div>
    );
  }
}
