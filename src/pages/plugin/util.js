import Remarkable from 'remarkable';
import { escapeHtml, replaceEntities } from 'remarkable/lib/common/utils';
import { highlight, languages } from 'prismjs/components/prism-core';
import _ from 'lodash';
import filterXss from 'xss';

export const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};

export const getMarkdownContent = text => {
  const md = new Remarkable({
    highlight(str) {
      return highlight(str, languages.js);
    },
  });

  md.renderer.rules.link_open = function (tokens, idx) {
    const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
    return '<a target="_blank" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>';
  };

  return filterXss(md.render(text));
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
      break;
    case 4:
      operateText = _l('安装于');
      break;
  }
  return [_.get(recentOperation, 'account.fullname'), operateText, createTimeSpan(recentOperation.time)].join(' ');
};
