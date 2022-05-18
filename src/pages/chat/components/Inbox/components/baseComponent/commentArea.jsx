import React from 'react';
import PropTypes from 'prop-types';
import UploadFile from 'uploadFiles';
import Commenter from 'commenter';
import { htmlDecodeReg } from 'src/util';
import Avatar from './avatar';
import UserLink from './userLink';
import ReplyTo from './replyTo';
import { SOURCE_TYPE } from '../../constants';
import { formatTopic, splitSourceId, buildSourceLink } from '../../util';
import { createLinksForMessage } from 'mdFunction';
import DiscussionController from 'src/api/discussion';
import postAjax from 'src/api/post';
import confirm from 'ming-ui/components/Dialog/Confirm';

const loadAllComment = function (postId) {
  var _this = this;
  var dfd = $.Deferred();
  postAjax
    .getMorePostComments({
      postID: postId,
    })
    .done(function (data) {
      if (data === 'error') {
        alert(_l('操作失败'), 2);
        dfd.reject();
      } else {
        dfd.resolve(data);
      }
    });
  return dfd.promise();
};

const removeTopicConfirm = props => {
  const { replyId, isDeleteAttachment } = props;
  const title = replyId ? _l('回复') : _l('评论');
  const header = (isDeleteAttachment ? _l('%0带有的附件会被删除，', title) : '') + _l('确认要删除此%0吗？', title);
  confirm({
    title: header,
    onOk: () => {
      removeTopic(props);
    },
  });
};

