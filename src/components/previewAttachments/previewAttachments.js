/**
 * 附件预览层 (callFrom和attachments为必须参数)
 * @function
 * @module previewAttachments
 * @author jacob
 * @desc 通过这个组件调用react组件attachmentsPreview
 * @param  {object} options 主要参数
 * @param  {object} extra 更多参数
 * @param  {string} options.callFrom 调用方来源 'player' 'folder' 'chat' 'kc'
 * @param  {Array}  options.attachments 文件 JSON 对象数组
 * @param  {promise} [extra.loadMoreAttachments] 加载更多附件(参数为promise对象，promise返回一个内容为attachment对象的数组)
 * @param  {number} [options.index] 当前显示的附件的index值(缺省为0)
 * @param  {string} [options.sourceID] 来源 ID，即 PostID, TaskID 等
 * @param  {string} [options.commentID] 回复 ID，即动态 CommentID, 任务 TopicID 等
 * @param  {number} [options.fromType] 来源类型枚举值  Post: 1, Comment: 2, Task: 3, Calendar: 4, Chat: 5, Folder: 6, Knowledge: 7,
 * @param  {string} [options.docVersionID] 当前文件
 * @param  {bool} [options.showThumbnail] 默认是否显示缩略图
 * @param  {array} [options.hideFunctions] 隐藏指定操作文件的方法 eg:hideFunctions:['editFileName']
 * @param  {string} [extra.postDetails] 获取附件详情(目前仅只能获取到动态中附件的详情)
 * @param  {function} [extra.renameCallback(attachment, attachments)] 重命名文件后的回调函数, docVersionID 和 fileID 不变
 * @param  {function} [extra.deleteCallback(docVersionID, fileID, removeFromKC, attachments)] 删除文件后的回调函数
 * @param  {function} [extra.deleteCallback.docVersionID] 被删除文件的 docVersionID
 * @param  {function} [extra.deleteCallback.fileID] 被删除的 fileID，为空则删除所有历史版本，否则删除某个版本
 * @param  {function} [extra.deleteCallback.removeFromKC] 被删除文件是否从知识中心删除
 * @param  {function} [extra.newVersionCallback(attachment, share, attachments)] 上传新版本后的回调函数
 * @param  {function} [extra.newVersionCallback.attachment 新上传的对象
 * @param  {function} [extra.newVersionCallback.share] 是否分享到动态loadMoreAttachments
 * @example
 * require.async('previewAttachments', function (previewAttachments) {
 *    previewAttachments({
 *       callFrom: 'folder', // 必须
 *       attachments: attachments, // 必须
 *       sourceID: sourceID,
 *       commentID: commentID,
 *       fromType: fromType,
 *       fileID: fileID,
 *     }, {
 *       postDetails: postDetails,
 *     });
 *   });
 */
import React from 'react';

var previewAttachments = function (options, extra) {
  require.ensure([], require => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const AttachmentsPreview = require('src/pages/kc/common/AttachmentsPreview');
    const attachments = (
      <AttachmentsPreview
        extra={extra || {}}
        options={options}
        onClose={() => {
          ReactDOM.unmountComponentAtNode($('#attachemntsPreviewContainer')[0]);
          $('#attachemntsPreviewContainer').remove();
          if (typeof options.closeCallback === 'function') {
            options.closeCallback();
          }
        }}
      />
    );
    const $el = $('#attachemntsPreviewContainer');
    if ($el.length) {
      ReactDOM.render(attachments, $el[0]);
    } else {
      ReactDOM.render(attachments, $('<div id="attachemntsPreviewContainer"></div>').appendTo('body')[0]);
    }
  });
  $(document).on('click', '#attachemntsPreviewContainer', function (e) {
    e.stopPropagation();
  });
};
module.exports = previewAttachments;
