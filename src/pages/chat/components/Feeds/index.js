import React, { Component } from 'react';
import './index.less';
import * as ajax from '../../utils/ajax';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { createLinksForMessage } from 'src/components/common/function';
import { getClassNameByExt } from 'src/util';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import DialogLayer from 'src/components/mdDialog/dialog';
import ReactDom from 'react-dom';
import postAjax from 'src/api/post';
import PostDetails from 'src/pages/feed/components/post/postDetails/postDetails';

const classify = files => {
  const imagelist = [];
  const filelist = [];
  files.forEach((item, index) => {
    if (item.attachmentType === 1) {
      item.index = index;
      imagelist.push(item);
    } else if (item.attachmentType === 2) {
      item.icon = getClassNameByExt(item.ext);
      item.index = index;
      filelist.push(item);
    }
  });
  return {
    imagelist,
    filelist,
  };
};

export const formatFeeds = attachments => {
  return attachments.map(item => {
    if (item.attachments) {
      item.previewAttachments = classify(item.attachments);
    }
    item.content = createLinksForMessage({
      message: item.message,
      rUserList: item.rUserList,
      rGroupList: item.rGroupList,
      categories: item.categories,
      noLink: true,
      filterFace: true,
    }).slice(0, 300);
    item.content = item.content.length >= 70 ? item.content.slice(0, 70) + '...' : item.content;
    return item;
  });
};

export class FeesItem extends Component {
  constructor(props) {
    super(props);
  }
  handlePreview(item, event) {
    event.stopPropagation();
    const { attachments } = this.props.item;
    const { index } = item;
    previewAttachments(
      {
        index: index || 0,
        attachments,
        callFrom: 'player',
        sourceID: item.sourceID,
        commentID: item.commentID,
        fromType: item.fromType,
        docVersionID: item.docVersionID,
        showThumbnail: true,
        hideFunctions: ['editFileName'],
      },
      {},
    );
  }
  handlePreviewFeed(item) {
    const { postID } = item;

    let feedDialog;
    const removeFn = function() {
      feedDialog.closeDialog();
    };

    postAjax
      .getPostDetail({
        postId: postID,
      })
      .then(postItem => {
        if (postItem.success === '1') {
          ReactDom.render(
            <DialogLayer
              dialogBoxID="chatFeedDialog"
              width={800}
              container={{
                header: _l('动态详情'),
                yesText: '',
                noText: '',
              }}
              readyFn={function(Comp) {
                $('#chatFeedDialog_container').on('click', event => {
                  if (!$(event.target).closest('#chatFeedDialog').length) {
                    Comp.closeDialog();
                  }
                });
              }}
            >
              <PostDetails onRemove={removeFn} postItem={postItem} />
            </DialogLayer>,
            document.createElement('div'),
          );
        } else {
          return alert(_l('您的权限不足或此动态已被删除，无法查看'));
        }
      });
  }
  renderImage(files) {
    return (
      <div className="feed-imageList">
        {files.map(item => (
          <div key={item.fileID} className="feed-image-item" onClick={this.handlePreview.bind(this, item)}>
            <img src={item.previewUrl} />
          </div>
        ))}
      </div>
    );
  }
  renderFile(files) {
    return (
      <div className="feed-filelist">
        {files.map(item => (
          <div className="feed-file-item" key={item.fileID} onClick={this.handlePreview.bind(this, item)}>
            <div className="file-icon">
              <i className={item.icon} />
            </div>
            <div className="file-info">
              <div className="file-info-name ThemeColor3">{item.originalFilename}</div>
            </div>
            <div className="file-info-action">
              <a href={item.downloadUrl} className="download ThemeColor3 icon-download" target="_blank" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  renderFeed() {
    const { item } = this.props;
    const { user, previewAttachments } = item;
    const { imagelist, filelist } = previewAttachments || {};
    return (
      <div className="ChatPanel-Feeds-item" key={item.autoID} onClick={this.handlePreviewFeed.bind(this, item)}>
        <div className="feed-creator">
          <div className="feed-creator-avatar">
            <img src={user.userHead} />
          </div>
          <div className="feed-creator-info">{user.userName}</div>
        </div>
        <div className="feed-body">
          <div className="feed-content">{item.content}</div>
          {imagelist && imagelist.length ? this.renderImage(imagelist) : undefined}
          {filelist && filelist.length ? this.renderFile(filelist) : undefined}
        </div>
        <div className="feed-metadata">
          <span className="feed-ctime pull-left">{createTimeSpan(item.createTime)}</span>
          <span className="feed-comment icon-task-reply-msg">{item.commentCount}</span>
        </div>
      </div>
    );
  }
  render() {
    const { item } = this.props;
    return (
      <div>
        {item.splitTime ? (
          <div>
            <div className="splitTime">{item.splitTime}</div>
            {this.renderFeed()}
          </div>
        ) : (
          this.renderFeed()
        )}
      </div>
    );
  }
}

export default class Feeds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postList: [],
      loading: true,
    };
  }
  componentDidMount() {
    const { session } = this.props;
    ajax
      .getFeed({
        gID: session.id,
        pIndex: 1,
        pSize: 3,
        lastPostAutoID: null,
      })
      .then(feeds => {
        const { postList } = feeds;
        this.setState({
          loading: false,
          postList: postList && postList.length ? formatFeeds(postList) : [],
        });
      });
  }
  render() {
    const { loading, postList } = this.state;
    return (
      <div className="ChatPanel-Feeds ChatPanel-sessionInfo-item">
        <div className="ChatPanel-Feeds-hander ChatPanel-sessionInfo-hander">
          <span>{`${_l('动态')}`}</span>
          {postList.length ? (
            <span
              onClick={this.props.onSetPanelVisible.bind(this, true)}
              className="ChatPanel-sessionInfo-hander-entry ThemeColor3"
            >
              {_l('所有动态')}
              <i className="icon-sidebar-more" />
            </span>
          ) : (
            undefined
          )}
        </div>
        <div className="ChatPanel-Feeds-body">
          {postList.map(item => (
            <FeesItem item={item} key={item.autoID} />
          ))}
          {loading ? <LoadDiv size="small" /> : undefined}
          {!loading && !postList.length ? <div className="nodata">{_l('群组中暂无动态')}</div> : undefined}
        </div>
      </div>
    );
  }
}
