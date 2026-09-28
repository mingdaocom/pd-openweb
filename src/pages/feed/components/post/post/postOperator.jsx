import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { checkPermission } from 'src/utils/services/security/permission';
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

  handleOperateVisibleChange = open => {
    this.setState({ showOperateList: open });
    if (open) {
      this.getPostAllowOperate();
    }
  };

  render() {
    let dropBtn;

    if (!this.props.isShowOperate) {
      dropBtn = (
        <div className="postOperatorListContainer clearfix">
          <PostOperateList
            open={this.state.showOperateList}
            onOpenChange={this.handleOperateVisibleChange}
            postItem={this.props.postItem}
            allowOperate={this.state.allowOperate}
            dispatch={this.props.dispatch}
          >
            <span
              className={cx(
                'postOperatorListBtn icon-more_horiz Hand',
                this.state.showOperateList ? 'textSecondary' : 'textTertiary',
              )}
            />
          </PostOperateList>
        </div>
      );
    }

    return <div className="postOperator">{dropBtn}</div>;
  }
}

export default connect()(PostOperator);
