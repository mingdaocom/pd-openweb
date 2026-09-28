import { Remarkable, utils } from 'remarkable';

// remarkable 2.x 使用具名导出；业务侧只依赖当前封装层，避免感知包导出形态。

// 业务代码统一从封装层获取 utils，避免继续依赖 remarkable/lib/* 内部路径。
export function escapeHtml(str) {
  return utils.escapeHtml(String(str == null ? '' : str));
}

export function replaceEntities(str) {
  return utils.replaceEntities(String(str == null ? '' : str));
}

export function setLinkOpenInNewTab(md, { target = '_blank', rel = 'noopener noreferrer' } = {}) {
  md.renderer.rules.link_open = function (tokens, idx) {
    const token = tokens[idx];
    const href = escapeHtml(token.href || '');
    const title = token.title ? ` title="${escapeHtml(replaceEntities(token.title))}"` : '';
    const targetAttr = target ? ` target="${escapeHtml(target)}"` : '';
    const relAttr = rel ? ` rel="${escapeHtml(rel)}"` : '';

    // target="_blank" 链接需要同时设置 rel，避免泄露 window.opener。
    return `<a href="${href}"${title}${targetAttr}${relAttr}>`;
  };

  return md;
}

export function configureRemarkable(md, { linkTargetBlank = false, rendererRules } = {}) {
  if (linkTargetBlank) {
    setLinkOpenInNewTab(md);
  }

  if (rendererRules) {
    Object.keys(rendererRules).forEach(name => {
      md.renderer.rules[name] = rendererRules[name];
    });
  }

  return md;
}

export function createRemarkable(options, config) {
  return configureRemarkable(new Remarkable(options), config);
}

export { utils };
export default Remarkable;
