import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import PostCard from '../post/postCard';
import LoadDiv from 'ming-ui/components/LoadDiv';

/**
 * 动态列表的加载更多
 */
function PostMoreLoader(props) {
  return (
    <PostCard onClick={props.onClick} className={cx('postIndicator postMoreIndicator', props.className)}>
      {props.loading ? <LoadDiv className="pTop10 pBottom10" /> : _l('查看更多动态') /* '查看更多动态'*/}
    </PostCard>
  );
}
PostMoreLoader.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  loading: PropTypes.bool,
};

export default PostMoreLoader;
