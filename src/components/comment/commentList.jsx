import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import LoadDiv from 'ming-ui/components/LoadDiv';
import discussionAjax from 'src/api/discussion';
import CommentListItem from './commentListItem';
import { SOURCE_TYPE } from './config';
import './css/commentList.less';

class CommentList extends React.Component {
  static propTypes = {
    sourceId: PropTypes.string.isRequired,
    sourceType: PropTypes.oneOf(_.values(SOURCE_TYPE)).isRequired,
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    isMore: PropTypes.bool,
    isFocus: PropTypes.bool,
    containAttachment: PropTypes.bool,

    commentList: PropTypes.array, // 列表
    updateCommentList: PropTypes.func,
    removeComment: PropTypes.func,
    children: PropTypes.element,
    manualRef: PropTypes.func,

    nullCommentList: PropTypes.element,
  };

  static defaultProps = {
    pageIndex: 1,
    pageSize: 20,
    isFocus: false,
    containAttachment: false,
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
    this.callRef();
    if (!this.props.doNotLoadAtDidMount) {
      this.fetch();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.isFocus !== nextProps.isFocus ||
      this.props.containAttachment !== nextProps.containAttachment ||
      nextProps.entityType !== this.props.entityType || //内部和外部讨论
      this.props.sourceId !== nextProps.sourceId ||
      this.props.focusType !== nextProps.focusType ||
      this.props.keywords !== nextProps.keywords
    ) {
      this.abortRequest();
      this.setState(
        {
          pageIndex: 1,
          isFocus: nextProps.isFocus,
          containAttachment: nextProps.containAttachment,
          showReplyCommentId: '',
        },
        this.fetch,
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
    if (this.ajax && this.ajax.abort) {
      this.ajax.abort();
    }
  }

  fetch() {
    const { sourceId, sourceType, isFocus, containAttachment, commentList, entityType, focusType, keywords } =
      this.props;
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
      containAttachment,
      entityType,
      focusType,
      keywords,
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
            hasMore: res.data && res.data.length !== 0 && res.data.length >= pageSize,
          });
        } else {
          alert(_l('获取讨论失败'), 2);
        }
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  switchReplyComment = discussionId => {
    // 点击同一个隐藏
    if (discussionId === this.state.showReplyCommentId) {
      discussionId = '';
    }
    this.setState({ showReplyCommentId: discussionId });
  };

  updateComment = comment => {
    const commentList = this.props.commentList.map(item => {
      if (item.discussionId === comment.discussionId) return comment;
      else return item;
    });
    this.props.updateCommentList(commentList);
  };

  render() {
    const { commentList, sourceId, sourceType, isFocus, containAttachment, children, nullCommentList } = this.props;
    const { isLoading, showReplyCommentId, pageIndex } = this.state;

    const getEmptyText = () => {
      switch (true) {
        case isFocus && containAttachment:
          return _l('暂无与我有关含附件的讨论');
        case isFocus:
          return _l('暂无与我有关的讨论');
        case containAttachment:
          return _l('暂无含附件的讨论');
        default:
          return _l('暂无讨论');
      }
    };

    // 加载
    if (isLoading && pageIndex === 1) {
      return <LoadDiv className="mTop10" />;
    }

    // 空状态
    if (!commentList.length) {
      if (nullCommentList) {
        return nullCommentList;
      }
      return <div className="mTop15 Gray_bd Font13 commentEmpty">{getEmptyText()}</div>;
    }

    return (
      <div
        className="commentList"
        ref={el => {
          this.list = el;
        }}
      >
        {commentList
          .filter(o => !!o)
          .map(item => (
            <CommentListItem
              key={item.discussionId}
              comment={item}
              storageId={`${sourceId}-${item.discussionId}`}
              sourceType={sourceType}
              switchReplyComment={this.switchReplyComment}
              removeComment={this.props.removeComment}
              updateComment={this.updateComment}
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
