import _ from 'lodash';
import { AT_ALL_TEXT } from 'src/components/comment/config';
import { buildEmotionImageHtml, EMOTION_PARSE_RULES } from 'src/components/emotion/parseEmotion';
import { htmlEncodeReg } from 'src/utils/core/string';
import { pathCompletion } from 'src/utils/platform/navigation/path';

/**
 * 动态 / 评论正文里私有标记（[aid]、[gid]、[cid] 等）与表情标记的匹配与 HTML 生成。
 *
 * 纯文本链路（createLinksForMessage）与 Markdown 链路共用同一套生成逻辑，保证 @人、话题、
 * 系统对象在两种模式下渲染一致，也保证 Markdown 模式下的 @人同样带 data-accountid，
 * 让 postMessage 现有的 UserCard 挂载逻辑继续生效。
 */

const escapeRegExpChars = value => String(value).replace(/[-[\]{}()*+?.\\^$|]/g, '\\$&');

/**
 * 标记里的 id 来自正文，用户可以写成任意内容（如 [cid]x"><img onerror=...>[/cid]），
 * 拼进 href / data-* 属性前必须编码：URL 片段做 URL 编码，属性值做 HTML 实体编码
 */
const encodeUrlPart = value => encodeURIComponent(String(value ?? ''));
const encodeAttr = value => htmlEncodeReg(value);

/** 私有标记占位符使用 Unicode 私有区字符，markdown-it 会把它当作普通文本，不参与任何语法解析 */
export const PLACEHOLDER_START = '\uE000';
export const PLACEHOLDER_END = '\uE001';
/** 每次调用返回新的正则实例，避免共享 lastIndex 状态 */
export function createPlaceholderRegExp() {
  return new RegExp(`${PLACEHOLDER_START}(\\d+)${PLACEHOLDER_END}`, 'g');
}

/**
 * 构造 [tag]id|name[/tag] 形式的匹配规则
 * @param {string|string[]} tagName 标记名，或 [起始标记, 结束标记]
 */
export function createCustomTagRegExp(tagName) {
  const startTag = _.isArray(tagName) ? tagName[0] : `[${tagName}]`;
  const endTag = _.isArray(tagName) ? tagName[1] : `[/${tagName}]`;

  return new RegExp(`(${escapeRegExpChars(startTag)})([0-9a-zA-Z-]*\\|?.*?)${escapeRegExpChars(endTag)}`, 'gi');
}

export function buildUserLinkHtml(rUser = {}) {
  const name = htmlEncodeReg(rUser.name || rUser.fullname);
  const aid = rUser.aid || rUser.accountId;

  if (!name) return '';

  // 外部门户用户没有可访问的个人主页
  if (md.global.Account.isPortal || (aid || '').indexOf('a#') > -1) {
    return `<a>@${name}</a>`;
  }

  return `<a data-accountid="${encodeAttr(aid)}" target="_blank" href="${pathCompletion('/user_' + encodeUrlPart(aid), { hasDomain: false })}">@${name}</a>`;
}

export function buildGroupLinkHtml(rGroup = {}) {
  if (!rGroup.groupName) return '';

  const name = htmlEncodeReg(rGroup.groupName);

  if (rGroup.isDelete) {
    return `<span class="textDisabled" title="${htmlEncodeReg(_l('群组已删除'))}">@${name}</span>`;
  }

  return `<a target="_blank" data-groupid="${encodeAttr(rGroup.groupID)}" href="${pathCompletion('/group/groupValidate?gID=' + encodeUrlPart(rGroup.groupID), { hasDomain: false })}">@${name}</a>`;
}

export function buildAtAllHtml(sourceType) {
  return `<a>@${AT_ALL_TEXT[sourceType]}</a>`;
}

export function buildCategoryLinkHtml(id, name) {
  return `<a target="_blank" href="${pathCompletion('/feed?catId=' + encodeUrlPart(id), { hasDomain: false })}">#${htmlEncodeReg(name)}#</a>`;
}

export function buildTaskLinkHtml(id, name) {
  return `<a target="_blank" href="${pathCompletion('/apps/task/task_' + encodeUrlPart(id), { hasDomain: false })}">${htmlEncodeReg(name)}</a>`;
}

export function buildFolderLinkHtml(id, name) {
  return `<a target="_blank" href="${pathCompletion('/apps/task/folder_' + encodeUrlPart(id), { hasDomain: false })}">${htmlEncodeReg(name)}</a>`;
}

