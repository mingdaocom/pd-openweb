import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { conditionAdapter, formatQuickFilter, validate } from 'mobile/RecordList/QuickFilter/utils';

const SearchRowsWrapper = styled.div`
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
  padding: 0 10px;
  height: 100%;
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
    const { values = [] } = props.textFilters[0] || {};
    this.state = {
      searchVlaue: values[0],
      visible: false,
      filterIndex: 0,
    };
  }
  handleVisibleChange = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };
  handleSearch = () => {
    const { filterIndex, searchVlaue } = this.state;
    const { textFilters, updateQuickFilter } = this.props;
    // 快速搜索
    const quickFilter = [textFilters[filterIndex]]
      .map(filter => ({
        ...filter,
        filterType: filter.filterType || 1,
        spliceType: filter.spliceType || 1,
        values: searchVlaue.split(' '),
      }))
      .filter(validate)
      .map(conditionAdapter);
    updateQuickFilter(formatQuickFilter(quickFilter));
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
                {item.control.controlName || _l('未命名')}
              </div>
            ))}
          </div>
        </div>
      </Fragment>
    );
  }
  render() {
    const { filterIndex, searchVlaue } = this.state;
    const { textFilters } = this.props;
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
                {(textFilters[filterIndex] && textFilters[filterIndex].control.controlName) || _l('未命名')}
              </span>
              <Icon className="Font12 Gray_75" icon="arrow-down" />
              <div className="cuttingLine"></div>
            </div>
          </Trigger>
        )}
        <div className="flexRow valignWrapper flex">
          <Icon icon="h5_search" className="Gray_9e Font17" />
          <form action="#" className="flex" onSubmit={event => event.preventDefault()}>
            <input
              type="search"
              className="pAll0 Border0 w100"
              placeholder={_l('搜索')}
              value={searchVlaue}
              onChange={event => {
                const { value } = event.target;
                this.setState({
                  searchVlaue: value,
                });
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
                this.setState({ searchVlaue: '' }, this.handleSearch);
              }}
            />
          )}
        </div>
      </SearchRowsWrapper>
    );
  }
}

export default Search;
