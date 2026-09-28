import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import * as actions from 'mobile/RecordList/redux/actions';
import './index.less';

const SearchRowsWrapper = styled.div`
  background-color: var(--color-background-primary);
  border-radius: 24px;
  padding: 2px 3px 2px 10px;
  input {
    height: 32px;
  }
  form {
    padding: 0 5px;
  }
  .caseSensitive {
    width: 32px;
    height: 32px;
    background: var(--color-background-secondary);
    text-align: center;
    border-radius: 50%;
  }
`;

class Search extends Component {
  searchTimer = null;

  componentWillUnmount() {
    clearTimeout(this.searchTimer);
    this.props.updateFilters({ keyWords: '', requestParams: {} });
  }

  handleSearch = (keyWords = this.props.filters.keyWords) => {
    if (keyWords !== this.props.filters.keyWords) {
      this.props.updateFilters({ keyWords });
    }

    this.props.changePageIndex(1);
  };

  scheduleSearch = input => {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.handleSearch(input.value);
    });
  };

  render() {
    const { updateFilters, filters, sheetView, viewType, base, inputPlaceholder } = this.props;
    const searchValue = filters.keyWords;
    const { ignorecase } = filters.requestParams || {};
    return (
      <SearchRowsWrapper className="search flex flexRow valignWrapper">
        <div className="flexRow valignWrapper flex">
          <Icon icon="h5_search" className="textTertiary Font17" />
          <form
            action="#"
            className="flex"
            onSubmit={e => {
              e.preventDefault();
              this.scheduleSearch(e.currentTarget.elements.searchKeywords);
            }}
          >
            <input
              name="searchKeywords"
              type="search"
              enterKeyHint="search"
              className="pAll0 Border0 w100"
              placeholder={
                inputPlaceholder
                  ? inputPlaceholder
                  : _.includes([1, 7], viewType)
                    ? _l('搜索')
                    : _l('搜索共%0条', sheetView.count)
              }
              value={searchValue}
              onChange={e => {
                const { value } = e.target;

                updateFilters({ keyWords: value });
                if (_.isEmpty(value)) {
                  this.handleSearch(value);
                }
              }}
              onCompositionEnd={event => {
                this.scheduleSearch(event.currentTarget);
              }}
            />
          </form>

          {searchValue && (
            <Icon
              className="textDisabled Font16 mRight6"
              icon="workflow_cancel"
              onClick={() => {
                updateFilters({ keyWords: '' });
                this.props.changePageIndex(1);
              }}
            />
          )}
          {base.type !== 'single' && (
            <div
              className="caseSensitive"
              onClick={() => {
                const newIgnorecase = ignorecase === '0' ? '1' : '0';
                updateFilters({ requestParams: { ignorecase: newIgnorecase } });
                if (newIgnorecase === '0') {
                  alert(_l('已开启区分大小写'));
                }

                this.handleSearch();
              }}
            >
              <Icon
                icon="case"
                className={cx('LineHeight32 Font24', {
                  textSecondary: !ignorecase || ignorecase === '1',
                  colorPrimary: ignorecase === '0',
                })}
              />
            </div>
          )}
        </div>
      </SearchRowsWrapper>
    );
  }
}

export default connect(
  state => ({
    filters: state.mobile.filters,
    sheetView: state.mobile.sheetView,
    base: state.mobile.base,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['updateFilters', 'changePageIndex']), dispatch),
)(Search);