export function buildCalendarLinkHtml(id, name) {
  return `<a target="_blank" href="${pathCompletion('/apps/calendar/detail_' + encodeUrlPart(id), { hasDomain: false })}">${htmlEncodeReg(name)}</a>`;
}

export function buildAnswerLinkHtml(id, name) {
  return `<a target="_blank" href="${pathCompletion('/feeddetail?itemID=' + encodeUrlPart(id), { hasDomain: false })}">${htmlEncodeReg(name)}</a>`;
}

export function buildDocVersionLinkHtml(id, name) {
  return `<a href="${pathCompletion('/feeddetail?itemID=' + encodeUrlPart(id), { hasDomain: false })}" target="_blank">${htmlEncodeReg(name.split('|')[0]) || _l('文件')}</a>`;
}

export function findCategoryName(categories, id) {
  const category = _.find(categories, item => item.catID === id);
  return category ? category.catName : _l('未知话题');
}

/** 系统对象标记：标记名 → 链接生成函数，name 取自标记内容 */
const getSystemTagBuilders = () => [
  { tagName: 'tid', build: buildTaskLinkHtml },
  { tagName: 'fid', build: buildFolderLinkHtml },
  { tagName: ['[CALENDAR]', '[CALENDAR]'], build: buildCalendarLinkHtml },
  { tagName: ['[STARTANSWER]', '[ENDANSWER]'], build: buildAnswerLinkHtml },
  { tagName: ['[docversion]', '[docversion]'], build: buildDocVersionLinkHtml },
];

/**
 * 把正文里的私有标记与表情标记替换成占位符，供 Markdown 渲染前保护使用。
 * 找不到对应数据的 [aid] / [gid] 保持原样，与纯文本链路行为一致。
 *
 * @param {string} message 原始正文
 * @param {Object} context 动态 / 评论数据（rUserList、rGroupList、categories、sourceType、filterFace）
 * @returns {{ text: string, tokens: Array<{ raw: string, html: string }> }}
 */
export function tokenizeMessage(message, context = {}) {
  const { rUserList, rGroupList, categories, sourceType, filterFace } = context;
  const tokens = [];

  const addToken = (raw, html) => {
    tokens.push({ raw, html });
    return `${PLACEHOLDER_START}${tokens.length - 1}${PLACEHOLDER_END}`;
  };

  let text = String(message == null ? '' : message);

  text = text.replace(/\[all\]atAll\[\/all\]/gi, raw => addToken(raw, buildAtAllHtml(sourceType)));

  text = text.replace(/\[aid\]([^[\]]*?)\[\/aid\]/gi, (raw, aid) => {
    const rUser = _.find(rUserList, item => (item.aid || item.accountId) === aid);
    return rUser ? addToken(raw, buildUserLinkHtml(rUser)) : raw;
  });

  text = text.replace(/\[gid\]([^[\]]*?)\[\/gid\]/gi, (raw, groupId) => {
    const rGroup = _.find(rGroupList, item => item.groupID === groupId);
    return rGroup ? addToken(raw, buildGroupLinkHtml(rGroup)) : raw;
  });

  text = text.replace(createCustomTagRegExp('cid'), (raw, startTag, content) => {
    const splitterIndex = content.indexOf('|');
    const catId = splitterIndex === -1 ? content : content.substr(0, splitterIndex);
    return addToken(raw, buildCategoryLinkHtml(catId, findCategoryName(categories, catId)));
  });

  getSystemTagBuilders().forEach(({ tagName, build }) => {
    text = text.replace(createCustomTagRegExp(tagName), (raw, startTag, content) => {
      const splitterIndex = content.indexOf('|');

      if (splitterIndex === -1) return raw;

      return addToken(raw, build(content.substr(0, splitterIndex), content.substr(splitterIndex + 1)));
    });
  });

  // filterFace 与纯文本链路一致：不解析表情，标记按原文显示
  if (!filterFace) {
    EMOTION_PARSE_RULES.forEach(({ group, item, pattern }) => {
      pattern.lastIndex = 0;
      if (!pattern.test(text)) return;

      pattern.lastIndex = 0;
      text = text.replace(pattern, raw => addToken(raw, buildEmotionImageHtml(group, item)));
    });
  }

  return { text, tokens };
}
