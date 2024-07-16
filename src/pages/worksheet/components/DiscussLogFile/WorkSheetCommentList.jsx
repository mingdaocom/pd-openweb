import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import { emitter } from 'worksheet/util';
import _ from 'lodash';
import cx from 'classnames';

export default class WorkSheetCommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
      containAttachment: false,
    };
    this.updatePageIndex = this.updatePageIndex.bind(this);
    this.reload = this.reload.bind(this);
  }

  componentDidMount() {
    const { listRef } = this.props;
    if (listRef) {
      listRef(this);
    }
    emitter.addListener('RELOAD_RECORD_INFO_DISCUSS', this.reload);
  }

  componentWillReceiveProps(nextProps) {
    //内部和外部讨论切换
    if (nextProps.entityType !== this.props.entityType) {
      this.setState({ isFocus: false, containAttachment: false });
    }
  }

  componentWillUnMount() {
    emitter.removeListener('RELOAD_RECORD_INFO_DISCUSS', this.reload);
  }

  reload() {
    this.updatePageIndex({ isReset: true });
  }

  // export method for parent component, bind context
  updatePageIndex(...args) {
    if (this.commentList) {
      this.commentList.updatePageIndex(...args);
    }
  }

  render() {
    const {
      worksheet: { projectId, worksheetId, rowId, appId, appName, appSectionId, viewId, title, doNotLoadAtDidMount },
      change,
      discussions,
      addCallback,
      forReacordDiscussion,
      atData,
      status,
      entityType,
    } = this.props;
    const { isFocus, containAttachment } = this.state;
    const id = rowId ? worksheetId + '|' + rowId : worksheetId;
    const props = {
      forReacordDiscussion,
      entityType,
      atData,
      placeholder: window.isPublicApp ? _l('预览模式下，不能参与讨论') : _l('暂无讨论'),
      activePlaceholder: _l('输入@成员，按Ctrl+Enter快速发布'),
      sourceId: id,
      sourceType: rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET,
      appId: rowId ? md.global.APPInfo.worksheetRowAppID : md.global.APPInfo.worksheetAppID,
      fromAppId: appId,
      projectId,
      remark: JSON.stringify({
        type: 'worksheet',
        appId,
        appName,
        appSectionId,
        worksheetId: worksheetId,
        viewId,
        rowId,
        title: typeof title === 'string' ? title : '',
      }),
      offset: 45,
      popupContainer: document.body,
      extendsId: `${appId || ''}|${viewId || ''}`,
      mentionsOptions: { isAtAll: !!rowId },
      autoFocus: true,
      onSubmit: data => {
        change({ discussions: [data].concat(discussions) });
        addCallback(data);
      },
    };

    return (
      <div className="WorkSheetCommentList">
        {(!!discussions.length || isFocus || containAttachment) && (
          <div className="flexRow alignItemsCenter mBottom8">
            <div
              className={cx('commentFilterBtn', { isActive: isFocus })}
              onClick={() => this.setState({ isFocus: !isFocus })}
            >
              {isFocus && <Icon icon="done" className="mRight5 Font14" />}
              <span>{_l('与我有关')}</span>
            </div>
            <div
              className={cx('commentFilterBtn mLeft8', { isActive: containAttachment })}
              onClick={() => this.setState({ containAttachment: !containAttachment })}
            >
              {containAttachment && <Icon icon="done" className="mRight5 Font14" />}
              <span>{_l('含附件')}</span>
            </div>
          </div>
        )}

        <CommentList
          doNotLoadAtDidMount={doNotLoadAtDidMount}
          status={status}
          sourceId={id}
          sourceType={rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET}
          isFocus={isFocus}
          containAttachment={containAttachment}
          commentList={discussions}
          updateCommentList={data => {
            change({ discussions: data });
          }}
          removeComment={_id => {
            change({
              discussions: _.filter(discussions, ({ discussionId }) => discussionId !== _id),
            });
          }}
          manualRef={comp => {
            this.commentList = comp;
          }}
          entityType={entityType}
        >
          <Commenter {...props} />
        </CommentList>
      </div>
    );
  }
}
