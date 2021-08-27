import React from 'react';
import PropTypes from 'prop-types';
import BaseMessageComponent from '../baseComponent/messageContent';

import { createLinksForMessage } from 'mdFunction';
import { formatInboxItem, splitSourceId, buildSourceLink } from '../../util';
import { SOURCE_TYPE } from '../../constants';

function mergeFromSourceState(inboxItem) {
  let { discussion: { name, entityName, sourceId, extendsId, sourceType } = {} } = inboxItem;

  switch (sourceType) {
    case SOURCE_TYPE.CALENDAR:
      return {
        fromMessage: name,
        fromTitle: _l('来自日程'),
        fromLink: buildSourceLink(sourceType, sourceId),
      };
    case SOURCE_TYPE.TASK:
      return {
        fromMessage: name,
        fromTitle: _l('来自任务'),
        fromLink: buildSourceLink(sourceType, sourceId),
      };
    case SOURCE_TYPE.FOLDER:
      return {
        fromMessage: name,
        fromTitle: _l('来自项目'),
        fromLink: buildSourceLink(sourceType, sourceId),
      };
    case SOURCE_TYPE.WORKSHEET:
      return {
        fromMessage: name,
        fromTitle: _l('来自%0', entityName),
        fromLink: buildSourceLink(sourceType, sourceId),
      };
    case SOURCE_TYPE.WORKSHEETROW:
      return {
        fromMessage: name,
        fromTitle: _l('来自%0', entityName),
        fromLink: buildSourceLink(sourceType, sourceId, extendsId),
      };
    default:
      // 兼容discussion为空
      return {
        fromMessage: _l('数据不存在或已删除'),
        fromTitle: _l('来自'),
        fromLink: '',
      };
  }
}

function mergeTopicState(inboxItem) {
  const { discussion = { isDeleted: true, canReply: false }, createTime } = inboxItem;
  // 消息 @的人
  const { message, sourceType, accountsInMessage } = discussion;
  // 转成html
  return {
    ...discussion,
    message: createLinksForMessage({
      message: message || '',
      rUserList: accountsInMessage,
      sourceType,
    }),
    sourceType,
    createTime,
  };
}

/**
 * 通用inbox讨论
 * @export
 * @class CommonTopic
 * @extends {React.Component}
 */
export default function CommonTopic(props) {
  const _props = {
    ...mergeTopicState(props),
    ...mergeFromSourceState(props),
    // 获取createUser信息和typeName
    ...formatInboxItem(props),
  };
  return <BaseMessageComponent {..._props} />;
}
