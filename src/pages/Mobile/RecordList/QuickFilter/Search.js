import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { conditionAdapter, formatQuickFilter } from 'mobile/RecordList/QuickFilter/utils';
import * as actions from 'mobile/RecordList/redux/actions';
import { validate } from './utils';
import './index.less';

const SearchRowsWrapper = styled.div`
  background-color: #fff;
  border-radius: 24px;
  padding: 2px 3px 2px 10px;
  input {
    height: 32px;
  }
  .cuttingLine {
    height: 16px;
    width: 1px;
    margin: 0 12px 0 10px;
    background-color: #bdbdbd;
  }
  .mobileQuickFilterTrigger {
    max-width: 35%;
  }
  form {
    padding: 0 5px;
  }
  .caseSensitive {
    width: 32px;
    height: 32px;
    background: #f2f2f3;
    text-align: center;
    border-radius: 50%;
  }
`;

const Mask = styled.div`
  width: 100%;
  height: 100%;
  background: #00000030;
  position: fixed;
  top: 0;
  left: 0;
`;

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      filterIndex: 0,
    };
  }
  componentWillUnmount() {
    this.props.updateFilters({ keyWords: '', quickFilterKeyWords: '', requestParams: {} });
  }
  handleVisibleChange = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };
  handleSearch = () => {
    const { filterIndex } = this.state;
    const { filters, textFilters, updateQuickFilter } = this.props;
    if (textFilters.length) {
      // 快速搜索
      const quickFilter = [textFilters[filterIndex]]
        .map(filter => ({
          ...filter,
          filterType: filter.filterType || 1,
          spliceType: filter.spliceType || 1,
          values: filters.quickFilterKeyWords.split(' '),
        }))
        .filter(validate)
        .map(conditionAdapter);
      updateQuickFilter(formatQuickFilter(quickFilter));
    } else {
      // 普通搜索
      this.props.changePageIndex(1);
    }
  };
  renderPopup() {
    const { filterIndex } = this.state;
    const { textFilters } = this.props;
    return (
      <Fragment>
        <Mask onClick={this.handleVisibleChange}></Mask>
        <div style={{ width: document.body.clientWidth }} className="pLeft10 pRight10">
          <div className="WhiteBG card pLeft15 pRight15 pTop10 pBottom10">
            {textFilters.map((item, index) => (
              <div
                key={item.control.controlId}
                style={{ color: index === filterIndex ? '#1677ff' : null }}
                className="pTop5 pBottom5 Font14 ellipsis"
                onClick={() => {
                  this.setState({
                    filterIndex: index,
                    visible: false,
                  });
                }}
              >
                {item.control.controlName}
              </div>
            ))}
          </div>
        </div>
      </Fragment>
    );
  }
  render() {
    const { filterIndex } = this.state;
    const { updateFilters, updateQuickFilter, filters, sheetView, textFilters, viewType, base, inputPlaceholder } =
      this.props;
    const searchValue = textFilters.length ? filters.quickFilterKeyWords : filters.keyWords;
    const { ignorecase } = filters.requestParams || {};
    return (
      <SearchRowsWrapper className="search flex flexRow valignWrapper">
        {!_.isEmpty(textFilters) && (
          <Trigger
            placement="bottom"
            action={['click']}
            popupClassName="moibleFilterPopup"
            popupVisible={this.state.visible}
            onPopupVisibleChange={this.handleVisibleChange}
            popup={this.renderPopup()}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [-20, 10],
            }}
          >
            <div className="flexRow valignWrapper mobileQuickFilterTrigger">
              <span className="Font14 mLeft5 mRight5 ellipsis">
                {textFilters[filterIndex] && textFilters[filterIndex].control.controlName}
              </span>
              <Icon className="Font12 Gray_75" icon="arrow-down" />
              <div className="cuttingLine"></div>
            </div>
          </Trigger>
        )}
        <div className="flexRow valignWrapper flex">
          <Icon icon="h5_search" className="Gray_9e Font17" />
          <form
            action="#"
            className="flex"
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <input
              type="search"
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
                if (textFilters.length) {
                  updateFilters({ quickFilterKeyWords: value });
                } else {
                  updateFilters({ keyWords: value });
                  if (_.isEmpty(value)) {
                    this.handleSearch();
                  }
                }
              }}
              onKeyDown={event => {
                if (event.which === 13) {
                  this.handleSearch();
                }
              }}
            />
          </form>

          {searchValue && (
            <Icon
              className="Gray_bd Font16 mRight6"
              icon="workflow_cancel"
              onClick={() => {
                if (textFilters.length) {
                  updateFilters({ quickFilterKeyWords: '' });
                  updateQuickFilter([]);
                } else {
                  updateFilters({ keyWords: '' });
                  this.props.changePageIndex(1);
                }
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
                  Gray_75: !ignorecase || ignorecase === '1',
                  ThemeColor: ignorecase === '0',
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
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateFilters', 'resetSheetView', 'changePageIndex', 'updateQuickFilter']),
      dispatch,
    ),
)(Search);
