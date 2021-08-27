import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import store from 'redux/configureStore';
import { changeListType, changeTitle } from '../../redux/postActions';
import postEnum from '../../constants/postEnum';
import { PostList } from '../post';
import './feed.css';
import './style.css';
import './userFeed.css';

class UserFeed extends React.Component {
  static propTypes = {
    accountId: PropTypes.string,
    title: PropTypes.string,
  };

  componentWillMount() {
    store.dispatch(
      changeListType({
        listType: postEnum.LIST_TYPE.user,
        accountId: this.props.accountId,
      })
    );
    store.dispatch(changeTitle(this.props.title));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.accountId !== nextProps.accountId || this.props.title !== nextProps.title) {
      store.dispatch(
        changeListType({
          listType: postEnum.LIST_TYPE.user,
          accountId: nextProps.accountId,
        })
      );
      store.dispatch(changeTitle(nextProps.title));
    }
  }

  render() {
    return (
      <Provider store={store}>
        <div className="userFeed userFeedContainer">
          <PostList disableLoadNew />
        </div>
      </Provider>
    );
  }
}

module.exports = UserFeed;
