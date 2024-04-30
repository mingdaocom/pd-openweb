import React, { Component } from 'react';
import { connect } from 'react-redux';
import { searchUser } from '../common';
import _ from 'lodash';
import { dialogSelectUser } from 'ming-ui/functions';
import Config from '../../../config';

class SearchInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      keywords: '',
      loading: false,
      showList: false,
      result: [],
    };

    this.debounced = _.debounce(() => {
      if (this.promise && this.promise.abort) this.promise.abort();

      const { keywords } = this.state;
      this.promise = searchUser({
        keywords,
      });
      this.promise.then(res => {
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
    }, 500);
  }

  promise = null;

  selectUser = (e) => {
    e.stopPropagation();
    dialogSelectUser({
      sourceId: 0,
      fromType: 0,
      fromAdmin: true,
      SelectUserSettings: {
        filterAll: true, // 过滤全部
        filterFriend: true, // 是否过滤好友
        filterOthers: true,
        filterOtherProject: true,
        projectId: Config.projectId,
        inProject: true,
        unique: true,
        callback: users => {
          const user = users[0];
          this.props.onChange(user);
        },
      },
    });
  }

  componentWillUnmount() {
    if (this.debounced) {
      this.debounced.cancel();
    }
  }

  render() {
    return (
      <div className="searchUserBox Relative Hand" onClick={this.selectUser}>
        <span className="Left icon-charger Font16 selectIcon mRight8" />
        <span className='Font13'>{_l('查看成员')}</span>
      </div>
    );
  }
}

export default connect()(SearchInput);
