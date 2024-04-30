import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Result from './searchResult';
import { fetchSearchResult, clearSearchKeywords, getCustomList } from '../../actions/search';
import { loadUsers, getFullTree, loadAllUsers, loadDepartments } from '../../actions/entities';
import { updateCursor, updateTypeCursor, updateType, updateSelectedAccountIds } from '../../actions/current';
import { debounce } from 'lodash';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.ajaxObj = null;
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.state = {
      showResult: false,
      searchValue: '',
    };
  }

  handChange = debounce(value => {
    const { dispatch, projectId } = this.props;
    if (!value) {
      this.handleClear();
    } else {
      this.setState(
        {
          showResult: true,
        },
        () => {
          dispatch({ type: 'SHOW_SEACH_RESULT' });
          this.ajaxObj = dispatch(fetchSearchResult(value));
        },
      );
    }
  }, 600);

  handleClear = () => {
    const { dispatch } = this.props;
    this.setState(
      {
        showResult: false,
        searchValue: '',
      },
      () => {
        dispatch(clearSearchKeywords());
        const afterRequest = () => {
          dispatch({ type: 'UPDATE_SEARCH_VALUYE', data: '' });
        };
        dispatch(loadDepartments('', 1, afterRequest));
        this.handleReset();
        this.input.value = '';
      },
    );
  };

  handleFocus() {
    $(this.box).addClass('ThemeBorderColor3').removeClass('ThemeBorderColor8');
    this.handleReset();
    const { result: { departments = [], users = [] } = {} } = this.props;
    if (departments.length || users.length) {
      this.setState({ showResult: true });
    }
  }

  handleReset() {
    const { dispatch, departmentId, projectId } = this.props;
    if (!!departmentId) {
      dispatch(updateType(0)); //设置当前部门/职位tab
      dispatch(updateCursor('')); //设置当前选中部门
      dispatch(updateTypeCursor(0)); //全公司0/未分配1/未审核2/待激活3
      dispatch(loadAllUsers(projectId, 1));
    }
  }

  handleBlur() {
    $(this.box).addClass('ThemeBorderColor8').removeClass('ThemeBorderColor3');
  }

  renderResult = () => {
    const { result, keywords, isSearching = true, dispatch } = this.props;
    if (!this.state.showResult) {
      return '';
    }
    return (
      <Result
        onClickAway={() => {
          this.setState({ showResult: false });
        }}
        onClickAwayExceptions={['.searchInput']}
        isSearching={isSearching}
        showResult={this.state.showResult}
        data={result}
        keywords={keywords}
        onUserClick={accountId => {
          this.setState(
            {
              showResult: false,
            },
            () => {
              dispatch(getCustomList([accountId]));
              dispatch(updateTypeCursor(0));
              dispatch(updateType(0));
              dispatch(clearSearchKeywords());
              dispatch(updateSelectedAccountIds([]));
            },
          );
        }}
        onDepartmentClick={({ id: departmentId, name }) => {
          this.input.value = name;
          this.setState(
            {
              showResult: false,
              searchValue: name,
            },
            () => {
              dispatch(
                getFullTree({
                  departmentId,
                  collapseAll: true,
                  afterRequest() {
                    dispatch({ type: 'UPDATE_SEARCH_VALUYE', data: name });
                    dispatch(updateType(0));
                    dispatch(updateTypeCursor(0));
                    dispatch(updateCursor(departmentId)); //设置选中的部门
                    dispatch(loadUsers(departmentId));
                  },
                }),
              );
              dispatch(clearSearchKeywords());
            },
          );
        }}
      />
    );
  };

  render() {
    const { searchValue } = this.state;
    let clearBtn =
      searchValue !== '' ? (
        <span
          className="Font14 icon-closeelement-bg-circle Gray_c Hand Absolute"
          style={{
            top: '8px',
            right: '8px',
          }}
          onClick={this.handleClear}
        />
      ) : null;
    return (
      <div className="searchContainer Relative" ref={box => (this.box = box)}>
        <span className="icon-search btnSearch Gray_75" title={_l('搜索')} />
        <input
          defaultValue={searchValue}
          ref={input => (this.input = input)}
          onChange={e => {
            this.setState({ searchValue: e.target.value });
            if (this.ajaxObj && this.ajaxObj.abort) {
              this.ajaxObj.abort();
              this.ajaxObj = null;
            }
            this.handChange(e.target.value);
          }}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          type="text"
          className="searchInput ThemeColor10 w100"
          placeholder={_l('搜索')}
        />
        {clearBtn}
        {this.renderResult()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {
    search,
    current: { departmentId, projectId },
  } = state;
  return {
    ...search,
    departmentId,
    projectId,
  };
};

const connectedSearchBox = connect(mapStateToProps)(SearchBox);

export default connectedSearchBox;
