import React from 'react';
import PropTypes from 'prop-types';
import LoadDiv from 'ming-ui/components/LoadDiv';
import discussionAjax from 'src/api/discussion';
import { SOURCE_TYPE } from './config';
import CommentListItem from './commentListItem';
import './css/commentList.less';

class CommentList extends React.Component {
  static propTypes = {
    sourceId: PropTypes.string.isRequired,
    sourceType: PropTypes.oneOf(_.values(SOURCE_TYPE)).isRequired,
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    isMore: PropTypes.bool,
    isFocus: PropTypes.bool,

    commentList: PropTypes.array, // 列表
    updateCommentList: PropTypes.func,
    removeComment: PropTypes.func,

    bindBusinessCard: PropTypes.bool, // 是否绑定名片层
    children: PropTypes.element,
    manualRef: PropTypes.func,

    nullCommentList: PropTypes.element,
  };

  static defaultProps = {
    pageIndex: 1,
    pageSize: 20,
    isFocus: false,
    bindBusinessCard: true,
    commentList: [],
    updateCommentList() {},
    removeComment() {},
    manualRef() {},
    nullCommentList: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      pageIndex: props.pageIndex,
      pageSize: props.pageSize,
      isLoading: false,
      hasMore: true,
      showDiscussionId: '',
    };

    this.fetch = this.fetch.bind(this);
  }

  componentDidMount() {
    if (this.props.bindBusinessCard) {
      $(this.list).on(
        {
          mouseover: function () {
            if ($(this).data('accountid') === undefined || $(this).data('bind')) {
              return;
            }
            $(this)
              .mdBusinessCard({ secretType: 1 })
              .data('bind', true)
              .mouseenter();
          },
        },
        '.singleTalk .singeText a'
      );
    }

    this.callRef();
    this.fetch();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isFocus !== nextProps.isFocus || this.props.sourceId !== nextProps.sourceId) {
      this.abortRequest();
      this.setState(
        {
          pageIndex: 1,
          isFocus: nextProps.isFocus,
        },
        this.fetch
      );
    }
  }

  callRef() {
    if (this.props.manualRef) {
      this.props.manualRef(this);
    }
  }

  updatePageIndex(isReset = false) {
    const { pageIndex, hasMore, isLoading } = this.state;

    if (isReset) {
      this.abortRequest();
      this.setState({ pageIndex: 1 }, this.fetch);
    } else {
      if (!hasMore || isLoading) return;
      this.setState({ pageIndex: pageIndex + 1 }, this.fetch);
    }
  }

  abortRequest() {
    if (this.ajax && this.ajax.state() === 'pending' && this.ajax.abort) {
      this.ajax.abort();
    }
  }

  fetch() {
    const { sourceId, sourceType, isFocus, commentList } = this.props;
    const { pageIndex, pageSize } = this.state;

    this.setState({
      isLoading: true,
    });

    this.ajax = discussionAjax.getDiscussions({
      sourceId,
      sourceType,
      pageIndex,
      pageSize,
      isFocus,
    });
    this.ajax
      .then(res => {
        if (res && res.code === 1) {
          if (_.isFunction(this.props.updateCommentList)) {
            if (pageIndex === 1) {
              this.props.updateCommentList(res.data);
            } else {
              this.props.updateCommentList(commentList.concat(res.data || []));
            }
          }
          this.setState({
            hasMore: res.data && res.data.length !== 0,
          });
        } else {
          alert(_l('获取讨论失败'), 2);
        }
      })
      .always(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  switchReplyComment(discussionId) {
    // 点击同一个隐藏
    if (discussionId === this.state.showReplyCommentId) {
      discussionId = '';
    }
    this.setState({ showReplyCommentId: discussionId });
  }

  updateComment(comment) {
    const commentList = this.props.commentList.map(item => {
      if (item.discussionId === comment.discussionId) return comment;
      else return item;
    });
    this.props.updateCommentList(commentList);
  }

  render() {
    const { commentList, sourceId, sourceType, isFocus, children, nullCommentList } = this.props;
    const { isLoading, showReplyCommentId, pageIndex } = this.state;

    // 加载
    if (isLoading && !commentList.length) {
      return <LoadDiv className="mTop10" />;
    }

    // 空状态
    if (!commentList.length) {
      if (nullCommentList) {
        return nullCommentList;
      }
      return <div className="mTop15 Gray_bd Font13">{isFocus ? _l('没有与我有关的内容') : _l('发布评论')}</div>;
    }

    return (
      <div
        className="commentList"
        ref={el => {
          this.list = el;
        }}
      >
        {commentList.map((item, index) => (
          <CommentListItem
            key={item.discussionId}
            comment={item}
            storageId={`${sourceId}-${item.discussionId}`}
            sourceType={sourceType}
            switchReplyComment={this.switchReplyComment.bind(this)}
            removeComment={this.props.removeComment}
            updateComment={comment => this.updateComment(comment)}
          >
            {children && showReplyCommentId === item.discussionId
              ? React.cloneElement(children, {
                  replyId: item.discussionId,
                  autoFocus: true,
                  autoShrink: false,
                  shrinkAfterSubmit: true,
                  onSubmitCallback: () => this.setState({ showReplyCommentId: '' }),
                })
              : null}
          </CommentListItem>
        ))}
        {isLoading && pageIndex > 1 ? <LoadDiv className="mTop10 mBottom10" /> : null}
      </div>
    );
  }
}

CommentList.TYPES = SOURCE_TYPE;

export default CommentList;
