import React, { Component } from 'react';
import _ from 'lodash';
import { UserHead } from 'ming-ui';
import Commenter from 'src/components/comment/commenter';

export default class WorkSheetCommenter extends Component {
  commentRef = React.createRef();
  render() {
    const {
      worksheet: { worksheetId, rowId, title, appId, name, appSectionId, viewId },
      change,
      scrollToListTop,
      discussions,
      addCallback,
      projectId,
      forReacordDiscussion,
      entityType,
      atData,
      instanceId,
      workId,
      autoFocus,
      isHide,
    } = this.props;
    const id = rowId ? worksheetId + '|' + rowId : worksheetId;
    const props = {
      forReacordDiscussion,
      entityType,
      atData,
      placeholder: window.isPublicApp ? _l('预览模式下，不能参与讨论') : _l('发送讨论'),
      activePlaceholder: _l('输入@成员，按Ctrl+Enter快速发布'),
      sourceId: id,
      sourceType: rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET,
      appId: rowId ? md.global.APPInfo.worksheetRowAppID : md.global.APPInfo.worksheetAppID,
      fromAppId: appId,
      projectId,
      remark: JSON.stringify({
        type: 'worksheet',
        appId,
        appName: name,
        appSectionId,
        worksheetId: worksheetId,
        viewId,
        rowId,
        title: typeof title === 'string' ? title : '',
      }),
      relatedLeftSpace: -60,
      mentionsOptions: { isAtAll: !!rowId, getPopupMaxHeight: () => _.get(this.commentRef, 'current.offsetTop') || 0 },
      selectGroupOptions: { position: 'top' },
      storageId: id,
      extendsId: `${appId || ''}|${viewId || ''}`,
      instanceId,
      workId,
      onSubmit: discussion => {
        scrollToListTop();
        change({
          discussions: [discussion].concat(discussions),
        });
        addCallback(discussion);
      },
      autoFocus,
      isHide,
    };
    return (
      <div className="comment" ref={this.commentRef}>
        <UserHead
          className="createHeadImg TxtMiddle InlineBlock mRight8 mTop3"
          user={{
            userHead: md.global.Account.avatar,
            accountId: md.global.Account.accountId,
          }}
          size={32}
          projectId={projectId}
        />
        <Commenter {...props} />
      </div>
    );
  }
}
