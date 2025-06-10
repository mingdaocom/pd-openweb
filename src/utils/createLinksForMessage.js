import { AT_ALL_TEXT } from 'src/components/comment/config';
import Emotion from 'src/components/emotion/emotion';
import { htmlEncodeReg } from './common';

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
  let message = args.message.replace(/\n/g, '<br>');
  let rUserList = args.rUserList;
  let rGroupList = args.rGroupList;
  let categories = args.categories;
  let noLink = args.noLink;
  let filterFace = args.filterFace;
  let sourceType = args.sourceType;
  let replaceStr = '';
  let j;
  const replaceMessageCustomTag = function (message, tagName, replaceHtmlFunc, filterCustom) {
    let startTag, endTag;

    if (!message) return message;
    if (typeof tagName === 'string') {
      startTag = '[' + tagName + ']';
      endTag = '[/' + tagName + ']';
    } else if (Array.isArray(tagName)) {
      startTag = tagName[0];
      endTag = tagName[1];
    } else {
      return message;
    }

    if (message.indexOf(startTag) > -1) {
      const customRegExp = new RegExp(
        '(' +
          startTag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') +
          ')([0-9a-zA-Z-]*\\|?.*?)' +
          endTag.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'),
        'gi',
      );

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

  message = message.replace(/\[all\]atAll\[\/all\]/gi, '<a>@' + AT_ALL_TEXT[sourceType] + '</a>');

  if (rUserList && rUserList.length > 0) {
    for (j = 0; j < rUserList.length; j++) {
      let rUser = rUserList[j];
      replaceStr = '';
      let name = htmlEncodeReg(rUser.name || rUser.fullname);
      let aid = rUser.aid || rUser.accountId;
      if (name) {
        if (noLink) {
          replaceStr += ' @' + name + ' ';
        } else {
          if (md.global.Account.isPortal || (aid || '').indexOf('a#') > -1) {
            // 外部门户
            replaceStr += ' <a>@' + name + '</a> ';
          } else {
            replaceStr +=
              ' <a data-accountid="' + aid + '" target="_blank" href="/user_' + aid + '">@' + name + '</a> ';
          }
        }
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
        if (noLink) {
          replaceStr += '@' + htmlEncodeReg(rGroup.groupName);
        } else {
          if (rGroup.isDelete) {
            replaceStr +=
              ' <span class="DisabledColor" title="群组已删除">@' + htmlEncodeReg(rGroup.groupName) + '</span> ';
          } else {
            replaceStr +=
              ' <a target="_blank" data-groupid="' +
              rGroup.groupID +
              '" href="/group/groupValidate?gID=' +
              rGroup.groupID +
              '">@' +
              htmlEncodeReg(rGroup.groupName) +
              '</a> ';
          }
        }
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

  // TODO: 了解此处各字符串是否已由后台encode
  // 话题
  let findCategory = function (id) {
    if (categories) {
      for (let i = 0, l = categories.length; i < l; i++) {
        if (categories[i].catID === id) {
          return categories[i];
        }
      }
    }
  };
  message = replaceMessageCustomTag(
    message,
    'cid',
    getReplaceHtmlFunc(
      function (id, name) {
        const category = findCategory(id);
        name = category ? category.catName : _l('未知话题');
        return '<a target="_blank" href="/feed?catId=' + id + '">#' + htmlEncodeReg(name) + '#</a>';
      },
      function (id, name) {
        const category = findCategory(id);
        name = category ? category.catName : _l('未知话题');
        return '#' + htmlEncodeReg(name) + '#';
      },
    ),
  );
  // 任务
  message = replaceMessageCustomTag(
    message,
    'tid',
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/apps/task/task_' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 项目
  message = replaceMessageCustomTag(
    message,
    'fid',
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/apps/task/folder_' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 日程
  message = replaceMessageCustomTag(
    message,
    ['[CALENDAR]', '[CALENDAR]'],
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/apps/calendar/detail_' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 问答中心
  message = replaceMessageCustomTag(
    message,
    ['[STARTANSWER]', '[ENDANSWER]'],
    getReplaceHtmlFunc(function (id, name) {
      return '<a target="_blank" href="/feeddetail?itemID=' + id + '">' + htmlEncodeReg(name) + '</a>';
    }),
  );
  // 文档版本
  message = replaceMessageCustomTag(
    message,
    ['[docversion]', '[docversion]'],
    getReplaceHtmlFunc(function (id, name) {
      return (
        '<a href="/feeddetail?itemID=' +
        id +
        '" target="_blank">' +
        (htmlEncodeReg(name.split('|')[0]) || '文件') +
        '</a>'
      );
    }),
  );

  if ((typeof filterFace === 'undefined' || !filterFace) && !noLink) {
    message = Emotion.parse(message);
  }

  message = message.replace(/<br( \/)?>/g, '\n'); // .replace(/<[^>]+>/g, '');

  if (!noLink) {
    message = message.replace(/\n/g, '<br>');
    let urlReg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=])?[^ <>\[\]*(){},\u4E00-\u9FA5]+/gi;

    message = message.replace(urlReg, function (m) {
      return '<a target="_blank" href="' + m + '">' + m + '</a>';
    });
  }

  // 外部用户
  if ((args.accountId || '').indexOf('a#') > -1) {
    message = message.replace(new RegExp(`\\[aid\\]${args.accountId}\\[\\/aid\\]`, 'g'), args.accountName);
  }

  return message;
};
