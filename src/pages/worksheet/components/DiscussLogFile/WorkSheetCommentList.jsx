import React, { Component } from 'react';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import { emitter } from 'worksheet/util';
import _ from 'lodash';
export default class WorkSheetCommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOnlyMe: false,
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

  handleFocusClick(checked) {
    // toggle state and get first page topics
    this.setState({
      isOnlyMe: !checked,
    });
  }

  render() {
    const {
      worksheet: { worksheetId, rowId, appId, appName, appSectionId, viewId, title, doNotLoadAtDidMount },
      change,
      discussions,
      addCallback,
      forReacordDiscussion,
      atData,
      status,
      entityType,
    } = this.props;
    const { isOnlyMe } = this.state;
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
      extendsId: `${appId || ''}|${viewId || ''}`,
      mentionsOptions: { isAtAll: !!rowId },
      autoFocus: true,
      onSubmit: data => {
        change({ discussions: [data].concat(discussions) });
        addCallback(data);
      },
    };

    return (
      <div className="pBottom10 pTop10 WorkSheetCommentList">
        {/* <CheckBox*/}
        {/* className="mBottom8 pTop5 mTop5"*/}
        {/* checked={isOnlyMe}*/}
        {/* onClick={checked => {*/}
        {/* this.handleFocusClick.bind(this)(checked);*/}
        {/* }}*/}
        {/* >*/}
        {/* <span className="Gray_9">{_l('只显示与我相关')}</span>*/}
        {/* </CheckBox>*/}
        <CommentList
          doNotLoadAtDidMount={doNotLoadAtDidMount}
          status={status}
          sourceId={id}
          sourceType={rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET}
          isFocus={isOnlyMe}
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
