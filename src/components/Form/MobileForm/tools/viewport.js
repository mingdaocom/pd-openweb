/** 获取可视视口尺寸和偏移，优先使用移动端更准确的 Visual Viewport API。 */
export function getViewportSize() {
  const viewport = window.visualViewport;

  return {
    width: Math.round((viewport && viewport.width) || window.innerWidth || document.documentElement.clientWidth),
    height: Math.round((viewport && viewport.height) || window.innerHeight || document.documentElement.clientHeight),
    offsetTop: Math.round((viewport && viewport.offsetTop) || 0),
    offsetLeft: Math.round((viewport && viewport.offsetLeft) || 0),
  };
}
