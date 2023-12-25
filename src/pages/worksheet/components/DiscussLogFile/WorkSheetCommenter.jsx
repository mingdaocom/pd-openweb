import React, { Component } from 'react';
import Commenter from 'src/components/comment/commenter';
import UserHead from 'src/components/userHead';

export default class WorkSheetCommenter extends Component {
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
      mentionsOptions: { position: 'top', isAtAll: !!rowId },
      selectGroupOptions: { position: 'top' },
      storageId: id,
      extendsId: `${appId || ''}|${viewId || ''}`,
      onSubmit: discussion => {
        scrollToListTop();
        change({
          discussions: [discussion].concat(discussions),
        });
        addCallback(discussion);
      },
    };
    return (
      <div className="comment">
        <UserHead
          className="createHeadImg TxtMiddle InlineBlock mRight8 mTop3"
          user={{
            userHead: md.global.Account.avatar,
            accountId: md.global.Account.accountId,
          }}
          size={32}
        />
        <Commenter {...props} />
      </div>
    );
  }
}