const removeTopic = function (props) {
  const { sourceType, sourceId, discussionId, isDeleteAttachment } = props;

  if (sourceType === SOURCE_TYPE.POST) {
    return postAjax
      .removePostComment({
        deleteAttachment: 1,
        postID: sourceId,
        commentID: discussionId,
      })
      .done(function (data) {
        const { success } = data;
        if (success) {
          alert(_l('删除成功'));
          props.removeCallback(props.discussionId);
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  } else {
    const { discussionId, isDeleteAttachment } = props;
    var params = {
      discussionId,
      sourceType,
    };
    return DiscussionController.removeDiscussion(params)
      .then(function (result) {
        var dfd = $.Deferred();
        if (result.code === 1) {
          dfd.resolve();
        } else {
          dfd.reject();
        }
        return dfd.promise();
      })
      .then(
        function () {
          alert(_l('删除成功'));
          props.removeCallback(props.discussionId);
        },
        function () {
          alert(_l('操作失败'), 2);
        },
      );
  }
};

const getComponentProps = function (props) {
  const {
    params: { sourceType, discussionId, extendsId, name, projectId, createAccount },
  } = props;
  var commonProps = {
    placeholder: _l('请输入回复内容'),
    textareaMinHeight: 22,
    autoFocus: true,
    shrinkAfterSubmit: true,
  };
  const decodedName = htmlDecodeReg(name);
  const { sourceId, childId } = splitSourceId(props.params.sourceId);
  var map = {
    [SOURCE_TYPE.TASK]: {
      selectGroupOptions: {
        projectId,
      },
      sourceId,
      sourceType,
      appId: md.global.APPInfo.taskAppID,
      replyId: discussionId,
      remark: sourceId + '|' + decodedName + '|' + _l('任务'),
    },
    [SOURCE_TYPE.FOLDER]: {
      selectGroupOptions: {
        projectId,
      },
      sourceId,
      sourceType,
      appId: md.global.APPInfo.taskFolderAppID,
      replyId: discussionId,
      remark: sourceId + '|' + decodedName + '|' + _l('项目'),
    },
    [SOURCE_TYPE.WORKSHEET]: {
      selectGroupOptions: {
        projectId,
      },
      sourceId,
      extendsId,
      sourceType,
      appId: md.global.APPInfo.worksheetAppID,
      replyId: discussionId,
      remark: sourceId + '|' + decodedName + '|' + _l('工作表'),
      mentionsOptions: { isAtAll: false },
    },
    [SOURCE_TYPE.WORKSHEETROW]: {
      selectGroupOptions: {
        projectId,
      },
      sourceId: props.params.sourceId,
      extendsId,
      sourceType,
      appId: md.global.APPInfo.worksheetRowAppID,
      replyId: discussionId,
      remark: (childId ? sourceId + '_' + childId : sourceId) + '|' + decodedName + '|' + _l('工作表记录'),
    },
    [SOURCE_TYPE.CALENDAR]: {
      sourceId: props.params.sourceId,
      sourceType,
      appId: md.global.APPInfo.calendarAppID,
      replyId: discussionId,
      remark:
        (childId ? sourceId + '_' + moment(childId).format('YYYYMMDDHHmmss') : sourceId) +
        '|' +
        decodedName +
        '|' +
        _l('日程'),
    },
    [SOURCE_TYPE.POST]: {
      sourceId,
      sourceType,
      replyId: discussionId,
      accountId: (createAccount || {}).accountId,

      sendPost: false,
    },
  };

  return $.extend(true, commonProps, map[sourceType]);
};

class CommentItem extends React.Component {
  constructor(props) {
    super();
    this.state = {
      showCommenter: false,
    };
  }

  renderMessage() {
    const { message, accountsInMessage, groupsInMessage, categories, sourceType } = this.props;
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: createLinksForMessage({
            message: message.replace(/\n/g, ' <br>'),
            rUserList: accountsInMessage,
            rGroupList: groupsInMessage,
            categories,
            sourceType,
          }),
        }}
      />
    );
  }

  renderTopic() {
    const { sourceType, createAccount, replyAccount, sourceId, replyId } = this.props;
    if (replyId) {
      return (
        <div className="mBottom10 mTop3 LineHeight25">
          <span className="mRight10 commentContentItem InlineBlock WordBreak">
            <UserLink {...createAccount} />
            <span className="mLeft5 Green mRight5">{_l('回复')}</span>
            <UserLink {...replyAccount} />
            {replyId ? <ReplyTo {...{ sourceId, replyId, sourceType }} /> : null}
            <span>: </span>
          </span>
          {this.renderMessage()}
        </div>
      );
    } else {
      return (
        <div className="mBottom10 mTop3 LineHeight25">
          <span className="mRight10 commentContentItem InlineBlock WordBreak">
            <UserLink {...createAccount} />
            <span className="mLeft2">: </span>
          </span>
          {this.renderMessage()}
        </div>
      );
    }
  }

  renderAttachment() {
    const { attachment } = this.props;
    return (
      <div className="mTop5">
        <UploadFile isUpload={false} attachmentData={attachment} />
      </div>
    );
  }

  renderBottomBar() {
    const { canDelete, sourceId, sourceType, createTime } = this.props;
    const { showCommenter } = this.state;
    const buildLink = () => {
      switch (sourceType) {
        case SOURCE_TYPE.POST:
          return (
            <a
              href={buildSourceLink(sourceType, sourceId)}
              className="Gray_a NoUnderline"
              title={_l('点击查看动态详情')}
            >
              {createTimeSpan(createTime)}
            </a>
          );
        case SOURCE_TYPE.TASK:
          return (
            <a
              href={buildSourceLink(sourceType, sourceId)}
              className="Gray_a NoUnderline"
              title={_l('点击查看任务详情')}
            >
              {createTimeSpan(createTime)}
            </a>
          );
        case SOURCE_TYPE.FOLDER:
          return (
            <a
              href={buildSourceLink(sourceType, sourceId)}
              className="Gray_a NoUnderline"
              title={_l('点击查看项目详情')}
            >
              {createTimeSpan(createTime)}
            </a>
          );
        case SOURCE_TYPE.CALENDAR: {
          return (
            <a
              href={buildSourceLink(sourceType, sourceId)}
              className="Gray_a NoUnderline"
              title={_l('点击查看日程详情')}
            >
              {createTimeSpan(createTime)}
            </a>
          );
        }
      }
    };

    return (
      <div className="clearfix">
        {buildLink()}
        <div className="Right">
          {canDelete ? (
            <a
              className="Hidden removeCommentButton"
              onClick={() => {
                const { discussionId, isDeleteAttachment, sourceType, replyId, removeCallback } = this.props;
                const props = {
                  sourceId,
                  replyId,
                  discussionId,
                  isDeleteAttachment,
                  sourceType,
                  removeCallback,
                };
                removeTopicConfirm(props);
              }}
            >
              {_l('删除')}
            </a>
          ) : null}
          <a
            className="mLeft15"
            onClick={() => {
              this.setState({ showCommenter: !showCommenter });
            }}
          >
            {_l('回复')}
          </a>
        </div>
      </div>
    );
  }

  render() {
    const { createAccount, addCallback } = this.props;
    const { showCommenter } = this.state;

    return (
      <div className="commentItem pTop12">
        <div className="commentAvatar Left">
          <Avatar {...createAccount} />
        </div>

        <div className="commentContent">
          {this.renderTopic()}
          {this.renderAttachment()}
          {this.renderBottomBar()}
          {showCommenter ? (
            <div className="mTop5 mBottom5">
              {React.cloneElement(this.props.children, {
                autoFoucs: true,
                onSubmit: discussion => {
                  addCallback(discussion);
                },
                onSubmitCallback: () => {
                  this.setState({
                    showCommenter: false,
                  });
                },
              })}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default class CommentArea extends React.Component {
  static propTypes = {
    commentsProps: PropTypes.shape({
      comments: PropTypes.array,
      commentsCount: PropTypes.number,
    }),
    params: PropTypes.shape({
      sourceId: PropTypes.string.isRequired,
      sourceType: PropTypes.oneOf(_.values(SOURCE_TYPE)),
      discussionId: PropTypes.string,
      replyId: PropTypes.string,
      name: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);
    const {
      params: { sourceType },
    } = this.props;
    const {
      commentsProps: { comments },
    } = props;
    this.state = {
      loadAllComments: false, // 动态加载全部评论
      commenterIsFocus: false,
      comments: _.map(comments || [], comment => {
        return formatTopic(comment, sourceType);
      }),

      showComments: comments && comments.length > 0,
    };
  }

  addCommentCallback(comment) {
    const {
      params: { sourceType },
    } = this.props;
    const comments = this.state.comments.slice(0);
    this.setState({
      comments: [formatTopic(comment, sourceType)].concat(comments),
    });
  }

  removeCommentCallback(id) {
    this.setState({
      comments: _.filter(this.state.comments, ({ discussionId }) => discussionId !== id),
    });
  }

  clickLoadMore() {
    const {
      params: { sourceId, type },
    } = this.props;
    loadAllComment(sourceId).then(comments => {
      this.setState({
        loadAllComments: true,
        comments: _.map(comments, comment => formatTopic(comment, type)),
      });
    });
  }

  renderCommenter() {
    const props = {
      ...getComponentProps({
        params: this.props.params,
      }),
      autoFocus: this.state.commenterIsFocus,
      onSubmit: this.addCommentCallback.bind(this),
    };
    return <Commenter {...props} />;
  }

  renderComments() {
    const { showComments } = this.state;
    if (showComments) {
      return (
        <div className="pTop5">
          {this.renderCommenter()}
          {(() => {
            return _.map(this.state.comments, comment => {
              const props = {
                ...comment,
                addCallback: this.addCommentCallback.bind(this),
                removeCallback: this.removeCommentCallback.bind(this),
              };
              const commenterProps = {
                ...getComponentProps({
                  params: {
                    ...this.props.params,
                    discussionId: props.discussionId,
                    createAccount: props.createAccount,
                  },
                }),
                onSubmit() {},
              };
              return (
                <CommentItem key={props.discussionId} {...props}>
                  <Commenter {...commenterProps} />
                </CommentItem>
              );
            });
          })()}
        </div>
      );
    } else {
      return null;
    }
  }

  renderViewMore() {
    const {
      commentsProps: { commentsCount },
    } = this.props;
    const { comments } = this.state;
    const hasMore = comments && commentsCount && comments.length < commentsCount;
    const { loadAllComments } = this.state;
    if (hasMore && !loadAllComments) {
      return (
        <div className="TxtCenter">
          <a
            href="javascript:void(0);"
            onClick={() => {
              this.clickLoadMore();
            }}
          >
            {_l('展开其余 %0 条回复', commentsCount - comments.length)}
            <i className="icon-arrow-down-border" />
          </a>
        </div>
      );
    }
  }

  render() {
    const { showComments } = this.state;
    return (
      <div className="Font12">
        <div>
          {!md.global.Account.isPortal && ( //外部门户没有回复
            <a
              href="javascript:void 0;"
              onClick={() => {
                this.setState({ showComments: !showComments, commenterIsFocus: true });
              }}
            >
              {_l('回复')}
            </a>
          )}
        </div>
        {this.renderComments()}
        {this.renderViewMore()}
      </div>
    );
  }
}
