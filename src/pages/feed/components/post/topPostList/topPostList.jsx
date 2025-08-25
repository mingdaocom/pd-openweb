import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import postEnum from '../../../constants/postEnum';
import { loadTop } from '../../../redux/postActions';
import PostBody from '../post/postBody';
import PostCard from '../post/postCard';
import TopPostPager from './topPostPager';

class TopPostList extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    fontSize: PropTypes.number,
    topPostIds: PropTypes.arrayOf(PropTypes.string),
    postsById: PropTypes.object,
    options: PropTypes.object,
  };
  state = {
    pageIndex: 0,
    focus: false,
  };
  componentDidMount() {
    this.props.dispatch(loadTop());
    const comp = this;
    comp._isMounted = true;
    comp.nextItem = _.debounce(() => {
      if (!comp._isMounted) return;
      const el = ReactDom.findDOMNode(comp);
      if (!el || !comp.props.topPostIds) {
        return;
      }
      if (comp.state.focus || !this.isElementInViewport(el)) return;
      let nextIndex = comp.state.pageIndex + 1;
      nextIndex = nextIndex >= comp.props.topPostIds.length ? 0 : nextIndex;
      comp.handleChangeItem(nextIndex);
    }, 5000);
    comp.handleChangeItem(0);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (!shallowEqual(nextProps, this.props)) return true;
    if (this.state.pageIndex !== nextState.pageIndex) return true;
    const { topPostIds, postsById } = this.props;
    const nextTopPostIds = nextProps.topPostIds;
    const nextPostsById = nextProps.postsById;
    if (topPostIds.length !== nextTopPostIds.length) return true;
    if (topPostIds.some((id, i) => id !== nextTopPostIds[i] || postsById[id] !== nextPostsById[nextTopPostIds[i]])) {
      return true;
    }
    return false;
  }
  componentWillUnmount() {
    this._isMounted = false;
    if (this.nextItem && this.nextItem.cancel) this.nextItem.cancel();
  }
  isElementInViewport(el) {
    if (typeof window.jQuery === 'function' && el instanceof window.jQuery) {
      el = el[0];
    }
    var rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */ &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
  }
  focus() {
    this.setState({ focus: true });
  }
  blur() {
    this.setState({ focus: false });
  }
  handleChangeItem(pageIndex) {
    this.setState({ pageIndex }, this.nextItem);
  }
  render() {
    const { groupId, projectId, listType } = this.props.options;
    if (!this.props.topPostIds.length || listType !== postEnum.LIST_TYPE.project || groupId || projectId === '')
      return false;
    const pageIndex =
      this.state.pageIndex >= this.props.topPostIds.length ? this.props.topPostIds.length - 1 : this.state.pageIndex;
    const postItem = this.props.postsById[this.props.topPostIds[pageIndex]];

    const header = (
      <TopPostPager
        pageIndex={pageIndex}
        pageCount={this.props.topPostIds.length > 20 ? 20 : this.props.topPostIds.length}
        handleChangeItem={(...args) => this.handleChangeItem(...args)}
      />
    );
    return (
      <PostCard
        className="topPostList ani300 zoomInUp"
        onMouseEnter={() => this.focus()}
        onMouseLeave={() => this.blur()}
        style={{ fontSize: this.props.fontSize }}
      >
        {header}
        <PostBody postItem={postItem} isSummary />
      </PostCard>
    );
  }
}

export default connect(state => {
  const { fontSize, topPostIds, postsById, options } = state.post;
  return { fontSize, topPostIds, postsById, options };
})(TopPostList);
