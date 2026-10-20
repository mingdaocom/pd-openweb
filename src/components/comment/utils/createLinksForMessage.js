import parseEmotion from 'src/components/emotion/parseEmotion';
import { htmlEncodeReg } from 'src/utils/core/string';
import {
  buildAnswerLinkHtml,
  buildAtAllHtml,
  buildCalendarLinkHtml,
  buildCategoryLinkHtml,
  buildDocVersionLinkHtml,
  buildFolderLinkHtml,
  buildGroupLinkHtml,
  buildTaskLinkHtml,
  buildUserLinkHtml,
  createCustomTagRegExp,
  findCategoryName,
} from './messageTokens';

function escapeHTML(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 替换动态/任务等内容中的链接
 * @param  {string} args.message        替换前的 html
 * @param  {object[]} args.rUserList      @ 到的帐号列表
 * @param  {object[]} args.rGroupList     @ 到的群组列表
 * @param  {object[]} args.categories     打的话题
 * @param  {boolean} args.noLink     只生成文本，不生成链接
 * @param  {boolean} args.filterFace     不显示表情
 * @return {string}                替换后的 html
 */
export default args => {
  let message = args.message;

  if (!args.doNotEscapeHTML) {
    message = escapeHTML(message);
  }

  message = message.replace(/\n/g, '<br>');
  let rUserList = args.rUserList;
  let rGroupList = args.rGroupList;
  let categories = args.categories;
  let noLink = args.noLink;
  let filterFace = args.filterFace;
  let sourceType = args.sourceType;
  let replaceStr = '';
  let j;

  const replaceMessageCustomTag = function (message, tagName, replaceHtmlFunc, filterCustom) {
    let startTag;

    if (!message) return message;
    if (typeof tagName === 'string') {
      startTag = '[' + tagName + ']';
    } else if (Array.isArray(tagName)) {
      startTag = tagName[0];
    } else {
      return message;
    }

    if (message.indexOf(startTag) > -1) {
      const customRegExp = createCustomTagRegExp(tagName);

      if (filterCustom) {
        message = message.replace(customRegExp, '');
      } else {
        message = message.replace(customRegExp, function ($0, $1, $2) {
          let customStr = $2;
          let splitterIndex = customStr.indexOf('|');

          if (splitterIndex === -1) {
            return replaceHtmlFunc ? replaceHtmlFunc(customStr, _l('无法解析') + tagName) : '';
          }

          let customId = customStr.substr(0, splitterIndex);
          let customName = customStr.substr(splitterIndex + 1);
          return replaceHtmlFunc ? replaceHtmlFunc(customId, customName) : customName;
        });
      }
    }

    return message;
  };

  message = message.replace(/\[all\]atAll\[\/all\]/gi, buildAtAllHtml(sourceType));

  if (rUserList && rUserList.length > 0) {
    for (j = 0; j < rUserList.length; j++) {
      let rUser = rUserList[j] || {};
      replaceStr = '';
      let name = htmlEncodeReg(rUser.name || rUser.fullname);
      let aid = rUser.aid || rUser.accountId;

      if (name) {
        replaceStr += noLink ? ' @' + name + ' ' : ` ${buildUserLinkHtml(rUser)} `;
      }

      let userRegExp = new RegExp('\\[aid]' + aid + '\\[/aid]', 'gi');
      message = message.replace(userRegExp, replaceStr);
    }
  }

  if (rGroupList && rGroupList.length > 0) {
    for (j = 0; j < rGroupList.length; j++) {
      let rGroup = rGroupList[j];
      replaceStr = '';

      if (rGroup.groupName) {
        replaceStr += noLink ? '@' + htmlEncodeReg(rGroup.groupName) : ` ${buildGroupLinkHtml(rGroup)} `;
      }

      let groupRegExp = new RegExp('\\[gid]' + rGroup.groupID + '\\[/gid]', 'gi');
      message = message.replace(groupRegExp, replaceStr);
    }
  }

  const getReplaceHtmlFunc = function (getLink, getPlain) {
    return function (customId, customName) {
      if (noLink) {
        return getPlain ? getPlain(customId) : customName;
      }

      return getLink(customId, customName);
    };
  };

  // 话题
  message = replaceMessageCustomTag(
    message,
    'cid',
    getReplaceHtmlFunc(
      function (id) {
        return buildCategoryLinkHtml(id, findCategoryName(categories, id));
      },
      function (id) {
        return '#' + htmlEncodeReg(findCategoryName(categories, id)) + '#';
      },
    ),
  );
  // 任务
  message = replaceMessageCustomTag(message, 'tid', getReplaceHtmlFunc(buildTaskLinkHtml));
  // 项目
  message = replaceMessageCustomTag(message, 'fid', getReplaceHtmlFunc(buildFolderLinkHtml));
  // 日程
  message = replaceMessageCustomTag(message, ['[CALENDAR]', '[CALENDAR]'], getReplaceHtmlFunc(buildCalendarLinkHtml));
  // 问答中心
  message = replaceMessageCustomTag(message, ['[STARTANSWER]', '[ENDANSWER]'], getReplaceHtmlFunc(buildAnswerLinkHtml));
  // 文档版本
  message = replaceMessageCustomTag(
    message,
    ['[docversion]', '[docversion]'],
    getReplaceHtmlFunc(buildDocVersionLinkHtml),
  );

  if ((typeof filterFace === 'undefined' || !filterFace) && !noLink) {
    message = parseEmotion(message);
  }

  message = message.replace(/<br( \/)?>/g, '\n'); // .replace(/<[^>]+>/g, '');

  if (!noLink) {
    message = message.replace(/\n/g, '<br>');
    let urlReg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=])?[^ <>[\]*(){},\u4E00-\u9FA5]+/gi;

    message = message.replace(urlReg, function (m) {
      return `<a target="_blank" href="${m}">${m}</a>`;
    });
  }

  // 外部用户
  if ((args.accountId || '').indexOf('a#') > -1) {
    message = message.replace(new RegExp(`\\[aid\\]${args.accountId}\\[\\/aid\\]`, 'g'), args.accountName);
  }

  return message;
};
