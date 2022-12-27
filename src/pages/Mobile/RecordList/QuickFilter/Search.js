import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'mobile/RecordList/redux/actions';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import { validate, TextTypes } from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';
import { conditionAdapter, formatQuickFilter } from 'mobile/RecordList/QuickFilter/Inputs';
import './index.less';
import _ from 'lodash';

const SearchRowsWrapper = styled.div`
  background-color: #fff;
  border-radius: 24px;
  padding: 7px 10px;
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
    }
  }
  componentWillUnmount() {
    this.props.updateFilters({ keyWords: '', quickFilterKeyWords: '' });
  }
  handleVisibleChange = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  }
  handleSearch = () => {
    const { filterIndex } = this.state;
    const { filters, textFilters, updateQuickFilter } = this.props;
    if (textFilters.length) {
      // 快速搜索
      const quickFilter = [textFilters[filterIndex]].map((filter, i) => ({
        ...filter,
        filterType: filter.filterType || 1,
        spliceType: filter.spliceType || 1,
        values: filters.quickFilterKeyWords.split(' ')
      })).filter(validate).map(conditionAdapter);
      updateQuickFilter(formatQuickFilter(quickFilter));
    } else {
      // 普通搜索
      this.props.changePageIndex(1);
    }
  }
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
                style={{ color: index === filterIndex ? '#2196F3' : null }}
                className="pTop5 pBottom5 Font14 ellipsis"
                onClick={() => {
                  this.setState({
                    filterIndex: index,
                    visible: false
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
    const { updateFilters, updateQuickFilter, filters, sheetView, textFilters } = this.props;
    const searchVlaue = textFilters.length ? filters.quickFilterKeyWords : filters.keyWords;
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
              <span className="Font14 mLeft5 mRight5 ellipsis">{textFilters[filterIndex] && textFilters[filterIndex].control.controlName}</span>
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
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="search"
              className="pAll0 Border0 w100"
              placeholder={_l('搜索共%0条', sheetView.count)}
              value={searchVlaue}
              onChange={(e) => {
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
          {searchVlaue && (
            <Icon
              className="Gray_bd"
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
        </div>
      </SearchRowsWrapper>
    );
  }
}

export default connect(
  state => ({
    filters: state.mobile.filters,
    sheetView: state.mobile.sheetView
  }),
  dispatch =>
    bindActionCreators(
      _.pick(actions, ['updateFilters', 'resetSheetView', 'changePageIndex', 'updateQuickFilter']),
      dispatch,
  ),
)(Search);
