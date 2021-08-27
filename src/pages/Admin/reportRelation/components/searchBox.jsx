import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { fetchParent } from '../actions';
import { searchUser } from '../common';

import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
const ClickAwayable = createDecoratedComponent(withClickAway);

class SearchInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      keywords: '',
      loading: false,
      showList: false,
      result: [],
    };

    this.debounced = _.debounce(searchUser, 30, {
      leading: true,
    });
  }

  promise = null;

  handler(value) {
    this.setState({
      keywords: value,
      isLoading: true,
    }, () => {
      if (this.promise &&
        this.promise.state() === 'pending' &&
        this.promise.abort) this.promise.abort();

      const { keywords } = this.state;
      this.promise = this.debounced({
        keywords,
      })
      this.promise.then((res) => {
        if (res && res.allCount) {
          const { list, allCount } = res;
          const { result } = this.state;
          this.setState({
            isLoading: false,
            showList: true,
            result: list,
          });
        } else {
          this.setState({
            isLoading: false,
            showList: true,
            result: [],
          });
        }
      });
    })
  }

  renderSearchResult() {
    const { dispatch } = this.props;
    const { result, keywords, isLoading, showList } = this.state;
    if (keywords === '' || !showList) return null;
    if (result.length) {
      return (
        <ClickAwayable className='searchUserList' onClickAway={() => this.setState({ showList: false, })}>
          {_.map(result, (user) => {
            return (
              <div onClick={() => { dispatch(fetchParent(user.accountId)); }} className="resultItem ThemeHoverBGColor7" key={user.accountId}>
                <div className='Font16 Gray'>{user.fullname}</div>
                <div className='Font13 Gray_75 info'><span className="department">{user.department}</span><span className="job">{user.job}</span></div>
              </div>
            );
          })}
        </ClickAwayable>
      );
    } else if (!isLoading) {
      return (
        <div className='searchUserList'>
          <div className="nullDataDiv pLeft10">{_l('暂无搜索结果')}</div>
        </div>
      );
    }
  }

  componentWillUnmount() {
    if (this.debounced) {
      this.debounced.cancel();
    }
  }

  render() {
    const { keywords } = this.state;
    return (
      <div className='searchBox Relative'>
        <span className='Left mTop6 mLeft5 icon-search Font16 Gray_9' />
        <div className='searchDiv'>
          <input type='text' id='searchText' placeholder={_l('搜索部门/员工')} value={keywords} className={keywords.length ? 'Gray' : ''} onChange={(event) => { this.handler(event.target.value); }} />
        </div>
        {keywords && keywords.length ? <span className="Right icon-close Font14 mTop6 mRight5 Gray_9 Hand" onClick={(event) => { this.handler(''); }} /> : null}
        {this.renderSearchResult()}
      </div>
    );
  }
}

export default connect()(SearchInput);
