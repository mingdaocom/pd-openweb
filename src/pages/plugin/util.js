import Remarkable from 'remarkable';
import { highlight, languages } from 'prismjs/components/prism-core';
import { replaceEntities, escapeHtml } from 'remarkable/lib/common/utils';
import _ from 'lodash';

export const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};

export const getMarkdownContent = text => {
  const md = new Remarkable({
    highlight(str, lang) {
      return highlight(str, languages.js);
    },
  });

  md.renderer.rules.link_open = function (tokens, idx) {
    const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
    return '<a target="_blank" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>';
  };

  return md.render(text);
};

export const getPluginOperateText = (recentOperation = {}) => {
  let operateText = '';
  switch (recentOperation.type) {
    case 1:
      operateText = _l('提交于');
      break;
    case 2:
      operateText = _l('发布于');
      break;
    case 3:
      operateText = _l('导入于');
    case 4:
      operateText = _l('安装于');
      break;
    default:
      break;
  }
  return [_.get(recentOperation, 'account.fullname'), operateText, createTimeSpan(recentOperation.time)].join(' ');
};
