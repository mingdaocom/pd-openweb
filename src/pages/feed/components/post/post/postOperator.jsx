import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { addFavorite, removeFavorite } from '../../../redux/postActions';
import PostOperateList from './postOperateList';

/**
 * 动态右上角的操作项
 */
class PostOperator extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func,
    postItem: PropTypes.object.isRequired,
    isShowOperate: PropTypes.bool,
  };

  static defaultProps = {
    isShowOperate: false,
  };

  constructor(props) {
    super(props);
    const { postItem } = props;

    this.state = {
      showOperateList: false,
      allowOperate: postItem && (!!postItem.allowOperate || postItem.user.accountId === md.global.Account.accountId),
      checkIsProjectAdmin: false,
    };
  }

  getPostAllowOperate() {
    if (this.state.allowOperate || this.state.checkIsProjectAdmin) return;
    const { postItem } = this.props;
    if (!postItem) return;
    const { projectIds } = postItem;
    if (!projectIds || !projectIds.length) return;
    projectIds.forEach(projectId => {
      this.setState({ allowOperate: checkPermission(projectId, PERMISSION_ENUM.MANAGE_TREND) });
    });

    this.setState({ checkIsProjectAdmin: true });
  }

  handleFavorite = () => {
    this.props.dispatch(addFavorite({ postId: this.props.postItem.postID }));
  };

  handleRemoveFavorite = () => {
    this.props.dispatch(removeFavorite({ postId: this.props.postItem.postID }));
  };

  toggleOperateList = () => {
    this.setState({ showOperateList: !this.state.showOperateList });
    this.getPostAllowOperate();
  };

  hideOperateList = e => {
    if (e && e.target && e.target === ReactDom.findDOMNode(this.toggleBtn)) {
      return;
    }
    this.setState({ showOperateList: false });
  };

  render() {
    let dropBtn;
    if (!this.props.isShowOperate) {
      dropBtn = (
        <div className="postOperatorListContainer clearfix">
          <span
            ref={toggleBtn => {
              this.toggleBtn = toggleBtn;
            }}
            onClick={this.toggleOperateList}
            className={cx(
              'postOperatorListBtn icon-more_horiz Hand',
              this.state.showOperateList ? 'Gray_75' : 'Gray_9',
            )}
          />
          {this.state.showOperateList ? (
            <PostOperateList
              handleHide={this.hideOperateList}
              className="postOperatorList z-depth-1"
              postItem={this.props.postItem}
              allowOperate={this.state.allowOperate}
            />
          ) : undefined}
        </div>
      );
    }

    return <div className="postOperator">{dropBtn}</div>;
  }
}

export default connect()(PostOperator);
