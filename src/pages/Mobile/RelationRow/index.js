import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as actions from 'mobile/RelationRow/redux/actions';
import RelationAction from './RelationAction';
import RelationList from './RelationList';

@withRouter
class Home extends Component {
  constructor(props) {
    super(props);
  }
  handleScroll = event => {
    const { loadParams, updatePageIndex } = this.props;
    const { clientHeight, scrollHeight, scrollTop } = event.target;
    const targetVlaue = scrollHeight - clientHeight - 30;
    const { loading, isMore, pageIndex } = loadParams;
    if (targetVlaue <= scrollTop && !loading && isMore) {
      updatePageIndex(pageIndex + 1);
    }
  };
  render() {
    const { controlId, params } = this.props;
    return (
      <Fragment>
        <div
          className="flexColumn flex"
          style={{ overflowX: 'hidden', overflowY: 'auto' }}
          onScroll={this.handleScroll}
        >
          <RelationList {...params} />
        </div>
        <RelationAction controlId={controlId} />
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['loadParams']),
  }),
  dispatch => bindActionCreators(_.pick(actions, ['updatePageIndex']), dispatch),
)(Home);
