import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { pathCompletion } from 'src/utils/common';

// 预览外框呼吸：mingo 紫描边阴影在最浅 / 最深之间 3s 缓动循环（外扩光环，不遮挡预览内容）。
// 用 color-mix(var(--color-mingo)) 取各档透明度，兼容自定义品牌色，不写死色值。
const shadowBreath = keyframes`
  0%, 100% {
      /* 呼吸最浅点 */
      box-shadow:
          0 0 0px 3px rgba(110, 9, 249, 0.5),
          0 0 2px 0px rgba(110, 9, 249, 0.15);
  }
  50% {
      /* 呼吸最深点 */
      box-shadow:
          0 0 0px 5px rgba(110, 9, 249, 1),
          0 0 8px 4px rgba(110, 9, 249, 0.45);
  }
`;

// 实时预览框：appId 拿到后铺满 AppBuilder Content 区，跟随 build 进度切换页面
// 12px 圆角 + mingo 紫呼吸阴影是设计稿强调的展示外框风格；阴影直接作用在 iframe 上（外扩光环）
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
    background: var(--color-background-primary);
    display: block;
    animation: ${shadowBreath} 3s ease-in-out infinite;
  }
`;

// AI 实时预览场景下，工作表/视图是分两步建出来的：建表成功 ~ 建视图成功之间，工作表 views 为空，
// 默认会渲染「无视图」错误页。给 iframe 内所有页面统一打上 previewMode=ai 标记，
// 让工作表渲染层（src/pages/worksheet/common/Sheet/Sheet.jsx）识别后给出一个伪「全部」表格视图兜底。
function withPreviewMode(path) {
  if (!path) return path;
  if (/[?&]previewMode=ai(?:&|$)/.test(path)) return path;
  return `${path}${path.includes('?') ? '&' : '?'}previewMode=ai`;
}

// 主应用启动时会把 react-router 的 history 挂到 window.reactRouterHistory（见 src/router/App.jsx），
// navigateTo() 也是靠它做前端跳转。预览 iframe 与主站同源（sandbox 带 allow-same-origin），
// 因此父窗口可直接拿 iframe.contentWindow.reactRouterHistory.push(path) 做 SPA 内部跳转。
function navigateInFrame(win, path, refreshFirst = false) {
  try {
    if (!win || !win.reactRouterHistory) return false;

    const push = () => {
      const current = win.location.pathname + win.location.search;

      // 已在目标页就不重复 push，避免多余的路由 re-render
      if (current !== path) win.reactRouterHistory.push(path);
    };

    // 左侧应用结构（分组 / 工作表列表）首次加载后缓存在 redux，build 是边建边加实体，
    // 纯前端跳转不会刷新它。主应用把刷新函数挂在 window.updateAppGroups（见 PageHeader 的
    // AppDetail / LeftAppGroup），它按 appId 维度重拉 sections + sheetList（async，返回 promise）。
    const refresh = () => (typeof win.updateAppGroups === 'function' ? win.updateAppGroups() : null);

    if (refreshFirst) {
      // 自定义页面是 build 中后期才建出来的，iframe 内 sheetList 旧、没有这个新页面——直接 push 过去
      // WorkSheet 会因 findSheet 落空走 getPageInfo 兜底/被重定向，看着像没刷新。故先 await 刷新 sheetList，
      // 让新页面进入应用结构后再 push：WorkSheet 能识别该自定义页面并渲染，pageContent 按 pageId 变化重拉配置。
      const r = refresh();

      if (r && typeof r.then === 'function') r.then(push).catch(push);
      else push();
    } else {
      // 工作表等：先 push 再顺带刷新列表（工作表视图自身按 worksheetId 拉取，不依赖 sheetList 先到位）。
      push();
      refresh();
    }

    return true;
  } catch (e) {
    // iframe 跨域时访问 contentWindow 属性抛 SecurityError，静默处理让轮询超时兜底整页 reload
    return false;
  }
}

// 预览策略：iframe 只在首次冷启动一次整段 SPA；之后 src 变化全部走前端路由 history.push（软导航），
// 避免每次切页都整页 reload（慢 + 白屏闪烁）。SPA 尚未就绪时短暂轮询等待，超时兜底整页加载。
// refreshFirst：自定义页面这类「iframe 内 sheetList 还没有的新页面」，push 前先 await 刷新应用结构，
// 让 WorkSheet 能识别并渲染它（详见 navigateInFrame）——仍是软导航，不整页 reload。
export default function PreviewFrame({ src, refreshFirst = false }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const pendingRef = useRef(null);
  // 用 ref 读最新 refreshFirst，避免把它加进 effect 依赖导致 src 未变时多余触发；
  // 同步写放在 effect 中（react-hooks/refs 禁止渲染期写 ref），且必须声明在下方主 effect 之前，
  // 保证同一次提交内主 effect 读到的是最新值
  const refreshFirstRef = useRef(refreshFirst);

  useEffect(() => {
    refreshFirstRef.current = refreshFirst;
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !src) return undefined;

    // 子路径部署下，iframe.src 与 reactRouterHistory.push 消费的都是站内绝对路径，
    // 必须像 navigateTo 一样先补子路径前缀，否则冷启动 404、软导航后路由不匹配、
    // 「已在目标页」对比（含子路径的 location.pathname）也永远不成立
    const targetSrc = pathCompletion(withPreviewMode(src), { hasDomain: false });

    // 首次：创建 iframe，整段 SPA 冷启动一次
    if (!iframeRef.current) {
      const iframe = document.createElement('iframe');

      iframe.src = targetSrc;
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');
      container.appendChild(iframe);
      iframeRef.current = iframe;
      return undefined;
    }

    // 后续：尝试前端路由跳转（软导航）
    const iframe = iframeRef.current;

    pendingRef.current = targetSrc;

    const tryNavigate = () => {
      const path = pendingRef.current;

      if (!path) return true;
      if (navigateInFrame(iframe.contentWindow, path, refreshFirstRef.current)) {
        console.log('[preview-trace] 11.soft navigate', { path, refreshFirst: refreshFirstRef.current });
        pendingRef.current = null;
        return true;
      }

      return false;
    };

    if (tryNavigate()) return undefined;

    // SPA 还在冷启动（reactRouterHistory 未挂上）：轮询等待，~4s 超时兜底整页 reload
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (tryNavigate() || tries > 40) {
        clearInterval(timer);
        if (pendingRef.current) {
          iframe.src = pendingRef.current;
          pendingRef.current = null;
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [src]);

  return <Container ref={containerRef} />;
}
